import { describe, expect, it } from 'vitest';
import { affine, exponential, logarithmic, pearsonStats } from './regression.js';

describe('affine', () => {
  it('retrouve exactement une droite sans bruit', () => {
    const fit = affine([[0, 1], [1, 3], [2, 5]]); // y = 2x + 1
    expect(fit.a).toBeCloseTo(2, 6);
    expect(fit.b).toBeCloseTo(1, 6);
  });

  it('retrouve la droite du cours stat2var-ms séance 1', () => {
    const fit = affine([[1, 15.5], [3, 22.5], [6, 33], [9, 43.5], [12, 54]]);
    expect(fit.a).toBeCloseTo(3.5, 6);
    expect(fit.b).toBeCloseTo(12, 6);
  });

  it('renvoie null avec moins de 2 points', () => {
    expect(affine([])).toBeNull();
    expect(affine([[1, 2]])).toBeNull();
  });

  it('renvoie null si tous les points ont le même x (pente indéfinie)', () => {
    expect(affine([[2, 3], [2, 7]])).toBeNull();
  });
});

describe('exponential', () => {
  it('retrouve exactement une courbe y = a·e^(bx) sans bruit', () => {
    // y = 10 * e^(0.1151292546497022 x) — le modèle de stat2var-ms séance 2
    // (alarmes connectées), écrit sous forme e plutôt que 10^(0,05x+1).
    const b = Math.log(10 ** 0.05);
    const pts = [0, 5, 10, 15, 20, 25].map((x) => [x, 10 * Math.exp(b * x)]);
    const fit = exponential(pts);
    expect(fit.a).toBeCloseTo(10, 6);
    expect(fit.b).toBeCloseTo(b, 6);
  });

  it('renvoie null si une valeur y est négative ou nulle (ln indéfini)', () => {
    expect(exponential([[0, 1], [1, 0], [2, 5]])).toBeNull();
    expect(exponential([[0, 1], [1, -2], [2, 5]])).toBeNull();
  });

  it('renvoie null avec moins de 2 points', () => {
    expect(exponential([[1, 2]])).toBeNull();
  });
});

describe('logarithmic', () => {
  it('retrouve exactement une courbe y = a·ln(x) + b sans bruit', () => {
    const pts = [1, 2, 5, 10].map((x) => [x, 5 * Math.log(x) + 2]);
    const fit = logarithmic(pts);
    expect(fit.a).toBeCloseTo(5, 6);
    expect(fit.b).toBeCloseTo(2, 6);
  });

  it('renvoie null si une valeur x est négative ou nulle (ln indéfini)', () => {
    expect(logarithmic([[0, 1], [1, 2], [2, 5]])).toBeNull();
    expect(logarithmic([[-1, 1], [1, 2], [2, 5]])).toBeNull();
  });

  it('renvoie null avec moins de 2 points', () => {
    expect(logarithmic([[1, 2]])).toBeNull();
  });
});

describe('pearsonStats', () => {
  it('retrouve les valeurs du tutoriel BP MCV (le pari d’Aïcha)', () => {
    const pts = [[1, 0], [2, 3], [3, 4], [4, 7], [6, 8], [7, 9]];
    const s = pearsonStats(pts);
    expect(s.n).toBe(6);
    expect(s.sx).toBeCloseTo(23, 6);
    expect(s.sxy).toBeCloseTo(157, 6);
    expect(s.xbar).toBeCloseTo(3.8333, 3);
    expect(s.ybar).toBeCloseTo(5.1667, 3);
    expect(s.r).toBeCloseTo(0.9606, 3);
    expect(s.r2).toBeCloseTo(0.9227, 3);
  });

  it('renvoie r = 1 pour une droite exacte', () => {
    const s = pearsonStats([[0, 1], [1, 3], [2, 5]]);
    expect(s.r).toBeCloseTo(1, 6);
    expect(s.r2).toBeCloseTo(1, 6);
  });

  it('renvoie null avec moins de 2 points', () => {
    expect(pearsonStats([[1, 2]])).toBeNull();
  });

  it('renvoie r = null si une des deux séries est constante (corrélation indéfinie)', () => {
    const s = pearsonStats([[1, 5], [2, 5], [3, 5]]);
    expect(s.r).toBeNull();
  });
});
