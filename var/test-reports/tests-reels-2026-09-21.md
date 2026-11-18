# Tests avec API Systeme.io réelle — 21 septembre 2026

Contact autorisé : tawfiq.m@hotmail.fr — Edgaward Newgate — 0134400154.
Les données du projet sont explicitement identifiées comme un test technique.
Stockage : bases locales isolées ; délai de 15 minutes simulé ; requêtes REST réelles.

## Test 1 — Relance

Résultat du traitement : `reminded=1`, `errors=0`.
État local : `appointment_booked=false`, `relance_started=true`.
Tag réel `appointment-reminder` ajouté au contact 442622307 et confirmé par relecture.
La règle active 2419643 inscrit à la campagne 1191498 « Relance Projet ».
Premier email actif : « Suite à votre demande en ligne - Synumanus », délai zéro, hors samedi/dimanche.
Second email actif : « Suivi de votre demande - Synumanus », trois jours plus tard à 10:45, hors samedi/dimanche.
**Le déclenchement est vérifié ; la livraison de l’email n’est pas encore confirmée.** La session web ouvre la page de connexion ; aucune consultation de boîte mail n’a été effectuée.

```text
2026-09-21T10:24:28+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:24:28+00:00 REST GET /tags?query=appointment-valid&limit=100&order=asc : succès
2026-09-21T10:24:28+00:00 REST GET /tags?query=appointment-reminder&limit=100&order=asc : succès
Délai de départ de 15 minutes simulé dans une base de test isolée.
2026-09-21T10:24:28+00:00 REST GET /tags?query=appointment-valid&limit=100&order=asc : succès
2026-09-21T10:24:29+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:24:29+00:00 REST GET /tags?query=appointment-reminder&limit=100&order=asc : succès
2026-09-21T10:24:29+00:00 REST GET /contact_fields : succès
2026-09-21T10:24:29+00:00 REST POST /contacts : succès
2026-09-21T10:24:30+00:00 REST GET /contacts/442622307 : succès
2026-09-21T10:24:30+00:00 REST GET /contacts/442622307 : succès
2026-09-21T10:24:30+00:00 REST POST /contacts/442622307/tags : succès
RESULTAT {"booked":0,"reminded":1,"deferred":0,"errors":0}
ETAT {"appointment_booked":0,"relance_started":1,"reminder_sent_at":1789986268,"systeme_contact_id":442622307,"last_error":null}
2026-09-21T10:24:30+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:24:30+00:00 REST GET /contacts/442622307 : succès
TAGS [{"id":2182906,"name":"appointment-reminder"}]
```

## Test 2 — Validation par tag réel

Autorisation explicite reçue de l’utilisateur pour l’ajout réel du tag et ses éventuels effets sur la campagne.
Tag `appointment-valid` ajouté via API REST réelle puis confirmé par relecture.
Traitement : `booked=1`, `reminded=0`, `errors=0`.
État de cette seconde base de test : `appointment_booked=true`, `relance_started=false`, `reminder_sent_at=null`.
Aucun créneau réel n’a été créé : il s’agit d’une simulation de validation par tag, pas d’un test de réservation native du calendrier.

```text
2026-09-21T10:27:17+00:00 Tag appointment-valid ajouté via API réelle et relu avec succès. Aucun créneau créé.
2026-09-21T10:27:17+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:27:18+00:00 REST GET /contacts/442622307 : succès
2026-09-21T10:27:18+00:00 REST GET /tags?query=appointment-valid&limit=100&order=asc : succès
2026-09-21T10:27:18+00:00 REST GET /tags?query=appointment-reminder&limit=100&order=asc : succès
Délai de départ de 15 minutes simulé dans une base de test isolée.
2026-09-21T10:27:18+00:00 REST GET /tags?query=appointment-valid&limit=100&order=asc : succès
2026-09-21T10:27:19+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:27:19+00:00 REST GET /contacts/442622307 : succès
RESULTAT {"booked":1,"reminded":0,"deferred":0,"errors":0}
ETAT {"appointment_booked":1,"relance_started":0,"reminder_sent_at":null,"systeme_contact_id":442622307,"last_error":null}
2026-09-21T10:27:20+00:00 REST GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T10:27:20+00:00 REST GET /contacts/442622307 : succès
TAGS [{"id":2170016,"name":"appointment-valid"},{"id":2182906,"name":"appointment-reminder"}]
```

## Vérification finale

Prénom, nom et téléphone relus dans Systeme.io : tous conformes aux valeurs fournies.
Les deux tags sont présents sur le contact réel à la fin des tests.
La règle de réservation 2410326, pour l’événement 43565, ajoute `appointment-valid` et désinscrit de la campagne 1191498. L’ajout isolé du tag par API ne constitue pas une réservation et ne garantit pas la désinscription de cette campagne. Le second email de cette campagne est configuré à J+3.
La réception de l’email reste à confirmer par le destinataire ou dans une session Systeme.io authentifiée.
