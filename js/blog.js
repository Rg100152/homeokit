/* Blog listing and single post rendering. */
(function () {
  'use strict';

  const esc = function (value) { return window.Data.escapeHtml(value); };

  function blogCard(post) {
    return '<article class="blog-card">' +
      '<a href="blog-post.html?slug=' + encodeURIComponent(post.slug) + '">' +
        '<img src="images/blog/' + esc(post.image) + '" alt="' + esc(post.title) + '" loading="lazy">' +
      '</a>' +
      '<div class="blog-body">' +
        '<div class="blog-meta"><span class="blog-tag">' + esc(post.category) + '</span>' +
          '<span>' + esc(post.read_time) + '</span><span>' + esc(post.created_at) + '</span></div>' +
        '<h3><a href="blog-post.html?slug=' + encodeURIComponent(post.slug) + '">' + esc(post.title) + '</a></h3>' +
        '<p>' + esc(post.excerpt) + '</p>' +
        '<a class="read-more" href="blog-post.html?slug=' + encodeURIComponent(post.slug) + '">Read More →</a>' +
      '</div>' +
    '</article>';
  }

  function initBlogList() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;
    const posts = window.Data.posts();
    const categories = Array.from(new Set(posts.map(function (p) { return p.category; })));
    const chips = document.getElementById('blog-chips');
    if (chips) {
      chips.innerHTML = ['All', ...categories].map(function (cat, index) {
        return '<button type="button" class="chip' + (index === 0 ? ' active' : '') + '" data-blog-category="' + esc(cat) + '">' + esc(cat) + '</button>';
      }).join('');
    }
    let activeCategory = 'All';
    let query = '';

    function render() {
      const q = query.trim().toLowerCase();
      const list = posts.filter(function (post) {
        if (activeCategory !== 'All' && post.category !== activeCategory) return false;
        if (q && (post.title + ' ' + post.excerpt + ' ' + post.category).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      grid.innerHTML = list.length ? list.map(blogCard).join('') :
        '<div class="no-results" style="grid-column:1/-1"><h3>No articles found</h3><p>Try another search or category.</p></div>';
    }

    chips?.addEventListener('click', function (event) {
      const chip = event.target.closest('[data-blog-category]');
      if (!chip) return;
      activeCategory = chip.dataset.blogCategory;
      chips.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
      render();
    });
    document.getElementById('blog-search')?.addEventListener('submit', function (event) {
      event.preventDefault();
      query = document.getElementById('blog-search-input').value;
      render();
    });
    render();
  }

  function initBlogPost() {
    const root = document.getElementById('blog-post-root');
    if (!root) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const post = slug ? window.Data.postBySlug(slug) : null;
    if (!post) {
      root.innerHTML = '<div class="empty-state"><h2>Article not found</h2>' +
        '<a href="blog.html" class="btn btn-primary">Back to Blog</a></div>';
      return;
    }
    document.title = post.title + ' — Homeokit Homoeopathy';
    document.getElementById('crumb-post').textContent = post.title;
    root.innerHTML =
      '<article class="post-body fade-in">' +
        '<div class="post-meta"><span class="blog-tag">' + esc(post.category) + '</span>' +
          '<span>By ' + esc(post.author) + '</span><span>' + esc(post.created_at) + '</span>' +
          '<span>' + esc(post.read_time) + '</span></div>' +
        '<h1>' + esc(post.title) + '</h1>' +
        '<img class="post-cover" src="images/blog/' + esc(post.image) + '" alt="' + esc(post.title) + '">' +
        '<div class="post-body-content">' + post.content + '</div>' +
        '<p style="margin-top:30px"><a href="blog.html" class="btn btn-outline">← Back to all articles</a></p>' +
      '</article>';

    const related = window.Data.posts().filter(function (p) { return p.slug !== post.slug; }).slice(0, 3);
    const host = document.getElementById('related-posts');
    if (host) {
      host.innerHTML = '<div class="section-head"><h2>Keep Reading</h2></div>' +
        '<div class="blog-grid">' + related.map(blogCard).join('') + '</div>';
    }
  }

  function initHomePreview() {
    const grid = document.getElementById('blog-preview');
    if (!grid) return;
    grid.innerHTML = window.Data.posts().slice(0, 3).map(blogCard).join('');
  }

  window.Data.load().then(function () {
    const pageName = document.body.dataset.page;
    if (pageName === 'home') initHomePreview();
    else if (pageName === 'blog') initBlogList();
    else if (pageName === 'blog-post') initBlogPost();
  });
})();
