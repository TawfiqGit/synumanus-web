# Specs — Refonte du site Synumanus

## v0.8 — 23/11/2026 — Tendances web 2026, référence galadrim.fr (accueil) — à valider G3
Arbitrages TawfiqDev du 23/11 : quelques sections anthracite ; pas de simulateur de prix (diagnostic + calculateur de temps) ; guide de choix sans IA ; preuves sociales en lot 2 ; 2 démos (CleanPilot, Commerce Connect) ; nouvelle police géométrique.

### Thème (`src/static/v2/theme.css`, chargé après `ds.css`, s'applique à toutes les pages v2)
| Élément | Valeur |
|---|---|
| Police | Plus Jakarta Sans (variable, auto-hébergée, OFL) + JetBrains Mono ; ~92 Ko |
| Fond | papier chaud `#f7f6f2`, bandes `#efede6`, cartes blanches, angles 4 px |
| Sections sombres | anthracite `#232326` (texte `#f4f4f5` 14,6:1, secondaire `#b8b8bf` 8,2:1, accent `#7dd3fc` 10,3:1) |
| Bouton principal | bleu nuit du logo `#003880`, capitales mono ; sur anthracite : bleu ciel + texte `#111113` |
| Repères | pointillés verticaux aux bords du contenu (≥ 768 px), libellés `[ entre crochets ]` |
| Pied de page | anthracite, grand logotype décoratif, « Les Tricolores · Neuilly-sur-Seine » |

### Accueil — structure
1. Hero : accroche XXL, bénéfice, 2 boutons, rubans fluides encadrés ; **3 parcours** (créer une application / automatiser mon activité / moderniser mon logiciel).
2. Solutions en **grille bento** (anthracite), carte « Applications mobiles » avec profondeur légère.
3. **Démos interactives** (onglets ARIA) :
   - **CleanPilot** (services à la personne, application mobile) : planning et affectation, application terrain (consignes, compte rendu), validation (contrôles : intervenant affecté, consignes cochées), administration avec **export CSV** ;
   - **Commerce Connect** (commerce, site web, boutique fictive « Maison Lemoine ») : vitrine mobile-first (avis, horaires, référencement local), commande (retrait, réservation, paiement simulé, créneau), back-office (indicateurs, statuts, catalogue), automatisations (confirmation, relance J+1), **IA optionnelle simulée** (proposition de fiche produit, validation obligatoire du commerçant).
4. **Méthode au défilement** (anthracite) : l'étape au centre de l'écran s'active, barre de progression ; tout est affiché si « réduire les animations ».
5. **Guide de choix** sans IA (3 questions → recommandation + lien service + démo + contact humain) et **calculateur de temps gagné** (hypothèse affichée : 60 %).
6. Engagements et repères chiffrés en bento (expérience du fondateur ; témoignages clients : lot 2).
7. FAQ (5 questions) + **données structurées** `ProfessionalService` et `FAQPage` (JSON-LD).
8. Appel final anthracite.

### Vérifié le 23/11 (Chromium)
axe-core 0 violation sur les 12 pages ; aucun défilement horizontal à 375 px ; aucune erreur JS ; scénarios complets des 2 démos, du guide et du calculateur automatisés et réussis (dont téléchargement CSV).


## v0.7 — 21/11/2026 — Bleu du logo pour le texte ; rubans dans tous les heros — à valider G3
| Changement | Détail |
|---|---|
| `color/accent-text` | `#0369a1` → **`#003880`** (bleu nuit du logo) : 11,5:1 sur blanc, 10,6:1 sur `#f6f6f8` |
| Heros des 3 piliers et 4 services | Rubans fluides interactifs (`hero-flow.js`), une variante par page (`data-flow-seed` 1 à 7) |
| Nouvelle section « Aperçu » sous chaque hero | Reprend l'aperçu d'application de la page (téléphone, fenêtre, flux, fiche, avant/après) avec un titre et une phrase d'explication ; il s'anime quand il entre à l'écran |
| Accessibilité | axe-core : 0 violation sur les 12 pages ; téléphone « avant » de la refonte rendu plus lisible (contraste) |


