// 3D GOAT mascot for student-feedback.html, built from Three.js primitives.
// One renderer/canvas is reused; mount() moves it into whichever slot is on screen.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const C = {
  fur: 0xF4EFE8, furShade: 0xDCD1C3, pink: 0xE9B3AA, muzzle: 0xE8CFC4,
  red: 0xD62839, redDark: 0x9E1622, gold: 0xF2C14E, ink: 0x1B1209,
  hornBase: [0.86, 0.79, 0.66], hornTip: [0.36, 0.30, 0.22]
};

// Mood → eyelid angle (+ = more closed), ear droop, head pitch, smile shape
const MOODS = {
  chill: { lid: -0.58, ear: 0, pitch: 0, smile: [0.8, 0.55], smirk: 0.25 },
  happy: { lid: -0.2, ear: -0.12, pitch: -0.08, smile: [1.25, 1.3], smirk: 0 },
  hype: { lid: -0.55, ear: -0.3, pitch: -0.12, smile: [1.3, 1.4], smirk: 0 },
  wow: { lid: -0.8, ear: -0.35, pitch: -0.05, smile: [0.6, 0.4], smirk: 0 },
  sad: { lid: 0.18, ear: 0.45, pitch: 0.28, smile: [0.9, -0.7], smirk: 0 }
};

const POKES = [
  "Oi! Tickle cheyyalle 😂", "Meeehh 🐐", "Bro njan GOAT aanu, button alla 😤",
  "Aa poke vibe aayi 😎", "Questions answer cheyy, ennitt poke cheyyam 😌",
  "Njan ninte attendance nokkunnund 👀", "Hehe, again? 🫣"
];

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

function furTexture() {
  const s = 256, cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d");
  g.fillStyle = "#808080"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * s, y = Math.random() * s, l = 3 + Math.random() * 7;
    const v = 90 + Math.random() * 90 | 0;
    g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 2, y + l); g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}

// Tube that tapers toward its tip, with banded vertex colours for horn ridges
function hornGeometry(points) {
  const curve = new THREE.CatmullRomCurve3(points);
  const tub = 48, rad = 14;
  const geo = new THREE.TubeGeometry(curve, tub, 0.16, rad, false);
  const pos = geo.attributes.position, colors = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.floor(i / (rad + 1)) / tub;
    const p = curve.getPointAt(Math.min(t, 1));
    v.fromBufferAttribute(pos, i).sub(p).multiplyScalar(1 - t * 0.82).add(p);
    pos.setXYZ(i, v.x, v.y, v.z);
    const band = 0.92 + 0.08 * Math.sin(t * 70);
    colors.push(...C.hornBase.map((b, k) => (b + (C.hornTip[k] - b) * t) * band));
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  // cap the base so it reads as solid
  return geo;
}

