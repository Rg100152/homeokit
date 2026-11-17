/* localStorage-based demo cart. No backend required. */
(function () {
  'use strict';

  const KEY = 'homeo_cart';
  const FREE_SHIPPING_ABOVE = 499;
  const SHIPPING_FEE = 49;
  const cartList = document.getElementById('cart-items');

  window.UI = window.UI || {};

  window.UI.flashButton = function (button, text) {
    if (!button) return;
    const original = button.dataset.originalText || button.innerHTML;
    button.dataset.originalText = original;
    button.classList.add('is-added');
    button.textContent = text || '✔ Added!';
    window.setTimeout(function () {
      button.classList.remove('is-added');
      button.innerHTML = original;
    }, 1400);
  };

  function get() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    } catch (err) {
      return {};
    }
  }

  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateBadges();
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: count() } }));
  }

  function count() {
    return Object.values(get()).reduce(function (sum, qty) { return sum + Number(qty); }, 0);
  }

  function add(id, qty) {
    const product = window.Data.productById(id);
    if (!product) return false;
    const cart = get();
    const next = (Number(cart[id]) || 0) + (Number(qty) || 1);
    if (next > Number(product.stock || 999)) return false;
    cart[id] = next;
    save(cart);
    return true;
  }

  function update(id, qty) {
    const cart = get();
    const product = window.Data.productById(id);
    const value = Math.max(0, Math.min(Number(qty) || 0, product ? Number(product.stock || 999) : 99));
    if (value === 0) delete cart[id];
    else cart[id] = value;
    save(cart);
  }

  function remove(id) {
    const cart = get();
    delete cart[id];
    save(cart);
  }

  function clear() { save({}); }

  function items() {
    return Object.keys(get()).map(function (id) {
      const product = window.Data.productById(id);
      const qty = Number(get()[id]);
      if (!product || !qty) return null;
      return { product: product, qty: qty, subtotal: product.price * qty };
    }).filter(Boolean);
  }

  function totals() {
    const subtotal = items().reduce(function (sum, item) { return sum + item.subtotal; }, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping, count: count() };
  }

  function updateBadges() {
    const value = String(count());
    document.querySelectorAll('#cart-count').forEach(function (el) {
      if (el.textContent !== value) {
        el.textContent = value;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    });
  }

  function renderCartPage() {
    const list = cartList;
    if (!list) return;
    const summary = document.getElementById('cart-summary');
    const empty = document.getElementById('cart-empty');
    const content = document.getElementById('cart-content');
    const cartItems = items();

    if (!cartItems.length) {
      if (empty) empty.hidden = false;
      if (content) content.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (content) content.hidden = false;

    const esc = window.Data.escapeHtml;
    list.innerHTML = cartItems.map(function (item) {
      const p = item.product;
      return '<div class="cart-item">' +
        '<a href="product.html?slug=' + encodeURIComponent(p.slug) + '">' +
          '<img src="images/products/' + esc(p.image) + '" alt="' + esc(p.name) + '">' +
        '</a>' +
        '<div>' +
          '<h3><a href="product.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a></h3>' +
          '<div class="meta">Pack: ' + esc(p.pack_size) + ' · Potency: ' + esc(p.potency) + '</div>' +
          '<div class="cart-item-bottom">' +
            '<span class="price">' + window.Data.formatPrice(item.subtotal) + '</span>' +
            '<div class="qty-control">' +
              '<button type="button" data-action="dec" data-id="' + p.id + '" aria-label="Decrease quantity">−</button>' +
              '<input type="text" value="' + item.qty + '" readonly aria-label="Quantity">' +
              '<button type="button" data-action="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="link-danger" data-action="remove" data-id="' + p.id + '">Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const t = totals();
    if (summary) {
      summary.innerHTML = '<h3>Order Summary</h3>' +
        '<div class="summary-row"><span>Subtotal (' + t.count + ' items)</span><strong>' + window.Data.formatPrice(t.subtotal) + '</strong></div>' +
        '<div class="summary-row"><span>Shipping</span><span>' + (t.shipping ? window.Data.formatPrice(t.shipping) : 'FREE') + '</span></div>' +
        '<div class="summary-row total"><span>Total</span><span>' + window.Data.formatPrice(t.total) + '</span></div>' +
        (t.subtotal < FREE_SHIPPING_ABOVE
          ? '<div class="free-ship-note">Add ' + window.Data.formatPrice(FREE_SHIPPING_ABOVE - t.subtotal) + ' more for free shipping.</div>'
          : '<div class="free-ship-note">🎉 You have unlocked free shipping!</div>') +
        '<a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>' +
        '<a href="shop.html" class="btn btn-ghost btn-block">Continue Shopping</a>';
    }
  }

  if (cartList) {
    cartList.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (button.dataset.action === 'inc') update(id, (get()[id] || 0) + 1);
      if (button.dataset.action === 'dec') update(id, (get()[id] || 0) - 1);
      if (button.dataset.action === 'remove') remove(id);
      renderCartPage();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    window.Data.load().then(renderCartPage);
  });

  document.addEventListener('cart:changed', function () {
    if (document.getElementById('cart-items')) renderCartPage();
  });

  window.Cart = {
    get: get,
    add: add,
    update: update,
    remove: remove,
    clear: clear,
    count: count,
    items: items,
    totals: totals,
    updateBadges: updateBadges,
    renderCartPage: renderCartPage,
    FREE_SHIPPING_ABOVE: FREE_SHIPPING_ABOVE
  };
})();
