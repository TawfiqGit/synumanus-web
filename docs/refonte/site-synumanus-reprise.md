# Point de reprise — Refonte du site Synumanus

Sauvegarde du 20/11/2026. À relire en premier à la reprise.

## Où en est-on
| Livrable | Version | Statut |
|---|---|---|
| Fiche projet | v1.1 | Validée |
| B1 Cadrage | v1.0 | Validé le 17/11 |
| B2 Personas, parcours, arborescence | v1.0 | Validé le 17/11 |
| B3 Wireframes | v0.2 | ⛔ En attente de validation TawfiqDev |
| B4 Design system v2 **clair** + prototype HTML + hero animé | v0.4 (specs) | ⛔ À valider — branche `claude/practical-bell-yr0jwk` |
| Journal des décisions | à jour (19/11) | — |

## Ce qui a été produit le 19/11
- Design system v2 (`src/static/v2/`) : synthèse Graphite × Basis Theory × Column (détail dans les specs v0.2).
- 12 pages en v2 : accueil, 3 piliers (nouvelles URLs `/applications-mobiles/`, `/applications-web-metier/`, `/automatisation-ia/`), 4 services, agence, formulaire, 2 pages légales.
- Lot 2 (secteurs, ressources, actus, conseil IA) : ancien design conservé, hors menu, liens dans le footer.
- Contrôles : axe-core 0 violation, pas de défilement horizontal à 375 px, aucune erreur JS.

## Reste à trancher avant G3
1. **TawfiqDev** : valider B3 + la version claire (v0.3).
2. ~~Durées et engagement « Europe »~~ — confirmés le 20/11.
3. **TawfiqDev** (annoncé pour la prochaine requête) : fournir les logos (`/assets/v-dark.png`, `/assets/v-claire.png`) et la photo de la page Agence (`/assets/agence/representant.png`) — absents du dépôt.
4. **Law** : back-end et nouvelles valeurs « Nature du projet », passage à 4 étapes ; mention RGPD du formulaire.
5. **TawfiqDev / Law** : la politique de confidentialité cite « Brevo Meetings » alors que le calendrier est systeme.io — à corriger.

## Prochaines actions
1. Revue visuelle du prototype par TawfiqDev (`python3 build.py && python3 local_server.py`).
2. Ace : recette accessibilité manuelle (lecteurs d'écran, zoom 200 %, appareils réels) + formulaire de bout en bout en mode mock.
3. Dragon : retirer du dépôt les bases SQLite et rapports de test de `var/` (données de prospects potentiellement réelles) et purger l'historique si nécessaire.
