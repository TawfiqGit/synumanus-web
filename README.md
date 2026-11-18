# Synumanus — architecture finale avec templates

Ce projet implémente l’architecture URL finale validée, avec des pages générées dans des dossiers (`.../index.html`) et des éléments partagés centralisés.

## Architecture publique

```text
/
├── services/
│   ├── cadrage-prototypage/
│   ├── developpement-application-mobile/
│   ├── refonte-application-mobile/
│   └── maintenance-evolution/
├── secteurs/
│   ├── industrie/
│   ├── finance-assurance/
│   └── sante/
├── conseil-ia-generative/
├── a-propos/
│   └── agence/
├── ressources/
│   ├── generateur-cahier-des-charges/
│   └── radars-tech/
├── actus/
├── demarrer-un-projet/
├── politique-confidentialite/
└── mentions-legales/
```

## Répertoires source

```text
src/
├── data/
│   ├── navigation.json       # Service, Secteurs et Ressources
│   ├── pages.json            # routes, SEO, CSS et JS par page
│   └── site.json             # nom, domaine, email
├── pages/                    # contenu spécifique de chaque page
├── partials/
│   ├── header.html
│   ├── footer.html
│   └── whatsapp.html
├── templates/
│   ├── base.html
│   ├── service-page.template.html
│   ├── sector-page.template.html
│   ├── editorial-page.template.html
│   ├── resource-page.template.html
│   └── legal-page.template.html
└── static/                   # CSS, JS, PHP, favicon
```

## Build

Prérequis de build : Python 3.10+. Pour tester les endpoints PHP localement : PHP 8.1+.

```bash
python3 build.py
python3 local_server.py
```

Puis ouvrir `http://127.0.0.1:8080/`.

> `python3 -m http.server` ne doit plus être utilisé pour tester ce projet : il sert les fichiers statiques mais n'exécute pas `api/newsletter.php` ni `api/project.php`.



## Serveur local GET / POST

Le projet fournit `local_server.py`. Il lance le serveur HTTP intégré de PHP sur le dossier `dist/`, ce qui permet d'exécuter réellement les endpoints PHP.

Le fichier contient volontairement un import CGI compatible avec les anciens Python :

```python
try:
    import cgi  # Python <= 3.12
except ModuleNotFoundError:  # Python 3.13+
    cgi = None
```

`cgi` a été retiré de Python 3.13 ; le serveur ne dépend donc pas de ce module pour fonctionner. L'exécution des endpoints est assurée par PHP.

### Mode mock local (par défaut)

```bash
python3 local_server.py
```

Le script définit automatiquement :

```text
SYNUMANUS_LOCAL_MOCK=1
```

Dans ce mode :
- `POST /api/newsletter.php` fonctionne sans clé systeme.io ;
- `POST /api/project.php` fonctionne sans transport mail ;
- `GET` est également accepté sur ces deux endpoints uniquement pour les tests locaux ;
- les données reçues sont écrites dans `var/local-requests.log`, hors du dossier public.

Les endpoints acceptent localement :
- JSON (`application/json`) ;
- formulaire POST (`application/x-www-form-urlencoded` ou `multipart/form-data`) ;
- paramètres GET lorsque le mode mock est actif.

### Tester automatiquement GET et POST

Dans un second terminal :

```bash
python3 test_local_api.py
```

Le script teste :

```text
Newsletter GET
Newsletter POST
Projet GET
Projet POST
```

### Tester les intégrations réelles

```bash
python3 local_server.py --live
```

Dans ce mode, les règles de production sont rétablies : les endpoints n'acceptent que POST, systeme.io doit être configuré et le transport email PHP doit fonctionner.

### Signatures des scripts locaux

```python
load_env_file(path: Path) -> None
parse_args() -> argparse.Namespace
ensure_php() -> str
main() -> int
```

```python
request_json(url: str, method: str = "GET", payload: dict | None = None) -> tuple[int, dict]
main() -> int
```

## Signatures du générateur

```python
read(path: Path) -> str
replace_tokens(template: str, values: dict[str, str]) -> str
render_nav_items(items: list[dict], current_key: str | None, mobile: bool = False) -> str
render_footer_items(items: list[dict]) -> str
copy_static() -> None
build() -> None
```

