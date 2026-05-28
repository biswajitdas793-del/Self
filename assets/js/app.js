import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WA_NUMBER = '918082220143';
const fmtPrice = (n) => '₹' + Number(n).toLocaleString('en-IN');
const wa = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

// Fire-and-forget demand tracking for the owner dashboard. Never blocks the UI.
function trackEvent(productId, eventType) {
  if (!productId) return;
  try {
    supabase.from('product_events').insert({ product_id: productId, event_type: eventType }).then(() => {}, () => {});
  } catch (_) { /* tracking must never break the page */ }
}
const flipkart = (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;
const amazon = (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;

/* ===== Phone illustration system =====
   Renders a distinct mockup per phone based on brand + form factor + id-derived color.
   Front view shows screen + brand wordmark; back view shows brand-correct camera layout. */

const BRAND_PALETTE = {
  Apple:    [['#1F1F22','#FFF'], ['#A8A29E','#1F1F22'], ['#C9B58B','#1F1F22'], ['#F5F5F0','#1F1F22']],
  Samsung:  [['#20201F','#B9B4AE'], ['#3A3A3F','#C9C4BE'], ['#7D7A82','#1F1F22'], ['#4F2E2E','#D4A099']],
  Vivo:     [['#22201E','#C9824B'], ['#143A2E','#C9B58B'], ['#E8E4D9','#1F1F22'], ['#2D5547','#E8E4D9']],
  OPPO:     [['#0F2A1F','#7BA890'], ['#1F1F22','#E8E4D9'], ['#7D7A82','#1F1F22'], ['#3D2E4A','#C9A8D9']],
  OnePlus:  [['#1F1F1F','#7BA890'], ['#143A2E','#E8E4D9'], ['#2D2D2D','#D14B45']],
  Xiaomi:   [['#1F1F22','#FF6900'], ['#26241F','#E06A2B'], ['#E8E4D9','#1F1F22'], ['#1F1F1F','#A8A29E']],
  Realme:   [['#B89067','#1F1F22'], ['#1F1F22','#F5C453'], ['#2E2A28','#E8E4D9']],
  Motorola: [['#3A4A3F','#E8E4D9'], ['#1F1F22','#D4A099'], ['#5B6D54','#E8E4D9']],
  Nothing:  [['#1A1A1A','#F5F5F5'], ['#F5F5F5','#1A1A1A']],
  Tecno:    [['#1F1F1F','#C9B58B'], ['#143A2E','#E8E4D9'], ['#3D3D3D','#F5C453']],
};

function pickColors(brand, id) {
  const palette = BRAND_PALETTE[brand] || [['#1F1F22','#A8A29E']];
  return palette[id % palette.length];
}

/* Brand-specific camera arrangement on the back of a bar phone. Returns SVG markup,
   positioned in a 200x300 viewport at top-left around (40,40). */
function brandCamera(brand, accentColor) {
  const lens = (cx, cy, r = 14) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0A0A0A" stroke="#2A2A2A" stroke-width="1.5"/>
     <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#2A2A30"/>
     <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.18}" fill="rgba(255,255,255,.35)"/>`;
  const flash = (cx, cy) =>
    `<circle cx="${cx}" cy="${cy}" r="4" fill="#F5E9C7" opacity=".85"/>`;

  switch (brand) {
    case 'Apple':
      // Square island, 3 lenses 2x2 layout (top-left, top-right, bottom-left)
      return `
        <rect x="36" y="36" width="92" height="92" rx="22" fill="rgba(0,0,0,.35)"/>
        ${lens(64, 64, 15)} ${lens(102, 64, 15)} ${lens(64, 102, 15)}
        ${flash(102, 102)}`;
    case 'Samsung':
      // Floating 3 vertical lenses, no island (S-series style)
      return `
        ${lens(60, 50, 14)} ${lens(60, 86, 14)} ${lens(60, 122, 14)}
        ${flash(60, 152)}`;
    case 'Vivo':
      // Large circular island with 2 lenses + small lens
      return `
        <circle cx="80" cy="80" r="50" fill="rgba(0,0,0,.42)"/>
        ${lens(64, 64, 16)} ${lens(96, 96, 16)} ${lens(64, 100, 9)}
        ${flash(100, 60)}`;
    case 'OPPO':
      // Big pill vertical with 3 lenses centered
      return `
        <rect x="48" y="34" width="64" height="108" rx="32" fill="rgba(0,0,0,.4)"/>
        ${lens(80, 56, 14)} ${lens(80, 90, 14)} ${lens(80, 124, 10)}
        ${flash(80, 148)}`;
    case 'OnePlus':
      // Big circular ring with 3 lenses (Hasselblad-style)
      return `
        <circle cx="80" cy="80" r="56" fill="rgba(0,0,0,.4)"/>
        <circle cx="80" cy="80" r="50" fill="none" stroke="#3A3A3A" stroke-width="1.5"/>
        ${lens(62, 62, 14)} ${lens(98, 62, 14)} ${lens(80, 98, 14)}
        ${flash(110, 110)}`;
    case 'Xiaomi':
      // Large square island with prominent main + supporting lens
      return `
        <rect x="34" y="34" width="92" height="68" rx="14" fill="rgba(0,0,0,.4)"/>
        ${lens(60, 68, 20)} ${lens(102, 60, 11)} ${lens(102, 88, 9)}
        ${flash(124, 116)}`;
    case 'Realme':
      // Circle island with 3 vertical lenses
      return `
        <ellipse cx="62" cy="80" rx="32" ry="56" fill="rgba(0,0,0,.4)"/>
        ${lens(62, 50, 13)} ${lens(62, 84, 13)} ${lens(62, 118, 11)}
        ${flash(106, 50)}`;
    case 'Motorola':
      // Vertical pill with 2-3 lenses
      return `
        <rect x="46" y="36" width="44" height="110" rx="22" fill="rgba(0,0,0,.38)"/>
        ${lens(68, 60, 14)} ${lens(68, 94, 14)} ${lens(68, 128, 10)}
        ${flash(108, 60)}`;
    case 'Nothing':
      // Two distinct circles, transparent feel — minimalist
      return `
        ${lens(60, 50, 17)} ${lens(60, 96, 17)}
        <circle cx="60" cy="50" r="6" fill="rgba(245,245,245,.95)"/>
        <circle cx="60" cy="96" r="6" fill="rgba(245,245,245,.95)"/>
        <rect x="40" y="140" width="80" height="2" rx="1" fill="rgba(245,245,245,.5)"/>
        <rect x="40" y="148" width="56" height="2" rx="1" fill="rgba(245,245,245,.35)"/>`;
    case 'Tecno':
      // Square island with 4 lenses (camera-heavy)
      return `
        <rect x="34" y="34" width="92" height="92" rx="14" fill="rgba(0,0,0,.4)"/>
        ${lens(60, 60, 14)} ${lens(100, 60, 14)} ${lens(60, 100, 14)} ${lens(100, 100, 10)}
        ${flash(124, 130)}`;
    default:
      return `${lens(60, 50, 14)} ${lens(60, 86, 14)} ${lens(60, 122, 14)}`;
  }
}

function svgBar(p) {
  const [body, accent] = pickColors(p.brand, p.id || 0);
  const cam = brandCamera(p.brand, accent);
  return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g${p.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${body}"/>
        <stop offset="1" stop-color="${shadeColor(body, -0.25)}"/>
      </linearGradient>
      <linearGradient id="r${p.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgba(255,255,255,.12)"/>
        <stop offset=".5" stop-color="rgba(255,255,255,0)"/>
        <stop offset="1" stop-color="rgba(0,0,0,.18)"/>
      </linearGradient>
    </defs>
    <!-- phone body (back side) -->
    <rect x="22" y="10" width="156" height="300" rx="28" fill="url(#g${p.id})"/>
    <rect x="22" y="10" width="156" height="300" rx="28" fill="url(#r${p.id})"/>
    <rect x="22" y="10" width="156" height="300" rx="28" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
    <!-- camera island offset to top-left -->
    <g transform="translate(0, 0)">
      ${cam}
    </g>
    <!-- brand wordmark, subtle, lower-middle -->
    <text x="100" y="285" font-family="Poppins, Inter, sans-serif" font-size="13" font-weight="700"
          fill="${accent}" text-anchor="middle" opacity=".85" letter-spacing="2">
      ${p.brand.toUpperCase()}
    </text>
  </svg>`;
}

function svgFold(p) {
  const [body, accent] = pickColors(p.brand, p.id || 0);
  const cam = brandCamera(p.brand, accent);
  // Open book: left panel showing back (with cameras + screen on right panel)
  return `<svg viewBox="0 0 320 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="gf${p.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${body}"/>
        <stop offset="1" stop-color="${shadeColor(body, -0.22)}"/>
      </linearGradient>
      <linearGradient id="gs${p.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#101014"/>
        <stop offset="1" stop-color="#1C1C22"/>
      </linearGradient>
    </defs>
    <!-- left panel (back of phone) -->
    <rect x="18" y="20" width="140" height="240" rx="14" fill="url(#gf${p.id})"/>
    <rect x="18" y="20" width="140" height="240" rx="14" fill="none" stroke="rgba(0,0,0,.2)"/>
    <g transform="translate(-10, 30) scale(.85)">${cam}</g>
    <!-- hinge -->
    <rect x="158" y="22" width="4" height="236" fill="rgba(0,0,0,.3)"/>
    <!-- right panel (inner screen) -->
    <rect x="162" y="20" width="140" height="240" rx="14" fill="url(#gs${p.id})"/>
    <rect x="162" y="20" width="140" height="240" rx="14" fill="none" stroke="rgba(0,0,0,.2)"/>
    <!-- screen content -->
    <rect x="172" y="36" width="120" height="56" rx="10" fill="rgba(255,255,255,.06)"/>
    <rect x="172" y="100" width="56" height="56" rx="10" fill="${accent}" opacity=".85"/>
    <rect x="236" y="100" width="56" height="56" rx="10" fill="rgba(255,255,255,.08)"/>
    <rect x="172" y="164" width="120" height="40" rx="10" fill="rgba(255,255,255,.05)"/>
    <text x="232" y="240" font-family="Poppins, Inter, sans-serif" font-size="10" font-weight="700"
          fill="rgba(255,255,255,.7)" text-anchor="middle" letter-spacing="2">${p.brand.toUpperCase()}</text>
  </svg>`;
}

function svgFlip(p) {
  const [body, accent] = pickColors(p.brand, p.id || 0);
  const cam = brandCamera(p.brand, accent);
  // Closed clamshell: small cover screen on top half, hinge mid, lower half closed
  return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="gp${p.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${body}"/>
        <stop offset="1" stop-color="${shadeColor(body, -0.22)}"/>
      </linearGradient>
    </defs>
    <!-- top half (with cover screen + cameras) -->
    <rect x="22" y="10" width="156" height="150" rx="22" fill="url(#gp${p.id})"/>
    <rect x="32" y="40" width="84" height="80" rx="10" fill="#101014"/>
    <text x="74" y="86" font-family="Poppins" font-size="11" font-weight="700"
          fill="rgba(255,255,255,.8)" text-anchor="middle">9:41</text>
    <text x="74" y="104" font-family="Inter" font-size="8" fill="rgba(255,255,255,.55)" text-anchor="middle">Mon, May 19</text>
    <!-- camera lenses on top-right -->
    <circle cx="148" cy="56" r="10" fill="#0A0A0A"/><circle cx="148" cy="56" r="5" fill="#2A2A30"/>
    <circle cx="148" cy="86" r="10" fill="#0A0A0A"/><circle cx="148" cy="86" r="5" fill="#2A2A30"/>
    <!-- hinge gap -->
    <rect x="22" y="160" width="156" height="6" fill="rgba(0,0,0,.3)"/>
    <!-- bottom half -->
    <rect x="22" y="166" width="156" height="146" rx="22" fill="url(#gp${p.id})"/>
    <text x="100" y="280" font-family="Poppins" font-size="13" font-weight="700"
          fill="${accent}" text-anchor="middle" opacity=".85" letter-spacing="2">${p.brand.toUpperCase()}</text>
  </svg>`;
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * percent)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * percent)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function phoneVisual(p) {
  if (p.image_url) {
    return `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('img-failed');this.remove();"/>`;
  }
  const ff = p.form_factor || 'bar';
  if (ff === 'fold') return svgFold(p);
  if (ff === 'flip') return svgFlip(p);
  return svgBar(p);
}

function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function specChip(label, icon) {
  if (!label) return '';
  return `<span class="spec-chip" title="${escapeHtml(label)}"><span class="spec-icon">${icon}</span>${escapeHtml(label)}</span>`;
}

const ICON = {
  display:  '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="14" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/></svg>',
  chip:     '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="1"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="15" x2="22" y2="15"/></svg>',
  camera:   '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  battery:  '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>',
};

function shortCamera(s) {
  if (!s) return null;
  // Take the first lens spec — e.g. "50MP + 50MP UW + 50MP Tele" -> "50MP triple"
  const parts = s.split('+').map(x => x.trim());
  const first = parts[0].match(/\d+MP/)?.[0] || parts[0];
  const total = parts.length;
  if (total >= 3) return `${first} triple`;
  if (total === 2) return `${first} dual`;
  return first;
}

function shortDisplay(s) {
  if (!s) return null;
  return s.split(' ').slice(0, 2).join(' ');
}

function shortProcessor(s) {
  if (!s) return null;
  // Shorten "Snapdragon 8 Elite for Galaxy" -> "SD 8 Elite"; "MediaTek Dimensity 9400" -> "Dimensity 9400"
  return s
    .replace(/^Snapdragon/, 'SD')
    .replace(/^MediaTek\s+/, '')
    .replace(/\s+for Galaxy$/, '')
    .replace(/\s+Bionic$/, '');
}

function productCard(p) {
  const disc = discountPct(p.price_inr, p.mrp_inr);
  const title = `${p.name}${p.storage ? ' ' + p.storage : ''}`;
  const searchQ = p.flipkart_query || title;
  const waMsg = `Hi Namaskar Telecom, is the ${title} available?`;
  const desc = p.description ? `<p class="product-desc">${escapeHtml(p.description)}</p>` : '';
  // Phone-only spec row. For accessories we lean on the description + highlights instead.
  const isPhone = (p.category || 'smartphone') === 'smartphone';
  const specs = isPhone ? `
    <div class="spec-row">
      ${specChip(shortDisplay(p.display), ICON.display)}
      ${specChip(shortProcessor(p.processor), ICON.chip)}
      ${specChip(shortCamera(p.main_camera), ICON.camera)}
      ${specChip(p.battery, ICON.battery)}
    </div>` : '';
  return `
    <article class="product-card" data-pid="${p.id}" data-pkey="${productKey(p)}" data-name="${escapeHtml(p.name)}" data-brand="${escapeHtml(p.brand)}" data-category="${escapeHtml(p.category || 'smartphone')}" data-price="${p.price_inr}" data-new="${p.is_new}" tabindex="0" role="link" aria-label="View specifications for ${escapeHtml(title)}">
      <div class="product-media product-media-${p.form_factor || 'bar'}">
        ${p.is_new ? '<span class="product-tag new">New</span>' : ''}
        ${disc ? `<span class="product-discount">-${disc}%</span>` : ''}
        <button class="product-fav" aria-label="Save">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        ${phoneVisual(p)}
      </div>
      <div class="product-body">
        <span class="product-brand">${escapeHtml(p.brand)}</span>
        <h3 class="product-name">${escapeHtml(title)}</h3>
        ${desc}
        ${specs}
        <div class="product-price-row">
          <span class="price">${fmtPrice(p.price_inr)}</span>
          ${p.mrp_inr && p.mrp_inr > p.price_inr ? `<span class="price-old">${fmtPrice(p.mrp_inr)}</span>` : ''}
        </div>
        <div class="product-actions">
          <a href="product.html?id=${p.id}" class="btn btn-ghost product-view-btn">View specs
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </a>
          <a href="${wa(waMsg)}" class="btn btn-primary" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        </div>
        <div class="compare-row">
          <a href="${flipkart(searchQ)}" target="_blank" rel="noopener" class="compare-btn fk" title="See current Flipkart price">
            <span class="compare-label">Flipkart</span>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
          <a href="${amazon(searchQ)}" target="_blank" rel="noopener" class="compare-btn am" title="See current Amazon price">
            <span class="compare-label">Amazon</span>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

const productKey = (p) => `${p.brand}|||${p.name}`;

function attachFavToggle(scope = document) {
  scope.querySelectorAll('.product-fav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('active');
    });
  });
}

function wireCardClicks(scope /*, productList */) {
  // Navigate to the dedicated product page. Buttons and inner links
  // (WhatsApp / Flipkart / Amazon / View specs) stop propagation so they
  // continue to work as their own targets.
  const go = (id) => { if (id) window.location.href = `product.html?id=${id}`; };
  scope.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      go(card.dataset.pid);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a, button')) return;
        e.preventDefault();
        go(card.dataset.pid);
      }
    });
  });
}

function ensureModalRoot() {
  let root = document.getElementById('product-modal');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'product-modal';
  root.className = 'pm-backdrop';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <button class="pm-close" type="button" aria-label="Close">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
      <div class="pm-content"></div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('.pm-close')) closeProductModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('open')) closeProductModal();
  });
  return root;
}

function specRow(label, value) {
  if (!value) return '';
  return `<div class="pm-spec"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

// Phone descriptions follow this pattern from GSMArena imports:
//   "Brand Model smartphone. Announced Mon YYYY. Features 6.7″ display, X chipset, NNNN mAh battery, NNN GB storage, N GB RAM, <extras>."
// We split that into a clean lede + a structured spec list so the detail modal
// has real rows instead of an empty grid (the dedicated columns are still NULL).
function parsePhoneDescription(desc) {
  if (!desc) return { lede: '', specs: [] };
  const fm = desc.match(/^(.*?)\bFeatures\s+(.+?)\.?\s*$/i);
  if (!fm) return { lede: desc.trim(), specs: [] };
  const lede = fm[1].trim().replace(/\.+$/, '') + '.';
  const parts = fm[2].split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  const specs = [];
  const others = [];
  for (const part of parts) {
    let m;
    if ((m = part.match(/^([\d.]+)\s*[″"]\s*display/i))) {
      specs.push(['Display', `${m[1]}″`]);
    } else if ((m = part.match(/^(.+?)\s+chipset$/i))) {
      specs.push(['Chipset', m[1].trim()]);
    } else if ((m = part.match(/^([\d,.]+)\s*mAh\s*battery/i))) {
      specs.push(['Battery', `${m[1]} mAh`]);
    } else if ((m = part.match(/^([\d,.]+)\s*GB\s*storage/i))) {
      specs.push(['Storage', `${m[1]} GB`]);
    } else if ((m = part.match(/^([\d,.]+)\s*TB\s*storage/i))) {
      specs.push(['Storage', `${m[1]} TB`]);
    } else if ((m = part.match(/^([\d,.]+)\s*GB\s*RAM/i))) {
      specs.push(['RAM', `${m[1]} GB`]);
    } else if (/IP\d{2}/i.test(part) || /water/i.test(part)) {
      specs.push(['Water resistance', part]);
    } else {
      others.push(part);
    }
  }
  if (others.length) specs.push(['Build / protection', others.join(', ')]);
  return { lede, specs };
}

function buildModalBody(p) {
  const title = `${p.name}${p.storage ? ' ' + p.storage : ''}`;
  const searchQ = p.flipkart_query || title;
  const waMsg = `Hi Namaskar Telecom, I'd like more details on the ${title}.`;
  const disc = discountPct(p.price_inr, p.mrp_inr);
  const isPhone = (p.category || 'smartphone') === 'smartphone';

  // Accessory descriptions are written as "Lead sentence. Highlights: A | B | C."
  // Phone descriptions are written as "Lead sentence. Announced X. Features ..."
  let lede = p.description || '';
  let highlights = [];
  let phoneSpecPairs = [];

  const hlMatch = lede.match(/^(.*?)\s*Highlights:\s*(.+?)\.?\s*$/i);
  if (hlMatch) {
    lede = hlMatch[1].trim();
    highlights = hlMatch[2].split('|').map((s) => s.trim()).filter(Boolean);
  } else if (isPhone) {
    const parsed = parsePhoneDescription(lede);
    lede = parsed.lede;
    phoneSpecPairs = parsed.specs;
  }

  // Prefer dedicated columns when populated; fall back to parsed pairs.
  const specRows = isPhone ? [
    ['Display', p.display],
    ['Chipset', p.processor],
    ['Main camera', p.main_camera],
    ['Battery', p.battery],
    ['Storage', p.storage],
  ].filter(([, v]) => v) : [];
  const finalSpecs = specRows.length ? specRows : phoneSpecPairs;
  const phoneSpecs = finalSpecs.length ? `
    <dl class="pm-specs">
      ${finalSpecs.map(([label, value]) => specRow(label, value)).join('')}
    </dl>` : '';

  const highlightChips = highlights.length ? `
    <div class="pm-highlights">
      ${highlights.map((h) => `<span class="pm-chip">${escapeHtml(h)}</span>`).join('')}
    </div>` : '';

  return `
    <div class="pm-media">
      ${p.image_url
        ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" referrerpolicy="no-referrer" loading="eager" />`
        : '<div class="pm-noimg">No image available</div>'}
    </div>
    <div class="pm-info">
      <div class="pm-brand">${escapeHtml(p.brand)}</div>
      <h2 id="pm-title" class="pm-name">${escapeHtml(title)}</h2>
      ${lede ? `<p class="pm-desc">${escapeHtml(lede)}</p>` : ''}
      <div class="pm-price-row">
        <span class="pm-price">${fmtPrice(p.price_inr)}</span>
        ${p.mrp_inr && p.mrp_inr > p.price_inr ? `<span class="pm-price-old">${fmtPrice(p.mrp_inr)}</span>` : ''}
        ${disc ? `<span class="pm-discount">Save ${disc}%</span>` : ''}
      </div>
      ${highlightChips}
      ${phoneSpecs}
      <div class="pm-actions">
        <a href="${wa(waMsg)}" target="_blank" rel="noopener" class="btn btn-primary">Enquire on WhatsApp</a>
        <a href="${flipkart(searchQ)}" target="_blank" rel="noopener" class="btn btn-ghost">Check Flipkart price</a>
        <a href="${amazon(searchQ)}" target="_blank" rel="noopener" class="btn btn-ghost">Check Amazon price</a>
      </div>
      <p class="pm-fineprint">Prices include GST. Walk in to compare hands-on, or message us to confirm availability before you visit.</p>
    </div>`;
}

function openProductModal(p) {
  const root = ensureModalRoot();
  root.querySelector('.pm-content').innerHTML = buildModalBody(p);
  root.classList.add('open');
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('pm-locked');
  root.querySelector('.pm-close')?.focus();
}

function closeProductModal() {
  const root = document.getElementById('product-modal');
  if (!root) return;
  root.classList.remove('open');
  root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('pm-locked');
}

function getCategoryFromUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get('category') || 'all';
  } catch (_) { return 'all'; }
}

const CATEGORY_LABELS = {
  smartphone: 'Mobiles',
  tablets: 'iPad / Tablets',
  tws: 'TWS Earbuds',
  headphones: 'Headphones',
  smartwatches: 'Smartwatches',
};

async function loadFullCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="catalog-loading">Loading catalogue from our store…</div>';

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: false })
    .order('price_inr', { ascending: false });

  if (error || !data) {
    console.error('Supabase products error:', error);
    const detail = error ? `<br><small style="color:var(--muted);">${escapeHtml(error.message || String(error))}</small>` : '';
    grid.innerHTML = `<div class="catalog-error">Unable to load the catalogue right now. Please WhatsApp us at +91 80822 20143 — we'll send model + price instantly.${detail}</div>`;
    return;
  }

  // Reflect URL ?category=… into the heading and active tab.
  const initialCat = getCategoryFromUrl();
  const heading = document.getElementById('page-title');
  if (heading && initialCat !== 'all' && CATEGORY_LABELS[initialCat]) {
    heading.textContent = CATEGORY_LABELS[initialCat];
  }
  document.querySelectorAll('#cat-tabs .cat-pill').forEach((a) => {
    a.classList.toggle('active', a.dataset.cat === initialCat);
  });

  renderCatalog(data);
  attachFilters(data, initialCat);
}

function renderCatalog(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<div class="catalog-empty">No products match your search. Try a different brand or keyword.</div>';
    return;
  }
  grid.innerHTML = items.map(productCard).join('');
  attachFavToggle(grid);
  wireCardClicks(grid, items);
  document.dispatchEvent(new CustomEvent('catalog:rendered', { detail: { grid } }));
}

function attachFilters(allProducts, initialCategory = 'all') {
  const search = document.getElementById('search');
  const brandSel = document.getElementById('brand');
  const sortSel = document.getElementById('sort');
  if (!(search || brandSel || sortSel)) return;

  // Rebuild brand options scoped to the active category so unrelated brands don't clutter the dropdown.
  const repopulateBrands = (cat) => {
    if (!brandSel) return;
    const pool = cat === 'all' ? allProducts : allProducts.filter((p) => (p.category || 'smartphone') === cat);
    const brands = Array.from(new Set(pool.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));
    const prev = brandSel.value;
    brandSel.innerHTML = '<option value="all">All brands</option>' +
      brands.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    brandSel.value = brands.includes(prev) ? prev : 'all';
  };

  repopulateBrands(initialCategory);

  const apply = () => {
    const q = (search?.value || '').toLowerCase().trim();
    const b = brandSel?.value || 'all';

    let visible = allProducts.filter((p) => {
      const name = `${p.name} ${p.storage || ''}`.toLowerCase();
      const matchQ = !q || name.includes(q) || p.brand.toLowerCase().includes(q);
      const matchB = b === 'all' || p.brand === b;
      const matchC = initialCategory === 'all' || (p.category || 'smartphone') === initialCategory;
      return matchQ && matchB && matchC;
    });

    const sort = sortSel?.value || 'featured';
    if (sort === 'low') visible.sort((a, b) => a.price_inr - b.price_inr);
    else if (sort === 'high') visible.sort((a, b) => b.price_inr - a.price_inr);
    else if (sort === 'new') visible.sort((a, b) => (b.is_new === true) - (a.is_new === true) || (b.sort_order - a.sort_order));
    else visible.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0) || b.price_inr - a.price_inr);

    renderCatalog(visible);
  };

  // Apply once on load so the category filter takes effect immediately.
  apply();

  [search, brandSel, sortSel].forEach((el) => el && el.addEventListener('input', apply));
}

async function loadFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="catalog-loading" style="grid-column:1/-1;">Loading featured products…</div>';

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('sort_order', { ascending: false })
    .limit(8);

  if (error || !data || !data.length) {
    console.error('Supabase featured error:', error);
    const detail = error ? `<br><small style="color:var(--muted);">${escapeHtml(error.message || String(error))}</small>` : '';
    grid.innerHTML = `<div class="catalog-error" style="grid-column:1/-1;">Featured products will be back shortly. <a href="products.html">Browse all products</a>${detail}</div>`;
    return;
  }

  grid.innerHTML = data.map(productCard).join('');
  attachFavToggle(grid);
  wireCardClicks(grid, data);
  document.dispatchEvent(new CustomEvent('catalog:rendered', { detail: { grid } }));
}

