/* « Au garage de Kahani : minutes, heures et litres » — co-intervention
 * maintenance des véhicules (2P MV2) : conversions heures ⇄ minutes et
 * cm³ ⇄ cL ⇄ L ⇄ m³ sur des cylindrées et contenances, puis statistique d'un
 * registre de 20 véhicules (effectifs, fréquences, bâtons, moyenne des
 * vidanges). Source : conversions-moteurs-2pmv2 du projet frère `cours`
 * (fiche élève ; ni le déroulé ni le corrigé enseignant ne sont repris).
 * Division : jamais « ÷ », toujours une fraction via frac(). */
import { frac as F } from '../../utils/fr.js';

export default {
  id: 'co-intervention-conversions-mv2',
  classe: '2P MV2',
  mat: 'Maths',
  titre: 'Au garage de Kahani : minutes, heures et litres',
  desc: "Co-intervention maintenance des véhicules : convertir des heures en minutes, des cm³ en cL, L et m³, compter un registre de 20 véhicules et en tirer des fréquences et une moyenne.",
  pdf: 'maths',
  obj: [
    'Convertir des heures en minutes et des minutes en heures',
    'Convertir des cm³, cL, L et m³ et choisir l’unité adaptée à l’ordre de grandeur',
    'Calculer effectifs, fréquences et pourcentages d’un registre et tracer un diagramme en bâtons',
    'Calculer une moyenne de durées et la comparer à une référence (le panneau du garage)'
  ],
  seances: [
    {
      t: 'Mission 1 : combien de temps ça prend ?',
      pdf: ['conversions-moteurs-2pmv2-standard'],
      prob: "Le panneau du garage affiche les temps en heures, les clients pensent en minutes. Comment passer de l'un à l'autre sans se tromper ?",
      steps: [
        {
          t: 'La situation',
          txt: "Tu es apprenti au garage de Kahani. Ce matin, quatre clients attendent : un scooter, une moto, une voiture et un pick-up. Ton chef te confie 3 missions. À chaque fois, tu calcules, puis tu vérifies que ton résultat a du sens."
        },
        {
          t: 'Le panneau du garage',
          doc: {
            h: ['Travail', 'Temps affiché', 'En minutes'],
            r: [
              ['Vidange du scooter', '0,3 h', '18 min (exemple)'],
              ['Plaquettes de frein de la moto', '0,8 h', ''],
              ['Vidange de la voiture', '0,4 h', ''],
              ['Courroie de la voiture', '1,5 h', ''],
              ['Révision du pick-up', '2,25 h', '']
            ]
          },
          viz: 'convertisseur',
          apport: `<b>1 h = 60 min.</b> Heures → minutes : <b>multiplier par 60</b>. Minutes → heures : <b>diviser par 60</b>, soit ${F('minutes', 60)}. Fais glisser la règle ou touche un travail du garage pour voir la conversion.`
        },
        {
          t: 'Complète la colonne des minutes',
          q: [
            { q: 'Plaquettes de la moto : 0,8 × 60 = ? (min)', a: 48, tol: 0 },
            { q: 'Vidange de la voiture : 0,4 × 60 = ? (min)', a: 24, tol: 0 },
            { q: 'Courroie de la voiture : 1,5 × 60 = ? (min)', a: 90, tol: 0 },
            { q: 'Révision du pick-up : 2,25 × 60 = ? (min)', a: 135, tol: 0 }
          ]
        },
        {
          t: "À quelle heure est-ce prêt ?",
          apport: 'Le scooter arrive à 9 h 00, sa vidange dure 18 min. Le pick-up arrive à 8 h 30, sa révision dure 2,25 h, soit 2 h 15 min (0,25 h = 15 min).',
          q: [
            { q: 'Le scooter est prêt à 9 h ? (minutes)', a: 18, tol: 0, sol: '9 h 00 + 18 min = 9 h 18.' },
            { q: 'Le pick-up : 2,25 h = 2 h ? min', a: 15, tol: 0 },
            { q: 'Le pick-up arrive à 8 h 30 : il est prêt à 10 h ? (minutes)', a: 45, tol: 0, sol: '8 h 30 + 2 h 15 min = 10 h 45.' }
          ]
        },
        {
          t: 'Des minutes aux heures',
          apport: `Le chronomètre du mécanicien indique 45 min, 36 min et 90 min. Pour passer aux heures : ${F('minutes', 60)}.`,
          q: [
            { q: '45 min en heures : 45 sur 60 = ? (h)', qh: `45 min en heures : ${F(45, 60)} = ? (h)`, a: 0.75, tol: 0.002 },
            { q: '36 min en heures : 36 sur 60 = ? (h)', qh: `36 min en heures : ${F(36, 60)} = ? (h)`, a: 0.6, tol: 0.002 },
            { q: '90 min en heures : 90 sur 60 = ? (h)', qh: `90 min en heures : ${F(90, 60)} = ? (h)`, a: 1.5, tol: 0.002 }
          ]
        },
        {
          t: 'Le piège du 1,3 h',
          apport: 'Le chef écrit <b>1,3 h</b> sur l’ordre de réparation. Le client dit : « Ça fait 1 h 30 ! » Il a tort ou raison ? Les minutes ne sont pas des centièmes d’heure : 1,3 h = 1 h + 0,3 h.',
          q: [
            { q: '0,3 h = 0,3 × 60 = ? (min)', a: 18, tol: 0 },
            { q: 'Donc 1,3 h = 1 h ? min', a: 18, tol: 0, sol: 'Le client a tort : 1,3 h = 1 h 18 min, pas 1 h 30.' },
            { q: 'Le client a-t-il raison ? (oui ou non)', a: ['non'], txt: true }
          ]
        }
      ],
      quiz: [
        { q: '0,5 h, c’est :', o: ['50 min', '30 min', '5 min'], c: 1, e: '0,5 × 60 = 30 min : une demi-heure.' },
        { q: '75 min en heures :', o: ['1,15 h', '1,25 h', '0,75 h'], c: 1, e: '75 min = 1 h 15 min = 1,25 h (15 min = 0,25 h).' }
      ],
      trace: `<b>1 h = 60 min.</b> Heures → minutes : multiplier par 60. Minutes → heures : ${F('minutes', 60)}. Les minutes ne sont pas des centièmes d'heure : <b>1,3 h = 1 h 18 min</b> (0,3 × 60 = 18).`
    },
    {
      t: 'Mission 2 : quelle est la taille de chaque moteur ?',
      pdf: ['conversions-moteurs-2pmv2-standard'],
      prob: 'La cylindrée dit la taille du moteur. Elle s’écrit en cm³ sur la carte grise. Comment la comparer à une canette ou à une bouteille ?',
      steps: [
        {
          t: 'Les unités de volume',
          viz: 'convertisseur',
          vd: { mode: 'vol' },
          apport: `<b>1 m³ = 1 000 L</b> ; <b>1 L = 100 cL = 1 000 cm³</b> ; <b>1 cL = 10 cm³</b>. cm³ → cL : ${F('cm³', 10)}. cm³ → L : ${F('cm³', '1 000')}. Une canette de 33 cL = 330 cm³ ; une bouteille de 1,5 L = 1 500 cm³. Touche un véhicule ou un objet, ou tire la règle (échelle × 10).`
        },
        {
          t: 'La cylindrée des quatre véhicules',
          doc: {
            h: ['Véhicule', 'Cylindrée (cm³)', 'en cL', 'en L'],
            r: [
              ['Scooter', '50', '5 (exemple)', '0,05 (exemple)'],
              ['Moto', '125', '', ''],
              ['Voiture', '1 500', '', ''],
              ['Pick-up', '2 400', '', '']
            ]
          },
          q: [
            { q: 'Moto : 125 cm³ en cL (diviser par 10)', qh: `Moto : ${F(125, 10)} = ? (cL)`, a: 12.5, tol: 0.01 },
            { q: 'Moto : 125 cm³ en L (diviser par 1 000)', qh: `Moto : ${F(125, '1 000')} = ? (L)`, a: 0.125, tol: 0.0005 },
            { q: 'Voiture : 1 500 cm³ en cL', qh: `Voiture : ${F('1 500', 10)} = ? (cL)`, a: 150, tol: 0 },
            { q: 'Voiture : 1 500 cm³ en L', qh: `Voiture : ${F('1 500', '1 000')} = ? (L)`, a: 1.5, tol: 0.001 },
            { q: 'Pick-up : 2 400 cm³ en cL', qh: `Pick-up : ${F('2 400', 10)} = ? (cL)`, a: 240, tol: 0 },
            { q: 'Pick-up : 2 400 cm³ en L', qh: `Pick-up : ${F('2 400', '1 000')} = ? (L)`, a: 2.4, tol: 0.001 }
          ]
        },
        {
          t: 'Compare avec des objets que tu connais',
          q: [
            { q: 'Le moteur du scooter (5 cL) est-il plus petit ou plus grand qu’une canette de 33 cL ?', a: ['plus petit', 'petit'], txt: true },
            { q: 'Le moteur de la voiture (1 500 cm³) est aussi grand que combien de bouteilles de 1,5 L ?', a: 1, tol: 0, sol: 'Une seule : 1 500 cm³ = 1,5 L.' }
          ]
        },
        {
          t: "L'huile, la station, les pleins",
          apport: `L → cL : multiplier par 100. m³ → L : multiplier par 1 000. On ne peut pas faire une demi-vidange : on arrondit vers le bas.`,
          q: [
            { q: 'Le garage ouvre un bidon de 5 L : combien de cL ?', a: 500, tol: 0 },
            { q: 'Une vidange de scooter demande 0,9 L : combien de cL ?', a: 90, tol: 0 },
            { q: 'Combien de vidanges de scooter avec le bidon de 5 L ? (5 sur 0,9 ≈ 5,5, on arrondit vers le bas)', qh: `Vidanges avec le bidon : ${F(5, '0,9')} ≈ 5,5, donc combien de vidanges entières ?`, a: 5, tol: 0 },
            { q: 'La citerne de la station contient 20 m³ : combien de L ?', a: 20000, tol: 0 },
            { q: 'Un plein de voiture = 40 L. Combien de m³ ?', qh: `Un plein de voiture = 40 L = ${F(40, '1 000')} m³ = ? m³`, a: 0.04, tol: 0.0005 },
            { q: 'Combien de pleins de 40 L avec la citerne de 20 000 L ?', qh: `Pleins avec la citerne : ${F('20 000', 40)} = ?`, a: 500, tol: 0 }
          ]
        },
        {
          t: 'Choisir la bonne unité',
          apport: 'Pour un moteur, on écrit la cylindrée en cm³ ou en L, jamais en m³ : 50 cm³ = 0,00005 m³ est un nombre beaucoup trop petit.',
          q: [{ q: '50 cm³ = 0,00005 m³ est un nombre trop… (grand ou petit)', a: ['petit'], txt: true }]
        }
      ],
      quiz: [
        { q: '2 400 cm³ en litres :', o: ['24 L', '2,4 L', '0,24 L'], c: 1, e: '2 400 sur 1 000 = 2,4 L.' },
        { q: '1 m³ vaut :', o: ['100 L', '1 000 L', '10 L'], c: 1, e: '1 m³ = 1 000 L.' }
      ],
      trace: `<b>1 m³ = 1 000 L</b> ; <b>1 L = 100 cL = 1 000 cm³</b> ; <b>1 cL = 10 cm³</b>. cm³ → cL : ${F('cm³', 10)} ; cm³ → L : ${F('cm³', '1 000')}. On choisit l'unité adaptée : la cylindrée en cm³ ou en L, pas en m³.`
    },
    {
      t: 'Mission 3 : le registre du garage',
      pdf: ['conversions-moteurs-2pmv2-standard'],
      prob: "20 véhicules sont entrés au garage ce mois-ci. Combien de chaque sorte, quelle part du total, et la vidange d'un scooter dure-t-elle vraiment le temps du panneau ?",
      steps: [
        {
          t: 'Compte le registre',
          viz: 'registreMv',
          apport: `Touche chaque véhicule : il est compté dans sa colonne. La <b>fréquence</b> d'une sorte est ${F('effectif', 'effectif total')}, ici ${F('effectif', 20)}. Exemple : 5 sur 20 → ${F(5, 20)} = 0,25 = 25 %.`,
          q: [
            { q: 'Effectif des scooters', a: 6, tol: 0 },
            { q: 'Effectif des motos', a: 5, tol: 0 },
            { q: 'Effectif des voitures', a: 5, tol: 0 },
            { q: 'Effectif des pick-up', a: 4, tol: 0 },
            { q: 'Fréquence des scooters en % : 6 sur 20', qh: `Fréquence des scooters : ${F(6, 20)} = ? (en %)`, a: 30, tol: 0 },
            { q: 'Le véhicule le plus nombreux est le… (scooter, moto, voiture ou pick-up)', a: ['scooter'], txt: true, sol: '6 scooters sur 20, soit 30 %.' }
          ]
        },
        {
          t: 'Les 10 dernières vidanges de scooter',
          apport: 'Durées en minutes : 18, 20, 15, 25, 20, 18, 22, 20, 17, 25. Le panneau du garage dit 0,3 h. Passe à l’onglet « Vidanges de scooter » et fais la somme pas à pas.',
          q: [
            { q: 'Somme des durées (min)', a: 200, tol: 0 },
            { q: 'Moyenne : 200 sur 10 = ? (min)', qh: `Moyenne = ${F(200, 10)} = ? (min)`, a: 20, tol: 0 },
            { q: 'En heures : 20 sur 60 ≈ ? (h, au centième)', qh: `En heures : ${F(20, 60)} ≈ ? (h, au centième)`, a: 0.33, tol: 0.006 },
            { q: 'Le panneau : 0,3 h = ? min', a: 18, tol: 0 },
            { q: 'Une vidange de scooter dure en moyenne 20 min, soit combien de min de plus que le panneau ?', a: 2, tol: 0 }
          ]
        },
        {
          t: 'Avant de rendre : les 5 vérifications',
          apport: 'Je vérifie : <b>1 Unité</b> (min, h, cm³…) · <b>2 Ordre de grandeur</b> · <b>3 Arrondi</b> · <b>4 Référence</b> (le panneau) · <b>5 Phrase</b>.<br>Ma phrase : « Une vidange de scooter dure en moyenne 20 min, soit 2 min de plus que le panneau. »'
        }
      ],
      quiz: [
        { q: 'Dans un registre de 20 véhicules, 5 sont des motos. Leur fréquence est :', o: ['0,5', '0,25', '5 %'], c: 1, e: '5 sur 20 = 0,25 = 25 %.' },
        { q: 'La moyenne de 10 durées dont la somme est 200 min vaut :', o: ['2 min', '20 min', '200 min'], c: 1, e: '200 sur 10 = 20 min.' }
      ],
      trace: `<b>Fréquence</b> = ${F('effectif', 'effectif total')} (écrite en nombre décimal ou en %). <b>Moyenne</b> = ${F('somme des valeurs', 'nombre de valeurs')}. On compare toujours à une <b>référence</b> (ici le panneau : 0,3 h = 18 min) et on conclut par une phrase avec l'unité.`
    }
  ]
};
