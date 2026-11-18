/* Séquence « Les fonctions » (2P MV2) : le devis du garage de Kahani, en 4 séances
 * (LOT 1 : séances 1 et 2 du mercredi 18/11/2026 ; les séances 3 « Deux garages,
 * deux droites » et 4 « Quel garage choisir ? » arrivent dans un second lot).
 *
 * Source : fonctions-s1…s4-2pmv2 (standard + accessible) du projet frère `cours`
 * (plan de séquence : eleve/maths/fonctions-plan-sequence-2pmv2). Les séances 1
 * et 2 ont lieu le mercredi 18/11/2026 ; les dates des séances 3 et 4 ne sont
 * pas fixées : la fenêtre de progression du bloc `mv-fonctions` (voir
 * $lib/data/progression.js) ne porte donc que ce qui est connu.
 * Fil rouge : diagnostic 15 € payé une seule fois + 30 € par heure. NOMBRES
 * INVENTÉS pour l'exercice (dit dans chaque situation). Les deux garages sont
 * fictifs. Le « garage B » demande 40 € par heure, sans diagnostic.
 * Chaque séance = une problématique locale racontée comme un tutoriel
 * « comment faire » : situation → étapes (un apport avant les questions) →
 * calculatrice ou manipulation → trace écrite. Vocabulaire simple (le groupe B
 * a du mal avec les mots) : mêmes maths, mots d'abord expliqués.
 * Division : jamais « ÷ » (fraction via frac). Questions ouvertes : réponse
 * courte tapée, jamais de texte à trous. Les corrigés n'apparaissent que dans
 * les retours des exercices (pas de corrigé enseignant dans ce dépôt).
 * Les prix et lectures sont contrôlés par `fonctions-garage.test.js` à partir
 * de $lib/utils/garages.js. */
import { frac as F } from '../../utils/fr.js';
import { KAHANI, price, table } from '../../utils/garages.js';

// Séance 2 : le tableau de valeurs à saisir dans la calculatrice (0 h à 6 h).
const TAB_0_6 = table(KAHANI, [0, 1, 2, 3, 4, 5, 6]);
export const DATASET_KAHANI = TAB_0_6;

