# Namaskar Telecom

Storefront and owner portal for **Namaskar Telecom** — a static site with a
Supabase-backed product catalogue and a private dashboard for the shop owner.

- **Public site:** https://namaskar-telecom.vercel.app
- **Owner portal:** https://namaskar-telecom.vercel.app/admin.html

## What's here

- `index.html`, `products.html`, `product.html`, `about.html`, `contact.html`,
  `offers.html` — public pages, static HTML.
- `admin.html` + `assets/js/admin.js` — owner portal (login-gated).
- `assets/css/styles.css`, `assets/css/admin.css` — site & portal themes.
- `assets/js/app.js` — catalogue rendering, product detail page, contact form.
- `assets/js/motion.js`, `assets/js/network.js` — page motion + hero canvas.
- `sitemap.xml`, `robots.txt`, `assets/og.svg` — SEO + share preview.
- `vercel.json` — hosting/cache headers.
- `DEPLOY.md` — Supabase + Vercel setup notes.

## Operating the shop (no code needed)

Sign in at **/admin.html** with the owner credentials. From there you can:

- **Add / edit / delete products** — appear on the site instantly.
- **Upload product photos** — stored in Supabase Storage (`product-images`
  bucket) so they always load. Add multiple, mark any as the cover.
- **Set storage-tier pricing** — per-variant price ladders (128 GB / 256 GB /
  512 GB / 1 TB), shown on the product page.
- **Colours** — comma-separated. Use `Black:#1A1A1A` syntax to set the
  swatch colour; existing swatches are preserved across edits.
- **Mark sold-out / restock** — hides from the site without losing the row.
- **Mark a sale** — feeds the dashboard (monthly + quarterly charts, top
  sellers, most-wanted from enquiries).
- **Change password** from the header — please do this after first sign-in.

## Stack

- **Frontend:** plain HTML + CSS + ES modules. No build step.
- **Backend:** [Supabase](https://supabase.com) (Postgres + Auth + Storage).
- **Hosting:** [Vercel](https://vercel.com) — auto-deploys on push to `main`.

## Local development

It's a static site — open the HTML files in a browser or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The Supabase publishable key in `assets/js/supabase-config.js` is safe to ship
to the browser — Row Level Security on the database restricts what it can do.

## Deploy

Pushes to `main` deploy to Vercel automatically. See `DEPLOY.md` for first-time
Supabase + Vercel setup, credential management and the data-update workflow.