function wireContactForm() {
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('form-notice');
  if (!form || !notice) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = form.querySelector('[name="name"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const interest = form.querySelector('[name="interest"]').value;
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !phone) {
      notice.textContent = 'Please share your name and phone number.';
      notice.className = 'notice show error';
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending…';

    const { error } = await supabase
      .from('enquiries')
      .insert({ name, phone, interest, message });

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;

    if (error) {
      console.error('Enquiry insert error:', error);
      notice.textContent = 'Could not submit right now — please WhatsApp us on +91 80822 20143.';
      notice.className = 'notice show error';
      return;
    }

    notice.textContent = `Thanks ${name.split(' ')[0]}! We've received your enquiry and will reach out on WhatsApp shortly.`;
    notice.className = 'notice show success';
    form.reset();
    setTimeout(() => notice.classList.remove('show'), 8000);
  });
}

function wireBaseInteractions() {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  }
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  attachFavToggle();
}

// ===== Product detail page (product.html) =====
async function loadProductDetail() {
  const root = document.getElementById('pdp-root');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  if (!id) {
    root.innerHTML = '<div class="catalog-error">No product specified. <a href="products.html">Browse all products</a></div>';
    return;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('PDP error:', error);
    root.innerHTML = '<div class="catalog-error">We couldn\'t find that product. <a href="products.html">Browse all products</a></div>';
    return;
  }

  trackEvent(data.id, 'view');
  renderProductDetail(data);
}

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || 'Products';
}

