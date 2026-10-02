// Scale path — the right side moves from home to home on its own,
// lighting each one up and surfacing the problems that come with it.
(() => {
  const IMG_RATIO = 1706 / 3032;
  const section = document.getElementById('ops');
  const region = document.getElementById('opsRight');
  const stage = document.getElementById('opsStage');
  const colorLayer = document.getElementById('opsColor');
  const calloutsEl = document.getElementById('opsCallouts');
  const progressEl = document.getElementById('opsProgress');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.set(stage, { transformOrigin: '0 0' });
  // the shared camera (camera.js) carries the image, so the loop moves that camera and lights the hero's homes.
  const CAM = !!(window.cam && window.street);

  const ICON = {
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    layers: '<path d="M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.8-3.2 3.2-5 6-5s5.2 1.8 6 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.5 14.7c2.6-.3 4.8 1.2 5.5 4.3"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 1 1-3-3l7.7-7.7a4 4 0 0 0-2-2z"/><path d="M5 5l3 3M3.5 8.5l5-5"/>',
    margin: '<path d="M4 7l6 6 4-4 6 6"/><path d="M14 15h6V9"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  };

  // The cluster across the street from your first home: one operator's homes, one stop each —
  // the everyday problem, then what the Scale programme gives them for it. The last stop is the whole cluster.
  const FIRST = { x: 38.5, y: 51.5 };
  const homes = [
    { x: 60.0, y: 78.5, icon: 'message', problem: 'Guest enquiries take too much time',          fix: 'One inbox for every platform',        via: 'Unified guest inbox · Base360' },
    { x: 62.6, y: 53.5, icon: 'layers',  problem: 'Managing multiple listings is overwhelming',  fix: 'Listings and calendars kept in sync', via: 'Channel manager, 130+ platforms · Base360' },
    { x: 85.0, y: 53.0, icon: 'margin',  problem: 'Margins are getting thin',                    fix: 'Prices that follow demand',           via: 'AI pricing · Base360' },
    { x: 76.6, y: 29.0, icon: 'users',   problem: 'Cleaners and repairs are hard to coordinate', fix: 'Turnovers scheduled and tracked',     via: 'Cleaning & maintenance · Base360' },
    { x: 56.2, y: 25.0, icon: 'star',    problem: 'Guest reviews are inconsistent',              fix: 'The same stay, every time',           via: 'Guest-experience SOPs · Scale programme' },
    { x: 68.1, y: 47.8, icon: 'clock',   problem: 'No time to grow',                             fix: 'Time back to plan the next unit',     via: 'Weekly sessions & a monthly 1:1 · Scale programme', all: true },
  ];
  const houses = homes.filter((h) => !h.all);
  const CHECK = '<path d="M5 12.5l4.2 4.2L19 7"/>';

  homes.forEach((h) => {
    const wrap = document.createElement('div');
    wrap.innerHTML =
      `<div class="co a" style="left:${h.x}%;top:${h.y - 3}%">
        <div class="co-card pair">
          <div class="pr prob"><i class="ic"><svg viewBox="0 0 24 24">${ICON[h.icon]}</svg></i><span>${h.problem}</span></div>
          <div class="pr sol"><i class="ic ok"><svg viewBox="0 0 24 24">${CHECK}</svg></i><span><b>${h.fix}</b><em>${h.via}</em></span></div>
        </div><i class="co-ping"></i></div>`;
    h.co = wrap.querySelector('.co');
    h.card = wrap.querySelector('.co-card');
    h.prob = wrap.querySelector('.prob');
    h.sol = wrap.querySelector('.sol');
    h.ping = wrap.querySelector('.co-ping');
    calloutsEl.append(...wrap.children);

    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Show next home');
    btn.innerHTML = '<i><b></b></i>';
    progressEl.appendChild(btn);
    h.bar = btn.querySelector('b');
  });

  if (CAM) document.getElementById('stageInner').appendChild(calloutsEl);

  // ---------- Layout: scale the left frame, size the stage ----------
  let W = 0, H = 0;
  function layout() {
    const phone = innerWidth <= 900;
    const s = phone ? 1 : Math.max(0.55, Math.min(1.3, Math.min(innerWidth / 1440, innerHeight / 900)));
    section.style.setProperty('--s', s.toFixed(4));
    section.style.setProperty('--off', phone ? '0px' : Math.max(0, (innerWidth - 1440 * s) / 2) + 'px');
    const r = region.getBoundingClientRect();
    W = Math.max(r.width * (phone ? 3.2 : 2.3), r.height * 2.6);
    H = W * IMG_RATIO;
    stage.style.width = W + 'px';
    stage.style.height = H + 'px';
    calloutsEl.style.setProperty('--cs', s);
    if (CAM) {
      homes.forEach((h) => (h.co.style.transform = '')); // the camera's --inv keeps cards their size
      window.cam.ops = window.cam.opsFrame(current >= 0 ? homes[current] : homes[0]);
    } else {
      // cards keep their size on screen, even on the stop where the stage eases back
      homes.forEach((h) => (h.co.style.transform = `scale(${(phone ? 1 : s) / framing(h).scale})`));
      if (current >= 0) gsap.set(stage, framing(homes[current]));
    }
    pinHost(s, phone);
  }

  // the founders card always ends 40px above the viewport's bottom edge, like "What you'll learn"
  const host = section.querySelector('.ops-host');
  function pinHost(s, phone) {
    if (phone) { host.style.top = ''; return; }
    const boxTop = innerHeight / 2 - 450 * s;                      // the 720×900 box is centred, then scaled by s
    const top = ((innerHeight - 40) - boxTop) / s - host.offsetHeight;
    host.style.top = Math.max(500, top) + 'px';                   // never ride up into the CTAs
  }

  section.querySelectorAll('[data-scroll-to]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.dataset.scrollTo) || document.getElementById('pricing');
    window.lenis ? window.lenis.scrollTo(target, { offset: -120, duration: 1.4 }) : target.scrollIntoView({ behavior: 'smooth' });
  }));

  // where the stage must sit so a home lands at the focal point of the right side
  function framing(h) {
    const r = region.getBoundingClientRect();
    const phone = innerWidth <= 900;
    // the closing stop eases back so the whole cluster is in view
    const scale = h.all ? Math.max(0.7, r.height / H, r.width / W) : 1;
    const fx = r.width * (phone ? 0.45 : 0.6), fy = r.height * (phone ? 0.58 : 0.56);
    const x = gsap.utils.clamp(r.width - W * scale, 0, fx - (h.x / 100) * W * scale);
    const y = gsap.utils.clamp(r.height - H * scale, 0, fy - (h.y / 100) * H * scale);
    return { x, y, scale };
  }

  // ---------- Colour lights: the first home, then each cluster home stays lit once visited ----------
  const street = window.street;
  const R = CAM ? street.MAX_R : 0.075;
  const firstLight = CAM ? street.homes[0] : { ...FIRST, r: 0 };
  houses.forEach((h) => (h.light = CAM ? street.homes.find((o) => o.x === h.x && o.y === h.y) : { x: h.x, y: h.y, r: 0 }));
  const lights = [firstLight, ...houses.map((h) => h.light)];
  function paint() {
    if (CAM) return; // hero.js paints the shared stage every frame
    const layers = lights.filter((l) => l.r > 0.001)
      .map((l) => `radial-gradient(circle ${l.r * W}px at ${l.x}% ${l.y}%, #000 0%, #000 45%, transparent 100%)`);
    const mask = layers.length ? layers.join(',') : 'linear-gradient(transparent, transparent)';
    colorLayer.style.webkitMaskImage = mask;
    colorLayer.style.maskImage = mask;
  }

  // ---------- The loop ----------
  const HOLD = 2.6;
  let current = -1, tl = null, playing = false, hovered = false;

  let arrived = CAM; // phones: the first time in, the camera crosses the street from your first home (desktop does it on scroll)

  function show(i) {
    const prev = current >= 0 ? homes[current] : null;
    current = i;
    const h = homes[i];
    tl && tl.kill();
    homes.forEach((o, k) => gsap.set(o.bar, { scaleX: k < i ? 1 : 0 }));

    tl = gsap.timeline({ onComplete: () => show((i + 1) % homes.length) });
    let t = 0;
    if (!arrived) {
      arrived = true;
      gsap.set(stage, framing(FIRST));
      tl.to(firstLight, { r: R, duration: 0.6, ease: 'power2.out', onUpdate: paint }, 0)
        .to(firstLight, { r: R * 0.6, duration: 0.8, ease: 'power2.inOut', onUpdate: paint }, 1.2);
      t = 0.9;
    }
    if (prev) {
      tl.to(prev.card, { autoAlpha: 0, y: -10, scale: 0.96, duration: 0.28, ease: 'power2.in' }, 0)
        .to(prev.ping, { autoAlpha: 0, duration: 0.3 }, 0);
      t = 0.25;
    }
    // starting the loop again: the cluster goes back to grey and fills in once more
    if (i === 0 && prev) tl.to(houses.map((o) => o.light), { r: 0, duration: 0.6, ease: 'power2.in', onUpdate: paint }, 0);

    const travel = prev || t ? 1.1 : 0;
    const lit = h.all ? houses.map((o) => o.light) : [h.light];
    tl.add('move', t)
      .to(CAM ? window.cam.ops : stage, { ...(CAM ? window.cam.opsFrame(h) : framing(h)), duration: travel, ease: 'power3.inOut' }, 'move')
      .to(lit, { r: R, duration: 0.9, ease: 'power2.out', stagger: h.all ? 0.06 : 0, onUpdate: paint }, travel ? 'move+=0.7' : 'move')
      .fromTo(h.ping, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, travel ? 'move+=0.85' : 'move+=0.2')
      // the problem lands first…
      .fromTo(h.card, { autoAlpha: 0, y: 14, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, travel ? 'move+=0.95' : 'move+=0.3')
      .fromTo(h.prob, { opacity: 1 }, { opacity: 1, duration: 0.01 }, '<')
      .set(h.sol, { height: 0, opacity: 0 }, '<')
      // …then its answer opens underneath, and the problem steps back a little
      .to(h.sol, { height: 'auto', opacity: 1, duration: 0.5, ease: 'expo.out' }, travel ? 'move+=1.4' : 'move+=0.75')
      .to(h.prob, { opacity: 0.55, duration: 0.5 }, '<')
      .fromTo(h.bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD + 0.9, ease: 'none' }, travel ? 'move+=0.45' : 'move');
    tl.to({}, { duration: 0.01 }, '>0.3'); // let the bar finish before the next home
    if (!playing || hovered) tl.pause();
  }

  const resume = () => { if (tl && playing && !hovered) tl.play(); };
  region.addEventListener('pointerenter', () => { hovered = true; tl && tl.pause(); });
  region.addEventListener('pointerleave', () => { hovered = false; resume(); });
  progressEl.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => { arrived = true; show(k); }));

  ScrollTrigger.create({
    trigger: section, start: CAM ? () => `top+=${innerHeight * 0.85} top` : 'top 70%', end: 'bottom 30%', invalidateOnRefresh: true,
    onToggle: (self) => {
      playing = self.isActive;
      if (current < 0) show(0);
      playing ? resume() : tl && tl.pause();
    },
  });

  layout();
  window.addEventListener('resize', layout);

  if (reduce) { // static: first home lit, its problems visible
    current = 0;
    if (CAM) window.cam.ops = window.cam.opsFrame(homes[0]); else gsap.set(stage, framing(homes[0]));
    firstLight.r = CAM ? R : R * 0.6; homes[0].light.r = R; paint();
    gsap.set([homes[0].card, homes[0].ping], { autoAlpha: 1 });
    playing = false;
    return;
  }
  if (!CAM) gsap.set(stage, framing(FIRST));
})();
