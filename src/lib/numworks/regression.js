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
