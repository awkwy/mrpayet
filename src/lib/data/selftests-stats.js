/* Auto-tests de statistique 2P MV2 : éval flash (A, B) et mini-évaluation
 * (A, B), en version standard et en langue accessible.
 *
 * Sources : les fiches élèves `eval-flash-stats-2pmv2-*` et
 * `mini-eval-stats-2pmv2-*` du projet frère `cours` (énoncés et barèmes
 * repris tels quels ; les corrigés enseignant ne sont PAS repris ici : les
 * réponses attendues n'apparaissent qu'après « Je rends mon auto-test »).
 * Toutes les valeurs attendues sont CALCULÉES par $lib/utils/stats-mv.js à
 * partir des relevés, jamais saisies à la main : impossible de désaccorder un
 * énoncé et son corrigé. Consommé par la manipulation `autotest`
 * (src/lib/visualizations/autotest.svelte), voir son en-tête pour le schéma. */
import { mean, median, round, sortAsc } from '../utils/stats-mv.js';
import { frac } from '../utils/fr.js';

const fr = (x) => String(x).replace('.', ',');
const WORDS = ['la médiane', 'la moyenne'];

// ---------------------------------------------------------------- éval flash
const FLASH = {
  A: {
    ask: 'Une vidange dure 25 minutes ou moins, en général ?',
    thing: 'durées de vidange',
    unit: 'min',
    vals: [23, 21, 26, 24, 22, 70],
    limit: 25
  },
  B: {
    ask: 'Un jeu de plaquettes de frein coûte 42 € ou moins, en général ?',
    thing: "prix d'un jeu de plaquettes",
    unit: '€',
    vals: [44, 47, 41, 49, 45, 9],
    limit: 42
  }
};

function flash(letter, acc) {
  const f = FLASH[letter];
  const s = sortAsc(f.vals);
  const med = median(f.vals);
  const moy = round(mean(f.vals), 1);
  const sum = f.vals.reduce((a, b) => a + b, 0);
  // le relevé le plus éloigné de la médiane (la valeur extrême)
  const odd = f.vals.reduce((a, b) => (Math.abs(b - med) > Math.abs(a - med) ? b : a));
  const yes = med <= f.limit;
  const cmp = yes ? 'plus petit que' : 'plus grand que';
  const sent = `${yes ? 'Oui' : 'Non'} : la médiane est de ${fr(med)} ${f.unit}, ce qui est ${cmp} ${f.limit} ${f.unit}.`;
  const calc = `Médiane : ${frac('(' + s[2] + ' + ' + s[3] + ')', 2)} = ${fr(med)} ${f.unit}. Moyenne : ${frac(sum, 6)} ≈ ${fr(moy)} ${f.unit}.`;

  const q = [];
  if (!acc) {
    q.push({
      id: 'a1',
      comp: 'A',
      pts: 1,
      kind: 'choice',
      q: 'Pour répondre au client, quel indicateur choisis-tu ?',
      options: WORDS,
      correct: 0,
      why: `La médiane : le relevé ${odd} est très éloigné des autres, la moyenne se laisserait tirer vers lui.`
    });
    q.push({
      id: 'a2',
      comp: 'A',
      pts: 1,
      kind: 'choice',
      q: 'Explique ton choix (regarde les relevés) :',
      options: [
        `Le relevé ${odd} est une valeur extrême : elle fausserait la moyenne, pas la médiane`,
        'La médiane est toujours plus petite que la moyenne',
        "C'est l'indicateur le plus rapide à calculer"
      ],
      correct: 0,
      why: `Une valeur très éloignée déplace la moyenne mais très peu la médiane.`
    });
    q.push({
      id: 'r1',
      comp: 'R',
      pts: 2,
      kind: 'nums',
      q: 'Calcule la médiane et la moyenne (au dixième). Range d\'abord les valeurs.',
      fields: [
        { label: 'Médiane =', a: med, unit: f.unit, pts: 1 },
        { label: 'Moyenne ≈', a: moy, tol: 0.06, unit: f.unit, pts: 1, show: fr(moy) }
      ],
      why: calc
    });
    q.push({
      id: 'c1',
      comp: 'C',
      pts: 2,
      kind: 'open',
      q: `Rédige ta réponse au client en une phrase : OUI ou NON, l'indicateur utilisé, son nombre, et la comparaison avec ${f.limit} ${f.unit}.`,
      model: sent,
      criteria: [
        `J'ai répondu ${yes ? 'OUI' : 'NON'}`,
        "J'ai dit quel indicateur j'utilise (la médiane)",
        `J'ai donné son nombre, avec l'unité (${fr(med)} ${f.unit})`,
        `J'ai comparé ce nombre à ${f.limit} ${f.unit} (${cmp})`
      ]
    });
  } else {
    q.push({
      id: 'a1',
      comp: 'A',
      pts: 2,
      kind: 'phrase',
      q: 'Complète la phrase avec les mots de la boîte.',
      phrase: {
        parts: ['Je choisis ', { id: 'a', a: 'la médiane', w: 1 }, ' pour répondre au client, parce que le relevé ', { id: 'b', a: String(odd), w: 0.5 }, ' est très ', { id: 'c', a: 'loin', w: 0.5 }, ' des autres.'],
        bank: ['la médiane', 'la moyenne', String(odd), 'loin', 'proches']
      },
      why: `On choisit la médiane : ${odd} est très loin des autres relevés.`
    });
    q.push({
      id: 'r0',
      comp: 'R',
      pts: 1,
      kind: 'list',
      q: `Range les 6 relevés du plus petit au plus grand (sépare par des « ; »).`,
      a: s,
      why: `Série rangée : ${s.join(' ; ')}.`
    });
    q.push({
      id: 'r1',
      comp: 'R',
      pts: 1,
      kind: 'nums',
      q: 'Calcule la médiane et la moyenne (au dixième).',
      fields: [
        { label: 'Médiane =', a: med, unit: f.unit, pts: 0.5 },
        { label: 'Moyenne ≈', a: moy, tol: 0.06, unit: f.unit, pts: 0.5, show: fr(moy) }
      ],
      why: calc
    });
    q.push({
      id: 'c1',
      comp: 'C',
      pts: 2,
      kind: 'phrase',
      q: 'Écris ta réponse au client : complète avec la boîte de mots.',
      phrase: {
        parts: [
          'Je réponds ',
          { id: 'a', a: yes ? 'OUI' : 'NON', w: 0.5 },
          ". J'utilise ",
          { id: 'b', a: 'la médiane', w: 0.5 },
          '. Ce nombre est ',
          { id: 'c', a: fr(med), type: 'num', w: 0.5, label: 'la médiane' },
          ` ${f.unit}. Il est `,
          { id: 'd', a: cmp, w: 0.5 },
          ` ${f.limit} ${f.unit}.`
        ],
        bank: ['OUI', 'NON', 'la médiane', 'la moyenne', 'plus petit que', 'plus grand que']
      },
      why: sent
    });
  }
  return {
    id: `flash-${letter}${acc ? '-acc' : ''}`,
    unitTitle: 'points',
    intro: `Un client téléphone au garage : « ${f.ask} »`,
    data: `Tu as relevé 6 ${f.thing} (en ${f.unit}) : <b>${f.vals.join(' ; ')}</b>`,
    questions: q
  };
}

