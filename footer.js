// Footer — the neighbourhood at night, blended into the page.
(() => {
  const ft = document.getElementById('footer');
  const stage = document.getElementById('ftStage');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the night image always covers the whole footer, however tall it gets
  const sizeStage = () => { stage.style.width = Math.max(ft.clientWidth, ft.clientHeight * (3032 / 1706)) + 'px'; };
  sizeStage();
  window.addEventListener('resize', sizeStage);

  // nav switches to its dark style while it sits over the footer
  ScrollTrigger.create({ trigger: ft, start: 'top 64px', end: 'bottom top', onToggle: (self) => document.querySelector('.nav').classList.toggle('on-dark', self.isActive) });

  // checklist form (prototype: nothing is sent)
  const form = document.getElementById('ftForm'), note = document.getElementById('ftNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    form.classList.toggle('err', !ok);
    note.textContent = ok ? `Sent. The checklist is on its way to ${input.value.trim()}.` : 'Please add a valid email.';
    if (ok) input.value = '';
  });

  if (reduce) return;

  gsap.timeline({ scrollTrigger: { trigger: ft, start: 'top 70%', toggleActions: 'play none none reverse' } })
    .fromTo('.ft-tagline, .ft-pitch > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0)
    .fromTo('.ft-mid, .ft-bottom', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.1 }, 0.3);

  // wordmark rises as you reach the very bottom
  gsap.fromTo('.ft-word span', { yPercent: 55 }, {
    yPercent: 0, ease: 'none', stagger: 0.08,
    scrollTrigger: { trigger: '.ft-word', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
  });
})();
