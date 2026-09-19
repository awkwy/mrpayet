export function fmtNum(n, decimals = 2) {
  const f = 10 ** decimals;
  const rounded = Math.round(n * f) / f;
  return rounded.toString().replace('.', ',');
}
