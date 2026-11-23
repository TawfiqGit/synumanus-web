# B6 — Préparation de la recette — Refonte du site Synumanus

Version 1.1 — 23/11/2026 — Lili (UX/UI). Intègre la revue de testabilité d'Ace (`site-synumanus-b6-revue-testabilite.md`, 23/11). **Validée par TawfiqDev le 23/11/2026.**
Historique : v1.0 (23/11) — première rédaction ; v1.1 (23/11) — 24 critères reformulés, 4 critères ajoutés, microcopie des erreurs du formulaire, règle de saisie du calculateur (appliquée au prototype), checklist et protocole précisés.
Entrées : gate G3 (23/11), B5 Handoff v1.0, prototype v0.9 (branche `claude/practical-bell-yr0jwk`).
Données utilisées en recette : **fictives uniquement**.

Statut au 23/11 : **à exécuter** (aucun test manuel n'a été fait). « ✔ prototype » = contrôle automatique déjà passé sur le prototype.

---

## 0. Conditions de recette (préalables)

| # | Condition | Responsable | Statut |
|---|---|---|---|
| C1 | **Configuration de test sans le vrai calendrier systeme.io** (`systemeIoCalendarUrl` vide ou calendrier de test dédié). Tant qu'elle n'existe pas : **aucun test du formulaire au-delà de l'étape 4** (risque R1 d'Ace : réservation réelle et relances) | Dragon, Law | À faire |
| C2 | Site servi par `local_server.py` (mode mock, PHP actif) pour le formulaire et la newsletter ; jamais `python3 -m http.server` | Ace | Disponible |
| C3 | Procédure de simulation d'erreur serveur (arrêt de PHP, ou `projectEndpoint` de test renvoyant 500) | Law | À faire |
| C4 | Pré-production sur Hostinger pour les mesures de performance (P01) et la page 404 (AC-16.1) | Dragon | À faire |
| C5 | Base de prospects mock uniquement ; données réelles retirées de `var/` | Dragon | À faire (tâche urgente) |
| C6 | Chaque test des démos part d'une **page fraîchement chargée** (les démos gardent leur état en mémoire) | Ace | Règle |

Conventions : `US-xx` = user story ; `AC-xx.y` = critère. Tailles d'écran : ordinateur 1440 × 900 px, mobile 390 × 844 px (sauf mention). « Réduire les animations » = `prefers-reduced-motion: reduce`. Les montants et durées affichés sont comparés **après normalisation des espaces** (le séparateur de milliers est une espace insécable fine U+202F).

---

## 1. User stories et critères d'acceptation

### US-01 — Comprendre l'offre en moins de 10 secondes
*En tant que dirigeant de TPE, je veux comprendre immédiatement ce que Synumanus réalise pour moi, afin de décider si je continue.*
```gherkin
Fonctionnalité: Hero de l'accueil

  Scénario: AC-01.1 Message et action visibles sans défilement sur petit mobile
    Étant donné un visiteur sur "/" avec un écran de 375 × 667 px
    Et les polices chargées
    Alors le titre "Des applications pensées pour votre métier" est affiché
    Et le bord inférieur du bouton "Échanger sur mon projet" est à 667 px ou moins du haut de l'écran

  Scénario: AC-01.2 Un seul titre principal par page
    Étant donné chacune des pages suivantes : "/", "/applications-mobiles/", "/applications-web-metier/",
      "/automatisation-ia/", "/services/cadrage-prototypage/", "/services/developpement-application-mobile/",
      "/services/refonte-application-mobile/", "/services/maintenance-evolution/", "/a-propos/agence/",
      "/demarrer-un-projet/", "/mentions-legales/", "/politique-confidentialite/" et la page 404
    Alors la page contient exactement un élément de titre de niveau 1

  Scénario: AC-01.3 Le texte n'attend pas l'animation
    Étant donné la préférence "réduire les animations" activée
    Quand l'accueil est chargé
    Alors aucune animation n'est en cours dans le hero
    Et le titre, le chapeau et les boutons ont une opacité de 1 dès le premier affichage
```

### US-02 — Choisir son parcours
```gherkin
Fonctionnalité: Parcours personnalisés de l'accueil

  Plan du scénario: AC-02.1 Chaque entrée mène à la bonne page
    Étant donné un visiteur sur "/"
    Quand il active l'entrée "<entrée>"
    Alors il arrive sur "<page>"

    Exemples:
      | entrée                           | page                                  |
      | Je veux créer une application    | /applications-mobiles/                |
      | Je veux automatiser mon activité | /automatisation-ia/                   |
      | Je veux moderniser mon logiciel  | /services/refonte-application-mobile/ |

  Scénario: AC-02.2 Les entrées forment une navigation nommée
    Alors un repère de navigation porte le nom accessible "Choisissez votre parcours"
    Et il contient les 3 entrées
```

