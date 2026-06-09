# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this repository is

This is **Namaskar Telecom** — a storefront website and private owner portal for
a mobile-phone & accessories shop. It is a **static site** (plain HTML + CSS +
vanilla JavaScript ES modules, **no build step**) backed by **Supabase**
(Postgres + Auth + Storage) and hosted on **Vercel**.

- Public site: https://namaskar-telecom.vercel.app
- Owner portal: https://namaskar-telecom.vercel.app/admin.html

### Important: the repo also vendors large skill collections

Most of the directory tree is **not** the website. These top-level folders are
vendored clones of public "agent skills" repositories, kept here so the skills
auto-activate:

- `.claude/skills/` — installed skills for this Claude Code project
- `agent-skills/`, `antigravity-awesome-skills/`, `awesome-claude-skills/`,
  `planning-with-files/`, `graphify/`

**Do not edit, refactor, lint, or "clean up" these directories** unless the task
explicitly asks you to. They are third-party content. When asked to work on
"the project," "the site," "the shop," or "the catalogue," it always means the
Namaskar Telecom website files described below — ignore the vendored folders.

## The actual project — file map

Everything for the website lives at the repo root + `assets/`:

| Path | Purpose |
|---|---|
| `index.html` | Home page (hero, featured products) |
| `products.html` | Full catalogue grid with category filters |
| `product.html` | Single product detail page (PDP), reads `?id=` from URL |
| `offers.html`, `about.html`, `contact.html`, `privacy.html` | Static content pages |
| `404.html` | Not-found page |
| `admin.html` | Owner portal — login-gated dashboard + catalogue editor |
| `assets/js/app.js` | Public-site logic: catalogue render, PDP, contact form, phone SVG mockups |
| `assets/js/admin.js` | Owner portal logic: auth, product CRUD, photo upload, sales/dashboard |
| `assets/js/supabase-config.js` | Exports `SUPABASE_URL` + `SUPABASE_ANON_KEY` (publishable key, safe to ship) |
| `assets/js/motion.js` | Scroll/entrance animations (loaded on most public pages) |
| `assets/js/network.js` | Hero background canvas animation (home page only) |
| `assets/css/styles.css` | Main site theme |
| `assets/css/admin.css` | Owner portal theme |
| `assets/og.svg`, `manifest.webmanifest`, `sitemap.xml`, `robots.txt` | SEO / PWA / share assets |
| `vercel.json` | Hosting config: `cleanUrls`, cache headers |
| `README.md`, `DEPLOY.md` | Project overview & deploy/Supabase setup notes |
| `VALIDATION_REPORT.md` | Catalogue data-quality audit report |

## Architecture & conventions

### No build step
The site ships raw files. ES modules are imported directly in the browser,
including Supabase from a CDN:
```js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
```
There is no bundler, transpiler, `package.json`, or test runner. Don't add one
unless asked. Edit the source files directly.

### Page routing pattern
Each public page includes `app.js`, which runs every init function on
`DOMContentLoaded` but each function **guards on the presence of a DOM element**
and returns early if it's not on the right page. Routing is by element ID, not
by URL or a router:
- `#product-grid` → catalogue page (`products.html`)
- `#featured-grid` → home featured strip (`index.html`)
- `#pdp-root` → product detail page (`product.html`)
- `#contact-form` → contact page
Init calls are wrapped in a `safe(fn, name)` helper so one failing section never
breaks the rest of the page. Follow this pattern when adding page logic.

### Supabase data model
Client calls in `app.js` / `admin.js` touch these tables/bucket:

- **`products`** — the catalogue. Key columns: `id`, `brand`, `name`,
  `category` (`smartphone`/`tablets`/`tws`/`headphones`/`smartwatches`),
  `price_inr`, `mrp_inr`, `description`, `in_stock`, `is_new`, `featured`,
  `sort_order`, `image_url`, `gallery_urls` (array), `color_options`
  (JSONB `[{name, hex, image_url?}]`), `storage_options` (JSONB
  `[{label, price, mrp}]`), `flipkart_query`, `amazon_query`, plus optional spec
  fields (`processor`, `display`, `main_camera`, `battery`, `form_factor`, …).
  Public read is **RLS-filtered to `in_stock = true`**.
- **`enquiries`** — contact-form submissions (`name`, `phone`, `interest`,
  `message`, `created_at`). Anon key can **insert only**, not read (RLS).
- **`sales`** — owner-recorded sales feeding the dashboard (`product_id`,
  `product_name`, `brand`, `category`, `qty`, `unit_price_inr`, `sold_at`, `note`).
- **`product_events`** — fire-and-forget demand tracking (`product_id`,
  `event_type`, e.g. `'whatsapp'`) for the "most wanted" dashboard panel.
- **Storage bucket `product-images`** — product photos uploaded from the portal.

The anon/publishable key in `supabase-config.js` is intentionally committed and
safe in the browser; security is enforced by **Row Level Security**, not by
hiding the key. Never disable or work around RLS in client code.

### Coding idioms to match
- **Currency:** always format with the `fmtPrice`/`fmt` helpers → `₹` + Indian
  digit grouping (`toLocaleString('en-IN')`).
- **WhatsApp deep links:** built via the `wa(msg)` helper to number `WA_NUMBER`
  (`918082220143`); the PDP rebuilds the message from the live DOM selection.
- **DOM is the source of truth** for selected colour/storage on the PDP — there
  are no separate state variables; handlers re-read `.active` elements.
- **Phone illustrations:** when a product has no usable photo, `app.js` renders a
  brand-correct SVG phone mockup (see `BRAND_PALETTE`, `brandCamera`, `svgBar/
  svgFold/svgFlip`). Image `error` handlers swap in this fallback at runtime.
- **Always escape user/data strings** with `escapeHtml`/`esc` before injecting
  into HTML.
- **Tracking/analytics must never break the page** — wrap in try/catch and
  swallow errors (see `trackEvent`).
- Keep new code in the same plain-ES-module, dependency-free style as the
  surrounding file.

## Local development

It's a static site — serve the folder and open it in a browser:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
A live Supabase backend is used directly; there is no local DB. Editing the
catalogue happens through `/admin.html` (owner login) or the Supabase dashboard.

## Deploy

Pushing to `main` auto-deploys to Vercel — Vercel serves the files as-is using
`vercel.json`. There is no CI pipeline. See `DEPLOY.md` for first-time Supabase +
Vercel setup, credentials, and the data-update workflow.

## Git workflow for AI assistants

- Develop on the branch designated for the task (currently
  `claude/claude-md-docs-r90z8w`); create it locally if missing.
- Commit with clear, descriptive messages. Push with
  `git push -u origin <branch>`. After pushing, open a **draft** pull request if
  one doesn't already exist.
- Never push directly to `main` without explicit permission.
- After any change to the site, sanity-check by serving locally and loading the
  affected page(s) in a browser; there is no automated test suite.

## Quick orientation checklist

1. Working on the shop? → edit root `*.html` + `assets/` only.
2. Touching data/behaviour? → check the Supabase table columns above and respect RLS.
3. Adding page logic? → follow the element-ID guard + `safe()` pattern in `app.js`.
4. Asked about skills folders? → they're vendored; don't modify unless told to.
