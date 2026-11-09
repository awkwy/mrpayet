/* Séances ajoutées au cours « Statistiques et probabilités » (2P MV2) pour la
 * partie STATISTIQUE : l'écart type au garage de Kahani, le bilan du chapitre,
 * l'éval flash et la mini-évaluation en auto-test.
 *
 * Sources : fiches élèves du projet frère `cours` (ecart-type-garage-2pmv2*,
 * bilan-stats-2pmv2*, rituel-stats-2pmv2, eval-flash-stats-2pmv2-*,
 * mini-eval-stats-2pmv2-*). Aucun corrigé enseignant n'est repris : les
 * réponses n'apparaissent que dans les retours des exercices interactifs.
 * Division : jamais « ÷ » ici, toujours une fraction (numérateur sur
 * dénominateur) via frac() de $lib/utils/fr.js. */
import { frac as F } from '../../utils/fr.js';

export const SIGMA_KAHANI = {
  t: "L'écart type au garage de Kahani : qui est le plus régulier ?",
  pdf: ['ecart-type-garage-2pmv2-standard', 'ecart-type-garage-2pmv2-accessible', 'ecart-type-garage-2pmv2-mots-affiche'],
  prob: "Un client veut une vidange de scooter garantie en moins de 25 minutes. Le chef d'atelier a deux mécaniciens, Madi et Soilihi. À qui confier le scooter ?",
  steps: [
    {
      t: 'La situation',
      txt: "Au garage de Kahani, un client veut une vidange de scooter garantie en moins de 25 minutes. Le chef d'atelier compare les 10 dernières vidanges de Madi et de Soilihi pour savoir à qui confier le scooter. Valeurs d'exercice."
    },
    {
      t: 'Les 10 dernières vidanges',
      doc: {
        h: ['Mécanicien', 'Durées des 10 dernières vidanges (min)'],
        r: [
          ['Madi', '20 · 19 · 21 · 20 · 20 · 21 · 19 · 20 · 20 · 20'],
          ['Soilihi', '12 · 28 · 15 · 25 · 20 · 10 · 30 · 18 · 22 · 20']
        ]
      }
    },
    {
      t: 'Mission 1 : même moyenne, donc pareils ?',
      apport: `La moyenne se calcule en additionnant les 10 durées puis en les partageant : ${F('somme des durées', 10)}. Le chef dit : « Même moyenne, donc ils sont pareils. » Vérifie-le.`,
      q: [
        { q: 'Moyenne de Madi : 200 sur 10 = ? (min)', qh: `Moyenne de Madi : ${F(200, 10)} = ? (min)`, a: 20, tol: 0 },
        {
          q: 'Moyenne de Soilihi : somme sur 10 = ? (min)',
          qh: `Moyenne de Soilihi : ${F('somme', 10)} = ? (min). Additionne d'abord les 10 durées.`,
          a: 20,
          tol: 0,
          sol: 'La somme vaut 200 : même moyenne, 20 min pour les deux.'
        }
      ]
    },
    {
      t: 'Regarde le nuage de points',
      viz: 'sigma',
      vd: { only: ['madi', 'soilihi'] },
      apport:
        "Chaque rond est une vidange. Passe de Madi à Soilihi : le trait gris (la moyenne) ne bouge pas, mais les ronds de Soilihi sont bien plus étalés. La bande verte est centrée sur la moyenne : plus elle est large, moins la série est régulière. Tu peux tirer un rond pour voir.",
      q: [
        { q: 'Étendue de Madi (plus grande moins plus petite, en min)', a: 2, tol: 0, sol: '21 − 19 = 2 min.' },
        { q: 'Étendue de Soilihi (en min)', a: 20, tol: 0, sol: '30 − 10 = 20 min.' },
        {
          q: 'Le client veut une vidange garantie en moins de 25 min. À qui confie-t-on le scooter ? (Madi ou Soilihi)',
          a: ['Madi'],
          txt: true,
          sol: "À Madi : toutes ses vidanges tiennent entre 19 et 21 min. Soilihi a des vidanges à 28 et 30 min."
        }
      ]
    },
    {
      t: 'Mission 2 : un nombre pour mesurer la régularité',
      apport:
        "L'<b>écart type</b>, noté <b>σ</b> (sigma), dit à quel point les valeurs s'éloignent de la moyenne. <b>σ petit</b> : valeurs resserrées, mécanicien régulier. <b>σ grand</b> : valeurs éparpillées, mécanicien irrégulier. On le lit à la calculatrice, il n'y a pas de formule à retenir.<br>Sur la NumWorks : onglet <b>Données</b>, chaque valeur dans <b>V1</b> et combien de fois elle apparaît dans <b>N1</b> (pour Soilihi, 20 apparaît 2 fois, les autres 1 fois : N1 ne doit pas rester vide) ; onglet <b>Stats</b> : lis la ligne <b>Écart type σ</b>, pas « s ».",
      q: [
        { q: 'σ de Madi (min, au centième)', a: 0.63, tol: 0.006, sol: '0,63 min : très petit, Madi est régulier.' },
        { q: 'σ de Soilihi (min, au centième)', a: 6.21, tol: 0.006, sol: '6,21 min : dix fois plus grand que celui de Madi.' },
        { q: 'Le mécanicien le plus régulier a le σ le plus… (petit ou grand)', a: ['petit'], txt: true },
        { q: "Si les 10 vidanges duraient toutes 20 min, σ vaudrait ? (min)", a: 0, tol: 0, sol: 'Aucune valeur ne s’éloigne de la moyenne : σ = 0.' },
        { q: "σ s'exprime dans la même unité que les durées. Laquelle ?", a: ['min', 'minutes', 'minute'], txt: true }
      ]
    },
    {
      t: 'Mission 3 : les plaquettes de frein',
      viz: 'sigma',
      vd: { only: ['f1', 'f2'] },
      apport:
        "Le garage commande des plaquettes à deux fournisseurs. On mesure l'épaisseur de 8 plaquettes neuves de chacun (en mm). Pour freiner en sécurité, les plaquettes doivent être presque pareilles. Passe d'un fournisseur à l'autre dans le graphique : mêmes moyennes, mais pas la même largeur de bande.<br>Fournisseur 1 : 11,8 · 12,1 · 12,0 · 11,9 · 12,2 · 12,0 · 11,9 · 12,1.<br>Fournisseur 2 : 11,0 · 13,1 · 12,4 · 10,6 · 12,9 · 11,3 · 13,0 · 11,7.",
      q: [
        { q: 'Moyenne des deux fournisseurs (mm) : 96 sur 8 = ?', qh: `Moyenne commune aux deux fournisseurs : ${F(96, 8)} = ? (mm)`, a: 12, tol: 0 },
        { q: 'σ du fournisseur 1 (mm, au centième)', a: 0.12, tol: 0.006 },
        { q: 'σ du fournisseur 2 (mm, au centième)', a: 0.92, tol: 0.006 },
        {
          q: 'Pour la sécurité, le garage choisit le fournisseur… (1 ou 2)',
          a: ['1', 'fournisseur 1', 'le fournisseur 1', 'un'],
          txt: true,
          sol: 'Le fournisseur 1 : son σ est le plus petit, ses plaquettes sont presque toutes de la même épaisseur.'
        }
      ]
    },
    {
      t: "Bonus : l'incident à 60 minutes",
      viz: 'sigma',
      vd: { only: ['madi'] },
      apport:
        "Un jour, la vidange d'un scooter a duré 60 min à cause d'un boulon cassé. On l'ajoute aux 10 vidanges de Madi (11 valeurs). Appuie sur « Ajouter l'incident » et regarde ce qui bouge. Une valeur très éloignée des autres s'appelle une <b>valeur extrême</b>.",
      q: [
        { q: "Moyenne de Madi avec l'incident (min, au dixième)", a: 23.6, tol: 0.06 },
        { q: "σ de Madi avec l'incident (min, au dixième)", a: 11.5, tol: 0.06, sol: 'σ passe de 0,63 à 11,5 : il est multiplié par 18.' },
        { q: "Médiane de Madi avec l'incident (min)", a: 20, tol: 0, sol: 'La médiane ne bouge pas : 20 min.' },
        { q: "Écart interquartile avec l'incident (min)", a: 1, tol: 0, sol: 'Q₁ = 20 et Q₃ = 21 : Q₃ − Q₁ = 1 min.' },
        {
          q: 'Une valeur extrême change beaucoup la moyenne et σ, mais très peu… (la médiane ou l’étendue)',
          a: ['médiane', 'la médiane'],
          txt: true
        }
      ]
    }
  ],
  quiz: [
    {
      q: 'Deux apprentis mesurent la même pièce : A trouve σ = 0,02 mm, B trouve σ = 0,15 mm. Le plus régulier est :',
      o: ['A', 'B', 'Impossible à dire'],
      c: 0,
      e: 'Le plus petit écart type indique la série la plus resserrée.'
    },
    {
      q: 'Deux mécaniciens ont la même moyenne. Que peut-on en conclure sur leur régularité ?',
      o: ['Ils sont aussi réguliers l’un que l’autre', 'Rien : il faut regarder σ ou la dispersion', 'Le plus rapide est le plus régulier'],
      c: 1,
      e: 'La moyenne ne dit rien de la dispersion : c’est σ (ou l’écart interquartile) qui compare la régularité.'
    }
  ],
  trace:
    "Deux séries peuvent avoir la <b>même moyenne</b> et ne pas être aussi <b>régulières</b>. L'<b>écart type σ</b> (lu à la calculatrice, ligne σ et non « s ») mesure l'éloignement moyen à la moyenne : <b>σ petit = série régulière</b>, σ grand = série dispersée. σ s'exprime dans l'unité des valeurs.<br>Madi : σ ≈ 0,63 min ; Soilihi : σ ≈ 6,21 min. Une <b>valeur extrême</b> (60 min) fait exploser la moyenne et σ mais pas la médiane : alors on décrit la série avec la <b>médiane et l'écart interquartile</b>."
};