function renderProductDetail(p) {
  const title = `${p.brand} ${p.name}`;
  document.title = `${title} — Namaskar Telecom`;
  const crumbs = document.getElementById('pdp-crumbs');
  if (crumbs) {
    const catUrl = `products.html?category=${encodeURIComponent(p.category || 'smartphone')}`;
    crumbs.innerHTML = `<a href="index.html">Home</a> &nbsp;/&nbsp; <a href="products.html">Products</a> &nbsp;/&nbsp; <a href="${catUrl}">${escapeHtml(categoryLabel(p.category))}</a> &nbsp;/&nbsp; <span>${escapeHtml(p.name)}</span>`;
  }

  const gallery = (p.gallery_urls && p.gallery_urls.length) ? p.gallery_urls : (p.image_url ? [p.image_url] : []);
  const colors = Array.isArray(p.color_options) ? p.color_options : [];
  const storage = Array.isArray(p.storage_options) ? p.storage_options : [];
  const highlights = Array.isArray(p.highlights) ? p.highlights : [];
  const specs = p.detailed_specs && typeof p.detailed_specs === 'object' ? p.detailed_specs : {};

  // Active variant pricing — defaults to first storage option when present,
  // otherwise falls back to the catalogue base price.
  const initialVariant = storage.length && (storage[0].price_inr || storage[0].mrp_inr)
    ? { price_inr: storage[0].price_inr || p.price_inr, mrp_inr: storage[0].mrp_inr || p.mrp_inr }
    : { price_inr: p.price_inr, mrp_inr: p.mrp_inr };
  const disc = discountPct(initialVariant.price_inr, initialVariant.mrp_inr);
  const saveAmt = (initialVariant.mrp_inr && initialVariant.mrp_inr > initialVariant.price_inr) ? (initialVariant.mrp_inr - initialVariant.price_inr) : 0;
  const buildWaMsg = ({ colour, storage } = {}) => {
    const parts = [`Hi Namaskar Telecom, I'd like the ${p.brand} ${p.name}`];
    if (colour) parts.push(`in ${colour}`);
    if (storage) parts.push(`with ${storage}`);
    return parts.join(' ') + '.';
  };
  const initialColour = colors[0]?.name || '';
  const initialStorage = storage[0]?.label || '';
  const waMsg = buildWaMsg({ colour: initialColour, storage: initialStorage });
  const searchQ = p.flipkart_query || `${p.brand} ${p.name}`;

  const galleryHtml = gallery.length ? `
    <div class="pdp-gallery">
      <div class="pdp-stage">
        <img id="pdp-main-img" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(title)}" referrerpolicy="no-referrer" loading="eager" data-fallback="${escapeHtml(gallery[0])}" onerror="if(this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}" />
      </div>
      ${gallery.length > 1 ? `
        <div class="pdp-thumbs">
          ${gallery.map((src, i) => `
            <button class="pdp-thumb ${i === 0 ? 'active' : ''}" data-src="${escapeHtml(src)}" aria-label="View image ${i + 1}">
              <img src="${escapeHtml(src)}" alt="" referrerpolicy="no-referrer" loading="lazy" />
            </button>`).join('')}
        </div>` : ''}
    </div>` : `<div class="pdp-gallery"><div class="pdp-stage"><div class="pdp-noimg">No image available</div></div></div>`;

  const colorsHtml = colors.length ? `
    <section class="pdp-section">
      <h3 class="pdp-section-title">Colour <span class="pdp-section-value" id="pdp-color-name">${escapeHtml(colors[0].name || '')}</span></h3>
      <div class="pdp-swatches">
        ${colors.map((c, i) => `
          <button class="pdp-swatch ${i === 0 ? 'active' : ''}" data-name="${escapeHtml(c.name || '')}" data-image="${escapeHtml(c.image_url || '')}" aria-label="${escapeHtml(c.name || '')}" title="${escapeHtml(c.name || '')}">
            <span class="pdp-swatch-dot" style="background:${escapeHtml(c.hex || '#999')}"></span>
            <span class="pdp-swatch-label">${escapeHtml(c.name || '')}</span>
          </button>`).join('')}
      </div>
    </section>` : '';

  const storageHtml = storage.length ? `
    <section class="pdp-section">
      <h3 class="pdp-section-title">Storage <span class="pdp-section-value" id="pdp-storage-label">${escapeHtml(storage[0].label || '')}</span></h3>
      <div class="pdp-chips">
        ${storage.map((s, i) => `
          <button class="pdp-chip ${i === 0 ? 'active' : ''}" data-idx="${i}" data-label="${escapeHtml(s.label || '')}" data-price="${s.price_inr || ''}" data-mrp="${s.mrp_inr || ''}">${escapeHtml(s.label || '')}</button>`).join('')}
      </div>
    </section>` : '';

  const offersHtml = `
    <section class="pdp-offers">
      <div class="pdp-offer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="13" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg><div><strong>No-cost EMI</strong><span>From ₹999/month on leading bank cards</span></div></div>
      <div class="pdp-offer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12c0 1.7-.7 3.3-2 4.5L12 22l-7-5.5C3.7 15.3 3 13.7 3 12c0-5 4-9 9-9s9 4 9 9z"/></svg><div><strong>Instant exchange</strong><span>Trade in your old phone for immediate value</span></div></div>
      <div class="pdp-offer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><div><strong>100% genuine, GST invoice</strong><span>India warranty, sealed-box from authorised distributors</span></div></div>
    </section>`;

  const highlightsHtml = highlights.length ? `
    <section class="pdp-section">
      <h3 class="pdp-section-title">Highlights</h3>
      <ul class="pdp-highlights">
        ${highlights.map((h) => `<li>${escapeHtml(String(h))}</li>`).join('')}
      </ul>
    </section>` : '';

  const specSections = Object.entries(specs);
  const specsHtml = specSections.length ? `
    <section class="pdp-specs-wrap">
      <h2 class="pdp-h2">Specifications</h2>
      <div class="pdp-specs-grid">
        ${specSections.map(([section, rows]) => `
          <div class="pdp-spec-section">
            <h3>${escapeHtml(section)}</h3>
            <table>
              <tbody>
                ${(Array.isArray(rows) ? rows : []).map((r) => {
                  const [label, value] = Array.isArray(r) ? r : [r, ''];
                  return `<tr><th>${escapeHtml(String(label))}</th><td>${escapeHtml(String(value))}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`).join('')}
      </div>
    </section>` : '';

  const root = document.getElementById('pdp-root');
  root.innerHTML = `
    <div class="pdp-top">
      ${galleryHtml}
      <div class="pdp-info">
        <div class="pdp-brand">${escapeHtml(p.brand)}</div>
        <h1 class="pdp-name">${escapeHtml(p.name)}</h1>
        <div class="pdp-price-row">
          <span class="pdp-price" id="pdp-price">${fmtPrice(initialVariant.price_inr)}</span>
          <span class="pdp-price-old" id="pdp-price-old"${initialVariant.mrp_inr && initialVariant.mrp_inr > initialVariant.price_inr ? '' : ' hidden'}>${initialVariant.mrp_inr ? fmtPrice(initialVariant.mrp_inr) : ''}</span>
          <span class="pdp-discount" id="pdp-discount"${disc ? '' : ' hidden'}>${disc ? `${disc}% off` : ''}</span>
        </div>
        <div class="pdp-save" id="pdp-save"${saveAmt > 0 ? '' : ' hidden'}>${saveAmt > 0 ? `You save ${fmtPrice(saveAmt)} on MRP` : ''}</div>
        ${colorsHtml}
        ${storageHtml}
        ${offersHtml}
        ${highlightsHtml}
        <div class="pdp-actions">
          <a id="pdp-wa" href="${wa(waMsg)}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Enquire on WhatsApp</a>
          <a href="${flipkart(searchQ)}" target="_blank" rel="noopener" class="btn btn-ghost">Compare on Flipkart</a>
          <a href="${amazon(searchQ)}" target="_blank" rel="noopener" class="btn btn-ghost">Compare on Amazon</a>
        </div>
        <p class="pdp-fineprint">Walk in to compare hands-on, or message us on WhatsApp to confirm availability before you visit. Prices include GST.</p>
      </div>
    </div>
    ${specsHtml}
  `;

  // Wire up gallery thumbnails
  const mainImg = document.getElementById('pdp-main-img');
  root.querySelectorAll('.pdp-thumb').forEach((t) => {
    t.addEventListener('click', () => {
      root.querySelectorAll('.pdp-thumb').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      if (mainImg) mainImg.src = t.dataset.src;
    });
  });

  // Helpers that re-read the live selection from the DOM and rebuild the
  // WhatsApp message link. No separate state vars — DOM is the source of truth.
  const waAnchor = document.getElementById('pdp-wa');
  const updateWa = () => {
    if (!waAnchor) return;
    const colour = root.querySelector('.pdp-swatch.active')?.dataset.name || '';
    const storageLbl = root.querySelector('.pdp-chip.active')?.dataset.label || '';
    waAnchor.href = wa(buildWaMsg({ colour, storage: storageLbl }));
  };
  if (waAnchor) waAnchor.addEventListener('click', () => trackEvent(p.id, 'whatsapp'));

  // Wire up colour swatches (selection highlight + name label + optional
  // per-colour image swap + WhatsApp message rebuild)
  const colorName = document.getElementById('pdp-color-name');
  const fallbackImg = gallery[0] || '';
  root.querySelectorAll('.pdp-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      root.querySelectorAll('.pdp-swatch').forEach((x) => x.classList.remove('active'));
      sw.classList.add('active');
      if (colorName) colorName.textContent = sw.dataset.name || '';
      if (mainImg) {
        const colourImg = sw.dataset.image || '';
        mainImg.src = colourImg || fallbackImg;
      }
      updateWa();
    });
  });

  // Wire up storage chips (also recomputes the price block so users see the
  // 256 GB / 512 GB / 1 TB / 2 TB pricing change live)
  const storageLabel = document.getElementById('pdp-storage-label');
  const priceEl = document.getElementById('pdp-price');
  const priceOldEl = document.getElementById('pdp-price-old');
  const discountEl = document.getElementById('pdp-discount');
  const saveEl = document.getElementById('pdp-save');
  root.querySelectorAll('.pdp-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      root.querySelectorAll('.pdp-chip').forEach((x) => x.classList.remove('active'));
      chip.classList.add('active');
      if (storageLabel) storageLabel.textContent = chip.dataset.label || '';
      const price = parseInt(chip.dataset.price, 10);
      const mrp = parseInt(chip.dataset.mrp, 10);
      if (priceEl && Number.isFinite(price)) priceEl.textContent = fmtPrice(price);
      if (priceOldEl) {
        if (Number.isFinite(mrp) && mrp > price) { priceOldEl.textContent = fmtPrice(mrp); priceOldEl.hidden = false; }
        else { priceOldEl.hidden = true; }
      }
      if (discountEl) {
        const d = (Number.isFinite(mrp) && mrp > price) ? Math.round(((mrp - price) / mrp) * 100) : 0;
        if (d > 0) { discountEl.textContent = `${d}% off`; discountEl.hidden = false; } else { discountEl.hidden = true; }
      }
      if (saveEl) {
        if (Number.isFinite(mrp) && mrp > price) { saveEl.textContent = `You save ${fmtPrice(mrp - price)} on MRP`; saveEl.hidden = false; }
        else { saveEl.hidden = true; }
      }
      updateWa();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const safe = (fn, name) => { try { fn(); } catch (e) { console.error(`[app] ${name} failed:`, e); } };
  safe(wireBaseInteractions, 'wireBaseInteractions');
  safe(loadFullCatalog, 'loadFullCatalog');
  safe(loadFeatured, 'loadFeatured');
  safe(loadProductDetail, 'loadProductDetail');
  safe(wireContactForm, 'wireContactForm');
});

// Surface any unhandled promise rejection (Supabase fetches return promises)
// so the next debugging round doesn't have to guess at it.
window.addEventListener('unhandledrejection', (e) => {
  console.error('[app] unhandled rejection:', e.reason);
});
