/**
 * Synumanus — illustration interactive du hero (accueil).
 * Sphère de points en trame + anneau : à l'arrivée, les points éparpillés se rangent ;
 * au survol (souris) ou au toucher (doigt), ils s'écartent du pointeur et s'y relient ;
 * un clic ou un tap envoie une onde.
 *
 * Accessibilité : canvas décoratif (aria-hidden). L'intro dure moins de 5 s et ne boucle
 * pas (WCAG 2.2.2) ; ensuite, rien ne bouge sans action de l'utilisateur.
 * « Réduire les animations » : dessin statique, aucune interaction animée.
 * Performance : boucle d'animation arrêtée dès que tout est immobile, hors écran
 * ou onglet masqué.
 */
(() => {
  const root = document.querySelector('[data-hero-field]');
  const canvas = root && root.querySelector('canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const replayButton = root.querySelector('[data-field-replay]');
  // Du plus clair (face éclairée) au plus foncé (ombre) : bleus Synumanus.
  const PALETTE = ['#7dd3fc', '#56c8fb', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985'];
  const LIGHT = (() => { const v = [-0.55, -0.6, 0.58]; const n = Math.hypot(...v); return v.map((x) => x / n); })();

  const INTRO_SCATTER_MS = 250;   // les points restent éparpillés
  const INTRO_ORDER_MS = 1500;    // bascule des étiquettes « éparses » → « rangé »
  const GHOST_START_MS = 2000;    // pointeur de démonstration
  const GHOST_END_MS = 3500;
  const INTRO_END_MS = 4300;      // < 5 s

  let width = 0;
  let height = 0;
  let points = [];
  let ripples = [];
  let raf = 0;
  let introStart = 0;
  let introRunning = false;
  let onScreen = true;
  let ghostRippleDone = false;
  const pointer = { x: 0, y: 0, active: false, ghost: false };
  let timers = [];

  /** build(scatter): void — calcule les positions « rangées » (et éparpille si demandé). */
  const build = (scatter) => {
    const rect = root.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = width * 0.52;
    const cy = height * 0.46;
    const radius = Math.min(width, height) * 0.36;
    const gap = Math.max(11, radius / 13);
    points = [];

    // Sphère : grille hexagonale clippée dans un disque, taille et teinte selon l'ombrage.
    const rowStep = gap * 0.866;
    for (let row = 0, y = -radius; y <= radius; row += 1, y += rowStep) {
      for (let x = -radius + (row % 2) * gap / 2; x <= radius; x += gap) {
        const d2 = (x * x + y * y) / (radius * radius);
        if (d2 > 1) continue;
        const nz = Math.sqrt(1 - d2);
        const lit = Math.max(0, (x / radius) * LIGHT[0] + (y / radius) * LIGHT[1] + nz * LIGHT[2]);
        const shadow = 1 - lit;
        points.push({
          hx: cx + x, hy: cy + y,
          size: 1.1 + 2.4 * shadow,
          color: PALETTE[Math.min(PALETTE.length - 1, Math.floor(shadow * PALETTE.length))],
          delay: Math.sqrt(d2) * 450,
        });
      }
    }
    // Anneau incliné autour de la sphère, avec trois « nœuds » (outils connectés).
    const ringCount = 96;
    const tilt = -0.32;
    for (let i = 0; i < ringCount; i += 1) {
      const a = (i / ringCount) * Math.PI * 2;
      const ex = Math.cos(a) * radius * 1.38;
      const ey = Math.sin(a) * radius * 0.34;
      const node = i % 32 === 8;
      points.push({
        hx: cx + ex * Math.cos(tilt) - ey * Math.sin(tilt),
        hy: cy + ex * Math.sin(tilt) + ey * Math.cos(tilt),
        size: node ? 4.2 : 1.15,
        color: node ? '#18181b' : '#0284c7',
        delay: 500 + (i / ringCount) * 500,
        ring: true,
      });
    }

    points.forEach((p) => {
      if (scatter) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
      } else {
        p.x = p.hx;
        p.y = p.hy;
      }
      p.vx = 0;
      p.vy = 0;
    });
  };

  /** draw(): void — dessine les points, puis les liens et le halo du pointeur. */
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const reach = 120;
    const near = [];
    for (const p of points) {
      let scale = 1;
      if (pointer.active) {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (d < reach) {
          scale = 1 + (1 - d / reach) * 0.9;
          if (d < 90) near.push([d, p]);
        }
      }
      ctx.globalAlpha = p.ring ? 0.85 : 1;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (pointer.active) {
      near.sort((a, b) => a[0] - b[0]);
      ctx.lineWidth = 1;
      for (const [d, p] of near.slice(0, 16)) {
        ctx.strokeStyle = `rgba(3, 105, 161, ${(1 - d / 90) * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(3, 105, 161, .35)';
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const r of ripples) {
      ctx.strokeStyle = `rgba(2, 132, 199, ${Math.max(0, 0.35 - r.radius / 900)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  /** ghostAt(progress): {x,y} — trajet du pointeur de démonstration (courbe de Bézier). */
  const ghostAt = (k) => {
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    const p0 = [width * 0.18, height * 0.7];
    const p1 = [width * 0.4, height * 0.15];
    const p2 = [width * 0.62, height * 0.42];
    const u = 1 - e;
    return {
      x: u * u * p0[0] + 2 * u * e * p1[0] + e * e * p2[0],
      y: u * u * p0[1] + 2 * u * e * p1[1] + e * e * p2[1],
    };
  };

  /** step(now): boolean — avance la simulation ; renvoie true si quelque chose bouge encore. */
  const step = (now) => {
    const elapsed = now - introStart;
    if (introRunning) {
      if (elapsed >= GHOST_START_MS && elapsed <= GHOST_END_MS) {
        const pos = ghostAt((elapsed - GHOST_START_MS) / (GHOST_END_MS - GHOST_START_MS));
        pointer.x = pos.x;
        pointer.y = pos.y;
        pointer.active = true;
        pointer.ghost = true;
      } else if (pointer.ghost && elapsed > GHOST_END_MS) {
        if (!ghostRippleDone) { ripples.push({ x: pointer.x, y: pointer.y, radius: 0, born: now }); ghostRippleDone = true; }
        pointer.active = false;
        pointer.ghost = false;
      }
      if (elapsed > INTRO_END_MS) introRunning = false;
    }

    for (const r of ripples) r.radius = (now - r.born) * 0.5;
    ripples = ripples.filter((r) => r.radius < Math.max(width, height));

    let moving = introRunning || pointer.active || ripples.length > 0;
    for (const p of points) {
      const springOn = !introRunning || elapsed > INTRO_SCATTER_MS + p.delay;
      if (springOn) {
        p.vx += (p.hx - p.x) * 0.045;
        p.vy += (p.hy - p.y) * 0.045;
      }
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 120) {
          const f = (1 - d / 120) ** 2 * 6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      for (const r of ripples) {
        const dx = p.x - r.x;
        const dy = p.y - r.y;
        const d = Math.hypot(dx, dy) || 1;
        const band = Math.abs(d - r.radius);
        if (band < 30) {
          const f = (1 - band / 30) * 1.6;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      p.vx *= 0.8;
      p.vy *= 0.8;
      p.x += p.vx;
      p.y += p.vy;
      if (!moving && (Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || Math.abs(p.hx - p.x) > 0.15 || Math.abs(p.hy - p.y) > 0.15)) moving = true;
    }
    return moving;
  };

  const frame = (now) => {
    raf = 0;
    const moving = step(now);
    draw();
    if (moving && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!raf && onScreen && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
  };

  /** play(): void — (re)lance l'introduction : éparpillé → rangé → démonstration. */
  const play = () => {
    timers.forEach(clearTimeout);
    timers = [];
    build(true);
    ripples = [];
    ghostRippleDone = false;
    introStart = performance.now();
    introRunning = true;
    root.classList.add('phase-chaos');
    timers.push(setTimeout(() => root.classList.remove('phase-chaos'), INTRO_ORDER_MS));
    wake();
  };

  /** renderStatic(): void — état final immobile (réduire les animations, redimensionnement). */
  const renderStatic = () => {
    build(false);
    pointer.active = false;
    ripples = [];
    root.classList.remove('phase-chaos');
    draw();
  };

  const localPoint = (event) => {
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  root.addEventListener('pointermove', (event) => {
    if (reduce.matches) return;
    const pos = localPoint(event);
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.active = true;
    pointer.ghost = false;
    wake();
  });
  const release = () => { if (!pointer.ghost) { pointer.active = false; wake(); } };
  root.addEventListener('pointerleave', release);
  root.addEventListener('pointercancel', release);
  root.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') release(); });
  root.addEventListener('pointerdown', (event) => {
    if (reduce.matches || event.target.closest('button')) return;
    const pos = localPoint(event);
    ripples.push({ x: pos.x, y: pos.y, radius: 0, born: performance.now() });
    pointer.x = pos.x;
    pointer.y = pos.y;
    pointer.active = true;
    wake();
  });

  let introPending = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && introPending) { introPending = false; play(); return; }
      if (onScreen) wake();
    }, { threshold: 0.35 }).observe(root);
  }
  document.addEventListener('visibilitychange', wake);

  let lastWidth = 0;
  new ResizeObserver(() => {
    const w = Math.round(root.getBoundingClientRect().width);
    if (w === lastWidth) return;
    const first = lastWidth === 0;
    lastWidth = w;
    if (first) return;
    introRunning = false;
    renderStatic();
  }).observe(root);

  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      cancelAnimationFrame(raf);
      raf = 0;
      introRunning = false;
      renderStatic();
      if (replayButton) replayButton.hidden = true;
    } else if (replayButton) {
      replayButton.hidden = false;
    }
  });

  lastWidth = Math.round(root.getBoundingClientRect().width);
  root.classList.add('is-ready');
  if (reduce.matches) {
    renderStatic();
  } else {
    // L'introduction démarre quand l'illustration devient visible ; en attendant, état final.
    const rect = root.getBoundingClientRect();
    const visibleNow = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
    if (visibleNow || !('IntersectionObserver' in window)) play();
    else { introPending = true; renderStatic(); }
    if (replayButton) {
      replayButton.hidden = false;
      replayButton.addEventListener('click', play);
    }
  }
})();
