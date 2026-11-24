# Livraison à valider — tunnels, site complet en v2, durcissement (23-24/11/2026)

Pré-production : **https://preprod.synumanus.fr** (non indexée, mode simulé : aucun contact ni e-mail réel). Rien n'est publié sur `www.synumanus.fr` ni activé dans systeme.io avant validation de TawfiqDev.

## Livré

| Équipe | Livrable |
|---|---|
| Lili + Law | Tunnel newsletter : `/newsletter/` → inscription (consentement) → `/newsletter/merci/` ; envoi mensuel depuis systeme.io › Newsletters (édition n° 1 en brouillon, n° 5644786) — **validé le 24/11** |
| Lili + Law | Tunnel de campagne « Diagnostic automatisation » : `/campagne/diagnostic-automatisation/` (offre, calculateur, déroulé, preuves, FAQ) → formulaire pré-rempli avec suivi UTM → calendrier → `/campagne/diagnostic-automatisation/merci/` ; page générale `/rendez-vous-confirme/` |
| Lili + Law | Les 7 pages restantes passées au design v2 (Industrie, Finance & assurance, Santé, Conseil IA, Radar, Générateur, Actus) : **les 21 pages du site sont en v2** ; 8 anciennes feuilles CSS supprimées |
| Dragon | CSP stricte générée au build (sans `unsafe-inline`), HSTS, procédure de mise en production (`site-synumanus-mise-en-production.md`) |
| Ace | Recette (ci-dessous) |

## Recette

| Contrôle | Résultat |
|---|---|
| Recette automatique pré-production (404 réel, non-indexation, calendrier de test, 20 URL) | 30/30 |
| Tunnels de bout en bout (local, simulé) | 15/15, trois fois de suite |
| Tunnels en pré-production (en-têtes Apache réels) | newsletter → merci ; campagne → source UTM transmise → calendrier de test ; 0 violation CSP ; 0 erreur JS |
| Formulaire (lots 1-2) / calendrier simulé (C1) | 36/36 / 10/10 |
| Accessibilité axe-core (WCAG 2.2 AA) | 0 violation sur les 25 pages |
| Mobile 390 px | aucun débordement |
| Performance Lighthouse mobile | newsletter 99, campagne 100, industrie 98 (LCP 1,6 s, CLS 0) |
| Screaming Frog (version de production) | 39 URL en 200, 0 titre/description/H1/canonical manquant ou en double, 0 erreur 4xx |
| Tests unitaires et API | OK |

## À valider par TawfiqDev

1. ~~L'offre de campagne~~ — **validée le 24/11** : tunnel conservé, **sans engagement de compte rendu écrit**.
2. ~~Les 3 e-mails de bienvenue~~ — remplacés le 24/11 par une newsletter mensuelle (décision TawfiqDev), tunnel newsletter validé.
3. ~~Les 7 pages migrées~~ — **validées le 24/11**.
4. **La publication** : suivre `site-synumanus-mise-en-production.md` (préalables : téléphone de l'hébergeur, `.env` de production, réception de l'e-mail du formulaire).
