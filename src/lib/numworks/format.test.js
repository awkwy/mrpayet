import { describe, expect, it } from 'vitest';
import { fmtNum } from './format.js';

describe('fmtNum', () => {
  it('utilise la virgule décimale', () => {
    expect(fmtNum(3.5)).toBe('3,5');
  });
  it('ne laisse pas de zéro inutile', () => {
    expect(fmtNum(12)).toBe('12');
  });
  it('arrondit au nombre de décimales demandé', () => {
    expect(fmtNum(3.14159, 2)).toBe('3,14');
  });
  it('gère les valeurs négatives', () => {
    expect(fmtNum(-2.5)).toBe('-2,5');
  });
});
