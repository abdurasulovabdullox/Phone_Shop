/* ═══════════════════════════════════════════════════════
   Malika_A22 TMA — Закупка телефонов (Trade-in)
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Telegram WebApp init ─── */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.disableClosingConfirmation();
  applyTelegramTheme();
}

function applyTelegramTheme() {
  if (!tg?.colorScheme) return;
  document.documentElement.setAttribute('data-theme', tg.colorScheme);
  if (tg.colorScheme === 'dark') document.documentElement.classList.add('dark');
}

/* ─── State ─── */
const state = {
  orders: JSON.parse(localStorage.getItem('orders') || '[]'),
  sell: {
    brand:   null,
    model:   null,
    storage: null,
    cond:    3,
    batt:    null,
    repair:  null,
    kit:     null,
    name:    '',
    phone:   '',
  },
};

/* ════════════════════════════════════════════════════
   МОДЕЛИ ПО БРЕНДАМ
   ════════════════════════════════════════════════════ */
const SELL_MODELS = {
  Apple: [
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
    'iPhone SE (2022)', 'iPhone SE (2020)',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'Старше iPhone 11',
  ],
  Samsung: [
    'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
    'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20',
    'Galaxy Note 20 Ultra', 'Galaxy Note 20',
    'Galaxy Note 10+', 'Galaxy Note 10',
    'Galaxy A73', 'Galaxy A72', 'Galaxy A55', 'Galaxy A54', 'Galaxy A53', 'Galaxy A52',
    'Galaxy A35', 'Galaxy A34', 'Galaxy A33', 'Galaxy A32',
    'Galaxy A25', 'Galaxy A24', 'Galaxy A23', 'Galaxy A22',
    'Galaxy A15', 'Galaxy A15 5G', 'Galaxy A14', 'Galaxy A14 5G', 'Galaxy A13',
    'Galaxy A05s', 'Galaxy A05', 'Galaxy A04s', 'Galaxy A04',
    'Galaxy M34 5G', 'Galaxy M33 5G', 'Galaxy M23', 'Galaxy M22', 'Galaxy M13', 'Galaxy M12',
    'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3',
    'Galaxy Z Flip 6', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
    'Другая модель',
  ],
  Xiaomi: [
    'Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15',
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
    'Xiaomi 12 Pro', 'Xiaomi 12',
    'Xiaomi Mi 11 Ultra', 'Xiaomi Mi 11 Pro', 'Xiaomi Mi 11',
    'Xiaomi Mi 10 Pro', 'Xiaomi Mi 10',
    'Redmi Note 14 Pro+', 'Redmi Note 14 Pro', 'Redmi Note 14',
    'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
    'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12', 'Redmi Note 12S',
    'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11S', 'Redmi Note 11',
    'Redmi Note 10 Pro', 'Redmi Note 10S', 'Redmi Note 10',
    'Redmi Note 9 Pro', 'Redmi Note 9S', 'Redmi Note 9',
    'Redmi 13C', 'Redmi 12C', 'Redmi 12', 'Redmi 10C', 'Redmi 10', 'Redmi 9T', 'Redmi 9',
    'Redmi A3', 'Redmi A2', 'Redmi A1',
    'POCO X6 Pro', 'POCO X6', 'POCO X5 Pro', 'POCO X5',
    'POCO X4 Pro 5G', 'POCO X4 GT', 'POCO X3 Pro', 'POCO X3 NFC',
    'POCO M6 Pro', 'POCO M5s', 'POCO M5', 'POCO M4 Pro', 'POCO M4', 'POCO M3 Pro', 'POCO M3',
    'POCO F5 Pro', 'POCO F5', 'POCO F4 GT', 'POCO F4', 'POCO F3',
    'POCO C65', 'POCO C55', 'POCO C40',
    'Другая модель',
  ],
  Tecno: [
    'Tecno Camon 30 Pro+', 'Tecno Camon 30 Pro', 'Tecno Camon 30',
    'Tecno Camon 20 Premier', 'Tecno Camon 20 Pro', 'Tecno Camon 20',
    'Tecno Camon 19 Pro', 'Tecno Camon 19',
    'Tecno Camon 18 Premier', 'Tecno Camon 18 Pro', 'Tecno Camon 18',
    'Tecno Spark 20 Pro+', 'Tecno Spark 20 Pro', 'Tecno Spark 20',
    'Tecno Spark 10 Pro', 'Tecno Spark 10',
    'Tecno Spark 9 Pro', 'Tecno Spark 9',
    'Tecno Spark 8 Pro', 'Tecno Spark 8',
    'Tecno Pova 6 Pro', 'Tecno Pova 6', 'Tecno Pova 5 Pro', 'Tecno Pova 5',
    'Tecno Pova 4 Pro', 'Tecno Pova 4', 'Tecno Pova 3',
    'Tecno Phantom V Fold2', 'Tecno Phantom V Fold', 'Tecno Phantom V Flip2', 'Tecno Phantom V Flip',
    'Tecno Pop 8', 'Tecno Pop 7', 'Tecno Pop 6',
    'Infinix Zero 40 5G', 'Infinix Zero 30 5G', 'Infinix Zero 30', 'Infinix Zero 20',
    'Infinix Note 40 Pro+ 5G', 'Infinix Note 40 Pro', 'Infinix Note 40',
    'Infinix Note 30 Pro', 'Infinix Note 30 VIP', 'Infinix Note 30',
    'Infinix Note 12 Pro', 'Infinix Note 12 VIP', 'Infinix Note 12',
    'Infinix Note 11 Pro', 'Infinix Note 11',
    'Infinix Hot 40 Pro', 'Infinix Hot 40', 'Infinix Hot 30i', 'Infinix Hot 30',
    'Infinix Hot 20 Pro', 'Infinix Hot 20', 'Infinix Hot 20i',
    'Infinix Hot 12 Pro', 'Infinix Hot 12',
    'Infinix Smart 8 Pro', 'Infinix Smart 8', 'Infinix Smart 7',
    'Realme GT 6', 'Realme GT 5 Pro', 'Realme GT 5',
    'Realme GT Neo 6', 'Realme GT Neo 5', 'Realme GT Neo 3T', 'Realme GT Neo 3',
    'Realme GT 2 Pro', 'Realme GT 2', 'Realme GT Master',
    'Realme 12 Pro+', 'Realme 12 Pro', 'Realme 12',
    'Realme 11 Pro+', 'Realme 11 Pro', 'Realme 11',
    'Realme 10 Pro+', 'Realme 10 Pro', 'Realme 10',
    'Realme 9 Pro+', 'Realme 9 Pro', 'Realme 9i', 'Realme 9',
    'Realme 8 Pro', 'Realme 8',
    'Realme Narzo 70 Pro', 'Realme Narzo 60 Pro', 'Realme Narzo 50 Pro', 'Realme Narzo 50',
    'Realme C67', 'Realme C65', 'Realme C63', 'Realme C61',
    'Realme C55', 'Realme C53', 'Realme C51',
    'Realme C35', 'Realme C33', 'Realme C31',
    'Другая модель',
  ],
  Другой: ['Указать в комментарии'],
};

