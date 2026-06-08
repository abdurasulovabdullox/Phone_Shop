/* ═══════════════════════════════════════════════════════
   Malika_A22 — Telegram Bot (24/7, без веб-сервера)
   ═══════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN  = process.env.BOT_TOKEN;
const ADMIN_CHAT = process.env.ADMIN_CHAT_ID;
const WEBAPP_URL = process.env.WEBAPP_URL || '';

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('❌ Задайте BOT_TOKEN в файле .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log('🤖 Malika_A22 бот запущен...');

/* ─── Helpers ─── */
function fmt(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

async function send(chatId, text, opts = {}) {
  if (!chatId) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...opts });
  } catch (err) {
    console.error('Send error:', err.message);
  }
}

/* Постоянная кнопка открытия Mini App (reply keyboard) */
function mainKeyboard() {
  return {
    reply_markup: {
      keyboard: [[{ text: '📲 Сдать телефон', web_app: { url: WEBAPP_URL } }]],
      resize_keyboard: true,
      persistent: true,
    }
  };
}

/* ─── /start ─── */
bot.onText(/\/start/, async msg => {
  await send(msg.chat.id,
    `🌐 Выберите язык / Tilni tanlang`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🇷🇺 Русский', web_app: { url: `${WEBAPP_URL}?lang=ru` } },
          { text: '🇺🇿 O\'zbek',  web_app: { url: `${WEBAPP_URL}?lang=uz` } },
        ]]
      }
    }
  );
});

/* ─── /sell ─── */
bot.onText(/\/sell/, async msg => {
  await send(msg.chat.id, '📲 Оформите заявку на закупку:', mainKeyboard());
});

/* ─── /brands ─── */
bot.onText(/\/brands/, async msg => {
  await send(msg.chat.id,
    `📦 <b>Принимаем:</b>\n\n` +
    `🍎 <b>Apple</b> — iPhone 11–16 (все серии)\n` +
    `📱 <b>Samsung</b> — Galaxy S, A, M, Note, Z Fold/Flip\n` +
    `🔶 <b>Xiaomi / Redmi / POCO</b> — актуальные модели\n` +
    `📲 <b>Tecno / Infinix / Realme</b> — популярные модели\n\n` +
    `Другие бренды — уточняйте у менеджера.`
  );
});

/* ─── /help ─── */
bot.onText(/\/help/, async msg => {
  await send(msg.chat.id,
    `ℹ️ <b>Команды:</b>\n\n` +
    `/start — главное меню\n` +
    `/sell — оформить заявку\n` +
    `/brands — какие телефоны принимаем\n` +
    `/help — справка\n\n` +
    `По вопросам: @manager`
  );
});

/* ─── Заявка из Mini App (web_app_data) ─── */
bot.on('message', async msg => {
  if (!msg.web_app_data) return;

  const userId = msg.from?.id;
  const userName = msg.from?.username || msg.from?.first_name || 'unknown';

  let data;
  try {
    data = JSON.parse(msg.web_app_data.data);
  } catch {
    return;
  }

  const { brand, model, storage, condition, battery, repair, kit, estimatedPrice, name, phone } = data;
  const sellId = `BUY-${Date.now().toString().slice(-8)}`;

  /* Уведомление администратору */
  const adminMsg = [
    `📲 <b>Новая заявка ${sellId}</b>`,
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
    `💬 Telegram: @${userName} )`,
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await send(ADMIN_CHAT, adminMsg);

  /* Подтверждение клиенту */
  await send(userId,
    `✅ <b>Заявка принята!</b>\n\n` +
    `📱 ${brand} ${model} (${storage})\n` +
    `💵 Предварительная оценка: <b>${fmt(estimatedPrice)}</b>\n\n` +
    `Наш специалист свяжется по номеру <b>${phone}</b>.\n` +
    `Итоговая цена — после осмотра.`
  );

  console.log(`[BUY] ${sellId} device=${brand} ${model} user=${userId}`);
});

/* ─── Errors ─── */
bot.on('polling_error', err => console.error('[polling]', err.message));

process.on('SIGINT',  () => { bot.stopPolling(); process.exit(0); });
process.on('SIGTERM', () => { bot.stopPolling(); process.exit(0); });
