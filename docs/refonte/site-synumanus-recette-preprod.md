# Recette en pré-production — résultats (Ace, 23/11/2026)

Pré-production : `https://preprod.synumanus.fr` (mode simulé, non indexable, calendrier de test `studio.synumanus.fr/recette-calendar`, événement systeme.io 50250). Version : CSS/JS versionnés par empreinte (commit 9ea2f90).

## 1. Contrôles automatiques (`tests/recette-preprod.cjs`) — 29/29

| Critère | Résultat |
|---|---|
| AC-16.1 vrai code 404 (adresse inconnue, avec et sans `/`) | ✅ 404 + page 404 du site |
| Pré-production non indexable (`X-Robots-Tag`, `robots.txt`) | ✅ |
| C1 jamais le vrai calendrier ; page de test sur l'événement 50250 | ✅ |
| AC-18.1 les 19 URL du sitemap (200, 0 erreur JS, 0 ressource manquante) | ✅ |
| AC-11.6 calendrier de test chargé | ✅ |

Formulaire (lots 1-2) : 36/36. Formulaire de bout en bout jusqu'au calendrier de test (données fictives, mode simulé) : ✅. Accessibilité axe-core : 0 violation sur 13 pages.

## 2. Performance P01 — Lighthouse 12.8.2, mobile, 3 passages, médiane

| Page | Score | LCP (< 2,5 s) | CLS (< 0,1) | TBT (< 200 ms) | FCP |
|---|---|---|---|---|---|
| `/` | 99 | 1,57 s ✅ | 0 ✅ | 90 ms ✅ | 0,93 s |
| `/applications-mobiles/` | 99 | 1,47 s ✅ | 0 ✅ | 36 ms ✅ | 0,93 s |
| `/demarrer-un-projet/` | 100 | 1,35 s ✅ | 0 ✅ | 26 ms ✅ | 0,93 s |

À surveiller : sur l'accueil, `hero-flow.js` (rubans animés) représente l'essentiel du travail JavaScript (~0,5 s de script en mobile simulé) ; le TBT varie de 28 à 102 ms selon le passage. L'INP ne se mesure qu'avec de vrais visiteurs (après mise en ligne).

## 3. Référencement — Screaming Frog SEO Spider 25.1 (version gratuite)

Exploration de la **version de production** servie en local (la pré-production interdit les robots, volontairement).

| Contrôle | Résultat |
|---|---|
| URL internes | 44, toutes en 200 (19 pages) |
| Titres manquants / en double | 0 / 0 |
| Descriptions manquantes / en double | 0 / 0 |
| H1 manquants / en double / multiples | 0 / 0 / 0 |
| Canonicals manquants | 0 |
| Erreurs 4xx | uniquement vers `www.synumanus.fr` (canonicals, image de partage) : **site de production hors ligne, décision CEO** ; les fichiers existent dans le build. À revérifier après la mise en ligne |
| « Images sans texte alternatif » | logo décoratif à côté du mot « synumanus » (`alt=""` volontaire, conforme WCAG) : pas d'anomalie |

## 4. Envoi réel du formulaire (autorisé par TawfiqDev le 23/11/2026)

Pré-production passée en mode réel le temps du test (`SYNUMANUS_LOCAL_MOCK=0`), puis remise en mode simulé (vérifié : l'API répond de nouveau 422 en GET). Données fictives uniquement.

| Contrôle | Résultat |
|---|---|
| AC-11.7 champ anti-robot rempli | ✅ réponse `ok` sans enregistrement ni e-mail |
| AC-11.7 double clic sur « Envoyer » | ✅ une seule requête |
| Réponse du serveur en mode réel | ✅ 200, `ok`, ni rendez-vous ni relance |
| Étape 4/4 avec le calendrier de test | ✅ |
| Erreurs JavaScript | ✅ 0 |
| Contact créé dans systeme.io (`ace-recette@` et `robot@example.invalid`) | ✅ aucun (la synchronisation n'a lieu que dans le processus de relance, absent de la pré-production) |
| **E-mail interne reçu sur contact@synumanus.fr** (objet « Nouvelle demande projet — Ace Recette — TEST RECETTE — à ignorer ») | ⏳ **à confirmer par TawfiqDev** (boîte de réception inaccessible à Ace) |

La demande de test reste dans la base de la pré-production (`public_html/preprod/var/`, inaccessible depuis le web) ; elle disparaîtra avec la pré-production.

## 5. Restent avant le bilan G4

- Contrôles humains : NVDA, VoiceOver, iPhone et Android réels (TawfiqDev).
- Envoi réel du formulaire en pré-production (accord TawfiqDev requis : crée un contact systeme.io).
- Après mise en ligne : nouvelle exploration Screaming Frog sur `www.synumanus.fr`, INP réel.
