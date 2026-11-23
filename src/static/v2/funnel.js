/**
 * Tunnels de campagne : transmet les paramètres UTM de la page d'arrivée aux liens
 * [data-campaign-link] (vers le formulaire), pour retrouver l'origine de la demande.
 * Seuls utm_source, utm_medium, utm_campaign et utm_content sont repris, nettoyés.
 */
(() => {
  // La campagne est mémorisée dès l'arrivée : tous les chemins vers le formulaire (bandeau,
  // menu, boutons) la conservent. project.js la relit (liste fermée de campagnes).
  const campaign = document.querySelector('[data-campaign]')?.dataset.campaign || '';
  if (/^[a-z0-9-]{3,60}$/.test(campaign)) {
    try { sessionStorage.setItem('synumanusCampaign', campaign); } catch (_) { /* stockage désactivé */ }
  }
  const params = new URLSearchParams(window.location.search);
  const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
    .map((key) => [key, (params.get(key) || '').replace(/[^a-z0-9 _.\-]/gi, '').slice(0, 40)])
    .filter(([, value]) => value);
  if (!utm.length) return;
  document.querySelectorAll('a[data-campaign-link]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    if (url.origin !== window.location.origin) return;
    utm.forEach(([key, value]) => url.searchParams.set(key, value));
    link.setAttribute('href', url.pathname + url.search + url.hash);
  });
})();