/* ════════════════════════════════════════════════════
   РЫНОЧНЫЕ ЦЕНЫ В USD (вторичный рынок, хорошее состояние)
   Наше предложение = цена × 0.83 × множители
   ════════════════════════════════════════════════════ */
const MODEL_PRICES = {
  /* ─── Apple ─── */
  'iPhone 16 Pro Max':  { 256: 990,  512: 1090, 1024: 1190 },
  'iPhone 16 Pro':      { 128: 890,  256: 990,  512:  1090 },
  'iPhone 16 Plus':     { 128: 740,  256:  820              },
  'iPhone 16':          { 128: 670,  256:  740              },
  'iPhone 15 Pro Max':  { 256: 790,  512:  880, 1024:  980  },
  'iPhone 15 Pro':      { 128: 680,  256:  760, 512:   860  },
  'iPhone 15 Plus':     { 128: 590,  256:  660              },
  'iPhone 15':          { 128: 520,  256:  580              },
  'iPhone 14 Pro Max':  { 128: 620,  256:  690, 512:   790, 1024: 890 },
  'iPhone 14 Pro':      { 128: 550,  256:  610, 512:   710  },
  'iPhone 14 Plus':     { 128: 430,  256:  490              },
  'iPhone 14':          { 128: 380,  256:  430              },
  'iPhone 13 Pro Max':  { 128: 480,  256:  530, 512:   610, 1024: 710 },
  'iPhone 13 Pro':      { 128: 420,  256:  470, 512:   550  },
  'iPhone 13 mini':     { 128: 290,  256:  340              },
  'iPhone 13':          { 128: 340,  256:  380, 512:   450  },
  'iPhone SE (2022)':   { 64:  200,  128:  230, 256:   280  },
  'iPhone SE (2020)':   { 64:  150,  128:  175, 256:   210  },
  'iPhone 12 Pro Max':  { 128: 350,  256:  390, 512:   450  },
  'iPhone 12 Pro':      { 128: 290,  256:  330, 512:   390  },
  'iPhone 12 mini':     { 64:  200,  128:  240, 256:   290  },
  'iPhone 12':          { 64:  230,  128:  270, 256:   320  },
  'iPhone 11 Pro Max':  { 64:  200,  256:  240, 512:   290  },
  'iPhone 11 Pro':      { 64:  170,  256:  210, 512:   260  },
  'iPhone 11':          { 64:  150,  128:  175, 256:   210  },

  /* ─── Samsung ─── */
  'Galaxy S25 Ultra':   { 256: 840,  512:  940, 1024: 1040  },
  'Galaxy S25+':        { 256: 670,  512:  760              },
  'Galaxy S25':         { 128: 570,  256:  630              },
  'Galaxy S24 Ultra':   { 256: 740,  512:  830, 1024:  930  },
  'Galaxy S24+':        { 256: 580,  512:  670              },
  'Galaxy S24':         { 128: 430,  256:  480              },
  'Galaxy S23 Ultra':   { 256: 590,  512:  670              },
  'Galaxy S23+':        { 256: 430,  512:  490              },
  'Galaxy S23':         { 128: 320,  256:  370              },
  'Galaxy S22 Ultra':   { 128: 440,  256:  490, 512:   550  },
  'Galaxy S22+':        { 128: 280,  256:  330              },
  'Galaxy S22':         { 128: 220,  256:  260              },
  'Galaxy S21 Ultra':   { 128: 340,  256:  390, 512:   450  },
  'Galaxy S21+':        { 128: 240,  256:  280              },
  'Galaxy S21':         { 128: 190,  256:  230              },
  'Galaxy S20 Ultra':   { 128: 245,  256:  285              },
  'Galaxy S20+':        { 128: 185,  256:  220              },
  'Galaxy S20':         { 128: 145,  256:  175              },
  'Galaxy Note 20 Ultra': { 256: 310, 512:  370             },
  'Galaxy Note 20':     { 256: 240                          },
  'Galaxy Note 10+':    { 256: 195,  512:  235              },
  'Galaxy Note 10':     { 256: 155                          },
  'Galaxy A73':         { 256: 200                          },
  'Galaxy A72':         { 128: 170,  256:  195              },
  'Galaxy A55':         { 128: 235,  256:  265              },
  'Galaxy A54':         { 128: 195,  256:  230              },
  'Galaxy A53':         { 128: 160,  256:  190              },
  'Galaxy A52':         { 128: 140,  256:  170              },
  'Galaxy A35':         { 128: 165,  256:  195              },
  'Galaxy A34':         { 128: 145,  256:  175              },
  'Galaxy A33':         { 128: 130,  256:  160              },
  'Galaxy A32':         { 128: 115,  256:  140              },
  'Galaxy A25':         { 128: 125,  256:  150              },
  'Galaxy A24':         { 128: 110,  256:  135              },
  'Galaxy A23':         { 128:  95,  256:  120              },
  'Galaxy A22':         { 128:  85,  256:  105              },
  'Galaxy A15':         { 128:  95,  256:  120              },
  'Galaxy A15 5G':      { 128: 100,  256:  125              },
  'Galaxy A14':         { 64:   70,  128:   95              },
  'Galaxy A14 5G':      { 64:   75,  128:  100              },
  'Galaxy A13':         { 64:   60,  128:   80              },
  'Galaxy A05s':        { 64:   65,  128:   80              },
  'Galaxy A05':         { 64:   55,  128:   70              },
  'Galaxy A04s':        { 64:   50,  128:   65              },
  'Galaxy A04':         { 64:   45,  128:   60              },
  'Galaxy M34 5G':      { 128: 110,  256:  135              },
  'Galaxy M33 5G':      { 128:  95,  256:  115              },
  'Galaxy M23':         { 128:  80,  256:  100              },
  'Galaxy M22':         { 128:  75,  256:   95              },
  'Galaxy M13':         { 64:   60,  128:   75              },
  'Galaxy M12':         { 64:   50,  128:   65              },
  'Galaxy Z Fold 6':    { 256: 980,  512: 1080              },
  'Galaxy Z Fold 5':    { 256: 740,  512:  840              },
  'Galaxy Z Fold 4':    { 256: 580,  512:  670              },
  'Galaxy Z Fold 3':    { 256: 420,  512:  480              },
  'Galaxy Z Flip 6':    { 256: 590                          },
  'Galaxy Z Flip 5':    { 256: 420,  512:  480              },
  'Galaxy Z Flip 4':    { 128: 290,  256:  340              },
  'Galaxy Z Flip 3':    { 128: 220,  256:  260              },

  /* ─── Xiaomi / Redmi / POCO ─── */
  'Xiaomi 15 Ultra':    { 256: 820,  512:  900              },
  'Xiaomi 15 Pro':      { 256: 620,  512:  700              },
  'Xiaomi 15':          { 256: 470,  512:  540              },
  'Xiaomi 14 Ultra':    { 512: 650                          },
  'Xiaomi 14 Pro':      { 256: 480,  512:  550              },
  'Xiaomi 14':          { 256: 380,  512:  450              },
  'Xiaomi 13 Ultra':    { 512: 490                          },
  'Xiaomi 13 Pro':      { 256: 370                          },
  'Xiaomi 13':          { 256: 290,  512:  350              },
  'Xiaomi 12 Pro':      { 256: 250                          },
  'Xiaomi 12':          { 128: 190,  256:  230              },
  'Xiaomi Mi 11 Ultra': { 256: 300                          },
  'Xiaomi Mi 11 Pro':   { 256: 260                          },
  'Xiaomi Mi 11':       { 128: 190,  256:  220              },
  'Xiaomi Mi 10 Pro':   { 256: 240                          },
  'Xiaomi Mi 10':       { 128: 175,  256:  205              },
  'Redmi Note 14 Pro+': { 256: 270,  512:  310              },
  'Redmi Note 14 Pro':  { 256: 215,  512:  250              },
  'Redmi Note 14':      { 128: 155,  256:  185              },
  'Redmi Note 13 Pro+': { 256: 240,  512:  280              },
  'Redmi Note 13 Pro':  { 256: 190,  512:  230              },
  'Redmi Note 13':      { 128: 130,  256:  160              },
  'Redmi Note 12 Pro+': { 256: 175                          },
  'Redmi Note 12 Pro':  { 256: 160                          },
  'Redmi Note 12':      { 128: 115,  256:  140              },
  'Redmi Note 12S':     { 128: 120,  256:  145              },
  'Redmi Note 11 Pro+': { 128: 115,  256:  140              },
  'Redmi Note 11 Pro':  { 128: 110,  256:  135              },
  'Redmi Note 11S':     { 128: 100,  256:  120              },
  'Redmi Note 11':      { 128:  95,  256:  115              },
  'Redmi Note 10 Pro':  { 64:  115,  128:  135              },
  'Redmi Note 10S':     { 64:   90,  128:  110              },
  'Redmi Note 10':      { 64:   85,  128:  100              },
  'Redmi Note 9 Pro':   { 64:   80,  128:   95              },
  'Redmi Note 9S':      { 64:   75,  128:   90              },
  'Redmi Note 9':       { 64:   65,  128:   80              },
  'Redmi 13C':          { 128:  90                          },
  'Redmi 12C':          { 64:   65,  128:   80              },
  'Redmi 12':           { 128: 110,  256:  130              },
  'Redmi 10C':          { 64:   60,  128:   75              },
  'Redmi 10':           { 64:   60,  128:   75              },
  'Redmi 9T':           { 64:   55,  128:   70              },
  'Redmi 9':            { 64:   50,  128:   65              },
  'Redmi A3':           { 64:   50,  128:   65              },
  'Redmi A2':           { 32:   40,  64:    55              },
  'Redmi A1':           { 32:   35,  64:    50              },
  'POCO X6 Pro':        { 256: 250,  512:  290              },
  'POCO X6':            { 256: 200                          },
  'POCO X5 Pro':        { 256: 200                          },
  'POCO X5':            { 128: 150,  256:  175              },
  'POCO X4 Pro 5G':     { 128: 160,  256:  195              },
  'POCO X4 GT':         { 128: 150,  256:  180              },
  'POCO X3 Pro':        { 128: 120,  256:  145              },
  'POCO X3 NFC':        { 64:   90,  128:  110              },
  'POCO M6 Pro':        { 256: 160                          },
  'POCO M5s':           { 128: 105,  256:  130              },
  'POCO M5':            { 128: 100,  256:  125              },
  'POCO M4 Pro':        { 128: 120,  256:  145              },
  'POCO M4':            { 64:   80,  128:  100              },
  'POCO M3 Pro':        { 64:   75,  128:   95              },
  'POCO M3':            { 64:   65,  128:   80              },
  'POCO F5 Pro':        { 256: 320                          },
  'POCO F5':            { 256: 240                          },
  'POCO F4 GT':         { 128: 240,  256:  280              },
  'POCO F4':            { 128: 195,  256:  230              },
  'POCO F3':            { 128: 170,  256:  205              },
  'POCO C65':           { 128:  85,  256:  100              },
  'POCO C55':           { 128:  75                          },
  'POCO C40':           { 64:   55,  128:   70              },

  /* ─── Tecno / Infinix / Realme ─── */
  'Tecno Camon 30 Pro+':      { 256: 200 },
  'Tecno Camon 30 Pro':       { 256: 175 },
  'Tecno Camon 30':           { 128: 125 },
  'Tecno Camon 20 Premier':   { 256: 170 },
  'Tecno Camon 20 Pro':       { 256: 150 },
  'Tecno Camon 20':           { 128: 110 },
  'Tecno Camon 19 Pro':       { 128: 120 },
  'Tecno Camon 19':           { 128: 100 },
  'Tecno Camon 18 Premier':   { 128: 130 },
  'Tecno Camon 18 Pro':       { 128: 115 },
  'Tecno Camon 18':           { 128:  95 },
  'Tecno Spark 20 Pro+':      { 128: 125 },
  'Tecno Spark 20 Pro':       { 128: 115 },
  'Tecno Spark 20':           { 64:  80, 128:  95 },
  'Tecno Spark 10 Pro':       { 128: 100 },
  'Tecno Spark 10':           { 64:  70, 128:  85 },
  'Tecno Spark 9 Pro':        { 128:  85 },
  'Tecno Spark 9':            { 64:  60, 128:  75 },
  'Tecno Spark 8 Pro':        { 128:  75 },
  'Tecno Spark 8':            { 64:  50, 128:  65 },
  'Tecno Pova 6 Pro':         { 256: 155 },
  'Tecno Pova 6':             { 128: 115 },
  'Tecno Pova 5 Pro':         { 128: 100 },
  'Tecno Pova 5':             { 128:  85 },
  'Tecno Pova 4 Pro':         { 128:  95 },
  'Tecno Pova 4':             { 128:  80 },
  'Tecno Pova 3':             { 128:  70 },
  'Tecno Phantom V Fold2':    { 256: 490 },
  'Tecno Phantom V Fold':     { 256: 450 },
  'Tecno Phantom V Flip2':    { 256: 310 },
  'Tecno Phantom V Flip':     { 256: 280 },
  'Tecno Pop 8':              { 64:  45 },
  'Tecno Pop 7':              { 64:  40 },
  'Tecno Pop 6':              { 64:  35 },
  'Infinix Zero 40 5G':       { 256: 240 },
  'Infinix Zero 30 5G':       { 256: 225 },
  'Infinix Zero 30':          { 256: 210 },
  'Infinix Zero 20':          { 256: 160 },
  'Infinix Note 40 Pro+ 5G':  { 256: 215 },
  'Infinix Note 40 Pro':      { 256: 175 },
  'Infinix Note 40':          { 128: 135 },
  'Infinix Note 30 Pro':      { 256: 155 },
  'Infinix Note 30 VIP':      { 256: 145 },
  'Infinix Note 30':          { 128: 115 },
  'Infinix Note 12 Pro':      { 128: 105 },
  'Infinix Note 12 VIP':      { 128: 100 },
  'Infinix Note 12':          { 128:  90 },
  'Infinix Note 11 Pro':      { 128:  90 },
  'Infinix Note 11':          { 128:  75 },
  'Infinix Hot 40 Pro':       { 256: 145 },
  'Infinix Hot 40':           { 128: 105 },
  'Infinix Hot 30i':          { 64:  65, 128:  80 },
  'Infinix Hot 30':           { 128:  80 },
  'Infinix Hot 20 Pro':       { 128:  90 },
  'Infinix Hot 20':           { 128:  75 },
  'Infinix Hot 20i':          { 128:  65 },
  'Infinix Hot 12 Pro':       { 128:  80 },
  'Infinix Hot 12':           { 64:  60, 128:  75 },
  'Infinix Smart 8 Pro':      { 64:  60 },
  'Infinix Smart 8':          { 64:  50 },
  'Infinix Smart 7':          { 64:  45 },
  'Realme GT 6':              { 256: 350, 512: 410 },
  'Realme GT 5 Pro':          { 256: 310, 512: 370 },
  'Realme GT 5':              { 256: 270 },
  'Realme GT Neo 6':          { 256: 300 },
  'Realme GT Neo 5':          { 256: 280 },
  'Realme GT Neo 3T':         { 128: 175, 256: 210 },
  'Realme GT Neo 3':          { 128: 200, 256: 240 },
  'Realme GT 2 Pro':          { 128: 225, 256: 265 },
  'Realme GT 2':              { 128: 175, 256: 210 },
  'Realme GT Master':         { 128: 155, 256: 185 },
  'Realme 12 Pro+':           { 256: 245 },
  'Realme 12 Pro':            { 128: 185 },
  'Realme 12':                { 128: 145 },
  'Realme 11 Pro+':           { 256: 220 },
  'Realme 11 Pro':            { 128: 165 },
  'Realme 11':                { 128: 130 },
  'Realme 10 Pro+':           { 128: 155, 256: 185 },
  'Realme 10 Pro':            { 128: 125, 256: 150 },
  'Realme 10':                { 128: 105, 256: 130 },
  'Realme 9 Pro+':            { 128: 140, 256: 170 },
  'Realme 9 Pro':             { 128: 115, 256: 140 },
  'Realme 9i':                { 128: 100 },
  'Realme 9':                 { 128: 120, 256: 145 },
  'Realme 8 Pro':             { 128: 115 },
  'Realme 8':                 { 128:  95 },
  'Realme Narzo 70 Pro':      { 128: 145, 256: 175 },
  'Realme Narzo 60 Pro':      { 128: 155, 256: 185 },
  'Realme Narzo 50 Pro':      { 128: 125 },
  'Realme Narzo 50':          { 128: 105, 256: 130 },
  'Realme C67':               { 128: 125 },
  'Realme C65':               { 128:  90, 256: 110 },
  'Realme C63':               { 128:  85 },
  'Realme C61':               { 128:  80 },
  'Realme C55':               { 128: 110 },
  'Realme C53':               { 128: 100 },
  'Realme C51':               { 64:  70, 128:  90 },
  'Realme C35':               { 128:  90 },
  'Realme C33':               { 128:  80 },
  'Realme C31':               { 64:  65, 128:  80 },
};

