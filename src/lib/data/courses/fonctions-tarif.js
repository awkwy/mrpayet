/* Entrée du module « Fonctions » (2P MV2) : « Combien coûte la réparation ? ».
 *
 * Source : fonction-tarif-garage-2pmv2 (+ version accessible) du projet frère
 * `cours`. Module prévu en mars-avril 2027, après le devoir commun : le
 * verrou « pas encore au programme » vient de la fenêtre `mv-fonctions` de
 * $lib/data/progression.js, pas de ce fichier. Pas de corrigé enseignant :
 * les réponses n'apparaissent que dans les retours des exercices.
 * Division : jamais « ÷ ». */
import { frac as F } from '../../utils/fr.js';

export const TARIF = {
  t: 'Combien coûte la réparation ?',
  pdf: ['fonction-tarif-garage-2pmv2-standard', 'fonction-tarif-garage-2pmv2-accessible'],
  prob: 'Un client apporte son scooter au garage de Kahani. Il paie le diagnostic une seule fois, puis la main-d’œuvre à l’heure. Comment le prix dépend-il du nombre d’heures ?',
  steps: [
    {
      t: 'La situation',
      txt: "Un client apporte son scooter au garage de Kahani. Il paie le diagnostic (15 €, une seule fois), puis la main-d'œuvre à l'heure (30 € par heure). Le prix à payer dépend du nombre d'heures de réparation. Prix inventés pour l'exercice."
    },
    {
      t: 'Étape 1 : je complète le devis',
      doc: {
        h: ['Nombre d’heures', 'Calcul', 'Prix à payer (€)'],
        r: [
          ['0 h (exemple)', '15 + 0 × 30', '15'],
          ['1 h (exemple)', '15 + 1 × 30', '45'],
          ['2 h', '', ''],
          ['3 h', '', ''],
          ['4 h', '', '']
        ]
      },
      apport: "Le prix se calcule ainsi : <b>prix = 15 + nombre d'heures × 30</b> (le diagnostic, plus les heures de travail).",
      q: [
        { q: 'Prix pour 2 h : 15 + 2 × 30 = ? (€)', a: 75, tol: 0 },
        { q: 'Prix pour 3 h : 15 + 3 × 30 = ? (€)', a: 105, tol: 0 },
        { q: 'Prix pour 4 h : 15 + 4 × 30 = ? (€)', a: 135, tol: 0 },
        { q: "Quand j'ajoute 1 heure, de combien le prix augmente-t-il ? (€)", a: 30, tol: 0, sol: 'Toujours 30 € : 45 → 75 → 105 → 135.' }
      ]
    },
    {
      t: 'Étape 2 : je place les points',
      viz: 'tarif',
      apport:
        "Chaque ligne du tableau donne un <b>point (heures ; prix)</b>. Exemple : le point (1 ; 45) est à 1 h et 45 €. Tire chaque pastille vers le haut jusqu'à son prix : elle s'aimante quand elle est bien placée. Quand les cinq points sont posés, la droite se trace.",
      q: [
        { q: 'Que remarques-tu sur les 5 points ? (alignés ou pas alignés)', a: ['alignés', 'alignes', 'sur une droite', 'une droite'], txt: true, sol: 'Les 5 points sont alignés sur une droite : de 1 h à 2 h, +30 € comme de 2 h à 3 h.' }
      ]
    },
    {
      t: 'Étape 3 : je lis le graphique',
      apport: 'Bouge le curseur sur la droite. <b>Image</b> : je choisis les heures, je lis le prix. <b>Antécédent</b> : je choisis le prix, je lis les heures. Utilise le bouton « Antécédent » du graphique pour la question b.',
      q: [
        { q: 'a) Combien paie le client pour 2 h 30 ? (€)', a: 90, tol: 0, sol: '15 + 2,5 × 30 = 90 €.' },
        { q: "b) Il n'a que 105 €. Combien d'heures au maximum ? (h)", a: 3, tol: 0 },
        { q: 'c) Pour 0 h, le prix est-il 0 € ? Quel est-il ? (€)', a: 15, tol: 0, sol: 'Non : 15 €, le diagnostic est payé avant toute heure de travail.' }
      ]
    },
    {
      t: 'Étape 4 : je retiens le mot « fonction »',
      apport:
        "Pour chaque nombre d'heures, il y a <b>un seul prix</b> : on dit que le prix est une <b>fonction</b> du nombre d'heures.<br>3 h → 105 € : <b>105 € est l'image de 3 h</b> et <b>3 h est un antécédent de 105 €</b>.",
      q: [
        { q: "a) Quelle est l'image de 4 h ? (€)", a: 135, tol: 0 },
        { q: 'b) Quel est l’antécédent de 75 € ? (h)', a: 2, tol: 0 }
      ]
    },
    {
      t: 'Ma phrase avec « image » ou « antécédent »',
      viz: 'phraseMv',
      vd: {
        intro: 'Complète la phrase sur ton graphique.',
        parts: [
          { id: 'a', a: '135' },
          ' € est l’',
          { id: 'b', a: 'image' },
          ' de ',
          { id: 'c', a: '4' },
          ' h, et ',
          { id: 'd', a: '4' },
          ' h est un ',
          { id: 'e', a: ['antécédent', 'antecedent'] },
          ' de ',
          { id: 'f', a: '135' },
          ' €.'
        ],
        bank: ['135', '135', '75', '4', '4', '2', 'image', 'antécédent'],
        ok: 'Voilà le vocabulaire des fonctions : on part des heures pour trouver l’image, on part du prix pour trouver un antécédent.'
      }
    },
    {
      t: '★ Pour aller plus loin : l’autre garage',
      apport: "Un autre garage ne demande pas de diagnostic, mais <b>40 € par heure</b>. Appuie sur « ★ Autre garage » dans le graphique pour voir sa droite.",
      q: [
        { q: 'Prix de l’autre garage pour 1 h (€)', a: 40, tol: 0 },
        { q: 'Prix de l’autre garage pour 2 h (€)', a: 80, tol: 0 },
        { q: 'Prix de l’autre garage pour 3 h (€)', a: 120, tol: 0 },
        { q: 'Le garage de Kahani est-il toujours moins cher ? (oui ou non)', a: ['non'], txt: true, sol: 'Non : pour 1 h, l’autre garage est moins cher (40 € contre 45 €). À partir de 1,5 h, Kahani est moins cher.' }
      ]
    }
  ],
  quiz: [
    {
      q: 'Prix = 15 + 30 × (nombre d’heures). Pour 3 h, le prix est :',
      o: ['45 €', '105 €', '90 €'],
      c: 1,
      e: '15 + 3 × 30 = 105 €.'
    },
    {
      q: '« L’image de 2 h est 75 € » signifie :',
      o: ['Pour 75 h on paie 2 €', 'Pour 2 h on paie 75 €', '2 h et 75 € sont des images'],
      c: 1,
      e: 'L’image d’un nombre d’heures, c’est le prix correspondant.'
    }
  ],
  trace:
    `Quand à chaque nombre d'heures correspond <b>un seul prix</b>, le prix est une <b>fonction</b> du nombre d'heures. Ici : <b>prix = 15 + 30 × heures</b>. Le prix de 0 h n'est pas 0 : il reste le diagnostic (15 €). Chaque heure en plus ajoute 30 € : les points sont alignés sur une droite.<br>L'<b>image</b> de 3 h est 105 € ; 3 h est un <b>antécédent</b> de 105 €. On lit une image en partant de l'axe des heures, un antécédent en partant de l'axe des prix.`
};
