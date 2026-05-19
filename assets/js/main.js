// Namaskar Telecom — front-end interactions
(function () {
  // Mobile nav toggle
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Favourite toggle
  document.querySelectorAll('.product-fav').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      btn.classList.toggle('active');
      btn.style.color = btn.classList.contains('active') ? '#E63946' : '';
    });
  });

  // Contact form (front-end only — first draft)
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('form-notice');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      if (!name) return;
      notice.textContent = `Thanks ${name.split(' ')[0]}! We'll get back to you on WhatsApp shortly.`;
      notice.classList.add('show');
      form.reset();
      setTimeout(() => notice.classList.remove('show'), 6000);
    });
  }

  // Product filter / search (products page)
  const search = document.getElementById('search');
  const brandSel = document.getElementById('brand');
  const sortSel = document.getElementById('sort');
  const grid = document.getElementById('product-grid');

  if (grid && (search || brandSel || sortSel)) {
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    const apply = () => {
      const q = (search?.value || '').toLowerCase().trim();
      const b = brandSel?.value || 'all';

      let visible = cards.filter(c => {
        const name = c.dataset.name.toLowerCase();
        const brand = c.dataset.brand;
        const matchQ = !q || name.includes(q) || brand.toLowerCase().includes(q);
        const matchB = b === 'all' || brand === b;
        return matchQ && matchB;
      });

      const sort = sortSel?.value || 'featured';
      if (sort === 'low') visible.sort((a, b) => +a.dataset.price - +b.dataset.price);
      else if (sort === 'high') visible.sort((a, b) => +b.dataset.price - +a.dataset.price);
      else if (sort === 'new') visible.sort((a, b) => (b.dataset.new === 'true') - (a.dataset.new === 'true'));

      cards.forEach(c => (c.style.display = 'none'));
      visible.forEach(c => {
        c.style.display = '';
        grid.appendChild(c);
      });

      const empty = document.getElementById('empty-state');
      if (empty) empty.style.display = visible.length ? 'none' : 'block';
    };

    [search, brandSel, sortSel].forEach(el => el && el.addEventListener('input', apply));
  }
})();
