/* Fraction typographique : numérateur au-dessus du dénominateur, jamais le
 * signe « ÷ » (règle du capitaine pour tout contenu récent). Renvoie du HTML
 * à injecter par {@html}, ou par `innerHTML` dans les manipulations.
 * Le mot « sur » est lu par les lecteurs d'écran mais invisible à l'écran
 * (classe .sr, voir global.css). Style : `.fr` dans global.css. */
export const frac = (n, d) =>
  `<span class="fr"><span class="fn">${n}</span><span class="sr"> sur </span><span class="fd">${d}</span></span>`;
