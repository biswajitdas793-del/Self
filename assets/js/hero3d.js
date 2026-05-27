// Procedural 3D phone for the hero. No external model — geometry is built in
// code so there are no asset/CORS dependencies. Falls back silently to the
// existing photo banner if WebGL or the Three.js CDN import is unavailable.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('hero3d');
if (mount) init(mount);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (_) { return false; }
}

function makeScreenTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 1040;
  const ctx = c.getContext('2d');
  // Oxblood gradient wallpaper
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#7C1518');
  g.addColorStop(0.55, '#5A0E13');
  g.addColorStop(1, '#2A0608');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  // soft glow
  const rg = ctx.createRadialGradient(256, 360, 40, 256, 360, 420);
  rg.addColorStop(0, 'rgba(184,137,62,0.35)');
  rg.addColorStop(1, 'rgba(184,137,62,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, c.width, c.height);
  // status bar
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 30px Inter, Arial';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 40, 60);
  ctx.textAlign = 'right';
  ctx.fillText('5G', c.width - 40, 60);
  ctx.textAlign = 'left';
  // Wordmark
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F5EFE6';
  ctx.font = '700 64px Georgia, "Fraunces", serif';
  ctx.fillText('NAMASKAR', 256, 470);
  ctx.fillStyle = 'rgba(245,239,230,0.7)';
  ctx.font = '500 26px Inter, Arial';
  ctx.fillText('TELECOM', 256, 520);
  // dynamic island
  ctx.fillStyle = '#000';
  const iw = 150, ih = 42;
  roundRect(ctx, 256 - iw / 2, 26, iw, ih, 21); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function buildPhone() {
  const phone = new THREE.Group();
  const W = 1.0, H = 2.04, D = 0.12, R = 0.12;

  // Titanium frame / body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, metalness: 0.95, roughness: 0.34 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 6, R), bodyMat);
  phone.add(body);

  // Glossy glass screen (thin rounded box just proud of the front)
  const screenMat = new THREE.MeshPhysicalMaterial({
    map: makeScreenTexture(),
    emissive: 0x3a0a0c, emissiveIntensity: 0.35,
    roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
  });
  const screen = new THREE.Mesh(new RoundedBoxGeometry(W - 0.08, H - 0.08, 0.02, 5, 0.09), screenMat);
  screen.position.z = D / 2 + 0.001;
  phone.add(screen);

  // Back panel (subtle two-tone)
  const backMat = new THREE.MeshStandardMaterial({ color: 0x2c2f34, metalness: 0.9, roughness: 0.42 });
  const back = new THREE.Mesh(new RoundedBoxGeometry(W - 0.04, H - 0.04, 0.02, 5, 0.10), backMat);
  back.position.z = -D / 2 - 0.001;
  phone.add(back);

  // Camera module on the back (upper-left)
  const camPlate = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.46, 0.05, 4, 0.10),
    new THREE.MeshStandardMaterial({ color: 0x26282c, metalness: 0.85, roughness: 0.4 })
  );
  camPlate.position.set(-0.24, 0.66, -D / 2 - 0.03);
  phone.add(camPlate);

  const lensRingMat = new THREE.MeshStandardMaterial({ color: 0xB8893E, metalness: 1, roughness: 0.25 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x05070b, metalness: 0.3, roughness: 0.05, clearcoat: 1 });
  const lensPos = [[-0.34, 0.78], [-0.14, 0.78], [-0.24, 0.55]];
  lensPos.forEach(([x, y]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.06, 32), lensRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, -D / 2 - 0.05);
    phone.add(ring);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.065, 32), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(x, y, -D / 2 - 0.055);
    phone.add(glass);
  });
  // flash
  const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.055, 16),
    new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0x4a4636, emissiveIntensity: 0.4, roughness: 0.3 }));
  flash.rotation.x = Math.PI / 2;
  flash.position.set(-0.04, 0.55, -D / 2 - 0.05);
  phone.add(flash);

  // Side buttons (brand accent)
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x7C1518, metalness: 0.7, roughness: 0.4 });
  const power = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.06), btnMat);
  power.position.set(W / 2 + 0.005, 0.2, 0);
  phone.add(power);
  const vol = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.06), btnMat);
  vol.position.set(-W / 2 - 0.005, 0.35, 0);
  phone.add(vol);

  return phone;
}

function init(el) {
  if (!webglOK()) return; // leave the photo fallback in place

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer, scene, camera, controls, phone, raf, visible = true;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (_) { return; }

  const size = () => ({ w: el.clientWidth || 480, h: el.clientHeight || 520 });
  let { w, h } = size();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  el.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
  camera.position.set(0, 0, 5.4);

  // Image-based lighting for realistic metal/glass reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Key + rim lights
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xB8893E, 1.1); rim.position.set(-4, 1, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  phone = buildPhone();
  phone.rotation.set(0.12, -0.5, 0);
  scene.add(phone);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 1.1;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.maxPolarAngle = Math.PI * 0.68;

  // 3D is ready — hide the photo fallback and reveal the canvas
  el.classList.add('ready');
  const visual = el.closest('.hero-visual');
  if (visual) visual.classList.add('has-3d');

  function onResize() {
    const s = size(); w = s.w; h = s.h;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(el);
  else window.addEventListener('resize', onResize);

  // Pause when off-screen or tab hidden
  if (window.IntersectionObserver) {
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(el);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
}
