# Point de reprise — Refonte du site Synumanus

Sauvegarde du 17/11/2026 (fin de session). À relire en premier à la reprise.

## Où en est-on
| Livrable | Version | Statut |
|---|---|---|
| Fiche projet | v1.1 | Validée |
| B1 Cadrage | v1.0 | Validé le 17/11 (outil d'audience : Plausible) |
| B2 Personas, parcours, arborescence | v1.0 | Validé le 17/11 |
| B3 Wireframes | v0.2 | ⛔ En attente de validation TawfiqDev |
| Specs (tokens proposés) | v0.1 | Proposition, à confirmer en B4 |
| Journal des décisions | à jour | — |

Décisions clés du 17/11 : direction Graphite option B (accent `#7DD3FC`, Inter) ; hero de la refonte = fond `#0a0a0a` + aperçu d'app fictive (option B), la photo plein fond reste seulement sur le site actuel (`fix/05`) ; « Méthode » = section de l'accueil `/#methode` ; pages du lot 2 hors menu, URLs conservées ; formulaire en 4 étapes à explorer ; bouton WhatsApp masqué pendant la saisie du formulaire.

## Reste à trancher avant de valider B3
1. **TawfiqDev** : garder les fourchettes de budget du formulaire telles quelles ?
2. **Law** : le back-end PHP accepte-t-il les nouvelles valeurs de « Nature du projet » et le passage de 5 à 4 étapes (suivi d'étapes, relance systeme.io) ?
3. **Law + TawfiqDev** : texte de la mention RGPD (absente du formulaire actuel).
4. **TawfiqDev** : confirmer que le bouton WhatsApp réapparaît à l'étape créneau et en cas d'erreur.

## Prochaines actions
1. Valider B3 → Lili lance B4 (maquettes, composants, aperçus d'apps), ou prototype HTML des wireframes si demandé.
2. Site actuel, branche `fix/05-maintenance` (rien n'est commité) : Law convertit les photos de hero en WebP, `chmod 644` sur `developpement-hero-photo.png` et `tma-hero.png`, ajoute `dist/` et `.claude/` au `.gitignore`, puis commit + MR vers `main`.
3. Dragon : installer Plausible sur le site actuel (4 semaines de mesure de référence).
4. Ace : stratégie de test (un seul test est exécuté aujourd'hui).

## Suivi ClickUp — dossier « PRJ — Site web Synumanus »
- Sprint 1 — Reprise fix/05 : revue UX des heros (in review), commit + MR fix/05 (Open), QA 16 pages (Open).
- Product Backlog (mis à jour le 17/11) : B1 et B2 → Closed ; B3 wireframes → in review ; Plausible (choix fait, installation à faire) ; stratégie de test (Ace) ; mentions légales.
