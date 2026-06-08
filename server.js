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

/* ─── Bot init ─── */
let bot = null;
if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log('✅ Telegram Bot запущен (polling)');
  registerBotCommands(bot);
} else {
  console.warn('⚠️  BOT_TOKEN не задан — бот и уведомления отключены');
}

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
function registerBotCommands(b) {
  /* /start */
  b.onText(/\/start/, async msg => {
    const name = msg.from?.first_name || 'друг';
    await send(msg.chat.id,
      `👋 Привет, ${name}!\n\n` +
      `Добро пожаловать в <b>Malika_A22</b> — сервис закупки б/у телефонов.\n\n` +
      `📱 <b>Сдайте</b> свой телефон и получите деньги сразу\n` +
      `💰 <b>Честная оценка</b> — Apple, Samsung, Xiaomi и другие\n` +
      `⚡ <b>Быстро и выгодно</b> — оплата в день обращения\n\n` +
      `Нажми кнопку ниже, чтобы оформить заявку 👇`,
      webAppBtn('📲 Сдать телефон')
    );
  });

  /* /sell */
  b.onText(/\/sell/, async msg => {
    await send(msg.chat.id,
      '📲 Хотите сдать телефон? Откройте форму заявки:',
      webAppBtn('📲 Оформить заявку')
    );
  });

  /* /brands */
  b.onText(/\/brands/, async msg => {
    await send(msg.chat.id,
      `📦 <b>Принимаем следующие бренды:</b>\n\n` +
      `🍎 <b>Apple</b> — iPhone 11, 12, 13, 14, 15, 16 (все серии)\n` +
      `📱 <b>Samsung</b> — Galaxy S, A, M, Note, Z Fold/Flip\n` +
      `🔶 <b>Xiaomi / Redmi / POCO</b> — актуальные модели\n` +
      `📲 <b>Tecno / Infinix / Realme</b> — популярные модели\n\n` +
      `Также рассматриваем другие бренды — уточняйте у менеджера.`
    );
  });

  /* /help */
  b.onText(/\/help/, async msg => {
    await send(msg.chat.id,
      `ℹ️ <b>Команды Malika_A22:</b>\n\n` +
      `/start — главное меню\n` +
      `/sell — оформить заявку на закупку\n` +
      `/brands — какие телефоны принимаем\n` +
      `/help — справка\n\n` +
      `По всем вопросам: @manager`
    );
  });

  /* web_app_data */
  b.on('message', async msg => {
    if (!msg.web_app_data) return;
    try {
      const data = JSON.parse(msg.web_app_data.data);
      await send(msg.chat.id, `✅ Заявка получена! Тип: ${data.type}`);
    } catch {}
  });

  b.on('polling_error', err => console.error('[polling]', err.message));
}

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
