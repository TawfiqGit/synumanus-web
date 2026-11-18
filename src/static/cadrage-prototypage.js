(() => {
  document.querySelectorAll('.cadrage-news').forEach(section => {
    const track = section.querySelector('.cadrage-news-track');
    if (!track) return;
    const controls = [...section.querySelectorAll('[data-news-direction]')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    let visible = true;
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const paused = () => !visible || document.hidden || reducedMotion.matches
      || section.matches(':hover')
      || (section.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
    const stop = () => { clearTimeout(timer); timer = undefined; };
    const move = direction => {
      const cards = track.children;
      const distance = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
      const max = maxScroll();
      const atEnd = track.scrollLeft >= max - 1;
      const atStart = track.scrollLeft <= 1;
      const left = direction > 0 && atEnd ? 0 : direction < 0 && atStart ? max
        : Math.max(0, Math.min(max, track.scrollLeft + direction * distance));
      track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    };
    const start = () => {
      stop();
      if (paused() || maxScroll() <= 1) return;
      timer = setTimeout(() => { if (!paused()) move(1); start(); }, 2000);
    };
    const update = () => {
      controls.forEach(button => { button.disabled = maxScroll() <= 1; });
      start();
    };
    controls.forEach(button => button.addEventListener('click', () => {
      move(Number(button.dataset.newsDirection));
      start();
    }));
    section.addEventListener('mouseenter', () => {
      stop();
      track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
    });
    section.addEventListener('mouseleave', start);
    section.addEventListener('focusin', start);
    section.addEventListener('focusout', () => { queueMicrotask(start); });
    track.addEventListener('touchstart', stop, { passive: true });
    track.addEventListener('touchend', start, { passive: true });
    track.addEventListener('touchcancel', start, { passive: true });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    window.addEventListener('resize', update);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        start();
      }).observe(section);
    }
    update();
  });
})();
