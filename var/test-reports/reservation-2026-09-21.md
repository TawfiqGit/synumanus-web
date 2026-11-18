# Simulation complète de réservation — 21 septembre 2026

Résultat : **SUCCÈS**, sur le serveur local isolé `127.0.0.1:8094`.
Aucune réservation réelle ni requête vers Systeme.io, aucun email envoyé.

## Parcours vérifié dans le navigateur

1. Étape 1 : Cadrage, Idée / besoin identifié ; passage à l’étape 2.
2. Étape 2 : besoin métier renseigné ; passage à l’étape 3.
3. Étape 3 : budget 7 000 à 10 000 € HT ; passage à l’étape 4.
4. Étape 4 : une soumission vide est bloquée (premier passage). Après saisie des coordonnées fictives, enregistrement réussi et passage à l’étape 5.
5. Étape 5 : calendrier local simulé visible ; présence envoyée immédiatement et 30 secondes plus tard.
6. Clic « Simuler la réservation » : retour à l’accueil et signal de départ reçu.

## Journal HTTP réel de la seconde exécution (heures UTC)

```text
2026-09-21T10:07:41+00:00 /api/project.php submit
2026-09-21T10:07:41+00:00 /api/project-presence.php present
2026-09-21T10:08:11+00:00 /api/project-presence.php present
2026-09-21T10:08:35+00:00 /api/project-presence.php leave
```

Ces événements sont relevés par le routeur de test ; le contenu des requêtes et les tokens ne figurent pas dans ce journal.

## Vérification serveur avec horloge et API simulées

Le test injecte une réponse fictive contenant le tag `appointment-valid`. Il exécute le vrai traitement différé sur la base de données du prospect saisi dans le navigateur, à départ + 14 min 59 s, puis départ + 15 min. Les 15 minutes ne sont pas attendues en temps réel.

```text
[BASE] Prospect fictif enregistré : appointment_booked=false ; relance_started=false.
[NAVIGATEUR] Départ reçu : 2026-09-21T10:08:35+00:00.
[DÉPART + 14 min 59 s — HORLOGE SIMULÉE] Aucun appel API, aucune relance.
[API SIMULÉE] Lecture du contact : tag appointment-valid présent.
[DÉPART + 15 min — HORLOGE SIMULÉE] appointment_booked=true ; relance_started=false.
[RÉSULTAT] SUCCÈS — aucune relance, aucun double traitement, aucune réservation réelle.
```

État final lu en base : `appointment_booked=true`, `relance_started=false`, `reminder_sent_at=null`.

## Anomalie détectée et corrigée

Au premier essai, un événement de visibilité envoyait « present » après « leave ». Le JavaScript empêche désormais les nouveaux signaux de présence lorsque la page est en cours de sortie, et les réactive lors d’un retour. Le second essai confirme que le dernier événement est « leave ».

## Vérifications supplémentaires

- `node tests/project-presence.cjs` : intervalle de 30 s, ordre départ/visibilité, reprise après retour — OK.
- `php tests/project-reminders.php` : absence de réservation, relance simulée, onglets multiples, retours, erreurs API et tentatives sans double ajout — OK.
- La réservation native Systeme.io, sa règle d’attribution de tag et le cron Hostinger ne sont pas validés par ce test local.
