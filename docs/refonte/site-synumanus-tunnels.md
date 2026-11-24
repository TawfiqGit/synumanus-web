# Tunnels de conversion — newsletter et campagne « Diagnostic automatisation »

Version 1.0 — 23/11/2026 — Lili (parcours), Law (développement, systeme.io), Dragon (publication), Ace (recette).
Statut : **construit et testé en pré-production, non publié**. Publication et activation dans systeme.io après validation de TawfiqDev.

---

## 1. Tunnel newsletter — **validé par TawfiqDev le 24/11/2026**

Définition (TawfiqDev) : la newsletter est **un message envoyé régulièrement à des personnes abonnées** pour partager des actualités, des conseils ou des offres. Dans systeme.io, elle relève de la rubrique **Newsletters** (envoi groupé aux contacts de l'étiquette `newsletter`), et non des **campagnes** (suites d'e-mails automatiques déclenchées à l'inscription).

| Étape | Page / outil | Rôle | Mesure |
|---|---|---|---|
| 1. Arrivée | Pied de page de toutes les pages, `/newsletter/` (indexée, dans le sitemap), lien « Newsletter » du pied de page | Promesse : actualités, conseils et offres, une fois par mois | Visites de `/newsletter/` |
| 2. Inscription | Formulaire e-mail + consentement obligatoire (AC-12.1) → `api/newsletter.php` → contact systeme.io + étiquette `newsletter` (id 2312383) | Recueillir un consentement explicite | Taux d'inscription = inscriptions / visites |
| 3. Confirmation | `/newsletter/merci/` (noindex) : la prochaine édition arrivera dès sa parution + 3 chemins (guide, démos, échange) | Garder l'élan | Clics vers démos / formulaire |
| 4. Envoi mensuel | systeme.io › Newsletters : une édition par mois, audience = étiquette `newsletter` (contenu : Azim, validation : TawfiqDev) | Informer, conseiller, proposer une offre | Ouvertures, clics, désinscriptions |

Aucun e-mail automatique n'est envoyé à l'inscription.

Source transmise au serveur : `page-newsletter` ou `pied-de-page` (champ `source`).

### Édition n° 1 (brouillon dans systeme.io)

- Newsletter systeme.io n° **5644786**, audience : étiquette `newsletter`, **non envoyée, non programmée** (créée le 24/11/2026).
- Objet : Newsletter Synumanus n° 1 — La règle des trois répétitions
- Rubriques : le conseil du mois (règle des trois répétitions) ; la checklist « 5 signes qu'une tâche peut être automatisée » ; l'actualité Synumanus (**à compléter avant l'envoi**) ; l'offre : premier échange de 30 minutes, gratuit (lien avec `utm_source=newsletter&utm_campaign=edition-1`).
- Un autre brouillon « Actus » (n° 5290419), antérieur, existe dans le compte : non modifié.
- La campagne « Bienvenue newsletter » créée le 23/11 (n° 1240869) a été **supprimée** le 24/11 : elle confondait newsletter et suite automatique. Elle était inactive, aucun e-mail n'est parti.

---

## 2. Tunnel de campagne « Diagnostic automatisation »

Offre (Lili, à valider par TawfiqDev) : **diagnostic de 30 minutes offert**, trois tâches à automatiser, estimation du temps gagné, solution adaptée, **compte rendu écrit sous 48 heures**. Elle s'appuie sur l'échange gratuit de 30 minutes déjà proposé ; le compte rendu sous 48 h est un engagement nouveau.

| Étape | Page / outil | Rôle | Mesure |
|---|---|---|---|
| 1. Annonce | LinkedIn (posts d'Azim, publicité éventuelle), newsletter mensuelle, e-mail direct | Attirer avec une question chiffrée | Clics |
| 2. Page d'arrivée | `/campagne/diagnostic-automatisation/` (noindex, hors sitemap) : offre, symptômes, calculateur, déroulé, preuves, FAQ | Convaincre, faire estimer son temps perdu | Taux de clic vers le formulaire |
| 3. Qualification | `/demarrer-un-projet/?campagne=diagnostic-automatisation` : besoin pré-coché « Automatisation ou IA », source envoyée au serveur | Qualifier en 2 minutes | Taux de remplissage |
| 4. Réservation | Calendrier systeme.io (étape 4) | Fixer le rendez-vous | Taux de réservation |
| 5. Remerciement | `/campagne/diagnostic-automatisation/merci/` (noindex) : 4 étapes jusqu'au compte rendu | Réduire les absences | Présence au rendez-vous |
| 6. Relance | Campagne systeme.io existante « Relance Projet » si pas de réservation (mécanisme actuel, inchangé) | Récupérer les hésitants | Réservations après relance |

### Liens à utiliser (convention UTM)

| Canal | Adresse |
|---|---|
| Post LinkedIn | `https://www.synumanus.fr/campagne/diagnostic-automatisation/?utm_source=linkedin&utm_medium=social&utm_campaign=diagnostic` |
| Publicité LinkedIn | `…?utm_source=linkedin&utm_medium=paid&utm_campaign=diagnostic&utm_content=<visuel>` |
| Newsletter | `…?utm_source=newsletter&utm_medium=email&utm_campaign=edition-<n>` |

La source arrive dans l'e-mail interne (« Source : formulaire Démarrer un projet — campagne=diagnostic-automatisation; utm_source=linkedin; … ») et dans la base des demandes. Elle n'est pas envoyée à systeme.io (aucun champ à créer).

### Sécurité et données
- Liste fermée de campagnes dans `project.js` : une campagne inconnue est ignorée, aucune redirection vers une adresse reçue dans l'URL.
- Paramètres UTM nettoyés (lettres, chiffres, `_ . -`, 40 caractères) ; champ `source` revalidé par le serveur (200 caractères, caractères sûrs).
- Aucune nouvelle donnée personnelle collectée.

---

## 3. Activation après validation (ordre à suivre)

1. **Publication du site** (Dragon) : build de production, envoi, purge du cache, recette de production.
2. **Serveur** : `SYSTEMEIO_NEWSLETTER_TAG_ID=2312383` dans le `.env` privé de production.
3. **systeme.io — calendriers** : réglage « Thank You » des pages calendrier → `https://www.synumanus.fr/demarrer-un-projet/?booking=confirmed` (le site oriente ensuite vers la bonne page de remerciement).
4. **systeme.io — newsletter** : compléter l'actualité de l'édition n° 1 (n° 5644786), la relire, puis l'envoyer ou la programmer depuis systeme.io › Newsletters (décision TawfiqDev).
5. **Test de bout en bout** avec une adresse interne, puis suppression du contact de test.

## 4. Indicateurs à suivre (Plausible, dès son installation par Dragon)

Visites des pages d'arrivée, clics vers le formulaire, demandes envoyées (par source), réservations, inscriptions newsletter. Objectifs de départ à fixer après 4 semaines de données réelles.
