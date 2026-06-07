/* ═══════════════════════════════════════════════════════
   PhoneShop TMA — Main App Logic
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
  cart:    JSON.parse(localStorage.getItem('cart') || '[]'),
  orders:  JSON.parse(localStorage.getItem('orders') || '[]'),
  sell: {
    brand:   null,
    model:   null,
    storage: null,
    cond:    3,
    name:    '',
    phone:   '',
  },
  filter:  'all',
  sort:    'popular',
  search:  '',
};

/* ─── Phone catalogue data ─── */
const PHONES = [
  { id: 1,  brand: 'apple',   name: 'iPhone 15 Pro Max', storage: '256 ГБ', color: 'Titanium', price: 129990, oldPrice: 149990, badge: 'хит',  icon: '📱', specs: { cpu: 'A17 Pro', ram: '8 ГБ', cam: '48 Мп', bat: '4422 мАч' }, desc: 'Профессиональная камерная система. Titanium корпус. USB-C. Action Button.' },
  { id: 2,  brand: 'apple',   name: 'iPhone 15 Pro',     storage: '128 ГБ', color: 'Black',    price: 99990,  oldPrice: null,   badge: null,  icon: '📱', specs: { cpu: 'A17 Pro', ram: '8 ГБ', cam: '48 Мп', bat: '3274 мАч' }, desc: 'Мощный чип A17 Pro в компактном корпусе из титана.' },
  { id: 3,  brand: 'apple',   name: 'iPhone 15',         storage: '128 ГБ', color: 'Pink',     price: 79990,  oldPrice: 89990,  badge: 'sale', icon: '📱', specs: { cpu: 'A16',     ram: '6 ГБ', cam: '48 Мп', bat: '3349 мАч' }, desc: 'Dynamic Island, USB-C, 48 Мп камера в доступном флагмане.' },
  { id: 4,  brand: 'samsung', name: 'Galaxy S24 Ultra',  storage: '256 ГБ', color: 'Black',    price: 119990, oldPrice: 129990, badge: 'хит',  icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12 ГБ', cam: '200 Мп', bat: '5000 мАч' }, desc: 'S Pen, 200 Мп камера и встроенный Galaxy AI.' },
  { id: 5,  brand: 'samsung', name: 'Galaxy S24+',       storage: '256 ГБ', color: 'Violet',   price: 89990,  oldPrice: null,   badge: 'new',  icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12 ГБ', cam: '50 Мп', bat: '4900 мАч' }, desc: 'Большой 6.7" экран Amoled с яркостью 2600 нит.' },
  { id: 6,  brand: 'samsung', name: 'Galaxy S24',        storage: '128 ГБ', color: 'Cobalt',   price: 74990,  oldPrice: 79990,  badge: null,  icon: '📱', specs: { cpu: 'Exynos 2400', ram: '8 ГБ', cam: '50 Мп', bat: '4000 мАч' }, desc: 'Компактный Galaxy S с Galaxy AI на борту.' },
  { id: 7,  brand: 'xiaomi',  name: 'Xiaomi 14 Ultra',   storage: '512 ГБ', color: 'White',    price: 89990,  oldPrice: 99990,  badge: 'sale', icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '16 ГБ', cam: '50 Мп', bat: '5300 мАч' }, desc: 'Камерная система Leica с переменной диафрагмой.' },
  { id: 8,  brand: 'xiaomi',  name: 'Xiaomi 14',         storage: '256 ГБ', color: 'Black',    price: 64990,  oldPrice: null,   badge: 'new',  icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12 ГБ', cam: '50 Мп', bat: '4610 мАч' }, desc: 'Компактный флагман с камерой Leica и MIUI 15.' },
  { id: 9,  brand: 'google',  name: 'Pixel 8 Pro',       storage: '256 ГБ', color: 'Bay',      price: 84990,  oldPrice: 94990,  badge: 'хит',  icon: '📱', specs: { cpu: 'Tensor G3', ram: '12 ГБ', cam: '50 Мп', bat: '5050 мАч' }, desc: 'Лучший AI-смартфон с Tensor G3. Чистый Android.' },
  { id: 10, brand: 'google',  name: 'Pixel 8',           storage: '128 ГБ', color: 'Hazel',    price: 59990,  oldPrice: null,   badge: null,  icon: '📱', specs: { cpu: 'Tensor G3', ram: '8 ГБ', cam: '50 Мп', bat: '4575 мАч' }, desc: 'Умная камера с ластиком Magic Eraser и Call Screen.' },
  { id: 11, brand: 'oneplus', name: 'OnePlus 12',        storage: '256 ГБ', color: 'Silky',    price: 74990,  oldPrice: 82990,  badge: 'sale', icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12 ГБ', cam: '50 Мп', bat: '5400 мАч' }, desc: 'Hasselblad камера и 100Вт зарядка. Быстрее всех.' },
  { id: 12, brand: 'oneplus', name: 'OnePlus 12R',       storage: '128 ГБ', color: 'Iron',     price: 44990,  oldPrice: 49990,  badge: null,  icon: '📱', specs: { cpu: 'Snapdragon 8 Gen 2', ram: '8 ГБ', cam: '50 Мп', bat: '5500 мАч' }, desc: 'Доступный флагман с 80Вт зарядкой и OxygenOS.' },
];

/* ─── Models per brand (for sell form) ─── */
const SELL_MODELS = {
  Apple:   ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'Старше'],
  Samsung: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A54', 'Galaxy A34', 'Другая'],
  Xiaomi:  ['Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi 13', 'Redmi Note 13 Pro', 'Redmi Note 12', 'Другая'],
  Google:  ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6a', 'Другой'],
  OnePlus: ['OnePlus 12', 'OnePlus 12R', 'OnePlus 11', 'OnePlus 10 Pro', 'Другой'],
  Другой:  ['Указать в заявке'],
};

/* ─── Base buy prices per brand (rough estimate) ─── */
const BASE_PRICES = {
  Apple:   { 64: 12000, 128: 16000, 256: 22000, 512: 30000, 1024: 40000 },
  Samsung: { 64: 8000,  128: 12000, 256: 16000, 512: 22000, 1024: 30000 },
  Xiaomi:  { 64: 5000,  128: 8000,  256: 12000, 512: 16000, 1024: 20000 },
  Google:  { 64: 8000,  128: 11000, 256: 15000, 512: 20000, 1024: null  },
  OnePlus: { 64: 6000,  128: 10000, 256: 14000, 512: 18000, 1024: null  },
  Другой:  { 64: 3000,  128: 5000,  256: 8000,  512: 10000, 1024: null  },
};

const COND_MULT  = { 1: 0.4, 2: 0.6, 3: 0.75, 4: 0.9, 5: 1.0 };
const COND_TEXT  = {
  1: 'Плохое — трещины, не всё работает',
  2: 'Удовлетворительное — заметные повреждения',
  3: 'Хорошее — небольшие царапины, полностью рабочий',
  4: 'Очень хорошее — минимальные следы использования',
  5: 'Идеальное — как новый, полный комплект',
};

/* ════════════════════════════════════════════════════
   SPLASH
   ════════════════════════════════════════════════════ */
setTimeout(() => {
  document.getElementById('splash').classList.add('fade-out');
  setTimeout(() => {
    document.getElementById('splash').remove();
    const app = document.getElementById('app');
    app.classList.add('visible');
    initSwiper();
  }, 500);
}, 1900);

/* ════════════════════════════════════════════════════
   SWIPER
   ════════════════════════════════════════════════════ */
function initSwiper() {
  new Swiper('.bannerSwiper', {
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    effect: 'slide',
    slidesPerView: 1,
    spaceBetween: 0,
  });
}

/* ════════════════════════════════════════════════════
   HEADER SCROLL EFFECT
   ════════════════════════════════════════════════════ */
const appHeader = document.getElementById('appHeader');
window.addEventListener('scroll', () => {
  appHeader.classList.toggle('scrolled', window.scrollY > 10);
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
   SEARCH
   ════════════════════════════════════════════════════ */
const searchBarWrap = document.getElementById('searchBarWrap');
const searchInput   = document.getElementById('searchInput');
const searchClear   = document.getElementById('searchClear');

document.getElementById('searchBtn').addEventListener('click', () => {
  searchBarWrap.classList.toggle('open');
  if (searchBarWrap.classList.contains('open')) searchInput.focus();
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('hidden', !state.search);
  renderProducts();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  state.search = '';
  searchClear.classList.add('hidden');
  renderProducts();
  searchInput.focus();
});

/* ════════════════════════════════════════════════════
   BRAND FILTER
   ════════════════════════════════════════════════════ */
document.getElementById('brandFilter').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#brandFilter .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.filter = chip.dataset.brand;
  renderProducts();
});

/* ════════════════════════════════════════════════════
   SORT
   ════════════════════════════════════════════════════ */
document.getElementById('sortSelect').addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts();
});