## v0.6 — 20/11/2026 — Hero de l'accueil : rubans fluides sur dégradé maillé (remplace la sphère v0.5) — à valider G3
Direction choisie par TawfiqDev : « formes organiques et rubans fluides (fluid / mesh gradients) : surfaces lisses, ondulées ou translucides qui évoquent la circulation des données, l'adaptabilité et l'accompagnement sur mesure ».
Fichiers : `src/static/v2/hero-flow.js` (accueil uniquement ; `hero-field.js` supprimé), section « Illustration du hero » de `ds.css`, hero de `src/pages/index.html`.

### Visuel
- **Trois rubans translucides** faits de fines lignes (22 à 30 fils chacun), en diagonale du bas-gauche vers le haut-droite, qui ondulent et se torsadent lentement. Dégradés de bleus Synumanus du `#e0f2fe` au `#0369a1`, bords légèrement plus marqués.
- **Fond en dégradé maillé** : trois halos bleus très doux qui dérivent ; le troisième suit le pointeur.
- Arrivée : les rubans se dessinent de gauche à droite en 1,8 s, dès que l'illustration est visible.
- Fondu sur les bords gauche et droit (pas de coupure nette).

### Interaction
| Geste | Effet |
|---|---|
| Survol à la souris / glisser du doigt | Les fils s'écartent en douceur autour du pointeur (effet de lentille, suivi avec un léger retard) et le halo du fond le rejoint |
| Clic / tap | Une onde traverse les rubans |
| Sortie du pointeur | Les rubans reprennent leur forme |
| Bouton « Mettre en pause » / « Reprendre l'animation » | Fige ou relance tout (`aria-pressed`) |
Le défilement vertical reste possible au doigt.

### Accessibilité et performance
- Animation **continue** : le bouton pause est obligatoire (WCAG 2.2.2) ; il est visible, fait 44 px et a un libellé explicite.
- **Réduire les animations** : image fixe, pas d'interaction animée, bouton masqué.
- **Sans JavaScript** : dégradé maillé statique en CSS.
- Boucle arrêtée en pause, hors écran ou onglet masqué (mesuré : 0 dessin par seconde en pause) ; environ 60 images/s mesurées dans Chromium ; densité réduite sous 520 px ; résolution plafonnée à 1,5×.

### Vérifié le 20/11 (Chromium)
Arrivée, survol, onde au clic, pause/reprise, mobile tactile, mode « réduire les animations » ; axe-core : 0 violation sur les 12 pages ; aucun défilement horizontal ; aucune erreur JS.


