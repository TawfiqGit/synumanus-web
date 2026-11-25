# Mise en production — procédure (Dragon)

Version 1.0 — 23/11/2026. **À exécuter uniquement après validation de TawfiqDev (gate G4).**
État actuel : production hors ligne (décision CEO), pré-production `https://preprod.synumanus.fr` validée.

## 1. Préalables (bloquants)

| # | Point | Responsable |
|---|---|---|
| P1 | ~~Validation CEO du site, des tunnels et de l'offre « Diagnostic »~~ — validés le 24/11 (offre sans compte rendu écrit) ; reste le feu vert de publication | TawfiqDev |
| P2 | ~~Téléphone de l'hébergeur dans les mentions légales~~ — fait le 25/11 (+370 645 03378) | TawfiqDev → Law |
| P3 | ~~Réception de l'e-mail interne du formulaire~~ — confirmée le 25/11 | TawfiqDev |
| P4 | ~~`.env` privé de production~~ — recréé le 25/11, lu par le serveur (inscription newsletter de test réussie) | TawfiqDev |
| P5 | ~~Données de prospects retirées de `var/`~~ — retirées du suivi Git le 25/11 (restent dans l'historique) | Dragon |

Contenu du `.env` de production (valeurs secrètes saisies par TawfiqDev, jamais dans le dépôt ni dans une conversation) :

```
SYNUMANUS_LOCAL_MOCK=0
SYSTEMEIO_API_KEY=<clé systeme.io>
SYSTEMEIO_NEWSLETTER_TAG_ID=2312383
SYNUMANUS_PROJECT_RECIPIENT=contact@synumanus.fr
SYNUMANUS_PROJECT_FROM=site@synumanus.fr
```

## 2. Déploiement

1. `python3 build.py` (configuration de production : vrai calendrier, indexation autorisée, CSS/JS versionnés, CSP générée).
2. Contrôles locaux : `python3 -m unittest test_build_security.py`, recette locale (axe, AC-18, tunnels).
3. Envoi : `scripts/hostinger-upload.py <auth> dist .` (jeton `hosting_files_generate-upload-url`, temporaire). Les fichiers sont envoyés un par un : rien d'autre n'est effacé (ne **pas** utiliser « deploy static archive », qui écrase le site).
4. Supprimer `public_html/.DS_Store` (fichier parasite) et vérifier qu'aucun fichier de la pré-production n'est servi par erreur sous `www`.
5. Purger le cache : `hosting_cache_clear` sur `synumanus.fr`.

## 3. Après l'envoi

1. Recette de production : `node tests/recette-preprod.cjs https://www.synumanus.fr` — attendus : vrai 404, 20 URL du sitemap en 200 ; le contrôle « non indexable » doit **échouer** en production (c'est normal : la production doit être indexée).
2. En-têtes : `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` présents ; console du navigateur sans violation CSP.
3. Tâche planifiée des relances (README §worker) : déposer `scripts/project-reminders.php` dans `domains/synumanus.fr/scripts/` (hors `public_html`), lancer une fois `php scripts/project-reminders.php --check`, puis créer la tâche **chaque minute** (connecteur : `hosting_cron-jobs_create`, utilisateur `u473285295`) : `* * * * * cd ~/domains/synumanus.fr && /usr/bin/php scripts/project-reminders.php` (sans redirection, refusée par le connecteur).
4. systeme.io : redirection « Thank You » des pages calendrier → `https://www.synumanus.fr/demarrer-un-projet/?booking=confirmed` ; newsletter : première édition (brouillon n° 5644786) à compléter puis envoyer depuis systeme.io › Newsletters (voir `site-synumanus-tunnels.md`).
5. Test réel de bout en bout avec une adresse interne (formulaire, réservation sur le calendrier, newsletter), puis suppression des contacts de test.
6. Google Search Console : soumettre `https://www.synumanus.fr/sitemap.xml`. Nouvelle exploration Screaming Frog sur la production.

## 4. Retour arrière

La production étant vide aujourd'hui, le retour arrière consiste à remettre `public_html` dans son état actuel (`.htaccess` seul) : conserver une copie de l'`.htaccess` de production (relu le 23/11/2026, repris dans `src/static/.htaccess`). Pour les versions suivantes : sauvegarde Hostinger du jour avant tout envoi.

## 5. Sécurité en place

- CSP stricte générée au build : aucun `'unsafe-inline'`, scripts en ligne autorisés par empreinte SHA-256, cadres limités à `studio.synumanus.fr`, appels réseau limités au site. Vérifiée sans violation sur les 25 pages et les parcours (23/11).
- HSTS 1 an (sans sous-domaines, pour rester réversible), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Fichiers cachés refusés (`.env`, `.git`…), listing des dossiers désactivé.
- Jetons et clés : jamais dans le dépôt ; clé systeme.io côté serveur uniquement.

## 6. État au 25/11/2026 (publication)

| Étape | État |
|---|---|
| Site publié sur `https://www.synumanus.fr` (67 fichiers), cache purgé | ✅ |
| Redirections : `http` → `https`, `synumanus.fr` → `www`, `/form/` → formulaire | ✅ |
| En-têtes de sécurité (CSP, HSTS, X-Frame-Options, nosniff), fichiers cachés refusés | ✅ |
| Recette production 25/28 (3 écarts attendus : site indexable, vrai calendrier) ; Lighthouse 100/100/100/100 ; Screaming Frog 0 anomalie | ✅ |
| Script des relances déposé dans `domains/synumanus.fr/scripts/` | ✅ |
| `.env` de production | ✅ recréé et lu (newsletter testée en production, contact de test supprimé) |
| Tâche planifiée des relances | ⏳ après le `.env` |
| systeme.io : redirection « Thank You » des pages calendrier | ⏳ TawfiqDev (interface systeme.io) |
| Google Search Console : sitemap | ⏳ TawfiqDev |