/* ════════════════════════════════════════════════════
   RENDER PRODUCTS
   ════════════════════════════════════════════════════ */
function filteredPhones() {
  let list = [...PHONES];
  if (state.filter !== 'all') list = list.filter(p => p.brand === state.filter);
  if (state.search) list = list.filter(p => p.name.toLowerCase().includes(state.search) || p.brand.includes(state.search));
  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'new':        list.sort((a, b) => (b.badge === 'new') - (a.badge === 'new')); break;
  }
  return list;
}

function renderProducts() {
  const grid   = document.getElementById('productsGrid');
  const phones = filteredPhones();

  document.getElementById('sortCount').textContent = `${phones.length} товар${plural(phones.length)}`;

  if (!phones.length) {
    grid.innerHTML = `
      <div class="col-span-2 text-center py-12" style="grid-column:1/-1">
        <div style="font-size:48px;margin-bottom:12px">🔍</div>
        <p style="color:var(--text-3);font-size:15px;font-weight:600">Ничего не найдено</p>
      </div>`;
    return;
  }

  grid.innerHTML = phones.map(p => {
    const inCart   = state.cart.find(c => c.id === p.id);
    const badgeHtml = p.badge
      ? `<div class="card-badge ${p.badge === 'new' ? 'new-badge' : p.badge === 'хит' ? 'hit-badge' : ''}">${p.badge.toUpperCase()}</div>`
      : '';
    const oldPrice = p.oldPrice
      ? `<s style="font-size:11px;color:var(--text-3);font-weight:500;display:block">${fmt(p.oldPrice)}</s>`
      : '';
    return `
      <div class="product-card" data-id="${p.id}" onclick="openProduct(${p.id})">
        ${badgeHtml}
        <div class="card-img"><i class="ri-smartphone-line"></i></div>
        <div class="card-body">
          <div class="card-brand">${p.brand}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-specs">${p.storage} · ${p.color}</div>
          <div class="card-footer">
            <div>
              ${oldPrice}
              <div class="card-price">${fmt(p.price)}</div>
            </div>
            <button class="card-add ${inCart ? 'added' : ''}"
              onclick="event.stopPropagation(); addToCart(${p.id})"
              aria-label="В корзину">
              <i class="${inCart ? 'ri-check-line' : 'ri-add-line'}"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function plural(n) {
  if (n % 10 === 1 && n % 100 !== 11) return '';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
  return 'ов';
}

function fmt(n) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

/* Initial render after splash */
setTimeout(renderProducts, 1950);

/* ════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
   ════════════════════════════════════════════════════ */
function openProduct(id) {
  const p = PHONES.find(x => x.id === id);
  if (!p) return;

  const inCart = state.cart.find(c => c.id === p.id);

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-img"><i class="ri-smartphone-line"></i></div>
    <div class="modal-brand">${p.brand.toUpperCase()}</div>
    <div class="modal-name">${p.name}</div>
    <div class="modal-price">${fmt(p.price)}</div>
    <div class="modal-specs">
      <div class="spec-item"><div class="spec-key">Процессор</div><div class="spec-val">${p.specs.cpu}</div></div>
      <div class="spec-item"><div class="spec-key">Память</div><div class="spec-val">${p.specs.ram}</div></div>
      <div class="spec-item"><div class="spec-key">Камера</div><div class="spec-val">${p.specs.cam}</div></div>
      <div class="spec-item"><div class="spec-key">Батарея</div><div class="spec-val">${p.specs.bat}</div></div>
    </div>
    <p class="modal-desc">${p.desc}</p>
    <button class="submit-btn ${inCart ? 'added' : ''}" id="modalAddBtn" onclick="addToCart(${p.id}); updateModalBtn(${p.id})">
      <i class="${inCart ? 'ri-check-line' : 'ri-shopping-cart-2-line'}"></i>
      ${inCart ? 'Уже в корзине' : 'В корзину — ' + fmt(p.price)}
    </button>
  `;

  document.getElementById('productModalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function updateModalBtn(id) {
  const btn = document.getElementById('modalAddBtn');
  if (!btn) return;
  btn.innerHTML = `<i class="ri-check-line"></i> Уже в корзине`;
  btn.classList.add('added');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('productModalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('productModalOverlay')) closeModal();
});

function closeModal() {
  document.getElementById('productModalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════════
   CART
   ════════════════════════════════════════════════════ */
function addToCart(id) {
  const phone = PHONES.find(p => p.id === id);
  if (!phone) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...phone, qty: 1 });
    tg?.HapticFeedback?.impactOccurred('light');
  }
  saveCart();
  updateCartBadge();
  renderProducts();
  toast(`${phone.name} добавлен в корзину`, 'success');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const total = state.cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function renderCart() {
  const items = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const total = document.getElementById('cartTotal');

  if (!state.cart.length) {
    empty.classList.remove('hidden');
    items.querySelectorAll('.cart-item').forEach(el => el.remove());
    total.textContent = '0 ₽';
    return;
  }

  empty.classList.add('hidden');
  items.querySelectorAll('.cart-item').forEach(el => el.remove());

  let sum = 0;
  state.cart.forEach(item => {
    sum += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="cart-item-img"><i class="ri-smartphone-line"></i></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn minus" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn plus"  onclick="changeQty(${item.id},  1)">+</button>
      </div>`;
    items.appendChild(div);
  });

  total.textContent = fmt(sum);
}

function changeQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
  renderProducts();
  if (delta < 0) tg?.HapticFeedback?.impactOccurred('light');
}

/* Cart open/close */
const cartDrawer  = document.getElementById('cartDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
drawerOverlay.addEventListener('click', closeCart);

function openCart() {
  renderCart();
  cartDrawer.classList.add('open');
  drawerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  drawerOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* Checkout */
document.getElementById('checkoutBtn').addEventListener('click', async () => {
  if (!state.cart.length) return;

  const user = tg?.initDataUnsafe?.user;
  const orderData = {
    type:   'buy',
    items:  state.cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
    total:  state.cart.reduce((s, c) => s + c.price * c.qty, 0),
    userId: user?.id || 'unknown',
    userName: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Гость',
  };

  try {
    const res = await apiPost('/api/order', orderData);
    if (res.ok) {
      const orderId = `#${Date.now().toString().slice(-6)}`;
      state.orders.unshift({ id: orderId, type: 'buy', items: orderData.items, total: orderData.total, status: 'new', date: new Date().toLocaleDateString('ru') });
      localStorage.setItem('orders', JSON.stringify(state.orders));
      state.cart = [];
      saveCart();
      updateCartBadge();
      closeCart();
      renderOrders();
      showSuccess('Заказ оформлен!', 'Наш менеджер свяжется с вами в ближайшее время.');
      tg?.HapticFeedback?.notificationOccurred('success');
    }
  } catch (err) {
    /* Offline fallback */
    const orderId = `#${Date.now().toString().slice(-6)}`;
    state.orders.unshift({ id: orderId, type: 'buy', items: orderData.items, total: orderData.total, status: 'new', date: new Date().toLocaleDateString('ru') });
    localStorage.setItem('orders', JSON.stringify(state.orders));
    state.cart = [];
    saveCart();
    updateCartBadge();
    closeCart();
    renderOrders();
    showSuccess('Заказ оформлен!', 'Мы обработаем заявку в ближайшее время.');
  }
});

/* ════════════════════════════════════════════════════
   SELL FORM
   ════════════════════════════════════════════════════ */

/* Step 1 — Brand */
document.getElementById('sellBrandGrid').addEventListener('click', e => {
  const tile = e.target.closest('.brand-tile');
  if (!tile) return;
  document.querySelectorAll('.brand-tile').forEach(t => t.classList.remove('selected'));
  tile.classList.add('selected');
  state.sell.brand = tile.dataset.brand;

  /* Populate models */
  const select = document.getElementById('sellModel');
  const models = SELL_MODELS[state.sell.brand] || [];
  select.innerHTML = `<option value="">-- Выберите модель --</option>` +
    models.map(m => `<option value="${m}">${m}</option>`).join('');

  document.getElementById('step2').classList.add('active');
  document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  updateSellProgress();
});

/* Step 2 — Model */
document.getElementById('sellModel').addEventListener('change', e => {
  state.sell.model = e.target.value;
  if (state.sell.model) {
    document.getElementById('step3').classList.add('active');
    document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  updateSellProgress();
});

/* Step 3 — Storage */
document.getElementById('storageChips').addEventListener('click', e => {
  const chip = e.target.closest('.storage-chip');
  if (!chip) return;
  document.querySelectorAll('.storage-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  state.sell.storage = parseInt(chip.dataset.gb, 10);
  document.getElementById('step4').classList.add('active');
  document.getElementById('step4').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  updateSellProgress();
});

/* Step 4 — Condition Slider */
const condSlider = document.getElementById('conditionSlider');
const sliderFill = document.getElementById('sliderFill');
const condDesc   = document.getElementById('conditionDesc').querySelector('span');

condSlider.addEventListener('input', () => {
  const val = parseInt(condSlider.value, 10);
  state.sell.cond = val;
  updateSlider(val);
  updateSellProgress();
});

function updateSlider(val) {
  const pct = ((val - 1) / 4) * 100;
  sliderFill.style.width = pct + '%';
  document.querySelectorAll('.cond-badge').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.val) === val);
  });
  condDesc.textContent = COND_TEXT[val];
}