## Navigation

Le header possède :
- Hub **Service** : 4 prestations ;
- Hub **Secteurs** : Industrie, Finance & assurance, Santé ;
- accès direct **Conseil IA** ;
- Hub **Ressources** : Générateur, Radars Tech, Actus ;
- accès direct **Agence** ;
- CTA **Démarrer un projet**.

Tous les liens utilisent des URLs root-relative (`/services/.../`) : la profondeur des pages ne casse donc pas les assets ni la navigation.

## Ajouter une nouvelle page

1. Ajouter le contenu dans `src/pages/`.
2. Ajouter la route dans `src/data/pages.json`.
3. Si elle doit apparaître dans un Hub, ajouter l’entrée dans `src/data/navigation.json`.
4. Lancer `python3 build.py`.

## Templates de départ

Utiliser :
- `service-page.template.html` pour un nouveau service ;
- `sector-page.template.html` pour un nouveau secteur ;
- `editorial-page.template.html` pour une page agence / conseil / contenu ;
- `resource-page.template.html` pour un outil ou guide ;
- `legal-page.template.html` pour une page légale.

## Générateur de cahier des charges

`requirements-generator.js` fonctionne entièrement côté navigateur. Les données saisies ne sont pas envoyées au serveur. Il permet de :
- générer un brouillon texte ;
- copier le brouillon ;
- télécharger un fichier `.txt`.

Signature :

```javascript
setupRequirementsGenerator(): void
```

## Newsletter systeme.io

Le footer conserve le formulaire simple validé. Le frontend appelle :

```text
POST /api/newsletter.php
```

## Formulaire projet

Le formulaire multi-étapes reste sur `/demarrer-un-projet/` et appelle :

```text
POST /api/project.php
```

La dernière étape affiche uniquement **Précédent** et **C’est partie** ; le bouton **Continuer** est masqué.

## Informations légales

Les pages `mentions-legales/` et `politique-confidentialite/` contiennent volontairement des champs à compléter lorsque les informations juridiques ou l’hébergeur ne sont pas connus. Ne pas publier ces mentions comme définitives sans validation.


## Parcours « Démarrer un projet » + calendrier systeme.io

La page `/demarrer-un-projet/` comporte maintenant **5 étapes** :

```text
1. Votre projet
2. Le besoin métier
3. Budget et calendrier
4. Vos coordonnées
5. Choisir un créneau — calendrier systeme.io
```

Le champ **Téléphone** est obligatoire côté navigateur (`required`) et côté serveur (`api/project.php`).

### Configurer le calendrier systeme.io

1. Dans systeme.io, ouvrir **CRM > Calendar** et créer un événement (par exemple « Échange projet Synumanus — 30 min »).
2. Définir les disponibilités et, si nécessaire, connecter Google Calendar / Google Meet / Zoom.
3. Créer une page de tunnel dédiée, idéalement sans navigation ni contenu annexe, et y ajouter l'élément natif **Calendar**.
4. Publier cette page et copier son URL dans `src/static/config.js` :

```javascript
systemeIoCalendarUrl: 'https://VOTRE-PAGE-CALENDRIER.systeme.io/'
```

5. Conservez la confirmation native du calendrier systeme.io, ou configurez une redirection vers l’accueil (`https://www.synumanus.fr/`). Le site n’affiche plus d’étape de validation finale.

### Test local

Si `systemeIoCalendarUrl` est vide et que le site tourne sur `localhost` ou `127.0.0.1`, l'étape 5 affiche un **calendrier simulé** afin de tester tout le parcours. Le bouton « Simuler la réservation » revient ensuite à l’accueil.

Le calendrier réel reste piloté par systeme.io : disponibilités, réservation, emails de confirmation et rappels.

## Enregistrement des prospects et relance de rendez-vous

À la validation de l’étape 4, `/api/project.php` enregistre les champs autorisés dans SQLite avant d’autoriser l’étape 5. Les colonnes `appointment_booked` et `relance_started` sont initialisées à `0` (false). Le token aléatoire de soumission rend les répétitions de la même requête idempotentes ; seul son hash est conservé en base. L’email de notification existant est conservé, mais un échec de transport mail n’annule plus une demande enregistrée.

