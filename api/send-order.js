'use strict';

/* ═══════════════════════════════════════════════════════
   Vercel Serverless Function — /api/send-order
   Принимает заявку от Mini App, отправляет в Telegram.
   Токен бота хранится только здесь — не в браузере.
   ═══════════════════════════════════════════════════════ */

const crypto = require('crypto');

const ALLOWED_BRANDS  = new Set(['Apple', 'Samsung', 'Xiaomi', 'Infinix', 'Honor', 'Другой']);
const ALLOWED_STORAGE = new Set([32, 64, 128, 256, 512, 1024, 2048]);
const MAX_PRICE       = 100_000;

/* ─── HTML-escaping для Telegram HTML parse_mode ─── */
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fmt(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

/* ─── Верификация Telegram initData (HMAC-SHA256) ─── */
function verifyInitData(initData, botToken) {
  try {
    if (!initData || !botToken) return false;
    const params  = new URLSearchParams(initData);
    const hash    = params.get('hash');
    if (!hash || hash.length !== 64) return false;
    params.delete('hash');
    const dataStr = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    const secretKey    = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataStr).digest('hex');
    /* timingSafeEqual против timing-атак */
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(hash,         'hex'),
    );
  } catch { return false; }
}

/* ─── Отправка в Telegram ─── */
async function tgSend(token, chatId, text) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    console.error(`tgSend → ${r.status}:`, body);
  }
}

/* ════════════════════════════════════════════════════
   HANDLER
   ════════════════════════════════════════════════════ */
module.exports = async function handler(req, res) {
  /* Только POST */
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const BOT_TOKEN  = process.env.BOT_TOKEN;
  const ADMIN_CHAT = process.env.ADMIN_CHAT_ID;
  if (!BOT_TOKEN || !ADMIN_CHAT) {
    console.error('Missing BOT_TOKEN or ADMIN_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const {
    brand, model, storage, condition, battery, repair, kit,
    estimatedPrice, name, phone, userId, userName, initData,
  } = req.body || {};

  /* ─── Валидация входных данных ─── */
  if (!ALLOWED_BRANDS.has(brand)) {
    return res.status(400).json({ error: 'invalid brand' });
  }
  if (typeof model !== 'string' || !model.trim() || model.length > 80) {
    return res.status(400).json({ error: 'invalid model' });
  }
  const storageNum = Number(storage);
  if (!ALLOWED_STORAGE.has(storageNum)) {
    return res.status(400).json({ error: 'invalid storage' });
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'invalid name' });
  }
  if (typeof phone !== 'string' || phone.replace(/\D/g, '').length < 9) {
    return res.status(400).json({ error: 'invalid phone' });
  }
  const price = Number(estimatedPrice);
  if (!Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
    return res.status(400).json({ error: 'invalid price' });
  }

  /* ─── Верификация Telegram (если открыто из бота) ─── */
  const isTgVerified = typeof initData === 'string' && initData.length > 0
    ? verifyInitData(initData, BOT_TOKEN)
    : false;

  /* userId доверяем только если initData прошла проверку */
  const safeUserId = isTgVerified && /^\d{5,15}$/.test(String(userId ?? ''))
    ? String(userId)
    : null;

  const sellId = `BUY-${Date.now().toString().slice(-8)}`;

  /* ─── Уведомление администратору ─── */
  const adminMsg = [
    `📲 <b>Новая заявка ${sellId}</b>`,
    !isTgVerified ? `⚠️ <i>Открыто вне Telegram</i>` : '',
    ``,
    `📱 <b>Устройство:</b> ${esc(brand)} ${esc(model)}`,
    `💾 <b>Память:</b> ${storageNum} ГБ`,
    condition ? `⭐ <b>Состояние:</b> ${esc(condition)}` : '',
    battery   ? `🔋 <b>Аккумулятор:</b> ${esc(battery)}` : '',
    repair    ? `🔧 <b>Ремонт:</b> ${esc(repair)}`        : '',
    kit       ? `📦 <b>Комплект:</b> ${esc(kit)}`         : '',
    `💵 <b>Оценка:</b> ${fmt(price)}`,
    ``,
    `👤 <b>Клиент:</b> ${esc(name)}`,
    `📞 <b>Телефон:</b> ${esc(phone)}`,
    safeUserId ? `💬 @${esc(String(userName || ''))} (ID: <code>${safeUserId}</code>)` : '',
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await tgSend(BOT_TOKEN, ADMIN_CHAT, adminMsg);

  /* ─── Подтверждение клиенту (только верифицированный Telegram-пользователь) ─── */
  if (safeUserId) {
    const clientMsg = [
      `✅ <b>Заявка принята!</b>`,
      ``,
      `📱 ${esc(brand)} ${esc(model)} (${storageNum} ГБ)`,
      battery ? `🔋 ${esc(battery)}` : '',
      repair  ? `🔧 ${esc(repair)}`  : '',
      kit     ? `📦 ${esc(kit)}`     : '',
      ``,
      `💵 Предварительная оценка: <b>${fmt(price)}</b>`,
      ``,
      `Наш специалист свяжется по номеру <b>${esc(phone)}</b>.`,
    ].filter(Boolean).join('\n');
    await tgSend(BOT_TOKEN, safeUserId, clientMsg);
  }

  console.log(`[BUY] ${sellId} brand=${brand} model=${model} userId=${safeUserId ?? 'web'} tgVerified=${isTgVerified}`);
  return res.status(200).json({ ok: true, sellId });
};
