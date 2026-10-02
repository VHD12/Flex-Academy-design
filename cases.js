// Case studies — each card shows a crop of its home from the neighbourhood, and the cards settle in as the section arrives.
(() => {
  const IMG_RATIO = 1706 / 3032;
  const section = document.getElementById('results');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function crop() {
    section.querySelectorAll('.case-art').forEach((n) => {
      const [fx, fy] = n.dataset.focus.split(',').map((v) => v / 100);
      const w = n.offsetWidth, h = n.offsetHeight;
      if (!w) return;
      const iw = w * +n.dataset.zoom, ih = iw * IMG_RATIO;
      n.style.backgroundSize = `${iw}px ${ih}px`;
      n.style.backgroundPosition = `${w * 0.62 - fx * iw}px ${h * 0.55 - fy * ih}px`;
    });
  }
  crop();
  window.addEventListener('resize', crop);

  // the nav's "Results" link glides here
  document.querySelectorAll('a[href="#results"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.lenis ? window.lenis.scrollTo(section, { duration: 1.4 }) : section.scrollIntoView({ behavior: 'smooth' });
  }));

  if (reduce) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } })
    .fromTo('.cases-head > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0)
    .fromTo('.case', { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.15);
})();