## v0.5 — 20/11/2026 — Hero de l'accueil : sphère de points interactive — **remplacée par la v0.6**
Demande TawfiqDev : pas de téléphone, une illustration abstraite animée qui réagit au pointeur (référence citée : ruji.fr, **non consultée** car le site est bloqué par le réseau de l'environnement de travail).
Fichiers : `src/static/v2/hero-field.js` (chargé uniquement sur l'accueil), section « Illustration interactive » de `ds.css`, hero de `src/pages/index.html`.

### Concept
Une **sphère de points en trame** (halftone, bleus Synumanus, ombrée en bas à droite), entourée d'un **anneau de points** incliné et de trois nœuds graphite (les outils connectés). Métaphore : vos données éparses deviennent un outil unique et bien rangé.

### Séquence d'arrivée (≈ 4,3 s, une seule lecture)
| Temps | Événement |
|---|---|
| 0 s | Points éparpillés dans tout le cadre ; étiquette « Données éparses » |
| 0,25 – 1,5 s | Les points rejoignent la sphère, du centre vers le bord, puis l'anneau |
| 1,5 s | L'étiquette devient « Un seul outil, bien rangé » |
| 2,0 – 3,5 s | Pointeur de démonstration : il traverse la sphère, écarte les points et s'y relie par des lignes fines |
| 3,5 s | Onde circulaire depuis le pointeur ; tout se stabilise avant 4,3 s |

Sur mobile, l'illustration est sous la ligne de flottaison : la séquence démarre quand elle devient visible (35 % à l'écran).

### Interaction
| Geste | Effet |
|---|---|
| Survol à la souris / glisser du doigt | Les points à moins de 120 px s'écartent et grossissent ; jusqu'à 16 lignes relient le pointeur aux points proches ; halo autour du pointeur |
| Clic / tap | Onde qui se propage dans la sphère |
| Sortie du pointeur | Les points reviennent en place (ressort amorti) |
| Bouton « Rejouer l'animation » | Relance la séquence d'arrivée |
Le défilement vertical reste possible au doigt (`touch-action: pan-y`).

### Accessibilité et performance
- Canvas décoratif (`aria-hidden`) ; la légende « Illustration interactive — survolez-la / touchez-la » s'adapte au type d'écran (`hover`).
- **WCAG 2.2.2** : la séquence automatique dure moins de 5 s et ne boucle pas ; ensuite, rien ne bouge sans action de l'utilisateur.
- **Réduire les animations** : sphère statique, aucune interaction animée, bouton « Rejouer » masqué.
- **Sans JavaScript** : sphère en trame statique en CSS.
- La boucle de dessin s'arrête dès que tout est immobile, hors écran ou onglet masqué (mesuré : 0 dessin par seconde au repos).

### Vérifié le 20/11 (Chromium)
Séquence capturée image par image ; survol, clic (onde) ; mobile tactile ; mode « réduire les animations » ; axe-core : 0 violation sur les 12 pages ; aucun défilement horizontal ; aucune erreur JS.

### Non traité
Les pages piliers et services gardent leurs aperçus d'applications (décision du 17/11) : **à confirmer par TawfiqDev** s'il faut aussi les remplacer par des illustrations abstraites.


## v0.4 — 20/11/2026 — Animation du hero (demande TawfiqDev) — scénario « téléphone » de l'accueil **remplacé par la v0.5** ; entrée animée des autres pages conservée
Fichiers : `src/static/v2/ds.css` (section « Animation du hero »), `src/static/v2/ds.js`, script court dans `src/templates/base-v2.html`, aperçu de `src/pages/index.html`.

### Accueil — scénario « bon d'intervention » (≈ 4 s, une seule lecture)
| Temps | Événement |
|---|---|
| 0 – 0,8 s | Le texte du hero apparaît par étapes (sur-titre, titre, chapeau, boutons, preuves : 70 ms d'écart, 0,5 s chacun) ; le soulignement « signal » se dessine sous « votre métier » (0,55 → 1,25 s) |
| 0,1 – 1,1 s | Les feuilles techniques se déploient, puis le téléphone monte |
| 0,7 – 1,1 s | Le compteur « À réaliser aujourd'hui » défile de 0 à 6 |
| 1,0 – 1,75 s | Les 3 interventions arrivent une à une |
| 2,0 s | Appui simulé sur « Fuite chaudière » (onde bleue + surlignage) |
| 2,5 s | Le statut passe de « Urgent » à « Signé » ; à 2,7 s le compteur passe de 6 à 5 |
| 2,75 s | L'étiquette « Bon d'intervention signé » apparaît, sa pastille verte pulse deux fois |
| 3,25 – 4,0 s | L'étiquette « Plus de ressaisie » apparaît et le filet de synchronisation se trace |

### Autres pages
Même entrée (texte échelonné, feuilles, appareil, étiquettes, ≈ 1,5 s). Automatisation & IA : les étapes du flux apparaissent une à une. Web & métier et Maintenance : les lignes du tableau apparaissent une à une.

### Règles d'accessibilité
- **WCAG 2.2.2** : la séquence dure moins de 5 s et ne boucle pas ; un bouton « Rejouer l'animation » (hors zone `aria-hidden`, 44 px) permet de la relancer.
- **Réduire les animations** (`prefers-reduced-motion`) : aucune animation, l'état final s'affiche directement, le bouton « Rejouer » est masqué. Même chose si le paramètre change pendant la visite.
- **Sans JavaScript** : l'état final s'affiche (rien n'est masqué).
- L'aperçu reste décoratif (`aria-hidden`) : le compteur et les statuts ne sont pas annoncés aux lecteurs d'écran.
- Pas de flash : l'animation est activée dans le `<head>`, avant le premier rendu.

### Vérifié le 20/11 (Chromium)
Captures image par image de la séquence de l'accueil ; compteur 0 → 6 → 5 ; bouton « Rejouer » opérationnel ; mode « réduire les animations » : état final, bouton masqué ; axe-core : 0 violation sur les 12 pages ; aucun défilement horizontal à 375 px ; aucune erreur JS.


## v0.3 — 20/11/2026 — B4 : passage en **version claire** (décision TawfiqDev du 20/11) — à valider G3
Le thème sombre « Graphite » est abandonné. La base devient le papier blanc de **Basis Theory**, avec le canevas gris très clair de **Column** pour les bandes alternées. De **Graphite**, on ne garde que la structure : header flottant bordé, cadres d'aperçu, rayons 10/8 px. Les gabarits HTML sont inchangés ; seuls les tokens et les composants (`src/static/v2/ds.css`, `project.css`) changent.

### Tokens (remplacent les couleurs de la v0.1/v0.2)
| Token | Valeur | Rôle | Contraste |
|---|---|---|---|
| `color/bg` | `#ffffff` | Canevas, cartes | — |
| `color/bg-alt` | `#f6f6f8` | Bandes alternées (filets de construction), footer, historique du formulaire | — |
| `color/bg-raised` | `#f4f4f5` | Surfaces atténuées | — |
| `color/bg-sky` | `#f0f9ff` | Lavis bleu (bloc CTA, tags, choix sélectionné) | — |
| `color/graphite` | `#27272a` | Blocs de code/données, coques de téléphone, pastilles d'étapes, icônes | — |
| `color/border` · `border-strong` | `#e4e4e7` · `#d4d4d8` | Bordures et filets décoratifs | décoratif |
| `color/border-control` | `#71717a` | Champs, contrôles | 4,83:1 ✅ |
| `color/text` | `#18181b` | Texte principal | 17,7:1 ✅ |
| `color/text-2` | `#52525b` | Texte secondaire | 7,7:1 ✅ |
| `color/accent` | `#7DD3FC` | Aplats : bouton principal, pastilles, filets. **Jamais en texte sur fond clair** (1,5:1) | — |
| `color/accent-text` | `#0369a1` | Mots en accent des titres, liens, états sélectionnés, focus | 5,9:1 ✅ |
| `color/success` · `danger` | `#15803d` · `#b91c1c` | États (toujours avec un texte) | ≥ 5:1 ✅ |
| Bouton principal | fond `#7DD3FC`, texte `#18181b`, liseré `rgba(3,105,161,.35)` | « Échanger sur mon projet » (Basis « aqua conversion button ») | 11,9:1 ✅ |
| Bouton secondaire | fond `#27272a`, texte blanc | Newsletter (Basis « graphite button ») | 14,9:1 ✅ |
| Ombres | piles « Cloud Product Card » de Basis | Cartes, menus, appareils | — |

### Vérifications du 20/11 (Chromium, 1366 et 375 px)
- axe-core 4 (WCAG 2.2 A/AA) : **0 violation** sur les 12 pages v2.
- Aucun défilement horizontal ; aucune erreur JS ; menus et formulaire (étapes 1 → 3) fonctionnels ; WhatsApp masqué pendant la saisie.
- Non vérifié : lecteurs d'écran, zoom 200 %, appareils réels, envoi PHP réel (→ Ace).


## v0.2 — 19/11/2026 — B4 Maquettes et prototype : design system v2 sombre (**remplacé par la v0.3**)
Demande TawfiqDev du 19/11 : « refonte complète en s'inspirant des 3 fichiers de style » (Basis Theory, Column, Graphite).
Implémentation : branche `claude/practical-bell-yr0jwk`, fichiers `src/static/v2/ds.css`, `src/static/v2/ds.js`, `src/static/v2/project.css`, `src/templates/base-v2.html`, `src/partials/header-v2.html`, `footer-v2.html`, `cta-v2.html`. Les pages passent en v2 via `"design": "v2"` dans `src/data/pages.json` ; les pages du lot 2 gardent l'ancien design (décision B2 du 17/11).

### Synthèse des 3 références
| Référence | Ce qui est repris | Ce qui est écarté (et pourquoi) |
|---|---|---|
| **Graphite** (base, décision du 16/11) | Fond `#0a0a0a`, bordures `#262626`, header flottant bordé, cadre d'aperçu produit, boutons clairs/anthracite, rayons 10/8 px | Orange `#ff8833` (remplacé par le bleu `#7DD3FC`, option B) ; écart de 224 px entre sections (128 px) |
| **Basis Theory** | Titres très serrés (−0,035 em), bandeau d'annonce, rangée de preuves sous le hero, **feuilles techniques superposées** derrière les aperçus, **filets de construction**, **bande « papier » claire** pour les sections de lecture, bouton graphite sur papier | Police Neo Grotesk (Inter conservée) ; aqua et lime (une seule couleur d'accent) |
| **Column** | Étiquettes à pastille en mono, **rangée de chiffres** (accent), **bloc de données mono** (règle d'automatisation, fiche de cadrage), densité confortable pour la confiance | Marine et orange (hors identité) ; carte de monde en dégradé |

### Tokens ajoutés à la v0.1
| Token | Valeur | Rôle | Contraste |
|---|---|---|---|
| `color/paper` | `#fafafa` | Fond de la bande papier | — |
| `color/ink` | `#18181b` | Texte sur papier | 16,9:1 ✅ |
| `color/ink-2` | `#3f3f46` | Texte courant sur papier | 9,9:1 ✅ |
| `color/ink-3` | `#52525b` | Texte secondaire sur papier | 7,3:1 ✅ |
| `color/hair` | `#d4d4d8` | Filets et bordures décoratifs sur papier | décoratif |
| `color/hair-control` | `#71717a` | Bordures de contrôle sur papier | 4,6:1 ✅ |
| `color/accent-ink` | `#0369a1` | Accent et liens **sur papier** (`#7DD3FC` y est interdit : 1,5:1) | 5,7:1 ✅ |
| `color/success` / `color/danger` | `#86efac` / `#fca5a5` | États (toujours avec icône ou texte) | ≥ 11:1 ✅ |
| `font/mono` | JetBrains Mono → IBM Plex Mono → mono système | Étiquettes, index, données | — |
| `text/display` | `clamp(40px, …, 60px)` / 500 / 1,0 / −0,035 em | Titres H1 | — |

### Composants
Bandeau d'annonce · header flottant + sous-menu « Solutions » 2 colonnes (piliers / services mobiles) · panneau mobile plein écran · boutons `primary` / `secondary` / `ghost` (44–48 px) · lien fléché · étiquette à pastille · tag · rangée de preuves · fil d'Ariane · aperçus fictifs (téléphone, fenêtre web, flux d'automatisation, avant/après, bloc de données) sur feuilles superposées · carte (simple, cliquable entière, mise en avant) · grille piliers 1 + 2 · frise « méthode » numérotée avec filet de signal · rangée de chiffres · FAQ (`details`) · bloc CTA de fin (partiel unique) · footer 5 colonnes + newsletter · formulaire projet restylé (HTML et `project.js` inchangés).

### Vérifications effectuées le 19/11 (rendu réel Chromium, 1366 px et 375 px)
- axe-core 4 (WCAG 2.0/2.1/2.2 A et AA) : **0 violation** sur les 12 pages v2.
- Aucun défilement horizontal à 375 px ; aucune erreur JavaScript.
- Menus : Échap ferme et rend le focus ; panneau mobile `inert` quand fermé ; libellé « Ouvrir / Fermer le menu ».
- Formulaire : navigation étapes 1 → 3 OK ; bouton WhatsApp masqué pendant la saisie.
- **Non vérifié** : lecteurs d'écran (NVDA, VoiceOver, TalkBack), zoom 200 %, appareils réels, envoi réel (PHP non lancé). → Ace.


## v0.1 — 17/11/2026 — Proposition de base de design tokens (anticipation de B4, **non validée**)
Ces tokens sont posés en avance pour que B3 (wireframes) et B4 (maquettes) partent de la même base. Ils seront confirmés en B4.
Contrastes **calculés** (formule WCAG 2.x) : pas encore vérifiés dans un rendu réel.

### Couleurs
| Token | Valeur | Rôle | Contraste sur `#0a0a0a` |
|---|---|---|---|
| `color/bg/canvas` | `#0a0a0a` | Fond de page, footer, intérieur des cartes | — |
| `color/bg/deep` | `#000000` | Fondus de médias, overlays | — |
| `color/bg/raised` | `#171717` | Bandeau, contrôles compacts | — |
| `color/border/default` | `#262626` | Bordures de modules, séparateurs (décoratif) | 1,4:1 (décoratif uniquement) |
| `color/border/control` | `#737373` | Bordures de champs, contrôle sélectionné | 4,18:1 ✅ (≥ 3:1) |
| `color/text/primary` | `#fafafa` | Titres, texte fort | 18,97:1 ✅ |
| `color/text/secondary` | `#a1a1a1` | Texte courant secondaire, navigation | 7,66:1 ✅ (6,94 sur `#171717`, 5,86 sur `#262626`) |
| `color/accent` | `#7DD3FC` | Liens en ligne, mots en accent dans les titres, focus | 11,87:1 ✅ |
| `color/accent/strong` | `#1D8CFF` | Fin du dégradé, icônes d'accent | 5,89:1 ✅ (4,50 sur `#262626`, à la limite) |
| `color/cta/bg` | `#e5e5e5` | Bouton principal « Échanger sur mon projet » | texte `#171717` : 14,23:1 ✅ |
| `color/cta2/bg` | `#262626` | Bouton secondaire | texte `#fafafa` : 14,50:1 ✅ |
| `gradient/signal` | `linear-gradient(90deg, #7DD3FC, #fafafa 40%, #1D8CFF)` | Filets décoratifs uniquement | — |

**Interdits :** `#737373` et `#464646` en texte ; `#075FDB` sur fond sombre (3,46:1) ; l'information portée par la seule couleur.

### Typographie (Inter, ligatures désactivées)
| Token | Taille / graisse / interligne | Usage |
|---|---|---|
| `text/display` | 60 px / 500 / 1,0 / −1,5 px (mobile : 40 px / 1,05 / −1 px) | Titre du hero uniquement |
| `text/section` | 36 px / 500 / 1,11 (mobile : 28 px) | Titres de section |
| `text/feature` | 24 px / 600 / 1,25 | Titres de carte |
| `text/subheading` | 20 px / 500 / 1,4 | Chapeaux |
| `text/body` | 16 px / 400 / 1,6 | Texte courant (≥ 16 px sur mobile) |
| `text/control` | 14 px / 500 / 1,43 | Navigation, boutons (desktop) ; 16 px sur mobile |
| `text/caption` | 12 px / 400 / 1,5 | Mentions ; minimum absolu, couleur `text/secondary` au moins |

### Espacements, rayons, élévations
- **Base :** 8 px — échelle 8 · 16 · 24 · 32 · 48 · 64 · 72 · 128. Écart entre sections : 128 px en desktop, 72 px en mobile (au lieu de 224 px, trop long pour la cible).
- **Largeur max :** 1152 px.
- **Rayons :** cartes, médias et champs 10 px ; boutons 8 px ; pastilles 9999 px.
- **Ombres :** `shadow/sm` `rgba(0,0,0,.25) 0 4px 4px` ; `shadow/frame` (cadre d'aperçu) `inset 0 0 2px 2px rgba(101,129,128,.15), inset 0 0 4px 4px rgba(32,47,46,.15)`.
- **Focus :** contour 2 px `#7DD3FC`, décalé de 2 px, sur tous les éléments interactifs.
- **Cibles tactiles :** 44 × 44 px minimum.

### Composants de base (à détailler en B4)
Barre de navigation flottante bordée (5 entrées max) · bouton principal clair · bouton secondaire anthracite · lien bleu avec flèche · carte de fonctionnalité bordée · cadre d'aperçu d'application · champ de formulaire (bordure `#737373`, erreur signalée par une icône et un texte, pas seulement par la couleur) · accordéon FAQ · bouton WhatsApp flottant.
