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
  lang:   localStorage.getItem('lang') || 'ru',
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
   ПЕРЕВОДЫ (RU / UZ)
   ════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  ru: {
    splash_sub:        'Закупка б/у телефонов',
    tab_sell:          'Закупка',
    tab_orders:        'Заявки',
    hero_title:        'Сдайте телефон',
    hero_sub:          'Получите оценку за 30 секунд — оплата сразу',
    step1_label:       'Выберите бренд',
    brand_other:       'Другой',
    step2_label:       'Модель',
    model_placeholder: '-- Выберите модель --',
    model_other:       'Другая модель',
    model_comment:     'Указать в комментарии',
    step3_label:       'Объём памяти',
    step4_label:       'Состояние',
    cond_label_bad:    'Битый',
    cond_label_mid:    'С дефектами',
    cond_label_good:   'Отличное',
    cond1: 'На запчасти / битый — не включается или сильно разбит',
    cond2: 'Сильные повреждения — трещины, частично работает',
    cond3: 'Рабочее с дефектами — видимые повреждения, всё работает',
    cond4: 'Хорошее — небольшие царапины, полностью рабочий',
    cond5: 'Отличное — как новый, полный комплект',
    batt_label:        'Ёмкость аккумулятора',
    batt_90:           '90%+ Отличный',
    batt_80:           '80–89% Хороший',
    batt_low:          '<80% Слабый',
    step5_label:       'Дополнительно',
    repair_label:      'История ремонта',
    repair_no:         'Не ремонтировался',
    repair_screen:     'Замена экрана',
    repair_other:      'Другой ремонт',
    kit_label:         'Комплектация',
    kit_full:          'Полный комплект',
    kit_box:           'Только коробка',
    kit_phone:         'Только телефон',
    reject_title:      'К сожалению, не принимаем',
    reject_desc:       'Телефоны <strong>не Apple</strong> с заменённым экраном мы не закупаем.<br>Попробуйте другое устройство.',
    reject_restart:    'Начать заново',
    step6_label:       'Ваши контакты',
    contact_name:      'Имя',
    name_placeholder:  'Как вас зовут?',
    contact_phone:     'Телефон',
    price_title:       'Предварительная оценка',
    price_note:        'Средняя рыночная оценка — итоговая цена может быть выше или ниже после осмотра',
    submit_btn:        'Отправить заявку',
    submit_sending:    'Отправляем...',
    orders_empty_title:'Заявок пока нет',
    orders_empty_sub:  'Ваши заявки на закупку телефонов появятся здесь',
    orders_create:     'Оформить заявку',
    order_label:       'Заявка',
    status_new:        'Новая',
    status_process:    'В работе',
    status_done:       'Завершена',
    success_title:     'Заявка отправлена!',
    success_close:     'Отлично!',
    success_desc:      (brand, model) => `Мы оценим ваш ${brand} ${model} и свяжемся с вами.`,
  },
  uz: {
    splash_sub:        'B/u telefonlarni qabul qilamiz',
    tab_sell:          'Qabul',
    tab_orders:        'Arizalar',
    hero_title:        'Telefoningizni topshiring',
    hero_sub:          '30 soniyada baho oling — to\'lov darhol',
    step1_label:       'Brendni tanlang',
    brand_other:       'Boshqa',
    step2_label:       'Model',
    model_placeholder: '-- Modelni tanlang --',
    model_other:       'Boshqa model',
    model_comment:     'Izohda ko\'rsatish',
    step3_label:       'Xotira hajmi',
    step4_label:       'Holati',
    cond_label_bad:    'Singan',
    cond_label_mid:    'Nuqsonli',
    cond_label_good:   'A\'lo',
    cond1: 'Ehtiyot qism uchun / singan — yoqmaydi yoki qattiq singan',
    cond2: 'Kuchli shikast — yoriqlar bor, qisman ishlaydi',
    cond3: 'Nuqsonli, ishlaydi — ko\'rinadigan shikast, ammo ishlaydi',
    cond4: 'Yaxshi — kichik tirnalishlar, to\'liq ishlaydigan',
    cond5: 'A\'lo — yangidek, to\'liq komplekt',
    batt_label:        'Batareya sig\'imi',
    batt_90:           '90%+ A\'lo',
    batt_80:           '80–89% Yaxshi',
    batt_low:          '<80% Zaif',
    step5_label:       'Qo\'shimcha',
    repair_label:      'Ta\'mirlash tarixi',
    repair_no:         'Ta\'mirlanmagan',
    repair_screen:     'Ekran almashtirish',
    repair_other:      'Boshqa ta\'mir',
    kit_label:         'Komplektatsiya',
    kit_full:          'To\'liq komplekt',
    kit_box:           'Faqat quti',
    kit_phone:         'Faqat telefon',
    reject_title:      'Afsuski, qabul qilmaymiz',
    reject_desc:       '<strong>Apple emas</strong> telefonlar bilan almashtirilgan ekran — qabul qilmaymiz.<br>Boshqa qurilmani sinab ko\'ring.',
    reject_restart:    'Qaytadan boshlash',
    step6_label:       'Kontaktlaringiz',
    contact_name:      'Ism',
    name_placeholder:  'Ismingiz?',
    contact_phone:     'Telefon',
    price_title:       'Dastlabki baho',
    price_note:        'O\'rtacha bozor bahosi — yakuniy narx ko\'rikdan keyin farq qilishi mumkin',
    submit_btn:        'Ariza yuborish',
    submit_sending:    'Yuborilmoqda...',
    orders_empty_title:'Arizalar yo\'q',
    orders_empty_sub:  'Telefonlarni qabul qilish bo\'yicha arizalaringiz shu yerda ko\'rinadi',
    orders_create:     'Ariza berish',
    order_label:       'Ariza',
    status_new:        'Yangi',
    status_process:    'Jarayonda',
    status_done:       'Yakunlangan',
    success_title:     'Ariza yuborildi!',
    success_close:     'Zo\'r!',
    success_desc:      (brand, model) => `${brand} ${model} qurilmangizni baholaymiz va siz bilan bog\'lanamiz.`,
  },
};

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);
  document.getElementById('langRu').classList.toggle('active', lang === 'ru');
  document.getElementById('langUz').classList.toggle('active', lang === 'uz');
  applyLang(lang);
}

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key && t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key && t[key]) el.placeholder = t[key];
  });
  /* update model select placeholder if empty */
  const sel = document.getElementById('sellModel');
  if (sel.options[0] && sel.options[0].value === '') {
    sel.options[0].text = t.model_placeholder;
  }
  /* update dynamic labels used in JS logic */
  COND_TEXT[1] = t.cond1; COND_TEXT[2] = t.cond2; COND_TEXT[3] = t.cond3;
  COND_TEXT[4] = t.cond4; COND_TEXT[5] = t.cond5;
  BATT_LABEL[1.0]  = t.batt_90;
  BATT_LABEL[0.88] = t.batt_80;
  BATT_LABEL[0.72] = t.batt_low;
  REPAIR_LABEL[1.0]  = t.repair_no;
  REPAIR_LABEL[0.87] = t.repair_screen;
  REPAIR_LABEL[0.78] = t.repair_other;
  KIT_LABEL[1.05] = t.kit_full;
  KIT_LABEL[1.0]  = t.kit_box;
  KIT_LABEL[0.93] = t.kit_phone;
  /* refresh slider description */
  const condSpan = document.getElementById('conditionDesc')?.querySelector('span');
  if (condSpan) condSpan.textContent = COND_TEXT[state.sell.cond ?? 3];
  /* refresh submit button text if not in sending state */
  const btn = document.getElementById('sellSubmitBtn');
  const btnSpan = btn?.querySelector('[data-i18n="submit_btn"]');
  if (btnSpan) btnSpan.textContent = t.submit_btn;
  /* refresh orders */
  renderOrders();
}