### US-03 — Naviguer dans le site
```gherkin
Fonctionnalité: Header et menus

  Scénario: AC-03.1 Sous-menu Solutions
    Étant donné un visiteur sur ordinateur
    Quand il active le bouton "Solutions"
    Alors le bouton porte aria-expanded="true"
    Et le sous-menu affiche 3 piliers et 4 services
    Quand il appuie sur Échap
    Alors le sous-menu se ferme et le focus revient sur "Solutions"

  Scénario: AC-03.1b Fermeture au clic extérieur ou à la sortie du focus
    Étant donné le sous-menu "Solutions" ouvert
    Quand il clique hors du sous-menu, ou que le focus clavier quitte le sous-menu
    Alors le sous-menu se ferme et "Solutions" porte aria-expanded="false"

  Scénario: AC-03.2 Page courante signalée sans dépendre de la couleur
    Étant donné un visiteur sur "/a-propos/agence/"
    Alors le lien "Agence" porte aria-current="page" et un soulignement visible

  Scénario: AC-03.3 Menu mobile
    Étant donné un visiteur sur un écran de 390 px
    Quand il active le bouton "Ouvrir le menu"
    Alors le haut du panneau est au niveau du bas du header ou en dessous
    Et le bouton s'appelle "Fermer le menu"
    Et le bouton WhatsApp flottant est masqué
    Quand il appuie sur Échap
    Alors le panneau se ferme, porte l'attribut inert, et le focus revient sur le bouton du menu

  Scénario: AC-03.4 Lien d'évitement
    Quand un visiteur appuie sur Tab dès le chargement d'une page
    Alors le premier élément atteint est "Aller au contenu", et il mène au contenu principal

  Scénario: AC-03.5 Solutions signalé sur les pages piliers et services
    Étant donné un visiteur sur "/services/cadrage-prototypage/"
    Alors l'entrée "Solutions" du header est signalée comme section courante (soulignement visible)
```

### US-04 — Essayer la démo CleanPilot (services à la personne)
```gherkin
Fonctionnalité: Démo CleanPilot

  Contexte:
    Étant donné l'accueil fraîchement chargé (état initial des données fictives)
    Et l'onglet "CleanPilot" sélectionné dans la section "Démos interactives"

  Scénario: AC-04.1 Affecter une mission
    Quand il choisit "Lucas" comme intervenant de la mission "Aide aux courses" de 11:30
    Alors le statut de la mission devient "Planifiée"
    Et la zone de statut annonce "Aide aux courses de 11:30 affectée à Lucas."

  Scénario: AC-04.2 Refuser un compte rendu vide
    Étant donné l'écran "Terrain" de la mission de Mme Bernard
    Quand il active "Enregistrer le compte rendu" sans rien écrire
    Alors la zone de statut annonce "Le compte rendu est vide : écrivez une phrase, même « RAS »."

  Scénario: AC-04.3 Refuser une validation incomplète
    Étant donné une consigne non cochée sur la mission de Mme Bernard
    Quand il active "Confirmer l’intervention effectuée"
    Alors le statut reste différent de "Effectuée"
    Et la zone de statut annonce "Cochez toutes les consignes avant de confirmer l’intervention."

  Scénario: AC-04.4 Valider une intervention
    Étant donné les 3 consignes cochées et un compte rendu enregistré
    Quand il active "Confirmer l’intervention effectuée"
    Alors le statut affiche "Effectuée" suivi de " à HH:MM" (heure sur 24 h)
    Et le bouton de confirmation est désactivé

  Scénario: AC-04.5 Exporter les données (contrôle du fichier)
    Étant donné l'écran "Admin"
    Quand il active "Exporter les données (CSV)"
    Alors un fichier "cleanpilot-missions-demo.csv" est téléchargé
    Et il commence par le BOM UTF-8, utilise ";" comme séparateur
    Et il contient 1 ligne d'en-tête et 3 lignes de missions

  Scénario: AC-04.5b Exporter les données (ouverture, manuel)
    Quand le fichier est ouvert dans Excel (Windows) et dans Numbers (Mac)
    Alors les accents s'affichent correctement et chaque valeur est dans sa colonne
    # Sur iPhone (Safari), le fichier peut s'ouvrir en aperçu au lieu d'être téléchargé : comportement accepté

  Scénario: AC-04.6 Utilisable au clavier et au lecteur d'écran
    Alors les éléments suivants sont atteignables au clavier : les 2 onglets, les 4 chapitres,
      la zone d'écran défilante, les contrôles de chaque écran, la navigation basse de l'appareil
    Et chaque changement d'état est annoncé par la zone de statut (role="status")
    Et après chaque action, le focus est sur le même contrôle qu'avant (même attribut data-key)
```