export const BILAN = {
  t: "Bilan : l'équipe du matin ou celle de l'après-midi ?",
  pdf: ['bilan-stats-2pmv2-standard', 'bilan-stats-2pmv2-accessible'],
  prob: "Au garage de Kahani, deux équipes font des vidanges et ont la même moyenne, environ 23,5 min. Sont-elles pareilles ? Laquelle est la plus régulière, et comment le voit-on ?",
  steps: [
    {
      t: 'Ce que je retiens : les indicateurs',
      doc: {
        h: ['Indicateur', 'Ce qu’il dit', 'Comment on le trouve'],
        r: [
          ['Moyenne', 'la valeur « si tout était partagé à égalité »', 'on additionne toutes les valeurs, puis on partage entre l’effectif total'],
          ['Médiane', 'coupe la série en deux moitiés égales', 'on range ; effectif impair : valeur du milieu ; pair : milieu des deux valeurs centrales'],
          ['Étendue', 'écart entre le plus petit et le plus grand relevé', 'plus grande valeur − plus petite valeur'],
          ['Q₁ et Q₃', 'au moins 25 % des relevés sont ≤ Q₁ ; au moins 75 % sont ≤ Q₃', 'série rangée ; rang = effectif × 0,25 (ou × 0,75), arrondi au rang du dessus'],
          ['Écart interquartile', 'la largeur de la boîte : la moitié centrale des relevés', 'Q₃ − Q₁'],
          ['Écart type σ', 'petit : série régulière ; grand : série dispersée', 'à la calculatrice (ligne σ, pas « s »)']
        ]
      },
      apport:
        "<b>Règle d'or</b> : avant de chercher la médiane, les quartiles, le minimum ou le maximum, je <b>range</b> toujours la série dans l'ordre croissant. Si la série n'est pas rangée, tout le reste est faux.<br>Lire une boîte à moustaches : la boîte va de Q₁ à Q₃ (la moitié centrale), le trait épais est la médiane, les moustaches vont du minimum au maximum. <b>Boîte étroite = série régulière ; boîte large = série dispersée.</b>"
    },
    {
      t: 'La situation',
      txt: "Au garage de Kahani, deux équipes font des vidanges : 24 vidanges le matin et 24 l'après-midi (durées en minutes, valeurs d'exercice). Le patron dit : « Elles ont la même moyenne, 565 sur 24, soit environ 23,5 min. » Est-ce que ça veut dire qu'elles sont pareilles ?",
      apport: `Équipe du matin, dans l'ordre du relevé : 22 · 25 · 28 · 24 · 22 · 24 · 31 · 27 · 22 · 26 · 24 · 24 · 22 · 19 · 23 · 23 · 21 · 25 · 20 · 20 · 26 · 23 · 21 · 23.<br>Équipe de l'après-midi, déjà rangée : 12 · 14 · 16 · 17 · 18 · 19 · 19 · 20 · 21 · 22 · 22 · 23 · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 29 · 30 · 32 · 34 · 35.<br>Moyenne : ${F(565, 24)} ≈ 23,5 min pour les deux équipes.`
    },
    {
      t: 'Étape 1 : range les durées du matin',
      viz: 'triSerie',
      apport:
        "Touche la <b>plus petite</b> durée qui reste : elle va dans sa case numérotée. Si tu te trompes, la pastille tremble. Une fois les 24 valeurs rangées, les repères Q₁, médiane et Q₃ apparaissent au rang qui leur correspond.",
      q: [
        { q: 'Combien de valeurs dans la série ?', a: 24, tol: 0 },
        { q: 'Plus petite durée du matin (min)', a: 19, tol: 0 },
        { q: 'Plus grande durée du matin (min)', a: 31, tol: 0 }
      ]
    },
    {
      t: 'Étape 2 : complète le tableau des indicateurs',
      viz: 'bilanTableau',
      apport:
        "Remplis chaque case (calculatrice autorisée ; avec la série rangée, tu lis le minimum, le maximum et les rangs). La case devient verte quand elle est juste. Le bouton « ? » d'une ligne donne la méthode sans donner le résultat."
    },
    {
      t: 'Mes calculs avec des fractions',
      apport: `Je garde la trace de mes calculs avec des fractions, pour relire le cours : la moyenne vaut ${F(565, 24)}, la médiane ${F('(23 + 23)', 2)}.`,
      q: [
        { q: 'Moyenne du matin : 565 sur 24 ≈ ? (min, au dixième)', qh: `Moyenne du matin : ${F(565, 24)} ≈ ? (min, au dixième)`, a: 23.5, tol: 0.05 },
        { q: 'Médiane du matin : (23 + 23) sur 2 = ? (min)', qh: `Médiane du matin : ${F('(23 + 23)', 2)} = ? (min)`, a: 23, tol: 0 },
        { q: "Médiane de l'après-midi : milieu des 12ᵉ et 13ᵉ valeurs (23 et 23), en min", a: 23, tol: 0, sol: 'Même médiane que le matin : 23 min.' }
      ]
    },
    {
      t: 'Étape 3 : trace les deux boîtes sur le même axe',
      viz: 'boitesEquipes',
      apport:
        "Fais glisser les cinq repères de chaque équipe sur <b>un seul axe</b> (de 10 à 36 min) : minimum, Q₁, médiane, Q₃, maximum. Le trait pointillé est le barème (24 min). Compare ensuite la largeur des deux boîtes.",
      q: [
        { q: 'Largeur de la boîte du matin, Q₃ − Q₁ (min)', a: 3, tol: 0 },
        { q: "Largeur de la boîte de l'après-midi, Q₃ − Q₁ (min)", a: 9, tol: 0 },
        { q: 'Quelle boîte est la plus large ? (matin ou après-midi)', a: ['après-midi', 'apres-midi', "l'après-midi", 'après midi'], txt: true }
      ]
    },
    {
      t: 'Étape 4 : conclus',
      viz: 'phraseMv',
      vd: {
        intro: 'Complète la conclusion avec les mots de la banque.',
        parts: [
          'Les deux équipes ont la même ',
          { id: 'a', a: 'moyenne' },
          ". L'équipe ",
          { id: 'b', a: 'du matin' },
          ' est la plus régulière : sa boîte est plus ',
          { id: 'c', a: ['étroite', 'etroite'] },
          ' et son écart type est plus ',
          { id: 'd', a: 'petit' },
          '.'
        ],
        bank: ['du matin', "de l'après-midi", 'moyenne', 'étroite', 'large', 'petit', 'grand'],
        ok: "Bien conclu. Même moyenne, mais l'équipe du matin est plus régulière : boîte étroite (3 min), σ ≈ 2,7 min contre ≈ 6,0 min."
      },
      apport: "Les deux équipes ont la même moyenne. Sont-elles pareilles ? Laquelle est la plus régulière, et comment le vois-tu ?"
    }
  ],
  quiz: [
    {
      q: 'Deux équipes ont la même moyenne. Boîte du matin : 3 min de large ; boîte de l’après-midi : 9 min. La plus régulière est :',
      o: ['L’équipe du matin', 'L’équipe de l’après-midi', 'Elles sont aussi régulières'],
      c: 0,
      e: 'La boîte la plus étroite (3 min) regroupe la moitié des vidanges sur un intervalle plus court : équipe plus régulière.'
    },
    {
      q: 'Avant de chercher la médiane ou les quartiles, que fais-tu toujours ?',
      o: ['Je range la série dans l’ordre croissant', 'Je calcule la moyenne', 'Je trace la boîte'],
      c: 0,
      e: 'Sans série rangée, la médiane et les quartiles sont faux : règle d’or.'
    }
  ],
  trace:
    "Deux séries peuvent avoir la <b>même moyenne</b> et la <b>même médiane</b> sans être pareilles. Pour comparer, on range, on calcule les cinq nombres (minimum, Q₁, médiane, Q₃, maximum), on trace les <b>boîtes sur le même axe</b>, et on lit leur <b>largeur</b>.<br>Matin : 19 · 22 · 23 · 25 · 31, boîte de 3 min, σ ≈ 2,7 min. Après-midi : 12 · 19 · 23 · 28 · 35, boîte de 9 min, σ ≈ 6,0 min. Boîte étroite et σ petit : <b>équipe plus régulière</b>."
};

