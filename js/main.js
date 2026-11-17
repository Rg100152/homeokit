/* Shared layout (header/footer), navigation, forms and testimonials slider. */
(function () {
  'use strict';

  const page = document.body.dataset.page || '';

  const NAV = [
    { key: 'home', label: 'Home', href: 'index.html' },
    { key: 'shop', label: 'Shop', href: 'shop.html' },
    { key: 'about', label: 'About', href: 'about.html' },
    { key: 'consult', label: "Doctor's Corner", href: 'doctors-corner.html' },
    { key: 'blog', label: 'Blog', href: 'blog.html' },
    { key: 'contact', label: 'Contact', href: 'contact.html' }
  ];

  function renderHeader() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const links = NAV.map(function (item) {
      return '<a href="' + item.href + '"' + (item.key === page ? ' class="active" aria-current="page"' : '') + '>' + item.label + '</a>';
    }).join('');

    host.innerHTML =
      '<header class="site-header">' +
        '<div class="container header-top">' +
          '<a href="index.html" class="brand" aria-label="Homeokit Homoeopathy home">' +
            '<img src="images/logo.svg" alt="Homeokit Homoeopathy">' +
          '</a>' +
          '<nav class="main-nav" id="main-nav" aria-label="Main navigation">' + links + '</nav>' +
          '<div class="header-actions">' +
            '<a href="shop.html" class="icon-btn" aria-label="Search products" title="Search products">🔍</a>' +
            '<a href="cart.html" class="icon-btn" aria-label="Shopping cart" title="Cart">🛒' +
              '<span class="cart-badge" id="cart-count">0</span>' +
            '</a>' +
            '<button class="icon-btn menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>' +
          '</div>' +
        '</div>' +
        '<div class="container header-search-wrap">' +
          '<form class="header-search" id="header-search" role="search">' +
            '<span aria-hidden="true">🔎</span>' +
            '<input type="search" name="q" placeholder="Search by ailment (e.g. cough, skin, weakness)" aria-label="Search by ailment">' +
            '<button type="submit" class="btn btn-primary btn-sm">Search</button>' +
          '</form>' +
        '</div>' +
      '</header>' +
      '<div class="nav-backdrop" id="nav-backdrop"></div>';
  }

  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer">' +
        '<div class="container footer-grid">' +
          '<div class="footer-brand">' +
            '<img src="images/logo.svg" alt="Homeokit Homoeopathy">' +
            '<p>Trusted homoeopathic care since 1983. Natural remedies, prepared with care and made available to every home.</p>' +
            '<div class="socials">' +
              '<a href="#" aria-label="Facebook" title="Facebook">f</a>' +
              '<a href="#" aria-label="Instagram" title="Instagram">◎</a>' +
              '<a href="#" aria-label="YouTube" title="YouTube">▶</a>' +
              '<a href="#" aria-label="LinkedIn" title="LinkedIn">in</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>Quick Links</h4>' +
            '<ul class="footer-links">' +
              '<li><a href="index.html">Home</a></li>' +
              '<li><a href="shop.html">Shop All Products</a></li>' +
              '<li><a href="about.html">About Us</a></li>' +
              '<li><a href="doctors-corner.html">Doctor\'s Corner</a></li>' +
              '<li><a href="blog.html">Blog</a></li>' +
              '<li><a href="contact.html">Contact Us</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Categories</h4>' +
            '<ul class="footer-links" id="footer-categories">' +
              '<li><a href="shop.html?category=pain-relief">Pain Relief</a></li>' +
              '<li><a href="shop.html?category=skin-care">Skin Care</a></li>' +
              '<li><a href="shop.html?category=hair-care">Hair Care</a></li>' +
              '<li><a href="shop.html?category=digestive-care">Digestive Care</a></li>' +
              '<li><a href="shop.html?category=mother-tinctures">Mother Tinctures</a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4>Newsletter</h4>' +
            '<p class="small" style="color:#a8bdb4">Get wellness tips and offers in your inbox.</p>' +
            '<form class="newsletter" data-form="newsletter">' +
              '<input type="email" name="email" placeholder="Your email address" aria-label="Email address" required>' +
              '<button type="submit" class="btn btn-accent btn-sm">Join</button>' +
            '</form>' +
            '<div class="form-message" data-form-message></div>' +
            '<h4 style="margin-top:22px">Get in Touch</h4>' +
            '<ul class="footer-links footer-contact">' +
              '<li><span class="icon">📞</span> +91-120-456-7890</li>' +
              '<li><span class="icon">✉️</span> info@homeokit.example</li>' +
              '<li><span class="icon">📍</span> Sahibabad, Uttar Pradesh, India</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© <span id="footer-year">2026</span> Homeokit Homoeopathy. All rights reserved.</span>' +
          '<span class="links">' +
            '<a href="privacy.html">Privacy Policy</a>' +
            '<a href="terms.html">Terms &amp; Conditions</a>' +
            '<a href="terms.html#returns">Return Policy</a>' +
            '<a href="admin.html">Admin</a>' +
          '</span>' +
        '</div>' +
      '</footer>';
  }

  function initNavigation() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    const backdrop = document.getElementById('nav-backdrop');
    if (!toggle || !nav || !backdrop) return;

    function close() {
      nav.classList.remove('open');
      backdrop.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    backdrop.addEventListener('click', close);
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
  }

  function initHeaderSearch() {
    const form = document.getElementById('header-search');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const q = form.querySelector('input').value.trim();
      window.location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  const FORM_STORES = {
    newsletter: { key: 'homeo_subscribers', message: 'Thank you! You are now subscribed.' },
    contact: { key: 'homeo_messages', message: 'Thank you! Your message has been saved. We will get back to you soon.' },
    consultation: { key: 'homeo_consultations', message: 'Thank you! Your consultation request has been recorded. Our team will contact you.' }
  };

  function initForms() {
    document.addEventListener('submit', function (event) {
      const form = event.target.closest('form[data-form]');
      if (!form) return;
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const config = FORM_STORES[form.dataset.form];
      if (!config) return;
      const entry = Object.fromEntries(new FormData(form).entries());
      entry.submitted_at = new Date().toISOString();
      try {
        const saved = JSON.parse(localStorage.getItem(config.key) || '[]');
        saved.push(entry);
        localStorage.setItem(config.key, JSON.stringify(saved));
      } catch (err) {
        console.warn('Could not save form entry:', err);
      }
      const message = form.querySelector('[data-form-message]');
      if (message) {
        message.className = 'form-message alert alert-success';
        message.textContent = config.message;
      }
      form.reset();
    });
  }

  function initAddToCart() {
    document.addEventListener('click', function (event) {
      const button = event.target.closest('[data-add-to-cart]');
      if (!button) return;
      event.preventDefault();
      const ok = window.Cart.add(Number(button.dataset.addToCart), Number(button.dataset.qty || 1));
      window.UI.flashButton(button, ok ? '✔ Added!' : 'Out of stock');
      if (ok && button.dataset.buyNow) window.location.href = 'checkout.html';
    });
  }

  function initTestimonials() {
    const track = document.getElementById('testimonial-track');
    if (!track) return;
    const controls = document.getElementById('slider-controls');

    window.Data.load().then(function () {
      const items = window.Data.testimonials();
      if (!items.length) return;
      track.innerHTML = items.map(function (item) {
        return '<div class="testimonial-card">' +
          '<div class="quote-mark" aria-hidden="true">“</div>' +
          '<div class="stars" aria-label="' + item.rating + ' out of 5 stars">' + window.Data.ratingStars(item.rating) + '</div>' +
          '<blockquote>' + window.Data.escapeHtml(item.text) + '</blockquote>' +
          '<div class="testimonial-author"><strong>' + window.Data.escapeHtml(item.name) + '</strong>' +
          '<small>' + window.Data.escapeHtml(item.location) + '</small></div>' +
        '</div>';
      }).join('');
      if (controls) {
        controls.innerHTML = items.map(function (_, index) {
          return '<button type="button" class="slider-dot' + (index === 0 ? ' active' : '') +
            '" data-slide="' + index + '" aria-label="Show testimonial ' + (index + 1) + '"></button>';
        }).join('');
      }

      let current = 0;
      function goTo(index) {
        current = (index + items.length) % items.length;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        if (controls) {
          controls.querySelectorAll('.slider-dot').forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
          });
        }
      }
      const slider = document.getElementById('testimonial-slider');
      document.querySelector('.slider-prev')?.addEventListener('click', function () { goTo(current - 1); });
      document.querySelector('.slider-next')?.addEventListener('click', function () { goTo(current + 1); });
      if (controls) {
        controls.addEventListener('click', function (event) {
          const dot = event.target.closest('[data-slide]');
          if (dot) goTo(Number(dot.dataset.slide));
        });
      }
      let timer = window.setInterval(function () { goTo(current + 1); }, 6000);
      slider?.addEventListener('mouseenter', function () { window.clearInterval(timer); });
      slider?.addEventListener('mouseleave', function () { timer = window.setInterval(function () { goTo(current + 1); }, 6000); });
    });
  }

  function initFooterCategories() {
    const host = document.getElementById('footer-categories');
    if (!host) return;
    window.Data.load().then(function () {
      host.innerHTML = window.Data.categories().map(function (cat) {
        return '<li><a href="shop.html?category=' + encodeURIComponent(cat.slug) + '">' +
          window.Data.escapeHtml(cat.name) + '</a></li>';
      }).join('');
    });
  }

  // Layout is injected immediately because scripts are loaded at the end of <body>.
  renderHeader();
  renderFooter();
  const year = document.getElementById('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());
  initNavigation();
  initHeaderSearch();
  initForms();
  initAddToCart();
  window.Cart.updateBadges();
  initTestimonials();
  initFooterCategories();
})();
