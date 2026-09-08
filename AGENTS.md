# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Visualisations

- Les manipulations interactives vivent dans `src/lib/visualizations/` et sont
  enregistrées dans `registry.js` (liste et nombre exacts : lire ce fichier).
  Socle historique : `shared.js` (rendu `<canvas>`
  2D + `requestAnimationFrame`, helpers `box`/`slider`/`readout`/`Spring`/
  `createLoop`).
- `moyenne.svelte` et `mediane.svelte` sont un **pilote D3** : rendu `<svg>` animé
  par les transitions D3 (imports modulaires `d3-selection`/`d3-transition`/
  `d3-drag`, pas le bundle `d3` ni `d3-scale`, pour le poids). Socle
  partagé : `d3.js` (`dotPlot`, `stackDots`, `linScale`, easing ressort
  `springEase`/`spring`, infobulle `tip` + conversion `vbToCss` ; `VB_W` =
  largeur logique du canvas historique, pour rendre à la même échelle que les
  autres fiches). CSS du cadre SVG : `.viz svg.d3viz` mutualisé avec
  `.viz canvas` dans `src/lib/styles/viz.css` (+ classes additives `.vtip`,
  `.viz-data`, `.read .v.b`, sans effet sur les autres fiches).
- Les deux fiches suivent la procédure `dataviz` (voir en-tête de chaque
  fichier) : couleurs **exclusivement** via `var(--…)` de `tokens.css` — points =
  série unique teinte séquentielle `--g` ; valeur dérivée (moyenne/médiane) =
  accent `--blue` (jamais `--warn`, jeton d'état réservé) ; validées
  `--mode dark` avec `scripts/validate_palette.js` (les FAIL band/chroma sont la
  propriété du thème néon du site, pas corrigeables sans hex hors tokens).
  Accessibilité : vue tableau repliable, focus clavier = survol,
  `prefers-reduced-motion` respecté. Les autres fiches n'ont pas été migrées.
- Contrainte tenue : mobile d'abord / poids léger (voir `src/lib/styles/tokens.css`).
  Animations : jamais de saut instantané — easing amorti obligatoire.
- Pas de tests de visualisation dans la suite (`vitest` couvre `src/lib/stores/`).

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