export const EVAL_FLASH = {
  t: 'Éval flash : teste-toi (10 min)',
  pdf: ['eval-flash-stats-2pmv2-A', 'eval-flash-stats-2pmv2-A-accessible', 'eval-flash-stats-2pmv2-B', 'eval-flash-stats-2pmv2-B-accessible'],
  prob: "Un client téléphone au garage : « Une vidange dure 25 minutes ou moins, en général ? » Quelle réponse lui donner avec seulement six relevés, dont un très éloigné ?",
  steps: [
    {
      t: 'Comment fonctionne cet auto-test',
      txt: "Tu réponds à toutes les questions, calculatrice autorisée. Les réponses restent cachées. Quand tu rends ton auto-test, chaque question est corrigée avec son explication, et ton score se répartit en trois compétences : Analyser (choisir le bon indicateur), Réaliser (calculer), Communiquer (répondre au client en une phrase). Choisis la version A ou B, standard ou en langue accessible."
    },
    {
      t: 'Éval flash, 6 points',
      viz: 'autotestChoix',
      vd: {
        sets: [
          { label: 'Version A (vidanges)', std: 'flash-A', acc: 'flash-A-acc' },
          { label: 'Version B (plaquettes)', std: 'flash-B', acc: 'flash-B-acc' }
        ]
      }
    }
  ],
  quiz: [
    {
      q: 'Parmi les relevés 23 ; 21 ; 26 ; 24 ; 22 ; 70, quel indicateur décrit le mieux une vidange habituelle ?',
      o: ['La moyenne', 'La médiane', 'La somme'],
      c: 1,
      e: 'La valeur 70 est extrême : elle tire la moyenne (31) très au-dessus des autres relevés, alors que la médiane (23,5) reste représentative.'
    }
  ],
  trace:
    "Pour répondre à une question du type « en général ? » avec une valeur très éloignée dans la série, on utilise la <b>médiane</b>. Une réponse complète au client comporte : <b>OUI ou NON</b>, l'<b>indicateur</b> utilisé, son <b>nombre avec l'unité</b>, et la <b>comparaison</b> avec la limite du client."
};

