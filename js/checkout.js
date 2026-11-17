/* Demo checkout: saves the order in localStorage and clears the cart. */
(function () {
  'use strict';

  const ORDERS_KEY = 'homeo_orders';

  function renderSummary() {
    const host = document.getElementById('checkout-summary');
    if (!host) return;
    const t = window.Cart.totals();
    if (!t.count) {
      host.innerHTML = '<h3>Order Summary</h3><p class="muted">Your cart is empty.</p>' +
        '<a href="shop.html" class="btn btn-outline btn-block">Browse Products</a>';
      const submit = document.getElementById('place-order');
      if (submit) submit.disabled = true;
      return;
    }
    const esc = window.Data.escapeHtml;
    host.innerHTML = '<h3>Order Summary</h3>' +
      window.Cart.items().map(function (item) {
        return '<div class="summary-row"><span>' + esc(item.product.name) + ' × ' + item.qty + '</span>' +
          '<span>' + window.Data.formatPrice(item.subtotal) + '</span></div>';
      }).join('') +
      '<div class="summary-row"><span>Shipping</span><span>' + (t.shipping ? window.Data.formatPrice(t.shipping) : 'FREE') + '</span></div>' +
      '<div class="summary-row total"><span>Total</span><span>' + window.Data.formatPrice(t.total) + '</span></div>' +
      '<div class="free-ship-note">Demo checkout — no real payment will be collected.</div>';
  }

  function initCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    renderSummary();
    document.addEventListener('cart:changed', renderSummary);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const items = window.Cart.items();
      if (!items.length) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const totals = window.Cart.totals();
      let orders = [];
      try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (err) { orders = []; }
      const order = {
        id: 'YB' + String(Date.now()).slice(-8),
        created_at: new Date().toISOString(),
        customer: data,
        items: items.map(function (item) {
          return { product_id: item.product.id, name: item.product.name, qty: item.qty, price: item.product.price };
        }),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        status: 'pending'
      };
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      window.Cart.clear();
      window.location.href = 'order-success.html?id=' + encodeURIComponent(order.id);
    });
  }

  function initSuccess() {
    const root = document.getElementById('success-root');
    if (!root) return;
    const id = new URLSearchParams(window.location.search).get('id');
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch (err) { orders = []; }
    const order = (id ? orders.find(function (o) { return o.id === id; }) : null) || orders[0];
    if (!order) {
      root.innerHTML = '<div class="empty-state"><h2>No order found</h2><p>Place an order first to see this page.</p>' +
        '<a href="shop.html" class="btn btn-primary">Start Shopping</a></div>';
      return;
    }
    const esc = window.Data.escapeHtml;
    document.getElementById('success-id').textContent = order.id;
    document.getElementById('success-name').textContent = order.customer.name;
    document.getElementById('success-email').textContent = order.customer.email;
    document.getElementById('success-total').textContent = window.Data.formatPrice(order.total);
    document.getElementById('success-date').textContent =
      new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    document.getElementById('success-items').innerHTML = order.items.map(function (item) {
      return '<div class="summary-row"><span>' + esc(item.name) + ' × ' + item.qty + '</span>' +
        '<span>' + window.Data.formatPrice(item.price * item.qty) + '</span></div>';
    }).join('');
  }

  window.Data.load().then(function () {
    if (document.body.dataset.page === 'checkout') initCheckout();
    else if (document.body.dataset.page === 'order-success') initSuccess();
  });
})();
