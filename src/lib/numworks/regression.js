export function affine(points) {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
    sxy += x * y;
    sxx += x * x;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const a = (n * sxy - sx * sy) / denom;
  const b = (sy - a * sx) / n;
  return { a, b };
}

// y = a * e^(b x) — linéarisation par ln(y) = ln(a) + b x, puis régression
// affine de ln(y) contre x. Toutes les valeurs y doivent être strictement
// positives (ln indéfini sinon).
export function exponential(points) {
  if (points.some(([, y]) => y <= 0)) return null;
  const fit = affine(points.map(([x, y]) => [x, Math.log(y)]));
  if (!fit) return null;
  return { a: Math.exp(fit.b), b: fit.a };
}

// y = a * ln(x) + b — régression affine directe de y contre ln(x). Toutes
// les valeurs x doivent être strictement positives (ln indéfini sinon).
export function logarithmic(points) {
  if (points.some(([x]) => x <= 0)) return null;
  return affine(points.map(([x, y]) => [Math.log(x), y]));
}

// Statistiques descriptives + coefficient de corrélation (Pearson) d'une
// série statistique à deux variables — l'onglet Stats de la calculatrice.
// Le coefficient r mesure la qualité d'un ajustement AFFINE ; pour un
// ajustement exponentiel/logarithmique, la corrélation pertinente porterait
// sur les données linéarisées (hors périmètre de ce cours, qui n'exerce que
// la régression affine).
export function pearsonStats(points) {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
    sxy += x * y;
    sxx += x * x;
    syy += y * y;
  }
  const xbar = sx / n, ybar = sy / n;
  const cov = sxy / n - xbar * ybar;
  const varX = sxx / n - xbar * xbar;
  const varY = syy / n - ybar * ybar;
  const denom = Math.sqrt(varX * varY);
  const r = denom === 0 ? null : cov / denom;
  return { n, sx, sy, sxy, sxx, xbar, ybar, cov, r, r2: r === null ? null : r * r };
}