### US-05 — Essayer la démo Commerce Connect (commerce)
```gherkin
Fonctionnalité: Démo Commerce Connect

  Contexte:
    Étant donné l'accueil fraîchement chargé (état initial des données fictives)
    Et l'onglet "Commerce Connect" sélectionné

  Scénario: AC-05.1 Ouverture directe depuis la page Web & métier
    Étant donné un visiteur sur "/applications-web-metier/"
    Quand il active "Essayer la démo Commerce Connect"
    Alors le titre "Essayez, avant même de nous appeler" est entièrement visible sous le header
    Et l'onglet "Commerce Connect" porte aria-selected="true"

  Scénario: AC-05.2 Passer une commande (confirmation activée)
    Quand il ajoute "Pain de campagne" puis 2 "Croissant pur beurre"
    Et qu'il choisit "Paiement en ligne sécurisé (simulé)" puis "Valider la commande"
    Alors la commande n° 1042 apparaît dans le back-office au statut "Nouvelle"
    Et l'écran "Automatisation" contient 1 message de confirmation pour la commande n° 1042

  Scénario: AC-05.2b Passer une commande (confirmation désactivée)
    Étant donné l'automatisation "E-mail de confirmation de commande" désactivée
    Quand il passe une commande
    Alors l'écran "Automatisation" ne contient aucun message de confirmation

  Scénario: AC-05.3 Panier vide
    Étant donné un panier vide
    Alors le bouton "Valider la commande" est désactivé

  Scénario: AC-05.4 Relance automatique
    Étant donné la commande n° 1042 passée et la relance activée
    Quand il active "Simuler la relance du lendemain"
    Alors 2 relances sont ajoutées au journal (commandes n° 1041 "Prête" et n° 1042 "Nouvelle")
    Et la zone de statut annonce "2 relance(s) envoyée(s) (simulation)."

  Scénario: AC-05.5 L'IA ne publie rien sans validation
    Étant donné l'écran "IA optionnelle"
    Quand il active "Proposer une description"
    Alors la mention "généré par un modèle de phrase local, sans appel à une IA" est visible avec la proposition
    Quand il active "Rejeter"
    Alors la description en ligne du produit est inchangée
    Et la zone de statut annonce "Proposition rejetée : rien n’a été publié."

  Scénario: AC-05.6 Onglets au clavier
    Étant donné le focus sur l'onglet "CleanPilot"
    Quand il appuie sur la flèche droite
    Alors l'onglet "Commerce Connect" porte aria-selected="true" et reçoit le focus
```

