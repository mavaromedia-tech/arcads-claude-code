/* ============================================================
   Zebi Refrigeration & Air Conditioning — scroll-driven hero
   Three.js renders a 150-frame sequence onto a full-viewport
   plane; scroll position scrubs the sequence forward/backward.
   ============================================================ */
import * as THREE from 'three';

const FRAME_COUNT = 150;
const IMAGE_ASPECT = 1280 / 720;
const framePath = (i) => `frames/frame_${String(i + 1).padStart(3, '0')}.jpg`;

const stage = document.getElementById('scroll-stage');
const canvas = document.getElementById('webgl');
const loaderEl = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const progressFill = document.getElementById('stage-progress-fill');
const scrollHint = document.getElementById('scroll-hint');
const captions = Array.from(document.querySelectorAll('.stage-caption'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Three.js scene ---------- */
let renderer, scene, camera, mesh, material;
let webglOK = true;

try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x092833);

  // Orthographic camera spanning a unit square; the plane is scaled
  // so the 16:9 frames cover the viewport like background-size: cover.
  camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  material.toneMapped = false;
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(mesh);
} catch (err) {
  webglOK = false;
  canvas.style.display = 'none';
  stage.querySelector('.stage-sticky').style.background =
    `url(${framePath(74)}) center / cover no-repeat`;
}

function fitPlane() {
  if (!webglOK) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  const viewAspect = w / h;
  if (viewAspect > IMAGE_ASPECT) {
    mesh.scale.set(1, viewAspect / IMAGE_ASPECT, 1);
  } else {
    mesh.scale.set(IMAGE_ASPECT / viewAspect, 1, 1);
  }
}

/* ---------- Progressive frame loading ----------
   Pass 1 loads every 8th frame so scrubbing works almost
   immediately; later passes fill the gaps. The displayed frame
   snaps to the nearest loaded index until loading completes. */
const textures = new Array(FRAME_COUNT).fill(null);
const loadedIdx = [];
let loadedCount = 0;
let firstPassSize = 0;
let firstPassLoaded = 0;

const loadOrder = (() => {
  const seen = new Set();
  const order = [];
  for (const stride of [8, 4, 2, 1]) {
    for (let i = 0; i < FRAME_COUNT; i += stride) {
      if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
  }
  if (!seen.has(FRAME_COUNT - 1)) order.push(FRAME_COUNT - 1);
  return order;
})();
firstPassSize = Math.ceil(FRAME_COUNT / 8) + 1;

const texLoader = new THREE.TextureLoader();

function loadFrame(i) {
  return new Promise((resolve) => {
    texLoader.load(
      framePath(i),
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        textures[i] = tex;
        loadedIdx.push(i);
        loadedCount++;
        onFrameLoaded();
        resolve();
      },
      undefined,
      () => { loadedCount++; onFrameLoaded(); resolve(); } // tolerate a missing frame
    );
  });
}

function onFrameLoaded() {
  if (firstPassLoaded < firstPassSize) {
    firstPassLoaded++;
    const pct = Math.round((firstPassLoaded / firstPassSize) * 100);
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = pct + '%';
    if (firstPassLoaded >= firstPassSize) {
      loaderEl.classList.add('done');
      loaderEl.addEventListener('transitionend', () => loaderEl.remove(), { once: true });
    }
  }
  needsRender = true;
}

async function loadAllFrames() {
  const CONCURRENCY = 6;
  let cursor = 0;
  async function worker() {
    while (cursor < loadOrder.length) {
      const i = loadOrder[cursor++];
      await loadFrame(i);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

function nearestLoaded(target) {
  if (textures[target]) return target;
  let best = -1;
  let bestDist = Infinity;
  for (const i of loadedIdx) {
    const d = Math.abs(i - target);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

/* ---------- Scroll scrubbing ---------- */
let targetProgress = 0;
let currentProgress = 0;
let displayedFrame = -1;
let needsRender = true;

function readScroll() {
  const rect = stage.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  targetProgress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
}

function updateCaptions(p) {
  for (const cap of captions) {
    const start = parseFloat(cap.dataset.start);
    const end = parseFloat(cap.dataset.end);
    const fade = 0.05;
    let o = 0;
    if (p >= start && p <= end) {
      const inRamp = start <= 0 ? 1 : Math.min(1, (p - start) / fade);
      const outRamp = end >= 1 ? 1 : Math.min(1, (end - p) / fade);
      o = Math.min(inRamp, outRamp);
    }
    cap.style.opacity = o.toFixed(3);
    cap.style.transform = `translateY(${(1 - o) * 24}px)`;
    cap.classList.toggle('active', o > 0.5);
  }
  if (scrollHint) scrollHint.style.opacity = p < 0.02 ? '1' : '0';
  if (progressFill) progressFill.style.height = (p * 100).toFixed(2) + '%';
}

function tick() {
  readScroll();

  const ease = reducedMotion ? 1 : 0.14;
  currentProgress += (targetProgress - currentProgress) * ease;
  if (Math.abs(targetProgress - currentProgress) < 0.0004) {
    currentProgress = targetProgress;
  }

  updateCaptions(currentProgress);

  if (webglOK && loadedCount > 0) {
    const target = Math.round(currentProgress * (FRAME_COUNT - 1));
    const frame = nearestLoaded(target);
    if (frame >= 0 && (frame !== displayedFrame || needsRender)) {
      displayedFrame = frame;
      material.map = textures[frame];
      material.needsUpdate = true;
      renderer.render(scene, camera);
      needsRender = false;
    }
  }
  requestAnimationFrame(tick);
}

if (webglOK) {
  fitPlane();
  window.addEventListener('resize', () => { fitPlane(); needsRender = true; });
}
loadAllFrames();
requestAnimationFrame(tick);

/* ---------- Nav ---------- */
const nav = document.getElementById('nav');
const burger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

function onScrollNav() {
  nav.classList.toggle('solid', window.scrollY > 40);
}
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

burger.addEventListener('click', () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
});
mobileMenu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileMenu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
  })
);

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

/* ---------- Quote form (front-end demo) ---------- */
const form = document.getElementById('quote-form');
const formStatus = document.getElementById('form-status');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.elements.name.value.trim();
  const contact = form.elements.contact.value.trim();
  if (!name || !contact) {
    formStatus.textContent = 'Please add your name and how to reach you.';
    formStatus.style.color = 'var(--flame)';
    return;
  }
  const service = form.elements.service.value;
  const details = form.elements.details.value.trim();
  const subject = encodeURIComponent(`Quote request — ${service}`);
  const body = encodeURIComponent(
    `Name: ${name}\nReach me at: ${contact}\nService: ${service}\n\n${details}`
  );
  window.location.href =
    `mailto:zebiheatingandcooling@gmail.com?subject=${subject}&body=${body}`;
  formStatus.style.color = 'var(--ice)';
  formStatus.textContent = `Thanks, ${name}! Opening your email app — or call us at (416) 710-6130.`;
});

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
