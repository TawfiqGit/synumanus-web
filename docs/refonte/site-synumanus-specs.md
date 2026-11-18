# Specs — Refonte du site Synumanus

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