/* ─── Базовые цены USD (фолбек для неизвестных моделей) ─── */
const BASE_PRICES = {
  Apple:   { 64: 215, 128: 270, 256: 370, 512: 510, 1024: 660 },
  Samsung: { 64:  85, 128: 135, 256: 195, 512: 265, 1024: 370 },
  Xiaomi:  { 64:  60, 128: 110, 256: 175, 512: 235, 1024: 300 },
  Tecno:   { 64:  50, 128:  80, 256: 125, 512: 180, 1024: null },
  Другой:  { 64:  35, 128:  55, 256:  90, 512: 130, 1024: null },
};

/* ─── Множители оценки ─── */
const COND_MULT  = { 1: 0.22, 2: 0.42, 3: 0.68, 4: 0.88, 5: 1.0 };
const COND_TEXT  = {
  1: 'На запчасти / битый — не включается или сильно разбит',
  2: 'Сильные повреждения — трещины, частично работает',
  3: 'Рабочее с дефектами — видимые повреждения, всё работает',
  4: 'Хорошее — небольшие царапины, полностью рабочий',
  5: 'Отличное — как новый, полный комплект',
};
const BATT_LABEL   = { 1.0: '90%+ Отличный', 0.88: '80–89% Хороший', 0.72: '<80% Слабый' };
const REPAIR_LABEL = { 1.0: 'Не ремонтировался', 0.87: 'Замена экрана', 0.78: 'Другой ремонт' };
const KIT_LABEL    = { 1.05: 'Полный комплект', 1.0: 'Только коробка', 0.93: 'Только телефон' };

