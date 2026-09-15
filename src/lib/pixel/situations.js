// Illustrations pixel-art de l'étape « Trois milieux, trois risques »
// (src/lib/data/courses/securite-electrique.js, séance « 12 V, 230 V, et les
// câbles orange »), consommées par SituationsTabs.svelte. Même technique que
// $lib/pixel/sprites.js (grille de caractères → <rect> SVG) mais avec une
// palette de plusieurs caractères par bitmap au lieu du seul couple
// ink/accent de PixelIcon.svelte : ces illustrations ont besoin de plus de
// deux teintes (carrosserie, vitre, roue, câble haute tension…). Chaque
// palette ne référence que des tokens de tokens.css. `h` (câble haute
// tension du véhicule électrique) reprend `--warn`, le même jeton que la
// visualisation `alternatif` pour le contexte 400-800 V — convention à
// garder si un jour un 4e milieu s'ajoute.

const CAR_ROOF = [
  '................',
  '.....######.....',
  '...##oooooo##...',
  '.##############.',
  '################',
  '################',
  '################'
];

export const SITUATION_ILLUS = {
  vehicule: {
    bitmap: [...CAR_ROOF, '..www......www..', '..www......www..'],
    palette: { '#': 'var(--g2)', o: 'var(--blue)', w: 'var(--dim)' }
  },
  atelier: {
    bitmap: [
      '....########....',
      '....#......#....',
      '....#......#....',
      '....########....',
      '.......##.......',
      '.......##.......',
      '......####......',
      '.....######.....',
      '.....ww..ww.....',
      'bbbbbbbbbbbbbbbb'
    ],
    palette: { '#': 'var(--g2)', w: 'var(--dim)', b: 'var(--line2)' }
  },
  'vehicule-electrique': {
    bitmap: [
      ...CAR_ROOF,
      'pppppppppppppppp',
      '.h.h.h.h.h.h.h.h',
      '..www......www..'
    ],
    palette: {
      '#': 'var(--g2)',
      o: 'var(--blue)',
      w: 'var(--dim)',
      p: 'var(--g3)',
      h: 'var(--warn)'
    }
  }
};