updateSlider(3);

/* Step 5 — Contact */
const sellName  = document.getElementById('sellName');
const sellPhone = document.getElementById('sellPhone');

[sellName, sellPhone].forEach(el => {
  el.addEventListener('input', () => {
    /* Autofill from Telegram user */
    state.sell.name  = sellName.value.trim();
    state.sell.phone = sellPhone.value.trim();
    updateSellProgress();

    if (!document.getElementById('step5').classList.contains('active')) {
      document.getElementById('step5').classList.add('active');
    }
  });
});

/* After step4 show step5 */
condSlider.addEventListener('change', () => {
  document.getElementById('step5').classList.add('active');
  document.getElementById('step5').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* Pre-fill name from Telegram */
(function prefillUser() {
  const user = tg?.initDataUnsafe?.user;
  if (user) {
    sellName.value = `${user.first_name} ${user.last_name || ''}`.trim();
    state.sell.name = sellName.value;
  }
})();

function updateSellProgress() {
  const { brand, model, storage, cond, name, phone } = state.sell;
  const priceBlock = document.getElementById('priceEstimator');
  const submitBtn  = document.getElementById('sellSubmitBtn');

  /* Estimate */
  if (brand && storage) {
    const base = BASE_PRICES[brand]?.[storage];
    if (base) {
      const est = Math.round(base * COND_MULT[cond] / 100) * 100;
      document.getElementById('estPrice').textContent = fmt(est);
      priceBlock.classList.add('visible');
    }
  }

  const ready = brand && model && storage && name && phone.length >= 6;
  submitBtn.disabled = !ready;
}

/* Submit sell form */
document.getElementById('sellForm').addEventListener('submit', async e => {
  e.preventDefault();
  const { brand, model, storage, cond, name, phone } = state.sell;
  const base = BASE_PRICES[brand]?.[storage] || 0;
  const est  = Math.round(base * COND_MULT[cond] / 100) * 100;

  const user = tg?.initDataUnsafe?.user;
  const data = {
    type: 'sell',
    brand, model, storage: `${storage} ГБ`,
    condition: COND_TEXT[cond],
    estimatedPrice: est,
    name, phone,
    userId:   user?.id       || 'unknown',
    userName: user?.username || name,
  };

  const btn = document.getElementById('sellSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ri-loader-4-line"></i> Отправляем...';

  try {
    await apiPost('/api/sell', data);
  } catch (_) { /* offline ok */ }

  const orderId = `#S${Date.now().toString().slice(-6)}`;
  state.orders.unshift({ id: orderId, type: 'sell', device: `${brand} ${model}`, cond: COND_TEXT[cond], price: est, status: 'new', date: new Date().toLocaleDateString('ru') });
  localStorage.setItem('orders', JSON.stringify(state.orders));
  renderOrders();

  showSuccess('Заявка на скупку отправлена!', `Мы оценим ваш ${brand} ${model} и свяжемся с вами в ближайшее время.`);
  tg?.HapticFeedback?.notificationOccurred('success');

  /* Reset */
  setTimeout(resetSellForm, 800);
});

function resetSellForm() {
  state.sell = { brand: null, model: null, storage: null, cond: 3, name: state.sell.name, phone: state.sell.phone };
  document.querySelectorAll('.brand-tile').forEach(t => t.classList.remove('selected'));
  document.querySelectorAll('.storage-chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('sellModel').innerHTML = '<option value="">-- Выберите модель --</option>';
  condSlider.value = 3;
  updateSlider(3);
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step3').classList.remove('active');
  document.getElementById('step4').classList.remove('active');
  document.getElementById('step5').classList.remove('active');
  document.getElementById('priceEstimator').classList.remove('visible');
  document.getElementById('sellSubmitBtn').disabled = true;
  document.getElementById('sellSubmitBtn').innerHTML = '<i class="ri-send-plane-2-line"></i> Отправить заявку';
}

/* ════════════════════════════════════════════════════
   ORDERS TAB
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
    const statusMap = { new: ['status-new', 'Новый'], process: ['status-process', 'В работе'], done: ['status-done', 'Завершён'] };
    const [cls, label] = statusMap[o.status] || statusMap.new;

    if (o.type === 'buy') {
      const items = o.items.map(i => `${i.name} ×${i.qty}`).join(', ');
      return `
        <div class="order-card">
          <div class="order-header">
            <span class="order-num">Заказ ${o.id}</span>
            <span class="order-status ${cls}">${label}</span>
          </div>
          <div class="order-items">${items}</div>
          <div class="order-total">${fmt(o.total)}</div>
          <div style="font-size:12px;color:var(--text-3);margin-top:4px">${o.date}</div>
        </div>`;
    } else {
      return `
        <div class="order-card">
          <div class="order-header">
            <span class="order-num">Скупка ${o.id}</span>
            <span class="order-status ${cls}">${label}</span>
          </div>
          <div class="order-items">${o.device} · ${o.cond.split('—')[0].trim()}</div>
          <div class="order-total">≈ ${fmt(o.price)}</div>
          <div style="font-size:12px;color:var(--text-3);margin-top:4px">${o.date}</div>
        </div>`;
    }
  }).join('');
}

renderOrders();

/* ════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ════════════════════════════════════════════════════ */
function toast(msg, type = 'info', duration = 3000) {
  const icons = { success: 'ri-checkbox-circle-fill', error: 'ri-error-warning-fill', info: 'ri-information-fill' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="toast-icon ${icons[type]}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ════════════════════════════════════════════════════
   SUCCESS OVERLAY
   ════════════════════════════════════════════════════ */
function showSuccess(title, desc) {
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successDesc').textContent  = desc;
  document.getElementById('successOverlay').classList.remove('hidden');
}

document.getElementById('successClose').addEventListener('click', () => {
  document.getElementById('successOverlay').classList.add('hidden');
});

/* ════════════════════════════════════════════════════
   API HELPER
   ════════════════════════════════════════════════════ */
async function apiPost(path, data) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res;
}

/* ════════════════════════════════════════════════════
   INIT CART BADGE
   ════════════════════════════════════════════════════ */
updateCartBadge();
