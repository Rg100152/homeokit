# Homeokit Homoeopathy — Static E-Commerce Demo

A complete, responsive, **static** homoeopathy storefront built with HTML, CSS and vanilla JavaScript. No framework or backend is required for the demo: product data comes from JSON files and cart/orders/forms are stored in the browser's `localStorage`.

## Run locally

Open a terminal inside this folder and start any static server:

```bash
python3 -m http.server 8000
```

Then visit **http://localhost:8000**

> You can also open `index.html` by double-clicking it: when `fetch()` of local JSON is blocked, the site automatically falls back to the generated `data/bundle.js`. After editing `data/*.json`, regenerate it with `python3 tools/generate_data_bundle.py`. A local server is still recommended for development.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage: hero, trust strip, categories, featured products, testimonials, blog preview |
| `shop.html` | Product listing with category/ailment/price filters, search, sorting and pagination |
| `product.html` | Product detail with gallery, variants, tabs, reviews and related products (`?slug=...`) |
| `cart.html` | Cart with quantity controls, remove action and order summary |
| `checkout.html` | Demo checkout form and order summary |
| `order-success.html` | Order confirmation (`?id=...`) |
| `about.html` | Company history, facilities, quality and mission |
| `blog.html` / `blog-post.html` | Article listing and detail (`?slug=...`) |
| `contact.html` | Contact form, details and map placeholder |
| `doctors-corner.html` | Consultation information and request form |
| `privacy.html` / `terms.html` | Placeholder legal pages |
| `admin.html` | Demo admin: dashboard, product CRUD, orders and messages |

## Folder structure

```
.
├── *.html                 # All pages (index.html at root)
├── css/
│   ├── style.css          # Design system, components, responsive layout
│   ├── shop.css           # Filters, toolbar, pagination, mobile drawer
│   └── admin.css          # Admin panel theme
├── js/
│   ├── data.js            # Loads data once (JSON, with file:// fallback), helpers, overrides
│   ├── cart.js            # localStorage cart + cart page rendering
│   ├── main.js            # Header/footer injection, nav, forms, testimonial slider
│   ├── hero.js            # Homepage hero image gallery (auto-slide + thumbnails)
│   ├── products.js        # Homepage, shop filters/pagination, product detail
│   ├── checkout.js        # Checkout + order success page
│   ├── blog.js            # Blog preview/list/post
│   └── admin.js           # Demo admin panel
├── data/
│   ├── products.json      # 20 sample products
│   ├── categories.json    # 8 categories
│   ├── testimonials.json  # 5 testimonials
│   ├── blog.json          # 5 articles
│   └── bundle.js          # Generated copy for file:// (do not edit)
├── images/
│   ├── logo.svg, hero.svg
│   ├── products/          # 4 placeholder views per product
│   └── blog/              # Placeholder article images
├── tools/
│   ├── generate_placeholders.py  # Regenerates SVG placeholders from JSON
│   └── generate_data_bundle.py   # Regenerates data/bundle.js from JSON
```

## Design

- Primary green `#2E7D32`, deep green `#1B5E20`, teal `#00897B`, amber accent `#FFB300`
- Poppins headings + Inter body, 14px cards, soft shadows
- Mobile-first: mobile nav drawer, horizontal category cards, mobile filter bottom sheet, sticky add-to-cart bar
- Micro-interactions: card lift, button feedback ("✔ Added!"), cart badge bounce, fades
- Homepage hero: gallery of all seven supplied images with thumbnails, arrows and auto-slide (replace files in `images/hero-*.png`)

## Data and persistence

- All content lives in `data/*.json`. Edit those files to change products, categories, testimonials or blog posts, then run `python3 tools/generate_data_bundle.py` so double-clicked pages see the same data.
- Cart: `localStorage['homeo_cart']` → `{ "productId": quantity }`
- Orders: `localStorage['homeo_orders']` (created by demo checkout)
- Forms: `homeo_messages`, `homeo_consultations`, `homeo_subscribers`
- Admin product edits are stored in `localStorage['homeo_products_override']` and override `products.json` in that browser. Use **Restore demo catalogue** in the admin panel to clear it.

## Replacing placeholder images

The SVGs are intentional placeholders. Replace files in `images/products/` and `images/blog/` while keeping the same filenames, or update the `image` field in `data/*.json`. To regenerate the placeholders after editing data:

```bash
python3 tools/generate_placeholders.py
```

## Payment and production notes

- Checkout is a **demo**: no payment gateway is connected and no real orders are created.
- For production, add a backend (e.g. Flask/Node), a database, real authentication and a payment provider (Razorpay/PayU).
- Replace brand name, contact details, legal text and all images before launch.
- For deployment, upload the folder to Netlify (drag & drop), GitHub Pages, Render Static Site, or cPanel `public_html/`. `index.html` is at the root, so no build step is needed.

## Quick checks

```bash
python3 -c "import json,glob; [json.load(open(f)) for f in glob.glob('data/*.json')]; print('JSON OK')"
```

Then open each page in the browser and check: homepage widgets load, shop filters work, product detail loads via `product.html?slug=...`, cart updates, checkout places a demo order, admin panel shows the new order.
