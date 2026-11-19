# Specs — Refonte du site Synumanus

## v0.2 — 19/11/2026 — B4 Maquettes et prototype : design system v2 + prototype HTML (**à valider, gate G3**)
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
