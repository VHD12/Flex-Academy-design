gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const inner = $('#stageInner');
const colorLayer = $('#colorLayer');
const pinsEl = $('#pins');
const lensRing = $('#lensRing');

const opts = { lens: true, parallax: true, pins: true, magnetic: true };

// The street moment after the hero (pull back, cluster lights up, two labels) is hidden for now:
// the hero goes straight into the dive onto your first home. Set to true to bring it back.
const SHOW_MAP = false;
if (!SHOW_MAP) document.body.classList.add('no-map');

// ---------- Homes (positions in % of the neighbourhood image) ----------
// The story on the map: your first home in the middle, and the east side of the street
// as a cluster run by one operator — where a first home can lead.
const MAX_R = 0.072; // reveal radius as a fraction of stage width
const homes = [
  { x: 38.5, y: 51.5, role: 'first', tag: 'Your first home', sub: 'Start here' },
  { x: 56.2, y: 25.0, role: 'cluster' },
  { x: 76.6, y: 29.0, role: 'cluster' },
  { x: 62.6, y: 53.5, role: 'cluster' },
  { x: 85.0, y: 53.0, role: 'cluster' },
  { x: 60.0, y: 78.5, role: 'cluster' },
  { x: 36.8, y: 27.5 }, { x: 13.8, y: 47.0 }, { x: 36.0, y: 78.0 }, { x: 20.5, y: 21.5 },
].map((h) => ({ ...h, r: 0 }));
const cluster = homes.filter((h) => h.role === 'cluster');

homes.forEach((h) => {
  const pin = document.createElement('div');
  pin.className = 'pin' + (h.tag ? '' : ' dot-only');
  pin.style.left = h.x + '%';
  pin.style.top = (h.y - 4) + '%';
  pin.innerHTML = (h.tag ? `<div class="pin-tag"><b>${h.sub}</b>${h.tag}</div>` : '') + '<div class="pin-dot"></div>';
  pinsEl.appendChild(pin);
  h.pin = pin;
});

// one label for the whole cluster, sitting above its middle
const clusterLabel = document.createElement('div');
clusterLabel.className = 'pin cluster-label';
clusterLabel.style.left = (cluster.reduce((a, h) => a + h.x, 0) / cluster.length) + '%';
clusterLabel.style.top = (Math.min(...cluster.map((h) => h.y)) - 9) + '%';
clusterLabel.innerHTML = `<div class="pin-tag"><b>${String(cluster.length).padStart(2, '0')} homes · one operator</b>Where it can lead</div>`;
pinsEl.appendChild(clusterLabel);
const labelState = { a: 0 };

// faint dashed lines tie the cluster together, so it reads as one operator's portfolio
const ring = [cluster[0], cluster[1], cluster[3], cluster[4], cluster[2]];
const links = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
links.setAttribute('class', 'cluster-links');
links.setAttribute('viewBox', '0 0 100 100');
links.setAttribute('preserveAspectRatio', 'none');
links.innerHTML = `<path pathLength="1" d="M${ring.map((h) => `${h.x} ${h.y}`).join(' L')} Z"/>`;
pinsEl.before(links);

// ---------- Cursor lens state ----------
const lens = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, r: 120 };

// the lens only works while the hero is on screen (the stage now sits in a fixed camera layer)
const inHero = () => scrollY < $('#hero').offsetHeight - innerHeight * 1.2;
window.addEventListener('pointermove', (e) => {
  if (!finePointer) return;
  if (!inHero()) { if (lens.strength > 0) gsap.to(lens, { strength: 0, duration: 0.4, overwrite: 'auto' }); return; }
  lens.tx = e.clientX; lens.ty = e.clientY;
  if (lens.x < -999) { lens.x = lens.tx; lens.y = lens.ty; }
  if (opts.lens) gsap.to(lens, { strength: 1, duration: 0.5, overwrite: 'auto' });
});
document.documentElement.addEventListener('pointerleave', () => gsap.to(lens, { strength: 0, duration: 0.6, overwrite: 'auto' }));