/* ─── Метки объёма ─── */
const STORAGE_LABELS = { 32: '32 ГБ', 64: '64 ГБ', 128: '128 ГБ', 256: '256 ГБ', 512: '512 ГБ', 1024: '1 ТБ' };

/* ════════════════════════════════════════════════════
   SPLASH
   ════════════════════════════════════════════════════ */
setTimeout(() => {
  document.getElementById('splash').classList.add('fade-out');
  setTimeout(() => {
    document.getElementById('splash').remove();
    document.getElementById('app').classList.add('visible');
  }, 500);
}, 1900);

/* ════════════════════════════════════════════════════
   HEADER SCROLL
   ════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('appHeader').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ════════════════════════════════════════════════════
   TAB NAVIGATION
   ════════════════════════════════════════════════════ */
document.querySelectorAll('.tab-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(name) {
  document.querySelectorAll('.tab-item').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(s => {
    const active = s.id === `tab-${name}`;
    s.classList.toggle('active', active);
    if (active) s.style.animation = 'none', s.offsetHeight, s.style.animation = '';
  });
}

/* ════════════════════════════════════════════════════
   ФОРМАТ ВАЛЮТЫ (USD)
   ════════════════════════════════════════════════════ */
function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/* ════════════════════════════════════════════════════
   TELEGRAM УВЕДОМЛЕНИЯ (прямой вызов Bot API)
   ════════════════════════════════════════════════════ */
