# Revue de testabilité de B6 — Refonte du site Synumanus

Version 1.0 — 23/11/2026 — Ace (QA) → Lili (rédaction de la v1.1), copie TawfiqDev (propriétaire des critères), Law, Dragon.
Objet : `site-synumanus-b6-recette.md` v1.0 (51 critères d'acceptation, checklist de 23 points, protocole de test utilisateur).
Méthode : relecture critère par critère (oracle observable ? données et état initial définis ? environnement disponible ? automatisable ?) + vérifications ponctuelles sur le prototype et la configuration (`config.js`, `local_server.py`).
**Aucun test n'a été exécuté dans cette revue** : seule la testabilité est évaluée.

---

## 1. Synthèse

| Verdict | Nombre | Critères |
|---|---|---|
| Testables tels quels | 24 | 02.1, 03.2, 03.4, 04.1, 04.2, 04.3, 05.3, 05.5, 05.6, 06.1, 06.3, 07.3, 08.2, 09.3, 10.1, 11.1, 11.4, 13.1, 13.2, 13.3, 14.1, 14.2, 15.1, 17.1 |
| À reformuler (oracle ou précondition imprécis) | 24 | 01.1, 01.2, 01.3, 02.2, 03.1, 03.3, 04.4, 04.5, 04.6, 05.1, 05.2, 05.4, 06.2, 07.1, 07.2, 08.1, 09.1, 09.2, 09.4, 11.3, 11.5, 12.1, 12.2, 17.2 |
| Bloqués (dépendance non levée) | 3 | 11.2 (microcopie par champ absente + écart d'implémentation), 16.1 (page 404 inexistante, réponse 404 du serveur non configurée), 11.6 (vrai calendrier configuré, voir R1) |
| **Total** | **51** | |

Avis : **B6 est une bonne base, testable à un peu moins de 50 % en l'état (24 critères sur 51).** Les reformulations sont surtout des précisions d'oracle (valeur d'attribut, mesure, format). Trois points bloquants dépendent de Lili (microcopie), de Law (404, formulaire) et de Dragon (environnement de test).

---

## 2. Remarques par critère (propositions à Lili, qui rédige la version finale)

| Critère | Problème de testabilité | Proposition de reformulation |
|---|---|---|
| AC-01.1 | « visible sans défiler » : pas de mesure, dépend du chargement des polices | « Alors le bord inférieur du bouton "Échanger sur mon projet" est ≤ 667 px, mesuré après chargement des polices » (mesuré sur le prototype : 621 px ✔) |
| AC-01.2 | « n'importe quelle page » | Lister les 12 pages v2 + la 404 ; automatisable (Playwright) |
| AC-01.3 | « immédiatement » non mesurable | « Alors aucune animation n'est active sur le hero (`document.getAnimations()` vide) et l'opacité du titre, du chapeau et des boutons est 1 au premier rendu » |
| AC-02.2 | « annoncée » | « Alors un repère de navigation porte le nom accessible "Choisissez votre parcours" » |
| AC-03.1 | « annonce l'état développé » ; fermeture au clic extérieur non couverte | « Alors `aria-expanded="true"` sur "Solutions" » ; ajouter : « Quand il clique hors du sous-menu, Alors il se ferme » et « Quand le focus quitte le sous-menu, Alors il se ferme » |
| AC-03.3 | « s'ouvre sous le header » | « Alors le haut du panneau est ≥ au bas du header » ; « liens non atteignables » = « le panneau fermé porte l'attribut `inert` » |
| AC-04.x (contexte) | Les démos gardent leur état en mémoire : l'ordre des tests change le résultat | Ajouter au Contexte : « Et la page vient d'être chargée (état initial des données fictives) » |
| AC-04.4 | « avec l'heure de validation » : valeur variable | « Alors le statut affiche "Effectuée à HH:MM" (format 24 h) » |
| AC-04.5 | « s'ouvre dans un tableur avec les accents corrects » : manuel et subjectif ; iOS Safari ne télécharge pas toujours un fichier Blob | Automatisable : « le fichier commence par le BOM UTF-8, utilise ";" comme séparateur, contient 1 ligne d'en-tête + 3 lignes » ; manuel : ouverture dans Excel et Numbers. Préciser le comportement attendu sur iPhone (aperçu ou téléchargement) |
| AC-04.6 | « tous les contrôles » | Énumérer : onglets, 4 chapitres, zone d'écran défilante, contrôles de chaque écran, navigation basse ; « le focus reste » = « l'élément actif après l'action a la même clé `data-key` qu'avant » |
| AC-05.1 | « s'affiche sur la section » ; risque : le header collant masque le titre | « Alors le titre "Essayez, avant même de nous appeler" est entièrement visible sous le header, et l'onglet Commerce Connect a `aria-selected="true"` » |
| AC-05.2 | Deux résultats dans un scénario, dont un conditionnel | Scinder : « confirmation activée → 1 message dans le journal » / « confirmation désactivée → aucun message » ; préciser le numéro attendu (1042 pour la 1re commande) |
| AC-05.4 | Nombre de relances dépendant des données | « Étant donné l'état initial et une commande passée, Alors 2 relances sont ajoutées (commandes 1041 "Prête" et 1042 "Nouvelle") » |
| AC-06.2 | 6 lignes pour 36 combinaisons possibles | Garder les 6 exemples en recette manuelle ; **ajouter la table de décision complète (4 × 3 × 3 = 36) en test automatisé** (coût de maintenance faible : 1 fichier de données) |
| AC-07.1 | Format : espace insécable fine (U+202F) dans « 33 000 » ; règle d'arrondi implicite | « Arrondi au plus proche » ; l'oracle compare après normalisation des espaces. Ajouter les saisies vides, négatives, décimales et non numériques |
| AC-07.2 | Le champ affiche toujours 900 alors que le calcul utilise 500 : ambigu pour l'utilisateur | **Décision UX à prendre par Lili** : corriger la valeur affichée, ou afficher un message. Oracle actuel : résultat « 33 000 h » pour 900 / 30 / 220 |
| AC-08.1 | « centrer l'étape 3 » ; la barre n'est visible qu'en desktop (> 960 px) | « Étant donné un écran de 1440 × 900, Quand le centre de l'étape 3 est dans la bande centrale de 10 % de l'écran, Alors seule l'étape 3 a la classe active et la barre est à 75 % » |
| AC-09.1 | « l'animation s'arrête » non observable | « Alors `aria-pressed="true"` et deux captures du canvas à 1 s d'intervalle sont identiques » |
| AC-09.2 | « ne réagissent pas au pointeur » | « Alors une capture du canvas avant et après un déplacement du pointeur est identique » |
| AC-09.4 | « 0 image par seconde » : non observable en boîte noire | Mesure par l'outil Performance de Chrome (aucune trame liée à `hero-flow.js` pendant 2 s), ou par un script de test qui compte les dessins du canvas |
| AC-11.3 | Lié au nombre d'étapes, qui va changer (Q1 de B5) | « Alors le texte "Étape X / N" est mis à jour, N étant le nombre d'étapes en vigueur » |
| AC-11.5 | « serveur indisponible (mode de test) » : aucune procédure ; le mode mock répond toujours « succès » | Procédure à fournir par Law ou Dragon : arrêter PHP, ou pointer `projectEndpoint` vers une URL de test qui renvoie 500. Oracle : message affiché + champs toujours remplis |
| AC-12.1 | Validation native du navigateur : message et apparence différents selon le navigateur | « Alors aucune requête n'est envoyée à `/api/newsletter.php` et la case de consentement est signalée invalide » |
| AC-12.2 | Environnement non précisé : sans PHP (simple serveur statique), l'envoi échoue | « Étant donné le site servi par `local_server.py` en mode mock » |
| AC-17.2 | Depuis 2023, Google n'affiche plus les résultats enrichis de FAQ pour la plupart des sites : l'outil Google peut ne rien signaler même avec un balisage valide | « Alors le validateur schema.org (validator.schema.org) analyse "ProfessionalService" et "FAQPage" sans erreur » |
| AC-11.2 | **Bloqué** : microcopie des erreurs par champ absente (seul l'exemple de l'e-mail existe en B3) ; implémentation absente | Lili : fournir le message de chaque champ obligatoire (nature, maturité, besoin, budget, nom, prénom, e-mail, téléphone). Law : `aria-invalid`, message sous le champ, focus sur le premier champ en erreur |
| AC-16.1 | **Bloqué** : page 404 absente ; `local_server.py` et l'hébergement ne renvoient pas encore une page 404 personnalisée | Law : créer la page ; Dragon : configurer la réponse 404 sur Hostinger (et en local) |

### Critères manquants (proposés)
| Proposition | Pourquoi |
|---|---|
| AC-18.1 « Les anciennes URL (lot 2 et pages conservées) répondent 200 et s'affichent sans erreur JS » | Décision B2 : aucune URL perdue ; risque de régression sur les pages restées dans l'ancien design |
| AC-18.2 « Sans JavaScript, la section des démos affiche "Activez JavaScript pour essayer les démonstrations." » | Comportement présent mais non couvert |
| AC-03.5 « Sur une page pilier ou service, "Solutions" porte l'état page courante » | Couverture de la navigation |
| AC-11.7 « Le champ caché anti-robot (`website`) rempli bloque l'envoi » et « un double clic sur Envoyer ne crée qu'une demande » | Sécurité de base et idempotence (déjà testées côté PHP par `test_project_api.py` : à rattacher) |

---

## 3. Risques de recette identifiés

| # | Risque | Impact | Probabilité | Réponse |
|---|---|---|---|---|
| R1 | `config.js` pointe vers le **vrai calendrier systeme.io** : en test, l'étape 5 affiche le calendrier réel, et un testeur peut réserver un vrai créneau (et déclencher les relances) | Élevé | Élevée | Dragon / Law : une configuration de test avec `systemeIoCalendarUrl` vide, ou un calendrier de test dédié. **Aucun test du formulaire jusqu'à l'étape 5 avant correction** |
| R2 | Données de prospects réelles versionnées dans `var/` (tâche urgente ouverte) | Élevé (RGPD) | Avérée | Dragon : retrait + purge ; recette uniquement avec la base mock |
| R3 | Pas d'environnement de pré-production : les mesures de performance (P01) faites en local ne sont pas représentatives | Moyen | Élevée | Dragon : pré-production sur Hostinger avant les mesures P01 |
| R4 | Le modérateur des tests utilisateurs est le fondateur : biais de complaisance et réponses orientées | Moyen | Élevée | Modérateur neutre, ou script strict avec TawfiqDev en simple observateur |
| R5 | Law et Ace reposent sur le même modèle d'IA : angles morts communs | Moyen | Moyenne | Revue humaine des points critiques par TawfiqDev + tests sur appareils réels (non délégables) |

---

## 4. Checklist et protocole : remarques

| Point | Remarque | Proposition |
|---|---|---|
| A09 | « objectif 44 px » sans seuil d'échec | Critère bloquant : ≥ 24 px (WCAG 2.5.8 AA) ; 44 px = objectif Synumanus (écart mineur). Les contrôles internes des démos à 40 px passent le seuil AA (avis QA sur la Q6 de B5 : acceptable, décision TawfiqDev) |
| A07 / matrice | Le texte indique 200 %, la matrice 200 % et 400 % | Harmoniser : 200 % (1.4.4) + largeur 320 px, soit 400 % à 1280 px (1.4.10) |
| U01 | « conforme au prototype » : subjectif | Captures de référence (1440 et 390 px) validées par Lili, comparées visuellement ; écarts classés bloquant, majeur ou mineur selon B5 |
| P01 | Conditions de mesure absentes ; l'INP ne se mesure pas en laboratoire | Lighthouse mobile, 3 passages, médiane, en pré-production ; en laboratoire, le TBT (< 200 ms) remplace l'INP ; INP réel mesuré après mise en ligne |
| Protocole T1 | Réussite subjective | Grille de codage : réussite = cite « application » ou « sur mesure » et au moins un exemple métier |
| Protocole (temps) | Début et fin du chronomètre non définis | Début = fin de la lecture de la consigne ; fin = résultat atteint ou abandon déclaré |
| Protocole T6 | Atteindre l'étape 5 affiche le vrai calendrier (R1) | Exécuter T6 uniquement sur l'environnement de test corrigé |
| Protocole | Pas de formulaire de consentement ni de script de modération | Lili : modèle de consentement (enregistrement facultatif, anonymisation P1–P5) et script de modération mot pour mot |

---

## 5. Automatisation recommandée (Playwright, un seul outil pour l'E2E et l'accessibilité)

| Priorité | Périmètre | Critères | Coût de maintenance (hypothèse) |
|---|---|---|---|
| 1 | axe-core sur toutes les pages v2 + contrôle d'absence d'erreur console | A01, P02, AC-01.2, AC-17.1 | Faible |
| 1 | Démos CleanPilot et Commerce Connect (parcours complets, depuis l'état initial) | AC-04, AC-05 | Moyen (sélecteurs `data-key` existants, stables) |
| 1 | Table de décision du guide (36 combinaisons) + calculateur (valeurs et bornes) | AC-06.2, AC-07 | Faible (données en tableau) |
| 2 | Navigation (sous-menu, menu mobile, lien d'évitement, fil d'Ariane, liens vers les démos) | AC-02, AC-03, AC-13 | Faible |
| 2 | Réduction des animations, pause des rubans | AC-01.3, AC-08.2, AC-09.1, AC-09.2 | Moyen |
| 3 | Formulaire jusqu'à l'étape 4 en mode mock | AC-11.1, AC-11.3, AC-11.4 | Moyen (dépend de Q1) |
| Manuel | Lecteurs d'écran, appareils réels, tactile, tableur, tests utilisateurs, performance en pré-production | A02–A17, AC-04.5 (ouverture), AC-09.3, protocole | — |
Hypothèse d'effort : 2 à 3 jours pour écrire cette suite (base : environ 25 scénarios automatisés, dont la moitié réutilise les scripts de vérification déjà écrits sur le prototype), puis ~0,5 jour par sprint de maintenance. À confirmer avec Shanks.

---

## 6. Actions demandées

| # | Action | Pour | Bloquant pour |
|---|---|---|---|
| 1 | Intégrer les reformulations du §2 et les critères manquants (B6 v1.1) | Lili | Validation B6 |
| 2 | Microcopie des erreurs par champ du formulaire | Lili | AC-11.2 |
| 3 | Décision UX sur la saisie hors bornes du calculateur | Lili | AC-07.2 |
| 4 | Configuration de test sans le vrai calendrier ; procédure de simulation d'erreur serveur | Dragon, Law | AC-11.5, AC-11.6, protocole T6 |
| 5 | Page 404 + réponse 404 du serveur | Law, Dragon | AC-16.1 |
| 6 | Pré-production Hostinger | Dragon | P01 |
| 7 | Valider les seuils (4/5, SUS ≥ 75), l'avis sur les cibles de 40 px et le choix du modérateur | TawfiqDev | Protocole, A09 |
