import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WA_NUMBER = '918082220143';
const fmtPrice = (n) => '₹' + Number(n).toLocaleString('en-IN');
const wa = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const flipkart = (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;
const amazon = (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;

const brandColor = {
  Apple: '#0F172A',
  Samsung: '#1D3557',
  Vivo: '#0EA5E9',
  OPPO: '#16A34A',
  Nothing: '#EAEAEA',
  Tecno: '#8B5CF6',
  OnePlus: '#E63946',
  Xiaomi: '#FF6900',
  Realme: '#F1C40F',
  Motorola: '#0B5394',
};

function svgPhone(brand) {
  const c = brandColor[brand] || '#1f2937';
  return `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="160" height="380" rx="30" fill="#1a1a1a"/>
    <rect x="26" y="16" width="148" height="368" rx="26" fill="${c}"/>
    <circle cx="100" cy="30" r="4" fill="#000"/>
  </svg>`;
}

function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function productCard(p) {
  const disc = discountPct(p.price_inr, p.mrp_inr);
  const title = `${p.name}${p.storage ? ' ' + p.storage : ''}`;
  const searchQ = p.flipkart_query || title;
  const waMsg = `Hi Namaskar Telecom, is the ${title} available?`;
  return `
    <article class="product-card" data-name="${escapeHtml(p.name)}" data-brand="${escapeHtml(p.brand)}" data-price="${p.price_inr}" data-new="${p.is_new}">
      <div class="product-media">
        ${p.is_new ? '<span class="product-tag new">New</span>' : ''}
        <button class="product-fav" aria-label="Save">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        ${svgPhone(p.brand)}
      </div>
      <div class="product-body">
        <span class="product-brand">${escapeHtml(p.brand)}</span>
        <h3 class="product-name">${escapeHtml(title)}</h3>
        <div class="product-price-row">
          <span class="price">${fmtPrice(p.price_inr)}</span>
          ${p.mrp_inr && p.mrp_inr > p.price_inr ? `<span class="price-old">${fmtPrice(p.mrp_inr)}</span>` : ''}
          ${disc ? `<span class="discount">${disc}% OFF</span>` : ''}
        </div>
        <div class="product-actions">
          <a href="${wa(waMsg)}" class="btn btn-primary" target="_blank" rel="noopener">Enquire</a>
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

function attachFavToggle(scope = document) {
  scope.querySelectorAll('.product-fav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? '#E63946' : '';
    });
  });
}

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
    grid.innerHTML = '<div class="catalog-error">Unable to load the catalogue right now. Please WhatsApp us at +91 80822 20143 — we\'ll send model + price instantly.</div>';
    return;
  }

  renderCatalog(data);
  attachFilters(data);
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
}

function attachFilters(allProducts) {
  const search = document.getElementById('search');
  const brandSel = document.getElementById('brand');
  const sortSel = document.getElementById('sort');
  if (!(search || brandSel || sortSel)) return;

  const apply = () => {
    const q = (search?.value || '').toLowerCase().trim();
    const b = brandSel?.value || 'all';

    let visible = allProducts.filter((p) => {
      const name = `${p.name} ${p.storage || ''}`.toLowerCase();
      const matchQ = !q || name.includes(q) || p.brand.toLowerCase().includes(q);
      const matchB = b === 'all' || p.brand === b;
      return matchQ && matchB;
    });

    const sort = sortSel?.value || 'featured';
    if (sort === 'low') visible.sort((a, b) => a.price_inr - b.price_inr);
    else if (sort === 'high') visible.sort((a, b) => b.price_inr - a.price_inr);
    else if (sort === 'new') visible.sort((a, b) => (b.is_new === true) - (a.is_new === true) || (b.sort_order - a.sort_order));
    else visible.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0) || b.price_inr - a.price_inr);

    renderCatalog(visible);
  };

  [search, brandSel, sortSel].forEach((el) => el && el.addEventListener('input', apply));
}

async function loadFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="catalog-loading" style="grid-column:1/-1;">Loading featured phones…</div>';

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('sort_order', { ascending: false })
    .limit(4);

  if (error || !data || !data.length) {
    console.error('Supabase featured error:', error);
    grid.innerHTML = '<div class="catalog-error" style="grid-column:1/-1;">Featured phones will be back shortly. <a href="products.html">Browse all products</a></div>';
    return;
  }

  grid.innerHTML = data.map(productCard).join('');
  attachFavToggle(grid);
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

document.addEventListener('DOMContentLoaded', () => {
  wireBaseInteractions();
  loadFullCatalog();
  loadFeatured();
  wireContactForm();
});
