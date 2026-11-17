/* Demo admin panel — product CRUD via localStorage overrides. */
(function () {
  'use strict';

  const PRODUCT_KEY = 'homeo_products_override';
  const FIELDS = ['name', 'slug', 'category', 'price', 'old_price', 'pack_size', 'potency', 'image',
    'stock', 'rating', 'review_count', 'expiry', 'created_at', 'description', 'directions'];

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (err) { return []; }
  }

  function saveProducts(products) {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    return window.Data.reload();
  }

  function renderStats() {
    const products = window.Data.products();
    const orders = readStore('homeo_orders');
    const messages = readStore('homeo_messages').length + readStore('homeo_consultations').length;
    const revenue = orders.reduce(function (sum, order) { return sum + Number(order.total || 0); }, 0);
    const stats = [
      { label: 'Products', value: products.length, icon: '📦' },
      { label: 'Orders', value: orders.length, icon: '🧾' },
      { label: 'Revenue (demo)', value: '₹' + revenue.toLocaleString('en-IN'), icon: '💰' },
      { label: 'Messages', value: messages, icon: '✉️' }
    ];
    document.getElementById('admin-stats').innerHTML = stats.map(function (s) {
      return '<div class="admin-stat"><span class="icon">' + s.icon + '</span>' +
        '<div class="label">' + s.label + '</div><div class="value">' + s.value + '</div></div>';
    }).join('');
  }

  function renderProducts() {
    const host = document.getElementById('admin-products-body');
    if (!host) return;
    const q = (document.getElementById('admin-product-search')?.value || '').trim().toLowerCase();
    const list = window.Data.products().filter(function (p) {
      return !q || (p.name + ' ' + p.category).toLowerCase().indexOf(q) !== -1;
    });
    host.innerHTML = list.length ? list.map(function (p) {
      return '<tr>' +
        '<td><img src="images/products/' + window.Data.escapeHtml(p.image) + '" alt=""></td>' +
        '<td><strong>' + window.Data.escapeHtml(p.name) + '</strong><br><small class="muted">' + window.Data.escapeHtml(p.slug) + '</small></td>' +
        '<td>' + window.Data.escapeHtml(window.Data.categoryName(p.category)) + '</td>' +
        '<td>' + window.Data.formatPrice(p.price) + '</td>' +
        '<td>' + Number(p.stock) + '</td>' +
        '<td>' + (p.is_featured ? '<span class="badge badge-info">Featured</span>' : '<span class="badge badge-ok">Active</span>') + '</td>' +
        '<td><div class="admin-actions">' +
          '<button type="button" data-edit="' + p.id + '">Edit</button>' +
          '<button type="button" class="danger" data-delete="' + p.id + '">Delete</button>' +
        '</div></td>' +
      '</tr>';
    }).join('') : '<tr><td colspan="7" class="admin-empty">No products match your search.</td></tr>';
    renderStats();
  }

  function fillForm(product) {
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('product-id').value = product ? product.id : '';
    FIELDS.forEach(function (field) {
      const el = form.elements[field];
      if (!el) return;
      if (el.type === 'checkbox') el.checked = Boolean(product && product[field]);
      else el.value = product && product[field] != null ? product[field] : '';
    });
    form.elements['ailments'].value = product && product.ailments ? product.ailments.join(', ') : '';
    document.getElementById('product-form-title').textContent = product ? 'Edit product' : 'Add a new product';
    document.querySelector('[data-tab="products"]').click();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function initForm() {
    const form = document.getElementById('product-form');
    const message = document.getElementById('product-form-message');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const id = document.getElementById('product-id').value;
      const products = window.Data.products().map(function (p) { return Object.assign({}, p); });
      const existing = id ? products.find(function (p) { return Number(p.id) === Number(id); }) : null;
      const target = existing || {
        id: Math.max(0, ...products.map(function (p) { return Number(p.id); })) + 1,
        image: 'product-1.svg', rating: 4.5, review_count: 0, created_at: new Date().toISOString().slice(0, 10)
      };
      FIELDS.forEach(function (field) {
        const el = form.elements[field];
        if (!el) return;
        if (el.type === 'checkbox') target[field] = el.checked;
        else if (['price', 'old_price', 'stock', 'rating', 'review_count'].indexOf(field) !== -1) target[field] = Number(el.value) || 0;
        else target[field] = el.value.trim();
      });
      target.ailments = form.elements['ailments'].value.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      if (existing) products[products.indexOf(existing)] = target;
      else products.unshift(target);

      saveProducts(products).then(function () {
        renderProducts();
        message.className = 'alert alert-success';
        message.textContent = existing ? 'Product updated successfully.' : 'Product added successfully.';
        fillForm(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.getElementById('product-reset')?.addEventListener('click', function () {
      if (!window.confirm('Discard all admin edits and restore the original demo catalogue?')) return;
      localStorage.removeItem(PRODUCT_KEY);
      window.Data.reload().then(function () {
        renderProducts();
        fillForm(null);
        message.className = 'alert alert-info';
        message.textContent = 'Catalogue restored to the original demo data.';
      });
    });
  }

  function renderOrders() {
    const host = document.getElementById('admin-orders-body');
    if (!host) return;
    const orders = readStore('homeo_orders');
    host.innerHTML = orders.length ? orders.map(function (o) {
      return '<tr><td><strong>' + window.Data.escapeHtml(o.id) + '</strong></td>' +
        '<td>' + window.Data.escapeHtml(o.customer.name) + '<br><small class="muted">' + window.Data.escapeHtml(o.customer.email) + '</small></td>' +
        '<td>' + o.items.length + ' item(s)</td>' +
        '<td>' + window.Data.formatPrice(o.total) + '</td>' +
        '<td><span class="badge badge-warn">' + window.Data.escapeHtml(o.status) + '</span></td>' +
        '<td>' + new Date(o.created_at).toLocaleDateString('en-IN') + '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="admin-empty">No demo orders yet.</td></tr>';
  }

  function renderMessages() {
    const host = document.getElementById('admin-messages-body');
    if (!host) return;
    const rows = readStore('homeo_messages').map(function (m) {
      return Object.assign({ type: 'Contact form' }, m);
    }).concat(readStore('homeo_consultations').map(function (m) {
      return Object.assign({ type: 'Consultation' }, m);
    }));
    host.innerHTML = rows.length ? rows.map(function (m) {
      return '<tr><td><span class="badge badge-info">' + window.Data.escapeHtml(m.type) + '</span></td>' +
        '<td>' + window.Data.escapeHtml(m.name) + '</td>' +
        '<td>' + window.Data.escapeHtml(m.email || '—') + '<br><small class="muted">' + window.Data.escapeHtml(m.phone || '') + '</small></td>' +
        '<td>' + window.Data.escapeHtml(m.message || m.concern || '') + '</td>' +
        '<td>' + (m.submitted_at ? new Date(m.submitted_at).toLocaleDateString('en-IN') : '—') + '</td></tr>';
    }).join('') : '<tr><td colspan="5" class="admin-empty">No messages yet.</td></tr>';
  }

  function initAdmin() {
    if (!document.getElementById('admin-stats')) return;

    const categorySelect = document.querySelector('#product-form select[name="category"]');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select category</option>' +
        window.Data.categories().map(function (cat) {
          return '<option value="' + window.Data.escapeHtml(cat.slug) + '">' + window.Data.escapeHtml(cat.name) + '</option>';
        }).join('');
    }
    document.getElementById('new-product')?.addEventListener('click', function () { fillForm(null); });
    document.getElementById('clear-product-form')?.addEventListener('click', function () { fillForm(null); });
    document.querySelector('[data-tab-jump="products"]')?.addEventListener('click', function () {
      document.querySelector('[data-tab="products"]').click();
    });

    document.querySelectorAll('.admin-nav button').forEach(function (button) {
      button.addEventListener('click', function () {
        const tab = button.dataset.tab;
        document.querySelectorAll('.admin-nav button').forEach(function (b) { b.classList.toggle('active', b === button); });
        document.querySelectorAll('.admin-tab').forEach(function (panel) {
          panel.hidden = panel.id !== 'admin-' + tab;
        });
        if (tab === 'products') renderProducts();
        if (tab === 'orders') renderOrders();
        if (tab === 'messages') renderMessages();
        if (tab === 'dashboard') renderStats();
      });
    });

    document.getElementById('admin-product-search')?.addEventListener('input', renderProducts);
    document.getElementById('admin-products-body')?.addEventListener('click', function (event) {
      const edit = event.target.closest('[data-edit]');
      const del = event.target.closest('[data-delete]');
      if (edit) {
        const product = window.Data.productById(Number(edit.dataset.edit));
        if (product) fillForm(product);
      }
      if (del) {
        const product = window.Data.productById(Number(del.dataset.delete));
        if (!product || !window.confirm('Delete "' + product.name + '" from the catalogue?')) return;
        saveProducts(window.Data.products().filter(function (p) { return p.id !== product.id; })).then(renderProducts);
      }
    });

    initForm();
    renderProducts();
    renderOrders();
    renderMessages();
  }

  window.Data.load().then(function () {
    if (document.body.dataset.page === 'admin') initAdmin();
  });
})();
