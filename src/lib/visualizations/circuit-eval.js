/* Évaluation pure du circuit construit par l'élève dans `circuit.svelte`
 * (« Dessine le circuit toi-même », séance fusible). Séparée du rendu car
 * c'est un algorithme de graphe (cycle simple, court-circuit, connexité) —
 * pas seulement de l'assemblage SVG — et se prête à être relu/testé
 * indépendamment (voir circuit-eval.test.js) même si le rendu SVG de
 * `circuit.svelte` lui-même reste hors de la suite vitest (voir AGENTS.md).
 *
 * Modèle : la grille n'autorise que des arêtes horizontales/verticales entre
 * nœuds voisins (construction, pas détection) : un fil ou un dipôle est
 * toujours droit. `evaluateCircuit` reçoit la liste des arêtes posées
 * ({a, b, type}, a/b = ids de nœuds "col-rang", type = 'fil' | 'generateur'
 * | 'fusible' | 'lampe') et renvoie un statut à trois niveaux :
 *
 * - 'red'    : électriquement faux — dipôle manquant, court-circuit du
 *              générateur (un chemin tout-fil relie ses deux bornes sans
 *              passer par un dipôle), ou boucle non fermée (fil qui ne mène
 *              nulle part, branche en trop, morceau isolé).
 * - 'orange' : boucle fermée et complète (les trois dipôles y sont, le
 *              courant circule) mais convention de schéma non respectée —
 *              ici : le fusible n'est pas placé juste après le générateur
 *              (protection du circuit entier depuis la source, cf. « À quoi
 *              sert un fusible ? » dans la même séance).
 * - 'green'  : boucle fermée, complète, fusible immédiatement après le
 *              générateur.
 *
 * Un graphe connexe où chaque nœud a un degré de 2 est nécessairement un
 * cycle simple unique (fait de théorie des graphes) : ça donne d'un coup
 * « pas de branche », « pas de fil en l'air » et « pas de deuxième boucle »
 * sans les détecter séparément.
 */

function buildAdjacency(edges) {
  const adj = new Map();
  const add = (from, to, type) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push({ to, type });
  };
  edges.forEach(({ a, b, type }) => {
    add(a, b, type);
    add(b, a, type);
  });
  return adj;
}

function bfsReachable(adj, start, { wireOnly = false } = {}) {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const n = queue.shift();
    for (const e of adj.get(n) || []) {
      if (wireOnly && e.type !== 'fil') continue;
      if (!seen.has(e.to)) {
        seen.add(e.to);
        queue.push(e.to);
      }
    }
  }
  return seen;
}

const LABELS = { generateur: 'générateur', fusible: 'fusible', lampe: 'lampe' };

export function evaluateCircuit(edges) {
  const gen = edges.find((e) => e.type === 'generateur');
  const fus = edges.find((e) => e.type === 'fusible');
  const lamp = edges.find((e) => e.type === 'lampe');

  if (!gen) {
    const missing = ['generateur', 'fusible', 'lampe'].filter(
      (t) => !edges.some((e) => e.type === t)
    );
    return { status: 'red', reason: 'missing', missing: missing.map((t) => LABELS[t]) };
  }

  const adj = buildAdjacency(edges);

  // Court-circuit : un chemin tout-fil relie déjà les deux bornes du
  // générateur sans passer par un dipôle (excluant l'arête du générateur
  // lui-même, qui n'est pas de type 'fil').
  if (bfsReachable(adj, gen.a, { wireOnly: true }).has(gen.b)) {
    return { status: 'red', reason: 'short-circuit' };
  }

  if (!fus || !lamp) {
    const missing = ['fusible', 'lampe'].filter((t) => !edges.some((e) => e.type === t));
    return { status: 'red', reason: 'missing', missing: missing.map((t) => LABELS[t]) };
  }

  const touched = new Set();
  const degree = new Map();
  edges.forEach(({ a, b }) => {
    touched.add(a);
    touched.add(b);
    degree.set(a, (degree.get(a) || 0) + 1);
    degree.set(b, (degree.get(b) || 0) + 1);
  });

  const allDegreeTwo = [...touched].every((n) => degree.get(n) === 2);
  if (!allDegreeTwo) {
    return { status: 'red', reason: 'open' };
  }

  const reached = bfsReachable(adj, gen.a);
  const allConnected = [...touched].every((n) => reached.has(n));
  if (!allConnected) {
    return { status: 'red', reason: 'open' };
  }

  // Boucle fermée et complète : convention de schéma restante — le fusible
  // protège tout le circuit, donc il doit être immédiatement après le
  // générateur (partager une borne avec lui).
  const fuseAdjacentToGen = fus.a === gen.a || fus.a === gen.b || fus.b === gen.a || fus.b === gen.b;
  if (!fuseAdjacentToGen) {
    return { status: 'orange', reason: 'fuse-not-adjacent' };
  }

  return { status: 'green', reason: 'ok' };
}
