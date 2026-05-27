import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';
import Chart from 'https://esm.sh/chart.js@4.4.3/auto';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const CAT = { smartphone:'Mobiles', tablets:'iPad / Tablets', tws:'TWS', headphones:'Headphones', smartwatches:'Smartwatches' };
const catLabel = (c) => CAT[c] || c || '';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

let products = [];
let editingId = null;
let pendingPhotoUrl = null;
let photoChanged = false;
let soldProduct = null;
let salesChart = null;
let lastSales = [];
let currentRange = 'month';

/* ---------------- boot ---------------- */
init();
async function init() {
  wireLogin(); wireTabs(); wireEditor(); wireSold(); wireProductsBar(); wireSalesRange();
  const { data: { session } } = await supabase.auth.getSession();
  session ? showApp() : showLogin();
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') showApp();
    if (event === 'SIGNED_OUT') showLogin();
  });
}

function showLogin() { $('#login-screen').hidden = false; $('#app').hidden = true; }
async function showApp() {
  $('#login-screen').hidden = true; $('#app').hidden = false;
  $('#login-password').value = '';
  await loadProducts();
  await loadDashboard();
}

function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast' + (isErr ? ' err' : ''); t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------------- auth ---------------- */
function wireLogin() {
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#login-btn'), err = $('#login-error');
    err.hidden = true; btn.disabled = true; btn.textContent = 'Signing in…';
    const { error } = await supabase.auth.signInWithPassword({
      email: $('#login-email').value.trim(),
      password: $('#login-password').value
    });
    btn.disabled = false; btn.textContent = 'Sign in';
    if (error) { err.textContent = error.message || 'Could not sign in.'; err.hidden = false; }
  });
  $('#logout-btn').addEventListener('click', () => supabase.auth.signOut());
}

