// Pricing — two plans; cards light up under the pointer and checks draw in on arrival.
(() => {
  const IMG_RATIO = 1706 / 3032;
  const section = document.getElementById('pricing');
  const plans = gsap.utils.toArray('.plan');
  const list = document.querySelector('.plans');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function layout() {
    const phone = innerWidth <= 900;
    const s = phone ? 1 : Math.max(0.6, Math.min(1.25, Math.min(innerWidth / 1440, innerHeight / 760)));
    section.style.setProperty('--s', s.toFixed(4));
    section.querySelectorAll('[data-focus]').forEach((n) => {
      const [fx, fy] = n.dataset.focus.split(',').map((v) => v / 100);
      const [sx, sy] = (n.dataset.shift || '0,0').split(',').map(Number);
      const w = n.offsetWidth, h = n.offsetHeight;
      const iw = w * +n.dataset.zoom, ih = iw * IMG_RATIO;
      n.style.backgroundSize = `${iw}px ${ih}px`;
      n.style.backgroundPosition = `${w * (0.5 + sx) - fx * iw}px ${h * (0.5 + sy) - fy * ih}px`;
    });
  }
  layout();
  window.addEventListener('resize', layout);

  plans.forEach((p) => {
    p.addEventListener('pointermove', (e) => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      p.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
    p.addEventListener('pointerenter', () => list.classList.add('has-hover'));
    p.addEventListener('pointerleave', () => list.classList.remove('has-hover'));
  });

  if (reduce) { plans.forEach((p) => p.classList.add('in')); return; }

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' } })
    .from('.price-intro > *', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0)
    .from(plans, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.14 }, 0.1)
    .from('.plan-list li', { x: -12, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.05 }, 0.45)
    .add(() => plans.forEach((p) => p.classList.add('in')), 0.5);
})();
