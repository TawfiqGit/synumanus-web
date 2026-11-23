# B5 — Handoff développeurs — Refonte du site Synumanus

Version 1.0 — 23/11/2026 — Lili (UX/UI) → Law (Full Stack), copie Ace (QA) et Dragon (DevOps)
Entrées : gate G3 franchie le 23/11 (B3 v0.2 + B4 v0.9 validés ensemble), specs v0.9, journal des décisions.
**Source de vérité visuelle : le prototype** (branche `claude/practical-bell-yr0jwk`, `python3 build.py && python3 local_server.py`). En cas d'écart entre ce document et le prototype, le prototype fait foi, sauf mention « à corriger » ci-dessous.

---

## 0. Organisation du code (état du prototype)

| Fichier | Rôle |
|---|---|
| `src/templates/base-v2.html` | Gabarit des pages v2 : préchargement police, `ds.css` puis `theme.css`, activation `motion-ok` dans le `<head>`, `config.js`, `script.js`, `v2/ds.js` |
| `src/partials/header-v2.html`, `footer-v2.html`, `cta-v2.html` | Bandeau + header, pied de page, appel final sombre des pages intérieures (`{{CTA_BAND}}`) |
| `src/static/v2/ds.css` | Socle (tokens historiques, composants). **Contient du CSS mort** des versions précédentes (téléphones/feuilles d'aperçu, sphère…) → à nettoyer (Q4) |
| `src/static/v2/theme.css` | Thème v0.8 : tokens finaux, police, sections sombres, bento, récit au défilement, pied de page — **prioritaire sur `ds.css`** |
| `src/static/v2/home.css` / `home.js` | Accueil : hero XXL, parcours, guide de choix, calculateur |
| `src/static/v2/demos.css` / `demos.js` | Démos CleanPilot et Commerce Connect |
| `src/static/v2/hero-flow.js` | Rubans fluides (canvas) des heros |
| `src/static/v2/project.css` | Formulaire « Démarrer un projet » (HTML et `project.js` inchangés) |
| `src/data/pages.json` | Une page v2 = `"design": "v2"` ; styles, scripts et JSON-LD par page |

Pages v2 (MVP, 12) : `/`, `/applications-mobiles/`, `/applications-web-metier/`, `/automatisation-ia/`, 4 × `/services/…/`, `/a-propos/agence/`, `/demarrer-un-projet/`, `/mentions-legales/`, `/politique-confidentialite/`. Pages du lot 2 : ancien design, hors menu, liens en pied de page (décision B2).

---

## 1. Tokens

### 1.1 Couleurs — fond clair
| Token (CSS) | Valeur | Usage | Contraste |
|---|---|---|---|
| `--c-bg` | `#f7f6f2` | Fond de page (papier chaud) | — |
| `--c-bg-alt` | `#efede6` | Bandes alternées (`.band-paper`) | — |
| `--c-bg-raised` | `#ebe8e0` | Surfaces atténuées | — |
| `--c-card` | `#ffffff` | Cartes | — |
| `--c-border` / `--c-border-strong` | `#e3e0d7` / `#d2cec3` | Bordures et pointillés décoratifs | décoratif |
| `--c-border-control` | `#6f6b62` | Bordures de champs et contrôles | 5,0:1 ✅ |
| `--c-text` / `--c-text-strong` | `#1c1c1e` / `#111113` | Texte, titres | 16,1:1 ✅ |
| `--c-text-2` | `#55524b` | Texte secondaire | 7,1:1 ✅ |
| `--c-accent-text` | `#003880` | Bleu nuit du logo : mots en accent, liens, états sélectionnés, focus | 11,5:1 ✅ |
| `--c-accent` | `#7dd3fc` | Aplats et décor **uniquement** (jamais en texte sur clair : 1,5:1) | — |
| `--c-bg-sky` | `#f0f9ff` | Fond d'élément sélectionné, résultat du guide | — |
| `--c-cta` / `--c-cta-hover` | `#003880` / `#002a63` | Bouton principal (texte blanc) | 11,5:1 ✅ |
| `--c-success` / `--c-danger` | `#15803d` / `#b91c1c` | États (toujours avec un texte ou une icône) | ≥ 5:1 ✅ |

### 1.2 Couleurs — sections sombres (`.section-dark`, pied de page)
| Token | Valeur | Usage | Contraste |
|---|---|---|---|
| `--c-dark` | `#1e293b` | Fond (ardoise bleutée, décision du 23/11) | — |
| `--c-dark-2` / `--c-dark-3` | `#273449` / `#334155` | Cartes / carte active | — |
| `--c-dark-border` | `#475569` | Bordures | décoratif |
| `--c-dark-text` | `#f4f4f5` | Texte | 13,3:1 ✅ |
| `--c-dark-text-2` | `#cbd5e1` | Texte secondaire | 9,9:1 (8,5:1 sur cartes) ✅ |
| `--c-dark-accent` | `#7dd3fc` | Accents, liens, bouton principal (texte `#111113`) | 8,8:1 ✅ |

### 1.3 Typographie
| Token / classe | Valeur | Usage |
|---|---|---|
| `--font-sans` | Plus Jakarta Sans (variable 200–800, auto-hébergée, OFL) | Tout le texte |
| `--font-mono` | JetBrains Mono 400/500 (OFL) | Libellés `[ … ]`, boutons, navigation, index |
| `.display-xxl` | `clamp(2.6rem, 1.3rem + 3.9vw, 4.6rem)` / 600 / 0,98 / −0,045 em, max 14 ch | H1 de l'accueil |
| `.display-xl` | `clamp(2.4rem, 1.3rem + 3.2vw, 4rem)` / 600 / 1 / −0,04 em, max 16 ch | H1 des pages intérieures |
| `.display` | `clamp(2.5rem, …, 3.75rem)` | Titres des appels finaux |
| `.h-section` | 28 → 36 px / 600 / 1,11 | H2 |
| `.h-feature` | 24 px / 600 | Titres de carte importants |
| `.h-card` | 18 px / 600 | Titres de carte |
| `.lead` | 18 px / 1,6 | Chapeaux |
| corps | 16 px / 1,6 | Texte courant (jamais < 16 px sur mobile) |
| `.eyebrow` | mono 12 px / 500 / capitales / +0,1 em, entre `[ ]` | Libellés de section |
| `.btn` | mono 13 px (14 px en `.btn-lg`) / capitales / +0,05 em | Boutons |
| légende | 12 px minimum | Mentions |

### 1.4 Espacements, rayons, mise en page
- Échelle : 4 · 8 · 16 · 24 · 32 · 48 · 64 · 72 · 128 px (`--s-1` à `--s-9`).
- Écart entre sections : 128 px (desktop), 72 px (< 768 px). Gouttière : 24 px (20 px < 768 px). Conteneur : 1200 px.
- Rayons : cartes 4 px, boutons 2 px, pastilles 9999 px.
- Points de rupture : 480 · 640 · 768 · 960 px.
- Repères pointillés verticaux aux bords du conteneur (`body.v2::after`), masqués < 768 px.

---

## 2. Composants

| Composant | Classe | Variantes | États | Accessibilité |
|---|---|---|---|---|
| Bouton | `.btn` | `btn-primary` (bleu nuit ; bleu ciel en section sombre), `btn-ghost`, `btn-secondary`, `btn-sm`, `btn-lg`, `btn-block` | survol (fond plus foncé), focus (contour 2 px `#003880`, décalé de 2 px ; `#7dd3fc` en sombre), pressé (−1 px), désactivé (opacité 0,55) | Hauteur ≥ 44 px (48–52 px en `lg`) ; flèche décorative `aria-hidden` |
| Lien fléché | `.link-arrow` | `stretched` (carte entière cliquable) | survol souligné + flèche décalée de 3–4 px ; focus porté par la carte (`:has(:focus-visible)`) | Zone ≥ 44 px ; le texte du lien suffit hors contexte |
| Libellé de section | `.eyebrow` | — | — | Crochets ajoutés en CSS (non lus) |
| Étiquette | `.tag` | `tag-accent` | — | Liste `ul.chips` avec `aria-label` |
| Carte | `.card` | `card-link`, `card-raised`, `bento-feature`, `stat-card` | survol : bordure foncée (fond `#334155` en sombre) | Un seul lien étiré par carte |
| Grille bento | `.bento` | `b-wide`, `b-tall`, `b-half`, `b-full`, `bento-2` (2 × 2), `bento-4` | — | 1 colonne < 640 px, 2 colonnes < 960 px |
| Parcours | `.paths > .path` | — | survol : bordure foncée, flèche +4 px | `<nav aria-label="Choisissez votre parcours">` |
| Récit au défilement | `.scrolly` | — | étape active : bordure gauche `#7dd3fc`, fond `#334155` ; inactives opacité 0,45 | Tout est actif sans JS ou avec réduction des mouvements |
| FAQ | `details.faq-item` | — | ouverte / fermée (icône + / −) | `summary` natif ; une seule ouverte à la fois (`script.js`) |
| Appel final | `.final-cta` | accueil (texte propre), pages intérieures (`cta-v2.html`) | — | H2 réel |
| Champ | `.input`, `.field-label` | sombre (pied de page) | survol, focus, erreur (`is-invalid` : bordure + texte) | Libellé visible, `autocomplete`, erreur jamais portée par la seule couleur |
| Rubans fluides | `.hero-flow` (+ `.hero-flow-frame`) | `data-flow-seed` 1–7 (une variante par page) | lecture / pause | Canvas `aria-hidden` ; bouton pause obligatoire (voir §5) |

---

## 3. Éléments communs

### 3.1 Bandeau d'annonce
Fond `--c-dark`, texte 14 px : « Premier échange de 30 min, gratuit et sans engagement. » + lien « Réserver un créneau » → `/demarrer-un-projet/`.

### 3.2 Header
| Élément | Composant | Comportement | Accessibilité |
|---|---|---|---|
| Logo | `.brand` (image 32 px + « synumanus ») | → `/` | `aria-label="Synumanus — Accueil"`, image `alt=""` |
| Solutions ▾ | `.nav-hub` + `.nav-menu` (2 colonnes : 3 piliers / 4 services) | Clic : ouvre/ferme ; clic extérieur, Échap et sortie du focus : ferme ; Échap rend le focus au bouton | `aria-expanded`, `aria-controls` ; page courante : `aria-current="page"` + soulignement 2 px |
| Méthode | lien | → `/#methode` | — |
| Agence | lien | → `/a-propos/agence/` | `aria-current` sur la page |
| CTA | `.btn-primary` « Échanger sur mon projet » | → `/demarrer-un-projet/` | — |
| Menu mobile (< 960 px) | bouton 44 px + panneau plein écran | Le panneau démarre sous le header (position calculée) ; Échap ferme et rend le focus | Libellé « Ouvrir le menu » / « Fermer le menu » ; panneau `inert` quand il est fermé |
Header collant : 72 px, 60 px après défilement (`.scrolled`).

### 3.3 Pied de page
Fond `--c-dark` : marque + e-mail + « Les Tricolores · Neuilly-sur-Seine » ; newsletter (logique `script.js` inchangée) ; 5 colonnes de liens ; ligne basse (©, mentions, confidentialité, réseaux 44 px, retour en haut) ; grand logotype décoratif en `::after` (non lu, hors contrôle de contraste).
Messages newsletter : « Merci. Votre inscription a bien été prise en compte. » / « L’inscription n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email. »

### 3.4 Bouton WhatsApp flottant
56 px, bas droite. Masqué pendant la saisie du formulaire (étapes 1 à 4), réaffiché à l'étape créneau ou en cas d'erreur d'envoi (`ds.js`, décision du 17/11). Masqué quand le menu mobile est ouvert.

---

## 4. Écrans

### 4.1 Accueil `/`
| # | Section | Élément | Composant / token | Comportement | Accessibilité |
|---|---|---|---|---|---|
| 1 | Hero (clair) | Libellé « Applications sur mesure · Neuilly-sur-Seine », H1 « Des applications pensées pour *votre métier* » | `.eyebrow`, `.display-xxl` (mot en `#003880` + soulignement dégradé) | Apparition échelonnée (§5) | Un seul H1 |
| | | Chapeau, « Échanger sur mon projet », « Essayer une démo » (→ `#demos`), 3 repères | `.lead`, `.btn-primary.btn-lg`, `.btn-ghost.btn-lg`, `.proof-row` | — | Repères en `ul` avec `aria-label` |
| | | Rubans fluides encadrés | `.hero-flow-frame` | Interactifs + pause (§5) | Légende « survolez-la / touchez-la » selon `hover` |
| | | 3 parcours | `.paths` | → `/applications-mobiles/`, `/automatisation-ia/`, `/services/refonte-application-mobile/` | `nav` nommée |
| 2 | Solutions (sombre) | Bento : Mobile (large, 2 lignes, visuel en couches), Web & métier, Automatisation & IA, Cadrage, Refonte, Maintenance | `.bento`, `.card-link` | Carte entière cliquable | Visuel `aria-hidden` |
| 3 | Démos (`#demos`) | Onglets + panneau | voir §4.2 | | |
| 4 | Méthode (`#methode`, sombre) | 4 étapes + barre de progression + note de durée | `.scrolly` | §5 | `ol` |
| 5 | Guide de choix (`#guide`) | Formulaire 3 questions + calculateur | voir §4.3 et §4.4 | | |
| 6 | Engagements (bande) | 3 chiffres + 4 engagements | `.stat-card`, `.b-half` | — | Chiffres = expérience du fondateur ; témoignages clients en lot 2 |
| 7 | FAQ | 5 questions | `.faq` | 1 ouverte par défaut | Balisage `FAQPage` (§7) |
| 8 | Appel final (sombre) | « Concrétisons *votre projet* » + CTA + WhatsApp | `.final-cta` | — | — |

### 4.2 Démos interactives (`demos.js`)
Commun : onglets ARIA (`role="tablist"`, flèches ←/→, Début/Fin), panneau `role="tabpanel"` ; à gauche les chapitres (boutons, `aria-current="step"`), à droite l'appareil ; zone d'écran défilante focusable (`tabindex="0"`, `role="region"`, nom explicite) ; messages dans `role="status"` ; le focus est conservé après chaque action. **Données fictives, rien n'est envoyé** (mention visible). Ouverture directe de Commerce Connect : `/#demo-commerce`.

**CleanPilot** (services à la personne, téléphone 340 px, navigation basse Planning · Terrain · Valider · Admin)
| Écran | Contenu | Règles | Messages |
|---|---|---|---|
| Planning | 3 missions (heure, prestation, client, lieu, statut), liste « Intervenant » (À affecter, Amina, Lucas, Sofia), « Voir les consignes » | Affecter → statut « Planifiée » ; retirer → « À affecter » | « {prestation} de {heure} affectée à {nom}. » |
| Terrain | Consignes (cases à cocher), compte rendu (zone de texte), « Enregistrer le compte rendu » | Compte rendu vide refusé | « Le compte rendu est vide : écrivez une phrase, même « RAS ». » / « Compte rendu enregistré. Passez à « Validation ». » |
| Validation | Récapitulatif + « Confirmer l’intervention effectuée » | Refus si aucun intervenant ou consigne non cochée ; ensuite bouton désactivé | « Affectez d’abord un intervenant dans le planning. » / « Cochez toutes les consignes avant de confirmer l’intervention. » / « Intervention chez {client} confirmée à {heure}. » |
| Admin | 3 indicateurs, tableau (`caption` masqué), « Exporter les données (CSV) » | CSV UTF-8 avec BOM, séparateur `;`, fichier `cleanpilot-missions-demo.csv` | « Fichier CSV téléchargé (données fictives). » |
Statuts : À affecter (orange) · Planifiée (bleu) · Compte rendu saisi (violet) · Effectuée (vert) — toujours avec leur libellé texte.

**Commerce Connect** (commerce, navigateur « boutique-exemple.fr », boutique fictive « Maison Lemoine », couleur brune `#7a3e12`)
| Écran | Contenu | Règles | Messages |
|---|---|---|---|
| Site mobile-first | Bandeau boutique (horaires, ville, avis), 4 produits (note, prix, « Ajouter ») | Produit indisponible : pas de bouton | « {produit} ajouté au panier ({n}). » |
| Commande en ligne | Panier (− / +), mode (retrait / réservation / paiement simulé), créneau, total, « Valider la commande » | Bouton désactivé si panier vide ; la commande part dans le back-office | « Commande n° {n} enregistrée. Elle apparaît dans le back-office. » |
| Back-office | 3 indicateurs, tableau des commandes (statut Nouvelle · Prête · Retirée), catalogue (interrupteur « Disponible ») | — | « Commande n° {n} : {statut}. » |
| Automatisation | 2 interrupteurs (confirmation, relance J+1), journal des messages, « Simuler la relance du lendemain » | Relance seulement si activée, pour les commandes non retirées | « {n} relance(s) envoyée(s) (simulation). » |
| IA optionnelle | Choix du produit, description actuelle, « Proposer une description », texte modifiable, « Valider et publier » / « Rejeter » | **Rien n'est publié sans validation** ; mention « généré par un modèle de phrase local, sans appel à une IA » | « Description publiée pour « {produit} ». » / « Proposition rejetée : rien n’a été publié. » |

### 4.3 Guide de choix (sans IA)
3 groupes de boutons radio stylés (`fieldset` + `legend`), cibles ≥ 44 px, état coché : bordure + fond `#f0f9ff` + coche « ✓ ».
| Réponses | Recommandation | Lien |
|---|---|---|
| Point de départ = outil à moderniser | Refonte ou maintenance | `/services/refonte-application-mobile/` |
| = tâches répétitives | Automatisation & IA | `/automatisation-ia/` |
| = vendre ou être trouvé en ligne | Site web & boutique en ligne + démo Commerce Connect | `/applications-web-metier/` |
| = idée, priorité « tester l'idée » | Cadrage & prototypage | `/services/cadrage-prototypage/` |
| = idée, utilisateurs « au bureau » | Application web & métier | `/applications-web-metier/` |
| = idée, autres cas | Application mobile + démo CleanPilot | `/applications-mobiles/` |
Erreur : « Répondez aux trois questions pour voir la recommandation. » (`role="alert"`, focus sur la première question sans réponse). Résultat : zone `aria-live`, reçoit le focus, toujours avec « Échanger sur mon projet » et la mention « Ce guide oriente, il ne décide pas : un échange de 30 minutes permet de confirmer. »

### 4.4 Calculateur de temps gagné
Champs numériques : personnes (1–500, défaut 5), minutes perdues par jour et par personne (0–480, défaut 30), jours travaillés par an (1–365, défaut 220). Valeurs hors bornes ramenées dans les bornes.
**Formule** : heures = arrondi(personnes × minutes × jours × 0,6 ÷ 60) ; jours = arrondi(heures ÷ 7). Sortie `output` `aria-live` : « {h} h récupérées par an, soit environ {j} jours de travail ». Hypothèse de 60 % affichée sous le résultat. **Aucun prix** (décision du 16/11).

### 4.5 Gabarit pilier (3 pages)
Fil d'Ariane → hero XL + rubans (`data-flow-seed` 1–3) → « Ce que ça change » (bande, 3 cartes avant/après + lien vers une démo pour Mobile et Web) → offre en bento (**section sombre**) → contenu propre (technologies, garde-fous avec bloc de données) → FAQ (bande) → appel final sombre.

### 4.6 Gabarit service (4 pages)
Fil d'Ariane → hero XL + rubans (`data-flow-seed` 4–7) + 3 repères → « Pour qui, quand » (bande, bento) → « Ce que vous recevez » (bento) → **méthode au défilement (sombre)** → FAQ (bande) → services liés (bento 2) → appel final sombre.

### 4.7 Agence
Hero XL + plan stylisé des bureaux (SVG `role="img"` avec `title` et `desc`, légende « Illustration — plan stylisé, non contractuel ») → 4 chiffres en bento → manifeste (bande, voix « je ») → « Ma façon de travailler » (sombre) → « Nos bureaux » (Tricolores, Neuilly-sur-Seine, sur rendez-vous) → appel final sombre.

### 4.8 Démarrer un projet
HTML et `project.js` **inchangés** (5 étapes) ; style `v2/project.css`. Messages existants conservés : « Complétez les champs obligatoires avant de continuer. », « Envoi… », « La demande n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email/WhatsApp. » Passage à 4 étapes et nouvelles valeurs de « Nature du projet » : en attente (Q1).

### 4.9 Pages légales
Hero simple + bande : sommaire ancré (collant en desktop) + texte ≤ 72 caractères par ligne. Contenu juridique inchangé (à compléter, Q3).

### 4.10 Page 404 — créée au lot 3 (23/11) ; réponse 404 du serveur via `.htaccess` à vérifier en pré-production
H1 « Cette page n’existe pas ou a été déplacée » + 3 liens : Accueil, Solutions (`/applications-mobiles/`), « Échanger sur mon projet ». Gabarit v2, sans rubans.

---

## 5. Animations et mouvement
| Élément | Déclencheur | Durée | « Réduire les animations » | Sans JS |
|---|---|---|---|---|
| Texte du hero | chargement (`motion-ok` posé dans le `<head>`) | 0,5 s par élément, décalage 70 ms (fin ≤ 0,8 s) | aucune | visible |
| Soulignement du mot en accent | chargement | 0,7 s (départ 0,55 s) | statique | statique |
| Rubans fluides | continu | arrivée 1,8 s puis ondulation continue | image fixe, pas d'interaction, bouton masqué | dégradé CSS |
| Interaction rubans | survol / glisser du doigt / clic | effet de lentille (σ = 80 px), onde 0,55 px/ms | désactivée | — |
| Bouton pause des rubans | — | — | masqué | masqué |
| Méthode au défilement | défilement (`IntersectionObserver`, marge −45 %) | 0,3 s | toutes les étapes actives | toutes actives |
| Plan de l'Agence | chargement | murs 1,4 s, mobilier 0,6 s | statique | statique |
| Apparitions `.reveal` | entrée à l'écran | 0,3 s | aucune | visible |
**WCAG 2.2.2** : seuls les rubans bougent en continu, d'où le bouton « Mettre en pause / Reprendre l’animation » (`aria-pressed`, 44 px). **Performance** : boucle `requestAnimationFrame` arrêtée en pause, hors écran et onglet masqué ; densité réduite < 520 px ; résolution plafonnée à 1,5×.

---

## 6. Accessibilité (WCAG 2.2 AA)
- **Ordre de focus du header** : lien d'évitement « Aller au contenu » → logo → Solutions → (menu ouvert : 3 piliers puis 4 services) → Méthode → Agence → CTA. En mobile : logo → bouton menu → panneau (Solutions, Méthode, Agence, CTA).
- **Ordre dans les démos** : onglets → chapitres → écran (zone défilante) → contrôles de l'écran → navigation de l'appareil.
- **Focus visible** partout : contour 2 px `#003880` (sur clair) ou `#7dd3fc` (sur sombre), décalage 2 px.
- **Libellés** : rubans et visuels `aria-hidden` ; plan de l'Agence `role="img"` + `title`/`desc` ; boutons ± du panier avec `aria-label` explicites ; tableaux avec `caption` masqué et `th scope="col"`.
- **Cibles** ≥ 44 × 44 px (40 px tolérés pour les contrôles secondaires internes des démos — à vérifier par Ace, Q6).
- **Reflow** : aucun défilement horizontal à 320 px de large ni à 200 % de zoom (contrôlé à 375 px ; 320 px et 200 % à vérifier par Ace).
- **Contrôle automatique** : axe-core 4 (WCAG 2.0/2.1/2.2 A et AA) = 0 violation sur les 12 pages au 23/11. À relancer après chaque intégration.

---

## 7. Référencement et visibilité dans les recherches IA
- Un seul H1 par page, titres hiérarchisés, `title` et `description` uniques dans `pages.json`.
- Accueil : JSON-LD `ProfessionalService` (nom, logo, e-mail, Neuilly-sur-Seine, zone FR) + `FAQPage` générés à partir des questions de la page.
- **À ajouter** (Law) : `FAQPage` sur les pages piliers et services, `BreadcrumbList` sur les pages à fil d'Ariane, `Service` sur les 4 pages services (Q7).
- `sitemap.xml` et `robots.txt` déjà générés par `build.py`.

---

## 8. Performance
- Polices : 4 fichiers woff2 (~92 Ko), préchargement de la police latine, `font-display: swap`.
- CSS + JS v2 : ~141 Ko non minifiés → minification et suppression du CSS mort (Q4).
- Images : anciennes photos de hero (~8 Mo dans `src/static/assets/`) non utilisées par les pages v2 → conversion WebP ou suppression selon l'usage du lot 2 (Q5).
- Objectifs : LCP < 2,5 s, CLS < 0,1, INP < 200 ms sur mobile 4G (à mesurer par Ace / Dragon).

---

## 9. Écarts entre B3 v0.2 et le prototype validé (G3)
| B3 | Prototype | Raison |
|---|---|---|
| Hero : aperçu d'application | Rubans fluides interactifs | Décisions du 20 et 21/11 |
| Sections « Aperçu » d'application | Supprimées | Décision du 23/11 |
| — | Parcours personnalisés, démos, guide de choix, calculateur, bento, méthode au défilement | Tendances 2026 (23/11) |
| Formulaire en 4 étapes | 5 étapes conservées | En attente de Law (Q1) |
| Page 404 | Absente | À créer (§4.10) |

---

## 10. Questions ouvertes
| # | Question | Pour |
|---|---|---|
| Q1 | Le back-end PHP accepte-t-il les nouvelles valeurs de « Nature du projet » (6 valeurs B3) et le passage à 4 étapes, sans casser le suivi d'étapes ni la relance systeme.io ? | Law |
| Q2 | Texte de la mention RGPD sous le bouton d'envoi du formulaire | Law, TawfiqDev |
| Q3 | Politique de confidentialité : remplacer « Brevo Meetings » par systeme.io ; adresse exacte des Tricolores à afficher | TawfiqDev |
| Q4 | ~~Nettoyage CSS~~ — fait au lot 3 (23/11) : CSS mort retiré, `/v2/site.css` fusionné et minifié au build | Law |
| Q5 | ~~Anciennes photos~~ — supprimées au lot 3 (aucune page ne les utilisait) | Law |
| Q6 | Contrôles secondaires des démos à 40 px : passer à 44 px ou accepter (cible tactile hors critère 2.5.8, minimum 24 px) | Ace, TawfiqDev |
| Q7 | Données structurées complémentaires (`FAQPage`, `BreadcrumbList`, `Service`) | Law |
| Q8 | Plausible (décidé le 17/11) : script à intégrer dans `base-v2.html` sans cookie | Dragon |
| Q9 | Données de prospects versionnées dans `var/` : retrait et purge (tâche urgente ouverte) | Dragon, TawfiqDev |

---

## 11. Définition de terminé (UX) pour l'intégration
1. Rendu conforme au prototype v0.9 (ordinateur 1440 px, mobile 390 px), revue Lili sans écart bloquant ni majeur.
2. axe-core : 0 violation sur toutes les pages v2 ; navigation complète au clavier vérifiée par Ace.
3. Démos, guide de choix et calculateur : parcours du §4 rejoués sans erreur JS.
4. « Réduire les animations » : aucune animation ; rubans figés ; bouton pause masqué.
5. Aucun défilement horizontal à 320 px et à 200 % de zoom.
6. Questions Q1 à Q9 tranchées ou reportées par écrit.