const TG_TOKEN = '8947606615:AAEgfY2lTwsKRkJsGraoUcY-HeR9o94LZVI';
const TG_ADMIN = '7609456157';

async function tgSend(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (_) {}
}

/* ════════════════════════════════════════════════════
   РАСЧЁТ ЦЕН
   ════════════════════════════════════════════════════ */
function calcPrices() {
  const { brand, model, storage, cond, batt, repair, kit } = state.sell;
  if (!brand || !storage) return null;

  const battMult   = batt   ?? 1.0;
  const repairMult = repair ?? 1.0;
  const kitMult    = kit    ?? 1.0;

  const modelMarket = MODEL_PRICES[model]?.[storage];
  const brandMarket = BASE_PRICES[brand]?.[storage];
  const market = modelMarket ?? brandMarket;
  if (!market) return null;

  const offer = Math.round(market * 0.83 * COND_MULT[cond] * battMult * repairMult * kitMult);
  return {
    market:       modelMarket ? market : null,  // только если точная цена известна
    offer,
  };
}

/* ════════════════════════════════════════════════════
   ФОРМА ЗАКУПКИ — ШАГ 1: БРЕНД
   ════════════════════════════════════════════════════ */
document.getElementById('sellBrandGrid').addEventListener('click', e => {
  const tile = e.target.closest('.brand-tile');
  if (!tile) return;
  document.querySelectorAll('.brand-tile').forEach(t => t.classList.remove('selected'));
  tile.classList.add('selected');
  state.sell.brand = tile.dataset.brand;

  const isApple = state.sell.brand === 'Apple';
  document.getElementById('batterySubstep').classList.toggle('hidden', !isApple);
  state.sell.batt = isApple ? null : 1.0;

  const select = document.getElementById('sellModel');
  const models = SELL_MODELS[state.sell.brand] || [];
  select.innerHTML = `<option value="">-- Выберите модель --</option>` +
    models.map(m => `<option value="${m}">${m}</option>`).join('');

  document.getElementById('step2').classList.add('active');
  document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  updateSellProgress();
});

