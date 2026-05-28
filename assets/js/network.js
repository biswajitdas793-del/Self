// Ambient network / connectivity field for the hero.
// Slow drifting nodes + proximity links + occasional gold signal pulse.
// Subtle and low-opacity by design; respects reduced-motion and pauses when hidden.

const canvas = document.querySelector('.hero-net');
if (canvas) initNetwork(canvas);

function initNetwork(canvas) {
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMERALD = '25,185,138';
  const PURPLE = '139,92,246';
  const GOLD = '226,190,126';
  const LINK_DIST = 132;

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [], pulses = [], raf = null, running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const count = Math.max(16, Math.min(58, Math.round(w / 27)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: Math.random() * 1.5 + 0.8,
      purple: Math.random() < 0.26,
    }));
    pulses = [];
  }

  function spawnPulse() {
    const a = nodes[(Math.random() * nodes.length) | 0];
    let best = null, bestD = LINK_DIST;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (best) pulses.push({ from: a, to: best, t: 0, speed: 0.018 + Math.random() * 0.018 });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(${EMERALD},${(1 - d / LINK_DIST) * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${n.purple ? PURPLE : EMERALD},0.5)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (running && Math.random() < 0.013 && nodes.length > 2) spawnPulse();
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += p.speed;
      if (p.t >= 1) { pulses.splice(k, 1); continue; }
      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${GOLD},${(1 - Math.abs(p.t - 0.5) * 2) * 0.9})`;
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() { if (!running) return; draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; loop(); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  resize();
  if (reduce) { draw(); return; }
  start();

  window.addEventListener('resize', () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
