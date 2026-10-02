// Conversion flows — Launch: register for the webinar. Scale: book a strategy call.
// Info panel on the left, steps on the right. Prototype only: nothing is sent anywhere.
(() => {
  const IMG_RATIO = 1706 / 3032;
  const flow = document.getElementById('flow');
  const shell = flow.querySelector('.flow-shell');
  const backdrop = flow.querySelector('.flow-backdrop');
  const views = { webinar: flow.querySelector('[data-flow="webinar"]'), call: flow.querySelector('[data-flow="call"]') };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);
  const data = { webinar: {}, call: {} };
  let current = null;
  let lastFocus = null;

  const fmtDay = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  const tzName = (() => {
    const part = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
    return `${Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}${part ? ` (${part.value})` : ''}`;
  })();

  // ---------- Webinar date: next Thursday, 7pm UK time (sample) ----------
  const webinar = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + ((4 - d.getUTCDay() + 7) % 7 || 7));
    if (d - Date.now() < 3 * 864e5) d.setUTCDate(d.getUTCDate() + 7);
    d.setUTCHours(18, 0, 0, 0); // 19:00 BST / 18:00 UTC
    return { start: d, end: new Date(+d + 60 * 6e4) };
  })();
  document.querySelectorAll('[data-webinar-date]').forEach((n) => (n.textContent = fmtDay.format(webinar.start)));
  const ukTime = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Europe/London' }).format(webinar.start);
  const localTime = fmtTime.format(webinar.start);
  const sameZone = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/London';
  document.querySelectorAll('[data-webinar-time]').forEach((n) => (n.textContent = sameZone ? `${ukTime} UK time` : `${ukTime} UK (${localTime} your time)`));
  document.querySelectorAll('[data-tz]').forEach((n) => (n.textContent = tzName));

  // ---------- Image crops for the info panels ----------
  function crop(root) {
    root.querySelectorAll('[data-focus]').forEach((n) => {
      const [fx, fy] = n.dataset.focus.split(',').map((v) => v / 100);
      const [sx, sy] = (n.dataset.shift || '0,0').split(',').map(Number);
      const w = n.offsetWidth, h = n.offsetHeight;
      if (!w) return;
      const iw = w * +n.dataset.zoom, ih = iw * IMG_RATIO;
      n.style.backgroundSize = `${iw}px ${ih}px`;
      n.style.backgroundPosition = `${w * (0.5 + sx) - fx * iw}px ${h * (0.5 + sy) - fy * ih}px`;
    });
  }

  // ---------- Open / close ----------
  // the clicked button grows into the dialog, and the dialog shrinks back into it
  const morph = document.createElement('div');
  morph.className = 'flow-morph';
  flow.insertBefore(morph, shell);
  let source = null;
  const visible = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width && r.bottom > 0 && r.top < innerHeight ? r : null;
  };

  function open(name, step, src) {
    lastFocus = document.activeElement;
    source = src || null;
    current = name;
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('on', k === name));
    const view = views[name];
    show(step || view.querySelector('.fstep').dataset.step, true);
    flow.classList.add('open');
    flow.setAttribute('aria-hidden', 'false');
    window.lenis && window.lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    history.replaceState(null, '', name === 'webinar' ? '#register' : '#book');
    crop(view);

    const from = !reduce && visible(source);
    const tl = gsap.timeline();
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: D(0.4) }, 0);
    let t = 0.05;
    if (from) {
      const to = shell.getBoundingClientRect();
      const cs = getComputedStyle(source);
      gsap.set(shell, { opacity: 0 });
      gsap.set(morph, { display: 'block', opacity: 1, left: from.left, top: from.top, width: from.width, height: from.height,
        borderRadius: cs.borderRadius, backgroundColor: /rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) ? (name === 'webinar' ? '#0f2e2c' : '#2e250f') : cs.backgroundColor });
      tl.to(morph, { left: to.left, top: to.top, width: to.width, height: to.height, borderRadius: 28, duration: 0.7, ease: 'expo.inOut' }, 0)
        .to(shell, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0.55)
        .set(morph, { display: 'none' }, 0.9);
      t = 0.6;
    } else {
      tl.fromTo(shell, { y: 60, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: D(0.8), ease: 'expo.out' }, 0.05);
    }
    tl.fromTo(view.querySelectorAll('.info-body > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.8), ease: 'expo.out', stagger: D(0.05) }, t + 0.1)
    const art = view.querySelector('.info-art');
    if (art) tl.fromTo(art, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 0.4, duration: D(1.4), ease: 'expo.out' }, t);
    const people = view.querySelectorAll('.if-person img');
    if (people.length) tl.fromTo(people, { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: D(1.1), ease: 'expo.out', stagger: D(0.12) }, t + 0.05)
      .fromTo(view.querySelectorAll('.if-names p'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.7), ease: 'expo.out', stagger: D(0.1) }, t + 0.45);
  }

  function close() {
    if (!current) return;
    const back = !reduce && visible(source);
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(morph, { display: 'none' });
        gsap.set(shell, { clearProps: 'opacity,transform' });
        flow.classList.remove('open');
        flow.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        window.lenis && window.lenis.start();
        lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
      },
    });
    if (back) {
      const r = shell.getBoundingClientRect();
      gsap.set(morph, { display: 'block', opacity: 1, left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 28,
        backgroundColor: /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(source).backgroundColor) ? '#2e250f' : getComputedStyle(source).backgroundColor });
      tl.to(shell, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0)
        .to(morph, { left: back.left, top: back.top, width: back.width, height: back.height, borderRadius: getComputedStyle(source).borderRadius, duration: 0.6, ease: 'expo.inOut' }, 0.1)
        .to(backdrop, { opacity: 0, duration: 0.45 }, 0.25)
        .to(morph, { opacity: 0, duration: 0.15 }, 0.65);
    } else {
      tl.to(shell, { y: 40, opacity: 0, duration: D(0.35), ease: 'power2.in' }, 0)
        .to(backdrop, { opacity: 0, duration: D(0.35) }, 0.1);
    }
    history.replaceState(null, '', location.pathname + location.search);
    current = null;
  }

  // ---------- Steps ----------
  const PROGRESS = { qualify: 1, checklist: 1, slot: 2, done: 3, 'checklist-done': 1 };
  function show(step, instant = false) {
    const view = views[current];
    const from = view.querySelector('.fstep.is-active');
    const to = view.querySelector(`.fstep[data-step="${step}"]`);
    if (!to) return;
    if (current === 'call') {
      const n = PROGRESS[step] || 1;
      view.querySelectorAll('.fprogress i').forEach((b, i) => b.classList.toggle('on', i < n));
    }
    if (from && from !== to) {
      if (instant) { from.classList.remove('is-active'); gsap.set(from, { clearProps: 'all' }); }
      else gsap.to(from, { x: -30, opacity: 0, duration: D(0.3), ease: 'power2.in', onComplete: () => { from.classList.remove('is-active'); gsap.set(from, { clearProps: 'all' }); } });
    }
    gsap.delayedCall(instant || from === to ? 0 : D(0.25), () => {
      to.classList.add('is-active');
      to.scrollTop = 0;
      gsap.fromTo(to, { x: instant ? 0 : 30, opacity: 0 }, { x: 0, opacity: 1, duration: D(instant ? 0.6 : 0.55), ease: 'expo.out' });
      gsap.fromTo(to.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.6), ease: 'expo.out', stagger: D(0.04), delay: D(0.05) });
      const first = to.querySelector('input:not([type=radio]), select');
      if (first && !('ontouchstart' in window)) setTimeout(() => first.focus({ preventScroll: true }), instant ? 500 : 250);
    });
  }

  // ---------- Validation ----------
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  function checkField(input) {
    const field = input.closest('.field');
    if (!field) return true;
    const ok = input.type === 'email' ? emailOk(input.value) : !!input.value.trim();
    field.classList.toggle('err', !ok);
    return ok;
  }
  function checkForm(form) {
    let ok = true;
    form.querySelectorAll('.field input, .field select').forEach((i) => { if (!checkField(i)) ok = false; });
    form.querySelectorAll('.chips').forEach((fs) => {
      const has = !!fs.querySelector('input:checked');
      fs.classList.toggle('err', !has);
      if (!has) ok = false;
    });
    if (!ok) {
      const firstErr = form.querySelector('.err');
      gsap.fromTo(firstErr, { x: -6 }, { x: 0, duration: D(0.5), ease: 'elastic.out(1, 0.3)' });
      const f = firstErr.querySelector('input, select');
      f && f.focus({ preventScroll: true });
    }
    return ok;
  }
  flow.querySelectorAll('.field input, .field select').forEach((i) => {
    i.addEventListener('blur', () => i.value && checkField(i));
    i.addEventListener('input', () => i.closest('.field').classList.contains('err') && checkField(i));
    i.addEventListener('change', () => i.closest('.field').classList.contains('err') && checkField(i));
  });
  flow.querySelectorAll('.chips input').forEach((i) => i.addEventListener('change', () => i.closest('.chips').classList.remove('err')));

  const pending = (btn, fn) => {
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(() => { btn.classList.remove('loading'); btn.disabled = false; fn(); }, reduce ? 0 : 750);
  };
  const values = (form) => Object.fromEntries(new FormData(form).entries());
  const fill = (view, d) => {
    view.querySelectorAll('[data-first-name]').forEach((n) => (n.textContent = (d.name || '').trim().split(/\s+/)[0] || 'there'));
    view.querySelectorAll('[data-email]').forEach((n) => (n.textContent = d.email || ''));
  };

  // webinar
  flow.querySelector('[data-form="webinar"]').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkForm(e.target)) return;
    Object.assign(data.webinar, values(e.target));
    pending(e.target.querySelector('.fsubmit'), () => { fill(views.webinar, data.webinar); show('done'); });
  });

  // call · qualify
  flow.querySelector('[data-form="call"]').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkForm(e.target)) return;
    Object.assign(data.call, values(e.target));
    pending(e.target.querySelector('.fsubmit'), () => show('slot'));
  });

  // call · contact + slot
  const contactForm = flow.querySelector('[data-form="contact"]');
  const confirmBtn = contactForm.querySelector('.fsubmit');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!data.call.slot || !checkForm(e.target)) return;
    Object.assign(data.call, values(e.target));
    pending(confirmBtn, () => {
      const v = views.call;
      fill(v, data.call);
      v.querySelector('[data-slot-date]').textContent = fmtDay.format(data.call.slot);
      v.querySelector('[data-slot-time]').textContent = fmtTime.format(data.call.slot);
      ['units', 'target', 'city', 'budget'].forEach((k) => (v.querySelector(`[data-sum="${k}"]`).textContent = data.call[k] || '—'));
      show('done');
    });
  });

  // checklist
  flow.querySelector('[data-form="checklist"]').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!checkForm(e.target)) return;
    const d = values(e.target);
    pending(e.target.querySelector('.fsubmit'), () => { fill(views.call, d); show('checklist-done'); });
  });

  // ---------- Slot picker: next 10 weekdays, a few times each ----------
  const daysEl = document.getElementById('days');
  const timesEl = document.getElementById('times');
  const SLOTS_UTC = [8, 9.5, 12, 14.5, 16];
  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    let made = 0;
    while (made < 10) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const day = new Date(d);
      const full = (day.getDate() * 7) % 5 === 0; // a couple of fully booked days, for realism
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'day';
      b.innerHTML = `<small>${dayFmt.format(day)}</small><b>${day.getDate()}</b>`;
      b.disabled = full;
      b.addEventListener('click', () => pickDay(day, b));
      daysEl.appendChild(b);
      made++;
    }
  })();
  function pickDay(day, btn) {
    daysEl.querySelectorAll('.day').forEach((d) => d.classList.toggle('sel', d === btn));
    data.call.slot = null;
    confirmBtn.disabled = true;
    timesEl.innerHTML = '';
    SLOTS_UTC.forEach((h, i) => {
      if ((day.getDate() + i) % 4 === 0) return; // some slots already taken
      const t = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(h), (h % 1) * 60));
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'time';
      b.textContent = fmtTime.format(t);
      b.addEventListener('click', () => {
        timesEl.querySelectorAll('.time').forEach((x) => x.classList.toggle('sel', x === b));
        data.call.slot = t;
        confirmBtn.disabled = false;
      });
      timesEl.appendChild(b);
    });
    gsap.fromTo(timesEl.children, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.4), stagger: D(0.04), ease: 'power2.out' });
  }

  // ---------- Add to calendar ----------
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function event() {
    if (current === 'webinar') {
      return { title: 'Flex Academy · First Step into short term Rentals (free webinar)', start: webinar.start, end: webinar.end,
        details: 'Live webinar with Raouf & Michael. The joining link is in your confirmation email.' };
    }
    const s = data.call.slot || new Date();
    return { title: 'Flex Academy · Strategy call', start: s, end: new Date(+s + 30 * 6e4),
      details: 'Free strategy call with the Flex Academy team. The video link is in your confirmation email.' };
  }
  flow.querySelectorAll('[data-cal="google"]').forEach((a) => a.addEventListener('click', () => {
    const ev = event();
    a.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent(ev.title)}&dates=${stamp(ev.start)}/${stamp(ev.end)}&details=${encodeURIComponent(ev.details)}`;
  }));
  flow.querySelectorAll('[data-cal="ics"]').forEach((b) => b.addEventListener('click', () => {
    const ev = event();
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Flex Academy//Prototype//EN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@flexacademy.prototype`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(ev.start)}`, `DTEND:${stamp(ev.end)}`,
      `SUMMARY:${ev.title}`, `DESCRIPTION:${ev.details}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    Object.assign(document.createElement('a'), { href: url, download: 'flex-academy.ics' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }));

  // ---------- Wiring ----------
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-flow-open]');
    if (opener) { e.preventDefault(); open(opener.dataset.flowOpen, opener.dataset.flowStep || null, opener); return; }
    if (!current) return;
    if (e.target.closest('[data-close]')) { close(); return; }
    const go = e.target.closest('[data-goto]');
    if (go) { show(go.dataset.goto); return; }
    const sw = e.target.closest('[data-switch]');
    if (sw) {
      const name = sw.dataset.switch;
      current = name;
      Object.entries(views).forEach(([k, v]) => v.classList.toggle('on', k === name));
      history.replaceState(null, '', '#book');
      crop(views[name]);
      show(views[name].querySelector('.fstep').dataset.step, true);
      gsap.fromTo(views[name].querySelectorAll('.info-body > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.8), ease: 'expo.out', stagger: D(0.05) });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!current) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...views[current].querySelectorAll('.fstep.is-active button:not([disabled]), .fstep.is-active input, .fstep.is-active select, .fstep.is-active a[href]')]
        .concat(flow.querySelector('.flow-close'));
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener('resize', () => current && crop(views[current]));

  // deep links: #register / #book
  if (location.hash === '#register') open('webinar');
  if (location.hash === '#book') open('call');
})();
