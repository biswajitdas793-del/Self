// Motion layer — GSAP scroll reveals, stat counters, hero entrance, brand marquee.
// Loaded as a module after the catalogue script. If the CDN import fails, the
// module throws before any gsap.set() hides content, so the page degrades to
// fully-visible static content (no FOUC trap).
import gsap from 'https://esm.sh/gsap@3.13.0';
import ScrollTrigger from 'https://esm.sh/gsap@3.13.0/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function heroIntro() {
  const targets = [
    '.hero-eyebrow', '.hero h1', '.hero .lede', '.hero-cta',
    '.hero-trust', '.hero-stats',
  ].map((s) => document.querySelector(s)).filter(Boolean);
  if (targets.length) {
    gsap.from(targets, { opacity: 0, y: 24, duration: 0.6, stagger: 0.09, ease: 'power2.out' });
  }
  const visual = document.querySelector('.hero-visual');
  if (visual) gsap.from(visual, { opacity: 0, scale: 0.96, duration: 0.8, ease: 'power2.out', delay: 0.15 });
}

function revealOnScroll(selector, { y = 28, stagger = 0.08, start = 'top 86%' } = {}) {
  const els = gsap.utils.toArray(selector);
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y });
  ScrollTrigger.batch(els, {
    start,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.55, stagger, ease: 'power2.out' }),
  });
}

function animateCounter(el) {
  const raw = el.textContent.trim();
  const m = raw.match(/^([\d.]+)\s*([KkMm]?)\s*(\+?)$/);
  if (!m) return;
  const target = parseFloat(m[1]);
  const scale = m[2] || '';
  const plus = m[3] || '';
  const decimals = m[1].includes('.') ? 1 : 0;
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.4,
    ease: 'power1.out',
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    onUpdate: () => { el.textContent = obj.v.toFixed(decimals) + scale + plus; },
    onComplete: () => { el.textContent = target.toFixed(decimals) + scale + plus; },
  });
}

function setupMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    // Duplicate the children once so the loop is seamless.
    const items = Array.from(track.children);
    items.forEach((node) => track.appendChild(node.cloneNode(true)));
    const distance = track.scrollWidth / 2;
    gsap.to(track, {
      x: -distance,
      duration: Math.max(18, distance / 60),
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % distance) },
    });
  });
}

function init() {
  if (REDUCE) { setupMarquee(); return; } // marquee still loops; skip the rest for reduced-motion
  heroIntro();
  revealOnScroll('.section-head');
  revealOnScroll('.cat-card', { stagger: 0.1 });
  revealOnScroll('.why-card', { stagger: 0.1 });
  revealOnScroll('.timeline li', { y: 20, stagger: 0.12 });
  revealOnScroll('.cta-banner', { y: 32 });
  revealOnScroll('.pdp-top', { y: 24 });
  revealOnScroll('.pdp-specs-wrap', { y: 24 });
  revealOnScroll('.about-visual', { y: 24 });
  document.querySelectorAll('.hero-stats .stat strong, .about-stats .stat strong').forEach(animateCounter);
  setupMarquee();
}

// Product cards are injected after the Supabase fetch — reveal them when the
// catalogue script announces a render.
document.addEventListener('catalog:rendered', (e) => {
  if (REDUCE) return;
  const scope = e.detail && e.detail.grid ? e.detail.grid : document;
  const cards = scope.querySelectorAll('.product-card');
  if (!cards.length) return;
  gsap.set(cards, { opacity: 0, y: 22 });
  ScrollTrigger.batch(cards, {
    start: 'top 94%',
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out' }),
  });
  ScrollTrigger.refresh();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