function pendantTexture() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const g = cv.getContext("2d");
  g.fillStyle = "#F2C14E"; g.beginPath(); g.arc(64, 64, 64, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#8E5E0E"; g.font = "900 84px Nunito, Arial Black, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("N", 64, 70);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Goat iris: golden-amber with radial fibres, dark limbal ring, horizontal slit pupil
function irisTexture() {
  const n = 512, cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const g = cv.getContext("2d"), c = n / 2;
  const base = g.createRadialGradient(c, c, n * 0.05, c, c, c);
  base.addColorStop(0, "#FBE07A"); base.addColorStop(0.35, "#E8A92E");
  base.addColorStop(0.7, "#B87420"); base.addColorStop(0.9, "#6E4512"); base.addColorStop(1, "#2B1C0C");
  g.fillStyle = base; g.fillRect(0, 0, n, n);
  // radial fibres
  for (let i = 0; i < 520; i++) {
    const a = Math.random() * Math.PI * 2, r0 = n * (0.08 + Math.random() * 0.12), r1 = c * (0.6 + Math.random() * 0.38);
    const light = Math.random() < 0.5;
    g.strokeStyle = light ? `rgba(255,228,140,${0.04 + Math.random() * 0.1})` : `rgba(80,45,8,${0.1 + Math.random() * 0.25})`;
    g.lineWidth = 0.6 + Math.random() * 1.6;
    g.beginPath();
    g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
    const bend = a + (Math.random() - 0.5) * 0.12;
    g.quadraticCurveTo(c + Math.cos(bend) * (r0 + r1) / 2, c + Math.sin(bend) * (r0 + r1) / 2, c + Math.cos(a) * r1, c + Math.sin(a) * r1);
    g.stroke();
  }
  // uneven mottling so it doesn't read as a perfect sunburst
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, r = c * (0.25 + Math.random() * 0.6), sz = n * (0.02 + Math.random() * 0.05);
    const m = g.createRadialGradient(c + Math.cos(a) * r, c + Math.sin(a) * r, 0, c + Math.cos(a) * r, c + Math.sin(a) * r, sz);
    const dark = Math.random() < 0.6;
    m.addColorStop(0, dark ? "rgba(110,60,10,.28)" : "rgba(255,220,120,.22)"); m.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = m; g.fillRect(0, 0, n, n);
  }
  // darker collarette around the pupil + flecks
  g.strokeStyle = "rgba(120,70,15,.45)"; g.lineWidth = 6;
  g.beginPath(); g.ellipse(c, c, n * 0.34, n * 0.13, 0, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, r = c * (0.4 + Math.random() * 0.45);
    g.fillStyle = `rgba(70,40,8,${0.15 + Math.random() * 0.25})`;
    g.beginPath(); g.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 1 + Math.random() * 3, 0, Math.PI * 2); g.fill();
  }
  // limbal ring
  const limb = g.createRadialGradient(c, c, c * 0.82, c, c, c);
  limb.addColorStop(0, "rgba(30,18,6,0)"); limb.addColorStop(1, "rgba(30,18,6,.95)");
  g.fillStyle = limb; g.fillRect(0, 0, n, n);
  // horizontal pupil: rounded rectangle, slightly pinched in the middle, soft edge
  g.save();
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 10;
  g.fillStyle = "#070403";
  const w = n * 0.56, h = n * 0.12, x = c - w / 2, y = c - h / 2, pinch = h * 0.12;
  g.beginPath();
  g.moveTo(x + h / 2, y);
  g.quadraticCurveTo(c, y + pinch, x + w - h / 2, y);
  g.arc(x + w - h / 2, c, h / 2, -Math.PI / 2, Math.PI / 2);
  g.quadraticCurveTo(c, y + h - pinch, x + h / 2, y + h);
  g.arc(x + h / 2, c, h / 2, Math.PI / 2, Math.PI * 1.5);
  g.fill();
  g.restore();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Front-facing spherical cap with planar UVs (so a flat iris painting maps without distortion)
function capGeometry(r, theta) {
  const geo = new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, theta);
  geo.rotateX(Math.PI / 2);
  const pos = geo.attributes.position, uv = geo.attributes.uv, edge = r * Math.sin(theta);
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / edge / 2, 0.5 + pos.getY(i) / edge / 2);
  return geo;
}

