# Catalogue Validation Report

_Generated: May 2026 · Catalogue audited and normalised end-to-end._

This is the audit + fix report for the product catalogue. It records every
issue checked for, the count found, and what was done. The catalogue is
managed in Supabase (`public.products`, RLS-gated — only the owner can write).

## Summary

| Metric | Value |
|---|---|
| Total products scanned | **465** |
| Live on site | **402** |
| Hidden (duplicates / region clones / unverifiable models) | **63** |
| Brands stocked | **9** mobile + audio/wearable accessory brands |

## Issues found vs fixed

| Check | Found | Status |
|---|---|---|
| Products with no description | **0** | ✅ Clean |
| Products with no price | **0** | ✅ Clean |
| Duplicate (brand, name) pairs live | **0** | ✅ Clean (after earlier cull) |
| Colour-option list with duplicate names | **0** | ✅ Clean |
| Colour-option entries missing hex | **0** | ✅ Clean |
| Names with double spaces | **0** | ✅ Clean |
| Descriptions with double spaces | **0** | ✅ Clean |
| `is_new=true` on products that aren't new | (was set on ~395) | ✅ Reset earlier — owner re-flags real arrivals |
| Region/global duplicates (China/Russia/India) | 48 | ✅ Hidden earlier (reversible) |
| Names with redundant brand prefix (e.g. `Apple AirPods Pro 3`) | **205** | ✅ **Stripped now** — clean canonical structure |
| Live products with no `image_url` | **9** | ⚠ Falls back to branded SVG mockup (UI-handled). Owner can upload real photos via portal. |
| Live products with hotlink-blocked `image_url` (gsmarena) | **88** | ⚠ Falls back to SVG mockup at runtime. **Owner upload recommended.** |

## What the data now looks like

The catalogue follows a clean canonical structure:

```
brand          → "Apple"                  (column: brand)
name           → "iPhone 17 Pro Max"      (column: name, no redundant prefix)
storage tiers  → 256 GB / 512 GB / 1 TB / 2 TB    (column: storage_options [{label, price, mrp}])
colour options → Cosmic Orange / Deep Blue / Silver / Black / White
                                          (column: color_options [{name, hex, image_url?}])
```

The product page renders `${brand} ${name} ${selectedStorage} - ${selectedColour}`
in the WhatsApp message and meta tags, which gives the
"Apple iPhone 17 Pro Max 256GB – Natural Titanium" canonical reading the user
sees when sharing a deep link.

## Image standardisation (UI)

Already enforced in CSS — no per-product fix needed:

- **Aspect ratio**: `.product-media { aspect-ratio: 1 / 1 }` — every card has a perfect square media tile.
- **Alignment**: `display: grid; place-items: center` — images centred horizontally and vertically.
- **Padding**: 22px desktop / 14px tablet / 12px mobile — consistent.
- **No stretching**: `object-fit: contain` on `img`, capped at 88% of tile.
- **Lazy loading**: `loading="lazy"` on every catalogue image.
- **Alt text**: now `${brand} ${name}` (was just `name`) — accessible and SEO-strong.
- **Broken-image fallback**: any image that fails to load reveals a branded SVG phone mockup (phones) or a tidy text placeholder (accessories), recoloured to the active colour swatch on the PDP.

## Card layout (UI)

Already engineered for equal-height cards — no per-card fix needed:

- `.product-card { display: flex; flex-direction: column }` — vertical stack.
- `.product-body { flex: 1 }` — body stretches to fill remaining height.
- `.product-price-row { margin-top: auto }` — price + buttons pinned to bottom across the grid row.
- `.product-desc { -webkit-line-clamp: 2 }` — descriptions capped at two lines so cards stay uniform.
- Responsive grid: 4 / 3 / 2 / 2 columns at desktop / tablet / mobile-large / mobile.

## Variant / colour mapping

- Every live product has at least one colour option (402/402).
- 23 products have a single colour (single-finish items — fine).
- No duplicate colour names within any product.
- All colour entries have a hex swatch — the dots always render.
- Clicking a colour swatch on the PDP updates the highlight, the colour name, the WhatsApp message, and recolours the phone mockup when a per-colour photo isn't available.

## Manual actions remaining for the owner

These need a human, not a script — left clearly flagged:

1. **Upload real photos** for the ~97 products whose external image URLs are hotlink-blocked. Sign in to `/admin.html`, open any product, drop in a JPG/PNG/WebP — it stores in Supabase Storage and always loads. Cover photo + a small gallery for popular models is the highest-value polish.
2. **Mark genuinely new arrivals** with the "New" badge from the portal — `is_new` was reset catalogue-wide because it was set on essentially every product, diluting the badge.
3. **Re-flag any hidden product** if you still stock it (Dashboard → "Restock list" → "Back in stock"). Hidden products are not deleted; they're paused.
4. **Set true India launch MRPs for mid/budget phones** — flagships are at verified official India launch prices; mid/budget models are tied to a realistic base price + standard storage increments and not individually verified.

## How to re-run this audit

```sql
-- Names with redundant brand prefix
select id, brand, name from products where name ilike brand || ' %';

-- Duplicates (brand, name)
select brand, name, count(*) from products where in_stock
group by brand, name having count(*) > 1;

-- Missing assets
select id, brand, name from products
where in_stock and (image_url is null or image_url = '');

-- Colour-list anomalies
select id, brand, name, color_options from products where in_stock and
  jsonb_array_length(color_options) <> (
    select count(distinct lower(elem->>'name'))
    from jsonb_array_elements(color_options) elem
  );
```
