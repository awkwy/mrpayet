import { describe, expect, it } from 'vitest';
import { affine } from './regression.js';

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
