/**
 * Accueil v0.8 : méthode au défilement, guide de choix (sans IA), calculateur de temps gagné.
 * Tout fonctionne côté navigateur : aucune donnée n'est envoyée.
 */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Guide de choix ---------- */
  const RESULTS = {
    cadrage: { title: 'Cadrage & prototypage', why: 'Vous voulez valider l’idée avant d’investir : on priorise la première version et on teste un prototype cliquable avec vos utilisateurs.', href: '/services/cadrage-prototypage/' },
    mobile: { title: 'Application mobile', why: 'Vos utilisateurs sont en déplacement ou chez vos clients : une application iOS et Android, qui fonctionne même sans réseau, est le bon outil.', href: '/applications-mobiles/', demo: 'cleanpilot', demoLabel: 'Essayer la démo CleanPilot' },
    web: { title: 'Application web & métier', why: 'Votre équipe travaille au bureau sur des données partagées : un outil web unique, connecté à vos logiciels, remplacera les tableurs.', href: '/applications-web-metier/' },
    shop: { title: 'Site web & boutique en ligne', why: 'Vous voulez être trouvé localement et simplifier les commandes : un site mobile-first avec commande en ligne et back-office.', href: '/applications-web-metier/', demo: 'commerce', demoLabel: 'Essayer la démo Commerce Connect' },
    automation: { title: 'Automatisation & IA', why: 'Les tâches répétitives vous coûtent du temps : on automatise d’abord ce qui est simple, et l’IA seulement quand elle apporte un vrai gain.', href: '/automatisation-ia/' },
    refonte: { title: 'Refonte ou maintenance', why: 'Votre outil existe mais freine : un diagnostic dira s’il faut le moderniser, le restructurer ou le reconstruire.', href: '/services/refonte-application-mobile/' },
  };
  const recommend = ({ start, users, priority }) => {
    if (start === 'modernize') return 'refonte';
    if (start === 'repeat') return 'automation';
    if (start === 'shop') return 'shop';
    if (priority === 'test') return 'cadrage';
    if (users === 'office') return 'web';
    return 'mobile';
  };
  const guide = document.querySelector('[data-guide]');
  if (guide) {
    const error = guide.querySelector('[data-guide-error]');
    const result = guide.querySelector('[data-guide-result]');
    guide.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(guide);
      const answers = { start: data.get('start'), users: data.get('users'), priority: data.get('priority') };
      const missing = Object.entries(answers).filter(([, v]) => !v).map(([k]) => k);
      if (missing.length) {
        error.hidden = false;
        error.textContent = 'Répondez aux trois questions pour voir la recommandation.';
        guide.querySelector(`input[name="${missing[0]}"]`)?.focus();
        return;
      }
      error.hidden = true;
      const r = RESULTS[recommend(answers)];
      result.innerHTML = '';
      const label = document.createElement('p'); label.className = 'card-index'; label.textContent = 'Notre recommandation';
      const h = document.createElement('h3'); h.textContent = r.title;
      const p = document.createElement('p'); p.textContent = r.why;
      const actions = document.createElement('div'); actions.className = 'actions';
      const a1 = document.createElement('a'); a1.className = 'btn btn-primary'; a1.href = '/demarrer-un-projet/'; a1.textContent = 'Échanger sur mon projet';
      const a2 = document.createElement('a'); a2.className = 'link-arrow'; a2.href = r.href; a2.textContent = `Découvrir : ${r.title}`;
      actions.append(a1, a2);
      if (r.demo) {
        const a3 = document.createElement('a'); a3.className = 'link-arrow'; a3.href = '#demos'; a3.textContent = r.demoLabel;
        a3.addEventListener('click', () => document.dispatchEvent(new CustomEvent('synumanus:demo', { detail: r.demo })));
        actions.append(a3);
      }
      const human = document.createElement('p'); human.className = 'note'; human.textContent = 'Ce guide oriente, il ne décide pas : un échange de 30 minutes permet de confirmer.';
      result.append(label, h, p, actions, human);
      result.hidden = false;
      result.focus();
    });
  }

  /* ---------- Calculateur de temps gagné ---------- */
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const out = calc.querySelector('[data-calc-out]');
    const RATE = 0.6;
    // Règles (B6 v1.1, AC-07) : nombres entiers, bornes min/max ; une saisie vide, non numérique
    // ou hors bornes est corrigée quand on quitte le champ, avec un message annoncé.
    const LIMITS = { people: [1, 500], minutes: [0, 480], days: [1, 365] };
    const note = calc.querySelector('[data-calc-note]');
    const sanitize = (name) => {
      const [min, max] = LIMITS[name];
      const raw = parseFloat(String(calc[name].value).replace(',', '.'));
      if (!Number.isFinite(raw)) return { value: min, reason: 'min' };
      const v = Math.round(raw);
      if (v < min) return { value: min, reason: 'min' };
      if (v > max) return { value: max, reason: 'max' };
      return { value: v, reason: v !== raw ? 'round' : '' };
    };
    const update = () => {
      const people = sanitize('people').value;
      const minutes = sanitize('minutes').value;
      const days = sanitize('days').value;
      const hours = Math.round((people * minutes * days * RATE) / 60);
      const workDays = Math.round(hours / 7);
      const fmt = new Intl.NumberFormat('fr-FR');
      out.innerHTML = '';
      const strong = document.createElement('strong'); strong.textContent = `${fmt.format(hours)} h`;
      const span = document.createElement('span'); span.textContent = `récupérées par an, soit environ ${fmt.format(workDays)} jours de travail`;
      out.append(strong, span);
    };
    calc.addEventListener('change', (event) => {
      const name = event.target.name;
      if (!LIMITS[name]) return;
      const { value, reason } = sanitize(name);
      const label = { people: 'Personnes concernées', minutes: 'Minutes perdues', days: 'Jours travaillés' }[name];
      if (String(value) !== event.target.value) event.target.value = String(value);
      if (note) {
        note.textContent = reason === 'max' ? `${label} : valeur ramenée à ${value}, le maximum.`
          : reason === 'min' ? `${label} : valeur ramenée à ${value}, le minimum.`
          : reason === 'round' ? `${label} : valeur arrondie à ${value}.` : '';
      }
      update();
    });
    calc.addEventListener('input', update);
    calc.addEventListener('submit', (e) => e.preventDefault());
    update();
  }
})();
