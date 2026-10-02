// FAQ — one answer open at a time; answers open and close by height, and the nav's "Faqs" link glides here.
(() => {
  const section = document.getElementById('faq');
  const items = [...section.querySelectorAll('.faq-item')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);

  function set(item, open) {
    const a = item.querySelector('.faq-a');
    item.classList.toggle('open', open);
    item.querySelector('.faq-q').setAttribute('aria-expanded', String(open));
    gsap.fromTo(a, { height: a.offsetHeight }, {
      height: open ? a.scrollHeight : 0, duration: D(0.55), ease: 'expo.out', overwrite: true,
      onComplete: () => { a.style.height = open ? 'auto' : '0px'; window.ScrollTrigger && ScrollTrigger.refresh(); },
    });
    if (open) gsap.fromTo(a.firstElementChild, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: D(0.5), ease: 'power2.out', delay: D(0.08) });
  }

  items.forEach((item) => item.querySelector('.faq-q').addEventListener('click', () => {
    const opening = !item.classList.contains('open');
    items.forEach((o) => { if (o !== item && o.classList.contains('open')) set(o, false); });
    set(item, opening);
  }));

  document.querySelectorAll('a[href="#faq"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.lenis ? window.lenis.scrollTo(section, { duration: 1.4 }) : section.scrollIntoView({ behavior: 'smooth' });
  }));

  if (reduce) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } })
    .fromTo('.faq-head > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0)
    .fromTo('.faq-item', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.15);
})();
