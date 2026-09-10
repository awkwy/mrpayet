# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

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
  refonte — voir ci-dessous). Les autres restent sur `shared.js` (canvas) en
  attendant leur lot.
- `alternatif` est une **refonte** (pas une simple migration de graphe) :
  schéma de circuit avec symboles normalisés (source pile/générateur,
  interrupteur, lampe ⊗), animation de « remplissage » des fils à la fermeture
  du circuit (`stroke-dashoffset`) + paquets de courant en circulation, trois
  contextes (12 V continu / 230 V ~ / 400 V haute tension). Le contexte haute
  tension peint les fils en `--warn` (orange) avec un pictogramme ⚠ — usage
  légitime du jeton d'état (le câble orange EST une alerte normalisée métier),
  jamais comme série de données. Bascule image réaliste ↔ symbole. Disposition
  **verticale imposée** (circuit en haut, trace tension/temps en dessous — jamais
  côte à côte) pour rester lisible sur un téléphone. Même contrat `d3.js`
  (imports modulaires, `springEase`, `prefers-reduced-motion`).
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
  finançable/dépasse, `alternatif` `--warn` haute tension), toujours doublé
  d'un pictogramme + libellé, jamais la couleur seule. Palettes validées
  `--mode dark` avec `scripts/validate_palette.js` (les FAIL band/chroma sont la
  propriété du thème néon du site, pas corrigeables sans hex hors tokens).
  Accessibilité : vue tableau repliable, focus clavier = survol,
  `prefers-reduced-motion` respecté.
- Contrainte tenue : mobile d'abord / poids léger (voir `src/lib/styles/tokens.css`).
  Animations : jamais de saut instantané — easing amorti obligatoire.
- Pas de tests de visualisation dans la suite (`vitest` couvre `src/lib/stores/`
  et `src/lib/data/`).

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