### US-06 — Être orienté par le guide de choix (sans IA)
```gherkin
Fonctionnalité: Guide de choix

  Scénario: AC-06.1 Réponses incomplètes
    Quand le visiteur active "Voir ma recommandation" sans répondre aux 3 questions
    Alors le message "Répondez aux trois questions pour voir la recommandation." est affiché (role="alert")
    Et le focus est placé sur le premier choix de la première question sans réponse

  Plan du scénario: AC-06.2 Recommandation (recette manuelle)
    Quand il répond "<départ>", "<utilisateurs>", "<priorité>" et valide
    Alors la recommandation "<résultat>" s'affiche et reçoit le focus
    Et le bouton "Échanger sur mon projet" est proposé

    Exemples:
      | départ                                       | utilisateurs               | priorité                       | résultat                     |
      | J’ai un outil à moderniser                   | Mon équipe au bureau       | Un outil fiable sur la durée   | Refonte ou maintenance       |
      | Je perds du temps sur des tâches répétitives | Mon équipe au bureau       | Être opérationnel rapidement   | Automatisation & IA          |
      | Je veux vendre ou être trouvé en ligne       | Mes clients                | Être opérationnel rapidement   | Site web & boutique en ligne |
      | J’ai une idée d’application                  | Mes équipes sur le terrain | Tester l’idée avant d’investir | Cadrage & prototypage        |
      | J’ai une idée d’application                  | Mon équipe au bureau       | Un outil fiable sur la durée   | Application web & métier     |
      | J’ai une idée d’application                  | Mes équipes sur le terrain | Être opérationnel rapidement   | Application mobile           |

  Scénario: AC-06.2b Table de décision complète (test automatisé)
    Alors les 36 combinaisons (4 × 3 × 3) donnent le résultat de la table de décision ci-dessous

  Scénario: AC-06.3 Le contact humain reste proposé
    Alors chaque recommandation affiche "Ce guide oriente, il ne décide pas : un échange de 30 minutes permet de confirmer."
```
**Table de décision (36 combinaisons)** — règle appliquée dans l'ordre :
| Ordre | Condition | Résultat |
|---|---|---|
| 1 | départ = « J’ai un outil à moderniser » (quelles que soient les autres réponses) | Refonte ou maintenance |
| 2 | départ = « Je perds du temps sur des tâches répétitives » | Automatisation & IA |
| 3 | départ = « Je veux vendre ou être trouvé en ligne » | Site web & boutique en ligne |
| 4 | départ = idée et priorité = « Tester l’idée avant d’investir » | Cadrage & prototypage |
| 5 | départ = idée et utilisateurs = « Mon équipe au bureau » | Application web & métier |
| 6 | départ = idée, autres cas | Application mobile |

### US-07 — Estimer le temps gagné
```gherkin
Fonctionnalité: Calculateur de temps gagné

  Plan du scénario: AC-07.1 Calcul
    Quand le visiteur saisit <personnes> personnes, <minutes> minutes et <jours> jours
    Alors le résultat affiche "<heures> h" et "environ <jj> jours de travail"
    # heures = arrondi au plus proche de (personnes × minutes × jours × 0,6 ÷ 60) ; jj = arrondi(heures ÷ 7)

    Exemples:
      | personnes | minutes | jours | heures | jj    |
      | 5         | 30      | 220   | 330    | 47    |
      | 12        | 30      | 220   | 792    | 113   |
      | 1         | 0       | 220   | 0      | 0     |
      | 500       | 30      | 220   | 33 000 | 4 714 |

  Plan du scénario: AC-07.2 Saisie corrigée en quittant le champ
    Quand il saisit "<saisie>" dans "<champ>" puis quitte le champ
    Alors le champ affiche "<valeur>"
    Et la zone de statut annonce "<message>"

    Exemples:
      | champ                 | saisie | valeur | message                                                     |
      | Personnes concernées  | 900    | 500    | Personnes concernées : valeur ramenée à 500, le maximum.    |
      | Personnes concernées  | 2.6    | 3      | Personnes concernées : valeur arrondie à 3.                 |
      | Minutes perdues       | (vide) | 0      | Minutes perdues : valeur ramenée à 0, le minimum.           |
      | Jours travaillés      | -4     | 1      | Jours travaillés : valeur ramenée à 1, le minimum.          |
      | Minutes perdues       | 600    | 480    | Minutes perdues : valeur ramenée à 480, le maximum.         |

  Scénario: AC-07.3 Aucun prix et hypothèse affichée
    Alors aucun montant en euros n'est affiché
    Et l'hypothèse "60 %" est indiquée sous le résultat
```
Bornes : personnes 1–500, minutes 0–480, jours 1–365 ; valeurs entières.

### US-08 — Comprendre la méthode
```gherkin
Fonctionnalité: Méthode au défilement (accueil et 4 services)

  Scénario: AC-08.1 Étape active (ordinateur)
    Étant donné un écran de 1440 × 900 px sur "/"
    Quand le centre de l'étape 3 se trouve dans la bande centrale de 10 % de la hauteur de l'écran
    Alors seule l'étape 3 est mise en avant (classe active)
    Et la barre de progression est remplie à 75 %

  Scénario: AC-08.2 Sans animation
    Étant donné "réduire les animations" activé, ou JavaScript désactivé
    Alors toutes les étapes sont affichées à pleine opacité, sans déplacement
```