La base se trouve par défaut dans `var/prospects.sqlite`, **hors de `dist/`**, et en mock dans `var/prospects-mock.sqlite`. Pour un hébergement où `dist/` devient le dossier public, placer `.env`, `var/` et `scripts/` dans son parent privé. PHP doit disposer de PDO SQLite et cURL ; le processus PHP web et le worker doivent avoir accès à la même base. Ne pas supprimer `var/` pendant un déploiement.

Variables serveur (dans le `.env` privé ou l’environnement de l’hébergeur) :

```dotenv
SYNUMANUS_LOCAL_MOCK=0
SYSTEMEIO_API_KEY=cle_privee
# Facultatif : chemin absolu hors du dossier servi par HTTP
SYNUMANUS_PROJECT_DB=/chemin/prive/var/prospects.sqlite
```

Le navigateur envoie `POST /api/project-presence.php` à l’entrée dans l’étape 5, puis toutes les **30 secondes**. Au départ (`pagehide`), un beacon signale la sortie. Si le navigateur est fermé brutalement, le serveur considère la présence expirée après **90 secondes** sans signal, puis attend **15 minutes supplémentaires**. Chaque onglet dispose de son propre identifiant : la fermeture d’un onglet ne suffit pas si un autre reste actif. Un retour remet le délai à zéro. Les navigateurs peuvent suspendre les onglets en arrière-plan ; la présence est une estimation par signaux, pas une garantie absolue de présence humaine.

Le worker `scripts/project-reminders.php` doit être exécuté **toutes les minutes par le planificateur de l’hébergement**. Il ne dépend pas du navigateur et n’est pas lancé par une requête publique. Exemple cron à adapter au chemin d’installation :

```cron
* * * * * cd /chemin/prive/website && SYNUMANUS_LOCAL_MOCK=0 /usr/bin/php scripts/project-reminders.php >> var/project-reminders.log 2>&1
```

Le délai effectif est de 15 minutes après le départ détecté, plus jusqu’à une minute avant l’exécution du worker. En cas d’arrêt brutal sans beacon, s’ajoute la marge de présence de 90 secondes. Sans cette tâche planifiée, les prospects sont enregistrés mais aucune relance ne démarre automatiquement.

Traitement d’un prospect arrivé à échéance :

1. Recherche du contact par email exact puis lecture de ses tags via l’API REST Systeme.io.
2. Si `appointment-valid` existe sur le contact : `appointment_booked=1`, aucune relance.
3. Sinon : `relance_started=1`, création/mise à jour du contact avec les coordonnées et le contexte projet, relecture des tags et de la présence, puis ajout de `appointment-reminder` si le tag n’est pas déjà présent.
4. Une erreur réseau, un tag de configuration manquant ou une réponse invalide **ne signifie pas** que le prospect n’a pas réservé. Le traitement est retenté avec délai croissant (respect de `Retry-After`). `last_error`, `attempts`, `next_attempt_at` et `reminder_sent_at` permettent le suivi en base. `relance_started=1` indique le début du processus ; seul `reminder_sent_at` confirme la pose du tag. Le worker est verrouillé pour éviter deux exécutions simultanées sur la même base.

La clé API reste côté serveur. Les tags `appointment-valid` et `appointment-reminder` doivent exister. Le calendrier doit attribuer `appointment-valid` au **même email** que celui du formulaire. L’automation de relance doit être déclenchée par l’ajout de `appointment-reminder` dans Systeme.io ; le code ne crée pas de campagne ni de texte d’email. Prévoir également l’exclusion des contacts portant `appointment-valid` dans cette automation, car une réservation peut se terminer pendant les derniers instants du traitement. Un tag de réservation ancien est traité comme valide : son cycle de vie est géré dans Systeme.io.

Les champs standards `first_name`, `last_name`, `phone_number` et les champs dédiés `synumanus_company`, `synumanus_project_type`, `synumanus_maturity`, `synumanus_business_problem`, `synumanus_budget`, `synumanus_start_window`, `synumanus_target_date` accueillent les données. Deux commandes d’administration :

