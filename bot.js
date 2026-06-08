/* ═══════════════════════════════════════════════════════
   Malika_A22 — Telegram Bot (Закупка телефонов)
   ═══════════════════════════════════════════════════════ */

'use strict';

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN  = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.com';

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('❌ Задайте BOT_TOKEN в файле .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log('🤖 Бот запущен и слушает сообщения...');

/* ─── /start ─── */
bot.onText(/\/start/, async (msg) => {
  const chatId    = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';

  await bot.sendMessage(chatId,
    `👋 Привет, ${firstName}!\n\n` +
    `Добро пожаловать в <b>Malika_A22</b> — сервис закупки б/у телефонов.\n\n` +
    `📱 <b>Сдайте</b> свой телефон и получите деньги сразу\n` +
    `💰 <b>Честная оценка</b> — Apple, Samsung, Xiaomi и другие\n` +
    `⚡ <b>Быстро и выгодно</b> — оплата в день обращения\n\n` +
    `Нажми кнопку ниже, чтобы оформить заявку 👇`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📲 Сдать телефон',
            web_app: { url: WEBAPP_URL },
          }
        ]]
      }
    }
  );
});

/* ─── /sell — оформить заявку ─── */
bot.onText(/\/sell/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    '📲 Хотите сдать телефон? Откройте форму заявки:',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📲 Оформить заявку',
            web_app: { url: WEBAPP_URL },
          }
        ]]
      }
    }
  );
});

/* ─── /brands — какие бренды принимаем ─── */
bot.onText(/\/brands/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `📦 <b>Принимаем следующие бренды:</b>\n\n` +
    `🍎 <b>Apple</b> — iPhone 11, 12, 13, 14, 15, 16 (все серии)\n` +
    `📱 <b>Samsung</b> — Galaxy S, A, Z Fold/Flip\n` +
    `🔶 <b>Xiaomi / Redmi / POCO</b> — актуальные модели\n` +
    `📲 <b>Tecno / Infinix / Realme</b> — популярные модели\n\n` +
    `Также рассматриваем другие бренды — уточняйте у менеджера.`,
    { parse_mode: 'HTML' }
  );
});

/* ─── /help ─── */
bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `ℹ️ <b>Команды Malika_A22:</b>\n\n` +
    `/start — главное меню\n` +
    `/sell — оформить заявку на закупку\n` +
    `/brands — какие телефоны принимаем\n` +
    `/help — справка\n\n` +
    `По всем вопросам: @manager`,
    { parse_mode: 'HTML' }
  );
});

/* ─── web_app_data — данные от Mini App ─── */
bot.on('message', async (msg) => {
  if (!msg.web_app_data) return;

  try {
    const data = JSON.parse(msg.web_app_data.data);
    console.log('[WebApp data]', data);

    await bot.sendMessage(msg.chat.id,
      `✅ Данные заявки получены!\nТип: ${data.type}`,
      { parse_mode: 'HTML' }
    );
  } catch (err) {
    console.error('WebApp data parse error:', err.message);
  }
});

/* ─── Polling errors ─── */
bot.on('polling_error', err => console.error('[polling]', err.message));

process.on('SIGINT',  () => { bot.stopPolling(); process.exit(0); });
process.on('SIGTERM', () => { bot.stopPolling(); process.exit(0); });
