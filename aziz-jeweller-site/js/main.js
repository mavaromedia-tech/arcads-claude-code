// Aziz The Jeweller — scroll-driven frame animation hero (Three.js)

import * as THREE from "three";

const FRAME_COUNT = 150;
const FRAME_PATH = (i) => `frames/frame_${String(i + 1).padStart(3, "0")}.jpg`;
const FRAME_W = 1280;
const FRAME_H = 720;

// ---------- Frame preloading ----------
const images = new Array(FRAME_COUNT);
let loaded = 0;

const loaderEl = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");
const loaderPct = document.getElementById("loader-pct");

function preloadFrames() {
  return new Promise((resolve) => {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      const done = () => {
        loaded++;
        const pct = Math.round((loaded / FRAME_COUNT) * 100);
        loaderFill.style.width = pct + "%";
        loaderPct.textContent = pct + "%";
        if (loaded === FRAME_COUNT) resolve();
      };
      img.onload = done;
      img.onerror = done; // don't hang the site on a missing frame
      images[i] = img;
    }
  });
}

// ---------- Three.js scene ----------
const canvas = document.getElementById("webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0a0c, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0c, 0.055);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 10);

// Video-frame plane: draw the current frame into a canvas -> CanvasTexture
const frameCanvas = document.createElement("canvas");
frameCanvas.width = FRAME_W;
frameCanvas.height = FRAME_H;
const frameCtx = frameCanvas.getContext("2d");

const videoTexture = new THREE.CanvasTexture(frameCanvas);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

const planeMat = new THREE.MeshBasicMaterial({ map: videoTexture });
const planeGeo = new THREE.PlaneGeometry(1, 1);
const plane = new THREE.Mesh(planeGeo, planeMat);
scene.add(plane);

// Gold dust particles floating in front of the footage
const DUST_COUNT = 260;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST_COUNT * 3);
const dustSeed = new Float32Array(DUST_COUNT);
for (let i = 0; i < DUST_COUNT; i++) {
  dustPos[i * 3 + 0] = (Math.random() - 0.5) * 16;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
  dustPos[i * 3 + 2] = Math.random() * 6 + 1.5;
  dustSeed[i] = Math.random() * Math.PI * 2;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xd4af37,
  size: 0.035,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// Size the plane so the 16:9 footage covers the viewport (like CSS background-size: cover)
function fitPlane() {
  const dist = camera.position.z - plane.position.z;
  const viewH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const viewW = viewH * camera.aspect;
  const videoAspect = FRAME_W / FRAME_H;
  const viewAspect = viewW / viewH;
  let w, h;
  if (viewAspect > videoAspect) {
    w = viewW;
    h = viewW / videoAspect;
  } else {
    h = viewH;
    w = viewH * videoAspect;
  }
  // slight overscan so parallax never reveals edges
  plane.scale.set(w * 1.06, h * 1.06, 1);
}
fitPlane();

// ---------- Scroll scrubbing ----------
const stage = document.getElementById("scroll-stage");
const heroCopy = document.getElementById("hero-copy");
const milestones = [
  { el: document.getElementById("ms-1"), from: 0.18, to: 0.42 },
  { el: document.getElementById("ms-2"), from: 0.46, to: 0.7 },
  { el: document.getElementById("ms-3"), from: 0.78, to: 1.01 },
];

let targetProgress = 0; // set by scroll
let progress = 0;       // smoothed, drives the frame index
let currentFrame = -1;

function readScroll() {
  const rect = stage.getBoundingClientRect();
  const runway = stage.offsetHeight - window.innerHeight;
  targetProgress = THREE.MathUtils.clamp(-rect.top / runway, 0, 1);
}
window.addEventListener("scroll", readScroll, { passive: true });

function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;
  frameCtx.drawImage(img, 0, 0, FRAME_W, FRAME_H);
  videoTexture.needsUpdate = true;
}

// ---------- Mouse parallax ----------
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------- UI state (hero copy + milestones) ----------
function updateOverlays(p) {
  // hero copy fades out over the first 12% of the scrub
  const fade = THREE.MathUtils.clamp(1 - p / 0.12, 0, 1);
  heroCopy.style.opacity = fade;
  heroCopy.style.transform = `translateY(${(1 - fade) * -40}px)`;
  heroCopy.style.visibility = fade === 0 ? "hidden" : "visible";

  for (const m of milestones) {
    m.el.classList.toggle("on", p >= m.from && p < m.to);
  }
}

// ---------- Render loop ----------
const clock = new THREE.Clock();

function tick() {
  const t = clock.getElapsedTime();

  // smooth the scroll for a weighty, cinematic scrub
  progress += (targetProgress - progress) * 0.085;

  const frame = Math.round(progress * (FRAME_COUNT - 1));
  if (frame !== currentFrame) {
    currentFrame = frame;
    drawFrame(frame);
  }

  // mouse parallax with easing
  mouse.x += (mouse.tx - mouse.x) * 0.05;
  mouse.y += (mouse.ty - mouse.y) * 0.05;
  camera.position.x = mouse.x * 0.22;
  camera.position.y = -mouse.y * 0.16;
  camera.lookAt(0, 0, 0);

  // drift the gold dust
  const pos = dust.geometry.attributes.position;
  for (let i = 0; i < DUST_COUNT; i++) {
    pos.array[i * 3 + 1] += Math.sin(t * 0.6 + dustSeed[i]) * 0.0012;
    pos.array[i * 3 + 0] += Math.cos(t * 0.4 + dustSeed[i]) * 0.0008;
  }
  pos.needsUpdate = true;
  dust.rotation.z = t * 0.01;

  updateOverlays(progress);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ---------- Resize ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  fitPlane();
  readScroll();
});

// ---------- Boot ----------
preloadFrames().then(() => {
  drawFrame(0);
  readScroll();
  loaderEl.classList.add("done");
  tick();
});
