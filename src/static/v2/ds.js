/**
 * Synumanus — compléments d'accessibilité et de comportement de la refonte v2.
 * script.js (existant) gère déjà : sous-menus, menu mobile, newsletter, WhatsApp, FAQ, apparitions.
 */
(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  /** closeMobileNav(returnFocus): void — ferme le panneau mobile et rend le focus au bouton. */
  const closeMobileNav = (returnFocus) => {
    if (!menuButton || !mobileNav || !mobileNav.classList.contains('open')) return;
    menuButton.click();
    if (returnFocus) menuButton.focus();
  };

  if (menuButton && mobileNav) {
    const syncLabel = () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      // Le panneau fermé ne doit pas être atteint au clavier ni lu par les lecteurs d'écran.
      if (open) mobileNav.removeAttribute('inert'); else mobileNav.setAttribute('inert', '');
      // Le panneau démarre sous le header, quelle que soit la position du bandeau d'annonce.
      if (open) mobileNav.style.top = `${Math.round(menuButton.closest('[data-header]').getBoundingClientRect().bottom)}px`;
    };
    syncLabel();
    new MutationObserver(syncLabel).observe(menuButton, { attributes: true, attributeFilter: ['aria-expanded'] });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMobileNav(true); });
    window.matchMedia('(min-width: 960px)').addEventListener('change', (event) => { if (event.matches) closeMobileNav(false); });
  }

  // Sous-menu desktop : Échap rend le focus au déclencheur (B3 §0.1).
  document.querySelectorAll('.nav-hub').forEach((hub) => {
    const trigger = hub.querySelector('[aria-expanded]');
    hub.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && hub.classList.contains('open')) trigger?.focus();
    });
    hub.addEventListener('focusout', (event) => {
      if (hub.classList.contains('open') && !hub.contains(event.relatedTarget)) {
        hub.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Bouton WhatsApp masqué pendant la saisie du formulaire, réaffiché à l'étape créneau
  // ou en cas d'erreur (décision TawfiqDev du 17/11/2026).
  const whatsapp = document.querySelector('.whatsapp-float');
  const form = document.querySelector('[data-project-form]');
  if (whatsapp && form) {
    const booking = document.querySelector('[data-booking-stage]');
    const error = document.querySelector('[data-form-error]');
    const sync = () => {
      const bookingVisible = booking && !booking.hidden;
      // Erreur d'envoi serveur : elle survient à la soumission, donc sur l'étape « Vos coordonnées ».
      const onSubmitStep = !!form.querySelector('[data-step="4"].is-active');
      const errorVisible = onSubmitStep && error && !error.hidden && error.textContent.trim() !== '';
      whatsapp.hidden = !(bookingVisible || errorVisible);
    };
    sync();
    const observer = new MutationObserver(sync);
    [booking, error, form].filter(Boolean).forEach((el) => observer.observe(el, { attributes: true, childList: true, characterData: true, subtree: el !== form }));
    form.querySelectorAll('[data-step]').forEach((step) => observer.observe(step, { attributes: true, attributeFilter: ['class'] }));
  }
})();