### US-09 — Illustration en rubans fluides
```gherkin
Fonctionnalité: Rubans fluides du hero

  Scénario: AC-09.1 Mettre en pause
    Quand le visiteur active "Mettre en pause"
    Alors le bouton porte aria-pressed="true" et s'appelle "Reprendre l’animation"
    Et deux captures de l'illustration prises à 1 seconde d'intervalle sont identiques

  Scénario: AC-09.2 Réduire les animations
    Étant donné "réduire les animations" activé
    Alors le bouton de pause est absent
    Et une capture de l'illustration avant et après un déplacement du pointeur est identique

  Scénario: AC-09.3 Le défilement au doigt n'est pas bloqué (manuel, appareils réels)
    Étant donné un iPhone (Safari) et un téléphone Android (Chrome)
    Quand le visiteur fait glisser verticalement son doigt sur l'illustration
    Alors la page défile

  Scénario: AC-09.4 Sobriété
    Étant donné l'animation en pause, ou l'illustration hors de l'écran
    Alors pendant 2 secondes, l'outil Performance de Chrome n'enregistre aucune trame dessinée par hero-flow.js
    # Variante automatisée : un script de test compte les dessins du canvas (0 attendu)
```

### US-10 — Trouver une réponse dans la FAQ
```gherkin
  Scénario: AC-10.1 Une question ouverte à la fois
    Quand le visiteur ouvre "Combien de temps faut-il ?"
    Alors la question précédemment ouverte se ferme
    Et NVDA et VoiceOver annoncent la question avec son état (développé / réduit) puis lisent la réponse
```

