# B1 — Cadrage — Refonte du site Synumanus

Version 1.0 — 17/11/2026 — **validée par TawfiqDev** (validation donnée sur la v0.3 ; la v0.4 n'ajoute que la décision hero validée le même jour)
Changements depuis la v0.2 : question 3 close (identité option B actée) ; ajout de la section 7 « Direction visuelle » ; v0.4 : modèle de hero de la refonte (décision du 17/11).

## 1. Reformulation du besoin
Un dirigeant de TPE/PME qui arrive sur le site doit comprendre en moins de 10 secondes que Synumanus conçoit des applications sur mesure pour son métier, se reconnaître dans un cas concret, être rassuré sur la méthode et le coût, puis réserver un échange — sans jargon technique et quel que soit son niveau numérique.

Le site actuel est riche mais : pensé « mobile uniquement », orienté grands comptes (industrie, finance, santé), visuellement incohérent d'une page à l'autre, sans design system ni mesure d'audience.

## 2. Indicateurs UX
| Indicateur | Cible | Mesure |
|---|---|---|
| Conversion visite → début de formulaire | à fixer après 4 semaines de mesure (référence) | Outil d'audience RGPD |
| Conversion formulaire (étape 1) → rendez-vous pris | +30 % vs référence | Base prospects (`appointment_booked`) |
| Abandon par étape du formulaire | Aucune étape > 25 % d'abandon | Événements par étape |
| Compréhension de l'offre (test 5 secondes) | ≥ 4 testeurs sur 5 reformulent correctement | Test utilisateur, 5 dirigeants TPE/PME |
| Réussite de la tâche « trouver le service adapté et demander un échange » | ≥ 80 %, < 2 min | Test utilisateur |
| Accessibilité | 0 non-conformité bloquante WCAG 2.2 AA | Audit Ace + lecteur d'écran |
| Performance mobile | LCP < 2,5 s, CLS < 0,1 | Lighthouse / mesures terrain |

Toutes les valeurs de départ sont **à mesurer** : aucune donnée d'audience n'existe aujourd'hui.

## 3. Périmètre
**MVP (mise en ligne 1)** : Accueil · 3 pages piliers (Applications mobiles, Applications web & métier, Automatisation & IA) · 4 pages services mobiles · Agence · Démarrer un projet (interface refaite, logique conservée) · Mentions légales · Confidentialité · header, footer, bouton WhatsApp.

**Lot 2** : cas d'usage (ex-secteurs), Ressources (générateur de cahier des charges, radars tech), Actus, Conseil IA générative.

**Exclu** : CMS/blog, espace client, multilingue, refonte du back-end PHP et de la logique de relance systeme.io.

**Livrables UX attendus** : B2 personas + parcours + arborescence · B3 wireframes · B4 design tokens, composants, maquettes · B5 specs de handoff · B6 critères Gherkin + checklist accessibilité + protocole de test.

## 4. Hypothèses (à valider)
| # | Hypothèse |
|---|---|
| H1 | Les dirigeants TPE/PME arrivent surtout sur mobile → conception mobile-first |
| H2 | Ils se décident sur des exemples concrets de leur métier plus que sur la technologie |
| H3 | Le parcours en 5 étapes est conservé fonctionnellement ; seules l'interface et la microcopie changent (son nombre d'étapes pourra être challengé en B2) |
| H4 | Les URLs actuelles des services restent valides ; les pages piliers sont de nouvelles URLs |
| H5 | Aucune référence au lancement (confirmé CEO) → preuves = méthode, expérience (10 ans), engagements, exemples fictifs identifiés ; section « Réalisations » ajoutée quand les apps Synumanus existeront — pas de section vide au lancement |
| H6 | Photos : banque d'images ou génération, sans visage de client réel |

## 5. Risques d'incompréhension
| Risque | Effet | Prévention |
|---|---|---|
| Offre élargie qui dilue le message | Le visiteur ne sait plus ce que fait Synumanus | Mobile = expertise phare sur l'accueil ; piliers en second niveau |
| Jargon (TMA, MVP, API, refactoring) | Perte de la cible TPE | Glossaire de microcopie ; termes techniques toujours expliqués |
| Absence de prix (décision CEO) | Peur du coût, abandon | Rassurer sans chiffre : « premier échange gratuit et sans engagement », « devis détaillé après cadrage », étapes et durée type d'une V1, FAQ « combien ça coûte ? » expliquant les facteurs de coût |
| Absence de références clients | Manque de confiance | Méthode détaillée, engagements, page Agence incarnée |
| Ancienne / nouvelle navigation | Liens SEO cassés | Plan de redirection 301 (Law + Dragon) |
| Données d'audience absentes | Indicateurs non pilotables | Outil RGPD installé avant mise en ligne (Dragon) |

## 6. Questions ouvertes
1. ~~Prix~~ — tranché : aucun prix affiché.
2. ~~Références~~ — tranché : aucune au lancement.
3. ~~Adaptation de la direction « Graphite »~~ — tranché le 16/11 : option B « Graphite × bleu Synumanus » (voir §7).
4. ~~Outil d'audience~~ — tranché le 17/11 : **Plausible** (installation : Dragon).

## 7. Direction visuelle (option B « Graphite × bleu Synumanus »)
Source : `DESIGN.md` « Graphite » (référence d'inspiration, non reproduite à l'identique).

**Ce qu'on reprend :** fond quasi noir uni, typographie blanche précise et compacte, modules séparés par des bordures fines, rayons sobres (10 px cartes, 8 px boutons), CTA monochrome clair, images de produit encadrées plutôt que des photos d'ambiance.

**Ce qu'on adapte pour Synumanus :**
| Graphite | Synumanus | Raison |
|---|---|---|
| Accent orange `#ff8833` | Bleu ciel `#7DD3FC` (déjà `--sky-300`) | Cohérence avec le logo bleu |
| Spectre jaune → bleu | Dégradé bleu `#7DD3FC` → `#1D8CFF` | Identité bleue, pas de couleur chaude |
| matterFont | Inter (déjà chargée) | Pas de licence, aucun coût |
| Texte Ash `#737373` | Interdit en texte (4,18:1 < 4,5) ; réservé aux bordures de champs | WCAG 2.2 AA |
| Bordure de sélection Steel `#464646` | `#737373` | Steel = 2,10:1 < 3:1 requis pour un composant |
| Interligne de texte 1,25 | 1,5 à 1,6 | Lisibilité pour une cible à maîtrise numérique moyenne |
| Hero : polygone lumineux abstrait | Aperçu d'application encadré (écran mobile fictif) | La cible TPE se décide sur du concret (H2) |
| Hero : photo plein fond + voile bleu (site actuel) | Fond `#0a0a0a`, titre à gauche, aperçu d'application fictive encadré à droite, un par service, mention « exemple d'interface » ; photo réservée à la page Agence | Décision TawfiqDev du 17/11 (option B) |

**Conséquence pour l'existant :** les heros photo plein fond avec voile bleu (décision du 16/11, `fix/05`) restent en place sur le site actuel jusqu'à la mise en ligne de la refonte. Ils ne seront pas repris dans la nouvelle direction.
