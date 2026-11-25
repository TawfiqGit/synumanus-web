/**
 * Synumanus — illustration du hero (accueil) : rubans fluides sur dégradé maillé.
 * Des rubans translucides, faits de fines lignes, ondulent et se torsadent comme un flux
 * de données ; ils s'écartent autour du pointeur (souris ou doigt) comme de l'eau et
 * une onde les traverse au clic / tap. Le halo bleu du fond suit le pointeur.
 *
 * Accessibilité : canvas décoratif (aria-hidden). Deux modes conformes à WCAG 2.2.2 :
 *  - par défaut, animation continue + bouton « Mettre en pause » ;
 *  - data-flow-autostop="5000" (accueil, sans bouton) : le mouvement automatique ralentit
 *    puis se fige au bout de 5 s ; il ne reprend que sur interaction (survol, toucher),
 *    puis se refige 5 s après la dernière interaction.
 * « Réduire les animations » : image fixe, pas d'interaction animée.
 * Boucle arrêtée hors écran, onglet masqué ou en pause.
 */
(() => {
  const root = document.querySelector('[data-hero-flow]');
  const canvas = root && root.querySelector('canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = root.querySelector('[data-flow-toggle]');
  const toggleLabel = toggle && toggle.querySelector('[data-flow-toggle-label]');

  // Chaque ruban : trajectoire diagonale (bas-gauche → haut-droite), ondulation, largeur,
  // torsion, vitesse, couleurs des bords (clair → foncé) et nombre de fils.
  const RIBBONS = [
    { y0: 0.80, y1: 0.22, amp: 0.085, freq: 1.05, width: 0.22, twist: 2.1, speed: 0.30, phase: 0.0, from: [186, 230, 253], to: [2, 132, 199], alpha: 0.5, threads: 30 },
    { y0: 0.66, y1: 0.36, amp: 0.07, freq: 1.55, width: 0.15, twist: 2.9, speed: 0.42, phase: 2.1, from: [125, 211, 252], to: [3, 105, 161], alpha: 0.45, threads: 24 },
    { y0: 0.95, y1: 0.12, amp: 0.06, freq: 0.75, width: 0.28, twist: 1.5, speed: 0.22, phase: 4.2, from: [224, 242, 254], to: [56, 189, 248], alpha: 0.55, threads: 22 },
  ];
  // Variante par page (data-flow-seed) : même famille visuelle, tracés différents.
  const seed = Number(root.dataset.flowSeed || 0);
  if (seed) {
    RIBBONS.forEach((r, i) => {
      r.phase += seed * 1.37 + i;
      r.freq *= 1 + ((seed * (i + 1)) % 5) * 0.06;
      r.twist += ((seed + i) % 3) * 0.4;
      const shift = (((seed * 7 + i * 3) % 9) - 4) * 0.012;
      r.y0 = Math.min(0.95, Math.max(0.55, r.y0 + shift));
      r.y1 = Math.min(0.45, Math.max(0.1, r.y1 - shift));
    });
  }
  const STEPS = 72;
  const INTRO_MS = 1800;

  let width = 0;
  let height = 0;
  let unit = 1;
  let time = 0;          // temps de l'animation (s), figé en pause
  let lastNow = 0;
  let introStart = 0;
  let raf = 0;
  let paused = false;
  // Arrêt automatique (WCAG 2.2.2 sans bouton) : durée maximale du mouvement non sollicité.
  const AUTOSTOP_MS = Number(root.dataset.flowAutostop) || 0;
  const SETTLE_MS = 1200;   // ralentissement progressif avant l'arrêt
  let lastActivity = performance.now();
  let idle = false;
  let onScreen = true;
  let pulses = [];
  let introStarted = false;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, amount: 0, target: 0 };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    unit = Math.min(width, height) / 600;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const easeOut = (k) => 1 - (1 - k) ** 3;

  /** drawMesh(): void — fond en dégradé maillé : trois halos doux, l'un suit le pointeur. */
  const drawMesh = () => {
    const r = Math.max(width, height);
    const blobs = [
      [width * (0.72 + 0.04 * Math.sin(time * 0.21)), height * (0.28 + 0.03 * Math.cos(time * 0.17)), r * 0.55, 'rgba(125, 211, 252, 0.42)'],
      [width * (0.28 + 0.03 * Math.cos(time * 0.13)), height * (0.78 + 0.03 * Math.sin(time * 0.19)), r * 0.5, 'rgba(56, 189, 248, 0.16)'],
      [pointer.sx || width * 0.55, pointer.sy || height * 0.5, r * 0.32, `rgba(186, 230, 253, ${0.25 + 0.35 * pointer.amount})`],
    ];
    for (const [x, y, radius, color] of blobs) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  };

  /** displace(x, y, now): [dx, dy] — écart autour du pointeur + ondes de clic. */
  const displace = (x, y, now) => {
    let dx = 0;
    let dy = 0;
    if (pointer.amount > 0.001) {
      const sigma = 80 * unit;
      const ox = x - pointer.sx;
      const oy = y - pointer.sy;
      const g = Math.exp(-(ox * ox + oy * oy) / (2 * sigma * sigma)) * pointer.amount;
      // Effet de lentille continu (pas de coupure) : les fils s'écartent en douceur.
      dy += oy * g * 1.25;
      dx += ox * g * 0.35;
    }
    for (const p of pulses) {
      const ox = x - p.x;
      const oy = y - p.y;
      const d = Math.hypot(ox, oy) || 1;
      const radius = (now - p.born) * 0.55;
      const band = Math.abs(d - radius);
      if (band < 46 * unit) {
        const k = (1 - band / (46 * unit)) * Math.max(0, 1 - radius / (Math.max(width, height) * 1.1)) * 22 * unit;
        dx += (ox / d) * k;
        dy += (oy / d) * k;
      }
    }
    return [dx, dy];
  };

  /** draw(now): void — dessine le fond puis les rubans (fil par fil). */
  const draw = (now) => {
    ctx.clearRect(0, 0, width, height);
    drawMesh();
    const progress = easeOut(Math.min(1, (now - introStart) / INTRO_MS));
    const lastStep = Math.max(2, Math.round(STEPS * progress));
    const density = width < 520 ? 0.7 : 1;

    for (const ribbon of RIBBONS) {
      const threads = Math.max(10, Math.round(ribbon.threads * density));
      for (let j = 0; j < threads; j += 1) {
        const k = j / (threads - 1);
        const edge = j === 0 || j === threads - 1;
        const [r, g, b] = mix(ribbon.from, ribbon.to, k);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${edge ? Math.min(1, ribbon.alpha + 0.3) : ribbon.alpha})`;
        ctx.lineWidth = edge ? 1.3 : 0.9;
        ctx.beginPath();
        for (let i = 0; i <= lastStep; i += 1) {
          const s = i / STEPS;
          const x = -0.1 * width + s * 1.2 * width;
          const wave = Math.sin(Math.PI * 2 * ribbon.freq * s + time * ribbon.speed * 2 + ribbon.phase)
            + 0.45 * Math.sin(Math.PI * 2 * ribbon.freq * 2.3 * s - time * ribbon.speed * 1.4 + ribbon.phase * 1.7);
          const center = height * (ribbon.y0 + (ribbon.y1 - ribbon.y0) * s) + height * ribbon.amp * wave;
          const spread = height * ribbon.width * (0.35 + 0.65 * Math.abs(Math.sin(s * Math.PI)))
            * Math.cos(s * Math.PI * ribbon.twist + time * ribbon.speed + ribbon.phase);
          const offset = (k - 0.5) * spread;
          const px = x + offset * 0.22;
          const py = center + offset;
          const [dx, dy] = displace(px, py, now);
          if (i === 0) ctx.moveTo(px + dx, py + dy); else ctx.lineTo(px + dx, py + dy);
        }
        ctx.stroke();
      }
    }
  };

  const frame = (now) => {
    raf = 0;
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    // Mode arrêt automatique : la vitesse décroît pendant SETTLE_MS puis l'animation se fige.
    let speed = 1;
    if (AUTOSTOP_MS) {
      const remaining = AUTOSTOP_MS - (now - lastActivity);
      speed = Math.max(0, Math.min(1, remaining / SETTLE_MS));
      if (speed === 0 && pointer.amount < 0.01 && !pulses.length) idle = true;
    }
    time += dt * speed;
    // Le pointeur est suivi avec un léger retard (effet fluide).
    pointer.sx += (pointer.x - pointer.sx) * 0.12;
    pointer.sy += (pointer.y - pointer.sy) * 0.12;
    pointer.amount += (pointer.target - pointer.amount) * 0.08;
    pulses = pulses.filter((p) => (now - p.born) * 0.55 < Math.max(width, height) * 1.1);
    draw(now);
    schedule();
  };

  const canRun = () => !paused && !idle && onScreen && !document.hidden && !reduce.matches;
  const schedule = () => {
    if (!raf && canRun()) {
      raf = requestAnimationFrame((now) => { if (!lastNow) lastNow = now; frame(now); });
    }
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; lastNow = 0; };

  /** renderStill(): void — image fixe (réduire les animations, pause). */
  const renderStill = () => {
    if (reduce.matches) { time = 6; introStart = -INTRO_MS; pointer.amount = 0; pointer.target = 0; pulses = []; }
    draw(performance.now());
  };

  const local = (event) => {
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  /** wake(): void — une interaction relance l'animation (mode arrêt automatique). */
  const wake = () => {
    lastActivity = performance.now();
    if (idle) { idle = false; schedule(); }
  };
  root.addEventListener('pointermove', (event) => {
    if (AUTOSTOP_MS && !reduce.matches && !paused) wake();
    if (!canRun()) return;
    const p = local(event);
    if (pointer.target === 0 && pointer.amount < 0.05) { pointer.sx = p.x; pointer.sy = p.y; }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.target = 1;
  });
  const release = () => { pointer.target = 0; };
  root.addEventListener('pointerleave', release);
  root.addEventListener('pointercancel', release);
  root.addEventListener('pointerup', (event) => { if (event.pointerType !== 'mouse') release(); });
  root.addEventListener('pointerdown', (event) => {
    if (AUTOSTOP_MS && !reduce.matches && !paused) wake();
    if (!canRun() || event.target.closest('button')) return;
    const p = local(event);
    pulses.push({ x: p.x, y: p.y, born: performance.now() });
    if (pointer.amount < 0.05) { pointer.sx = p.x; pointer.sy = p.y; }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.target = 1;
  });

  const setPaused = (value) => {
    paused = value;
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused));
      if (toggleLabel) toggleLabel.textContent = paused ? 'Reprendre l’animation' : 'Mettre en pause';
      toggle.classList.toggle('is-paused', paused);
    }
    if (paused) { stop(); renderStill(); } else schedule();
  };
  if (toggle) toggle.addEventListener('click', () => setPaused(!paused));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      // L'arrivée des rubans démarre au premier affichage (mobile : sous la ligne de flottaison).
      if (onScreen && !introStarted) { introStarted = true; introStart = performance.now(); lastActivity = introStart; }
      if (onScreen) schedule(); else stop();
    }).observe(root);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  new ResizeObserver(() => { resize(); if (!raf) renderStill(); }).observe(root);

  reduce.addEventListener('change', () => {
    if (reduce.matches) { stop(); renderStill(); if (toggle) toggle.hidden = true; }
    else { if (toggle) toggle.hidden = false; schedule(); }
  });

  resize();
  root.classList.add('is-ready');
  if (reduce.matches) {
    renderStill();
  } else {
    introStart = performance.now();
    if (!('IntersectionObserver' in window)) introStarted = true;
    if (toggle) toggle.hidden = false;
    schedule();
  }
})();