const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Goat3D {
  constructor({ onSpeak } = {}) {
    this.onSpeak = onSpeak || (() => {});
    this.canvas = document.createElement("canvas");
    this.canvas.className = "goat3d";
    this.canvas.setAttribute("aria-label", "GOAT mascot. Tap to poke.");
    this.canvas.setAttribute("role", "img");

    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0.3, 7.8);
    this.camera.lookAt(0, -0.05, 0);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xC9B8B0, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 4, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xFF5C6A, 1.4); rim.position.set(-4, 2, -4); this.scene.add(rim);

    this.build();

    this.mood = "chill";
    this.actions = [];
    this.dancing = false;
    this.pointer = { x: 0, y: 0, at: -1e9 };
    this.focus = null; // { x, y, until }
    this.spin = { angle: 0, vel: 0, dragging: false, startX: 0, lastX: 0, moved: 0 };
    this.pokes = 0;
    this.nextBlink = 2; this.blinkT = -1;
    this.nextFlick = 3; this.flickT = -1; this.flickSide = 1;
    this.cur = { lid: -0.58, ear: 0, pitch: 0, yaw: 0, look: 0, sx: 0.8, sy: 0.55, smirk: 0.25 };

    this.bindPointer();
    this.ro = new ResizeObserver(() => this.resize());
    this.clock = new THREE.Clock();
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    r.setAnimationLoop(() => this.tick());
  }

  // ---------- Model ----------
  build() {
    const bump = furTexture();
    const fur = new THREE.MeshStandardMaterial({ color: C.fur, roughness: 0.92, bumpMap: bump, bumpScale: 0.6 });
    const furShade = new THREE.MeshStandardMaterial({ color: C.furShade, roughness: 0.95, bumpMap: bump, bumpScale: 0.6 });
    const pink = new THREE.MeshStandardMaterial({ color: C.pink, roughness: 0.7 });
    const muzzle = new THREE.MeshStandardMaterial({ color: C.muzzle, roughness: 0.55 });
    const ink = new THREE.MeshStandardMaterial({ color: C.ink, roughness: 0.4 });
    const hoodie = new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.9, bumpMap: bump, bumpScale: 0.25, envMapIntensity: 0.25 });
    const hoodieDark = new THREE.MeshStandardMaterial({ color: C.redDark, roughness: 0.9, bumpMap: bump, bumpScale: 0.25, envMapIntensity: 0.25 });
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const gold = new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.28 });
    const horn = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 });
    const lens = new THREE.MeshPhysicalMaterial({ color: 0x2a0508, metalness: 0.4, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 });

    const S = (r = 1, w = 40, h = 28) => new THREE.SphereGeometry(r, w, h);
    const mesh = (geo, mat, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot);
      return m;
    };

    const root = this.root = new THREE.Group();
    this.scene.add(root);

    // Body: hoodie, hood roll, drawstrings, chain
    const body = this.body = new THREE.Group();
    root.add(body);
    body.add(mesh(S(), hoodie, [0, -1.9, 0], [1.55, 1.15, 1.0]));
    body.add(mesh(new THREE.TorusGeometry(0.56, 0.24, 18, 44), hoodieDark, [0, -0.86, -0.12], [1.05, 1, 0.85], [Math.PI / 2 + 0.25, 0, 0]));
    body.add(mesh(S(), hoodieDark, [0, -0.82, -0.62], [0.62, 0.42, 0.3]));   // hood resting on the back
    [-1, 1].forEach(s => {
      body.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), white, [s * 0.22, -1.2, 0.8], [1, 1, 1], [0.45, 0, 0]));
      body.add(mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.1, 10), white, [s * 0.22, -1.47, 0.92], [1, 1, 1], [0.45, 0, 0]));
    });
    body.add(mesh(new THREE.TorusGeometry(0.56, 0.03, 10, 56), gold, [0, -0.95, 0.3], [1, 1, 1], [Math.PI / 2 + 0.42, 0, 0]));
    const pend = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32), gold, [0, -1.33, 0.86], [1, 1, 1], [Math.PI / 2 - 0.55, 0, 0]);
    pend.add(mesh(new THREE.CircleGeometry(0.11, 32), new THREE.MeshStandardMaterial({ map: pendantTexture(), metalness: 0.6, roughness: 0.35 }), [0, 0.021, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]));
    body.add(pend);

    // Neck
    body.add(mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.9, 24), furShade, [0, -0.5, -0.05]));

    // Head (pivot at top of neck)
    const head = this.head = new THREE.Group();
    head.position.set(0, -0.14, -0.05);
    root.add(head);

    head.add(mesh(S(), fur, [0, 0.55, 0], [0.6, 0.64, 0.68]));                 // skull
    head.add(mesh(S(), fur, [0, 0.2, 0.42], [0.42, 0.46, 0.64], [0.35, 0, 0])); // long face
    head.add(mesh(S(), muzzle, [0, -0.06, 0.86], [0.33, 0.27, 0.26]));          // muzzle
    [-1, 1].forEach(s => head.add(mesh(S(1, 16, 12), ink, [s * 0.1, 0.0, 1.09], [0.055, 0.028, 0.025], [0, 0, s * 0.55])));
    head.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), ink, [0, -0.1, 1.1], [1, 1, 1], [0.3, 0, 0]));

    // Mouths: smile arc + open mouth
    this.smile = mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 24, Math.PI), ink, [0, -0.2, 1.02], [1, 1, 1], [0.25, 0, Math.PI]);
    this.mouthOpen = mesh(S(1, 20, 16), new THREE.MeshStandardMaterial({ color: 0x6E1F28, roughness: 0.6 }), [0, -0.22, 1.0], [0.11, 0.01, 0.05]);
    head.add(this.smile, this.mouthOpen);

    // Eyes: painted iris under a glossy cornea, eyeball rotates with gaze, lids with dark rims + lashes
    const irisMat = new THREE.MeshStandardMaterial({ map: irisTexture(), roughness: 0.45 });
    const eyeball = new THREE.MeshStandardMaterial({ color: 0x3A2A1C, roughness: 0.5 });
    const cornea = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, depthWrite: false
    });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x3B2A26, roughness: 0.55 });
    const catchlight = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    this.lids = []; this.eyeballs = [];
    [-1, 1].forEach(s => {
      const eye = new THREE.Group();
      eye.position.set(s * 0.385, 0.6, 0.37);   // sunk into the skull so fur surrounds it
      eye.rotation.y = s * 0.62;
      eye.scale.setScalar(1.12);

      const ball = new THREE.Group();                     // rotates to look around
      ball.add(mesh(S(0.14), eyeball));
      ball.add(new THREE.Mesh(capGeometry(0.1415, 0.98), irisMat));
      ball.add(new THREE.Mesh(capGeometry(0.149, 1.05), cornea));
      eye.add(ball); this.eyeballs.push(ball);
      // wet catchlight sits on the cornea, fixed relative to the light
      eye.add(mesh(S(0.0105, 12, 8), catchlight, [-0.04, 0.045, 0.143], [1.3, 1, 0.4]));

      // upper lid (fur) with dark margin and lashes, pivots to blink
      const lid = mesh(new THREE.SphereGeometry(0.158, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), fur);
      lid.add(mesh(new THREE.TorusGeometry(0.157, 0.006, 8, 48), rimMat, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
      for (let i = 0; i < 9; i++) {
        const a = -0.95 + i * 0.2;                         // spread across the front of the lid
        const lash = mesh(new THREE.ConeGeometry(0.004, 0.05, 4), rimMat,
          [Math.sin(a) * 0.16, -0.004, Math.cos(a) * 0.16], [1, 1, 1], [Math.PI / 2 + 0.5, a, 0]);
        lid.add(lash);
      }
      eye.add(lid); this.lids.push(lid);

      // lower lid with margin
      const lower = new THREE.Group();
      lower.rotation.x = -0.18;
      lower.add(mesh(new THREE.SphereGeometry(0.155, 32, 10, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34), fur));
      lower.add(mesh(new THREE.TorusGeometry(0.155 * Math.sin(Math.PI * 0.66), 0.005, 8, 48), rimMat,
        [0, 0.155 * Math.cos(Math.PI * 0.66), 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
      eye.add(lower);

      // brow ridge gives the eye a socket
      eye.add(mesh(S(), fur, [0.0, 0.125, -0.045], [0.17, 0.05, 0.12], [0.2, 0, -s * 0.15]));
      head.add(eye);
    });

    // Ears (droopy, sideways) with pivots for flicks
    this.ears = [-1, 1].map(s => {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.52, 0.66, -0.05);
      pivot.add(mesh(S(), fur, [s * 0.38, 0, 0], [0.42, 0.16, 0.07]));
      pivot.add(mesh(S(), pink, [s * 0.4, -0.01, 0.045], [0.32, 0.1, 0.03]));
      if (s === 1) pivot.add(mesh(new THREE.CapsuleGeometry(0.035, 0.07, 6, 12), white, [0.1, -0.05, 0.08], [1, 1, 1], [0, 0, 0.2]));
      pivot.userData.side = s;
      head.add(pivot);
      return pivot;
    });

    // Horns
    [-1, 1].forEach(s => {
      const pts = [[0.21, 0.9, 0.1], [0.28, 1.32, -0.04], [0.42, 1.64, -0.42], [0.58, 1.68, -0.84], [0.68, 1.46, -1.12]]
        .map(([x, y, z]) => new THREE.Vector3(s * x, y, z));
      head.add(new THREE.Mesh(hornGeometry(pts), horn));
      head.add(mesh(S(0.165, 16, 12), horn, pts[0].clone().add(new THREE.Vector3(0, -0.02, 0))));
    });

    // Forehead tuft
    [[-0.12, 0.2], [-0.04, -0.1], [0.05, 0.15], [0.13, -0.25], [0, 0]].forEach(([x, rz]) =>
      head.add(mesh(new THREE.ConeGeometry(0.07, 0.24, 10), fur, [x, 1.12, 0.22], [1, 1, 1], [0.3, 0, rz])));

    // Beard
    const beard = this.beard = new THREE.Group();
    beard.position.set(0, -0.3, 0.72);
    beard.add(mesh(new THREE.ConeGeometry(0.13, 0.6, 14), fur, [0, -0.25, 0], [1, 1, 0.8], [Math.PI - 0.2, 0, 0]));
    [-1, 1].forEach(s => beard.add(mesh(new THREE.ConeGeometry(0.07, 0.4, 10), fur, [s * 0.08, -0.15, -0.02], [1, 1, 1], [Math.PI - 0.15, 0, s * 0.25])));
    head.add(beard);

    // Sunglasses pushed up on forehead
    const shades = new THREE.Group();
    shades.position.set(0, 1.0, 0.47);
    shades.rotation.x = -0.75;
    [-1, 1].forEach(s => {
      shades.add(mesh(new THREE.BoxGeometry(0.34, 0.19, 0.04), lens, [s * 0.2, 0, 0]));
      shades.add(mesh(new THREE.BoxGeometry(0.035, 0.035, 0.42), ink, [s * 0.38, 0.03, -0.2]));
    });
    shades.add(mesh(new THREE.BoxGeometry(0.08, 0.03, 0.03), ink, [0, 0.04, 0]));
    head.add(shades);
  }

  // ---------- Public API ----------
  mount(el) {
    if (!el) return;
    el.appendChild(this.canvas);
    this.ro.disconnect();
    this.ro.observe(el);
    this.resize();
  }

  setMood(m) { if (MOODS[m]) this.mood = m; }

  react(name, dur) {
    const d = dur || { hop: .6, nod: .7, shake: .7, tilt: .9, surprise: .8, bleat: .9, spin: 1.1, lean: .6 }[name] || .7;
    this.actions.push({ name, t0: this.clock.elapsedTime, dur: d });
  }

  dance(on) { this.dancing = on; }

  lookAtElement(el, ms = 1600) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.focus = { x: r.left + r.width / 2, y: r.top + r.height / 2, until: performance.now() + ms };
  }

  poke() {
    this.pokes++;
    if (this.pokes % 5 === 0) {
      this.react("spin");
      this.setMood("wow");
      this.onSpeak("Okay okay, njan dizzy aayi 😵‍💫 Ini question nokk!");
    } else {
      this.react(Math.random() < .5 ? "bleat" : "surprise");
      this.onSpeak(POKES[(this.pokes - 1) % POKES.length]);
    }
  }

  // ---------- Internals ----------
  resize() {
    const p = this.canvas.parentElement;
    if (!p) return;
    const w = p.clientWidth, h = p.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // small slots (question screens) frame tighter on the head; keep the bust in frame for narrow ones
    const small = h < 200;
    const z = small ? 6.6 : 7.8;
    this.camera.position.set(0, small ? 0.45 : 0.3, w / h < 0.8 ? z * (0.8 / (w / h)) * 0.92 : z);
    this.camera.lookAt(0, small ? 0.2 : -0.05, 0);
    this.camera.updateProjectionMatrix();
  }

  bindPointer() {
    addEventListener("pointermove", e => {
      this.pointer = { x: e.clientX, y: e.clientY, at: performance.now() };
      const s = this.spin;
      if (s.dragging) {
        const dx = e.clientX - s.lastX;
        s.moved += Math.abs(dx);
        s.angle += dx * 0.012;
        s.vel = dx * 0.012;
        s.lastX = e.clientX;
      }
    }, { passive: true });
    this.canvas.addEventListener("pointerdown", e => {
      Object.assign(this.spin, { dragging: true, startX: e.clientX, lastX: e.clientX, moved: 0 });
      this.canvas.setPointerCapture?.(e.pointerId);
    });
    const up = () => {
      if (!this.spin.dragging) return;
      this.spin.dragging = false;
      if (this.spin.moved < 6) this.poke();
    };
    this.canvas.addEventListener("pointerup", up);
    this.canvas.addEventListener("pointercancel", up);
  }

  tick() {
    if (!this.canvas.isConnected) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const now = performance.now();
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent smoothing
    const mood = MOODS[this.mood];
    const motion = this.reduced ? 0.3 : 1;

    // Where to look: focused element > recent pointer > idle wander
    let yaw = Math.sin(t * 0.45) * 0.22, pitch = Math.sin(t * 0.3) * 0.05;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height * 0.4;
    const target = this.focus && now < this.focus.until ? this.focus
      : now - this.pointer.at < 3500 ? this.pointer : null;
    if (target) {
      yaw = clamp((target.x - cx) / (innerWidth * 0.45), -1, 1) * 0.6;
      pitch = clamp((target.y - cy) / (innerHeight * 0.5), -1, 1) * 0.35;
    }

    // Sum action offsets
    const o = { y: 0, rotY: 0, rotZ: 0, hx: 0, hy: 0, hz: 0, sy: 1, ears: 0, open: 0, lid: null };
    this.actions = this.actions.filter(a => {
      const p = (t - a.t0) / a.dur;
      if (p >= 1) return false;
      const s = Math.sin(Math.PI * p);
      switch (a.name) {
        case "hop": o.y += s * 0.45; o.sy += Math.sin(p * Math.PI * 2) * 0.06; o.rotZ += Math.sin(p * Math.PI * 2) * 0.07; o.ears -= s * 0.5; break;
        case "nod": o.hx += Math.sin(p * Math.PI * 3) * 0.22 * (1 - p); break;
        case "shake": o.hy += Math.sin(p * Math.PI * 4) * 0.35 * (1 - p); o.ears += s * 0.3; break;
        case "tilt": o.hz += s * 0.32; o.hx += s * 0.1; break;
        case "surprise": o.y += s * 0.12; o.ears -= s * 0.6; o.lid = -0.95; o.open = Math.max(o.open, s * 0.6); break;
        case "bleat": o.hx -= s * 0.32; o.hy += Math.sin(t * 38) * 0.05 * s; o.open = Math.max(o.open, s); o.ears -= s * 0.4; break;
        case "spin": o.rotY += ease(p) * Math.PI * 2; o.y += s * 0.3; break;
        case "lean": o.hx += s * 0.18; break;
      }
      return true;
    });

    if (this.dancing) {
      const b = t * 6.5;
      o.rotZ += Math.sin(b) * 0.12; o.y += Math.abs(Math.sin(b)) * 0.18;
      o.hz += Math.sin(b + 1) * 0.18; o.ears += Math.sin(b * 2) * 0.25;
    }

    // Spin from dragging, spring back to front
    const sp = this.spin;
    if (!sp.dragging) {
      sp.vel *= 0.9;
      sp.angle += sp.vel;
      sp.angle = lerp(sp.angle, Math.round(sp.angle / (Math.PI * 2)) * Math.PI * 2, k * 0.5);
    }

    // Root
    this.root.position.y = o.y * motion;
    this.root.rotation.y = sp.angle + o.rotY + yaw * 0.25;
    this.root.rotation.z = o.rotZ * motion;
    this.body.scale.y = (1 + Math.sin(t * 2.2) * 0.012) * o.sy;

    // Head
    const c = this.cur;
    c.yaw = lerp(c.yaw, yaw * 0.75, k);
    c.pitch = lerp(c.pitch, pitch + mood.pitch, k);
    this.head.rotation.set(c.pitch + o.hx * motion, c.yaw + o.hy * motion, o.hz * motion);
    this.head.position.y = -0.14 + Math.sin(t * 2.2 + 0.6) * 0.012;
    this.beard.rotation.x = Math.sin(t * 1.7) * 0.05 - o.hx * 0.3;

    // Eyes: eyeballs follow gaze, lids follow mood + blinks
    // goats keep their slit pupils level with the horizon, so counter-roll against head tilt
    const roll = this.head.rotation.z + this.root.rotation.z;
    this.eyeballs.forEach(b => b.rotation.set(clamp(pitch * 0.5, -0.3, 0.3), clamp(yaw * 0.5, -0.35, 0.35), -roll));
    if (t > this.nextBlink && this.blinkT < 0) this.blinkT = 0;
    let lid = o.lid ?? mood.lid;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const bp = this.blinkT / 0.16;
      if (bp >= 1) { this.blinkT = -1; this.nextBlink = t + 2 + Math.random() * 3.5; }
      else lid = lerp(lid, 1.6, Math.sin(Math.PI * bp));
    }
    c.lid = this.blinkT >= 0 ? lid : lerp(c.lid, lid, k);
    this.lids.forEach(l => l.rotation.x = c.lid);

    // Ears: mood droop + random flick
    c.ear = lerp(c.ear, mood.ear + o.ears, k);
    if (t > this.nextFlick && this.flickT < 0) { this.flickT = 0; this.flickSide = Math.random() < .5 ? 0 : 1; }
    let flick = 0;
    if (this.flickT >= 0) {
      this.flickT += dt;
      const fp = this.flickT / 0.35;
      if (fp >= 1) { this.flickT = -1; this.nextFlick = t + 2.5 + Math.random() * 4; }
      else flick = Math.sin(fp * Math.PI * 2) * 0.35;
    }
    this.ears.forEach((e, i) => {
      const s = e.userData.side;
      e.rotation.z = -s * (0.32 + c.ear) + (i === this.flickSide ? flick * -s : 0);
      e.rotation.y = s * 0.15;
    });

    // Mouth
    c.sx = lerp(c.sx, mood.smile[0], k); c.sy = lerp(c.sy, mood.smile[1], k);
    c.smirk = lerp(c.smirk, mood.smirk, k);
    this.smile.scale.set(c.sx, Math.abs(c.sy) || 0.01, 1);
    this.smile.rotation.z = (c.sy < 0 ? 0 : Math.PI) + c.smirk;
    this.smile.position.y = c.sy < 0 ? -0.29 : -0.2;
    this.smile.visible = o.open < 0.25;
    this.mouthOpen.scale.y = 0.01 + o.open * 0.1;
    this.mouthOpen.visible = o.open > 0.02;

    this.renderer.render(this.scene, this.camera);
  }
}