// ---------- Parallax ----------
const px = gsap.quickTo(inner, 'x', { duration: 1.2, ease: 'power3.out' });
const py = gsap.quickTo(inner, 'y', { duration: 1.2, ease: 'power3.out' });
window.addEventListener('pointermove', (e) => {
  if (!opts.parallax || !finePointer) return;
  const nx = e.clientX / innerWidth - 0.5;
  const ny = e.clientY / innerHeight - 0.5;
  px(-nx * 28); py(-ny * 18);
});

// ---------- Render loop: build the colour mask every frame ----------
function render() {
  const W = colorLayer.offsetWidth;
  const rect = colorLayer.getBoundingClientRect();
  const k = rect.width / W; // current on-screen scale of the stage

  const layers = [];
  homes.forEach((h) => {
    if (h.r > 0.001) {
      const r = h.r * W;
      layers.push(`radial-gradient(circle ${r}px at ${h.x}% ${h.y}%, #000 0%, #000 40%, transparent 100%)`);
    }
    // pins keep a constant on-screen size and follow their home's light
    const a = Math.min(1, h.r / MAX_R);
    h.pin.style.opacity = a;
    h.pin.style.transform = `scale(${(1 / k) * (0.6 + 0.4 * a)})`;
    h.pin.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
  });

  // lens: eased follow, converted from viewport px into stage px
  lens.x += (lens.tx - lens.x) * 0.14;
  lens.y += (lens.ty - lens.y) * 0.14;
  if (lens.strength > 0.01) {
    const lx = (lens.x - rect.left) / k;
    const ly = (lens.y - rect.top) / k;
    const lr = (lens.r * (0.6 + 0.4 * lens.strength)) / k;
    const s = lens.strength.toFixed(3);
    layers.push(`radial-gradient(circle ${lr}px at ${lx}px ${ly}px, rgba(0,0,0,${s}) 0%, rgba(0,0,0,${s}) 35%, transparent 100%)`);
  }
  lensRing.style.transform = `translate(${lens.x}px, ${lens.y}px) scale(${0.6 + 0.4 * lens.strength})`;
  lensRing.style.opacity = (lens.strength * 0.9).toFixed(3);

  const mask = layers.length ? layers.join(',') : 'linear-gradient(transparent, transparent)';
  colorLayer.style.webkitMaskImage = mask;
  colorLayer.style.maskImage = mask;

  clusterLabel.style.opacity = labelState.a;
  links.style.opacity = labelState.a;
  clusterLabel.style.transform = `scale(${1 / k})`;
}
gsap.ticker.add(render);

// ---------- Headline split ----------
const headline = $('#headline');
headline.innerHTML = headline.textContent
  .split(' ')
  .map((w) => `<span class="w"><span>${w}</span></span>`)
  .join(' ');

// ---------- Stage framing ----------
// camera.js frames the stage on scroll; the inner layer keeps the intro settle and the pointer parallax.
const ORIGIN = '38.5% 51.5%';
gsap.set(inner, { transformOrigin: ORIGIN });
window.street = { homes, cluster, MAX_R, showMap: SHOW_MAP };

// ---------- Intro ----------
let intro;
function playIntro() {
  intro && intro.kill();
  homes[0].r = 0;
  homes[0].pin.classList.remove('show-tag');
  const counts = document.querySelectorAll('.count');
  counts.forEach((c) => (c.textContent = '0'));

  intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo(inner, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: 'power3.out' }, 0)
    .fromTo('#headline .w > span', { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.045 }, 0.25)
    .fromTo('#sub', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.7)
    .fromTo('#ctaRow', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.85)
    // the first home warms up into colour
    .to(homes[0], { r: MAX_R, duration: 2.2, ease: 'power2.inOut' }, 1.1)
    .add(() => homes[0].pin.classList.add('show-tag'), 2.6)
    .add(() => homes[0].pin.classList.remove('show-tag'), 5.2)
    .fromTo('.proof-label', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.4)
    .fromTo('#proof .card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 1.5)
    .fromTo('#scrollHint', { opacity: 0 }, { opacity: 1, duration: 1 }, 2.4);

  counts.forEach((c, i) => {
    const o = { v: 0 };
    intro.to(o, {
      v: +c.dataset.to, duration: 1.6, ease: 'power2.out',
      onUpdate: () => (c.textContent = Math.round(o.v)),
    }, 1.6 + i * 0.09);
  });
}

