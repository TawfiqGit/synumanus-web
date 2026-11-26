// Usage : node tests/parcours-menus.cjs https://preprod.synumanus.fr
// Law — parcours réel : on visite CHAQUE page du menu en cliquant dans le menu,
// et sur chaque page d'arrivée on ouvre les 3 menus pour vérifier que toutes les options s'affichent.
const { chromium } = require('playwright');
const B = process.argv[2];
const MENUS = {
  solutions: ['/applications-mobiles/','/applications-web-metier/','/automatisation-ia/','/services/cadrage-prototypage/','/services/developpement-application-mobile/','/services/refonte-application-mobile/','/services/maintenance-evolution/','/services/site-vitrine/','/services/referencement-seo/','/services/e-commerce/','/services/logiciel-saas/','/services/geo-referencement-ia/','/services/agent-ia/','/services/conseil-transformation/'],
  media: ['/actus/','/videos/'],
  resource: ['/ressources/generateur-cahier-des-charges/','/ressources/radars-tech/'],
};
const SEL = {
  ordinateur: { solutions: ['[data-service-hub-trigger]', '#solutions-menu'], media: ['[data-media-hub-trigger]', '#media-menu'], resource: ['[data-resource-hub-trigger]', '#resources-menu'] },
  mobile: { solutions: ['[data-mobile-service-hub-trigger]', '#mobile-solutions-menu'], media: ['[data-mobile-media-hub-trigger]', '#mobile-media-menu'], resource: ['[data-mobile-resource-hub-trigger]', '#mobile-resources-menu'] },
};
const visibleLinks = (p, box) => p.evaluate((box) => [...document.querySelectorAll(box + ' a')].filter(a => {
  const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden' && r.left >= 0 && r.right <= innerWidth;
}).map(a => new URL(a.href).pathname), box);
(async () => {
  const b = await chromium.launch(); let ko = 0, checks = 0;
  const targets = [...MENUS.solutions.map(h => ['solutions', h]), ...MENUS.media.map(h => ['media', h]), ...MENUS.resource.map(h => ['resource', h]), ['agence', '/a-propos/agence/'], ['accueil', '/']];
  for (const [mode, vp] of [['ordinateur', { width: 1280, height: 800 }], ['ordinateur', { width: 1024, height: 768 }], ['mobile', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
    const openMobile = async () => { if (mode === 'mobile' && (await p.getAttribute('.menu-toggle', 'aria-expanded')) !== 'true') await p.click('.menu-toggle'); };
    for (const [group, target] of targets) {
      const from = new URL(p.url()).pathname;
      // 1. Aller à la page cible en cliquant dans le menu.
      if (group === 'accueil') await p.click('.brand');
      else if (group === 'agence') { await openMobile(); await p.click(mode === 'mobile' ? '.nav-mobile a[href="/a-propos/agence/"]' : '.nav-desktop a[href="/a-propos/agence/"]'); }
      else { await openMobile(); const [trig, box] = SEL[mode][group]; await p.click(trig); await p.click(`${box} a[href="${target}"]`); }
      await p.waitForLoadState('domcontentloaded');
      const arrived = new URL(p.url()).pathname;
      // 2. Sur la page d'arrivée : ouvrir chaque menu et compter les options visibles.
      const res = {};
      for (const g of ['solutions', 'media', 'resource']) {
        await openMobile(); const [trig, box] = SEL[mode][g];
        await p.click(trig); await p.waitForTimeout(180);
        const got = await visibleLinks(p, box);
        res[g] = MENUS[g].filter(h => !got.includes(h));
        await p.click(trig); // referme
        checks++;
      }
      if (mode === 'mobile') await p.click('.menu-toggle');
      const top = await p.evaluate((m) => [...document.querySelectorAll(m === 'mobile' ? '.nav-mobile > .mobile-service-hub > .mobile-trigger, .nav-mobile > .mobile-link' : '.nav-desktop .nav-list > li > .nav-link')].map(e => e.textContent.trim()).join(' · '), mode);
      const ok = arrived === target && !res.solutions.length && !res.media.length && !res.resource.length && top === 'Solutions · Média · Ressources · Agence';
      if (!ok) ko++;
      console.log(`${ok ? 'OK' : 'KO'} ${mode} ${vp.width}px  ${from.padEnd(44)} → ${arrived.padEnd(44)} Solutions ${14 - res.solutions.length}/14 · Média ${2 - res.media.length}/2 · Ressources ${2 - res.resource.length}/2${top !== 'Solutions · Média · Ressources · Agence' ? ' · en-tête : ' + top : ''}`);
    }
  }
  await b.close();
  console.log(ko ? `\n${ko} échec(s)` : `\nTout est OK — ${checks} ouvertures de menu vérifiées`); process.exit(ko ? 1 : 0);
})();