/* ШАГ 2: МОДЕЛЬ — обновляет доступные объёмы памяти */
document.getElementById('sellModel').addEventListener('change', e => {
  state.sell.model   = e.target.value;
  state.sell.storage = null;

  if (!state.sell.model) return;

  const modelPrices = MODEL_PRICES[state.sell.model];
  const storages = modelPrices
    ? Object.keys(modelPrices).map(Number).sort((a, b) => a - b)
    : [64, 128, 256, 512, 1024];

  document.getElementById('storageChips').innerHTML = storages
    .map(gb => `<button type="button" class="storage-chip" data-gb="${gb}">${STORAGE_LABELS[gb]}</button>`)
    .join('');

  document.getElementById('step3').classList.add('active');
  document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  updateSellProgress();
});

/* ШАГ 3: ОБЪЁМ ПАМЯТИ */
document.getElementById('storageChips').addEventListener('click', e => {
  const chip = e.target.closest('.storage-chip');
  if (!chip) return;
  document.querySelectorAll('#storageChips .storage-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.sell.storage = parseInt(chip.dataset.gb, 10);
  document.getElementById('step4').classList.add('active');
  document.getElementById('step4').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (state.sell.brand !== 'Apple') {
    document.getElementById('step5').classList.add('active');
  }
  updateSellProgress();
});

/* ШАГ 4: СОСТОЯНИЕ */
const condSlider = document.getElementById('conditionSlider');
const sliderFill = document.getElementById('sliderFill');
const condDesc   = document.getElementById('conditionDesc').querySelector('span');

condSlider.addEventListener('input', () => {
  state.sell.cond = parseInt(condSlider.value, 10);
  updateSlider(state.sell.cond);
  updateSellProgress();
});

function updateSlider(val) {
  sliderFill.style.width = ((val - 1) / 4 * 100) + '%';
  document.querySelectorAll('.cond-badge').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.val) === val));
  condDesc.textContent = COND_TEXT[val];
}

