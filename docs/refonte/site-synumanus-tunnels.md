# Tunnels de conversion — newsletter et campagne « Diagnostic automatisation »

Version 1.0 — 23/11/2026 — Lili (parcours), Law (développement, systeme.io), Dragon (publication), Ace (recette).
Statut : **construit et testé en pré-production, non publié**. Publication et activation dans systeme.io après validation de TawfiqDev.

---

## 1. Tunnel newsletter

| Étape | Page / outil | Rôle | Mesure |
|---|---|---|---|
| 1. Arrivée | Pied de page de toutes les pages, `/newsletter/` (indexée, dans le sitemap), lien « Newsletter » du pied de page, fin de la page de campagne | Promesse : un conseil concret par mois | Visites de `/newsletter/` |
| 2. Inscription | Formulaire e-mail + consentement obligatoire (AC-12.1) → `api/newsletter.php` → contact systeme.io + étiquette `newsletter` (id 2312383) | Recueillir un consentement explicite | Taux d'inscription = inscriptions / visites |
| 3. Confirmation | `/newsletter/merci/` (noindex) : prévenir de l'e-mail de bienvenue + 3 chemins (guide, démos, échange) | Garder l'élan | Clics vers démos / formulaire |
| 4. Bienvenue | Campagne systeme.io « Bienvenue newsletter » (3 e-mails, ci-dessous) | Créer la relation, amener vers le diagnostic | Ouvertures, clics, désinscriptions |
| 5. Édition mensuelle | Newsletter systeme.io aux contacts `newsletter` (contenu : Azim) | Fidéliser | Ouvertures, clics, réponses |

Source transmise au serveur : `page-newsletter` ou `pied-de-page` (champ `source`).

### Séquence de bienvenue (à valider, puis activer)

**E-mail 1 — immédiat**
- Objet : Bienvenue : votre premier conseil en 2 minutes
- Aperçu : Ce que vous allez recevoir, et une première astuce à tester cette semaine.
- Texte :
  > Bonjour,
  >
  > Merci pour votre inscription. Chaque mois, vous recevrez un e-mail court : un cas concret, une méthode et une checklist, à lire en 5 minutes.
  >
  > Premier conseil, la **règle des trois répétitions** : si une personne de votre équipe copie les mêmes informations d'un outil à l'autre plus de trois fois par semaine, cette tâche est très probablement automatisable. Notez-en une cette semaine : on en reparle dans quelques jours.
  >
  > À bientôt,
  > Synumanus

**E-mail 2 — 3 jours après**
- Objet : 5 signes qu'une tâche peut être automatisée
- Aperçu : La checklist à passer en dix minutes avec votre équipe.
- Texte :
  > Bonjour,
  >
  > Voici la checklist promise. Une tâche est un bon candidat à l'automatisation si :
  > 1. elle revient chaque semaine ;
  > 2. elle suit toujours les mêmes étapes ;
  > 3. elle consiste à recopier ou déplacer des informations ;
  > 4. elle dépend d'un rappel (« penser à relancer… ») ;
  > 5. une erreur de saisie coûte cher.
  >
  > Trois « oui » ou plus ? Vous tenez probablement une à deux heures gagnées par semaine.
  >
  > Synumanus

**E-mail 3 — 7 jours après**
- Objet : Et si on regardait votre cas ?
- Aperçu : 30 minutes pour repérer trois tâches à automatiser, gratuitement.
- Texte :
  > Bonjour,
  >
  > Si la checklist vous a fait penser à une ou deux tâches, nous pouvons les regarder ensemble : un diagnostic de 30 minutes, gratuit et sans engagement, avec un compte rendu écrit sous 48 heures.
  >
  > [Réserver mon diagnostic](https://www.synumanus.fr/campagne/diagnostic-automatisation/?utm_source=newsletter&utm_medium=email&utm_campaign=bienvenue)
  >
  > Sinon, rendez-vous le mois prochain pour la prochaine édition.
  >
  > Synumanus

Le lien de désinscription est ajouté par systeme.io à chaque e-mail.

---

## 2. Tunnel de campagne « Diagnostic automatisation »

Offre (Lili, à valider par TawfiqDev) : **diagnostic de 30 minutes offert**, trois tâches à automatiser, estimation du temps gagné, solution adaptée, **compte rendu écrit sous 48 heures**. Elle s'appuie sur l'échange gratuit de 30 minutes déjà proposé ; le compte rendu sous 48 h est un engagement nouveau.

| Étape | Page / outil | Rôle | Mesure |
|---|---|---|---|
| 1. Annonce | LinkedIn (posts d'Azim, publicité éventuelle), newsletter (e-mail 3), e-mail direct | Attirer avec une question chiffrée | Clics |
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
| Newsletter | `…?utm_source=newsletter&utm_medium=email&utm_campaign=bienvenue` |

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
4. **systeme.io — bienvenue** : activer les 3 étapes de la campagne « Bienvenue newsletter » (n° 1240869, étapes 6332143 / 6332144 / 6332145, **créées inactives le 23/11**, aucune règle associée) (délais 0, 3 et 7 jours), puis créer la règle « étiquette `newsletter` ajoutée → inscrire à la campagne ».
5. **Test de bout en bout** avec une adresse interne, puis suppression du contact de test.

## 4. Indicateurs à suivre (Plausible, dès son installation par Dragon)

Visites des pages d'arrivée, clics vers le formulaire, demandes envoyées (par source), réservations, inscriptions newsletter. Objectifs de départ à fixer après 4 semaines de données réelles.