function wireTabs() {
  $$('.tab').forEach((t) => t.addEventListener('click', () => {
    $$('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    const v = t.dataset.tab;
    $('#view-dashboard').hidden = v !== 'dashboard';
    $('#view-products').hidden = v !== 'products';
  }));
}

/* ---------------- products ---------------- */
async function loadProducts() {
  const { data, error } = await supabase.from('products').select('*')
    .order('sort_order', { ascending: true }).order('id', { ascending: true });
  if (error) { toast('Could not load products', true); return; }
  products = data || [];
  populateBrandList();
  renderProducts();
}

function populateBrandList() {
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  $('#brand-list').innerHTML = brands.map((b) => `<option value="${esc(b)}">`).join('');
}

function wireProductsBar() {
  $('#prod-search').addEventListener('input', renderProducts);
  $('#prod-cat-filter').addEventListener('change', renderProducts);
}

function renderProducts() {
  const q = ($('#prod-search').value || '').toLowerCase();
  const cat = $('#prod-cat-filter').value;
  const items = products.filter((p) => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (q && !`${p.brand} ${p.name}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const list = $('#products-list');
  if (!items.length) { list.innerHTML = '<p class="empty">No products match.</p>'; return; }
  list.innerHTML = items.map(rowHtml).join('');
  $$('#products-list .prod-row').forEach((row) => {
    const p = products.find((x) => x.id === +row.dataset.id);
    row.querySelector('[data-act=toggle]').addEventListener('click', () => toggleStock(p));
    row.querySelector('[data-act=sell]').addEventListener('click', () => openSold(p));
    row.querySelector('[data-act=edit]').addEventListener('click', () => openEditor(p));
    row.querySelector('[data-act=del]').addEventListener('click', () => delProduct(p));
  });
}

function rowHtml(p) {
  const inStock = p.in_stock !== false;
  return `<div class="prod-row" data-id="${p.id}">
    <img src="${esc(p.image_url || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"/>
    <div class="pr-main">
      <div class="pr-name">${esc(p.brand)} ${esc(p.name)}</div>
      <div class="pr-meta">${esc(catLabel(p.category))} · <span class="pr-price">${fmt(p.price_inr)}</span></div>
    </div>
    <div class="pr-actions">
      <button class="stock-pill ${inStock ? 'in' : 'out'}" data-act="toggle">${inStock ? 'In stock' : 'Sold out'}</button>
      <button class="mini sell" data-act="sell">Mark sold</button>
      <button class="mini" data-act="edit">Edit</button>
      <button class="mini danger" data-act="del">Delete</button>
    </div>
  </div>`;
}

async function toggleStock(p) {
  const newVal = !(p.in_stock !== false);
  const { error } = await supabase.from('products').update({ in_stock: newVal }).eq('id', p.id);
  if (error) { toast('Update failed', true); return; }
  p.in_stock = newVal; renderProducts(); loadDashboard();
  toast(newVal ? 'Marked in stock' : 'Marked sold out');
}

async function delProduct(p) {
  if (!confirm(`Delete "${p.brand} ${p.name}"?\nThis removes it from the website.`)) return;
  const { error } = await supabase.from('products').delete().eq('id', p.id);
  if (error) { toast('Delete failed', true); return; }
  products = products.filter((x) => x.id !== p.id);
  renderProducts(); loadDashboard(); toast('Product deleted');
}

/* ---------------- editor ---------------- */
function wireEditor() {
  $('#add-product-btn').addEventListener('click', () => openEditor(null));
  $$('[data-close-editor]').forEach((b) => b.addEventListener('click', closeEditor));
  $('#photo-btn').addEventListener('click', () => $('#photo-input').click());
  $('#photo-input').addEventListener('change', (e) => handlePhoto(e.target.files[0]));
  $('#product-form').addEventListener('submit', saveProduct);
}

function openEditor(p) {
  editingId = p ? p.id : null;
  pendingPhotoUrl = p?.image_url || null;
  photoChanged = false;
  $('#editor-title').textContent = p ? 'Edit product' : 'Add product';
  $('#f-brand').value = p?.brand || '';
  $('#f-name').value = p?.name || '';
  $('#f-category').value = p?.category || 'smartphone';
  $('#f-price').value = p?.price_inr ?? '';
  $('#f-mrp').value = p?.mrp_inr ?? '';
  $('#f-desc').value = p?.description || '';
  $('#f-instock').checked = p ? (p.in_stock !== false) : true;
  $('#f-new').checked = !!p?.is_new;
  $('#f-featured').checked = !!p?.featured;
  $('#f-colors').value = Array.isArray(p?.color_options) ? p.color_options.map((c) => c.name).filter(Boolean).join(', ') : '';
  $('#f-highlights').value = Array.isArray(p?.highlights) ? p.highlights.join('\n') : '';
  $('#photo-hint').textContent = 'Pick from gallery — auto-compressed before saving.';
  setPhotoPreview(pendingPhotoUrl);
  $('#editor-error').hidden = true;
  $('#editor').hidden = false;
}
function closeEditor() { $('#editor').hidden = true; $('#photo-input').value = ''; }

function setPhotoPreview(url) {
  $('#photo-preview').innerHTML = url ? `<img src="${esc(url)}" alt=""/>` : '<span>No photo</span>';
}

async function handlePhoto(file) {
  if (!file) return;
  const hint = $('#photo-hint');
  hint.textContent = 'Compressing…';
  try {
    const blob = await compressImage(file, 1000, 0.82);
    hint.textContent = 'Uploading…';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from('product-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    pendingPhotoUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    photoChanged = true;
    setPhotoPreview(pendingPhotoUrl);
    hint.textContent = 'Photo ready ✓';
  } catch (err) {
    hint.textContent = 'Upload failed — try again.';
    toast('Photo upload failed', true);
  }
}

function compressImage(file, maxW, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('blob failed'))), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function saveProduct(e) {
  e.preventDefault();
  const err = $('#editor-error'); err.hidden = true;
  const brand = $('#f-brand').value.trim(), name = $('#f-name').value.trim();
  if (!brand || !name) { err.textContent = 'Brand and model name are required.'; err.hidden = false; return; }
  const price = parseInt($('#f-price').value, 10);
  if (isNaN(price)) { err.textContent = 'Enter a selling price.'; err.hidden = false; return; }
  const mrp = $('#f-mrp').value ? parseInt($('#f-mrp').value, 10) : null;
  const colors = $('#f-colors').value.split(',').map((s) => s.trim()).filter(Boolean).map((n) => ({ name: n }));
  const highlights = $('#f-highlights').value.split('\n').map((s) => s.trim()).filter(Boolean);

  const rec = {
    brand, name,
    category: $('#f-category').value,
    price_inr: price,
    mrp_inr: mrp,
    description: $('#f-desc').value.trim() || null,
    in_stock: $('#f-instock').checked,
    is_new: $('#f-new').checked,
    featured: $('#f-featured').checked,
    image_url: pendingPhotoUrl || null,
    color_options: colors,
    highlights,
    flipkart_query: `${brand} ${name}`,
    amazon_query: `${brand} ${name}`
  };
  if (photoChanged && pendingPhotoUrl) rec.gallery_urls = [pendingPhotoUrl];

  const btn = $('#save-product-btn'); btn.disabled = true; btn.textContent = 'Saving…';
  let resp;
  if (editingId) {
    resp = await supabase.from('products').update(rec).eq('id', editingId);
  } else {
    rec.sort_order = 900;
    if (!rec.gallery_urls) rec.gallery_urls = pendingPhotoUrl ? [pendingPhotoUrl] : [];
    resp = await supabase.from('products').insert(rec);
  }
  btn.disabled = false; btn.textContent = 'Save';
  if (resp.error) { err.textContent = resp.error.message; err.hidden = false; return; }
  closeEditor();
  await loadProducts(); loadDashboard();
  toast(editingId ? 'Product updated' : 'Product added');
}

/* ---------------- sales ---------------- */
function wireSold() {
  $$('[data-close-sold]').forEach((b) => b.addEventListener('click', closeSold));
  $('#sold-form').addEventListener('submit', saveSold);
}
function openSold(p) {
  soldProduct = p;
  $('#sold-product').textContent = `${p.brand} ${p.name}`;
  $('#sold-qty').value = 1;
  $('#sold-price').value = p.price_inr ?? '';
  $('#sold-date').value = new Date().toISOString().slice(0, 10);
  $('#sold-note').value = '';
  $('#sold-error').hidden = true;
  $('#sold-dialog').hidden = false;
}
function closeSold() { $('#sold-dialog').hidden = true; soldProduct = null; }

async function saveSold(e) {
  e.preventDefault();
  if (!soldProduct) return;
  const err = $('#sold-error'); err.hidden = true;
  const qty = parseInt($('#sold-qty').value, 10) || 1;
  const price = parseInt($('#sold-price').value, 10);
  if (isNaN(price)) { err.textContent = 'Enter the sale price.'; err.hidden = false; return; }
  const soldAt = $('#sold-date').value ? new Date($('#sold-date').value).toISOString() : new Date().toISOString();
  const rec = {
    product_id: soldProduct.id,
    product_name: `${soldProduct.brand} ${soldProduct.name}`,
    brand: soldProduct.brand,
    category: soldProduct.category,
    qty, unit_price_inr: price, sold_at: soldAt,
    note: $('#sold-note').value.trim() || null
  };
  const { error } = await supabase.from('sales').insert(rec);
  if (error) { err.textContent = error.message; err.hidden = false; return; }
  closeSold(); loadDashboard(); toast('Sale recorded 🎉');
}

/* ---------------- dashboard ---------------- */
async function loadDashboard() {
  const total = products.length;
  const inStock = products.filter((p) => p.in_stock !== false).length;
  const outStock = total - inStock;
  const [{ data: sales }, { data: events }] = await Promise.all([
    supabase.from('sales').select('*').order('sold_at', { ascending: true }),
    supabase.from('product_events').select('product_id,event_type')
  ]);
  lastSales = sales || [];
  renderStats(total, inStock, outStock, lastSales);
  renderTopSellers(lastSales);
  renderMostWanted(events || []);
  renderRestock();
  renderChart(lastSales, currentRange);
}

function statCard(label, value, sub, cls = '') {
  return `<div class="stat-card ${cls}"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
}
function renderStats(total, inStock, outStock, sales) {
  const now = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  let mRev = 0, mUnits = 0, qRev = 0;
  sales.forEach((s) => {
    const d = new Date(s.sold_at);
    if (d >= mStart) { mRev += s.total_inr; mUnits += s.qty; }
    if (d >= qStart) { qRev += s.total_inr; }
  });
  $('#stat-row').innerHTML = [
    statCard('This month', fmt(mRev), `${mUnits} unit${mUnits === 1 ? '' : 's'} sold`),
    statCard('This quarter', fmt(qRev), 'revenue'),
    statCard('In stock', inStock, 'live on site', 'good'),
    statCard('Sold out', outStock, outStock ? 'needs restock' : 'all good', outStock ? 'warn' : ''),
    statCard('Total products', total, 'in catalogue')
  ].join('');
}

function renderTopSellers(sales) {
  const map = {};
  sales.forEach((s) => {
    map[s.product_name] = map[s.product_name] || { units: 0, rev: 0 };
    map[s.product_name].units += s.qty; map[s.product_name].rev += s.total_inr;
  });
  const arr = Object.entries(map).map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units).slice(0, 5);
  $('#top-sellers').innerHTML = arr.length
    ? arr.map((a) => `<li><span class="rl-name">${esc(a.name)}</span><span class="rl-val">${a.units} sold · ${fmt(a.rev)}</span></li>`).join('')
    : '<li class="empty">No sales logged yet.</li>';
}

function renderMostWanted(events) {
  const map = {};
  events.forEach((e) => {
    map[e.product_id] = map[e.product_id] || { wa: 0, views: 0 };
    if (e.event_type === 'whatsapp') map[e.product_id].wa++; else map[e.product_id].views++;
  });
  const arr = Object.entries(map).map(([pid, v]) => {
    const p = products.find((x) => x.id === +pid);
    return p ? { name: `${p.brand} ${p.name}`, score: v.wa * 3 + v.views, wa: v.wa, views: v.views } : null;
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 5);
  $('#most-wanted').innerHTML = arr.length
    ? arr.map((a) => `<li><span class="rl-name">${esc(a.name)}</span><span class="rl-val">${a.wa ? a.wa + ' enquiries' : a.views + ' views'}</span></li>`).join('')
    : '<li class="empty">No enquiries tracked yet.</li>';
}

function renderRestock() {
  const out = products.filter((p) => p.in_stock === false);
  const el = $('#restock-list');
  if (!out.length) { el.innerHTML = '<p class="empty">Everything is in stock 🎉</p>'; return; }
  el.innerHTML = out.map((p) => `<div class="restock-row" data-id="${p.id}"><span class="name">${esc(p.brand)} ${esc(p.name)}</span><button class="mini" data-act="back">Back in stock</button></div>`).join('');
  $$('#restock-list .restock-row').forEach((r) => {
    const p = products.find((x) => x.id === +r.dataset.id);
    r.querySelector('[data-act=back]').addEventListener('click', async () => {
      const { error } = await supabase.from('products').update({ in_stock: true }).eq('id', p.id);
      if (error) { toast('Update failed', true); return; }
      p.in_stock = true; renderProducts(); loadDashboard(); toast('Marked in stock');
    });
  });
}

function wireSalesRange() {
  $$('#sales-range .seg-btn').forEach((b) => b.addEventListener('click', () => {
    $$('#sales-range .seg-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); currentRange = b.dataset.range;
    renderChart(lastSales, currentRange);
  }));
}

function monthBuckets(sales) {
  const labels = [], keys = [], values = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${d.getMonth()}`);
    labels.push(d.toLocaleString('en-IN', { month: 'short' }) + (d.getMonth() === 0 ? ` '${String(d.getFullYear()).slice(2)}` : ''));
    values.push(0);
  }
  sales.forEach((s) => {
    const d = new Date(s.sold_at), idx = keys.indexOf(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx >= 0) values[idx] += s.total_inr;
  });
  return { labels, values };
}
function quarterBuckets(sales) {
  const labels = [], keys = [], values = [];
  const now = new Date(), curQ = Math.floor(now.getMonth() / 3);
  for (let i = 7; i >= 0; i--) {
    let q = curQ - i, y = now.getFullYear();
    while (q < 0) { q += 4; y--; }
    keys.push(`${y}-Q${q}`); labels.push(`Q${q + 1} '${String(y).slice(2)}`); values.push(0);
  }
  sales.forEach((s) => {
    const d = new Date(s.sold_at), idx = keys.indexOf(`${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`);
    if (idx >= 0) values[idx] += s.total_inr;
  });
  return { labels, values };
}
function renderChart(sales, range) {
  const buckets = range === 'quarter' ? quarterBuckets(sales) : monthBuckets(sales);
  if (salesChart) salesChart.destroy();
  salesChart = new Chart($('#sales-chart'), {
    type: 'bar',
    data: { labels: buckets.labels, datasets: [{ data: buckets.values, backgroundColor: '#F5295B', borderRadius: 6, maxBarThickness: 46 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmt(c.parsed.y) } } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => v >= 1000 ? '₹' + (v / 1000) + 'k' : '₹' + v } }, x: { grid: { display: false } } }
    }
  });
}
