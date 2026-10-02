// "What you'll learn" — both columns pinned in one viewport.
// The right image never changes; the cards over it progress Start → Build → Scale.
(() => {
  const IMG_RATIO = 1706 / 3032;
  const section = document.getElementById('learn');
  const learnBg = document.getElementById('learnBg');
  const perks = gsap.utils.toArray('#perks li');
  const cards = gsap.utils.toArray('.step-card');
  const railBars = gsap.utils.toArray('#rail b');
  const el = (k) => document.querySelector(`[data-el="${k}"]`);
  const E = { booking: el('booking'), filled: el('filled'), main: el('main'), ready: el('ready'), lb: el('lb'), lc: el('lc') };
  const nights = E.filled.querySelectorAll('.nights i');
  const tick = E.booking.querySelector('.tick');
  const BG = ['#f7f3e8', '#eef0e7', '#e9eeeb'];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = () => innerWidth <= 900;

  // ---------- Fit the 720×900 design boxes to the viewport ----------
  function fit() {
    const s = isPhone()
      ? Math.min(innerWidth / 400, innerHeight / 820)
      : Math.min(innerWidth / 1440, innerHeight / 900);
    const k = Math.max(0.55, Math.min(1.3, s));
    section.style.setProperty('--s', k.toFixed(4));
    pinFounders(k);
  }

  // layout B: the "Hosted by" card always ends 40px above the viewport's bottom edge
  const founders = section.querySelector('.founders');
  function pinFounders(k) {
    const layoutB = !document.body.classList.contains('no-learnB');
    if (!layoutB || isPhone()) { founders.style.top = ''; return; }
    const boxTop = innerHeight / 2 - 450 * k;                      // the 720×900 box is centred, then scaled by k
    const top = ((innerHeight - 40) - boxTop) / k - founders.offsetHeight;
    founders.style.top = Math.max(500, top) + 'px';               // never ride up into the CTA
  }
  document.querySelectorAll('[data-opt="learnB"]').forEach((cb) => cb.addEventListener('change', () => requestAnimationFrame(fit)));

  // ---------- Crop the neighbourhood image onto the scene and thumbs ----------
  function crop() {
    document.querySelectorAll('.learn [data-focus]').forEach((n) => {
      const [fx, fy] = n.dataset.focus.split(',').map((v) => v / 100);
      const [sx, sy] = (n.dataset.shift || '0,0').split(',').map(Number);
      const w = n.offsetWidth, h = n.offsetHeight;
      const iw = w * +n.dataset.zoom, ih = iw * IMG_RATIO;
      n.style.backgroundSize = `${iw}px ${ih}px`;
      n.style.backgroundPosition = `${w * (0.5 + sx) - fx * iw}px ${h * (0.5 + sy) - fy * ih}px`;
    });
  }

  // ---------- Where every element sits in each state (design px) ----------
  const HIDE = { autoAlpha: 0 };
  function states() {
    const p = isPhone();
    const main = p ? [{ x: 68, y: 300 }, { x: 16, y: 300 }] : [{ x: 300, y: 395 }, { x: 137, y: 392 }];
    const lb = p ? { x: 215, y: 290 } : { x: 476, y: 380 };
    const lc = p ? { x: 215, y: 560 } : { x: 476, y: 640 };
    return {
      booking: [{ autoAlpha: 1, x: 0, y: 0, scale: 1 }, { ...HIDE, y: -30, scale: 0.96 }, { ...HIDE, y: -30, scale: 0.96 }],
      filled:  [{ autoAlpha: 1, x: 0, y: 0 }, { ...HIDE, y: 30 }, { ...HIDE, y: 30 }],
      main:    [{ ...HIDE, ...main[0], y: main[0].y + 70, rotate: -3 }, { autoAlpha: 1, ...main[0], rotate: 0, scale: 1 }, { autoAlpha: 1, ...main[1], rotate: 0, scale: 1 }],
      ready:   [{ ...HIDE, y: 30, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1 }, { ...HIDE, y: 30, scale: 0.94 }],
      lb:      [{ ...HIDE, x: lb.x - 120, y: lb.y + 30, scale: 0.85 }, { ...HIDE, x: lb.x - 120, y: lb.y + 30, scale: 0.85 }, { autoAlpha: 1, ...lb, scale: 1 }],
      lc:      [{ ...HIDE, x: lc.x - 120, y: lc.y + 30, scale: 0.85 }, { ...HIDE, x: lc.x - 120, y: lc.y + 30, scale: 0.85 }, { autoAlpha: 1, ...lc, scale: 1 }],
    };
  }
  // stagger order inside each state
  const DELAY = {
    0: { booking: 0.15, filled: 0.3 },
    1: { main: 0.1, ready: 0.9 },
    2: { main: 0, lb: 0.25, lc: 0.4 },
  };

  let current = -1;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function micro(i, from) {
    timers.splice(0).forEach(clearTimeout);
    if (i === 0) {
      gsap.fromTo(tick, { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.5, delay: 0.55, ease: 'power2.out' });
      nights.forEach((n) => n.classList.remove('on'));
      nights.forEach((n, k) => later(() => n.classList.add('on'), 700 + k * 110));
    }
    if (i === 1 && from < 1) {
      E.main.classList.remove('filled');
      gsap.fromTo(E.main.querySelector('.thumb'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, delay: 0.2, ease: 'expo.out' });
      later(() => E.main.classList.add('filled'), 1100);
    }
    if (i === 2 || (i === 1 && from >= 1)) E.main.classList.add("filled");
  }

  function go(i, instant = false) {
    if (i === current && !instant) return;
    const from = current;
    current = i;
    const S = states();
    const dir = from < 0 || i > from ? 1 : -1;

    cards.forEach((c, k) => {
      if (k === i) gsap.fromTo(c, { autoAlpha: 0, y: 24 * dir }, { autoAlpha: 1, y: 0, duration: instant ? 0 : 0.7, delay: instant ? 0 : 0.1, ease: 'expo.out', overwrite: true });
      else gsap.to(c, { autoAlpha: 0, y: -24 * dir, duration: instant ? 0 : 0.4, ease: 'power2.in', overwrite: true });
    });

    Object.keys(E).forEach((k) => {
      const to = S[k][i];
      const visible = to.autoAlpha === 1;
      gsap.to(E[k], {
        ...to,
        duration: instant ? 0 : visible ? 0.9 : 0.45,
        delay: instant ? 0 : visible ? (DELAY[i][k] || 0) : 0,
        ease: visible ? 'expo.out' : 'power2.in',
        overwrite: true,
      });
    });

    perks.forEach((li, k) => li.classList.toggle('active', k === i));
    gsap.to(learnBg, { backgroundColor: BG[i], duration: instant ? 0 : 0.9, ease: 'power2.out', overwrite: 'auto' });
    if (!reduce && !instant) micro(i, from);
    if (instant || reduce) {
      if (i >= 1) E.main.classList.add('filled');
      gsap.set(tick, { strokeDashoffset: 0 });
      nights.forEach((n) => n.classList.add('on'));
    }
  }

  // ---------- Scroll drives the state ----------
  // the section is pinned under the camera's dive first (desktop one screen; phone two, for the intro and the host card),
  // then the steps run for three screens until the Scale section takes over
  const desk = () => innerWidth > 900;
  const lead = () => (desk() ? 1 : 2) * innerHeight;
  ScrollTrigger.create({
    id: 'learnSteps',
    trigger: section,
    start: () => `top+=${lead()} top`,
    end: () => `top+=${lead() + 3 * innerHeight} top`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const p = self.progress * 3;
      railBars.forEach((b, k) => gsap.set(b, { scaleX: Math.max(0, Math.min(1, p - k)) }));
      go(Math.min(2, Math.floor(p * 0.9999)));
    },
  });

  // play the first state's details once the camera has landed on the home
  document.addEventListener('learn:landed', () => { if (current === 0 && !reduce) micro(0, -1); });

  // ---------- "About Launch Programme" glides to the Launch plan ----------
  section.querySelectorAll('[data-scroll-to]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.dataset.scrollTo) || document.getElementById('pricing');
    window.lenis ? window.lenis.scrollTo(target, { offset: -120, duration: 1.4 }) : target.scrollIntoView({ behavior: 'smooth' });
  }));

  // ---------- Perks jump to their step ----------
  perks.forEach((li, k) => li.addEventListener('click', () => {
    const st = ScrollTrigger.getById('learnSteps');
    const y = st.start + (st.end - st.start) * ((k + 0.5) / 3);
    window.lenis ? window.lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' });
  }));

  const layout = () => { fit(); crop(); go(Math.max(0, current), true); ScrollTrigger.refresh(); };
  window.addEventListener('resize', layout);
  fit(); crop(); go(0, true);
})();
