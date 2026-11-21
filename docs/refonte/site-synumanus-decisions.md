# Journal des décisions — Site Synumanus

| Date | Décision | Justification | Décideur |
|---|---|---|---|
| 16/11/2026 | ~~Hero photo plein fond + voile bleu, modèle commun des pages services~~ — limité au site actuel (`fix/05`) ; remplacé pour la refonte le 17/11 | Cohérence inter-services | TawfiqDev |
| 16/11/2026 | Encarts de preuve : carte titre + sous-titre, alignée à gauche (desktop et mobile) | Cohérence, lisibilité | TawfiqDev |
| 16/11/2026 | Sous-titres d'encarts ≥ 12 px, contraste ≥ 4,5:1 | WCAG 2.2 AA | TawfiqDev |
| 16/11/2026 | Refonte complète du site avant tout nouveau développement ; corrections `fix/05` limitées aux écarts bloquants | Ne pas corriger un design qui sera remplacé | TawfiqDev |
| 16/11/2026 | Objectif : demandes qualifiées / rendez-vous pris | Le parcours de conversion est l'actif central du site | TawfiqDev |
| 16/11/2026 | Cible primaire TPE/PME et entrepreneurs ; secteurs industrie/finance/santé → cas d'usage (lot 2) | Alignement sur la stratégie (Organisation V2) | TawfiqDev |
| 16/11/2026 | Offre en 3 piliers : Mobile · Web & métier · Automatisation & IA ; mobile = expertise phare | Couvrir l'offre réelle sans diluer le positionnement | TawfiqDev |
| 16/11/2026 | ~~Identité : évolution (logo + palette conservés)~~ — remplacée ci-dessous | — | TawfiqDev |
| 16/11/2026 | MVP / lot 2 définis ; URLs conservées, 301 si suppression | Mise en ligne rapide sans perte SEO | TawfiqDev |
| 16/11/2026 | Voix « nous / Synumanus », « je » sur Agence ; CTA unique « Échanger sur mon projet » | Crédibilité agence + interlocuteur unique | TawfiqDev |
| 16/11/2026 | Planning hypothèse : conception 4 sem., dev 4 sem., mise en ligne mi-février 2027 | Rythme Scrum, capacité à confirmer par Shanks | TawfiqDev (hypothèse) |
| 16/11/2026 | Identité : direction « Graphite » (DESIGN.md) comme base de la refonte | Choix CEO : image premium et tech | TawfiqDev |
| 16/11/2026 | Aucun prix affiché sur le site | Choix CEO | TawfiqDev |
| 16/11/2026 | Pas de références au lancement ; réalisations = futures apps Synumanus, ajoutées après la mise en ligne | Aucune référence publiable aujourd'hui | TawfiqDev |
| 16/11/2026 | Identité : option B « Graphite × bleu Synumanus » (structure Graphite, accent bleu ciel #7DD3FC au lieu de l'orange, aperçus d'apps encadrés, ajustements AA obligatoires) | Image premium, cohérence logo, coût faible, accessibilité | TawfiqDev |
| 17/11/2026 | Lancement de la conception de la refonte par Lili, sur la base Graphite (DESIGN.md) option B ; aucun développement avant la gate G3 | Refonte complète avant développement | TawfiqDev |
| 17/11/2026 | Proposition de tokens v0.1 (specs) : Ash et Steel exclus du texte et des bordures de contrôle, écart entre sections ramené de 224 à 128 px, hero illustré par un aperçu d'app plutôt qu'un polygone abstrait — **à valider** | Contrastes AA calculés ; cible TPE | Lili (proposition) |
| 17/11/2026 | ~~Proposition~~ **Validé (option B)** — Remplacer, dans la refonte, le hero « photo plein fond + voile bleu » (décision du 16/11) par un hero Graphite : fond `#0a0a0a`, titre à gauche, aperçu d'application fictive encadré à droite. La photo reste réservée à la page Agence. Le modèle photo reste sur le site actuel (`fix/05`) jusqu'à la mise en ligne, avec images converties en WebP. | Incohérent avec Graphite, photos génériques, 1,8 à 2,3 Mo par image ; un aperçu concret répond mieux à H2 | TawfiqDev |
| 17/11/2026 | B1 Cadrage validé (v1.0) | Gate G3 — étape 1 | TawfiqDev |
| 17/11/2026 | Outil d'audience : Plausible | RGPD, simplicité | TawfiqDev |
| 17/11/2026 | B2 validé (v1.0) ; pages lot 2 retirées du menu, URLs conservées | Cohérence visuelle sans perte SEO | TawfiqDev |
| 17/11/2026 | « Méthode » = section de l'accueil + ancre `/#methode` | Moins de pages à maintenir | TawfiqDev |
| 17/11/2026 | Formulaire : explorer une variante en 4 étapes en B3 | Réduire l'abandon ; à mesurer | TawfiqDev |
| 17/11/2026 | Bouton WhatsApp flottant masqué pendant la saisie du formulaire (étapes 1 à 3), réaffiché à l'étape créneau et en cas d'erreur | Ne pas couvrir le bouton « Continuer » sur mobile | TawfiqDev |
| 19/11/2026 | Lancement de B4 (design system v2 + prototype HTML sur la branche de travail) à la demande de TawfiqDev, **sans validation formelle de B3 v0.2** — à régulariser à la revue G3 | Demande explicite du CEO ; le prototype sert de support à la validation B3 + B4 | TawfiqDev (demande) |
| 19/11/2026 | **Proposition** — Synthèse des 3 références : base Graphite option B conservée ; ajouts Basis Theory (bande « papier » claire pour les sections de lecture, feuilles superposées, filets de construction, bandeau d'annonce) et Column (étiquettes mono à pastille, rangée de chiffres, bloc de données) — **à valider** | Lisibilité des sections denses pour la cible TPE ; alternance sombre/clair qui rythme les pages longues ; aucun coût de dev supplémentaire | Lili (proposition) |
| 19/11/2026 | **Proposition** — Accent sur fond clair : `#0369a1` (le bleu `#7DD3FC` est interdit sur papier, 1,5:1) — à valider | WCAG 2.2 AA | Lili (proposition) |
| 19/11/2026 | Formulaire « Démarrer un projet » : 5 étapes et HTML conservés en v2 (seul le style change) en attendant la réponse de Law sur le back-end | Back-end PHP hors périmètre ; question B3 n° 1 ouverte | Lili |
| 19/11/2026 | Sélecteur de langue FR/EN retiré du footer v2 | Multilingue exclu du périmètre ; lien EN sans contenu = trompeur | Lili (à valider) |
| 20/11/2026 | **Abandon du thème sombre** : la refonte passe en version claire (papier blanc Basis Theory, bandes `#f6f6f8` Column, structure Graphite). Remplace l'identité « Graphite option B » du 16/11 et la proposition « bande papier » du 19/11 | Choix CEO | TawfiqDev |
| 20/11/2026 | Bouton principal en bleu ciel `#7DD3FC` avec texte `#18181b` ; accent en texte `#0369a1` (le bleu ciel est interdit en texte sur fond clair) | WCAG 2.2 AA ; continuité du bleu Synumanus | Lili (appliqué, à valider en G3) |
| 20/11/2026 | Chiffres et engagements affichés **confirmés** : « 2 à 4 mois » pour une V1, « 1 à 3 semaines » de cadrage, « données hébergées en Europe » | Validation CEO | TawfiqDev |
| 20/11/2026 | Hero animé, surtout sur l'accueil : scénario « bon d'intervention » de ≈ 4 s (une lecture, bouton « Rejouer »), entrée animée plus courte sur les autres pages. Assouplit la règle B3 §7 « apparitions ≤ 300 ms » : texte du hero en 0,5 s avec un décalage de 70 ms (fin ≤ 0,8 s) | Demande CEO ; reste conforme au critère WCAG 2.2.2 (< 5 s, pas de boucle) et respecte « réduire les animations » | TawfiqDev (demande) / Lili (règles) |
| 20/11/2026 | Accueil : plus de téléphone dans le hero → illustration abstraite interactive (sphère de points + anneau) qui réagit à la souris et au toucher ; séquence d'arrivée < 5 s, puis immobile sans action de l'utilisateur | Demande CEO (référence ruji.fr, non consultable depuis l'environnement de travail) ; conforme WCAG 2.2.2 | TawfiqDev (demande) / Lili (conception) |
| 20/11/2026 | Accueil : la sphère de points est remplacée par des **rubans fluides sur dégradé maillé**, interactifs (souris et doigt) ; animation continue avec bouton « Mettre en pause » | Direction choisie par le CEO ; WCAG 2.2.2 (mouvement continu → mécanisme de pause) | TawfiqDev (direction) / Lili (conception) |
| 21/11/2026 | Logo fourni par TawfiqDev intégré (header, footer, favicon, icône Apple, image de partage). Filigrane « Dol… » effacé de la copie web ; source vectorielle sans filigrane demandée avant la mise en ligne | Image fournie en PNG avec un filigrane de générateur | TawfiqDev (fourniture) / Lili (intégration) |
| 21/11/2026 | Logo de l'ancien site **conservé** pour la refonte ; fichier SVG souhaitable, non bloquant | Continuité de marque ; logo déjà utilisé publiquement | TawfiqDev |
| 21/11/2026 | **Règle de travail** : à chaque étape, Lili envoie un aperçu du site (captures ordinateur et mobile) pour décision | Décider sur un rendu réel, pas sur une description | TawfiqDev |
| 21/11/2026 | Page Agence : pas de photo disponible → illustration (plan d'architecte stylisé, mentionnée « non contractuelle ») + section « Nos bureaux » : locaux des Tricolores à Neuilly-sur-Seine, sur rendez-vous. Pas de photo générée par IA d'un lieu réel (risque de tromper le visiteur ; génération Figma payante) | Honnêteté de l'information, coût nul, cohérence avec le style « papier technique » | TawfiqDev (demande) / Lili (choix de l'illustration) |
