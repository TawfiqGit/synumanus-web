# Point de reprise — Refonte du site Synumanus

Sauvegarde du 23/11/2026. À relire en premier à la reprise.

## Où en est-on
| Livrable | Version | Statut |
|---|---|---|
| Fiche projet | v1.2 | Validée |
| B1 Cadrage | v1.0 | Validé le 17/11 |
| B2 Personas, parcours, arborescence | v1.0 | Validé le 17/11 |
| B3 Wireframes | v0.2 (+ écarts tracés au journal) | **Validé le 23/11 — gate G3** |
| B4 Design system v2 + prototype HTML | v0.9 (specs) | **Validé le 23/11 — gate G3** |
| B5 Handoff développeurs | v1.0 (`site-synumanus-b5-handoff.md`) | Livré le 23/11 — en revue (Law, Ace) |
| B6 Préparation de la recette | — | À faire (Lili, testabilité vérifiée par Ace) |

Prototype : branche `claude/practical-bell-yr0jwk` (`python3 build.py && python3 local_server.py`). 12 pages en v2 ; lot 2 (secteurs, ressources, actus, conseil IA) encore dans l'ancien design.

## Reste ouvert
1. **Law** : back-end du formulaire (nouvelles valeurs « Nature du projet », passage à 4 étapes) ; mention RGPD du formulaire.
2. **TawfiqDev / Law** : la politique de confidentialité cite « Brevo Meetings » alors que le calendrier est systeme.io.
3. **TawfiqDev** : adresse exacte des Tricolores à afficher ; logo SVG (souhaitable, non bloquant).
4. **Dragon** (urgent) : données de prospects versionnées dans `var/` — tâche ClickUp ouverte.
5. **Lot 2** : preuves sociales (applications en cours, références en attente), assistant IA, restylage des pages du lot 2.
6. **Shanks** : planning après élargissement du périmètre (tendances 2026, démos).

## Prochaines actions
1. Lili : B6 (critères Gherkin, checklist UX/accessibilité, protocole de test utilisateur).
2. Ace : vérifie la testabilité des critères B6, puis recette manuelle (clavier, lecteurs d'écran, zoom 200 %, appareils réels).
3. Law : passage du prototype en version de production (nettoyage CSS hérité, images WebP, formulaire), MR vers `main`.
4. Dragon : Plausible, `var/`, préparation Hostinger.
