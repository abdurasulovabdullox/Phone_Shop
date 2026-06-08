/* ═══════════════════════════════════════════════════════
   Malika_A22 TMA — Server + Bot (единый процесс)
   ═══════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const bodyParser  = require('body-parser');
const crypto      = require('crypto');
const path        = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app        = express();
const PORT       = process.env.PORT || 3000;
const BOT_TOKEN  = process.env.BOT_TOKEN;
const ADMIN_CHAT = process.env.ADMIN_CHAT_ID;
const WEBAPP_URL = process.env.WEBAPP_URL || '';

/* ─── Bot init (отключён — бот запускается отдельно через bot.js) ─── */
let bot = null;

/* ─── Middleware ─── */
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Helpers ─── */
function fmt(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

async function send(chatId, text, opts = {}) {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
}

function webAppBtn(label) {
  return { reply_markup: { inline_keyboard: [[{ text: label, web_app: { url: WEBAPP_URL } }]] } };
}

/* ════════════════════════════════════════════════════
   BOT COMMANDS
   ════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   API ROUTES
   ════════════════════════════════════════════════════ */

/* ── POST /api/sell ── */
app.post('/api/sell', async (req, res) => {
  const { brand, model, storage, condition, battery, repair, kit,
          estimatedPrice, name, phone, userId, userName } = req.body;

  if (!brand || !model) return res.status(400).json({ error: 'missing fields' });

  const sellId = `BUY-${Date.now().toString().slice(-8)}`;

  const adminMsg = [
    `📲 <b>Новая заявка на закупку ${sellId}</b>`,
    ``,
    `📱 <b>Устройство:</b> ${brand} ${model}`,
    `💾 <b>Память:</b> ${storage}`,
    `⭐ <b>Состояние:</b> ${condition}`,
    battery ? `🔋 <b>Аккумулятор:</b> ${battery}` : '',
    repair  ? `🔧 <b>Ремонт:</b> ${repair}`        : '',
    kit     ? `📦 <b>Комплект:</b> ${kit}`          : '',
    `💵 <b>Оценка:</b> ${fmt(estimatedPrice)}`,
    ``,
    `👤 <b>Клиент:</b> ${name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    userId !== 'unknown' ? `💬 Telegram: @${userName} (ID: <code>${userId}</code>)` : '',
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await send(ADMIN_CHAT, adminMsg);

  if (userId && userId !== 'unknown') {
    const clientMsg = [
      `✅ <b>Заявка принята!</b>`,
      ``,
      `📱 ${brand} ${model} (${storage})`,
      `⭐ Состояние: ${condition.split('—')[0].trim()}`,
      battery ? `🔋 Аккумулятор: ${battery}` : '',
      repair  ? `🔧 Ремонт: ${repair}`        : '',
      kit     ? `📦 Комплект: ${kit}`          : '',
      ``,
      `💵 Предварительная оценка: <b>${fmt(estimatedPrice)}</b>`,
      ``,
      `Наш специалист свяжется с вами по номеру <b>${phone}</b>.`,
      `Итоговая цена — после осмотра устройства.`,
    ].filter(Boolean).join('\n');
    await send(userId, clientMsg);
  }

  console.log(`[BUY] ${sellId} device=${brand} ${model} user=${userId}`);
  res.json({ ok: true, sellId });
});

/* ── Health check ── */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), bot: !!bot });
});

/* ── SPA fallback ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─── Start ─── */
app.listen(PORT, () => {
  console.log(`\n🚀 Malika_A22 сервер запущен на порту ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

process.on('SIGINT',  () => { bot?.stopPolling(); process.exit(0); });
process.on('SIGTERM', () => { bot?.stopPolling(); process.exit(0); });
