/**
 * Illustrations des offres : animation jouée une fois à l'arrivée à l'écran,
 * rejouée au survol. Durée < 5 s (WCAG 2.2.2) ; rien si « réduire les animations »
 * (classe motion-ok absente) : le dessin reste fixe et complet.
 */
(() => {
  if (!document.documentElement.classList.contains('motion-ok') || !('IntersectionObserver' in window)) return;
  const figures = document.querySelectorAll('.illus');
  const play = (figure) => {
    figure.classList.remove('is-playing');
    void figure.getBoundingClientRect(); // relance propre des animations CSS
    figure.classList.add('is-playing');
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      play(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  figures.forEach((figure) => {
    figure.classList.add('is-armed');
    observer.observe(figure);
    let last = 0;
    figure.addEventListener('pointerenter', () => {
      const now = performance.now();
      if (figure.classList.contains('is-playing') && now - last > 4000) { last = now; play(figure); }
    });
  });
})();