updateSlider(3);

/* ШАГ 4: АККУМУЛЯТОР */
document.getElementById('batteryChips').addEventListener('click', e => {
  const chip = e.target.closest('.storage-chip');
  if (!chip) return;
  document.querySelectorAll('#batteryChips .storage-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.sell.batt = parseFloat(chip.dataset.batt);
  document.getElementById('step5').classList.add('active');
  document.getElementById('step5').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  updateSellProgress();
});

/* ШАГ 5: РЕМОНТ */
document.getElementById('repairChips').addEventListener('click', e => {
  const chip = e.target.closest('.storage-chip');
  if (!chip) return;
  document.querySelectorAll('#repairChips .storage-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  const repairVal     = parseFloat(chip.dataset.repair);
  const isScreen      = repairVal === 0.87;
  const isNonApple    = state.sell.brand !== 'Apple' && state.sell.brand !== 'Другой';
  const rejectCard    = document.getElementById('screenRejectCard');

  if (isScreen && isNonApple) {
    rejectCard.classList.remove('hidden');
    state.sell.repair = null;
    document.getElementById('step6').classList.remove('active');
  } else {
    rejectCard.classList.add('hidden');
    state.sell.repair = repairVal;
    tryShowStep6();
  }
  updateSellProgress();
});

/* Reject card — restart */
document.getElementById('rejectRestartBtn').addEventListener('click', () => {
  resetSellForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ШАГ 5: КОМПЛЕКТАЦИЯ */
document.getElementById('kitChips').addEventListener('click', e => {
  const chip = e.target.closest('.storage-chip');
  if (!chip) return;
  document.querySelectorAll('#kitChips .storage-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.sell.kit = parseFloat(chip.dataset.kit);
  tryShowStep6();
  updateSellProgress();
});

function tryShowStep6() {
  if (state.sell.repair !== null && state.sell.kit !== null) {
    document.getElementById('step6').classList.add('active');
    document.getElementById('step6').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ШАГ 6: КОНТАКТЫ */
const sellName  = document.getElementById('sellName');
const sellPhone = document.getElementById('sellPhone');

[sellName, sellPhone].forEach(el => {
  el.addEventListener('input', () => {
    state.sell.name  = sellName.value.trim();
    state.sell.phone = sellPhone.value.trim();
    updateSellProgress();
  });
});

(function prefillUser() {
  const user = tg?.initDataUnsafe?.user;
  if (user) {
    sellName.value  = `${user.first_name} ${user.last_name || ''}`.trim();
    state.sell.name = sellName.value;
  }
})();

/* ════════════════════════════════════════════════════
   ОБНОВЛЕНИЕ ПРОГРЕССА И ЦЕН
   ════════════════════════════════════════════════════ */
function updateSellProgress() {
  const { brand, model, storage, repair, kit, batt, name, phone } = state.sell;
  const priceBlock  = document.getElementById('priceEstimator');
  const offerPriceEl = document.getElementById('estPrice');
  const submitBtn   = document.getElementById('sellSubmitBtn');

  const prices = calcPrices();

  if (prices) {
    offerPriceEl.textContent = fmt(prices.offer);
    priceBlock.classList.add('visible');
  } else {
    priceBlock.classList.remove('visible');
  }

  const isRejected = brand && brand !== 'Apple' && brand !== 'Другой' && repair === null &&
                     document.querySelector('#repairChips .storage-chip[data-repair="0.87"]')
                       ?.classList.contains('selected');

  const ready = brand && model && storage && batt !== null && repair !== null &&
                kit !== null && name && phone.length >= 6 && !isRejected;
  submitBtn.disabled = !ready;
}

/* ════════════════════════════════════════════════════
   ОТПРАВКА ЗАЯВКИ
   ════════════════════════════════════════════════════ */
document.getElementById('sellForm').addEventListener('submit', async e => {
  e.preventDefault();
  const { brand, model, storage, cond, batt, repair, kit, name, phone } = state.sell;
  const prices = calcPrices();
  const offer  = prices?.offer || 0;

  const batteryLabel = brand === 'Apple' ? (BATT_LABEL[batt] || '') : '';
  const user      = tg?.initDataUnsafe?.user;
  const userId    = user?.id?.toString() || 'unknown';
  const userName  = user?.username || user?.first_name || name;
  const sellId    = `BUY-${Date.now().toString().slice(-8)}`;

  const btn = document.getElementById('sellSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ri-loader-4-line"></i> Отправляем...';

  /* ── Уведомление администратору ── */
  const lines = [
    `📲 <b>Новая заявка ${sellId}</b>`,
    ``,
    `📱 <b>Устройство:</b> ${brand} ${model}`,
    `💾 <b>Память:</b> ${storage} ГБ`,
    `⭐ <b>Состояние:</b> ${COND_TEXT[cond]}`,
    batteryLabel          ? `🔋 <b>Аккумулятор:</b> ${batteryLabel}`         : '',
    REPAIR_LABEL[repair]  ? `🔧 <b>Ремонт:</b> ${REPAIR_LABEL[repair]}`      : '',
    KIT_LABEL[kit]        ? `📦 <b>Комплект:</b> ${KIT_LABEL[kit]}`          : '',
    `💵 <b>Оценка:</b> ${fmt(offer)}`,
    ``,
    `👤 <b>Клиент:</b> ${name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    userId !== 'unknown'  ? `💬 @${userName} (ID: <code>${userId}</code>)`    : '',
    ``,
    `⏰ ${new Date().toLocaleString('ru-RU')}`,
  ].filter(Boolean).join('\n');

  await tgSend(TG_ADMIN, lines);

  /* ── Подтверждение клиенту (если открыто через Telegram) ── */
  if (userId !== 'unknown') {
    const clientMsg = [
      `✅ <b>Заявка принята!</b>`,
      ``,
      `📱 ${brand} ${model} (${storage} ГБ)`,
      batteryLabel         ? `🔋 ${batteryLabel}`          : '',
      REPAIR_LABEL[repair] ? `🔧 ${REPAIR_LABEL[repair]}`  : '',
      KIT_LABEL[kit]       ? `📦 ${KIT_LABEL[kit]}`        : '',
      ``,
      `💵 Предварительная оценка: <b>${fmt(offer)}</b>`,
      ``,
      `Наш специалист свяжется по номеру <b>${phone}</b>.`,
    ].filter(Boolean).join('\n');
    await tgSend(userId, clientMsg);
  }

  const orderId2 = `#${Date.now().toString().slice(-6)}`;
  state.orders.unshift({
    id:      orderId2,
    device:  `${brand} ${model}`,
    storage: `${storage} ГБ`,
    cond:    COND_TEXT[cond],
    battery: batteryLabel,
    repair:  REPAIR_LABEL[repair],
    kit:     KIT_LABEL[kit],
    price:   offer,
    status:  'new',
    date:    new Date().toLocaleDateString('ru'),
  });
  localStorage.setItem('orders', JSON.stringify(state.orders));
  renderOrders();

  tg?.HapticFeedback?.notificationOccurred('success');
  showSuccess('Заявка отправлена!', `Мы оценим ваш ${brand} ${model} и свяжемся с вами.`);
  setTimeout(resetSellForm, 800);
});

function resetSellForm() {
  state.sell = { brand: null, model: null, storage: null, cond: 3, batt: null, repair: null, kit: null, name: state.sell.name, phone: state.sell.phone };
  document.querySelectorAll('.brand-tile').forEach(t => t.classList.remove('selected'));
  document.querySelectorAll('.storage-chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('sellModel').innerHTML = '<option value="">-- Выберите модель --</option>';
  condSlider.value = 3;
  updateSlider(3);
  document.getElementById('screenRejectCard').classList.add('hidden');
  document.getElementById('batterySubstep').classList.remove('hidden');
  ['step2','step3','step4','step5','step6'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById('priceEstimator').classList.remove('visible');
  document.getElementById('sellSubmitBtn').disabled = true;
  document.getElementById('sellSubmitBtn').innerHTML = '<i class="ri-send-plane-2-line"></i> Отправить заявку';
}

/* ════════════════════════════════════════════════════
   ЗАЯВКИ
   ════════════════════════════════════════════════════ */
function renderOrders() {
  const list  = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');

  if (!state.orders.length) {
    list.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.classList.remove('hidden');
  list.innerHTML = state.orders.map(o => {
    const statusMap = {
      new:     ['status-new',     'Новая'],
      process: ['status-process', 'В работе'],
      done:    ['status-done',    'Завершена'],
    };
    const [cls, label] = statusMap[o.status] || statusMap.new;
    const deviceLine = `${o.device}${o.storage ? ` (${o.storage})` : ''}`;
    const condLine  = o.cond ? o.cond.split('—')[0].trim() : '';
    const extras    = [o.battery, o.repair, o.kit].filter(Boolean).join(' · ');
    const offerText = o.price ? fmt(o.price) : '—';

    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-num">Заявка ${o.id}</span>
          <span class="order-status ${cls}">${label}</span>
        </div>
        <div class="order-items">
          <strong>${deviceLine}</strong>${condLine ? ' · ' + condLine : ''}
          ${extras ? `<br><span style="font-size:12px;color:var(--text-3)">${extras}</span>` : ''}
        </div>
        <div class="order-total">${offerText}</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:4px">${o.date}</div>
      </div>`;
  }).join('');
}

renderOrders();

/* ════════════════════════════════════════════════════
   TOAST / SUCCESS
   ════════════════════════════════════════════════════ */
function toast(msg, type = 'info', duration = 3000) {
  const icons = { success: 'ri-checkbox-circle-fill', error: 'ri-error-warning-fill', info: 'ri-information-fill' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="toast-icon ${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, duration);
}

function showSuccess(title, desc) {
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successDesc').textContent  = desc;
  document.getElementById('successOverlay').classList.remove('hidden');
}

document.getElementById('successClose').addEventListener('click', () => {
  document.getElementById('successOverlay').classList.add('hidden');
});

