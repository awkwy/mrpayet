// Fractions rendues en HTML — règle du capitaine : jamais le signe ÷, toujours
// une fraction (numérateur au-dessus, dénominateur en dessous). Utilisé dans
// les champs HTML des cours (`apport`, `trace`, `met` des fiches récap), qui
// sont insérés par {@html}. La mise en forme vit dans `global.css` (`.fr`).
// Pour du texte brut (libellé de question, option de QCM), on écrit « 8 sur 20 ».

/** Fraction empilée : n au-dessus de d. */
export function fr(n, d) {
  return `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
}

/** Formate un nombre à la française (virgule), sans zéros inutiles. */
export function fmt(x, max = 3) {
  const f = 10 ** max;
  return String(Math.round(x * f) / f).replace('.', ',');
}
