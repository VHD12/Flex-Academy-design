// Founders — layered card: photo, the word, then the two founders in front.
// Pointer adds depth; hovering a founder brings them forward and names them.
(() => {
  const section = document.getElementById('founders');
  const card = document.getElementById('fdrCard');
  const layers = [...card.querySelectorAll('.fdr-depth')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function layout() {
    const phone = innerWidth <= 900;
    const s = phone ? 1 : Math.max(0.6, Math.min(1.25, Math.min(innerWidth / 1440, innerHeight / 760)));
    section.style.setProperty('--s', s.toFixed(4));
    if (phone) { // the card keeps its composition and scales to the column
      const k = (innerWidth - 32) / 646;
      card.style.transform = `scale(${k})`;
      card.style.marginBottom = `${462 * (k - 1)}px`;
      card.style.marginRight = `${646 * (k - 1)}px`;   // shrink the layout box too, so the page never gets wider than the screen
    } else {
      card.style.transform = '';
      card.style.marginBottom = '';
      card.style.marginRight = '';
    }
  }
  layout();
  window.addEventListener('resize', layout);

  // ---------- Depth + focus ----------
  const movers = layers.map((l) => ({
    d: +l.dataset.depth,
    x: gsap.quickTo(l, 'x', { duration: 1, ease: 'power3.out' }),
    y: gsap.quickTo(l, 'y', { duration: 1, ease: 'power3.out' }),
  }));
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    if (fine && !reduce) movers.forEach((m) => { m.x(-nx * 14 * m.d); m.y(-ny * 10 * m.d); });
    card.dataset.focus = nx < 0 ? 'raouf' : 'michael';
  });
  card.addEventListener('pointerleave', () => {
    movers.forEach((m) => { m.x(0); m.y(0); });
    delete card.dataset.focus;
  });
  // touch: tap a founder to name them
  card.querySelectorAll('.fdr-person').forEach((p) => p.addEventListener('click', () => {
    if (card.dataset.focus === p.dataset.who) delete card.dataset.focus;
    else card.dataset.focus = p.dataset.who;
  }));

  const counts = section.querySelectorAll('.fcount');
  if (reduce) { counts.forEach((c) => (c.textContent = c.dataset.to)); return; }

  // ---------- Arrival ----------
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' } });
  const E = { ease: 'expo.out' };
  tl.fromTo('.fdr-left .kicker, .fdr-title, .fdr-quote', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ...E }, 0)
    .fromTo('.fdr-stats .card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ...E }, 0.3)
    .fromTo(card, { clipPath: 'inset(12% 8% 12% 8% round 21px)' }, { clipPath: 'inset(0% 0% 0% 0% round 21px)', duration: 1.4, ...E }, 0.1)
    .fromTo('.fdr-photo', { scale: 1.2, filter: 'blur(8px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.8, ...E }, 0.1)
    .fromTo('.fdr-people', { scale: 1.2 }, { scale: 1, duration: 1.8, ...E }, 0.1)
    .fromTo('#fdrWord', { yPercent: 60, opacity: 0, letterSpacing: '0.2em' }, { yPercent: 0, opacity: 0.8, letterSpacing: '-0.01em', duration: 1.4, ...E }, 0.35)
    .fromTo('.p-raouf img', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ...E }, 0.55)
    .fromTo('.p-michael img', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ...E }, 0.68)
    .fromTo('.fdr-years > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ...E }, 0.9)
    .fromTo('.fdr-brands', { y: 20, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)' }, 1.05);
  counts.forEach((c) => {
    const o = { v: 0 };
    tl.to(o, { v: +c.dataset.to, duration: 1.6, ease: 'power2.out', onUpdate: () => (c.textContent = Math.round(o.v)) }, 0.6);
  });
})();
