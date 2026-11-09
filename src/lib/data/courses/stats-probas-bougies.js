/* Séances ajoutées au cours « Statistiques et probabilités » (2P MV2) pour la
 * partie PROBABILITÉS : l'entrée « Le bac à bougies » et « On contrôle un lot
 * de pièces » (fluctuation d'une fréquence, 5 questions à se poser).
 *
 * Sources : probas-bac-bougies-2pmv2*, co-intervention-5-questions-2pmv2*,
 * co-intervention-releve-tirages-2pmv2, affiche-5-questions-atelier-2pmv2
 * (projet frère `cours`). Pas de corrigé enseignant : les réponses n'apparaissent
 * que dans les retours des exercices interactifs.
 * Division : jamais « ÷ », toujours une fraction via frac(). */
import { frac as F } from '../../utils/fr.js';

export const BOUGIES = {
  t: 'Le bac à bougies',
  pdf: ['probas-bac-bougies-2pmv2-standard', 'probas-bac-bougies-2pmv2-accessible'],
  prob: "Au magasin du garage, un bac contient 20 bougies d'allumage. Le mécanicien en prend une au hasard, sans regarder. Quelle chance a-t-il de tomber sur une bougie usée ?",
  steps: [
    {
      t: 'La situation',
      txt: "Au magasin du garage de Kahani, un bac contient 20 bougies : 14 neuves (○, bout creux) et 6 usées (✕, bout plein barré). Le mécanicien en prend une au hasard, sans regarder. Nombres inventés pour l'exercice."
    },
    {
      t: "Étape 1 : je décris l'expérience",
      viz: 'bac',
      apport:
        "<b>Expérience aléatoire</b> : on ne peut pas prévoir le résultat. <b>Issue</b> : un résultat possible. <b>Événement</b> : un groupe d'issues qu'on cherche. Touche « Je tire une bougie » plusieurs fois : tu ne peux jamais savoir à l'avance laquelle va sortir.",
      q: [
        { q: 'Quand on prend une bougie, combien y a-t-il de résultats différents possibles (neuve ou usée) ?', a: 2, tol: 0, sol: 'Deux issues possibles : neuve ou usée.' },
        { q: 'Événement U : « la bougie est usée ». Combien d’issues favorables dans le bac ?', a: 6, tol: 0, sol: '6 bougies usées sur 20.' }
      ]
    },
    {
      t: 'Étape 2 : je calcule la chance',
      apport: `Quand toutes les bougies ont la même chance d'être prises : <b>P(événement) = ${F('issues favorables', 'issues possibles')}</b>. Une probabilité est toujours comprise entre <b>0</b> (impossible) et <b>1</b> (certain). Pour U : ${F(6, 20)} = 0,3 (30 %).`,
      q: [
        { q: 'P(N), N = « la bougie est neuve » : 14 sur 20 = ? (décimal)', qh: `P(N) = ${F(14, 20)} = ? (décimal)`, a: 0.7, tol: 0.002, sol: '14 bougies neuves sur 20 : 0,7, soit 70 %.' },
        { q: 'P(la bougie est neuve ou usée) = ?', qh: `P(neuve ou usée) = ${F(20, 20)} = ?`, a: 1, tol: 0, sol: 'Événement certain : P = 1.' },
        { q: 'P(la bougie est bleue) = ?', qh: `P(bleue) = ${F(0, 20)} = ?`, a: 0, tol: 0, sol: 'Aucune bougie bleue : événement impossible, P = 0.' }
      ]
    },
    {
      t: "L'événement contraire",
      apport: `<b>N est le contraire de U</b> : il regroupe toutes les autres issues. Donc P(U) + P(N) = 1, soit <b>P(N) = 1 − P(U)</b>. Vérifie : 0,3 + 0,7 = 1. Dans la manipulation, valide U puis N pour voir la barre des 20 bougies se partager.`,
      q: [
        { q: 'Si P(U) = 0,3, combien vaut P(N) = 1 − P(U) ?', a: 0.7, tol: 0.002 },
        { q: 'Si P(A) = 0,85, combien vaut P(contraire de A) ?', a: 0.15, tol: 0.002, sol: '1 − 0,85 = 0,15.' }
      ]
    },
    {
      t: "Étape 3 : j'écris ma phrase",
      viz: 'phraseMv',
      vd: {
        intro: 'Exemple : « La probabilité de prendre une bougie usée est 0,3 : 6 chances sur 20. » Écris la phrase pour une bougie neuve.',
        parts: [
          'La probabilité de prendre une bougie ',
          { id: 'a', a: 'neuve' },
          ' est ',
          { id: 'b', a: '0,7' },
          ' : ',
          { id: 'c', a: '14' },
          ' chances sur ',
          { id: 'd', a: '20' },
          '.'
        ],
        bank: ['neuve', 'usée', '0,7', '0,3', '14', '6', '20', '10'],
        ok: 'Bien écrit : la phrase donne la probabilité et les issues favorables sur les issues possibles.'
      }
    },
    {
      t: 'Six mécaniciens tirent dans le bac',
      viz: 'mecaniciens',
      apport: `Six mécaniciens prennent chacun <b>10 bougies</b>, une à une, en <b>remettant</b> la bougie à chaque tirage (tirage avec remise), et comptent les bougies usées. Relevé : Madi 2, Soilihi 4, Anzali 3, Fatima 5, Ali 3, Nadia 2. Le bac n'a pas changé, pourtant leurs fréquences sont différentes : c'est la <b>fluctuation d'échantillonnage</b>. Rejoue les tirages, regroupe-les, puis ajoute des tirages.`,
      q: [
        { q: "Fréquence d'Anzali : 3 usées sur 10 = ? (décimal)", qh: `Fréquence d'Anzali : ${F(3, 10)} = ? (décimal)`, a: 0.3, tol: 0.002 },
        { q: 'Étendue des fréquences : 0,5 (Fatima) − 0,2 (Madi) = ?', a: 0.3, tol: 0.002, sol: 'Les fréquences s’étalent sur 0,3 alors que le bac est le même.' },
        { q: 'Les 6 mécaniciens regroupés : 2+4+3+5+3+2 usées sur 60 tirages. Fréquence (au centième)', qh: `Regroupés : ${F(19, 60)} ≈ ? (au centième)`, a: 0.32, tol: 0.006, sol: '19 sur 60 ≈ 0,32 : plus proche de 0,3 que la fréquence de Fatima (0,5).' }
      ]
    },
    {
      t: 'Ma phrase : fluctuation et stabilisation',
      viz: 'phraseMv',
      vd: {
        intro: 'Complète la phrase avec les mots de la banque.',
        parts: [
          'Chaque mécanicien a une fréquence ',
          { id: 'a', a: ['différente', 'differente'] },
          " : c'est la ",
          { id: 'b', a: 'fluctuation' },
          ". Quand on ",
          { id: 'c', a: 'regroupe' },
          ' plus de tirages, la fréquence se rapproche de ',
          { id: 'd', a: '0,3' },
          ', la ',
          { id: 'e', a: ['probabilité', 'probabilite'] },
          '.'
        ],
        bank: ['différente', 'identique', 'fluctuation', 'regroupe', 'sépare', '0,3', '0,5', 'probabilité', 'moyenne'],
        ok: 'Voilà le lien : la fréquence fluctue sur peu de tirages et se stabilise autour de la probabilité quand on en fait beaucoup.'
      }
    }
  ],
  quiz: [
    {
      q: 'Dans un bac de 20 bougies dont 8 usées, P(usée) vaut :',
      o: ['8', '0,4', '0,8'],
      c: 1,
      e: '8 sur 20 = 0,4. Une probabilité est toujours entre 0 et 1.'
    },
    {
      q: 'On tire une bougie au hasard. L’événement « la bougie est neuve ou usée » est :',
      o: ['impossible', 'certain', 'probable à 50 %'],
      c: 1,
      e: 'Toutes les bougies sont neuves ou usées : P = 1.'
    }
  ],
  trace:
    `Une <b>expérience aléatoire</b> a plusieurs <b>issues</b> qu'on ne peut pas prévoir. Un <b>événement</b> est un groupe d'issues. Si toutes les issues ont la même chance : <b>P = ${F('issues favorables', 'issues possibles')}</b>, un nombre compris entre 0 (impossible) et 1 (certain). L'<b>événement contraire</b> de A vérifie P(A) + P(contraire) = 1.<br>Bac à bougies : P(usée) = ${F(6, 20)} = 0,3 ; P(neuve) = ${F(14, 20)} = 0,7. Sur 10 tirages avec remise, la fréquence <b>fluctue</b> (de 0,2 à 0,5) ; regroupée sur 60 tirages (19 sur 60 ≈ 0,32) elle se rapproche de la probabilité 0,3.`
};

