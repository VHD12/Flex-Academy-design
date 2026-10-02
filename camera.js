// One camera over one neighbourhood. The hero image is the anchor until the Scale programme:
// hero (close on your first home) → the street → dive into your first home (What you'll learn)
// → a step back for the Scale step → across the street to the cluster (Scale) → the whole street → pricing.
// Desktop: the image narrows to the right of the text. Phone: it sits below the text, then fills the screen for the steps.
(() => {
  const RATIO = 1706 / 3032;
  const cam = document.getElementById('cam');
  const view = document.getElementById('camView');
  const stage = document.getElementById('stage');
  const fade = document.getElementById('camFade');
  const hero = document.getElementById('hero');
  const learn = document.getElementById('learn');
  const ops = document.getElementById('ops');
  const price = document.getElementById('pricing');
  const FIRST = { x: 38.5, y: 51.5 };
  const clamp = (lo, hi, v) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  const $ = (s) => document.querySelector(s);

  const desk = () => innerWidth > 900;
  const fit = () => Math.max(0.55, Math.min(1.3, Math.min(innerWidth / 1440, innerHeight / 900)));
  const fitPhone = () => Math.max(0.55, Math.min(1.3, Math.min(innerWidth / 400, innerHeight / 820)));
  const base = () => Math.max(innerWidth, innerHeight / RATIO); // the stage's natural width (covers the viewport)

  // A pose says: put image point (x, y)% on screen point (px, py), with the image iw px wide,
  // seen through a window that starts L px from the left and T px from the top.
  const api = (window.cam = { ops: null, desk, fit });

  // phone: where the text above the image ends (the image window starts just below it)
  let learnT = 0, opsT = 0;
  const below = (inner, last) => last.getBoundingClientRect().bottom - inner.getBoundingClientRect().top + 20;

  // the Scale section's framing of one home (shared with ops.js)
  api.opsFrame = (h) => {
    const vw = innerWidth, vh = innerHeight;
    if (!desk()) {
      const T = opsT, rh = vh - T;
      let W = Math.max(vw * 3.2, rh * 2.6);
      if (h.all) W *= Math.max(0.7, rh / (W * RATIO), vw / W);
      const H = W * RATIO;
      const tx = clamp(vw - W, 0, vw * 0.5 - (h.x / 100) * W);
      const ty = clamp(rh - H, 0, rh * 0.84 - (h.y / 100) * H); // low in the window, so its card fits above it
      return { x: h.x, y: h.y, iw: W, px: tx + (h.x / 100) * W, py: T + ty + (h.y / 100) * H, L: 0, T };
    }
    const s = fit();
    const L = Math.max(0, (vw - 1440 * s) / 2) + 324 * s, w = vw - L;
    let W = Math.max(w * 2.3, vh * 2.6);
    if (h.all) W *= Math.max(0.7, vh / (W * RATIO), w / W); // the closing stop eases back over the whole cluster
    const H = W * RATIO;
    const tx = clamp(w - W, 0, w * 0.6 - (h.x / 100) * W);
    const ty = clamp(vh - H, 0, vh * 0.56 - (h.y / 100) * H);
    return { x: h.x, y: h.y, iw: W, px: L + tx + (h.x / 100) * W, py: ty + (h.y / 100) * H, L, T: 0 };
  };

  function poses() {
    const vw = innerWidth, vh = innerHeight, B = base(), BH = B * RATIO;
    const small = vw < 760;
    const atFirst = { ...FIRST, px: vw / 2 + (FIRST.x / 100 - 0.5) * B, L: 0, T: 0 };
    const P = {
      heroStart: { ...atFirst, iw: B * (small ? 2.3 : 1.75), py: vh / 2 + (FIRST.y / 100 - 0.5) * BH + vh * (small ? 0.2 : 0.17) },
      street: { ...atFirst, iw: B, py: vh / 2 + (FIRST.y / 100 - 0.5) * BH },
    };
    if (desk()) {
      const s = fit(), half = vw / 2, boxTop = vh / 2 - 450 * s; // the right column's 720×900 design box
      const opsL = Math.max(0, (vw - 1440 * s) / 2) + 324 * s;
      P.firstHome = { ...FIRST, iw: 3520 * s, px: half + 488 * s, py: boxTop + 684 * s, L: half, T: 0 };
      P.nextHomes = { ...FIRST, iw: 1900 * s, px: half + 230 * s, py: boxTop + 610 * s, L: half, T: 0 };
      P.wide = { x: 58, y: 50, iw: Math.max(vw - opsL, vh / RATIO), px: opsL + (vw - opsL) * 0.55, py: vh / 2, L: opsL, T: 0 };
    } else {
      const s = fitPhone(), boxL = vw / 2 - 200 * s, boxT = vh / 2 - 410 * s; // the steps' 400×820 design box
      const rh = vh - learnT;
      P.firstHomeTop = { ...FIRST, iw: Math.max(vw * 6.5, rh * 4), px: vw * 0.55, py: learnT + rh * 0.56, L: 0, T: learnT };
      P.firstHome = { ...FIRST, iw: 3344 * s, px: boxL + 302 * s, py: boxT + 622 * s, L: 0, T: 0 };
      P.nextHomes = { ...FIRST, iw: 1800 * s, px: boxL + 150 * s, py: boxT + 600 * s, L: 0, T: 0 };
      P.wide = { x: 58, y: 50, iw: Math.max(vw, (vh - opsT) / RATIO), px: vw * 0.5, py: opsT + (vh - opsT) / 2, L: 0, T: opsT };
    }
    return P;
  }

  // the hero's opening keyframes: close on your first home, then (when the street moment is on) the pull-back to the street
  const showMap = () => !(window.street && window.street.showMap === false);
  const opening = (P, heroLen) => (showMap()
    ? [[0, P.heroStart], [0.04 * heroLen, P.heroStart], [0.59 * heroLen, P.street], [0.86 * heroLen, P.street]]
    : [[0, P.heroStart], [0.2 * heroLen, P.heroStart]]); // street moment hidden: hold, then dive straight in

  // keyframes along the page: [scrollY, pose]
  // Scenes overlap and stay pinned, so nothing slides in from below: text fades in place,
  // and the cards over the image only appear once the camera has landed.
  let K = [], heroEnd = 0, hideAt = Infinity;
  let Z = null; // scene points for the fades
  function measure() {
    const vh = innerHeight;
    if (!desk()) {
      learnT = below($('.learn-left .learn-inner'), $('.learn-intro'));
      opsT = below($('.ops-inner'), $('.ops-ctas'));
      ops.style.setProperty('--opsT', opsT + 'px');
    }
    const P = poses();
    const heroLen = hero.offsetHeight - vh;
    heroEnd = heroLen;
    const lt = learn.offsetTop, ot = ops.offsetTop, pt = price.offsetTop;
    if (desk()) {
      const s0 = lt + vh, sr = ot - s0;                              // the Start → Build → Scale steps
      Z = {
        learnIn: [lt + 0.35 * vh, lt + 0.8 * vh], learnLand: lt + 0.85 * vh,
        learnOut: [ot, ot + 0.35 * vh],
        opsIn: [ot + 0.4 * vh, ot + 0.8 * vh], opsLand: ot + 0.85 * vh, opsEnd: pt,
      };
      K = [
        ...opening(P, heroLen),
        [Z.learnLand, P.firstHome], [s0 + 0.62 * sr, P.firstHome],   // dive in; Start → Build close on your first home
        [s0 + 0.74 * sr, P.nextHomes], [ot, P.nextHomes],            // Scale step: a step back, the next homes in view
        [Z.opsLand, 'ops'], [pt - vh, 'ops'],                        // across the street to the cluster, and stay
        [pt, P.wide],                                                // the whole street, as pricing rises over it
      ];
    } else {
      // phone: intro over the home → who hosts it → the steps (image full screen) → Scale intro → who you'll speak to
      const s0 = lt + 2 * vh, sr = ot - s0;
      Z = {
        learnIn: [lt + 0.35 * vh, lt + 0.8 * vh],
        introOut: [lt + 1.1 * vh, lt + 1.35 * vh], hostIn: [lt + 1.35 * vh, lt + 1.6 * vh], hostOut: [lt + 1.85 * vh, lt + 2 * vh],
        learnLand: lt + 2.1 * vh,
        learnOut: [ot, ot + 0.35 * vh],
        opsIn: [ot + 0.4 * vh, ot + 0.8 * vh], opsLand: ot + 0.85 * vh,
        opsIntroOut: [ot + 1.45 * vh, ot + 1.65 * vh], opsHostIn: [ot + 1.65 * vh, ot + 1.85 * vh], opsEnd: pt,
      };
      K = [
        ...opening(P, heroLen),
        [lt + 0.85 * vh, P.firstHomeTop], [lt + 1.85 * vh, P.firstHomeTop], // the home sits below the text
        [Z.learnLand, P.firstHome], [s0 + 0.62 * sr, P.firstHome],           // then fills the screen for the steps
        [s0 + 0.74 * sr, P.nextHomes], [ot, P.nextHomes],
        [Z.opsLand, 'ops'], [pt - vh, 'ops'],
        [pt, P.wide],
      ];
    }
    hideAt = pt + vh;
  }

  // scene fades, driven by the same smoothed scroll as the camera
  const learnLeft = $('.learn-left');
  const learnRight = $('.learn-right');
  const learnIntro = $('.learn-intro');
  const learnHost = $('.learn .founders');
  const opsLeft = $('.ops-left');
  const opsIntro = [...document.querySelectorAll('.ops-inner > :not(.ops-host)')];
  const opsHost = $('.ops-host');
  const ramp = (y, [a, b]) => clamp(0, 1, (y - a) / (b - a));
  const setFade = (el, o) => { el.style.opacity = o.toFixed(3); el.style.visibility = o < 0.01 ? 'hidden' : ''; };
  let learnLanded = false;
  function scenes(y) {
    const out = 1 - ramp(y, Z.learnOut);
    setFade(learnLeft, Math.min(ramp(y, Z.learnIn), out));
    setFade(learnRight, out);
    setFade(opsLeft, ramp(y, Z.opsIn));
    if (Z.introOut) { // phone: the intro hands over to the host card, in the same spot
      setFade(learnIntro, 1 - ramp(y, Z.introOut));
      setFade(learnHost, Math.min(ramp(y, Z.hostIn), 1 - ramp(y, Z.hostOut)));
      const oi = 1 - ramp(y, Z.opsIntroOut);
      opsIntro.forEach((el) => setFade(el, oi));
      setFade(opsHost, ramp(y, Z.opsHostIn));
    } else {
      [learnIntro, learnHost, opsHost, ...opsIntro].forEach((el) => { el.style.opacity = ''; el.style.visibility = ''; });
    }
    const landed = y >= Z.learnLand - 2;
    if (landed !== learnLanded) {
      learnLanded = landed;
      document.body.classList.toggle('learn-landed', landed);
      if (landed) document.dispatchEvent(new CustomEvent('learn:landed'));
    }
    const opsOn = y >= Z.opsLand - 2 && y < Z.opsEnd;
    cam.classList.toggle('in-ops', opsOn);
    document.body.classList.toggle('ops-landed', opsOn);
  }

  const ease = (t) => t * t * (3 - 2 * t);
  const resolve = (p) => (p === 'ops' ? api.ops || poses().wide : p);
  function poseAt(y) {
    if (y <= K[0][0]) return resolve(K[0][1]);
    for (let i = 0; i < K.length - 1; i++) {
      const [a, A] = K[i], [b, B] = K[i + 1];
      if (y < b) {
        const t = ease((y - a) / (b - a || 1)), P = resolve(A), Q = resolve(B);
        const mix = (k) => (P[k] || 0) + ((Q[k] || 0) - (P[k] || 0)) * t;
        return { x: mix('x'), y: mix('y'), px: mix('px'), py: mix('py'), L: mix('L'), T: mix('T'), iw: Math.exp(Math.log(P.iw) + (Math.log(Q.iw) - Math.log(P.iw)) * t) };
      }
    }
    return resolve(K[K.length - 1][1]);
  }

  let yS = scrollY;
  function render() {
    yS += (scrollY - yS) * 0.18;
    if (Math.abs(scrollY - yS) < 0.5) yS = scrollY;
    scenes(yS);
    const hidden = yS > hideAt;
    cam.style.visibility = hidden ? 'hidden' : '';
    if (hidden) return;
    cam.classList.toggle('past-hero', yS > heroEnd * 0.95);
    cam.classList.toggle('phone', !desk());

    const p = poseAt(yS);
    const L = p.L || 0, T = p.T || 0;
    const ih = p.iw * RATIO, w = innerWidth - L, h = innerHeight - T, S = p.iw / base();
    const tx = clamp(w - p.iw, 0, p.px - L - (p.x / 100) * p.iw);
    const ty = clamp(h - ih, 0, p.py - T - (p.y / 100) * ih);
    view.style.left = L + 'px';
    view.style.top = T + 'px';
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${S})`;
    stage.style.setProperty('--inv', (1 / S).toFixed(4));
    fade.style.opacity = Math.min(1, (L + T) / 240).toFixed(3);
  }

  api.measure = measure;
  measure();
  gsap.ticker.add(render);
  ScrollTrigger.addEventListener('refresh', measure);
  window.addEventListener('resize', measure);
})();
