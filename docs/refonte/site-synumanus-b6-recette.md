# B6 — Préparation de la recette — Refonte du site Synumanus

Version 1.0 — 23/11/2026 — Lili (UX/UI). **À vérifier par Ace (testabilité), puis à valider par TawfiqDev.**
Entrées : gate G3 (23/11), B5 Handoff v1.0, prototype v0.9 (branche `claude/practical-bell-yr0jwk`).
Ce document est l'entrée [LIVRABLES UX/UI] de la recette : critères d'acceptation (Gherkin), checklist UX/UI et accessibilité, protocole de test utilisateur.
Données utilisées en recette : **fictives uniquement** (aucune donnée réelle de prospect).

Statut de chaque critère au 23/11 : **à exécuter** (aucun test manuel n'a encore été fait). Les contrôles automatiques déjà passés sur le prototype sont indiqués « ✔ prototype ».

---

## 1. User stories et critères d'acceptation

Convention : `US-xx` = user story ; `AC-xx.y` = critère. Taille d'écran par défaut : ordinateur 1440 px et mobile 390 px. « Réduire les animations » = préférence système `prefers-reduced-motion: reduce`.

### US-01 — Comprendre l'offre en moins de 10 secondes
*En tant que dirigeant de TPE, je veux comprendre immédiatement ce que Synumanus réalise pour moi, afin de décider si je continue.*
```gherkin
Fonctionnalité: Hero de l'accueil

  Scénario: AC-01.1 Message et action visibles sans défilement sur mobile
    Étant donné un visiteur sur "/" avec un écran de 375 × 667 px
    Quand la page est chargée
    Alors le titre "Des applications pensées pour votre métier" est visible
    Et le bouton "Échanger sur mon projet" est visible sans défiler

  Scénario: AC-01.2 Un seul titre principal
    Étant donné n'importe quelle page du site refondu
    Alors la page contient exactement un titre de niveau 1

  Scénario: AC-01.3 Le texte n'attend pas l'animation
    Étant donné la préférence "réduire les animations" activée
    Quand l'accueil est chargé
    Alors le titre, le chapeau et les boutons sont visibles immédiatement, sans animation
```

### US-02 — Choisir son parcours
```gherkin
Fonctionnalité: Parcours personnalisés de l'accueil

  Plan du scénario: AC-02.1 Chaque entrée mène à la bonne page
    Étant donné un visiteur sur "/"
    Quand il active l'entrée "<entrée>"
    Alors il arrive sur "<page>"

    Exemples:
      | entrée                           | page                                     |
      | Je veux créer une application    | /applications-mobiles/                   |
      | Je veux automatiser mon activité | /automatisation-ia/                      |
      | Je veux moderniser mon logiciel  | /services/refonte-application-mobile/    |

  Scénario: AC-02.2 Les entrées forment une navigation nommée
    Alors les 3 entrées sont regroupées dans une navigation annoncée "Choisissez votre parcours"
```

### US-03 — Naviguer dans le site
```gherkin
Fonctionnalité: Header et menus

  Scénario: AC-03.1 Sous-menu Solutions au clavier
    Étant donné un visiteur sur ordinateur, au clavier
    Quand il active le bouton "Solutions"
    Alors le sous-menu affiche 3 piliers et 4 services
    Et le bouton annonce l'état "développé"
    Quand il appuie sur Échap
    Alors le sous-menu se ferme et le focus revient sur "Solutions"

  Scénario: AC-03.2 Page courante signalée sans dépendre de la couleur
    Étant donné un visiteur sur "/a-propos/agence/"
    Alors le lien "Agence" porte l'état "page courante" et un soulignement visible

  Scénario: AC-03.3 Menu mobile
    Étant donné un visiteur sur un écran de 390 px
    Quand il active le bouton "Ouvrir le menu"
    Alors le panneau s'ouvre sous le header, le bouton s'appelle "Fermer le menu"
    Et le bouton WhatsApp flottant est masqué
    Quand il appuie sur Échap
    Alors le panneau se ferme et le focus revient sur le bouton du menu
    Et les liens du panneau fermé ne sont pas atteignables au clavier

  Scénario: AC-03.4 Lien d'évitement
    Quand un visiteur appuie sur Tab dès le chargement d'une page
    Alors le premier élément atteint est "Aller au contenu", et il mène au contenu principal
```

### US-04 — Essayer la démo CleanPilot (services à la personne)
```gherkin
Fonctionnalité: Démo CleanPilot

  Contexte:
    Étant donné un visiteur sur "/" dans la section "Démos interactives"
    Et l'onglet "CleanPilot" sélectionné

  Scénario: AC-04.1 Affecter une mission
    Quand il choisit "Lucas" comme intervenant de la mission "Aide aux courses" de 11:30
    Alors le statut de la mission devient "Planifiée"
    Et le message "Aide aux courses de 11:30 affectée à Lucas." est annoncé

  Scénario: AC-04.2 Refuser un compte rendu vide
    Étant donné l'écran "Terrain" de la mission de Mme Bernard
    Quand il active "Enregistrer le compte rendu" sans rien écrire
    Alors le message "Le compte rendu est vide : écrivez une phrase, même « RAS »." est annoncé

  Scénario: AC-04.3 Refuser une validation incomplète
    Étant donné une consigne non cochée
    Quand il active "Confirmer l’intervention effectuée"
    Alors l'intervention n'est pas validée
    Et le message "Cochez toutes les consignes avant de confirmer l’intervention." est annoncé

  Scénario: AC-04.4 Valider une intervention
    Étant donné les 3 consignes cochées et un compte rendu enregistré
    Quand il active "Confirmer l’intervention effectuée"
    Alors le statut devient "Effectuée" avec l'heure de validation
    Et le bouton de confirmation est désactivé

  Scénario: AC-04.5 Exporter les données
    Étant donné l'écran "Admin"
    Quand il active "Exporter les données (CSV)"
    Alors un fichier "cleanpilot-missions-demo.csv" est téléchargé
    Et il s'ouvre dans un tableur avec les accents corrects et une ligne par mission

  Scénario: AC-04.6 Utilisable au clavier et au lecteur d'écran
    Alors tous les contrôles de la démo sont atteignables au clavier
    Et chaque changement d'état est annoncé par la zone de statut
    Et le focus reste sur le contrôle utilisé après chaque action
```

### US-05 — Essayer la démo Commerce Connect (commerce)
```gherkin
Fonctionnalité: Démo Commerce Connect

  Contexte:
    Étant donné un visiteur sur "/" avec l'onglet "Commerce Connect" sélectionné

  Scénario: AC-05.1 Ouverture directe depuis la page Web & métier
    Étant donné un visiteur sur "/applications-web-metier/"
    Quand il active "Essayer la démo Commerce Connect"
    Alors l'accueil s'affiche sur la section des démos, onglet "Commerce Connect" sélectionné

  Scénario: AC-05.2 Passer une commande
    Quand il ajoute "Pain de campagne" puis 2 "Croissant pur beurre"
    Et qu'il choisit "Paiement en ligne sécurisé (simulé)" puis "Valider la commande"
    Alors une nouvelle commande au statut "Nouvelle" apparaît dans le back-office
    Et un message de confirmation apparaît dans "Automatisation" si la confirmation est activée

  Scénario: AC-05.3 Panier vide
    Étant donné un panier vide
    Alors le bouton "Valider la commande" est désactivé

  Scénario: AC-05.4 Relance automatique
    Étant donné une commande au statut différent de "Retirée" et la relance activée
    Quand il active "Simuler la relance du lendemain"
    Alors une relance par commande en attente est ajoutée au journal

  Scénario: AC-05.5 L'IA ne publie rien sans validation
    Étant donné l'écran "IA optionnelle"
    Quand il active "Proposer une description" puis "Rejeter"
    Alors la description en ligne du produit est inchangée
    Et le message "Proposition rejetée : rien n’a été publié." est annoncé
    Et la mention "généré par un modèle de phrase local, sans appel à une IA" était visible avec la proposition

  Scénario: AC-05.6 Onglets au clavier
    Étant donné le focus sur l'onglet "CleanPilot"
    Quand il appuie sur la flèche droite
    Alors l'onglet "Commerce Connect" est sélectionné et reçoit le focus
```

### US-06 — Être orienté par le guide de choix (sans IA)
```gherkin
Fonctionnalité: Guide de choix

  Scénario: AC-06.1 Réponses incomplètes
    Quand le visiteur active "Voir ma recommandation" sans répondre aux 3 questions
    Alors le message "Répondez aux trois questions pour voir la recommandation." est annoncé
    Et le focus est placé sur la première question sans réponse

  Plan du scénario: AC-06.2 Recommandation
    Quand il répond "<départ>", "<utilisateurs>", "<priorité>" et valide
    Alors la recommandation "<résultat>" s'affiche et reçoit le focus
    Et le bouton "Échanger sur mon projet" est proposé

    Exemples:
      | départ                                    | utilisateurs                | priorité                         | résultat                          |
      | J’ai un outil à moderniser                | Mon équipe au bureau        | Un outil fiable sur la durée     | Refonte ou maintenance            |
      | Je perds du temps sur des tâches répétitives | Mon équipe au bureau     | Être opérationnel rapidement     | Automatisation & IA               |
      | Je veux vendre ou être trouvé en ligne    | Mes clients                 | Être opérationnel rapidement     | Site web & boutique en ligne      |
      | J’ai une idée d’application               | Mes équipes sur le terrain  | Tester l’idée avant d’investir   | Cadrage & prototypage             |
      | J’ai une idée d’application               | Mon équipe au bureau        | Un outil fiable sur la durée     | Application web & métier          |
      | J’ai une idée d’application               | Mes équipes sur le terrain  | Être opérationnel rapidement     | Application mobile                |

  Scénario: AC-06.3 Le contact humain reste proposé
    Alors chaque recommandation affiche "Ce guide oriente, il ne décide pas : un échange de 30 minutes permet de confirmer."
```

### US-07 — Estimer le temps gagné
```gherkin
Fonctionnalité: Calculateur de temps gagné

  Plan du scénario: AC-07.1 Calcul
    Quand le visiteur saisit <personnes> personnes, <minutes> minutes et <jours> jours
    Alors le résultat affiche "<heures> h" et "environ <jj> jours de travail"

    Exemples:
      | personnes | minutes | jours | heures | jj  |
      | 5         | 30      | 220   | 330    | 47  |
      | 12        | 30      | 220   | 792    | 113 |
      | 1         | 0       | 220   | 0      | 0   |

  Scénario: AC-07.2 Valeurs hors bornes
    Quand il saisit 900 personnes
    Alors le calcul utilise 500 personnes (borne maximale)

  Scénario: AC-07.3 Aucun prix et hypothèse affichée
    Alors aucun montant en euros n'est affiché
    Et l'hypothèse "60 %" est indiquée sous le résultat
```

### US-08 — Comprendre la méthode
```gherkin
Fonctionnalité: Méthode au défilement (accueil et 4 services)

  Scénario: AC-08.1 Étape active
    Quand le visiteur fait défiler la section jusqu'à centrer l'étape 3
    Alors seule l'étape 3 est mise en avant et la barre de progression est aux 3/4

  Scénario: AC-08.2 Sans animation
    Étant donné "réduire les animations" activé, ou JavaScript désactivé
    Alors toutes les étapes sont affichées à pleine opacité, sans déplacement
```

### US-09 — Illustration en rubans fluides
```gherkin
Fonctionnalité: Rubans fluides du hero

  Scénario: AC-09.1 Mettre en pause
    Quand le visiteur active "Mettre en pause"
    Alors l'animation s'arrête, le bouton s'appelle "Reprendre l’animation" et annonce l'état "activé"

  Scénario: AC-09.2 Réduire les animations
    Étant donné "réduire les animations" activé
    Alors les rubans sont figés, ne réagissent pas au pointeur et le bouton pause est absent

  Scénario: AC-09.3 Le défilement au doigt n'est pas bloqué
    Étant donné un téléphone tactile
    Quand le visiteur fait glisser verticalement son doigt sur l'illustration
    Alors la page défile

  Scénario: AC-09.4 Sobriété
    Étant donné l'animation en pause, ou l'illustration hors de l'écran
    Alors plus aucun dessin n'est calculé (0 image par seconde)
```

### US-10 — Trouver une réponse dans la FAQ
```gherkin
  Scénario: AC-10.1 Une question ouverte à la fois
    Quand le visiteur ouvre "Combien de temps faut-il ?"
    Alors la question précédemment ouverte se ferme
    Et la réponse est lisible au lecteur d'écran
```

### US-11 — Demander un échange (formulaire « Démarrer un projet »)
```gherkin
Fonctionnalité: Formulaire en 5 étapes (back-end inchangé)

  Scénario: AC-11.1 Champs obligatoires
    Étant donné l'étape 1 sans réponse
    Quand le visiteur active "Continuer"
    Alors le message "Complétez les champs obligatoires avant de continuer." est annoncé
    Et l'étape ne change pas

  Scénario: AC-11.2 Erreur signalée champ par champ (exigence B3 — ÉCART CONNU)
    Étant donné un e-mail invalide à l'étape "Vos coordonnées"
    Quand le visiteur active "Continuer"
    Alors le champ porte l'état invalide (aria-invalid)
    Et un message sous le champ explique quoi corriger
    Et le focus est placé sur le premier champ en erreur
    # Prototype : seule une bordure et un message global existent → à corriger par Law

  Scénario: AC-11.3 Progression annoncée
    Quand le visiteur passe à l'étape suivante
    Alors le texte "Étape X / 5" est mis à jour

  Scénario: AC-11.4 Bouton WhatsApp
    Étant donné les étapes 1 à 4 du formulaire
    Alors le bouton WhatsApp flottant est masqué
    Quand l'étape "Choisir un créneau" s'affiche, ou qu'une erreur d'envoi survient
    Alors le bouton WhatsApp est de nouveau visible

  Scénario: AC-11.5 Erreur d'envoi
    Étant donné le serveur indisponible (mode de test)
    Quand le visiteur envoie l'étape 4
    Alors le message "La demande n’a pas pu être envoyée. Réessayez ou contactez Synumanus par email/WhatsApp." est annoncé
    Et ses réponses sont conservées

  Scénario: AC-11.6 Calendrier de test local
    Étant donné l'URL du calendrier systeme.io non configurée, en local
    Quand l'étape 5 s'affiche
    Alors le calendrier simulé s'affiche avec "Simuler la réservation"
```

### US-12 — S'inscrire à la newsletter
```gherkin
  Scénario: AC-12.1 Consentement obligatoire
    Quand le visiteur saisit un e-mail sans cocher le consentement et active "S’inscrire"
    Alors l'inscription n'est pas envoyée et le navigateur signale la case obligatoire

  Scénario: AC-12.2 Succès
    Étant donné un e-mail valide et le consentement coché (mode de test)
    Quand il active "S’inscrire"
    Alors le message "Merci. Votre inscription a bien été prise en compte." est annoncé
```

### US-13 — Pages piliers et services
```gherkin
  Scénario: AC-13.1 Fil d'Ariane
    Étant donné "/services/refonte-application-mobile/"
    Alors le fil d'Ariane affiche "Accueil / Applications mobiles / Refonte"
    Et le dernier élément porte l'état "page courante"

  Scénario: AC-13.2 Lien vers la démo CleanPilot
    Étant donné "/applications-mobiles/"
    Quand le visiteur active "Essayer la démo CleanPilot"
    Alors il arrive sur la section des démos de l'accueil

  Scénario: AC-13.3 Appel final
    Alors chaque page pilier et service se termine par "Parlons de votre projet" et le bouton "Échanger sur mon projet"
```

### US-14 — Page Agence
```gherkin
  Scénario: AC-14.1 Plan accessible
    Alors le plan des bureaux est annoncé comme une image, avec un titre et une description
    Et la légende "Illustration — plan stylisé, non contractuel" est visible

  Scénario: AC-14.2 Lieu
    Alors la section "Nos bureaux" indique "Les Tricolores" et "Neuilly-sur-Seine" et l'accueil sur rendez-vous
```

### US-15 — Pages légales
```gherkin
  Scénario: AC-15.1 Sommaire
    Quand le visiteur active un lien du sommaire
    Alors la section correspondante s'affiche sous le header, sans être masquée par lui
```

### US-16 — Page 404 (à créer, B5 §4.10)
```gherkin
  Scénario: AC-16.1 Adresse inconnue
    Quand un visiteur ouvre "/page-qui-n-existe-pas/"
    Alors le serveur répond 404
    Et la page affiche "Cette page n’existe pas ou a été déplacée" et les liens Accueil, Solutions, "Échanger sur mon projet"
```

### US-17 — Référencement
```gherkin
  Scénario: AC-17.1 Titres uniques
    Alors chaque page a un title et une meta description uniques

  Scénario: AC-17.2 Données structurées
    Étant donné l'accueil
    Alors l'outil de test des résultats enrichis de Google reconnaît "ProfessionalService" et "FAQPage" sans erreur
```

---

## 2. Checklist UX/UI et accessibilité (WCAG 2.2 AA)

| ID | Critère | Référence | Méthode | ✔ prototype |
|---|---|---|---|---|
| A01 | 0 violation axe-core sur les pages v2 | multiple | Automatique | ✔ (23/11) |
| A02 | Navigation complète au clavier, sans piège | 2.1.1, 2.1.2 | Manuel | — |
| A03 | Focus visible partout, jamais masqué par le header collant | 2.4.7, 2.4.11 | Manuel | — |
| A04 | Ordre de focus logique (B5 §6) | 2.4.3 | Manuel | — |
| A05 | Contraste texte ≥ 4,5:1, composants ≥ 3:1 | 1.4.3, 1.4.11 | Automatique + manuel (états survol et focus) | ✔ axe |
| A06 | Information jamais portée par la seule couleur (statuts, erreurs, page courante) | 1.4.1 | Manuel | — |
| A07 | Reflow à 320 px et zoom 200 % sans défilement horizontal | 1.4.10, 1.4.4 | Manuel | 375 px ✔ |
| A08 | Espacement du texte modifié (outil bookmarklet) sans perte | 1.4.12 | Manuel | — |
| A09 | Cibles ≥ 24 px (2.5.8) ; objectif Synumanus 44 px | 2.5.8 | Manuel | — (Q6 B5) |
| A10 | Mouvement : pause des rubans, aucune animation si réduction demandée | 2.2.2, 2.3.3 | Manuel | ✔ |
| A11 | Formulaires : libellés visibles, erreurs identifiées et suggérées, `aria-invalid` | 3.3.1, 3.3.3, 4.1.2 | Manuel | **écart (AC-11.2)** |
| A12 | Messages d'état annoncés (démos, guide, calculateur, newsletter, formulaire) | 4.1.3 | Lecteur d'écran | — |
| A13 | Titres hiérarchisés, un H1, repères (header, nav, main, footer) | 1.3.1, 2.4.6 | Lecteur d'écran | — |
| A14 | Langue de la page `fr` | 3.1.1 | Automatique | ✔ |
| A15 | Liens explicites hors contexte ; ouverture dans un nouvel onglet annoncée | 2.4.4 | Manuel | — |
| A16 | Images : décoratives masquées, plan Agence décrit | 1.1.1 | Lecteur d'écran | — |
| A17 | Aide cohérente : contact (WhatsApp, échange) au même endroit sur toutes les pages | 3.2.6 | Manuel | — |
| U01 | Rendu conforme au prototype v0.9 (ordinateur 1440 px, mobile 390 px) | B4 | Revue Lili | — |
| U02 | Microcopie identique au B5 (messages des démos, du guide, du formulaire) | B5 | Manuel | — |
| U03 | Aucune donnée réelle dans les démos ; mentions « données fictives » visibles | Charte | Manuel | ✔ |
| U04 | Aucun prix Synumanus affiché | Décision 16/11 | Manuel | ✔ |
| P01 | LCP < 2,5 s, CLS < 0,1, INP < 200 ms (mobile 4G simulé) | Performance | Lighthouse / PageSpeed | à mesurer |
| P02 | Aucune erreur dans la console | — | Automatique | ✔ |

### Matrice navigateurs, appareils et technologies d'assistance
| Environnement | Priorité |
|---|---|
| Chrome Android (téléphone réel, milieu de gamme) | P1 |
| Safari iOS (iPhone réel) | P1 |
| Chrome, Edge, Firefox, Safari — ordinateur | P1 |
| NVDA + Firefox (Windows) | P1 |
| VoiceOver iOS et macOS | P1 |
| TalkBack (Android) | P2 |
| Clavier seul (sans souris) | P1 |
| Zoom navigateur 200 % et 400 % (reflow) | P1 |

---

## 3. Protocole de test utilisateur

**Objectif** : vérifier que la cible (dirigeants de TPE et PME, maîtrise numérique moyenne) comprend l'offre, trouve le bon service et demande un échange sans aide.

**Participants** : 5 personnes de la cible primaire (BTP, services, commerce, associations), dont au moins 2 sur mobile et 1 personne utilisant une aide technique ou peu à l'aise avec le numérique. Recrutement par TawfiqDev ; aucun lien avec un projet client en cours.

**Format** : 30 minutes, à voix haute, en présentiel aux Tricolores ou en visio ; site sur un environnement de test (mode mock : aucun envoi réel). Consentement écrit ; enregistrement d'écran **seulement** avec accord ; résultats anonymisés (P1 à P5).

| # | Tâche (consigne lue au participant) | Réussite | Temps cible |
|---|---|---|---|
| T1 | « En regardant cette page 10 secondes, dites-moi ce que fait cette entreprise. » | Cite « applications » + « sur mesure » ou un exemple métier | 10 s |
| T2 | « Vos techniciens remplissent des bons papier. Trouvez ce que Synumanus propose pour ça. » | Arrive sur Applications mobiles ou la démo CleanPilot | < 60 s |
| T3 | « Dans la démo, affectez la mission de 11 h 30 à Lucas, puis confirmez l’intervention de 9 h. » | Les 2 actions sont faites | < 3 min |
| T4 | « Utilisez le guide pour savoir par où commencer avec votre propre situation. » | Une recommandation s’affiche et le participant la reformule | < 90 s |
| T5 | « Combien d’heures votre équipe pourrait-elle récupérer par an ? » | Résultat du calculateur lu | < 60 s |
| T6 | « Vous voulez en parler à quelqu’un : demandez un échange. » | Atteint l’étape « Choisir un créneau » (mode test) | < 4 min |
| T7 | « Où se trouvent les bureaux ? » | Cite les Tricolores, à Neuilly-sur-Seine | < 45 s |

**Mesures** : taux de réussite par tâche, temps, erreurs et hésitations, citations marquantes, score **SUS** (questionnaire standard de 10 questions) en fin de séance.
**Seuils de réussite (proposés, à valider par TawfiqDev)** : chaque tâche réussie par au moins 4 participants sur 5 ; SUS moyen ≥ 75 ; aucun blocage d'accessibilité.
**Résultats** : à mesurer (aucun test n'a encore eu lieu). Synthèse rédigée par Lili ; chaque problème est qualifié (bug d'implémentation, trou dans la spec, défaut de conception) et attribué.

### Indicateurs après mise en ligne (Plausible)
Conversion visite → formulaire, formulaire → rendez-vous, abandon par étape, usage des démos, du guide et du calculateur (événements personnalisés sans cookie) : **à mesurer** ; comparaison avec les 4 semaines de référence du site actuel (décision du 17/11).

---

## 4. Circuit de validation
1. **Ace** vérifie la testabilité de chaque critère (AC, checklist, protocole) et propose des corrections.
2. **Lili** intègre les remarques et publie la v1.1.
3. **TawfiqDev** valide la version finale (critères d'acceptation = propriété du CEO).
4. Toute modification ultérieure d'un critère validé passe par TawfiqDev (gestion des changements).