export const MINI_EVAL = {
  t: 'Mini-évaluation : teste-toi (20 min)',
  pdf: ['mini-eval-stats-2pmv2-A', 'mini-eval-stats-2pmv2-A-accessible', 'mini-eval-stats-2pmv2-B', 'mini-eval-stats-2pmv2-B-accessible'],
  prob: "Un client demande si une vidange se fait en 25 minutes ou moins. Sept relevés, puis un huitième, puis un neuvième très éloigné : qu'est-ce qui bouge, et que réponds-tu ?",
  steps: [
    {
      t: 'Comment fonctionne cet auto-test',
      txt: "Même principe que l'éval flash : tu réponds à tout, puis tu rends ton auto-test pour voir les corrections, les explications et ton score (Analyser, Réaliser, Communiquer). Écris tes calculs sur ton cahier avec des fractions. Un point de bonus (hors total) est proposé à la fin."
    },
    {
      t: 'Mini-évaluation, 10 points',
      viz: 'autotestChoix',
      vd: {
        sets: [
          { label: 'Version A (vidanges)', std: 'mini-A', acc: 'mini-A-acc' },
          { label: 'Version B (plaquettes)', std: 'mini-B', acc: 'mini-B-acc' }
        ]
      }
    }
  ],
  quiz: [
    {
      q: 'On ajoute un relevé très éloigné à une série. Quel indicateur bouge le plus ?',
      o: ['La médiane', 'La moyenne', 'Aucun des deux'],
      c: 1,
      e: 'La moyenne se laisse tirer par la valeur extrême, la médiane ne dépend que du rang.'
    },
    {
      q: 'Avec 8 valeurs, la médiane est :',
      o: ['Toujours l’un des relevés', 'Le milieu des 4ᵉ et 5ᵉ valeurs rangées', 'La moyenne de toutes les valeurs'],
      c: 1,
      e: 'Effectif pair : milieu des deux valeurs centrales, qui peut ne pas être un relevé.'
    }
  ],
  trace:
    "Avec un <b>effectif impair</b>, la médiane est la valeur centrale ; avec un <b>effectif pair</b>, c'est le milieu des deux valeurs centrales (elle peut ne pas être un relevé). Une <b>valeur extrême</b> déplace beaucoup la moyenne et très peu la médiane : pour répondre à un client sur la durée « habituelle », on prend la médiane."
};
