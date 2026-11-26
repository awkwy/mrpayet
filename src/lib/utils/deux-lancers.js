// Deux lancers d'un jeton soleil (S) / lune (L) — logique pure de la
// manipulation « deuxlancers » (séance « Le jeton soleil-lune »).
// Le code est celui de la calculatrice : randint(1,2) donne 1 (soleil) ou 2 (lune).
// Jamais de signe ÷ dans les textes : le rendu affiche des fractions.

/** Tire 1 ou 2 comme randint(1,2). `rng` renvoie un réel dans [0 ; 1[. */
export function randint12(rng = Math.random) {
  return rng() < 0.5 ? 1 : 2;
}

/** Une paire de lancers : « SS », « SL », « LS » ou « LL ». */
export function pair(rng = Math.random) {
  return (randint12(rng) === 1 ? 'S' : 'L') + (randint12(rng) === 1 ? 'S' : 'L');
}

/** Les 4 résultats possibles du tableau à double entrée (1er lancer, 2e lancer). */
export const PAIRES = ['SS', 'SL', 'LS', 'LL'];

/** Compte les trois sortes : deux soleils, un de chaque, deux lunes. */
export function tally(pairs) {
  const t = { ss: 0, mix: 0, ll: 0, total: pairs.length };
  for (const p of pairs) {
    if (p === 'SS') t.ss++;
    else if (p === 'LL') t.ll++;
    else t.mix++;
  }
  return t;
}

/** Fréquence arrondie au millième (0 si rien n'a été lancé). */
export function freq(n, total) {
  return total ? Math.round((n / total) * 1000) / 1000 : 0;
}

/** Probabilités théoriques : SS 1 sur 4, un de chaque 2 sur 4, LL 1 sur 4. */
export const THEORIE = { ss: 0.25, mix: 0.5, ll: 0.25 };