// ---------- Scroll: pull back from one home to the neighbourhood ----------
function buildScroll() {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
  });

  tl.to('#heroCopy', { y: -140, autoAlpha: 0, duration: 0.22, ease: 'power1.in' }, 0)
    .to('#proof', { y: 120, autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0)
    .to('#scrollHint', { opacity: 0, duration: 0.08 }, 0)
    .to('#veil', { opacity: 0.12, duration: 0.4 }, 0.04);

  if (SHOW_MAP) addMap(tl);
  tl.fromTo('#outro', { yPercent: 100 }, { yPercent: 0, duration: 0.12 }, 0.88);
  return tl;
}

// the street moment: the cluster across the street lights up, the rest of the neighbourhood stays grey
function addMap(tl) {
  cluster.forEach((h, i) => {
    tl.fromTo(h, { r: 0 }, { r: MAX_R, duration: 0.09, ease: 'power2.out' }, 0.46 + i * 0.05);
  });
  tl.fromTo(labelState, { a: 0 }, { a: 1, duration: 0.08 }, 0.62)
    .to(labelState, { a: 0, duration: 0.06 }, 0.88)
    // as the camera dives into your first home, the cluster goes back to grey — the Scale section fills it in again
    .to(cluster, { r: 0, duration: 0.08, ease: 'power2.in' }, 0.92);

  // your first home keeps its label while the map is on screen
  tl.eventCallback('onUpdate', () => {
    const p = tl.progress();
    if (p > 0.04) homes[0].pin.classList.toggle('show-tag', p > 0.4 && p < 0.9);
  });
}

// ---------- Magnetic CTA ----------
document.querySelectorAll('.magnetic').forEach((btn) => {
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    btn.style.setProperty('--hx', mx + 'px');
    btn.style.setProperty('--hy', my + 'px');
    if (!opts.magnetic) return;
    btn.style.setProperty('--bx', (mx - r.width / 2) * 0.18 + 'px');
    btn.style.setProperty('--by', (my - r.height / 2) * 0.3 + 'px');
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.setProperty('--bx', '0px');
    btn.style.setProperty('--by', '0px');
  });
});

// ---------- Nav state ----------
const nav = $('.nav');
ScrollTrigger.create({
  start: 40, end: 'max',
  onToggle: (s) => nav.classList.toggle('solid', s.isActive),
});
// tuck the nav away while scrolling; bring it back once scrolling stops
let navTimer, lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (Math.abs(y - lastY) > 2 && y > 120 && !nav.matches(':hover')) nav.classList.add('tucked');
  lastY = y;
  clearTimeout(navTimer);
  navTimer = setTimeout(() => nav.classList.remove('tucked'), 220);
  if (y <= 120) nav.classList.remove('tucked');
}, { passive: true });

// ---------- Smooth scroll ----------
if (!reduceMotion) {
  const lenis = new Lenis({ lerp: 0.09 });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------- Lab panel ----------
$('#labToggle').addEventListener('click', () => $('#lab').classList.toggle('closed'));
document.querySelectorAll('[data-opt]').forEach((cb) => {
  cb.addEventListener('change', () => {
    opts[cb.dataset.opt] = cb.checked;
    document.body.classList.toggle('no-' + cb.dataset.opt, !cb.checked);
    if (cb.dataset.opt === 'lens' && !cb.checked) gsap.to(lens, { strength: 0, duration: 0.4 });
    if (cb.dataset.opt === 'parallax' && !cb.checked) { px(0); py(0); }
  });
});
$('#replay').addEventListener('click', () => { window.scrollTo(0, 0); playIntro(); });

// ---------- Boot ----------
const img = colorLayer;
const boot = () => {
  buildScroll();
  if (reduceMotion) {
    homes[0].r = MAX_R;
    cluster.forEach((h) => (h.r = MAX_R));
    labelState.a = 1;
    homes[0].pin.classList.add('show-tag');
    document.querySelectorAll('.count').forEach((c) => (c.textContent = c.dataset.to));
  } else {
    playIntro();
  }
};
img.complete ? boot() : img.addEventListener('load', boot, { once: true });
