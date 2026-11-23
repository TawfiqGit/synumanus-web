// Recette en pré-production (B6, condition C4) — Ace.
//
// Usage :
//   node tests/recette-preprod.cjs https://preprod.exemple.fr [--calendrier-test=https://…]
//
// Ce que le script vérifie, en lecture seule (aucun formulaire envoyé) :
//   AC-16.1  une adresse inconnue renvoie le code HTTP 404 et la page 404 du site ;
//   AC-18.1  chaque URL du sitemap répond 200, sans erreur JavaScript ni ressource manquante ;
//   R-PREPROD la pré-production n'est pas indexable (sinon Google la référence en doublon du site) ;
//   C1       config.js n'utilise PAS le vrai calendrier systeme.io (sinon : réservation réelle possible) ;
//   AC-11.6  l'étape « Choisir un créneau » charge le calendrier de test, si --calendrier-test est fourni.
//
// Le formulaire n'est jamais envoyé : en pré-production, l'envoi crée un contact systeme.io
// et déclenche les relances. Cet envoi se fait à la main, après accord de TawfiqDev (voir B6 §0).
const { chromium } = require('playwright');

const PROD_CALENDAR = 'https://studio.synumanus.fr/discovery-call-calendar';
const base = (process.argv[2] || '').replace(/\/$/, '');
const testCalendar = (process.argv.find((a) => a.startsWith('--calendrier-test=')) || '').split('=').slice(1).join('=');
if (!/^https?:\/\//.test(base)) {
  console.error('Usage : node tests/recette-preprod.cjs https://preprod.exemple.fr [--calendrier-test=https://…]');
  process.exit(2);
}

const results = [];
const check = (id, ok, info = '') => results.push({ id, ok, info });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // Garde-fou : aucune requête d'envoi de formulaire ne doit partir pendant la recette automatique.
  await context.route('**/api/**', (route) => (route.request().method() === 'GET' ? route.continue() : route.abort()));
  const page = await context.newPage();

  // AC-16.1 — code 404 réel (Apache + .htaccess), impossible à vérifier avec le serveur local.
  for (const path of ['/page-qui-n-existe-pas/', '/page-qui-n-existe-pas.html']) {
    const response = await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    check(`AC-16.1 code HTTP ${path}`, response.status() === 404, `reçu ${response.status()}`);
    check(`AC-16.1 page 404 du site ${path}`, text.includes('Cette page n’existe pas ou a été déplacée'));
  }

  // R-PREPROD — la pré-production ne doit pas être indexée.
  const home = await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const xRobots = (home.headers()['x-robots-tag'] || '').toLowerCase();
  const robotsTxt = await (await context.request.get(base + '/robots.txt')).text();
  const blocked = xRobots.includes('noindex') || /Disallow:\s*\/\s*$/m.test(robotsTxt) || home.status() === 401;
  check('R-PREPROD pré-production non indexable', blocked,
    blocked ? '' : 'ajouter « Header set X-Robots-Tag "noindex, nofollow" » ou une protection par mot de passe');

  // C1 — jamais le vrai calendrier en recette.
  const configText = await (await context.request.get(base + '/config.js')).text();
  const calendar = (configText.match(/systemeIoCalendarUrl:\s*'([^']*)'/) || [])[1];
  check('C1 config.js sans le vrai calendrier', calendar !== undefined && calendar !== PROD_CALENDAR, `systemeIoCalendarUrl = '${calendar}'`);
  if (testCalendar) check('C1 calendrier de test configuré', calendar === testCalendar, `attendu '${testCalendar}'`);

  // AC-18.1 — toutes les URL du sitemap (le sitemap pointe vers la production : on garde le chemin).
  const sitemap = await (await context.request.get(base + '/sitemap.xml')).text();
  const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
  check('AC-18.1 sitemap lu', paths.length > 0, `${paths.length} URL`);
  for (const path of paths) {
    const errors = [];
    const missing = [];
    const onError = (e) => errors.push(e.message);
    const onResponse = (r) => { if (r.status() >= 400 && r.url().startsWith(base)) missing.push(`${r.status()} ${new URL(r.url()).pathname}`); };
    page.on('pageerror', onError);
    page.on('response', onResponse);
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    page.off('pageerror', onError);
    page.off('response', onResponse);
    const ok = response.status() === 200 && !errors.length && !missing.length;
    check(`AC-18.1 ${path}`, ok, ok ? '' : `${response.status()} ${errors.join(' | ')} ${missing.join(', ')}`);
  }

  // AC-11.6 — le calendrier de test se charge (sans envoyer le formulaire : on affiche l'étape directement).
  if (testCalendar && calendar === testCalendar) {
    await page.goto(base + '/demarrer-un-projet/', { waitUntil: 'networkidle' });
    const frameSrc = await page.evaluate(() => {
      document.querySelector('[data-booking-stage]').hidden = false;
      const frame = document.querySelector('[data-systemeio-calendar-frame]');
      frame.src = window.SYNUMANUS_CONFIG.systemeIoCalendarUrl;
      frame.hidden = false;
      return frame.src;
    });
    const loaded = await page.waitForResponse((r) => r.url().startsWith(testCalendar), { timeout: 15000 }).then((r) => r.status()).catch(() => 0);
    check('AC-11.6 calendrier de test chargé', loaded > 0 && loaded < 400, `${frameSrc} → ${loaded || 'aucune réponse'}`);
  }

  await browser.close();
  for (const r of results) console.log(`${r.ok ? 'OK ' : 'KO '} ${r.id}${r.info ? ' — ' + r.info : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} OK`);
  process.exit(failed ? 1 : 0);
})();