/* ════════════════════════════════════════════════════
   МОДЕЛИ ПО БРЕНДАМ
   ════════════════════════════════════════════════════ */
const SELL_MODELS = {
  Apple: [
    'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Air', 'iPhone 17',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
    'iPhone SE (2022)', 'iPhone SE (2020)',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR',
    'iPhone X', 'iPhone 8 Plus', 'iPhone 8',
    'Старше 2018',
  ],
  Samsung: [
    'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S25 FE',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21',
    'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20',
    'Galaxy Note 20 Ultra', 'Galaxy Note 20',
    'Galaxy Note 10+', 'Galaxy Note 10',
    'Galaxy S10+', 'Galaxy S10', 'Galaxy S10e',
    'Galaxy S9+', 'Galaxy S9',
    'Galaxy Note 9', 'Galaxy Note 8',
    'Galaxy A73', 'Galaxy A72',
    'Galaxy A56', 'Galaxy A55', 'Galaxy A54', 'Galaxy F54', 'Galaxy A53', 'Galaxy A52',
    'Galaxy A36', 'Galaxy A35', 'Galaxy A34', 'Galaxy A33', 'Galaxy A32',
    'Galaxy A26', 'Galaxy A25', 'Galaxy A24', 'Galaxy A23', 'Galaxy A22',
    'Galaxy A16', 'Galaxy A15', 'Galaxy A15 5G', 'Galaxy A14', 'Galaxy A14 5G', 'Galaxy A13',
    'Galaxy A06', 'Galaxy A05s', 'Galaxy A05', 'Galaxy A04s', 'Galaxy A04',
    'Galaxy A71', 'Galaxy A51',
    'Galaxy A70', 'Galaxy A50s', 'Galaxy A50', 'Galaxy A40',
    'Galaxy A30s', 'Galaxy A30', 'Galaxy A20s', 'Galaxy A20e', 'Galaxy A20',
    'Galaxy A10s', 'Galaxy A10',
    'Galaxy J8', 'Galaxy J6+', 'Galaxy J6', 'Galaxy J4+', 'Galaxy J4',
    'Galaxy M34 5G', 'Galaxy M33 5G', 'Galaxy M23', 'Galaxy M22', 'Galaxy M13', 'Galaxy M12',
    'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3',
    'Galaxy Z Flip 6', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
    'Другая модель',
  ],
  Xiaomi: [
    'Redmi Note 15 Pro+', 'Redmi Note 15 Pro', 'Redmi Note 15',
    'Redmi Note 14 Pro+', 'Redmi Note 14 Pro', 'Redmi Note 14',
    'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
    'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12', 'Redmi Note 12S',
    'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11S', 'Redmi Note 11',
    'Redmi Note 10 Pro', 'Redmi Note 10S', 'Redmi Note 10',
    'Redmi Note 9 Pro', 'Redmi Note 9S', 'Redmi Note 9',
    'Redmi Note 8 Pro', 'Redmi Note 8',
    'Redmi Note 7 Pro', 'Redmi Note 7',
    'Redmi Note 6 Pro',
    'Redmi 15', 'Redmi 15C',
    'Redmi 14C',
    'Redmi 13', 'Redmi 13T', 'Redmi 13C', 'Redmi 13 Lite',
    'Redmi 12C', 'Redmi 12', 'Redmi 10C', 'Redmi 10', 'Redmi 9T', 'Redmi 9',
    'Redmi 8A', 'Redmi 8', 'Redmi 7A', 'Redmi 7',
    'Redmi A3', 'Redmi A2', 'Redmi A1',
    'Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15',
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
    'Xiaomi 12 Pro', 'Xiaomi 12X', 'Xiaomi 12',
    'Xiaomi 12T Pro', 'Xiaomi 12T',
    'Xiaomi Mi 11 Ultra', 'Xiaomi Mi 11 Pro', 'Xiaomi Mi 11',
    'Xiaomi Mi 10 Pro', 'Xiaomi Mi 10',
    'Xiaomi Mi 9', 'Xiaomi Mi 8', 'Xiaomi Mi 8 Lite',
    'POCO X8 Pro', 'POCO X7 Pro',
    'POCO X6 Pro', 'POCO X6', 'POCO X5 Pro', 'POCO X5',
    'POCO X4 Pro 5G', 'POCO X4 GT', 'POCO X3 Pro', 'POCO X3 NFC',
    'POCO M6 Pro', 'POCO M5s', 'POCO M5', 'POCO M4 Pro', 'POCO M4', 'POCO M3 Pro', 'POCO M3',
    'POCO F8 Ultra', 'POCO F5 Pro', 'POCO F5', 'POCO F4 GT', 'POCO F4', 'POCO F3',
    'POCO C65', 'POCO C55', 'POCO C40',
    'POCO F1',
    'Другая модель',
  ],
  Infinix: [
    'Infinix GT 30 Pro',
    'Infinix Zero 40 5G', 'Infinix Zero 30 5G', 'Infinix Zero 30', 'Infinix Zero 20',
    'Infinix Note 40 Pro+ 5G', 'Infinix Note 40 Pro', 'Infinix Note 40',
    'Infinix Note 30 Pro', 'Infinix Note 30 VIP', 'Infinix Note 30',
    'Infinix Note 12 Pro', 'Infinix Note 12 VIP', 'Infinix Note 12',
    'Infinix Note 11 Pro', 'Infinix Note 11',
    'Infinix Hot 40 Pro', 'Infinix Hot 40', 'Infinix Hot 30i', 'Infinix Hot 30',
    'Infinix Hot 20 Pro', 'Infinix Hot 20', 'Infinix Hot 20i',
    'Infinix Hot 12 Pro', 'Infinix Hot 12',
    'Infinix Smart 8 Pro', 'Infinix Smart 8', 'Infinix Smart 7',
    'Другая модель',
  ],
  Honor: [
    /* 2025 */
    'Honor Magic7 Ultra', 'Honor Magic7 Pro', 'Honor Magic7',
    'Honor 600',
    'Honor 400 Pro', 'Honor 400',
    /* 2024 */
    'Honor Magic6 Pro', 'Honor Magic6',
    'Honor 200 Pro', 'Honor 200',
    'Honor 100 Pro', 'Honor 100',
    'Honor X9d', 'Honor X9c', 'Honor X9b', 'Honor X8d', 'Honor X8b', 'Honor X7c', 'Honor X7b',
    /* 2023 */
    'Honor Magic5 Pro', 'Honor Magic5',
    'Honor 90 Pro', 'Honor 90',
    'Honor 80 Pro', 'Honor 80',
    'Honor X9a', 'Honor X8a', 'Honor X7a', 'Honor X6c', 'Honor X6a',
    /* 2022 */
    'Honor Magic4 Pro', 'Honor Magic4',
    'Honor 70 Pro+', 'Honor 70 Pro', 'Honor 70',
    'Honor 50 SE', 'Honor X8', 'Honor X7', 'Honor X6',
    /* 2021 */
    'Honor 50 Pro', 'Honor 50',
    'Honor X10', 'Honor 30i',
    /* 2020 */
    'Honor 30 Pro+', 'Honor 30 Pro', 'Honor 30S', 'Honor 30',
    'Honor 10X Lite', 'Honor 9A', 'Honor 9S',
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
  'iPhone 17 Pro Max':  { 256: 1079, 512: 1259, 1024: 1439, 2048: 1799 },
  'iPhone 17 Pro':      { 256:  989, 512: 1169, 1024: 1349             },
  'iPhone 17 Air':      { 256:  899, 512: 1000, 1024: 1100             },
  'iPhone 17':          { 256:  719, 512:  820                         },
  'iPhone 16 Pro Max':  { 256: 1090, 512: 1190, 1024: 1290 },
  'iPhone 16 Pro':      { 128: 790,  256:  880, 512:   980  },
  'iPhone 16 Plus':     { 128: 740,  256:  820              },
  'iPhone 16':          { 128: 670,  256:  740              },
  'iPhone 15 Pro Max':  { 256: 790,  512:  880, 1024:  980  },
  'iPhone 15 Pro':      { 128: 680,  256:  760, 512:   860  },
  'iPhone 15 Plus':     { 128: 590,  256:  660              },
  'iPhone 15':          { 128: 550,  256:  620              },
  'iPhone 14 Pro Max':  { 128: 660,  256:  730, 512:   830, 1024: 930 },
  'iPhone 14 Pro':      { 128: 550,  256:  610, 512:   710  },
  'iPhone 14 Plus':     { 128: 660,  256:  730              },
  'iPhone 14':          { 128: 380,  256:  430              },
  'iPhone 13 Pro Max':  { 128: 530,  256:  590, 512:   670, 1024: 760 },
  'iPhone 13 Pro':      { 128: 295,  256:  335, 512:   390  },
  'iPhone 13 mini':     { 128: 290,  256:  340              },
  'iPhone 13':          { 128: 300,  256:  340, 512:   400  },
  'iPhone SE (2022)':   { 64:  200,  128:  230, 256:   280  },
  'iPhone SE (2020)':   { 64:  150,  128:  175, 256:   210  },
  'iPhone 12 Pro Max':  { 128: 350,  256:  390, 512:   450  },
  'iPhone 12 Pro':      { 128: 275,  256:  315, 512:   370  },
  'iPhone 12 mini':     { 64:  200,  128:  240, 256:   290  },
  'iPhone 12':          { 64:  230,  128:  270, 256:   320  },
  'iPhone 11 Pro Max':  { 64:  200,  256:  240, 512:   290  },
  'iPhone 11 Pro':      { 64:  160,  256:  200, 512:   245  },
  'iPhone 11':          { 64:  165,  128:  190, 256:   225  },
  'iPhone XS Max':      { 64:  110,  256:  135, 512:   160  },
  'iPhone XS':          { 64:  120,  256:  140, 512:   160  },
  'iPhone XR':          { 64:   95,  128:  110, 256:   125  },
  'iPhone X':           { 64:   85,  256:  100               },
  'iPhone 8 Plus':      { 64:   70,  128:   80, 256:    90  },
  'iPhone 8':           { 64:   58,  128:   68, 256:    78  },

  /* ─── Samsung ─── */
  'Galaxy S25 Ultra':   { 256: 840,  512:  940, 1024: 1040  },
  'Galaxy S25+':        { 256: 670,  512:  760              },
  'Galaxy S25':         { 128: 570,  256:  630              },
  'Galaxy S25 FE':      { 256: 465                          },
  'Galaxy S24 Ultra':   { 256: 610,  512:  700, 1024:  800  },
  'Galaxy S24+':        { 256: 450,  512:  520              },
  'Galaxy S24':         { 128: 430,  256:  480              },
  'Galaxy S23 Ultra':   { 256: 525,  512:  600              },
  'Galaxy S23+':        { 256: 430,  512:  490              },
  'Galaxy S23':         { 128: 320,  256:  370              },
  'Galaxy S22 Ultra':   { 128: 450,  256:  510, 512:   570  },
  'Galaxy S22+':        { 128: 295,  256:  340              },
  'Galaxy S22':         { 128: 255,  256:  295              },
  'Galaxy S21 Ultra':   { 128: 320,  256:  370, 512:   430  },
  'Galaxy S21+':        { 128: 240,  256:  280              },
  'Galaxy S21':         { 128: 205,  256:  235              },
  'Galaxy S20 Ultra':   { 128: 245,  256:  285              },
  'Galaxy S20+':        { 128: 185,  256:  220              },
  'Galaxy S20':         { 128: 145,  256:  175              },
  'Galaxy Note 20 Ultra': { 256: 310, 512:  370             },
  'Galaxy Note 20':     { 256: 240                          },
  'Galaxy Note 10+':    { 256: 195,  512:  235              },
  'Galaxy Note 10':     { 256: 155                          },
  'Galaxy S10+':        { 128:  80,  512:  100              },
  'Galaxy S10':         { 128: 125,  512:  150              },
  'Galaxy S10e':        { 128: 105                          },
  'Galaxy S9+':         { 64:  105,  128:  125              },
  'Galaxy S9':          { 64:   90,  128:  105              },
  'Galaxy Note 9':      { 128: 125,  512:  150              },
  'Galaxy Note 8':      { 64:   95,  128:  110              },
  'Galaxy A73':         { 256: 200                          },
  'Galaxy A72':         { 128: 170,  256:  195              },
  'Galaxy A56':         { 128: 275,  256:  315              },
  'Galaxy A55':         { 128: 190,  256:  215              },
  'Galaxy A54':         { 128: 165,  256:  195              },
  'Galaxy F54':         { 128: 130                          },
  'Galaxy A53':         { 128: 100,  256:  125              },
  'Galaxy A52':         { 128: 140,  256:  170              },
  'Galaxy A36':         { 128: 190,  256:  230              },
  'Galaxy A35':         { 128: 190,  256:  220              },
  'Galaxy A34':         { 128: 130,  256:  165              },
  'Galaxy A33':         { 128: 130,  256:  160              },
  'Galaxy A32':         { 128: 115,  256:  140              },
  'Galaxy A26':         { 128: 155,  256:  180              },
  'Galaxy A25':         { 128: 125,  256:  150              },
  'Galaxy A24':         { 128: 110,  256:  135              },
  'Galaxy A23':         { 128:  60,  256:   80              },
  'Galaxy A22':         { 128:  85,  256:  105              },
  'Galaxy A16':         { 128: 120                          },
  'Galaxy A15':         { 128: 100,  256:  125              },
  'Galaxy A15 5G':      { 128: 100,  256:  125              },
  'Galaxy A14':         { 64:   50,  128:   65              },
  'Galaxy A14 5G':      { 64:   55,  128:   70              },
  'Galaxy A13':         { 64:   60,  128:   65              },
  'Galaxy A06':         { 128:  65                          },
  'Galaxy A05s':        { 64:   65,  128:   80              },
  'Galaxy A05':         { 64:   30,  128:   45              },
  'Galaxy A04s':        { 64:   50,  128:   65              },
  'Galaxy A04':         { 64:   45,  128:   60              },
  'Galaxy A71':         { 128: 155                          },
  'Galaxy A51':         { 128:  65                          },
  'Galaxy A70':         { 128:  92                          },
  'Galaxy A50s':        { 64:   72,  128:   88              },
  'Galaxy A50':         { 64:   68,  128:   82              },
  'Galaxy A40':         { 64:   62                          },
  'Galaxy A30s':        { 64:   58,  128:   68              },
  'Galaxy A30':         { 64:   52,  128:   62              },
  'Galaxy A20s':        { 32:   30,  64:    40              },
  'Galaxy A20e':        { 32:   40                          },
  'Galaxy A20':         { 32:   42,  64:    50              },
  'Galaxy A10s':        { 32:   36,  64:    44              },
  'Galaxy A10':         { 32:   32,  64:    40              },
  'Galaxy J8':          { 32:   42,  64:    50              },
  'Galaxy J6+':         { 32:   36                          },
  'Galaxy J6':          { 32:   34,  64:    42              },
  'Galaxy J4+':         { 32:   30                          },
  'Galaxy J4':          { 16:   26,  32:    34              },
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
  'Xiaomi 12X':         { 256: 150                          },
  'Xiaomi 12':          { 128: 190,  256:  225              },
  'Xiaomi 12T Pro':     { 256: 190                          },
  'Xiaomi 12T':         { 256: 155                          },
  'Xiaomi Mi 11 Ultra': { 256: 300                          },
  'Xiaomi Mi 11 Pro':   { 256: 260                          },
  'Xiaomi Mi 11':       { 128: 190,  256:  220              },
  'Xiaomi Mi 10 Pro':   { 256: 240                          },
  'Xiaomi Mi 10':       { 128: 175,  256:  205              },
  'Xiaomi Mi 9':        { 64:  105,  128:  125              },
  'Xiaomi Mi 8':        { 64:   85,  128:  100              },
  'Xiaomi Mi 8 Lite':   { 64:   65,  128:   78              },
  'Redmi Note 15 Pro+': { 256: 385,  512:  440              },
  'Redmi Note 15 Pro':  { 256: 230,  512:  270              },
  'Redmi Note 15':      { 128: 165,  256:  200              },
  'Redmi Note 14 Pro+': { 256: 255,  512:  295              },
  'Redmi Note 14 Pro':  { 256: 190,  512:  225              },
  'Redmi Note 14':      { 128: 110,  256:  140              },
  'Redmi Note 13 Pro+': { 256: 240,  512:  280              },
  'Redmi Note 13 Pro':  { 256: 130,  512:  165              },
  'Redmi Note 13':      { 128:  80,  256:  100              },
  'Redmi Note 12 Pro+': { 256: 175                          },
  'Redmi Note 12 Pro':  { 256: 160                          },
  'Redmi Note 12':      { 128:  70,  256:   90              },
  'Redmi Note 12S':     { 128:  75,  256:   80              },
  'Redmi Note 11 Pro+': { 128: 115,  256:  140              },
  'Redmi Note 11 Pro':  { 128:  90,  256:  110              },
  'Redmi Note 11S':     { 128: 100,  256:  120              },
  'Redmi Note 11':      { 128:  95,  256:  115              },
  'Redmi Note 10 Pro':  { 64:  115,  128:  135              },
  'Redmi Note 10S':     { 64:   90,  128:  110              },
  'Redmi Note 10':      { 64:   85,  128:  100              },
  'Redmi Note 9 Pro':   { 64:   80,  128:   95              },
  'Redmi Note 9S':      { 64:   75,  128:   90              },
  'Redmi Note 9':       { 64:   65,  128:   80              },
  'Redmi Note 8 Pro':   { 64:   82,  128:   98              },
  'Redmi Note 8':       { 64:   40,  128:   55              },
  'Redmi Note 7 Pro':   { 64:   68,  128:   78              },
  'Redmi Note 7':       { 64:   58,  128:   68              },
  'Redmi Note 6 Pro':   { 64:   52,  128:   62              },
  'Redmi 15':           { 128: 130,  256:  160              },
  'Redmi 15C':          { 128:  80                          },
  'Redmi 14C':          { 64:   65,  128:   80,  256:  90   },
  'Redmi 13':           { 128:  65                          },
  'Redmi 13T':          { 128: 210,  256:  250              },
  'Redmi 13C':          { 128:  60                          },
  'Redmi 13 Lite':      { 128: 130                          },
  'Redmi 12C':          { 64:   65,  128:   80              },
  'Redmi 12':           { 128: 130,  256:  155              },
  'Redmi 10C':          { 64:   60,  128:   75              },
  'Redmi 10':           { 64:   60,  128:   75              },
  'Redmi 9T':           { 64:   55,  128:   70              },
  'Redmi 9':            { 64:   50,  128:   65              },
  'Redmi 8A':           { 32:   42,  64:    52              },
  'Redmi 8':            { 64:   52,  128:   62              },
  'Redmi 7A':           { 32:   36,  64:    44              },
  'Redmi 7':            { 64:   50                          },
  'Redmi A3':           { 64:   50,  128:   65              },
  'Redmi A2':           { 32:   40,  64:    55              },
  'Redmi A1':           { 32:   35,  64:    50              },
  'POCO X8 Pro':        { 256: 320,  512:  370              },
  'POCO X7 Pro':        { 256: 230,  512:  295              },
  'POCO X6 Pro':        { 256: 250,  512:  290              },
  'POCO X6':            { 256: 200                          },
  'POCO X5 Pro':        { 256: 115                          },
  'POCO X5':            { 128: 150,  256:  175              },
  'POCO X4 Pro 5G':     { 128: 130,  256:  160              },
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
  'POCO F8 Ultra':      { 512: 450                          },
  'POCO F5 Pro':        { 256: 320                          },
  'POCO F5':            { 256: 240                          },
  'POCO F4 GT':         { 128: 240,  256:  280              },
  'POCO F4':            { 128: 195,  256:  230              },
  'POCO F3':            { 128: 130,  256:  160              },
  'POCO C65':           { 128:  85,  256:  100              },
  'POCO C55':           { 128:  75                          },
  'POCO C40':           { 64:   55,  128:   70              },
  'POCO F1':            { 64:   72,  128:   88              },

  /* ─── Honor (2020–2026) ─── */
  'Honor Magic7 Ultra':  { 512: 700                          },
  'Honor Magic7 Pro':    { 256: 540,  512:  610              },
  'Honor Magic7':        { 256: 385                          },
  'Honor 600':           { 256: 385,  512:  440              },
  'Honor 400 Pro':       { 256: 410,  512:  470              },
  'Honor 400':           { 256: 230                          },
  'Honor Magic6 Pro':    { 256: 380,  512:  440              },
  'Honor Magic6':        { 256: 280                          },
  'Honor 200 Pro':       { 256: 245,  512:  290              },
  'Honor 200':           { 256: 190                          },
  'Honor 100 Pro':       { 256: 155                          },
  'Honor 100':           { 128: 130,  256:  155              },
  'Honor X9d':           { 256: 210                          },
  'Honor X9c':           { 256: 180                          },
  'Honor X9b':           { 256: 155                          },
  'Honor X8d':           { 256: 180                          },
  'Honor X8b':           { 128: 130,  256:  155              },
  'Honor X7c':           { 128: 100                          },
  'Honor X7b':           { 128:  85                          },
  'Honor Magic5 Pro':    { 256: 260,  512:  305              },
  'Honor Magic5':        { 256: 195                          },
  'Honor 90 Pro':        { 256: 165                          },
  'Honor 90':            { 256: 140                          },
  'Honor 80 Pro':        { 256: 155                          },
  'Honor 80':            { 256: 130                          },
  'Honor X9a':           { 256: 130                          },
  'Honor X8a':           { 128:  90                          },
  'Honor X7a':           { 128:  70                          },
  'Honor X6c':           { 256:  65                          },
  'Honor X6a':           { 64:   50,  128:   60              },
  'Honor Magic4 Pro':    { 256: 195                          },
  'Honor Magic4':        { 256: 155                          },
  'Honor 70 Pro+':       { 256: 130                          },
  'Honor 70 Pro':        { 256: 115                          },
  'Honor 70':            { 128: 100,  256:  120              },
  'Honor 50 SE':         { 128:  80                          },
  'Honor X8':            { 128:  80                          },
  'Honor X7':            { 64:   65,  128:   80              },
  'Honor X6':            { 64:   55                          },
  'Honor 50 Pro':        { 256: 105                          },
  'Honor 50':            { 128:  90,  256:  110              },
  'Honor X10':           { 128:  80                          },
  'Honor 30i':           { 64:   45,  128:   55              },
  'Honor 30 Pro+':       { 256:  80                          },
  'Honor 30 Pro':        { 128:  65,  256:   80              },
  'Honor 30S':           { 128:  65                          },
  'Honor 30':            { 128:  60                          },
  'Honor 10X Lite':      { 64:   45,  128:   55              },
  'Honor 9A':            { 64:   32                          },
  'Honor 9S':            { 32:   25                          },

  /* ─── Infinix ─── */
  'Infinix GT 30 Pro':          { 256: 255                   },
  'Infinix Zero 40 5G':         { 256: 240                   },
  'Infinix Zero 30 5G':         { 256: 225                   },
  'Infinix Zero 30':            { 256: 210                   },
  'Infinix Zero 20':            { 256: 160                   },
  'Infinix Note 40 Pro+ 5G':    { 256: 215                   },
  'Infinix Note 40 Pro':        { 256: 155                   },
  'Infinix Note 40':            { 128: 135                   },
  'Infinix Note 30 Pro':        { 256: 155                   },
  'Infinix Note 30 VIP':        { 256: 145                   },
  'Infinix Note 30':            { 128: 115                   },
  'Infinix Note 12 Pro':        { 128: 105                   },
  'Infinix Note 12 VIP':        { 128: 100                   },
  'Infinix Note 12':            { 128:  90                   },
  'Infinix Note 11 Pro':        { 128:  90                   },
  'Infinix Note 11':            { 128:  75                   },
  'Infinix Hot 40 Pro':         { 256: 145                   },
  'Infinix Hot 40':             { 128: 105                   },
  'Infinix Hot 30i':            { 64:   65, 128:  80         },
  'Infinix Hot 30':             { 128:  80                   },
  'Infinix Hot 20 Pro':         { 128:  90                   },
  'Infinix Hot 20':             { 128:  75                   },
  'Infinix Hot 20i':            { 128:  65                   },
  'Infinix Hot 12 Pro':         { 128:  80                   },
  'Infinix Hot 12':             { 64:   60, 128:  75         },
  'Infinix Smart 8 Pro':        { 64:   60                   },
  'Infinix Smart 8':            { 64:   50                   },
  'Infinix Smart 7':            { 64:   45                   },
};

/* ─── Базовые цены USD (фолбек для неизвестных моделей) ─── */
const BASE_PRICES = {
  Apple:   { 64: 215, 128: 270, 256: 370, 512: 510, 1024: 660 },
  Samsung: { 64:  85, 128: 135, 256: 195, 512: 265, 1024: 370 },
  Xiaomi:  { 64:  60, 128: 110, 256: 175, 512: 235, 1024: 300 },
  Infinix: { 64:  50, 128:  80, 256: 125, 512: 180, 1024: null },
  Honor:   { 64:  55, 128:  85, 256: 140, 512: 200, 1024: null },
  Другой:  { 64:  35, 128:  55, 256:  90, 512: 130, 1024: null },
};

/* ─── Множители оценки ─── */
const COND_MULT  = { 1: 0.25, 2: 0.50, 3: 0.75, 4: 0.90, 5: 1.0 };
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
const STORAGE_LABELS = { 32: '32 ГБ', 64: '64 ГБ', 128: '128 ГБ', 256: '256 ГБ', 512: '512 ГБ', 1024: '1 ТБ', 2048: '2 ТБ' };

/* ════════════════════════════════════════════════════
   INIT LANGUAGE (reads ?lang= from URL first)
   ════════════════════════════════════════════════════ */
(function initLang() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'ru' || urlLang === 'uz') {
    state.lang = urlLang;
    localStorage.setItem('lang', urlLang);
  }
  const lang = state.lang;
  document.getElementById('langRu').classList.toggle('active', lang === 'ru');
  document.getElementById('langUz').classList.toggle('active', lang === 'uz');
  applyLang(lang);
})();

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
const TG_ADMIN = '8806584055';

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

  const brandMult = brand === 'Apple' ? 1.10 : 0.85;
  const offer = Math.round(market * 0.92 * brandMult * COND_MULT[cond] * battMult * repairMult * kitMult);
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

  const t = TRANSLATIONS[state.lang];
  const select = document.getElementById('sellModel');
  const models = SELL_MODELS[state.sell.brand] || [];
  const translateModel = m => {
    if (m === 'Другая модель') return t.model_other;
    if (m === 'Указать в комментарии') return t.model_comment;
    return m;
  };
  select.innerHTML = `<option value="">${t.model_placeholder}</option>` +
    models.map(m => `<option value="${m}">${translateModel(m)}</option>`).join('');

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
  const tl = TRANSLATIONS[state.lang];
  btn.disabled = true;
  btn.innerHTML = `<i class="ri-loader-4-line"></i> ${tl.submit_sending}`;

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
  showSuccess(tl.success_title, tl.success_desc(brand, model));
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
  const btnEl = document.getElementById('sellSubmitBtn');
  btnEl.disabled = true;
  btnEl.innerHTML = `<i class="ri-send-plane-2-line"></i> <span data-i18n="submit_btn">${TRANSLATIONS[state.lang].submit_btn}</span>`;
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
    const t = TRANSLATIONS[state.lang];
    const statusMap = {
      new:     ['status-new',     t.status_new],
      process: ['status-process', t.status_process],
      done:    ['status-done',    t.status_done],
    };
    const [cls, label] = statusMap[o.status] || statusMap.new;
    const deviceLine = `${o.device}${o.storage ? ` (${o.storage})` : ''}`;
    const condLine  = o.cond ? o.cond.split('—')[0].trim() : '';
    const extras    = [o.battery, o.repair, o.kit].filter(Boolean).join(' · ');
    const offerText = o.price ? fmt(o.price) : '—';

    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-num">${t.order_label} ${o.id}</span>
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

