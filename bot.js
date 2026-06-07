/* ═══════════════════════════════════════════════════════
   PhoneShop — Telegram Bot
   Запуск бота и отправка ссылки на Mini App
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
    `Добро пожаловать в <b>PhoneShop</b> — магазин лучших смартфонов.\n\n` +
    `📱 <b>Купи</b> новый телефон по лучшей цене\n` +
    `💸 <b>Продай</b> старый телефон — быстро и выгодно\n\n` +
    `Нажми кнопку ниже, чтобы открыть магазин 👇`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🛍️ Открыть магазин',
            web_app: { url: WEBAPP_URL },
          }
        ]]
      }
    }
  );
});

/* ─── /catalog ─── */
bot.onText(/\/catalog/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    '📦 Каталог смартфонов — открой Mini App:',
    {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[
          { text: '🛍️ Открыть PhoneShop', web_app: { url: WEBAPP_URL } }
        ]],
        resize_keyboard: true,
        one_time_keyboard: false,
      }
    }
  );
});

/* ─── /sell ─── */
bot.onText(/\/sell/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    '💸 Хочешь продать телефон? Открой магазин и перейди на вкладку <b>"Продать"</b>:',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '💸 Сдать телефон',
            web_app: { url: `${WEBAPP_URL}#sell` },
          }
        ]]
      }
    }
  );
});

/* ─── /help ─── */
bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `ℹ️ <b>Команды PhoneShop:</b>\n\n` +
    `/start — главное меню\n` +
    `/catalog — каталог телефонов\n` +
    `/sell — продать телефон\n` +
    `/help — справка\n\n` +
    `По всем вопросам: @manager`,
    { parse_mode: 'HTML' }
  );
});

/* ─── web_app_data — получение данных от Mini App ─── */
bot.on('message', async (msg) => {
  if (!msg.web_app_data) return;

  try {
    const data = JSON.parse(msg.web_app_data.data);
    console.log('[WebApp data]', data);

    await bot.sendMessage(msg.chat.id,
      `✅ Данные получены от Mini App!\nТип: ${data.type}`,
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