// ----------------------------------------------------------- mini-évaluation
const MINI = {
  A: {
    ask: 'Une vidange, c’est fait en 25 minutes ou moins, en général ?',
    thing: 'durées de vidange',
    unit: 'min',
    vals: [24, 19, 31, 22, 27, 20, 26],
    add8: 21,
    add9: 85,
    limit: 25,
    sig: [2.7, 0.8]
  },
  B: {
    ask: 'Le prix habituel d’un jeu de plaquettes rentre-t-il dans mon budget de 42 € ?',
    thing: "prix d'un jeu de plaquettes de frein",
    unit: '€',
    vals: [38, 52, 41, 47, 36, 49, 44],
    add8: 55,
    add9: 8,
    limit: 42,
    sig: [4.6, 1]
  }
};

function mini(letter, acc) {
  const m = MINI[letter];
  const u = m.unit;
  const s7 = sortAsc(m.vals);
  const v8 = [...m.vals, m.add8];
  const v9 = [...v8, m.add9];
  const s8 = sortAsc(v8);
  const s9 = sortAsc(v9);
  const med7 = median(m.vals);
  const med8 = median(v8);
  const med9 = median(v9);
  const moy7 = round(mean(m.vals), 1);
  const moy8 = mean(v8);
  const moy9 = round(mean(v9), 1);
  const sum7 = m.vals.reduce((a, b) => a + b, 0);
  const sum9 = v9.reduce((a, b) => a + b, 0);
  const yes = med9 <= m.limit;
  const cmp = yes ? 'plus petit que' : 'plus grand que';
  const moved = Math.abs(moy9 - moy8) > Math.abs(med9 - med8) ? 1 : 0;
  const q = [];
  const secA = 'A · Avec ces 7 relevés (5 pts)';
  const secB = `B · Un 8ᵉ relevé : ${m.add8} ${u} (2 pts)`;
  const secC = `C · Un 9ᵉ relevé très éloigné : ${m.add9} ${u} (2 pts)`;
  const secD = 'D · Que réponds-tu au client ? (1 pt)';

  q.push({
    id: 'a1', section: secA, comp: 'R', pts: 1, kind: 'list',
    q: `Range les 7 valeurs dans l'ordre croissant (sépare par des « ; »).`,
    a: s7, why: `Série rangée : ${s7.join(' ; ')}.`
  });
  q.push({
    id: 'a2', section: secA, comp: 'R', pts: 1, kind: 'nums',
    q: acc ? 'Il y a 7 nombres. La médiane est le nombre du milieu : quel numéro, sur 7 ? Puis quelle valeur ?' : 'Trouve la médiane. Explique comment : quelle place ?',
    fields: [
      { label: 'Place du milieu (n°)', a: 4, pts: 0.5 },
      { label: 'Médiane =', a: med7, unit: u, pts: 0.5 }
    ],
    why: `7 valeurs : la médiane est la 4ᵉ valeur de la série rangée, soit ${fr(med7)} ${u}.`
  });
  q.push({
    id: 'a3', section: secA, comp: 'R', pts: 1, kind: 'nums',
    q: "Calcule l'étendue (plus grande valeur − plus petite valeur).",
    fields: [{ label: 'Étendue =', a: s7[6] - s7[0], unit: u }],
    why: `${s7[6]} − ${s7[0]} = ${s7[6] - s7[0]} ${u}.`
  });
  q.push({
    id: 'a4', section: secA, comp: 'R', pts: 1, kind: 'nums',
    q: 'Calcule la moyenne (arrondie au dixième) : on additionne tout, puis on partage entre 7.',
    fields: [{ label: 'Moyenne ≈', a: moy7, tol: 0.06, unit: u, show: fr(moy7) }],
    why: `${frac(sum7, 7)} ≈ ${fr(moy7)} ${u}.`
  });
  if (!acc) {
    q.push({
      id: 'a5', section: secA, comp: 'A', pts: 1, kind: 'nums',
      q: `Complète : « La moitié des relevés sont de … ${u} ou moins. »`,
      fields: [{ label: '…', a: med7, unit: u }],
      why: `C'est la médiane : ${fr(med7)} ${u}.`
    });
  } else {
    q.push({
      id: 'a5', section: secA, comp: 'A', pts: 1, kind: 'phrase',
      q: 'Complète avec un mot ou un nombre de la boîte.',
      phrase: {
        parts: ['La moitié des relevés sont de ', { id: 'a', a: String(med7), type: 'num', w: 0.5, label: 'valeur' }, ` ${u} ou moins. Ce nombre s'appelle `, { id: 'b', a: 'la médiane', w: 0.5 }, '.'],
        bank: ['la médiane', 'la moyenne', "l'étendue"]
      },
      why: `${fr(med7)} ${u} : c'est la médiane.`
    });
  }

  q.push({
    id: 'b1', section: secB, comp: 'R', pts: 1, kind: 'nums',
    q: `Avec 8 valeurs, il y a deux nombres au milieu : le 4ᵉ et le 5ᵉ. Quelles sont-ils, et quelle est la nouvelle médiane ?`,
    fields: [
      { label: '4ᵉ valeur', a: s8[3], unit: u, pts: 0.25 },
      { label: '5ᵉ valeur', a: s8[4], unit: u, pts: 0.25 },
      { label: 'Médiane =', a: med8, unit: u, pts: 0.5, show: fr(med8) }
    ],
    why: `Série rangée : ${s8.join(' ; ')}. Médiane : ${frac('(' + s8[3] + ' + ' + s8[4] + ')', 2)} = ${fr(med8)} ${u}.`
  });
  q.push({
    id: 'b2', section: secB, comp: 'A', pts: 1, kind: 'choice',
    q: 'La médiane est-elle l\'un des 8 relevés ?',
    options: [
      'Oui : la médiane est toujours un des relevés',
      `Non : avec un nombre pair de valeurs, c'est le milieu de deux valeurs, et ${fr(med8)} n'est pas dans la série`,
      acc ? 'Non : la médiane est le plus petit relevé' : 'Non : la médiane est toujours plus petite que tous les relevés'
    ],
    correct: 1,
    why: `${fr(med8)} ${u} n'est aucun des 8 relevés : c'est le milieu des deux valeurs centrales.`
  });

  q.push({
    id: 'c1', section: secC, comp: 'R', pts: 1, kind: 'nums',
    q: 'Calcule la nouvelle médiane (la 5ᵉ valeur des 9) et la nouvelle moyenne (au dixième).',
    fields: [
      { label: 'Médiane =', a: med9, unit: u, pts: 0.5 },
      { label: 'Moyenne ≈', a: moy9, tol: 0.06, unit: u, pts: 0.5, show: fr(moy9) }
    ],
    why: `Médiane : la 5ᵉ valeur de ${s9.join(' ; ')} = ${fr(med9)} ${u}. Moyenne : ${frac(sum9, 9)} ≈ ${fr(moy9)} ${u}.`
  });
  q.push({
    id: 'c2', section: secC, comp: 'A', pts: 1, kind: 'choice',
    q: `Quel nombre a le plus bougé quand le 9ᵉ relevé (${m.add9} ${u}) est arrivé ?`,
    options: WORDS,
    correct: moved,
    why: `Entre 8 et 9 valeurs : la médiane passe de ${fr(med8)} à ${fr(med9)} ${u}, la moyenne de ${fr(round(moy8, 1))} à ${fr(moy9)} ${u}. ${moved ? 'La moyenne a le plus bougé' : 'La médiane a le plus bougé'} : c'est la valeur extrême qui la tire.`
  });

  if (!acc) {
    q.push({
      id: 'd1', section: secD, comp: 'C', pts: 1, kind: 'open',
      q: `Réponds OUI ou NON, dis quel indicateur tu utilises, donne son nombre, et compare avec la limite du client (${m.limit} ${u}).`,
      model: `${yes ? 'Oui' : 'Non'} : j'utilise la médiane, car un relevé (${m.add9} ${u}) est très éloigné des autres. Elle vaut ${fr(med9)} ${u}, ce qui est ${cmp} ${m.limit} ${u}.`,
      criteria: [`J'ai répondu ${yes ? 'OUI' : 'NON'}`, "J'ai choisi la médiane (valeur extrême)", `J'ai donné son nombre (${fr(med9)} ${u})`, `J'ai comparé à ${m.limit} ${u}`]
    });
  } else {
    q.push({
      id: 'd1', section: secD, comp: 'C', pts: 1, kind: 'phrase',
      q: 'Complète la réponse avec les mots de la boîte.',
      phrase: {
        parts: [
          'Je réponds : ', { id: 'a', a: yes ? 'OUI' : 'NON', w: 0.25 },
          ". J'utilise : ", { id: 'b', a: 'la médiane', w: 0.25 },
          ', car un relevé est très différent des autres. Ce nombre est ', { id: 'c', a: String(med9), type: 'num', w: 0.25, label: 'la médiane' },
          ` ${u}. Il est `, { id: 'd', a: cmp, w: 0.25 }, ` ${m.limit} ${u}.`
        ],
        bank: ['OUI', 'NON', 'la médiane', 'la moyenne', 'plus petit que', 'plus grand que']
      },
      why: `${yes ? 'Oui' : 'Non'} : la médiane vaut ${fr(med9)} ${u}, ${cmp} ${m.limit} ${u}.`
    });
  }
  q.push({
    id: 'e1', bonus: true, comp: 'A', pts: 1, kind: 'choice',
    q: `Bonus. Deux équipes ont la même moyenne. Écart type de l'équipe 1 : σ ≈ ${fr(m.sig[0])} ; équipe 2 : σ ≈ ${fr(m.sig[1])}. Laquelle est la plus régulière ?`,
    options: [`L'équipe 1 (σ ≈ ${fr(m.sig[0])})`, `L'équipe 2 (σ ≈ ${fr(m.sig[1])})`],
    correct: 1,
    why: "Le plus petit écart type indique la série la plus resserrée autour de la moyenne : l'équipe 2 est la plus régulière."
  });
  return {
    id: `mini-${letter}${acc ? '-acc' : ''}`,
    unitTitle: 'points',
    intro: `Un client téléphone au garage : « ${m.ask} »`,
    data: `Tu as relevé 7 ${m.thing} (en ${u}) : <b>${m.vals.join(' ; ')}</b>`,
    questions: q
  };
}

export const SELFTESTS = {
  'flash-A': flash('A', false),
  'flash-A-acc': flash('A', true),
  'flash-B': flash('B', false),
  'flash-B-acc': flash('B', true),
  'mini-A': mini('A', false),
  'mini-A-acc': mini('A', true),
  'mini-B': mini('B', false),
  'mini-B-acc': mini('B', true)
};
