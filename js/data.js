/* Loads the JSON data files once and exposes helpers to every page. */
window.Data = (function () {
  'use strict';

  const OVERRIDE_KEY = 'homeo_products_override';
  const state = { products: [], categories: [], testimonials: [], posts: [] };
  let loadPromise = null;

  function fetchJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) throw new Error(path + ' → HTTP ' + response.status);
      return response.json();
    });
  }

  function applyOverrides(products) {
    try {
      const raw = localStorage.getItem(OVERRIDE_KEY);
      if (!raw) return products;
      const custom = JSON.parse(raw);
      return Array.isArray(custom) && custom.length ? custom : products;
    } catch (err) {
      console.warn('Ignoring invalid saved product override:', err);
      return products;
    }
  }

  function showError(err) {
    console.error('Data load failed:', err);
    const banner = document.createElement('div');
    banner.className = 'alert alert-error';
    banner.style.cssText = 'max-width:1200px;margin:16px auto;padding:14px 18px';
    banner.innerHTML = '<strong>Data files could not be loaded.</strong> ' +
      'Run <code>python3 tools/generate_data_bundle.py</code> and reload, or serve the folder with ' +
      '<code>python3 -m http.server 8000</code> and visit <code>http://localhost:8000</code>.';
    const host = document.querySelector('main') || document.body;
    host.insertBefore(banner, host.firstChild);
  }

  function applyResults(results) {
    state.products = applyOverrides(results[0]);
    state.categories = results[1];
    state.testimonials = results[2];
    state.posts = results[3];
    return state;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(script);
    });
  }

  function loadFromBundle(err) {
    // fetch() of local JSON is blocked on file:// — use the generated JS bundle instead.
    if (err) console.info('Using data/bundle.js fallback:', err.message);
    if (window.HOMEO_DATA) return Promise.resolve(window.HOMEO_DATA);
    return loadScript('data/bundle.js').then(function () {
      if (!window.HOMEO_DATA) throw new Error('data/bundle.js did not define HOMEO_DATA');
      return window.HOMEO_DATA;
    });
  }

  function load() {
    if (!loadPromise) {
      let source;
      if (location.protocol === 'file:') {
        source = loadFromBundle().then(function (data) {
          return applyResults([data.products, data.categories, data.testimonials, data.posts]);
        });
      } else {
        source = Promise.all([
          fetchJson('data/products.json'),
          fetchJson('data/categories.json'),
          fetchJson('data/testimonials.json'),
          fetchJson('data/blog.json')
        ]).then(applyResults).catch(function (err) {
          return loadFromBundle(err).then(function (data) {
            return applyResults([data.products, data.categories, data.testimonials, data.posts]);
          });
        });
      }
      loadPromise = source.catch(function (err) {
        showError(err);
        return state;
      });
    }
    return loadPromise;
  }

  function reload() {
    loadPromise = null;
    return load();
  }

  return {
    load: load,
    reload: reload,
    products: function () { return state.products; },
    categories: function () { return state.categories; },
    testimonials: function () { return state.testimonials; },
    posts: function () { return state.posts; },
    productById: function (id) {
      return state.products.find(function (p) { return Number(p.id) === Number(id); });
    },
    productBySlug: function (slug) {
      return state.products.find(function (p) { return p.slug === slug; });
    },
    categoryBySlug: function (slug) {
      return state.categories.find(function (c) { return c.slug === slug; });
    },
    categoryName: function (slug) {
      const cat = categoryBySlugSafe(slug);
      return cat ? cat.name : 'Wellness';
    },
    postBySlug: function (slug) {
      return state.posts.find(function (p) { return p.slug === slug; });
    },
    formatPrice: function (value) {
      return '₹' + Number(value || 0).toLocaleString('en-IN');
    },
    ratingStars: function (rating) {
      const rounded = Math.round(Number(rating) || 0);
      let out = '';
      for (let i = 1; i <= 5; i++) out += i <= rounded ? '★' : '☆';
      return out;
    },
    escapeHtml: function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }
  };

  function categoryBySlugSafe(slug) {
    return state.categories.find(function (c) { return c.slug === slug; });
  }
})();
