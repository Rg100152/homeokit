/* Homepage widgets, shop filtering/pagination and product detail rendering. */
(function () {
  'use strict';

  const esc = function (value) { return window.Data.escapeHtml(value); };
  const money = function (value) { return window.Data.formatPrice(value); };

  function productCard(p) {
    const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
    return '<article class="product-card">' +
      '<div class="product-image">' +
        '<a href="product.html?slug=' + encodeURIComponent(p.slug) + '">' +
          '<img src="images/products/' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '</a>' +
        (discount > 0 ? '<span class="discount-badge">' + discount + '% OFF</span>' : '') +
      '</div>' +
      '<div class="product-body">' +
        '<span class="product-cat">' + esc(window.Data.categoryName(p.category)) + '</span>' +
        '<h3 class="product-title"><a href="product.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a></h3>' +
        '<div class="rating"><span class="stars">' + window.Data.ratingStars(p.rating) + '</span>' +
          '<span>' + Number(p.rating).toFixed(1) + ' (' + p.review_count + ')</span></div>' +
        '<div class="price-row"><span class="price">' + money(p.price) + '</span>' +
          (p.old_price ? '<span class="old-price">' + money(p.old_price) + '</span>' : '') + '</div>' +
        '<div class="product-meta">Pack: ' + esc(p.pack_size) + '</div>' +
        '<div class="card-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" data-add-to-cart="' + p.id + '">Add to Cart</button>' +
          '<a class="btn btn-outline btn-sm" href="product.html?slug=' + encodeURIComponent(p.slug) + '">View</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function initHome() {
    const categoryGrid = document.getElementById('category-grid');
    if (categoryGrid) {
      categoryGrid.innerHTML = window.Data.categories().map(function (cat) {
        return '<a class="category-card" href="shop.html?category=' + encodeURIComponent(cat.slug) + '">' +
          '<div class="category-icon" aria-hidden="true">' + cat.icon + '</div>' +
          '<h3>' + esc(cat.name) + '</h3><p>' + esc(cat.description) + '</p>' +
        '</a>';
      }).join('');
    }
    const featured = document.getElementById('featured-grid');
    if (featured) {
      const list = window.Data.products().filter(function (p) { return p.is_featured; }).slice(0, 8);
      featured.innerHTML = (list.length ? list : window.Data.products().slice(0, 8)).map(productCard).join('');
    }
  }

  /* ----------------------------- Shop page ----------------------------- */
  const PER_PAGE = 9;
  const state = { q: '', category: '', ailments: [], max: 300, sort: 'popular', page: 1 };

  function allAilments() {
    const set = new Set();
    window.Data.products().forEach(function (p) {
      (p.ailments || []).forEach(function (a) { set.add(a); });
    });
    return Array.from(set).sort();
  }

  function buildFilters() {
    const cats = window.Data.categories().map(function (cat) {
      const n = window.Data.products().filter(function (p) { return p.category === cat.slug; }).length;
      return '<li><label class="filter-option">' +
        '<input type="checkbox" data-filter="category" value="' + esc(cat.slug) + '">' +
        '<span>' + esc(cat.name) + '</span><span class="count">' + n + '</span></label></li>';
    }).join('');

    const ailments = allAilments().map(function (a) {
      return '<li><label class="filter-option">' +
        '<input type="checkbox" data-filter="ailment" value="' + esc(a) + '">' +
        '<span>' + esc(a.charAt(0).toUpperCase() + a.slice(1)) + '</span></label></li>';
    }).join('');

    return '<div class="filter-head"><h3>Filters</h3>' +
        '<button type="button" class="filter-reset">Reset all</button></div>' +
      '<div class="filter-block"><div class="filter-title">Category</div>' +
        '<ul class="filter-list">' + cats + '</ul></div>' +
      '<div class="filter-block"><div class="filter-title">Shop by Ailment</div>' +
        '<ul class="filter-list">' + ailments + '</ul></div>' +
      '<div class="filter-block"><div class="filter-title">Price</div>' +
        '<input class="price-range" type="range" min="100" max="300" step="10" data-filter="price" aria-label="Maximum price">' +
        '<div class="price-value"><span>₹100</span><strong class="price-label">Up to ₹300</strong></div></div>';
  }

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    state.category = params.get('category') || '';
    state.ailments = params.getAll('ailment');
    state.max = Number(params.get('max')) || 300;
    state.sort = params.get('sort') || 'popular';
    state.page = Math.max(1, Number(params.get('page')) || 1);
  }

  function writeUrl() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    state.ailments.forEach(function (a) { params.append('ailment', a); });
    if (state.max < 300) params.set('max', String(state.max));
    if (state.sort !== 'popular') params.set('sort', state.sort);
    if (state.page > 1) params.set('page', String(state.page));
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  }

  function syncControls() {
    document.querySelectorAll('[data-filter="category"]').forEach(function (el) {
      el.checked = el.value === state.category;
    });
    document.querySelectorAll('[data-filter="ailment"]').forEach(function (el) {
      el.checked = state.ailments.indexOf(el.value) !== -1;
    });
    document.querySelectorAll('[data-filter="price"]').forEach(function (el) { el.value = state.max; });
    document.querySelectorAll('.price-label').forEach(function (el) { el.textContent = 'Up to ' + money(state.max); });
    document.querySelectorAll('[data-filter="sort"]').forEach(function (el) { el.value = state.sort; });
    const box = document.getElementById('shop-search-input');
    if (box && box.value !== state.q) box.value = state.q;
  }

  function filteredProducts() {
    const q = state.q.trim().toLowerCase();
    let list = window.Data.products().filter(function (p) {
      if (state.category && p.category !== state.category) return false;
      if (p.price > state.max) return false;
      if (state.ailments.length && !state.ailments.some(function (a) { return (p.ailments || []).indexOf(a) !== -1; })) return false;
      if (q) {
        const haystack = [p.name, p.description, window.Data.categoryName(p.category), (p.ailments || []).join(' ')].join(' ').toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (state.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'newest') list.sort(function (a, b) { return b.created_at.localeCompare(a.created_at); });
    else if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else list.sort(function (a, b) { return (b.rating * b.review_count) - (a.rating * a.review_count); });
    return list;
  }

  function renderChips() {
    const host = document.getElementById('active-filters');
    if (!host) return;
    const chips = [];
    if (state.q) chips.push({ key: 'q', label: 'Search: ' + state.q });
    if (state.category) chips.push({ key: 'category', label: window.Data.categoryName(state.category) });
    state.ailments.forEach(function (a) { chips.push({ key: 'ailment:' + a, label: a }); });
    if (state.max < 300) chips.push({ key: 'max', label: 'Under ' + money(state.max) });
    host.innerHTML = chips.map(function (chip) {
      return '<span class="active-chip">' + esc(chip.label) +
        '<button type="button" data-remove-chip="' + esc(chip.key) + '" aria-label="Remove filter">×</button></span>';
    }).join('');
  }

  function renderPagination(total, pages) {
    const host = document.getElementById('pagination');
    if (!host) return;
    if (pages <= 1) { host.innerHTML = ''; return; }
    let html = '<button class="page-btn" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>‹</button>';
    for (let i = 1; i <= pages; i++) {
      html += '<button class="page-btn' + (i === state.page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button class="page-btn" data-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + '>›</button>';
    host.innerHTML = html;
  }

  function renderShop() {
    const list = filteredProducts();
    const pages = Math.ceil(list.length / PER_PAGE);
    if (state.page > pages) state.page = Math.max(1, pages);
    const start = (state.page - 1) * PER_PAGE;
    const visible = list.slice(start, start + PER_PAGE);

    const grid = document.getElementById('product-grid');
    if (grid) {
      grid.innerHTML = visible.length
        ? visible.map(productCard).join('')
        : '<div class="no-results" style="grid-column:1/-1"><h3>No products found</h3>' +
          '<p>Try a different search term or clear a few filters.</p>' +
          '<button type="button" class="btn btn-outline" id="reset-empty">Clear filters</button></div>';
    }
    const count = document.getElementById('result-count');
    if (count) {
      const from = list.length ? start + 1 : 0;
      const to = Math.min(start + PER_PAGE, list.length);
      count.innerHTML = 'Showing <strong>' + from + '–' + to + '</strong> of <strong>' + list.length + '</strong> products';
    }
    renderChips();
    renderPagination(list.length, pages);
    syncControls();
    writeUrl();
  }

  function initShop() {
    readUrl();
    document.querySelectorAll('.filter-host').forEach(function (host) { host.innerHTML = buildFilters(); });

    const sortHost = document.getElementById('sort-host');
    if (sortHost) {
      sortHost.innerHTML = '<select class="sort-select" data-filter="sort" aria-label="Sort products">' +
        '<option value="popular">Sort: Popularity</option>' +
        '<option value="price-asc">Sort: Price (Low to High)</option>' +
        '<option value="price-desc">Sort: Price (High to Low)</option>' +
        '<option value="newest">Sort: Newest First</option>' +
        '<option value="name">Sort: Name (A–Z)</option>' +
      '</select>';
    }

    document.addEventListener('change', function (event) {
      const el = event.target;
      if (el.matches('[data-filter="category"]')) {
        state.category = el.checked ? el.value : '';
        state.page = 1;
      } else if (el.matches('[data-filter="ailment"]')) {
        state.ailments = Array.from(document.querySelectorAll('[data-filter="ailment"]:checked')).map(function (i) { return i.value; });
        state.page = 1;
      } else if (el.matches('[data-filter="price"]')) {
        state.max = Number(el.value);
        state.page = 1;
      } else if (el.matches('[data-filter="sort"]')) {
        state.sort = el.value;
        state.page = 1;
      } else return;
      renderShop();
    });

    document.addEventListener('click', function (event) {
      const chip = event.target.closest('[data-remove-chip]');
      if (chip) {
        const key = chip.dataset.removeChip;
        if (key === 'q') state.q = '';
        else if (key === 'category') state.category = '';
        else if (key === 'max') state.max = 300;
        else if (key.indexOf('ailment:') === 0) state.ailments = state.ailments.filter(function (a) { return a !== key.slice(8); });
        state.page = 1;
        renderShop();
      }
      if (event.target.closest('.filter-reset, #reset-empty')) {
        state.q = ''; state.category = ''; state.ailments = []; state.max = 300; state.page = 1;
        renderShop();
      }
      const pageBtn = event.target.closest('[data-page]');
      if (pageBtn && !pageBtn.disabled) {
        state.page = Number(pageBtn.dataset.page);
        renderShop();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (event.target.closest('#filter-toggle')) {
        document.getElementById('filter-drawer')?.classList.add('open');
        document.getElementById('drawer-backdrop')?.classList.add('show');
      }
      if (event.target.closest('#drawer-close, #drawer-backdrop, #drawer-apply')) {
        document.getElementById('filter-drawer')?.classList.remove('open');
        document.getElementById('drawer-backdrop')?.classList.remove('show');
      }
    });

    document.getElementById('shop-search')?.addEventListener('submit', function (event) {
      event.preventDefault();
      state.q = document.getElementById('shop-search-input').value.trim();
      state.page = 1;
      renderShop();
    });

    renderShop();
  }

  /* -------------------------- Product detail -------------------------- */
  function initProduct() {
    const root = document.getElementById('product-root');
    if (!root) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const product = slug ? window.Data.productBySlug(slug) : null;
    if (!product) {
      document.getElementById('product-content').innerHTML =
        '<div class="empty-state"><div class="icon">🔎</div><h2>Product not found</h2>' +
        '<p>Please browse our full catalogue to find what you need.</p>' +
        '<a href="shop.html" class="btn btn-primary">Go to Shop</a></div>';
      return;
    }

    document.title = product.name + ' — Homeokit Homoeopathy';
    document.getElementById('crumb-product').textContent = product.name;
    const category = window.Data.categoryBySlug(product.category);
    if (category) {
      document.getElementById('crumb-category').textContent = category.name;
      document.getElementById('crumb-category').href = 'shop.html?category=' + encodeURIComponent(category.slug);
    }

    const imgBase = product.image.replace(/\.svg$/, '');
    const gallery = [product.image, imgBase + '-1.svg', imgBase + '-2.svg', imgBase + '-3.svg'];
    document.getElementById('detail-image').src = 'images/products/' + product.image;
    document.getElementById('detail-image').alt = product.name;
    document.getElementById('thumb-row').innerHTML = gallery.map(function (file, index) {
      return '<button type="button" class="thumb' + (index === 0 ? ' active' : '') + '" data-thumb="' + esc(file) + '" aria-label="View image ' + (index + 1) + '">' +
        '<img src="images/products/' + esc(file) + '" alt="' + esc(product.name) + ' view ' + (index + 1) + '"></button>';
    }).join('');

    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-category').textContent = window.Data.categoryName(product.category);
    document.getElementById('detail-rating').innerHTML =
      '<span class="stars">' + window.Data.ratingStars(product.rating) + '</span>' +
      '<span>' + Number(product.rating).toFixed(1) + ' · ' + product.review_count + ' reviews</span>';
    document.getElementById('detail-price').innerHTML = money(product.price) +
      (product.old_price ? ' <span class="old-price">' + money(product.old_price) + '</span>' : '');
    document.getElementById('detail-pack').innerHTML = '<option>' + esc(product.pack_size) + '</option>' +
      '<option disabled>Other sizes — contact us</option>';
    document.getElementById('detail-potency').innerHTML = '<option>' + esc(product.potency) + '</option>' +
      '<option disabled>Ask your practitioner</option>';
    document.getElementById('stock-note').textContent = product.stock > 0 ? '✔ In Stock (' + product.stock + ' available)' : '✖ Out of stock';
    document.getElementById('tab-description').innerHTML =
      '<p>' + esc(product.description) + '</p>' +
      '<ul><li><strong>Pack size:</strong> ' + esc(product.pack_size) + '</li>' +
      '<li><strong>Potency:</strong> ' + esc(product.potency) + '</li>' +
      '<li><strong>Expiry:</strong> ' + esc(product.expiry) + '</li></ul>';
    document.getElementById('tab-directions').innerHTML =
      '<p>' + esc(product.directions) + '</p>' +
      '<p class="muted small">These products are not intended to diagnose, treat, cure or prevent any disease. Consult a qualified homoeopathic practitioner for persistent complaints.</p>';
    document.getElementById('tab-reviews').innerHTML = window.Data.testimonials().slice(0, 3).map(function (t) {
      return '<div class="review-item"><span class="stars">' + window.Data.ratingStars(t.rating) + '</span>' +
        '<strong>' + esc(t.name) + ' <span class="muted small">· ' + esc(t.location) + '</span></strong>' +
        '<p>' + esc(t.text) + '</p></div>';
    }).join('');

    const related = window.Data.products().filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    }).slice(0, 4);
    const fillers = window.Data.products().filter(function (p) {
      return p.category !== product.category && p.is_featured;
    }).slice(0, 4 - related.length);
    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) relatedGrid.innerHTML = related.concat(fillers).map(productCard).join('');

    const mobilePrice = document.getElementById('mobile-price');
    if (mobilePrice) mobilePrice.textContent = money(product.price);
    document.body.classList.add('has-sticky-bar');

    document.getElementById('thumb-row').addEventListener('click', function (event) {
      const thumb = event.target.closest('[data-thumb]');
      if (!thumb) return;
      const image = document.getElementById('detail-image');
      image.src = 'images/products/' + thumb.dataset.thumb;
      image.classList.remove('zoomed');
      document.querySelectorAll('.thumb').forEach(function (t) { t.classList.toggle('active', t === thumb); });
    });
    document.getElementById('detail-image').addEventListener('click', function (event) {
      event.currentTarget.classList.toggle('zoomed');
    });

    document.querySelectorAll('.tab-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b === button); });
        document.querySelectorAll('.tab-panel').forEach(function (panel) {
          panel.classList.toggle('active', panel.id === 'tab-' + button.dataset.tab);
        });
      });
    });

    document.querySelectorAll('[data-detail-add]').forEach(function (button) {
      button.setAttribute('data-add-to-cart', product.id);
    });
    document.querySelectorAll('.qty-control button').forEach(function (button) {
      button.addEventListener('click', function () {
        const input = document.getElementById('detail-qty');
        let value = Number(input.value) || 1;
        value = Math.max(1, Math.min(product.stock || 99, value + (button.dataset.step === 'up' ? 1 : -1)));
        input.value = value;
        document.querySelectorAll('[data-detail-add]').forEach(function (b) { b.dataset.qty = value; });
      });
    });
  }

  window.Data.load().then(function () {
    const pageName = document.body.dataset.page;
    if (pageName === 'home') initHome();
    else if (pageName === 'shop') initShop();
    else if (pageName === 'product') initProduct();
  });
})();
