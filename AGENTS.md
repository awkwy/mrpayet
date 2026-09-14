# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Fiches PDF téléchargeables

- Une séance référence ses fiches imprimables via `pdf:["<slug>"]` (résolu en
  `/fiches/<c.pdf>/<slug>.pdf`, voir le rendu dans
  `src/routes/c/[id]/[n]/+page.svelte`) ; le fichier doit exister dans
  `static/fiches/<c.pdf>/`, sinon le bouton de téléchargement pointe dans le
  vide. Le contenu source de ces fiches (une page HTML imprimable par atelier,
  méthode + exercices + corrigé) vit dans le projet frère en lecture seule
  `cours` (`eleve/<matière>/<slug>.html`), pas dans ce dépôt.
- Pour ajouter une fiche : lire le `.html` source dans `cours`, puis le rendre
  en PDF avec Chromium headless (même commande que `eleve/render.sh` dans ce
  projet frère, mais en sortant vers un répertoire de travail temporaire pour
  ne rien écrire dans le projet en lecture seule) :
  `chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf=<tmp>/<slug>.pdf file://<chemin>/<slug>.html`,
  puis copier le PDF obtenu dans `static/fiches/<matière>/`.

## Visualisations

- Les manipulations interactives vivent dans `src/lib/visualizations/` et sont
  enregistrées dans `registry.js` (liste et nombre exacts : lire ce fichier).
  Socle historique : `shared.js` (rendu `<canvas>`
  2D + `requestAnimationFrame`, helpers `box`/`slider`/`readout`/`Spring`/
  `createLoop`).
- **Migration D3 en cours** (canvas → `<svg>` animé par les transitions D3 ;
  imports modulaires `d3-selection`/`d3-transition`/`d3-drag`, pas le bundle
  `d3` ni `d3-scale`, pour le poids). Fiches déjà portées : `moyenne`,
  `mediane`, `moypond`, `fluctuation`, `batons`, `budget` (+ `alternatif`,
  `fusible` et `noeuds`, refontes — voir ci-dessous). Les autres restent sur
  `shared.js` (canvas) en attendant leur lot.
- `alternatif` est une **refonte** (pas une simple migration de graphe) :
  schéma de circuit avec symboles normalisés (source pile/générateur,
  interrupteur, lampe ⊗), animation de « remplissage » des fils à la fermeture
  du circuit (`stroke-dashoffset`) + paquets de courant en circulation, trois
  contextes (12 V continu / 230 V ~ / 400 V haute tension). Le contexte haute
  tension peint les fils en `--warn` (orange, pictogramme ⚠) et, interrupteur
  fermé, GRILLE la lampe prévue pour 12 V (flash de surtension, puis verre mort
  `--bg` + fêlure/filament rompu `--red` + éclats `--warn` ; jouée une seule
  fois, réparée en rouvrant l'interrupteur ou en changeant de contexte, état
  final direct si mouvement réduit). `--warn` / `--red` sont ici des jetons
  d'état légitimes (danger normalisé métier), jamais des séries de données.
  Bascule image réaliste ↔ symbole. Disposition
  **verticale imposée** (circuit en haut, trace tension/temps en dessous — jamais
  côte à côte) pour rester lisible sur un téléphone. Même contrat `d3.js`
  (imports modulaires, `springEase`, `prefers-reduced-motion`).
- `fusible` est une **refonte** analogue (schéma normalisé : pile 12 V, FUSIBLE
  juste après = rectangle traversé par son filament, cinq consommateurs lampes ⊗
  en parallèle sur grille alignée). Le filament chauffe `--g` → `--warn` →
  `--red` selon I / calibre (rouge seulement si I > calibre, cohérent avec la
  fusion), puis ROMPT en surintensité (arcs + flash joués une seule fois via
  drapeau `wasMelted`, mot FONDU, circuit dé-énergisé ; réversible sous le
  calibre). Jauge d'intensité sous le circuit : langage visuel de `budget`
  (barre I face au calibre, repère `--blue` pointillé). Boutons consommateurs +
  calibre, `role="img"` + `aria-label`, vue tableau repliable, paquets de
  courant ∝ I coupés sous `prefers-reduced-motion`. Même contrat `d3.js`.
- `noeuds` est une **refonte** analogue (schéma normalisé : pile, ampèremètre
  d'entrée en série, un nœud repéré point + libellé, deux branches parallèles
  après le nœud chacune avec son propre ampèremètre et sa lampe ⊗ — loi des
  nœuds I_entrée = I_gauche + I_droite lisible directement sur les trois
  appareils). Griller une lampe (boutons par branche + « tout réparer ») coupe
  sa branche avec le même code visuel que `fusible`/`alternatif` (verre mort
  `--bg`, contour + filament rompu `--red`, jeton d'état légitime pour un
  statut binaire) et fait retomber aussitôt l'ampèremètre d'entrée. `role="img"`
  + `aria-label` décrivant les trois ampèremètres, vue tableau repliable,
  paquets de courant coupés sous `prefers-reduced-motion`. Même contrat `d3.js`.
