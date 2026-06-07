/* ═══════════════════════════════════════════════════════
   PhoneShop TMA — Express Server
   ═══════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const crypto     = require('crypto');
const path       = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

/* ─── Telegram Bot ─── */
const BOT_TOKEN    = process.env.BOT_TOKEN;
const ADMIN_CHAT   = process.env.ADMIN_CHAT_ID;

let bot = null;
if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
  console.log('✅ Telegram Bot инициализирован');
} else {
  console.warn('⚠️  BOT_TOKEN не задан — уведомления в Telegram отключены');
}

/* ─── Middleware ─── */
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Helpers ─── */
function fmt(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

function validateTelegramData(initData) {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return true;
  try {
    const params = new URLSearchParams(initData);
    const hash   = params.get('hash');
    params.delete('hash');
    const dataStr = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const check  = crypto.createHmac('sha256', secret).update(dataStr).digest('hex');
    return check === hash;
  } catch { return false; }
}

async function sendTelegramMessage(chatId, text, opts = {}) {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
  } catch (err) {
    console.error('Telegram send error:', err.message);
  }
}

/* ════════════════════════════════════════════════════
   API ROUTES
   ════════════════════════════════════════════════════ */

/* ── POST /api/order — Buy order ── */
app.post('/api/order', async (req, res) => {
  const { items, total, userId, userName } = req.body;

  if (!items?.length) return res.status(400).json({ error: 'empty cart' });

  const orderId = `ORD-${Date.now().toString().slice(-8)}`;
  const itemsText = items.map(i => `• ${i.name} ×${i.qty} — ${fmt(i.price * i.qty)}`).join('\n');

  /* Notify admin */
  const adminMsg = [
    `🛒 <b>Новый заказ ${orderId}</b>`,
    ``,
    `👤 <b>Покупатель:</b> ${userName || 'Гость'}`,
    userId !== 'unknown' ? `📱 Telegram ID: <code>${userId}</code>` : '',
    ``,
    `<b>Товары:</b>`,
    itemsText,
    ``,
    `💰 <b>Итого: ${fmt(total)}</b>`,
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(ADMIN_CHAT, adminMsg);

  /* Notify buyer */
  if (userId && userId !== 'unknown') {
    const buyerMsg = [
      `✅ <b>Заказ ${orderId} оформлен!</b>`,
      ``,
      itemsText,
      ``,
      `💰 <b>Итого: ${fmt(total)}</b>`,
      ``,
      `Наш менеджер свяжется с вами для подтверждения и оплаты.`,
    ].join('\n');
    await sendTelegramMessage(userId, buyerMsg);
  }

  console.log(`[ORDER] ${orderId} user=${userId} total=${total}`);
  res.json({ ok: true, orderId });
});

/* ── POST /api/sell — Sell / trade-in ── */
app.post('/api/sell', async (req, res) => {
  const { brand, model, storage, condition, estimatedPrice, name, phone, userId, userName } = req.body;

  if (!brand || !model) return res.status(400).json({ error: 'missing fields' });

  const sellId = `SLL-${Date.now().toString().slice(-8)}`;

  /* Notify admin */
  const adminMsg = [
    `📲 <b>Заявка на скупку ${sellId}</b>`,
    ``,
    `📱 <b>Устройство:</b> ${brand} ${model}`,
    `💾 <b>Память:</b> ${storage}`,
    `⭐ <b>Состояние:</b> ${condition}`,
    `💵 <b>Оценка:</b> ${fmt(estimatedPrice)}`,
    ``,
    `👤 <b>Клиент:</b> ${name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    userId !== 'unknown' ? `💬 Telegram: @${userName} (ID: <code>${userId}</code>)` : '',
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await sendTelegramMessage(ADMIN_CHAT, adminMsg);

  /* Notify buyer */
  if (userId && userId !== 'unknown') {
    const buyerMsg = [
      `✅ <b>Заявка на скупку принята!</b>`,
      ``,
      `📱 ${brand} ${model} (${storage})`,
      `⭐ Состояние: ${condition.split('—')[0].trim()}`,
      `💵 Предварительная оценка: <b>${fmt(estimatedPrice)}</b>`,
      ``,
      `Наш специалист свяжется с вами по номеру <b>${phone}</b>.`,
      `Точная цена — после проверки устройства.`,
    ].join('\n');
    await sendTelegramMessage(userId, buyerMsg);
  }

  console.log(`[SELL] ${sellId} device=${brand} ${model} user=${userId}`);
  res.json({ ok: true, sellId });
});

/* ── GET /api/products — Catalog (optional, for future use) ── */
app.get('/api/products', (req, res) => {
  const { brand, sort, search } = req.query;
  res.json({ ok: true, message: 'Products served from frontend JS for now.' });
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
  console.log(`\n🚀 PhoneShop TMA сервер запущен`);
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
