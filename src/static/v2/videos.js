/**
 * Page Vidéos : le lecteur YouTube (youtube-nocookie.com) n'est chargé qu'au clic.
 * Avant le clic, aucune requête n'est envoyée à YouTube (pas d'image ni de cookie).
 */
(() => {
  document.querySelectorAll('[data-video]').forEach((frame) => {
    const button = frame.querySelector('.video-play');
    const id = frame.dataset.videoId || '';
    if (!button || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = frame.dataset.videoTitle || 'Vidéo';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
      iframe.focus();
    });
  });
})();
