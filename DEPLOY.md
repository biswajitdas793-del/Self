# Deploy guide — Namaskar Telecom

## Stack
- Static HTML/CSS/JS (no build step)
- Supabase (Postgres + REST) for products catalog & contact-form enquiries
- Vercel for hosting

## Supabase project
- Project: `namaskar-telecom`
- URL: `https://fijlrehoktnvkuflteud.supabase.co`
- Region: ap-south-1 (Mumbai)
- Tables:
  - `products` (public read, RLS-filtered to `in_stock = true`)
  - `enquiries` (public insert only — RLS prevents anyone from reading them via the anon key)

The publishable (anon) key is in `assets/js/supabase-config.js`. It is safe to ship to the browser — Row Level Security policies on Supabase restrict what it can do.

### Update prices / stock
1. Open the Supabase dashboard → Table editor → `products`.
2. Edit any row directly (price_inr, in_stock, is_new, featured, sort_order, etc.).
3. Changes appear on the website on next page load — no deploy needed.

### View enquiries
1. Supabase dashboard → Table editor → `enquiries`.
2. Each contact-form submission lands here with name, phone, interest, message, created_at.

## Deploy to Vercel (one-time setup)

### Option A — via Vercel dashboard
1. Go to https://vercel.com/new
2. Import the GitHub repo (`biswajitdas793-del/Self`)
3. Framework preset: **Other** (no build needed)
4. Build & Output settings: leave all defaults
5. Click **Deploy**

### Option B — via Vercel CLI
```bash
npm i -g vercel
vercel        # first run, link project
vercel --prod # production deploy
```

Vercel will pick up `vercel.json` and serve the site as-is.

### Custom domain
Once deployed:
1. Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g. `namaskartelecom.in`)
3. Update DNS as Vercel instructs

## Project credentials reference
- Supabase project ref: `fijlrehoktnvkuflteud`
- Dashboard: https://supabase.com/dashboard/project/fijlrehoktnvkuflteud