- Socle partagé : `d3.js` — `dotPlot` + `stackDots` (nuage de points sur axe
  gradué), `barField` (diagramme en bâtons sur axe catégoriel : `band(i)`,
  `yScale(frac)` ; `batons` y ajoute un tracé de secteurs local `arcPath` pour
  le mode circulaire), `linScale`, easing ressort `springEase`/`spring`, infobulle
  `tip` + conversion `vbToCss` ; `VB_W` = largeur logique du canvas historique,
  pour rendre à la même échelle que les fiches canvas voisines. CSS du cadre
  SVG : `.viz svg.d3viz` mutualisé avec `.viz canvas` dans
  `src/lib/styles/viz.css` (+ classes additives `.vtip`, `.viz-data`,
  `.read .v.b`, sans effet sur les fiches canvas).
- Toutes les fiches portées suivent la procédure `dataviz` (voir en-tête de
  chaque fichier) : couleurs **exclusivement** via `var(--…)` de `tokens.css` —
  série de données = teinte séquentielle unique `--g` ; valeur dérivée
  (moyenne, médiane, âge moyen) ou repère théorique (proportion `p`) = accent
  `--blue` ; jamais `--warn`/`--red` comme série de données — jetons d'état
  réservés, mais légitimes pour un vrai statut binaire (`budget` `--g`/`--red`
  finançable/dépasse, `alternatif` `--warn` haute tension, `fusible`
  `--warn`/`--red` filament qui chauffe puis fond, `noeuds` `--red` lampe
  grillée), toujours doublé d'un pictogramme + libellé, jamais la couleur
  seule. Palettes validées `--mode dark` avec le `validate_palette.js` fourni
  par la skill `dataviz` (lancé depuis le répertoire de la skill lors de son
  étape de validation, ce n'est pas un script de ce dépôt — voir les en-têtes
  de fichier pour les commandes exactes rejouées) ; les FAIL band/chroma sont
  la propriété du thème néon du site, pas corrigeables sans hex hors tokens.
  Accessibilité : vue tableau repliable, focus clavier = survol,
  `prefers-reduced-motion` respecté.
- Contrainte tenue : mobile d'abord / poids léger (voir `src/lib/styles/tokens.css`).
  Animations : jamais de saut instantané — easing amorti obligatoire.
- Pas de tests de visualisation dans la suite (`vitest` couvre `src/lib/stores/`,
  `src/lib/data/` et `src/lib/utils/`).

## TP / activité de manipulation dans une séance

Le schéma d'étape (`t`/`txt`/`img`/`apport`/`doc`/`q`) n'a pas de champ dédié
pour une activité de manipulation réelle (peser, mesurer, câbler…). Le pattern
« Avec matériel » / « Sans matériel » déjà utilisé dans les séquences source du
projet frère `cours` (ex. `sciences/physique/Securite_electrique_2PMV2_sequence.md`,
séance 2) se transpose directement dans un `apport` HTML : sous-titres en gras
« Avec matériel » (procédure réelle avec l'équipement) puis « Sans matériel »
(renvoi vers un `doc` de repli avec des valeurs déjà relevées), suivi de `q`
qui exploitent ce relevé de repli. Ça garde une vraie consigne de manipulation
pour l'enseignant équipé, sans bloquer celui qui ne l'est pas.

## Jeux de révision (automatismes)

- Deux mécanismes de révision « ludiques » complètent le quiz flash existant
  (`src/routes/flash/[classe]/[theme]`), même source de données
  (`$lib/data/automatismes.js`), mêmes points d'entrée depuis le sélecteur de
  thème (`src/routes/flash/[classe]/+page.svelte`) : **cartes à associer**
  (`[theme]/cartes`, memory 6 paires/12 cartes, dédupliquées par réponse pour
  éviter toute correspondance ambiguë — voir `dedupedItems` dans le
  composant) et **parcours par niveaux** (`[classe]/parcours`, une carte de
  progression par classe qui débloque les thèmes de `AUTO.c[classe].o` un par
  un puis un nœud « défi final »).
- Le parcours réutilise tel quel le quiz flash comme épreuve de nœud (pas un
  3ᵉ mécanisme) : `[theme]/+page.svelte` lit `?level=1` (thème) ou
  `?level=defi` (mélange, `?level=defi` sur la route `melange`) et
  valide/persiste via `$lib/stores/automatismes-progress.js` (75 % minimum,
  clé localStorage `mrp.parcours.<slug classe>`, dégradé en silence si
  indisponible — même convention que `$lib/stores/progress.js`). Cette page
  est prérendue (`prerender = true`) : lire la query string s'y fait via
  `browser` + `location.search` (pattern `readLevel()` du composant), jamais
  via `page.url.searchParams` qui lève une erreur de build sur une page
  statique. Le déblocage séquentiel n'est pas qu'un habillage du parcours :
  `[theme]/+page.svelte` revérifie lui-même le prérequis (thème précédent de
  `AUTO.c[classe].o` validé, ou tous les thèmes pour `defi`) avant d'appeler
  `markThemeCleared`/`markDefiCleared`, pour qu'une arrivée directe sur l'URL
  `?level=…` (lien partagé, retour navigateur) ne puisse pas valider un nœud
  hors séquence.
- Habillage pixel-art des deux mécanismes : sprites bitmap à la main dans
  `$lib/pixel/sprites.js` (grille de caractères `#`/`+`/`.`, voir
  commentaire d'en-tête), rendus par `$lib/components/pixel/PixelIcon.svelte`
  (`<rect>` SVG, pas d'asset raster — même convention que les visualisations,
  voir ci-dessus). Chrome bouton/panneau/barre de progression trapu dans
  `$lib/styles/pixel.css`, importé seulement par les pages de ces deux
  mécanismes (jamais dans `+layout.svelte`) pour que le reste du site garde
  son chrome habituel.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
