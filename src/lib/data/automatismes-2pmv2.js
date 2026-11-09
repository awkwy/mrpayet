/* Thèmes d'automatismes ajoutés pour la 2P MV2 (statistique, conversions du
 * garage, probabilités). Même schéma que $lib/data/automatismes.js : { t: titre,
 * i: [[question, réponse], …] }, la réponse est tapée par l'élève (nombre avec
 * virgule décimale, ou un mot). Fusionnés dans AUTO à la fin de automatismes.js
 * (fichier d'une seule ligne : on y ajoute sans le reformater).
 *
 * - stats_rituel : le « rituel de 5 minutes » statistique (manches A et B de la
 *   fiche rituel-stats-2pmv2 du projet frère `cours`), sans calculatrice.
 * - unites_garage : minutes ⇄ heures, cm³ ⇄ cL ⇄ L ⇄ m³ (co-intervention
 *   « Au garage de Kahani : minutes, heures et litres »).
 * - probas_bougies : probabilité d'un événement, événement contraire, certain /
 *   impossible, fréquence d'un échantillon (bac à bougies, lot de pièces).
 * Jamais de signe « ÷ » dans les questions. Ces thèmes ne dépendent d'aucune
 * semaine de PROGRESSION (comme tous les automatismes : jamais verrouillés). */
export const EXTRA_2PMV2 = {
  o: ['stats_rituel', 'unites_garage', 'probas_bougies'],
  t: {
    stats_rituel: {
      t: 'Rituel statistique — étendue, médiane, moyenne, valeur extrême',
      i: [
        ['Étendue de 12 ; 7 ; 19 ; 9', '12'],
        ['Médiane de 5 ; 9 ; 6 ; 8 ; 7 (range d’abord)', '7'],
        ['Médiane de 3 ; 10 ; 4 ; 8 (effectif pair)', '6'],
        ['Moyenne de 4 ; 6 ; 8 ; 10 ; 12', '8'],
        ['10 ; 12 ; 13 ; 14 ; 100 : pour un chiffre « habituel », médiane ou moyenne ?', 'médiane'],
        ['Vrai ou faux : « la médiane est toujours une valeur de la série » (3 ; 4 ; 8 ; 10)', 'faux'],
        ['Étendue de 31 ; 24 ; 18 ; 27', '13'],
        ['Médiane de 20 ; 14 ; 17 ; 12 ; 22 (range d’abord)', '17'],
        ['Médiane de 15 ; 5 ; 9 ; 11 ; 7 ; 13 (effectif pair)', '10'],
        ['Moyenne de 2 ; 5 ; 5 ; 8', '5'],
        ['6 ; 7 ; 8 ; 9 ; 70 : pour un chiffre « habituel », médiane ou moyenne ?', 'médiane'],
        ['Vrai ou faux : « si la moyenne monte, la médiane monte aussi » (3 ; 4 ; 8 ; 10)', 'faux']
      ]
    },
    unites_garage: {
      t: 'Au garage — minutes, heures, cm³, cL, L et m³',
      i: [
        ['0,5 h en minutes', '30'],
        ['0,3 h en minutes', '18'],
        ['0,8 h en minutes', '48'],
        ['2,25 h = 2 h et combien de minutes ?', '15'],
        ['45 min en heures', '0,75'],
        ['90 min en heures', '1,5'],
        ['36 min en heures', '0,6'],
        ['1,3 h = 1 h et combien de minutes ?', '18'],
        ['1 500 cm³ en litres', '1,5'],
        ['125 cm³ en centilitres', '12,5'],
        ['5 L en centilitres', '500'],
        ['2 m³ en litres', '2000']
      ]
    },
    probas_bougies: {
      t: 'Probabilités simples — événement, contraire, certain, impossible',
      i: [
        ['Bac de 20 bougies dont 6 usées : probabilité d’en prendre une usée (décimal)', '0,3'],
        ['Même bac : probabilité d’en prendre une neuve (décimal)', '0,7'],
        ['Probabilité de prendre une bougie bleue (il n’y en a aucune)', '0'],
        ['Probabilité de prendre une bougie neuve ou usée', '1'],
        ['P(A) = 0,25 : probabilité de l’événement contraire ?', '0,75'],
        ['P(A) = 0,9 : probabilité de l’événement contraire ?', '0,1'],
        ['Un dé à 6 faces : probabilité d’obtenir un nombre pair (décimal)', '0,5'],
        ['Un sachet de 10 jetons dont 3 rouges : probabilité de tirer un rouge (décimal)', '0,3'],
        ['Sur 20 tirages, 3 jetons rouges : fréquence en %', '15'],
        ['Sur 20 tirages, 5 jetons rouges : fréquence en %', '25'],
        ['Une probabilité peut-elle valoir 1,4 ? (oui ou non)', 'non'],
        ['Un contrôle de 5 pièces suffit-il pour juger une caisse de 500 pièces ? (oui ou non)', 'non']
      ]
    }
  }
};