### US-11 — Demander un échange (formulaire « Démarrer un projet »)
Préalables : C1 (aucun test au-delà de l'étape 4 avec le vrai calendrier), C2, C3.
```gherkin
Fonctionnalité: Formulaire (back-end inchangé, N = 4 étapes depuis le lot 2 du 23/11)

  Scénario: AC-11.1 Champs obligatoires
    Étant donné l'étape 1 sans réponse
    Quand le visiteur active "Continuer"
    Alors le message "Complétez les champs obligatoires avant de continuer." est affiché (role="alert")
    Et l'étape ne change pas

  Plan du scénario: AC-11.2 Erreur signalée champ par champ (exigence B3 — ÉCART D'IMPLÉMENTATION, à faire par Law)
    Étant donné le champ "<champ>" invalide
    Quand le visiteur active "Continuer"
    Alors le champ porte aria-invalid="true"
    Et le message "<message>" s'affiche sous le champ, relié au champ (aria-describedby), avec une icône
    Et le focus est placé sur le premier champ en erreur

    Exemples:
      | champ                     | message                                                                 |
      | Nature du projet          | Choisissez la nature de votre projet.                                   |
      | Où en êtes-vous ?         | Indiquez où en est votre projet.                                        |
      | Problème ou opportunité   | Décrivez votre besoin en quelques phrases (20 caractères minimum).      |
      | Budget envisagé           | Choisissez une fourchette, même large : on affinera ensemble.           |
      | Nom                       | Indiquez votre nom.                                                     |
      | Prénom                    | Indiquez votre prénom.                                                  |
      | E-mail (vide ou invalide) | Indiquez un e-mail valide, par exemple nom@entreprise.fr                |
      | Téléphone                 | Indiquez un numéro de téléphone, par exemple 06 12 34 56 78.            |

  Scénario: AC-11.3 Progression annoncée
    Quand le visiteur passe à l'étape suivante
    Alors le texte "Étape X / N" est mis à jour (N = nombre d'étapes en vigueur)

  Scénario: AC-11.4 Bouton WhatsApp
    Étant donné les étapes de saisie du formulaire
    Alors le bouton WhatsApp flottant est masqué
    Quand l'étape "Choisir un créneau" s'affiche, ou qu'une erreur d'envoi survient
    Alors le bouton WhatsApp est de nouveau visible

  Scénario: AC-11.5 Erreur d'envoi
    Étant donné l'erreur serveur simulée selon la procédure C3
    Quand le visiteur envoie l'étape "Vos coordonnées"
    Alors le message "La demande n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email/WhatsApp." est affiché
    Et tous les champs déjà saisis sont toujours remplis

  Scénario: AC-11.6 Calendrier de test (après C1)
    Étant donné la configuration de test sans URL de calendrier, en local
    Quand l'étape "Choisir un créneau" s'affiche
    Alors le calendrier simulé s'affiche avec "Simuler la réservation"

  Scénario: AC-11.7 Anti-robot et double envoi
    Étant donné le champ caché "website" rempli
    Quand le formulaire est envoyé
    Alors aucune demande n'est enregistrée
    Étant donné un double clic sur le bouton d'envoi
    Alors une seule demande est enregistrée
    # À rattacher aux tests PHP existants (test_project_api.py)
```
Note : la règle « 20 caractères minimum » du besoin (B3) n'est pas encore appliquée par le code → Law.

### US-12 — S'inscrire à la newsletter
Préalable : C2 (site servi par `local_server.py`, mode mock).
```gherkin
  Scénario: AC-12.1 Consentement obligatoire
    Quand le visiteur saisit un e-mail valide sans cocher le consentement et active "S’inscrire"
    Alors aucune requête n'est envoyée à "/api/newsletter.php"
    Et la case de consentement est signalée invalide

  Scénario: AC-12.2 Succès
    Étant donné un e-mail valide et le consentement coché
    Quand il active "S’inscrire"
    Alors le message "Merci. Votre inscription a bien été prise en compte." est annoncé
```

### US-13 — Pages piliers et services
```gherkin
  Scénario: AC-13.1 Fil d'Ariane
    Étant donné "/services/refonte-application-mobile/"
    Alors le fil d'Ariane affiche "Accueil / Applications mobiles / Refonte"
    Et le dernier élément porte aria-current="page"

  Scénario: AC-13.2 Lien vers la démo CleanPilot
    Étant donné "/applications-mobiles/"
    Quand le visiteur active "Essayer la démo CleanPilot"
    Alors il arrive sur la section des démos de l'accueil, onglet "CleanPilot" sélectionné

  Scénario: AC-13.3 Appel final
    Alors chacune des 7 pages piliers et services se termine par "Parlons de votre projet" et le bouton "Échanger sur mon projet"
```

### US-14 — Page Agence
```gherkin
  Scénario: AC-14.1 Plan accessible
    Alors le plan des bureaux a le rôle "img" et le nom accessible "Illustration : plan stylisé de l’espace Synumanus"
    Et la légende "Illustration — plan stylisé, non contractuel" est visible

  Scénario: AC-14.2 Lieu
    Alors la section "Nos bureaux" indique "Les Tricolores", "Neuilly-sur-Seine" et l'accueil sur rendez-vous
```

### US-15 — Pages légales
```gherkin
  Scénario: AC-15.1 Sommaire
    Quand le visiteur active un lien du sommaire
    Alors le haut du titre de la section est sous le bas du header collant (titre entièrement visible)
```

### US-16 — Page 404 (à créer — bloqué tant que C4 et la page n'existent pas)
```gherkin
  Scénario: AC-16.1 Adresse inconnue
    Étant donné la pré-production
    Quand un visiteur ouvre "/page-qui-n-existe-pas/"
    Alors le serveur répond avec le code 404
    Et la page affiche "Cette page n’existe pas ou a été déplacée" et les liens Accueil, Solutions, "Échanger sur mon projet"
```

### US-17 — Référencement
```gherkin
  Scénario: AC-17.1 Titres uniques
    Alors chaque page a un élément title et une meta description uniques

  Scénario: AC-17.2 Données structurées
    Étant donné le code HTML de l'accueil
    Alors le validateur schema.org (validator.schema.org) analyse "ProfessionalService" et "FAQPage" sans erreur
    # Les résultats enrichis de FAQ ne sont plus affichés par Google pour la plupart des sites depuis 2023 : l'outil Google n'est pas l'oracle
```

### US-18 — Non-régression et robustesse
```gherkin
  Scénario: AC-18.1 Anciennes adresses conservées
    Étant donné chaque URL du sitemap, dont les pages du lot 2 (secteurs, ressources, actus, conseil IA)
    Alors la page répond 200 et s'affiche sans erreur JavaScript

  Scénario: AC-18.2 Démos sans JavaScript
    Étant donné JavaScript désactivé
    Alors la section des démos affiche "Activez JavaScript pour essayer les démonstrations."
```

---

## 2. Checklist UX/UI et accessibilité (WCAG 2.2 AA)

| ID | Critère | Référence | Seuil d'acceptation | Méthode | ✔ prototype |
|---|---|---|---|---|---|
| A01 | Accessibilité automatique | multiple | 0 violation axe-core sur toutes les pages v2 | Playwright + axe | ✔ (23/11) |
| A02 | Navigation complète au clavier, sans piège | 2.1.1, 2.1.2 | Toutes les actions réalisables | Manuel | — |
| A03 | Focus visible, jamais masqué par le header collant | 2.4.7, 2.4.11 | Contour visible à chaque étape | Manuel | — |
| A04 | Ordre de focus logique (B5 §6) | 2.4.3 | Conforme à B5 | Manuel | — |
| A05 | Contrastes, y compris survol et focus | 1.4.3, 1.4.11 | Texte ≥ 4,5:1, composants ≥ 3:1 | Automatique + manuel | ✔ axe |
| A06 | Information jamais portée par la seule couleur | 1.4.1 | Statuts, erreurs et page courante ont un texte ou une forme | Manuel | — |
| A07 | Agrandissement et reflow | 1.4.4, 1.4.10 | Zoom 200 % sans perte ; largeur 320 px (= 400 % à 1280 px) sans défilement horizontal | Manuel | 375 px ✔ |
| A08 | Espacement du texte modifié | 1.4.12 | Aucune perte de contenu | Manuel (bookmarklet) | — |
| A09 | Taille des cibles | 2.5.8 | **Bloquant** < 24 px ; **mineur** entre 24 et 44 px (objectif Synumanus 44 px) | Manuel | — |
| A10 | Mouvement | 2.2.2, 2.3.3 | Pause des rubans ; aucune animation si réduction demandée | Manuel + AC-09 | ✔ |
| A11 | Formulaires : erreurs identifiées et suggérées | 3.3.1, 3.3.3, 4.1.2 | Conforme à AC-11.2 | Manuel | **écart** |
| A12 | Messages d'état annoncés | 4.1.3 | Démos, guide, calculateur, newsletter, formulaire | NVDA, VoiceOver | — |
| A13 | Structure | 1.3.1, 2.4.6 | Un H1, titres hiérarchisés, repères header / nav / main / footer | Lecteur d'écran | — |
| A14 | Langue de la page | 3.1.1 | `lang="fr"` | Automatique | ✔ |
| A15 | Liens explicites ; nouvel onglet annoncé | 2.4.4 | Compréhensibles hors contexte | Manuel | — |
| A16 | Images | 1.1.1 | Décoratives masquées ; plan Agence décrit | Lecteur d'écran | — |
| A17 | Aide cohérente | 3.2.6 | Contact (WhatsApp, échange) au même endroit sur toutes les pages | Manuel | — |
| U01 | Conformité au prototype | B4 | Captures de référence (1440 et 390 px) validées par Lili ; écarts classés bloquant / majeur / mineur | Comparaison visuelle | — |
| U02 | Microcopie | B5, B6 | Messages identiques aux textes validés | Manuel | — |
| U03 | Données fictives | Charte | Mentions « données fictives » visibles ; aucune donnée réelle | Manuel | ✔ |
| U04 | Aucun prix Synumanus affiché | Décision 16/11 | 0 occurrence | Manuel | ✔ |
| P01 | Performance (en pré-production, C4) | — | Lighthouse mobile, 3 passages, médiane : LCP < 2,5 s, CLS < 0,1, TBT < 200 ms ; INP < 200 ms mesuré après mise en ligne | Lighthouse | à mesurer |
| P02 | Console | — | Aucune erreur JavaScript | Automatique | ✔ |

### Matrice navigateurs, appareils et technologies d'assistance
| Environnement | Priorité |
|---|---|
| Chrome Android (téléphone réel, milieu de gamme) | P1 |
| Safari iOS (iPhone réel) | P1 |
| Chrome, Edge, Firefox, Safari — ordinateur | P1 |
| NVDA + Firefox (Windows) | P1 |
| VoiceOver iOS et macOS | P1 |
| TalkBack (Android) | P2 |
| Clavier seul | P1 |
| Zoom 200 % ; largeur 320 px | P1 |

---

## 3. Protocole de test utilisateur

**Objectif** : vérifier que la cible (dirigeants de TPE et PME, maîtrise numérique moyenne) comprend l'offre, trouve le bon service et demande un échange sans aide.

**Participants** : 5 personnes de la cible primaire (BTP, services, commerce, associations), dont au moins 2 sur mobile et 1 personne peu à l'aise avec le numérique ou utilisant une aide technique. Recrutement par TawfiqDev ; aucun lien avec un projet client en cours.

**Rôles** : un **animateur neutre** lit le script mot pour mot ; TawfiqDev observe sans intervenir et prend des notes (recommandation d'Ace : éviter que le fondateur anime, pour limiter les réponses complaisantes). Principe validé le 23/11 ; personne à désigner par TawfiqDev.

**Format** : 30 minutes, à voix haute, aux Tricolores ou en visio, sur l'environnement de test (C1, C2). Consentement écrit ; enregistrement d'écran **seulement** avec accord ; participants anonymisés (P1 à P5).

**Chronométrage** : début = fin de la lecture de la consigne ; fin = résultat atteint, ou abandon déclaré par le participant.

| # | Consigne lue au participant | Critère de réussite | Temps cible |
|---|---|---|---|
| T1 | « Regardez cette page 10 secondes, puis dites-moi ce que fait cette entreprise. » | Cite « application » ou « sur mesure » **et** au moins un exemple métier | 10 s d'observation |
| T2 | « Vos techniciens remplissent des bons papier. Trouvez ce que Synumanus propose pour ça. » | Arrive sur « Applications mobiles » ou sur la démo CleanPilot | < 60 s |
| T3 | « Dans la démo, affectez la mission de 11 h 30 à Lucas, puis confirmez l’intervention de 9 h. » | Les 2 actions sont faites | < 3 min |
| T4 | « Utilisez le guide pour savoir par où commencer avec votre propre situation. » | Une recommandation s'affiche et le participant la reformule | < 90 s |
| T5 | « Combien d’heures votre équipe pourrait-elle récupérer par an ? » | Le participant lit le résultat du calculateur | < 60 s |
| T6 | « Vous voulez en parler à quelqu’un : demandez un échange. » (**uniquement après C1**) | Atteint l'étape « Choisir un créneau » | < 4 min |
| T7 | « Où se trouvent les bureaux ? » | Cite les Tricolores, à Neuilly-sur-Seine | < 45 s |

**Mesures** : réussite par tâche, temps, erreurs et hésitations, citations marquantes, score **SUS** (questionnaire standard de 10 questions) en fin de séance.
**Seuils validés le 23/11** : chaque tâche réussie par au moins 4 participants sur 5 ; SUS moyen ≥ 75 ; aucun blocage d'accessibilité.
**Résultats** : à mesurer. Synthèse par Lili ; chaque problème est qualifié (bug d'implémentation, trou dans la spec, défaut de conception) et attribué.

### Script de l'animateur (à lire mot pour mot)
1. « Merci d'être là. Nous testons le site, pas vous : il n'y a pas de bonne ou de mauvaise réponse. »
2. « Pensez à voix haute : dites ce que vous regardez, ce que vous cherchez, ce qui vous surprend. »
3. « Je ne pourrai pas vous aider pendant les tâches ; si vous êtes bloqué, dites-le et nous passerons à la suite. »
4. Lire chaque consigne T1 à T7 ; ne jamais montrer, ni nommer un bouton.
5. Après les tâches : questionnaire SUS, puis « Qu'avez-vous préféré ? Qu'est-ce qui vous a gêné ? »

### Consentement (modèle)
« J'accepte de participer à un test du site de Synumanus. Je peux arrêter à tout moment. ☐ J'accepte que mon écran et ma voix soient enregistrés (facultatif). Les résultats sont anonymisés et conservés 6 mois, uniquement pour améliorer le site. » — Nom, date, signature. *Durée de conservation validée le 23/11 : 6 mois.*

### Indicateurs après mise en ligne (Plausible)
Conversion visite → formulaire, formulaire → rendez-vous, abandon par étape, usage des démos, du guide et du calculateur (événements sans cookie) : **à mesurer**, comparés aux 4 semaines de référence du site actuel (décision du 17/11).

---

## 4. Automatisation recommandée (avis d'Ace, Playwright)
Priorité 1 : A01, P02, AC-01.2, AC-17.1 ; démos (AC-04, AC-05) ; table de décision du guide (AC-06.2b) ; calculateur (AC-07). Priorité 2 : navigation (AC-02, AC-03, AC-13), mouvement (AC-01.3, AC-08.2, AC-09.1, AC-09.2), non-régression (AC-18). Priorité 3 : formulaire jusqu'à l'étape 4 (dépend de Q1). Restent manuels : lecteurs d'écran, appareils réels, tactile, ouverture du CSV, tests utilisateurs, performance.

---

## 5. Circuit de validation
1. ~~Ace vérifie la testabilité~~ — fait le 23/11 (revue intégrée dans cette v1.1).
2. ~~TawfiqDev valide la version finale~~ — **validée le 23/11/2026** (critères, microcopie des erreurs, règle du calculateur, seuils 4/5 et SUS ≥ 75, animateur neutre, conservation 6 mois). Reste à désigner nommément l'animateur.
3. Toute modification ultérieure d'un critère validé passe par TawfiqDev (gestion des changements).
