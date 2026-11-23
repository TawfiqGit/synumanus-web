/**
 * Démos interactives de l'accueil (données fictives, rien n'est envoyé) :
 *  - CleanPilot (services à la personne, application mobile) :
 *    planning, application terrain, validation, administration + export CSV ;
 *  - Commerce Connect (commerce, site web) :
 *    vitrine mobile-first, commande, back-office, automatisations, IA optionnelle (simulée).
 * Accessibilité : onglets ARIA, boutons natifs, messages annoncés (aria-live), focus conservé.
 */
(() => {
  const root = document.querySelector('[data-demos]');
  if (!root) return;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  /* ======================= État : CleanPilot ======================= */
  const AGENTS = ['Amina', 'Lucas', 'Sofia'];
  const clean = {
    screen: 'planning',
    current: 1,
    message: '',
    missions: [
      { id: 1, client: 'Mme Bernard', type: 'Ménage', time: '09:00', place: 'Neuilly-sur-Seine', agent: 'Amina', status: 'assigned', tasks: ['Aérer les pièces', 'Changer les draps', 'Arroser les plantes'], done: [false, false, false], report: '', validatedAt: '' },
      { id: 2, client: 'M. Petit', type: 'Aide aux courses', time: '11:30', place: 'Levallois-Perret', agent: '', status: 'todo', tasks: ['Récupérer la liste', 'Faire les courses', 'Ranger les achats'], done: [false, false, false], report: '', validatedAt: '' },
      { id: 3, client: 'Famille Diallo', type: 'Garde d’enfants', time: '16:30', place: 'Courbevoie', agent: 'Sofia', status: 'assigned', tasks: ['Sortie d’école', 'Goûter', 'Devoirs'], done: [false, false, false], report: '', validatedAt: '' },
    ],
  };
  const STATUS = { todo: 'À affecter', assigned: 'Planifiée', reported: 'Compte rendu saisi', done: 'Effectuée' };
  const mission = () => clean.missions.find((m) => m.id === clean.current);

  /* ======================= État : Commerce Connect ======================= */
  const shop = {
    screen: 'vitrine',
    message: '',
    cart: {},
    mode: 'retrait',
    slot: '17:00 – 17:30',
    orders: [{ id: 1041, client: 'Client A.', items: 'Pain de campagne ×2', total: 8.4, mode: 'Retrait', status: 'Prête', at: '08:12' }],
    automations: { confirm: true, reminder: true },
    log: [],
    aiProduct: 3,
    aiDraft: '',
    products: [
      { id: 1, name: 'Pain de campagne', price: 4.2, rating: 4.8, reviews: 32, available: true, desc: 'Levain naturel, cuit chaque matin.' },
      { id: 2, name: 'Croissant pur beurre', price: 1.3, rating: 4.9, reviews: 57, available: true, desc: 'Beurre AOP, feuilletage maison.' },
      { id: 3, name: 'Tarte aux pommes (6 parts)', price: 18, rating: 4.7, reviews: 14, available: true, desc: '' },
      { id: 4, name: 'Café en grains 250 g', price: 7.9, rating: 4.6, reviews: 9, available: false, desc: 'Torréfié à Paris.' },
    ],
  };
  const cartLines = () => Object.entries(shop.cart).filter(([, q]) => q > 0).map(([id, q]) => ({ p: shop.products.find((x) => x.id === Number(id)), q }));
  const cartTotal = () => cartLines().reduce((s, l) => s + l.p.price * l.q, 0);

  /* ======================= Rendu ======================= */
  let active = 'cleanpilot';

  const stars = (r) => `<span class="stars" aria-label="Note ${String(r).replace('.', ',')} sur 5">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;

  const cleanScreens = {
    planning: () => `
      <h4 class="app-h">Planning · aujourd’hui</h4>
      <ul class="app-list">${clean.missions.map((m) => `
        <li class="app-item">
          <div class="app-item-top"><strong>${esc(m.time)} · ${esc(m.type)}</strong><span class="badge badge-${m.status}">${STATUS[m.status]}</span></div>
          <p>${esc(m.client)} — ${esc(m.place)}</p>
          <label class="app-field">Intervenant
            <select data-key="assign-${m.id}" data-action="assign" data-id="${m.id}">
              <option value="">À affecter</option>${AGENTS.map((a) => `<option ${a === m.agent ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </label>
          <button class="app-btn app-btn-ghost" type="button" data-key="open-${m.id}" data-action="open" data-id="${m.id}">Voir les consignes</button>
        </li>`).join('')}
      </ul>`,
    terrain: () => {
      const m = mission();
      return `
      <h4 class="app-h">${esc(m.type)} · ${esc(m.time)}</h4>
      <p class="app-sub">${esc(m.client)} — ${esc(m.place)} · ${m.agent ? `Intervenant : ${esc(m.agent)}` : 'Non affectée'}</p>
      <fieldset class="app-checks"><legend>Consignes</legend>
        ${m.tasks.map((t, i) => `<label><input type="checkbox" data-key="task-${m.id}-${i}" data-action="task" data-i="${i}" ${m.done[i] ? 'checked' : ''} /> ${esc(t)}</label>`).join('')}
      </fieldset>
      <label class="app-field app-field-block">Compte rendu
        <textarea rows="3" data-key="report-${m.id}" data-action="report" placeholder="Ex. RAS, clé rendue à la gardienne.">${esc(m.report)}</textarea>
      </label>
      <button class="app-btn" type="button" data-key="save-report" data-action="save-report">Enregistrer le compte rendu</button>`;
    },
    validation: () => {
      const m = mission();
      const count = m.done.filter(Boolean).length;
      return `
      <h4 class="app-h">Validation</h4>
      <div class="app-card">
        <p><strong>${esc(m.client)}</strong> · ${esc(m.type)}</p>
        <p>Consignes : ${count} / ${m.tasks.length}</p>
        <p>Compte rendu : ${m.report ? 'saisi' : 'à saisir'}</p>
        <p>Statut : <span class="badge badge-${m.status}">${STATUS[m.status]}</span>${m.validatedAt ? ` à ${esc(m.validatedAt)}` : ''}</p>
      </div>
      <button class="app-btn" type="button" data-key="validate" data-action="validate" ${m.status === 'done' ? 'disabled' : ''}>Confirmer l’intervention effectuée</button>`;
    },
    admin: () => {
      const done = clean.missions.filter((m) => m.status === 'done').length;
      const todo = clean.missions.filter((m) => m.status === 'todo').length;
      return `
      <h4 class="app-h">Administration</h4>
      <div class="app-kpis"><div><strong>${clean.missions.length}</strong><span>missions</span></div><div><strong>${done}</strong><span>effectuées</span></div><div><strong>${todo}</strong><span>à affecter</span></div></div>
      <table class="app-table"><caption class="sr-only">Suivi des missions</caption>
        <thead><tr><th scope="col">Client</th><th scope="col">Intervenant</th><th scope="col">Statut</th></tr></thead>
        <tbody>${clean.missions.map((m) => `<tr><td>${esc(m.client)}</td><td>${esc(m.agent || '—')}</td><td>${STATUS[m.status]}</td></tr>`).join('')}</tbody>
      </table>
      <button class="app-btn" type="button" data-key="export" data-action="export">Exporter les données (CSV)</button>`;
    },
  };

  const shopScreens = {
    vitrine: () => `
      <div class="shop-hero"><p class="shop-name">Maison Lemoine</p><p>Boulangerie · Neuilly-sur-Seine · Ouvert 7 h – 19 h 30</p><p>${stars(4.8)} 4,8 · 112 avis clients</p></div>
      <ul class="shop-grid">${shop.products.map((p) => `
        <li class="shop-card">
          <div class="shop-img" aria-hidden="true"></div>
          <strong>${esc(p.name)}</strong>
          <p>${stars(p.rating)} <small>(${p.reviews})</small></p>
          <p class="shop-price">${euro(p.price)}</p>
          ${p.available ? `<button class="app-btn" type="button" data-key="add-${p.id}" data-action="add" data-id="${p.id}">Ajouter${shop.cart[p.id] ? ` (${shop.cart[p.id]})` : ''}</button>` : '<p class="badge badge-todo">Victime de son succès</p>'}
        </li>`).join('')}
      </ul>`,
    commande: () => {
      const lines = cartLines();
      return `
      <h4 class="app-h">Votre commande</h4>
      ${lines.length ? `<ul class="app-list">${lines.map((l) => `<li class="app-item app-item-row"><span>${esc(l.p.name)}</span>
        <span class="qty"><button class="app-btn app-btn-ghost app-btn-sq" type="button" data-key="minus-${l.p.id}" data-action="minus" data-id="${l.p.id}" aria-label="Retirer un ${esc(l.p.name)}">−</button><span>${l.q}</span><button class="app-btn app-btn-ghost app-btn-sq" type="button" data-key="plus-${l.p.id}" data-action="add" data-id="${l.p.id}" aria-label="Ajouter un ${esc(l.p.name)}">+</button></span>
        <strong>${euro(l.p.price * l.q)}</strong></li>`).join('')}</ul>` : '<p class="app-empty">Votre panier est vide. Ajoutez des produits depuis la vitrine.</p>'}
      <fieldset class="app-checks"><legend>Mode</legend>
        <label><input type="radio" name="shop-mode" value="retrait" data-key="mode-retrait" data-action="mode" ${shop.mode === 'retrait' ? 'checked' : ''} /> Retrait en magasin</label>
        <label><input type="radio" name="shop-mode" value="reservation" data-key="mode-resa" data-action="mode" ${shop.mode === 'reservation' ? 'checked' : ''} /> Réservation (paiement sur place)</label>
        <label><input type="radio" name="shop-mode" value="paiement" data-key="mode-pay" data-action="mode" ${shop.mode === 'paiement' ? 'checked' : ''} /> Paiement en ligne sécurisé (simulé)</label>
      </fieldset>
      <label class="app-field">Créneau de retrait
        <select data-key="slot" data-action="slot">${['12:00 – 12:30', '17:00 – 17:30', '18:30 – 19:00'].map((s) => `<option ${s === shop.slot ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </label>
      <p class="shop-total">Total : <strong>${euro(cartTotal())}</strong></p>
      <button class="app-btn" type="button" data-key="order" data-action="order" ${lines.length ? '' : 'disabled'}>Valider la commande</button>`;
    },
    backoffice: () => {
      const today = shop.orders.reduce((s, o) => s + o.total, 0);
      return `
      <h4 class="app-h">Back-office</h4>
      <div class="app-kpis"><div><strong>${shop.orders.length}</strong><span>commandes</span></div><div><strong>${euro(today)}</strong><span>chiffre du jour</span></div><div><strong>${euro(shop.orders.length ? today / shop.orders.length : 0)}</strong><span>panier moyen</span></div></div>
      <table class="app-table"><caption class="sr-only">Commandes du jour</caption>
        <thead><tr><th scope="col">N°</th><th scope="col">Détail</th><th scope="col">Statut</th></tr></thead>
        <tbody>${shop.orders.map((o) => `<tr><td>${o.id}</td><td>${esc(o.items)}<br /><small>${esc(o.mode)} · ${euro(o.total)}</small></td><td>
          <label class="sr-only" for="st-${o.id}">Statut de la commande ${o.id}</label>
          <select id="st-${o.id}" data-key="status-${o.id}" data-action="order-status" data-id="${o.id}">${['Nouvelle', 'Prête', 'Retirée'].map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody>
      </table>
      <h5 class="app-h5">Catalogue</h5>
      <ul class="app-list">${shop.products.map((p) => `<li class="app-item app-item-row"><span>${esc(p.name)}</span><label class="switch"><input type="checkbox" data-key="avail-${p.id}" data-action="avail" data-id="${p.id}" ${p.available ? 'checked' : ''} /> Disponible</label></li>`).join('')}</ul>`;
    },
    automatisation: () => `
      <h4 class="app-h">Automatisations</h4>
      <label class="switch switch-block"><input type="checkbox" data-key="auto-confirm" data-action="auto" data-name="confirm" ${shop.automations.confirm ? 'checked' : ''} /> E-mail de confirmation de commande</label>
      <label class="switch switch-block"><input type="checkbox" data-key="auto-reminder" data-action="auto" data-name="reminder" ${shop.automations.reminder ? 'checked' : ''} /> Relance si la commande n’est pas retirée (J+1)</label>
      <h5 class="app-h5">Messages envoyés (simulation)</h5>
      ${shop.log.length ? `<ul class="app-list">${shop.log.map((l) => `<li class="app-item"><small>${esc(l.at)}</small><p>${esc(l.text)}</p></li>`).join('')}</ul>` : '<p class="app-empty">Passez une commande depuis l’onglet « Commande » pour voir les messages automatiques.</p>'}
      <button class="app-btn app-btn-ghost" type="button" data-key="run-reminders" data-action="run-reminders">Simuler la relance du lendemain</button>`,
    ia: () => {
      const p = shop.products.find((x) => x.id === shop.aiProduct);
      return `
      <h4 class="app-h">Fiches produits — IA optionnelle</h4>
      <p class="app-sub">L’IA propose, le commerçant décide : rien n’est publié sans validation.</p>
      <label class="app-field">Produit
        <select data-key="ai-product" data-action="ai-product">${shop.products.map((x) => `<option value="${x.id}" ${x.id === shop.aiProduct ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
      </label>
      <p class="app-sub">Description en ligne : ${p.desc ? `« ${esc(p.desc)} »` : '<em>aucune</em>'}</p>
      <button class="app-btn app-btn-ghost" type="button" data-key="ai-suggest" data-action="ai-suggest">Proposer une description</button>
      ${shop.aiDraft ? `<label class="app-field app-field-block">Proposition (modifiable)
        <textarea rows="4" data-key="ai-draft" data-action="ai-draft">${esc(shop.aiDraft)}</textarea></label>
        <div class="app-row-btns"><button class="app-btn" type="button" data-key="ai-accept" data-action="ai-accept">Valider et publier</button><button class="app-btn app-btn-ghost" type="button" data-key="ai-reject" data-action="ai-reject">Rejeter</button></div>
        <p class="app-note">Démonstration : le texte est généré par un modèle de phrase local, sans appel à une IA.</p>` : ''}`;
    },
  };

  const DEMOS = {
    cleanpilot: {
      tab: 'CleanPilot', sector: 'Services à la personne', kind: 'Application mobile',
      title: 'CleanPilot — la gestion des interventions à domicile',
      intro: 'Une application de gestion des interventions : du planning au compte rendu, jusqu’à l’export des données.',
      chapters: [['planning', 'Planning', 'Affectation et suivi des missions'], ['terrain', 'Application terrain', 'Consignes et comptes rendus sur smartphone'], ['validation', 'Validation', 'Confirmation de l’intervention effectuée'], ['admin', 'Administration', 'Suivi centralisé et export des données']],
      state: clean, screens: cleanScreens, device: 'phone',
    },
    commerce: {
      tab: 'Commerce Connect', sector: 'Commerce', kind: 'Site web',
      title: 'Commerce Connect — une boutique qui attire et simplifie les commandes',
      intro: 'Un site mobile-first qui attire des clients, prend les commandes et automatise le suivi.',
      chapters: [['vitrine', 'Site mobile-first', 'Présentation, produits, avis et référencement local'], ['commande', 'Commande en ligne', 'Réservation, retrait en magasin ou paiement sécurisé'], ['backoffice', 'Back-office', 'Suivi des commandes, catalogue et tableau de bord'], ['automatisation', 'Automatisation', 'Confirmation de commande et relance client'], ['ia', 'IA optionnelle', 'Aide à la rédaction des fiches produits, validée par le commerçant']],
      state: shop, screens: shopScreens, device: 'browser',
    },
  };

  const render = () => {
    const focusKey = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset.key : null;
    const d = DEMOS[active];
    const screen = d.state.screen;
    const chapterLabel = d.chapters.find((c) => c[0] === screen)[1];
    const device = d.device === 'phone'
      ? `<div class="demo-phone"><div class="demo-phone-screen" tabindex="0" role="region" aria-label="Écran de l’application CleanPilot : ${esc(chapterLabel)}">
           <div class="demo-appbar"><strong>CleanPilot</strong><span>${now()}</span></div>
           <div class="demo-screen">${d.screens[screen]()}</div>
         </div>
         <nav class="demo-appnav" aria-label="Navigation de l’application">${d.chapters.map((c) => `<button type="button" data-key="nav-${c[0]}" data-action="screen" data-screen="${c[0]}" ${c[0] === screen ? 'aria-current="page"' : ''}>${({ planning: 'Planning', terrain: 'Terrain', validation: 'Valider', admin: 'Admin' })[c[0]]}</button>`).join('')}</nav></div>`
      : `<div class="demo-browser"><div class="demo-browser-bar"><i></i><i></i><i></i><span>boutique-exemple.fr</span></div>
           <nav class="demo-shopnav" aria-label="Navigation de la démo">${d.chapters.map((c) => `<button type="button" data-key="nav-${c[0]}" data-action="screen" data-screen="${c[0]}" ${c[0] === screen ? 'aria-current="page"' : ''}>${esc(c[1])}</button>`).join('')}</nav>
           <div class="demo-browser-body" tabindex="0" role="region" aria-label="Écran de la démo Commerce Connect : ${esc(chapterLabel)}"><div class="demo-screen">${d.screens[screen]()}</div></div></div>`;

    root.innerHTML = `
      <div class="demo-tabs" role="tablist" aria-label="Choisir une démonstration">
        ${Object.entries(DEMOS).map(([id, x]) => `<button class="demo-tab" role="tab" id="tab-${id}" aria-controls="panel-demo" aria-selected="${id === active}" tabindex="${id === active ? 0 : -1}" data-key="tab-${id}" data-tab="${id}"><strong>${x.tab}</strong><span>${x.sector} · ${x.kind}</span></button>`).join('')}
      </div>
      <div class="demo-panel" role="tabpanel" id="panel-demo" aria-labelledby="tab-${active}">
        <div class="demo-info">
          <p class="eyebrow">${d.sector} · ${d.kind}</p>
          <h3 class="h-feature">${d.title}</h3>
          <p class="muted">${d.intro}</p>
          <ol class="demo-chapters">${d.chapters.map((c, i) => `<li><button type="button" data-key="ch-${c[0]}" data-action="screen" data-screen="${c[0]}" ${c[0] === screen ? 'aria-current="step"' : ''}><span class="demo-ch-num">0${i + 1}</span><span><strong>${esc(c[1])}</strong><small>${esc(c[2])}</small></span></button></li>`).join('')}</ol>
          <p class="demo-live" role="status" aria-live="polite">${esc(d.state.message)}</p>
          <p class="note">Démonstration : données fictives, rien n’est envoyé ni enregistré.</p>
        </div>
        <div class="demo-device">${device}</div>
      </div>`;
    if (focusKey) root.querySelector(`[data-key="${CSS.escape(focusKey)}"]`)?.focus();
  };

  const say = (state, text) => { state.message = text; };

  /* ======================= Actions ======================= */
  const act = (el, event) => {
    const a = el.dataset.action;
    const id = Number(el.dataset.id);
    const d = DEMOS[active];
    if (a === 'screen') { d.state.screen = el.dataset.screen; say(d.state, ''); return true; }
    if (active === 'cleanpilot') {
      const m = mission();
      switch (a) {
        case 'assign': { const t = clean.missions.find((x) => x.id === id); t.agent = el.value; if (t.status !== 'done') t.status = el.value ? (t.report ? 'reported' : 'assigned') : 'todo'; say(clean, el.value ? `${t.type} de ${t.time} affectée à ${el.value}.` : `${t.type} de ${t.time} à affecter.`); return true; }
        case 'open': clean.current = id; clean.screen = 'terrain'; say(clean, ''); return true;
        case 'task': m.done[Number(el.dataset.i)] = el.checked; say(clean, `${m.done.filter(Boolean).length} consigne(s) sur ${m.tasks.length} faite(s).`); return true;
        case 'report': if (event.type === 'input') { m.report = el.value; return false; } return false;
        case 'save-report': if (!m.report.trim()) { say(clean, 'Le compte rendu est vide : écrivez une phrase, même « RAS ».'); return true; } if (m.status !== 'done') m.status = 'reported'; say(clean, 'Compte rendu enregistré. Passez à « Validation ».'); return true;
        case 'validate': {
          if (!m.agent) { say(clean, 'Affectez d’abord un intervenant dans le planning.'); return true; }
          if (m.done.some((x) => !x)) { say(clean, 'Cochez toutes les consignes avant de confirmer l’intervention.'); return true; }
          m.status = 'done'; m.validatedAt = now(); say(clean, `Intervention chez ${m.client} confirmée à ${m.validatedAt}.`); return true;
        }
        case 'export': {
          const rows = [['Client', 'Prestation', 'Heure', 'Lieu', 'Intervenant', 'Statut', 'Consignes faites', 'Compte rendu', 'Validée à']]
            .concat(clean.missions.map((x) => [x.client, x.type, x.time, x.place, x.agent, STATUS[x.status], `${x.done.filter(Boolean).length}/${x.tasks.length}`, x.report, x.validatedAt]));
          const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
          const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
          const link = document.createElement('a'); link.href = url; link.download = 'cleanpilot-missions-demo.csv'; document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          say(clean, 'Fichier CSV téléchargé (données fictives).'); return true;
        }
        default: return false;
      }
    }
    switch (a) {
      case 'add': { const p = shop.products.find((x) => x.id === id); shop.cart[id] = (shop.cart[id] || 0) + 1; say(shop, `${p.name} ajouté au panier (${shop.cart[id]}).`); return true; }
      case 'minus': shop.cart[id] = Math.max(0, (shop.cart[id] || 0) - 1); say(shop, 'Quantité mise à jour.'); return true;
      case 'mode': shop.mode = el.value; return true;
      case 'slot': shop.slot = el.value; return true;
      case 'order': {
        const lines = cartLines(); if (!lines.length) return false;
        const order = { id: 1041 + shop.orders.length, client: 'Vous (démo)', items: lines.map((l) => `${l.p.name} ×${l.q}`).join(', '), total: cartTotal(), mode: { retrait: 'Retrait', reservation: 'Réservation', paiement: 'Payée en ligne' }[shop.mode], status: 'Nouvelle', at: now() };
        shop.orders.unshift(order); shop.cart = {};
        if (shop.automations.confirm) shop.log.unshift({ at: now(), text: `Confirmation envoyée : « Merci ! Votre commande n° ${order.id} (${euro(order.total)}) vous attend de ${shop.slot}. »` });
        say(shop, `Commande n° ${order.id} enregistrée. Elle apparaît dans le back-office.`); return true;
      }
      case 'order-status': { const o = shop.orders.find((x) => x.id === id); o.status = el.value; say(shop, `Commande n° ${o.id} : ${o.status}.`); return true; }
      case 'avail': { const p = shop.products.find((x) => x.id === id); p.available = el.checked; say(shop, `${p.name} ${p.available ? 'remis en vente' : 'retiré de la vitrine'}.`); return true; }
      case 'auto': shop.automations[el.dataset.name] = el.checked; say(shop, `Automatisation ${el.checked ? 'activée' : 'désactivée'}.`); return true;
      case 'run-reminders': {
        if (!shop.automations.reminder) { say(shop, 'La relance est désactivée.'); return true; }
        const pending = shop.orders.filter((o) => o.status !== 'Retirée');
        pending.forEach((o) => shop.log.unshift({ at: now(), text: `Relance envoyée pour la commande n° ${o.id} : « Votre commande vous attend toujours en boutique. »` }));
        say(shop, pending.length ? `${pending.length} relance(s) envoyée(s) (simulation).` : 'Aucune commande en attente : pas de relance.'); return true;
      }
      case 'ai-product': shop.aiProduct = Number(el.value); shop.aiDraft = ''; return true;
      case 'ai-suggest': {
        const p = shop.products.find((x) => x.id === shop.aiProduct);
        shop.aiDraft = `${p.name} préparé chaque jour dans notre fournil de Neuilly-sur-Seine, avec des ingrédients sélectionnés. Apprécié par nos clients (${String(p.rating).replace('.', ',')}/5). À réserver en ligne et à retirer en boutique.`;
        say(shop, 'Proposition prête : relisez-la, modifiez-la, puis validez ou rejetez.'); return true;
      }
      case 'ai-draft': if (event.type === 'input') shop.aiDraft = el.value; return false;
      case 'ai-accept': { const p = shop.products.find((x) => x.id === shop.aiProduct); p.desc = shop.aiDraft.trim(); shop.aiDraft = ''; say(shop, `Description publiée pour « ${p.name} ».`); return true; }
      case 'ai-reject': shop.aiDraft = ''; say(shop, 'Proposition rejetée : rien n’a été publié.'); return true;
      default: return false;
    }
  };

  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');
    if (tab) { active = tab.dataset.tab; render(); root.querySelector(`[data-tab="${active}"]`).focus(); return; }
    const el = event.target.closest('button[data-action]');
    if (el && act(el, event)) render();
  });
  root.addEventListener('change', (event) => {
    const el = event.target.closest('select[data-action], input[data-action]');
    if (el && act(el, event)) render();
  });
  root.addEventListener('input', (event) => {
    const el = event.target.closest('textarea[data-action]');
    if (el) act(el, event);
  });
  // Onglets : flèches gauche/droite (motif ARIA « tabs »)
  root.addEventListener('keydown', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const ids = Object.keys(DEMOS);
    let i = ids.indexOf(tab.dataset.tab);
    i = event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
    active = ids[i]; render(); root.querySelector(`[data-tab="${active}"]`).focus();
  });
  document.addEventListener('synumanus:demo', (event) => { if (DEMOS[event.detail]) { active = event.detail; render(); } });

  render();
})();
