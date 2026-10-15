// 2D GOAT mascot for student-feedback.html: the official nudge.goat artwork, brought to life
// with layered CSS transforms (pointer tilt, mood pose, one-shot actions, idle breathing)
// and emoji bursts. Styles live in student-feedback.html under "GOAT mascot".

const POKES = [
  "Oi! Tickle cheyyalle 😂", "Meeehh 🐐", "Bro njan GOAT aanu, button alla 😤",
  "Aa poke vibe aayi 😎", "Questions answer cheyy, ennitt poke cheyyam 😌",
  "Njan ninte attendance nokkunnund 👀", "Hehe, again? 🫣"
];

const BURSTS = {
  hype: ["🔥", "✨", "💯", "🔥"],
  sad: ["🥺", "💙", "🫂"],
  poke: ["😂", "💥", "🐐", "😤", "👀"],
  wow: ["👀", "❗"],
  done: ["🎉", "🐐", "⚡", "🔥", "🏆"]
};

const MOODS = ["chill", "happy", "hype", "wow", "sad"];
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class GoatMascot {
  constructor({ src, onSpeak } = {}) {
    this.src = src;
    this.onSpeak = onSpeak || (() => {});
    this.el = null;
    this.mood = "chill";
    this.pokes = 0;
    this.pointer = { x: 0, y: 0, at: -1e9 };
    this.focus = null;
    this.tilt = { x: 0, y: 0 };
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    addEventListener("pointermove", e => { this.pointer = { x: e.clientX, y: e.clientY, at: performance.now() }; }, { passive: true });
    const loop = () => { this.update(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // A fresh mascot element for the current screen; it becomes the one that reacts
  create() {
    const el = document.createElement("div");
    el.className = `goat2d mood-${this.mood}`;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Nudge GOAT mascot. Tap to poke.");
    el.innerHTML = `<div class="goat-tilt"><div class="goat-mood"><div class="goat-act"><div class="goat-idle">
      <img class="goat-img" alt="" draggable="false" decoding="async">
      </div></div></div></div><div class="goat-fx" aria-hidden="true"></div>`;
    el.querySelector("img").src = this.src;
    el.addEventListener("click", () => this.poke());
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.poke(); } });
    this.el = el;
    return el;
  }

  setMood(m) {
    if (!MOODS.includes(m)) return;
    const prev = this.mood;
    this.mood = m;
    if (!this.el) return;
    MOODS.forEach(x => this.el.classList.toggle(`mood-${x}`, x === m));
    if (m !== prev && BURSTS[m] && (m === "hype" || m === "sad")) this.burst(m);
  }

  // hop | nod | shake | tilt | surprise | bleat | spin | lean
  react(name) {
    const act = this.el?.querySelector(".goat-act");
    if (!act) return;
    act.className = "goat-act";
    void act.offsetWidth;
    act.classList.add(`act-${name}`);
    act.addEventListener("animationend", () => act.classList.remove(`act-${name}`), { once: true });
  }

  burst(kind, count) {
    const fx = this.el?.querySelector(".goat-fx");
    if (!fx || this.reduced) return;
    const set = BURSTS[kind] || BURSTS.poke;
    const n = count || 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = set[Math.floor(Math.random() * set.length)];
      s.style.left = `${15 + Math.random() * 70}%`;
      s.style.top = `${10 + Math.random() * 35}%`;
      s.style.setProperty("--dx", `${(Math.random() - 0.5) * 60}px`);
      s.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);
      s.style.animationDelay = `${i * 70}ms`;
      fx.append(s);
      setTimeout(() => s.remove(), 1500 + i * 70);
    }
  }

  dance(on) {
    this.el?.classList.toggle("dancing", on);
    if (on) this.burst("done", 6);
  }

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
      this.react(Math.random() < 0.5 ? "bleat" : "surprise");
      this.onSpeak(POKES[(this.pokes - 1) % POKES.length]);
    }
    this.burst("poke", 3);
  }

  // Lean toward the focused element / pointer, drift gently when idle
  update() {
    const el = this.el;
    if (!el || !el.isConnected) return;
    const now = performance.now(), t = now / 1000;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.35;
    const target = this.focus && now < this.focus.until ? this.focus
      : now - this.pointer.at < 3500 ? this.pointer : null;
    let tx = Math.sin(t * 0.5) * 0.25, ty = Math.sin(t * 0.33) * 0.1;
    if (target) {
      tx = clamp((target.x - cx) / (innerWidth * 0.4), -1, 1);
      ty = clamp((target.y - cy) / (innerHeight * 0.5), -1, 1);
    }
    const k = this.reduced ? 0.04 : 0.09;
    this.tilt.x = lerp(this.tilt.x, tx, k);
    this.tilt.y = lerp(this.tilt.y, ty, k);
    const amt = this.reduced ? 0.3 : 1;
    el.querySelector(".goat-tilt").style.transform =
      `perspective(700px) rotateY(${this.tilt.x * 14 * amt}deg) rotateX(${-this.tilt.y * 8 * amt}deg) translateX(${this.tilt.x * 4 * amt}%)`;
  }
}
