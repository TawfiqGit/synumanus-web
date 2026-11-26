// Recette du menu « Solutions » (Law, 26/11/2026).
// Usage : node tests/menu-solutions.cjs https://preprod.synumanus.fr
// Vérifie, sur chaque page (sitemap + pages hors sitemap), sur ordinateur et sur mobile :
//   - les 4 colonnes et les 14 options du menu sont visibles ;
//   - seule la page en cours est signalée (aria-current) ;
// puis que le menu ouvert reste entièrement dans l'écran de 960 à 1920 px de large.
const { chromium } = require('playwright');
const B = process.argv[2];
const EXPECTED = ['/applications-mobiles/','/applications-web-metier/','/automatisation-ia/',
 '/services/cadrage-prototypage/','/services/developpement-application-mobile/','/services/refonte-application-mobile/','/services/maintenance-evolution/',
 '/services/site-vitrine/','/services/referencement-seo/','/services/e-commerce/','/services/logiciel-saas/',
 '/services/geo-referencement-ia/','/services/agent-ia/','/services/conseil-transformation/'];
(async () => {
  const b = await chromium.launch();
  const sm = await (await fetch(B + '/sitemap.xml')).text();
  const urls = [...sm.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(m => m[1] || '/');
  urls.push('/404.html', '/newsletter/merci/', '/campagne/diagnostic-automatisation/', '/campagne/diagnostic-automatisation/merci/', '/rendez-vous-confirme/');
  let ko = 0;
  for (const [mode, vp] of [['ordinateur', { width: 1440, height: 900 }], ['mobile', { width: 375, height: 800 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    for (const u of urls) {
      await p.goto(B + u, { waitUntil: 'domcontentloaded' });
      let menu;
      if (mode === 'ordinateur') { await p.click('.nav-desktop .nav-trigger'); menu = '#solutions-menu'; }
      else { await p.click('.menu-toggle'); await p.click('.mobile-trigger'); menu = '.mobile-menu'; }
      await p.waitForTimeout(250);
      const r = await p.evaluate((menu) => {
        const links = [...document.querySelectorAll(menu + ' a')];
        const vis = (a) => { const s = a.getBoundingClientRect(); const cs = getComputedStyle(a); return s.width > 0 && s.height > 0 && cs.visibility !== 'hidden'; };
        return { hrefs: links.filter(vis).map(a => new URL(a.href).pathname), current: links.filter(a => a.getAttribute('aria-current') === 'page').map(a => new URL(a.href).pathname),
                 labels: [...document.querySelectorAll(menu + ' .menu-label')].map(l => l.textContent) };
      }, menu);
      const missing = EXPECTED.filter(h => !r.hrefs.includes(h));
      const badCurrent = EXPECTED.includes(u) ? !(r.current.length === 1 && r.current[0] === u) : r.current.length !== 0;
      const ok = !missing.length && r.hrefs.length === 14 && !badCurrent && r.labels.length === 4;
      if (!ok) ko++;
      console.log(`${ok ? 'OK' : 'KO'} ${mode.padEnd(10)} ${u.padEnd(46)} liens visibles=${r.hrefs.length} colonnes=${r.labels.length} page en cours=${r.current.join(',') || '—'}${missing.length ? ' MANQUE ' + missing.join(',') : ''}`);
    }
  }
  for (const w of [960, 1024, 1180, 1280, 1366, 1440, 1920]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    await p.goto(B + '/services/agent-ia/', { waitUntil: 'domcontentloaded' });
    await p.click('.nav-desktop .nav-trigger'); await p.waitForTimeout(250);
    const r = await p.evaluate(() => { const m = document.querySelector('#solutions-menu').getBoundingClientRect();
      const cut = [...document.querySelectorAll('#solutions-menu a')].filter(a => { const s = a.getBoundingClientRect(); return s.left < 0 || s.right > innerWidth || s.bottom > innerHeight; }).length;
      return { left: Math.round(m.left), right: Math.round(m.right), cut }; });
    const ok = r.left >= 0 && r.right <= w && r.cut === 0;
    if (!ok) ko++;
    console.log(`${ok ? 'OK' : 'KO'} largeur ${w}px : menu de ${r.left} à ${r.right} px, liens coupés=${r.cut}`);
  }
  await b.close();
  console.log(ko ? `\n${ko} échec(s)` : '\nTout est OK'); process.exit(ko ? 1 : 0);
})();