export default {
  id: 'fonctions-garage-mv',
  classe: '2P MV2',
  mat: 'Maths',
  titre: 'Les fonctions : le devis du garage de Kahani',
  desc: 'Un devis de garage devient un tableau, un graphique, puis une formule : variable, fonction, image et antécédent, tableau de valeurs à la calculatrice.',
  pdf: 'maths',
  obj: [
    'Passer du tableau de valeurs au graphique et à la formule d’un prix',
    'Identifier la variable ; trouver l’image et un antécédent d’un nombre'
  ],
  seances: [
    /* ---------------------------------------------------------------- 1 */
    {
      t: 'Combien coûte la réparation ?',
      pdf: ['fonctions-s1-2pmv2-standard', 'fonctions-s1-2pmv2-accessible'],
      prob: 'Un client apporte son scooter au garage de Kahani et demande : « Combien je vais payer, selon le nombre d’heures de réparation ? » Comment répondre avec un tableau, puis un graphique ?',
      steps: [
        {
          t: 'Rituel d’ouverture (5 minutes, sans calculatrice)',
          apport:
            'On commence par chauffer le cerveau : réponds de tête, sans calculatrice, puis tape ta réponse. Les calculs servent tout de suite : le prix d’une réparation se calcule avec des multiplications et des additions. La dernière question prépare le graphique : <b>un point s’écrit (nombre sur l’axe du bas ; nombre sur l’axe de gauche)</b>, le premier nombre se lit sur l’axe horizontal (celui du bas).',
          q: [
            { q: '30 fois 4 ? (30 × 4)', a: 120, tol: 0 },
            { q: '15 plus 60 ? (15 + 60)', a: 75, tol: 0 },
            { q: 'Une vidange coûte 40 €. Combien pour 3 scooters ? (€)', a: 120, tol: 0 },
            {
              q: 'Un point est écrit (2 ; 5). Le nombre 2 se lit sur l’axe du bas ou sur l’axe de gauche ? (bas ou gauche)',
              a: ['bas', 'axe du bas', 'horizontal'],
              txt: true,
              sol: 'Le premier nombre se lit sur l’axe du bas (horizontal). Si tu bloques : dessine un petit repère sur ta feuille.',
              hint: 'Le premier nombre d’un point, c’est celui qu’on cherche d’abord en bas.'
            }
          ]
        },
        {
          t: 'La situation',
          txt: 'Sur le panneau du garage de Kahani : un diagnostic de 15 € (payé une seule fois), puis la main-d’œuvre à 30 € de l’heure. Le client demande combien il va payer selon le nombre d’heures de réparation. Prix inventés pour l’exercice.',
          q: [
            {
              q: 'Avant de calculer, donne ton idée : pour 3 heures de réparation, le client paie-t-il plus ou moins de 90 € ? (plus ou moins)',
              a: ['plus'],
              txt: true,
              sol: 'Plus : 3 heures à 30 €, c’est 90 €, et il faut encore ajouter le diagnostic de 15 €. On le vérifie dans le tableau.',
              hint: 'Pense aux deux choses qu’il paie : le diagnostic, et les heures de travail.',
              hints: [{ v: 'moins', say: '3 × 30 € = 90 € rien que pour les heures. Le diagnostic s’ajoute-t-il ou se retire-t-il ?' }]
            }
          ]
        },
        {
          t: 'Étape 1 : je construis le tableau de valeurs',
          doc: {
            h: ['Nombre d’heures', 'Calcul (15 + heures × 30)', 'Prix à payer (€)'],
            r: [
              ['0 h (exemple)', '15 + 0 × 30', '15'],
              ['1 h (exemple)', '15 + 1 × 30', '45'],
              ['2 h', '', ''],
              ['3 h', '', ''],
              ['4 h', '', ''],
              ['5 h', '', '']
            ]
          },
          apport:
            'Un <b>tableau de valeurs</b> est une liste : à gauche le nombre d’heures, à droite le prix. Pour remplir une ligne : <b>prix = 15 + nombre d’heures × 30</b>. On calcule d’abord la multiplication, puis on ajoute 15. Avec la calculatrice : application <i>Calculs</i>, taper <b>15 + 30 × 2</b>, puis OK (elle fait la multiplication avant l’addition).',
          q: [
            { q: 'Prix pour 2 h : 15 + 2 × 30 = ? (€)', a: price(KAHANI, 2), tol: 0 },
            { q: 'Prix pour 3 h : 15 + 3 × 30 = ? (€)', a: price(KAHANI, 3), tol: 0, sol: 'Plus que 90 € : ton idée du départ se vérifie.' },
            { q: 'Prix pour 4 h : ? (€)', a: price(KAHANI, 4), tol: 0 },
            { q: 'Prix pour 5 h : ? (€)', a: price(KAHANI, 5), tol: 0 },
            {
              q: 'Quand on ajoute 1 heure, de combien le prix augmente-t-il ? (€)',
              a: 30,
              tol: 0,
              sol: 'Toujours 30 € : 45 → 75 → 105 → 135 → 165. Regarde bien cette régularité, elle sert pour le graphique.'
            },
            {
              q: 'Pour 0 h, le client paie 15 € et pas 0 €. Comment s’appelle cette somme payée avant le travail ? (un mot)',
              a: ['diagnostic'],
              txt: true,
              sol: 'Le diagnostic : il est payé une seule fois, avant la première heure de travail.'
            }
          ]
        },
        {
          t: 'Étape 2 : je dessine le graphique',
          viz: 'tarif',
          vd: { sansAutre: true },
          apport:
            'Chaque ligne du tableau devient un <b>point (heures ; prix)</b>. Exemple : le point (1 ; 45) est à 1 h sur l’axe du bas, puis on monte jusqu’à 45 € sur l’axe de gauche. Pour chaque point : je pars de l’axe du bas, je monte jusqu’à la bonne hauteur. Ici, tire chaque pastille vers le haut jusqu’à son prix : elle s’aimante quand elle est bien placée. Quand les six points sont posés, la droite se trace.',
          q: [
            {
              q: 'Que remarques-tu sur les 6 points ? (alignés ou pas alignés)',
              a: ['alignés', 'alignes', 'sur une droite', 'une droite'],
              txt: true,
              sol: 'Alignés : on avance toujours de 1 h vers la droite et de 30 € vers le haut. C’est ce que tu as vu dans le tableau.'
            }
          ]
        },
        {
          t: 'Étape 3 : je lis le graphique',
          apport:
            'Pour lire un <b>prix</b> : je pars du nombre d’heures sur l’axe du bas, je monte jusqu’à la droite, puis je vais vers la gauche lire le prix. Pour trouver un <b>nombre d’heures</b> à partir d’un prix : je pars du prix sur l’axe de gauche, j’avance vers la droite jusqu’à la droite, puis je descends lire les heures. Bouge le curseur sur le graphique ci-dessus.',
          q: [
            { q: 'a) Combien paie le client pour 2 h 30 ? (€)', a: 90, tol: 0, sol: '15 + 2,5 × 30 = 90 € : entre 75 € (2 h) et 105 € (3 h).' },
            { q: 'b) Il n’a que 105 €. Combien d’heures de réparation au maximum ? (h)', a: 3, tol: 0 },
            { q: 'c) Et s’il a 150 € ? (h, avec la virgule)', a: 4.5, tol: 0, sol: '4,5 h, c’est 4 h 30 : 15 + 4,5 × 30 = 150 €.' }
          ]
        },
        {
          t: 'Étape 4 : je retiens le mot « fonction »',
          apport:
            'Ici, le <b>nombre d’heures change</b> d’un client à l’autre : c’est la <b>variable</b>. Le <b>prix en dépend</b>. Pour chaque nombre d’heures, il y a <b>un seul prix</b> : on dit que le prix est une <b>fonction</b> du nombre d’heures. Le tableau et le graphique montrent la même chose de deux façons.',
          q: [
            { q: 'Qu’est-ce qui change d’un client à l’autre : le nombre d’heures ou le prix de l’heure ? (les heures ou le prix de l’heure)', a: ['heures', 'les heures', 'le nombre d’heures', 'le nombre d heures'], txt: true, sol: 'Le nombre d’heures est la variable. Le prix de l’heure (30 €) ne change pas.' },
            { q: 'Pour 3 heures précises, combien y a-t-il de prix possibles ?', a: 1, tol: 0, sol: 'Un seul : 105 €. C’est ce qui fait de la situation une fonction.' },
            {
              q: '★ Un deuxième scooter reste 3 h 30. Quel est son prix ? Trouve-le sur le graphique, puis par le calcul. (€)',
              a: price(KAHANI, 3.5),
              tol: 0,
              sol: '15 + 3,5 × 30 = 120 €. Le graphique et le calcul donnent le même résultat : c’est un bon contrôle.'
            }
          ]
        }
      ],
      quiz: [
        { q: 'Prix = 15 + 30 × (nombre d’heures). Pour 3 h, le prix est :', o: ['45 €', '105 €', '90 €'], c: 1, e: '15 + 3 × 30 = 105 €.' },
        { q: 'Dans le devis, quelle grandeur est la variable ?', o: ['le prix de l’heure', 'le nombre d’heures', 'le diagnostic'], c: 1, e: 'On choisit le nombre d’heures ; le prix en dépend.' }
      ],
      trace:
        'Dans le devis du garage, <b>le nombre d’heures change</b> : c’est la <b>variable</b>. <b>Le prix en dépend</b> : pour chaque nombre d’heures, il y a <b>un seul prix</b>. On dit que le prix est une <b>fonction</b> du nombre d’heures.<br>On la montre avec un <b>tableau de valeurs</b> ou avec un <b>graphique</b> (les points sont alignés) : c’est la même chose vue de deux façons.<br>Pour 0 h, le prix n’est pas 0 € : il reste le diagnostic (15 €). Chaque heure en plus ajoute 30 €.'
    },
    /* ---------------------------------------------------------------- 2 */
    {
      t: 'Le prix sur la courbe',
      pdf: ['fonctions-s2-2pmv2-standard', 'fonctions-s2-2pmv2-accessible'],
      prob: 'Un client n’a que 105 € : combien d’heures peut-il payer ? Et pour 10 heures, alors que le graphique s’arrête à 5 h ? Comment répondre dans les deux sens, avec le graphique puis avec une formule ?',
      datasets: { d1: DATASET_KAHANI },
      steps: [
        {
          t: 'Rituel d’ouverture (5 minutes, sans calculatrice)',
          apport:
            'On repart du devis de la séance 1 (diagnostic 15 €, puis 30 € par heure). Réponds de tête, sans calculatrice, puis tape ta réponse.',
          q: [
            { q: '30 fois 5 ? (30 × 5)', a: 150, tol: 0 },
            { q: '15 plus 150 ? (15 + 150)', a: 165, tol: 0 },
            { q: 'Sur notre graphique, pour 1 heure, quel prix ? (€)', a: 45, tol: 0 },
            { q: 'Quand j’ajoute une heure, le prix monte de combien ? (€)', a: 30, tol: 0, sol: 'Toujours 30 € : c’est le tarif horaire.' }
          ]
        },
        {
          t: 'La situation',
          viz: 'tarif',
          vd: { pose: true, sansAutre: true },
          txt: 'On garde le devis du garage de Kahani : 15 € de diagnostic, puis 30 € par heure. Voici son tableau et son graphique (prix inventés pour l’exercice). On sait lire un prix à partir d’un nombre d’heures. Aujourd’hui : lire dans les deux sens, puis calculer sans graphique.',
          doc: {
            h: ['Heures', '0', '1', '2', '3', '4', '5'],
            r: [['Prix (€)', '15', '45', '75', '105', '135', '165']]
          },
          q: [
            { q: 'Avec le graphique, lis le prix pour 2 h, puis pour 3 h 30 : combien pour 3 h 30 ? (€)', a: price(KAHANI, 3.5), tol: 0, sol: 'Entre 105 € (3 h) et 135 € (4 h) : 120 €.' }
          ]
        },
        {
          t: 'Étape 1 : image et antécédent',
          apport:
            'Deux mots pour lire une fonction. Quand 3 h de réparation coûtent 105 € : <b>105 € est l’image de 3 h</b> (je pars des heures, je trouve le prix) ; <b>3 h est un antécédent de 105 €</b> (je pars du prix, je cherche les heures). On dit « <b>un</b> antécédent » : selon la fonction, il peut y en avoir plusieurs, ou aucun. Pour une image : je pars de l’axe du bas. Pour un antécédent : je pars de l’axe de gauche. Utilise les deux boutons du graphique.',
          q: [
            { q: 'Quelle est l’image de 4 h ? (€)', a: price(KAHANI, 4), tol: 0 },
            { q: 'Quelle est l’image de 0 h ? (€)', a: price(KAHANI, 0), tol: 0, sol: '15 € : le diagnostic.' },
            { q: 'Quel est l’antécédent de 75 € ? (h)', a: 2, tol: 0 },
            { q: 'Quel est l’antécédent de 150 € ? (h, avec la virgule)', a: 4.5, tol: 0 },
            {
              q: 'Existe-t-il un antécédent de 10 € ? (oui ou non)',
              a: ['non'],
              txt: true,
              sol: 'Non : même pour 0 h, le client paie déjà 15 €. Aucun nombre d’heures ne donne 10 € ; la droite ne descend jamais sous 15 €.',
              hint: 'Regarde le plus petit prix possible, pour 0 h.'
            },
            { q: 'Par rapport à 4 h, le prix 135 € est-il une image ou un antécédent ? (image ou antécédent)', a: ['image'], txt: true, sol: '135 € est l’image de 4 h, et 4 h est un antécédent de 135 €.' }
          ]
        },
        {
          t: 'Étape 2 : une formule pour calculer le prix',
          apport:
            'Le graphique s’arrête à 5 h. Pour 6 h ou 10 h, il faut un calcul. On note <b>h</b> le nombre d’heures et <b>P(h)</b> le prix à payer pour h heures : <b>P(h) = 15 + 30 × h</b>. « P(3) » se lit « P de 3 » : c’est l’image de 3. Pour calculer P(3) : <b>1)</b> je remplace h par 3 ; <b>2)</b> je fais la multiplication 30 × 3 ; <b>3)</b> j’ajoute 15. P(3) = 15 + 30 × 3 = 105.',
          q: [
            { q: 'P(2) = 15 + 30 × 2 = ? (€)', a: price(KAHANI, 2), tol: 0, sol: 'Tu retrouves le tableau : 75 €.' },
            { q: 'P(6) = ? (€)', a: price(KAHANI, 6), tol: 0 },
            { q: 'P(10) = ? (€)', a: price(KAHANI, 10), tol: 0, sol: '15 + 30 × 10 = 315 €. C’est un prix raisonnable pour 10 h de travail, mais on ne pouvait pas le lire : le graphique s’arrêtait à 5 h.' },
            { q: 'Peut-on lire P(10) sur le graphique qui s’arrête à 5 h ? (oui ou non)', a: ['non'], txt: true, sol: 'Non : 10 h est au-delà du graphique. La formule marche pour n’importe quel nombre d’heures.' }
          ]
        },
        {
          t: 'Étape 3 : le tableau de valeurs à la calculatrice',
          apport:
            'La calculatrice peut faire le tableau pour toi. Sur ta vraie NumWorks : application <i>Fonctions</i>, taper <b>15+30x</b> dans f(x)= (x est le nombre d’heures), puis onglet <i>Tableau</i> : tu lis x (heures) et f(x) (prix) et tu descends avec les flèches pour aller plus loin que 5. Si un menu n’a pas le même nom sur ta calculatrice, demande à ton professeur. Ici, entre toi-même les 7 lignes du tableau (de 0 h à 6 h) dans l’onglet <i>Données</i>, puis ouvre l’onglet <i>Graphique</i> : la droite d’ajustement donne la formule.',
          calc: { dataset: 'd1', cols: ['Heures', 'Prix (€)'], reg: 'affine' },
          q: [
            { q: 'D’après le tableau de la calculatrice, quel est le prix pour 6 h ? (€)', a: price(KAHANI, 6), tol: 0, sol: 'Même résultat qu’avec la formule P(6).' },
            {
              q: 'Un client a 195 €. Combien d’heures de réparation peut-il payer ? Cherche l’antécédent de 195 € dans le tableau, puis vérifie avec la formule. (h)',
              a: 6,
              tol: 0,
              sol: 'Vérification : 15 + 30 × 6 = 195 €. L’antécédent de 195 € est 6 h.'
            },
            { q: '★ Dans la colonne des prix, de combien monte le prix quand on ajoute 1 heure ? (€)', a: 30, tol: 0, sol: 'Toujours 30 € : c’est le nombre « 30 » de la formule.' }
          ]
        }
      ],
      quiz: [
        { q: '« 105 € est l’image de 3 h » signifie :', o: ['pour 105 h on paie 3 €', 'pour 3 h on paie 105 €', '3 h et 105 € sont des images'], c: 1, e: 'L’image d’un nombre d’heures, c’est le prix correspondant.' },
        { q: 'P(h) = 15 + 30 × h. Que vaut P(4) ?', o: ['135 €', '49 €', '180 €'], c: 0, e: '15 + 30 × 4 = 15 + 120 = 135 €.' }
      ],
      trace:
        'Pour un nombre d’heures donné, le prix est son <b>image</b> ; pour un prix donné, le nombre d’heures est un <b>antécédent</b> (il peut ne pas exister : pas d’antécédent de 10 €).<br>On lit une image en partant de l’axe des heures, un antécédent en partant de l’axe des prix.<br>La <b>formule</b> <b>P(h) = 15 + 30 × h</b> donne le prix pour n’importe quel nombre d’heures : P(6) = 195 €.<br>La calculatrice fait le <b>tableau de valeurs</b> à notre place (application <i>Fonctions</i>, onglet <i>Tableau</i>).'
    }
  ]
};
