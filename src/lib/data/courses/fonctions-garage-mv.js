/* Séquence « Les fonctions » (2P MV2) : le devis du garage de Kahani, en 4 séances
 * (séances 1 et 2 du mercredi 18/11/2026 ; séances 3 « Deux garages, deux
 * droites » et 4 « Quel garage choisir ? » du mercredi 25/11/2026).
 *
 * Source : fonctions-s1…s4-2pmv2 (standard + accessible) du projet frère `cours`
 * (plan de séquence : eleve/maths/fonctions-plan-sequence-2pmv2). Les séances 1
 * et 2 ont lieu le mercredi 18/11/2026, les séances 3 et 4 le mercredi
 * 25/11/2026 (semaines 13 et 14 de la fenêtre `mv-fonctions`, voir
 * $lib/data/progression.js).
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
import { KAHANI, GARAGE_B, price, table, fromPoints } from '../../utils/garages.js';

// Séance 2 : le tableau de valeurs à saisir dans la calculatrice (0 h à 6 h).
const TAB_0_6 = table(KAHANI, [0, 1, 2, 3, 4, 5, 6]);
export const DATASET_KAHANI = TAB_0_6;
// Séances 3 et 4 : garage C = deux points donnés (0 h ; 20 €) et (1 h ; 45 €), puis (0 h ; 30 €) et (1 h ; 50 €).
export const GARAGE_C3 = fromPoints([0, 20], [1, 45]);
export const GARAGE_C4 = fromPoints([0, 30], [1, 50]);
const R4 = (h) => GARAGE_C4.fixe + GARAGE_C4.heure * h;

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
      datasets: { d1: DATASET_KAHANI },
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
        },
        {
          t: 'Étape 5 : je contrôle mon tableau avec la calculatrice',
          apport:
            'La calculatrice sert à <b>contrôler</b> ton tableau, pas à le remplacer. Sur ta vraie NumWorks : application <i>Statistiques</i> (ou <i>Régressions</i>), onglet <i>Données</i>. Entre toi-même les 7 lignes du tableau, de 0 h à 6 h : les heures dans la première colonne, les prix dans la deuxième. Compare avec ton tableau papier : si une ligne est différente, c’est ton calcul ou ta saisie à revoir. Ensuite ouvre l’onglet <i>Graphique</i> : les points sont alignés, comme sur ta feuille. Si un menu n’a pas le même nom sur ta calculatrice, demande à ton professeur.',
          calc: { dataset: 'd1', cols: ['Heures', 'Prix (€)'], reg: 'affine' },
          q: [
            { q: 'Dans la première ligne du tableau (0 h), quel prix lis-tu ? (€)', a: price(KAHANI, 0), tol: 0, sol: '15 € : c’est le diagnostic, payé même pour 0 heure.' },
            { q: 'Pour 4 h, ta calculatrice affiche quel prix ? Il doit être le même que sur ta feuille. (€)', a: price(KAHANI, 4), tol: 0 },
            { q: 'Le tableau de la calculatrice va jusqu’à 6 h. Quel prix pour 6 h ? (€)', a: price(KAHANI, 6), tol: 0, sol: '15 + 6 × 30 = 195 €. Ton tableau papier s’arrêtait à 5 h : la calculatrice va plus loin.' }
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
    },
    /* ---------------------------------------------------------------- 3 */
    {
      t: 'Deux garages, deux droites',
      pdf: ['fonctions-s3-2pmv2-standard', 'fonctions-s3-2pmv2-accessible'],
      prob: 'Un scooter est en panne près de Kahani, et deux garages font un devis : le garage de Kahani (15 € une fois, puis 30 € par heure) et un garage B (40 € par heure, sans diagnostic). Lequel est le moins cher ? Comment le voir sur un graphique ?',
      steps: [
        {
          t: 'Rituel d’ouverture (4 minutes, sans calculatrice)',
          apport:
            'On repart du devis de Kahani (séance 2) et on ajoute le garage B. Réponds de tête, sans calculatrice, puis tape ta réponse. Rappel : on calcule la multiplication avant l’addition.',
          q: [
            { q: '40 fois 3 ? (40 × 3)', a: price(GARAGE_B, 3), tol: 0 },
            { q: '15 + 30 × 2 = ? (on multiplie d’abord)', a: price(KAHANI, 2), tol: 0 },
            { q: 'Kahani : P(h) = 15 + 30 × h. Prix pour 4 h ? (€)', a: price(KAHANI, 4), tol: 0 },
            { q: 'Kahani : le prix est 105 €. Combien d’heures ? (h)', a: 3, tol: 0, sol: 'C’est l’antécédent de 105 € : 3 h.' },
            { q: '40 fois 5 ? (40 × 5)', a: price(GARAGE_B, 5), tol: 0 }
          ]
        },
        {
          t: 'La situation',
          txt: 'Un scooter est en panne près de Kahani. Deux garages font un devis. Le garage de Kahani : diagnostic de 15 € (payé une seule fois), puis 30 € par heure. Un garage B, sur la route du littoral : pas de diagnostic, mais 40 € par heure. Prix inventés pour l’exercice ; les deux garages sont fictifs.',
          q: [
            {
              q: 'Avant de calculer, donne ton idée : pour 1 heure, quel garage est le moins cher ? (Kahani ou B)',
              a: ['b', 'garage b'],
              txt: true,
              sol: 'Le garage B : 40 € contre 45 €. Et pour 4 heures ? On le calcule dans l’étape 1.',
              hint: 'Pour 1 heure, Kahani demande le diagnostic et l’heure. Le garage B demande seulement l’heure.'
            }
          ]
        },
        {
          t: 'Étape 1 : le tableau de valeurs des deux garages',
          doc: {
            h: ['Nombre d’heures', 'Garage de Kahani (€)', 'Garage B (€)'],
            r: [
              ['0 h', '15', '0 (exemple)'],
              ['1 h', '45', ''],
              ['2 h', '75', ''],
              ['3 h', '105', ''],
              ['4 h', '135', ''],
              ['5 h', '165', '']
            ]
          },
          apport:
            'Pour compléter la colonne du garage B : <b>prix = 40 × nombre d’heures</b> (pas de diagnostic, donc pour 0 h on paie 0 €). Avec la calculatrice : application <i>Calculs</i>, taper <b>40 × 3</b>, puis OK. Ensuite tu compares les deux colonnes ligne par ligne.',
          q: [
            { q: 'Garage B, prix pour 1 h : ? (€)', a: price(GARAGE_B, 1), tol: 0 },
            { q: 'Garage B, prix pour 2 h : ? (€)', a: price(GARAGE_B, 2), tol: 0 },
            { q: 'Garage B, prix pour 3 h : ? (€)', a: price(GARAGE_B, 3), tol: 0 },
            { q: 'Garage B, prix pour 4 h : ? (€)', a: price(GARAGE_B, 4), tol: 0 },
            { q: 'Garage B, prix pour 5 h : ? (€)', a: price(GARAGE_B, 5), tol: 0 }
          ]
        },
        {
          t: 'Étape 2 : deux mots pour décrire une droite',
          apport:
            'Deux mots pour décrire une droite de prix. Le <b>coefficient directeur</b> : de combien le prix monte quand on ajoute 1 heure. L’<b>ordonnée à l’origine</b> : le prix pour 0 heure (là où la droite coupe l’axe des prix, celui de gauche). Une fonction dont la droite s’écrit <b>a × h + b</b> est une <b>fonction affine</b> : <b>a</b> est le coefficient directeur, <b>b</b> l’ordonnée à l’origine. Pour les trouver dans un tableau : le coefficient directeur est la <b>différence entre deux lignes qui se suivent</b> ; l’ordonnée à l’origine est la <b>ligne 0 h</b>.',
          q: [
            { q: 'Garage de Kahani : coefficient directeur ? (€ par heure)', a: KAHANI.heure, tol: 0, sol: '45 → 75 → 105 : le prix monte de 30 € à chaque heure en plus.' },
            { q: 'Garage de Kahani : ordonnée à l’origine ? (€)', a: KAHANI.fixe, tol: 0, sol: 'C’est le prix pour 0 h : le diagnostic, 15 €.' },
            { q: 'Garage B : coefficient directeur ? (€ par heure)', a: GARAGE_B.heure, tol: 0 },
            { q: 'Garage B : ordonnée à l’origine ? (€)', a: GARAGE_B.fixe, tol: 0, sol: 'Pour 0 h, le garage B demande 0 € : pas de diagnostic.' }
          ]
        },
        {
          t: 'Étape 3 : les deux droites sur le même graphique',
          viz: 'tarif',
          vd: { pose: true },
          apport:
            'La droite du garage de Kahani est déjà tracée. Appuie sur le bouton de l’autre garage : sa droite (40 € par heure) s’ajoute en bleu. Pour la tracer sur ta feuille : place les points (heures ; prix) du tableau avec des ronds blancs, puis relie-les à la règle en tirets. Regarde : les deux droites <b>montent</b> quand le nombre d’heures augmente, mais pas aussi vite l’une que l’autre.',
          q: [
            { q: 'Les deux droites montent-elles quand le nombre d’heures augmente ? (oui ou non)', a: ['oui'], txt: true },
            {
              q: 'Quelle droite monte le plus vite : Kahani ou B ?',
              a: ['b', 'garage b'],
              txt: true,
              sol: 'Le garage B : il monte de 40 € par heure, contre 30 € pour Kahani. Dans le tableau, on le voit à l’écart entre deux lignes qui se suivent.',
              hint: 'Regarde de combien chaque prix monte quand on ajoute 1 heure.'
            }
          ]
        },
        {
          t: 'Étape 4 : je relie droite, tableau et expression',
          apport:
            'Quand le coefficient directeur est <b>positif</b>, la droite monte : la fonction est <b>croissante</b> (plus les heures augmentent, plus le prix augmente). Pour écrire l’expression d’un garage : coefficient directeur × h + ordonnée à l’origine. Kahani : <b>P(h) = 15 + 30 × h</b>. Garage B : pas de nombre ajouté, donc <b>Q(h) = 40 × h</b>.',
          q: [
            { q: 'Dans P(h) = 15 + 30 × h, que représente le nombre 30 ? (coefficient directeur ou ordonnée à l’origine)', a: ['coefficient directeur', 'le coefficient directeur'], txt: true, sol: '30 est le coefficient directeur : le prix gagné pour 1 h de plus. 15 est l’ordonnée à l’origine : le prix à 0 h.' },
            { q: 'Garage B : Q(h) = 40 × h. Calcule Q(3). (€)', a: price(GARAGE_B, 3), tol: 0 },
            {
              q: 'Un client veut 3 heures de réparation. Quel garage est le moins cher ? (Kahani ou B)',
              a: ['kahani', 'garage de kahani'],
              txt: true,
              sol: '3 h : Kahani 105 €, garage B 120 €. Pour 1 h, c’était B (40 € contre 45 €) : ton idée de départ était juste pour 1 h, mais pas pour 3 h. Les droites se croisent entre 1 h et 2 h.'
            },
            {
              q: 'Entre les deux garages, pour combien d’heures le prix est-il à peu près le même ? Regarde le graphique : les droites se croisent entre 1 h et 2 h. Quelle est ton idée ? (h)',
              a: 1.5,
              tol: 0.3,
              sol: 'Vers 1,5 h : 60 € dans les deux garages. On le vérifie par le calcul à la séance suivante.'
            }
          ]
        },
        {
          t: '★ Pour aller plus loin : un garage C',
          apport:
            'Pour trouver la droite d’un garage à partir de <b>deux prix donnés</b> : l’ordonnée à l’origine est le prix pour 0 h ; le coefficient directeur est la différence entre le prix pour 1 h et le prix pour 0 h.',
          q: [
            { q: 'Un garage C annonce : 0 h → 20 €, 1 h → 45 €. Son coefficient directeur ? (€ par heure)', a: GARAGE_C3.heure, tol: 0, sol: '45 − 20 = 25 € de plus par heure.' },
            { q: 'Son ordonnée à l’origine ? (€)', a: GARAGE_C3.fixe, tol: 0 }
          ]
        }
      ],
      quiz: [
        { q: 'Dans P(h) = 15 + 30 × h, l’ordonnée à l’origine est :', o: ['30', '15', '45'], c: 1, e: 'C’est le prix pour 0 h : 15 €, le diagnostic.' },
        { q: 'Une droite dont le coefficient directeur est positif :', o: ['monte : fonction croissante', 'descend : fonction décroissante', 'est plate'], c: 0, e: 'Positif = elle monte : la fonction est croissante.' }
      ],
      trace:
        'Une fonction dont la droite s’écrit <b>a × h + b</b> est une <b>fonction affine</b>. Le <b>coefficient directeur a</b> est ce que le prix gagne pour 1 h de plus. L’<b>ordonnée à l’origine b</b> est le prix pour 0 h.<br>Exemple : Kahani P(h) = 15 + 30 × h (a = 30, b = 15) ; garage B Q(h) = 40 × h (a = 40, b = 0).<br>Quand a est <b>positif</b>, la droite monte : la fonction est <b>croissante</b>. Le garage B monte plus vite que Kahani, mais il part de 0 € : les deux droites se croisent.'
    },
    /* ---------------------------------------------------------------- 4 */
    {
      t: 'Quel garage choisir ?',
      pdf: ['fonctions-s4-2pmv2-standard', 'fonctions-s4-2pmv2-accessible'],
      prob: 'Le scooter est en panne : Kahani (15 € + 30 € par heure) ou garage B (40 € par heure) ? Ça dépend de quoi ? Comment décider avec les deux droites, puis le vérifier par le calcul ?',
      steps: [
        {
          t: 'Rituel d’ouverture (3 minutes, sans calculatrice)',
          apport:
            'Reprise éclair des deux garages de la séance 3. Réponds de tête, sans calculatrice, puis tape ta réponse.',
          q: [
            { q: 'Garage B : Q(h) = 40 × h. Coefficient directeur ? (€ par heure)', a: GARAGE_B.heure, tol: 0 },
            { q: 'Garage de Kahani : P(h) = 15 + 30 × h. Ordonnée à l’origine ? (€)', a: KAHANI.fixe, tol: 0 },
            { q: 'Garage B : Q(2) = 40 × 2 = ? (€)', a: price(GARAGE_B, 2), tol: 0 },
            { q: 'La droite monte. La fonction est… ? (un mot)', a: ['croissante'], txt: true, sol: 'Croissante : quand h augmente, le prix augmente.' }
          ]
        },
        {
          t: 'La situation',
          viz: 'tarif',
          vd: { pose: true },
          txt: 'Le scooter est en panne. Deux garages : celui de Kahani (15 € de diagnostic, puis 30 € par heure : P(h) = 15 + 30 × h) et un garage B sur la route (40 € par heure, sans diagnostic : Q(h) = 40 × h). Prix inventés pour l’exercice ; les deux garages sont fictifs. Appuie sur le bouton de l’autre garage pour voir les deux droites.',
          doc: {
            h: ['Heures', '0', '1', '2', '3', '4', '5'],
            r: [
              ['Kahani (€)', '15', '45', '75', '105', '135', '165'],
              ['Garage B (€)', '0', '40', '80', '120', '160', '200']
            ]
          },
          q: [
            {
              q: 'Avant de chercher : quel garage choisir ? Dis ton idée (Kahani, B ou ça dépend)',
              a: ['ça dépend', 'ca depend', 'dépend', 'depend', 'ça dépend du nombre d’heures', 'ça dépend des heures'],
              txt: true,
              sol: 'Ça dépend du nombre d’heures : on le voit avec les deux droites, qui se croisent.',
              hint: 'Regarde le tableau : pour 1 h puis pour 4 h, c’est le même garage le moins cher ?'
            }
          ]
        },
        {
          t: 'Étape 1 : je lis le point de croisement',
          apport:
            'Sur le graphique, les deux droites <b>se croisent</b> en un point : c’est le <b>point d’intersection</b>. Ses deux coordonnées te disent : à combien d’heures les deux garages ont le <b>même prix</b>, et quel est ce prix. Avant le point, une droite est plus basse que l’autre ; après, c’est l’inverse. La droite la plus <b>basse</b> est le garage le <b>moins cher</b>.',
          q: [
            { q: 'Lis à peu près le point de croisement : combien d’heures ? (h, avec la virgule)', a: 1.5, tol: 0.25, sol: 'Vers 1,5 h : c’est une valeur lue sur le graphique, donc approchée. On la vérifie dans l’étape suivante.' },
            { q: 'Et quel prix à peu près ? (€)', a: 60, tol: 8, sol: 'Vers 60 €.' },
            { q: 'Avant ce point (1 h par exemple), quel garage est le moins cher ? (Kahani ou B)', a: ['b', 'garage b'], txt: true, sol: 'Le garage B : sa droite est plus basse (40 € contre 45 € à 1 h).' },
            { q: 'Après ce point (3 h par exemple), quel garage est le moins cher ? (Kahani ou B)', a: ['kahani', 'garage de kahani'], txt: true, sol: 'Kahani : sa droite est plus basse (105 € contre 120 € à 3 h).' }
          ]
        },
        {
          t: 'Étape 2 : je vérifie par le calcul',
          apport:
            'Un graphique donne une valeur <b>approchée</b> : on vérifie par le calcul. Pour tester h = 1,5 : <b>P(1,5) = 15 + 30 × 1,5</b> et <b>Q(1,5) = 40 × 1,5</b>. On calcule la multiplication d’abord, puis on ajoute 15 pour Kahani. Si les deux résultats sont égaux, ta lecture du graphique est bonne.',
          q: [
            { q: 'Calcule P(1,5) = 15 + 30 × 1,5 (€)', a: price(KAHANI, 1.5), tol: 0 },
            { q: 'Calcule Q(1,5) = 40 × 1,5 (€)', a: price(GARAGE_B, 1.5), tol: 0 },
            { q: 'P(1,5) et Q(1,5) sont-ils égaux ? (oui ou non)', a: ['oui'], txt: true, sol: 'Oui : 60 € des deux côtés. Ta lecture du graphique (vers 1,5 h) était bonne, et le calcul le prouve.' }
          ]
        },
        {
          t: 'Étape 3 : je cherche quand les deux prix sont égaux (calculatrice)',
          doc: {
            h: ['Heures h', '0,5', '1', '1,5', '2', '2,5', '3'],
            r: [
              ['f1(x) = 15 + 30x (Kahani)', '30', '45', '60', '75', '90', '105'],
              ['f2(x) = 40x (garage B)', '20', '40', '60', '80', '100', '120']
            ]
          },
          apport:
            'Sur ta vraie NumWorks : application <i>Fonctions</i>, taper <b>15+30x</b> dans f1(x)= et <b>40x</b> dans f2(x)=. Onglet <i>Tableau</i> : tu lis x (les heures), puis les prix de f1 et de f2. Pour avancer de 0,5 en 0,5, règle le pas du tableau à 0,5 (menu de réglage de l’intervalle). Si un menu n’a pas le même nom sur ta calculatrice, demande à ton professeur. On cherche la ligne où les deux prix sont <b>égaux</b> : c’est résoudre <b>15 + 30 × h = 40 × h</b>. Ici, le tableau ci-dessus est ce que tu lis sur la calculatrice.',
          q: [
            { q: 'Pour quelle valeur de h les deux prix sont-ils égaux ? (h, avec la virgule)', a: 1.5, tol: 0, sol: 'À 1,5 h les deux garages coûtent 60 € : 15 + 30 × 1,5 = 40 × 1,5.' },
            { q: 'Pour 1 h, quel prix à Kahani, quel prix au garage B : combien de plus à Kahani ? (€)', a: 5, tol: 0, sol: '45 − 40 = 5 € de plus à Kahani pour 1 h.' }
          ]
        },
        {
          t: 'Étape 4 : je décide',
          apport:
            'Pour conseiller un client, je compare le <b>nombre d’heures de sa réparation</b> avec <b>1,5 h</b> et je donne les prix des deux garages. Moins de 1,5 h : garage B ; plus de 1,5 h : Kahani ; juste 1,5 h : c’est pareil (60 €). Une bonne phrase de conseil donne le garage, <b>les deux prix</b> et la raison.',
          q: [
            { q: 'Client 1 : 1 h de réparation. Quel garage conseilles-tu ? (Kahani ou B)', a: ['b', 'garage b'], txt: true, sol: 'Garage B : 40 € contre 45 €.' },
            { q: 'Client 2 : 1 h 30 de réparation. Quel est le prix dans chaque garage ? (€)', a: 60, tol: 0, sol: 'Les deux coûtent 60 € : c’est le même prix, tu peux choisir l’un ou l’autre.' },
            { q: 'Client 3 : 3 h de réparation. Quel garage conseilles-tu ? (Kahani ou B)', a: ['kahani', 'garage de kahani'], txt: true, sol: 'Kahani : 105 € contre 120 €. Exemple de phrase : « Pour 3 h, je te conseille Kahani : 105 € au lieu de 120 € au garage B. »' },
            { q: 'Combien le client 3 économise-t-il en choisissant le bon garage ? (€)', a: price(GARAGE_B, 3) - price(KAHANI, 3), tol: 0 }
          ]
        },
        {
          t: 'Bilan de la séquence : je m’évalue (15 minutes)',
          apport:
            'Sans regarder tes fiches ; la calculatrice est autorisée. Un garage C annonce : prix pour 0 h = 30 €, prix pour 1 h = 50 €. Rappel : le coefficient directeur est la différence entre les deux prix ; l’ordonnée à l’origine est le prix pour 0 h ; l’expression s’écrit a × h + b.',
          q: [
            { q: 'Garage C : coefficient directeur ? (€ par heure)', a: GARAGE_C4.heure, tol: 0, sol: '50 − 30 = 20 € de plus par heure.' },
            { q: 'Garage C : ordonnée à l’origine ? (€)', a: GARAGE_C4.fixe, tol: 0 },
            { q: 'Écris l’expression R(h) = … puis calcule l’image de 4 par R. (€)', a: R4(4), tol: 0, sol: 'R(h) = 30 + 20 × h, donc R(4) = 30 + 20 × 4 = 110 €.' },
            { q: 'La fonction R est-elle croissante ? (oui ou non)', a: ['oui'], txt: true, sol: 'Oui : son coefficient directeur 20 est positif, la droite monte.' },
            { q: 'Un client a 130 € : combien d’heures peut-il payer au garage C ? (h)', a: 5, tol: 0, sol: '30 + 20 × 5 = 130 € : 5 h est l’antécédent de 130 €. Phrase : « Avec 130 €, le client peut payer 5 heures au garage C. »' }
          ]
        }
      ],
      quiz: [
        { q: 'Au point de croisement des deux droites, les deux garages ont :', o: ['le même prix', 'le même coefficient directeur', 'le même diagnostic'], c: 0, e: 'Les droites se croisent là où les prix sont égaux : ici 60 € pour 1,5 h.' },
        { q: 'Pour 3 h de réparation, le garage le moins cher est :', o: ['le garage B (120 €)', 'Kahani (105 €)', 'les deux, au même prix'], c: 1, e: '15 + 30 × 3 = 105 € contre 40 × 3 = 120 €.' }
      ],
      trace:
        'Une <b>fonction</b> associe à chaque nombre d’heures (la variable) un seul prix : l’<b>image</b> ; le nombre d’heures qui donne un prix est un <b>antécédent</b>.<br>Une <b>fonction affine</b> s’écrit <b>a × h + b</b> : <b>a</b> = coefficient directeur (ce que le prix gagne pour 1 h de plus), <b>b</b> = ordonnée à l’origine (le prix pour 0 h). Si a est positif, la droite monte : la fonction est <b>croissante</b>.<br>Pour choisir entre deux garages : on cherche le <b>point de croisement</b> des deux droites (même prix). Ici : 1,5 h et 60 €, vérifié par le calcul. Avant 1,5 h le garage B est moins cher ; après, c’est Kahani.'
    }
  ]
};