```bash
# Lecture seule de la configuration distante, sans envoi de prospect
SYNUMANUS_LOCAL_MOCK=0 php scripts/project-reminders.php --check
# Crée uniquement les définitions de champs manquantes, jamais de contacts
SYNUMANUS_LOCAL_MOCK=0 php scripts/project-reminders.php --configure-fields
```

Documentation officielle : [contacts](https://developer.systeme.io/reference/api_contacts_get_collection-1), [mise à jour](https://developer.systeme.io/reference/api_contacts_id_patch-1), [attribution d’un tag](https://developer.systeme.io/reference/post_contact_tag-1), [champs personnalisés](https://developer.systeme.io/reference/api_contact_fields_post-1).

### Vérifications sans envoi réel

```bash
python3 build.py
php tests/project-reminders.php
python3 -m unittest test_build_security.py
# Dans un terminal : serveur mock sur une base isolée
SYNUMANUS_PROJECT_DB=/tmp/synumanus-project-tests.sqlite python3 local_server.py --port 8093 --no-browser
# Dans un autre terminal
python3 test_project_api.py --base-url http://127.0.0.1:8093
```

Les tests PHP utilisent une horloge simulée et une API factice : délai, réservation validée, départ sans beacon, retour, onglets multiples, erreurs, nouvelles tentatives et absence de double ajout de tag. Le test HTTP exige le mode mock avant toute soumission. Aucun test ne déclenche d’email ou d’automation dans Systeme.io.

### Déploiement sur Hostinger (hPanel)

Pour les offres Web/Cloud Hostinger, utiliser MySQL/MariaDB via PDO MySQL ; SQLite reste disponible pour le développement local ou un VPS compatible. [Bases prises en charge](https://www.hostinger.com/support/1583226-which-database-management-system-is-used-at-hostinger/).

Structure à conserver sur le serveur (les chemins exacts dépendent de votre compte) :

```text
domains/synumanus.fr/
├── .env                         # privé, ne pas mettre dans public_html
├── scripts/project-reminders.php
├── var/                         # logs privés éventuels
└── public_html/                 # contenu de dist/, pas le dossier dist lui-même
    └── api/...
```

Créer une base dédiée et son utilisateur dans hPanel, puis renseigner le `.env` privé :

```dotenv
SYNUMANUS_LOCAL_MOCK=0
SYSTEMEIO_API_KEY=cle_privee_existante
SYNUMANUS_PROJECT_DSN="mysql:host=localhost;port=3306;dbname=VOTRE_BASE;charset=utf8mb4"
SYNUMANUS_PROJECT_DB_USER=VOTRE_UTILISATEUR
SYNUMANUS_PROJECT_DB_PASSWORD="VOTRE_MOT_DE_PASSE"
```

Conserver aussi les paramètres newsletter et mail existants. La variable DSN sélectionne MySQL ; les deux tables sont créées automatiquement dans la base dédiée. Utiliser PHP 8.1 minimum, idéalement la même version pour le web et le cron, avec `pdo_mysql` et `curl` activés. Ne jamais recopier la base de tests ou utiliser le mode mock en production.

Dans **Sites web → Tableau de bord → Tâches cron**, choisir **PHP**, indiquer le chemin absolu de `scripts/project-reminders.php`, puis régler minute, heure, jour, mois et jour de semaine sur `*` (toutes les minutes). Cette commande ne doit pas utiliser une URL publique. Le script détecte automatiquement le dossier `public_html` voisin. Vérifier le résultat dans la liste des tâches cron ; `errors:0` indique une exécution sans erreur. [Configuration officielle des tâches cron Hostinger](https://www.hostinger.com/support/1583465-how-to-set-up-a-cron-job-at-hostinger/).

La configuration distante des tags/champs a été vérifiée et les champs manquants créés pendant le développement. La connexion MySQL et la tâche cron doivent être validées sur l’hébergement avec ses propres identifiants ; les tests locaux utilisent SQLite et ne prouvent pas que l’accès Hostinger est configuré.
