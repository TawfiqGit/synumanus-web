# Scénario de relance — test exécuté le 21 septembre 2026

## Données du formulaire

Nom et prénom de test confirmés par l’utilisateur. Le besoin et le budget sont fictifs.
Tous les champs obligatoires et facultatifs visibles sont renseignés. Le champ anti-spam reste vide.

| Champ | Valeur |
|---|---|
| Prénom | Simulation |
| Nom | Test |
| Email | mbegum1691@gmail.com |
| Téléphone | 0134400154 |
| Nature du projet | Cadrage |
| Maturité | Idée / besoin identifié |
| Besoin métier | TEST TECHNIQUE AUTORISÉ : simulation du parcours complet et de l’email de relance. Projet et budget fictifs ; aucune demande commerciale. |
| Budget fictif | 7 000 à 10 000 € HT |
| Démarrage | Pas encore défini |
| Échéance | Aucune échéance — test technique |
| Entreprise / projet | Simulation du formulaire Synumanus |

## Déroulement et vérifications

1. Le véritable endpoint `api/project.php` reçoit les valeurs du formulaire via un harnais PHP local (pas une saisie dans le navigateur). La notification interne par mail est simulée pour éviter un envoi supplémentaire.
2. Le prospect est enregistré dans une base locale isolée avec `appointment_booked=false` et `relance_started=false`.
3. Le départ de l’étape de réservation est simulé, sans aucun créneau réservé.
4. À départ + 14 min 59 s, le traitement n’envoie aucune relance.
5. À départ + 15 min (horloge accélérée), le véritable client REST interroge Systeme.io. Le contact n’existe pas encore et ne porte pas `appointment-valid`.
6. Le contact est créé avec les valeurs du formulaire. Le tag `appointment-reminder` est ajouté par une véritable requête REST. L’état local devient `appointment_booked=false`, `relance_started=true`.
7. Relecture réelle du contact : toutes les valeurs envoyées sont conformes ; le tag est présent. Le traitement retourne `reminded=1`, `errors=0`.

## Email attendu

La règle active 2419643 inscrit le contact à la campagne 1191498 « Relance Projet » lors de l’ajout du tag 2182906.
Le premier email actif porte l’objet « Suite à votre demande en ligne - Synumanus » et est configuré sans délai, hors samedi et dimanche.
**L’ajout du tag et la configuration de déclenchement sont vérifiés. L’envoi effectif et la réception dans Gmail ne sont pas prouvés par ces réponses REST.**
La campagne prévoit également un second email à J+3 à 10:45 (hors week-end). Le test laisse le contact dans cette campagne.

## Journal REST

Heures réelles en UTC ; les horloges du traitement sont avancées de 15 minutes uniquement dans la simulation.

```text
2026-09-21T13:24:24+00:00 GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T13:24:24+00:00 GET /tags?query=appointment-reminder&limit=100&order=asc : succès
2026-09-21T13:24:24+00:00 GET /tags?query=appointment-valid&limit=100&order=asc : succès
Départ + 14 min 59 s simulés : aucune relance.
2026-09-21T13:24:24+00:00 GET /tags?query=appointment-valid&limit=100&order=asc : succès
2026-09-21T13:24:24+00:00 GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T13:24:25+00:00 GET /tags?query=appointment-reminder&limit=100&order=asc : succès
2026-09-21T13:24:25+00:00 GET /contact_fields : succès
2026-09-21T13:24:26+00:00 POST /contacts : succès
2026-09-21T13:24:26+00:00 GET /contacts/444448423 : succès
2026-09-21T13:24:26+00:00 GET /contacts/444448423 : succès
2026-09-21T13:24:26+00:00 POST /contacts/444448423/tags : succès
RESULTAT {"booked":0,"reminded":1,"deferred":0,"errors":0}
2026-09-21T13:24:26+00:00 GET /contacts?email=[contact-test]&limit=10 : succès
2026-09-21T13:24:27+00:00 GET /contacts/444448423 : succès
Tous les champs envoyés sont conformes après relecture REST.
ETAT {"appointment_booked":0,"relance_started":1,"reminder_sent_at":1789997964}
TAGS [{"id":2182906,"name":"appointment-reminder"}]
```