export const LOT_PIECES = {
  t: 'On contrôle un lot de pièces',
  pdf: [
    'co-intervention-5-questions-2pmv2-standard',
    'co-intervention-5-questions-2pmv2-accessible',
    'co-intervention-releve-tirages-2pmv2',
    'affiche-5-questions-atelier-2pmv2'
  ],
  prob: "Le magasin de l'atelier reçoit une caisse de 500 durites. Le chef d'atelier ne peut pas toutes les contrôler : il en prend quelques-unes et compte combien sont défectueuses. Peut-il conclure sur toute la caisse ?",
  steps: [
    {
      t: 'La situation',
      txt: "Le magasin de l'atelier reçoit une caisse de 500 durites (les tuyaux du circuit de refroidissement). Le chef d'atelier ne peut pas toutes les contrôler : il en prend quelques-unes et compte combien sont défectueuses. Pour s'entraîner, on remplace la caisse par un sachet de 100 jetons : un jeton rouge est une durite défectueuse. Tu ne sais pas combien il y en a."
    },
    {
      t: 'Je tire des jetons',
      viz: 'sachet',
      apport: `Quatre gestes : je tire <b>1 jeton</b>, je note <b>R</b> (rouge) ou <b>–</b> (autre), je <b>remets</b> le jeton, je mélange. Exemple : 3 rouges sur 20 tirages → ${F(3, 20)} = 0,15 = 15 %. Fais au moins 3 séries de 20 tirages avec la manipulation ci-dessus, puis ouvre le sachet.`
    },
    {
      t: 'Je calcule les fréquences de mes séries',
      apport: `La <b>fréquence</b> d'une série est ${F('nombre de rouges', 'nombre de tirages')}. Ici chaque série a 20 tirages.`,
      q: [
        { q: 'Une série compte 4 rouges sur 20. Fréquence en % ?', qh: `Une série compte 4 rouges sur 20 : ${F(4, 20)} = ? (en %)`, a: 20, tol: 0 },
        { q: 'Une série compte 2 rouges sur 20. Fréquence en % ?', qh: `Une série compte 2 rouges sur 20 : ${F(2, 20)} = ? (en %)`, a: 10, tol: 0 },
        { q: 'Avec le même sachet, mes séries sont-elles pareilles ou différentes ?', a: ['différentes', 'differentes'], txt: true, sol: 'Différentes : c’est la fluctuation d’échantillonnage, pas une erreur.' }
      ]
    },
    {
      t: 'Et avec plus de pièces ?',
      viz: 'fluctuation',
      vd: { p: 0.15, ns: [5, 20, 100, 500] },
      apport:
        "Le lot a 15 % de pièces défectueuses (repère bleu). Prélève des échantillons de taille <b>n = 5</b> puis <b>n = 500</b> et compare l'étalement des points : <b>plus on contrôle de pièces, plus l'estimation est fiable.</b> Un contrôle sur 5 pièces ne prouve rien.",
      q: [
        { q: 'Avec n = 5, une durite défectueuse trouvée donne quelle fréquence en % ?', qh: `Avec n = 5, une durite défectueuse : ${F(1, 5)} = ? (en %)`, a: 20, tol: 0, sol: '20 % alors que le lot est à 15 % : c’est normal sur 5 pièces.' },
        { q: 'Avec n = 500, les fréquences sont-elles plus proches ou plus éloignées de 15 % ?', a: ['proches', 'plus proches'], txt: true }
      ]
    },
    {
      t: 'Les 5 questions à se poser avant de répondre',
      viz: 'cinqquestions',
      apport:
        "À l'atelier, un calcul juste mais faux dans la vraie vie ne sert à rien. Avant de répondre, je me pose 5 questions : <b>1. Unité ?</b> <b>2. Ordre de grandeur ?</b> <b>3. Arrondi ?</b> <b>4. Référence ?</b> <b>5. Phrase ?</b>. Pour chaque situation, trouve la question qui révèle l'erreur, puis corrige."
    },
    {
      t: 'Ma phrase pour le chef d’atelier',
      viz: 'phraseMv',
      vd: {
        intro: 'Le chef contrôle 5 durites dans la caisse de 500 : 1 est défectueuse. Complète la phrase.',
        parts: [
          'Sur ',
          { id: 'a', a: '5' },
          ' durites contrôlées, ',
          { id: 'b', a: '1' },
          ' est défectueuse : ',
          { id: 'c', a: '20 %' },
          '. On ',
          { id: 'd', a: 'ne peut pas' },
          ' dire que toute la caisse est à 20 % : l’échantillon est trop ',
          { id: 'e', a: 'petit' },
          '.'
        ],
        bank: ['5', '500', '1', '20 %', '5 %', 'ne peut pas', 'peut', 'petit', 'grand'],
        ok: 'Phrase honnête : elle donne la fréquence de l’échantillon sans prétendre connaître le taux de toute la caisse.'
      }
    }
  ],
  quiz: [
    {
      q: 'Sur un petit échantillon, la fréquence de défauts :',
      o: ['est toujours égale à celle du lot', 'fluctue beaucoup d’un échantillon à l’autre', 'ne dépend pas du hasard'],
      c: 1,
      e: 'Plus l’échantillon est petit, plus la fréquence fluctue.'
    },
    {
      q: 'La calculatrice affiche 25,41666667 min pour la durée moyenne de vidanges relevées à la minute près. Tu écris :',
      o: ['25,41666667 min', '25,4 min', '25 min 41 s'],
      c: 1,
      e: 'On garde un seul chiffre après la virgule : 25,4 min (arrondi au dixième, à la fin).'
    }
  ],
  trace:
    `Pour contrôler un lot, on prélève un <b>échantillon</b> au hasard (avec remise ici) et on calcule la <b>fréquence</b> ${F('défectueuses', 'tirages')}. Deux échantillons du même lot donnent des fréquences différentes : c'est la <b>fluctuation d'échantillonnage</b>. Plus l'échantillon est grand, plus la fréquence est proche du taux réel : <b>un contrôle sur 5 pièces ne prouve rien</b>.<br>Avant de répondre à l'atelier : <b>Unité ? Ordre de grandeur ? Arrondi ? Référence ? Phrase ?</b>`
};
