// Sprites pixel-art des jeux de révision (cartes à associer + parcours par
// niveaux, voir AGENTS.md « Jeux de révision »). Chaque sprite est une grille
// de caractères — une chaîne par ligne, un caractère par pixel : '#' = ton
// principal, '+' = ton d'accent, '.' = transparent — rendue en <rect> SVG par
// PixelIcon.svelte. Même convention « SVG dessiné à la main, pas d'asset
// raster » que les autres illustrations du projet ; aucune image bitmap.

export const LOCK = [
  '..####..',
  '.#....#.',
  '.#....#.',
  '########',
  '########',
  '##.++.##',
  '########',
  '########'
];

export const STAR = [
  '...##...',
  '...##...',
  '..####..',
  '########',
  '.######.',
  '..####..',
  '.##..##.',
  '#......#'
];

export const CARD_BACK = [
  '...#....',
  '..###...',
  '.#####..',
  '#######.',
  '.#####..',
  '..###...',
  '...#....',
  '........'
];

export const TROPHY = [
  '#......#',
  '.######.',
  '.######.',
  '..####..',
  '...##...',
  '...##...',
  '..####..',
  '.######.',
  '########'
];

export const PLAY = [
  '#.......',
  '##......',
  '###.....',
  '####....',
  '####....',
  '###.....',
  '##......',
  '#.......'
];
