'use strict';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BOT_TOKEN  = process.env.BOT_TOKEN;
  const ADMIN_CHAT = process.env.ADMIN_CHAT_ID;

  if (!BOT_TOKEN || !ADMIN_CHAT) {
    return res.status(500).json({ error: 'Bot not configured' });
  }

  const {
    brand, model, storage, condition, battery, repair, kit,
    estimatedPrice, name, phone, userId, userName,
  } = req.body || {};

  if (!brand || !model || !name || !phone) {
    return res.status(400).json({ error: 'missing fields' });
  }

  const sellId = `BUY-${Date.now().toString().slice(-8)}`;

  function fmt(n) {
    return '$' + Math.round(Number(n)).toLocaleString('en-US');
  }

  async function sendTg(chatId, text) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    } catch (e) {
      console.error('Telegram error:', e.message);
    }
  }

  /* ── Уведомление администратору ── */
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
    userId && userId !== 'unknown'
      ? `💬 Telegram: @${userName || '—'} (ID: <code>${userId}</code>)` : '',
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await sendTg(ADMIN_CHAT, adminMsg);

  /* ── Подтверждение клиенту ── */
  if (userId && userId !== 'unknown') {
    const clientMsg = [
      `✅ <b>Заявка принята!</b>`,
      ``,
      `📱 ${brand} ${model} (${storage})`,
      battery ? `🔋 ${battery}` : '',
      repair  ? `🔧 ${repair}`  : '',
      kit     ? `📦 ${kit}`     : '',
      ``,
      `💵 Предварительная оценка: <b>${fmt(estimatedPrice)}</b>`,
      ``,
      `Наш специалист свяжется по номеру <b>${phone}</b>.\nИтоговая цена — после осмотра.`,
    ].filter(Boolean).join('\n');
    await sendTg(userId, clientMsg);
  }

  console.log(`[SELL] ${sellId} ${brand} ${model} user=${userId}`);
  res.json({ ok: true, sellId });
};
