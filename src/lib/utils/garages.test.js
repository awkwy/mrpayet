import { describe, it, expect } from 'vitest';
import {
  KAHANI,
  GARAGE_B,
  GARAGE_C,
  GARAGE_C_BONUS,
  price,
  table,
  lineFrom,
  hoursFor,
  crossing,
  cheaper,
  hm,
  fr,
  verdict
} from './garages.js';

describe('devis du garage de Kahani : 15 € + 30 € par heure', () => {
  it('tableau de valeurs de 0 h à 5 h', () => {
    expect(table(KAHANI, [0, 1, 2, 3, 4, 5]).map(([, p]) => p)).toEqual([15, 45, 75, 105, 135, 165]);
  });
  it('0 h ne coûte pas 0 € : il reste le diagnostic', () => {
    expect(price(KAHANI, 0)).toBe(15);
  });
  it('chaque heure en plus ajoute 30 €', () => {
    for (let h = 0; h < 8; h++) expect(price(KAHANI, h + 1) - price(KAHANI, h)).toBe(30);
  });
  it('lectures de la séance 1 : 2 h 30 → 90 €, 3 h 30 → 120 €, 4 h 30 → 150 €', () => {
    expect(price(KAHANI, 2.5)).toBe(90);
    expect(price(KAHANI, 3.5)).toBe(120);
    expect(price(KAHANI, 4.5)).toBe(150);
  });
  it('formule de la séance 2 : P(6) = 195, P(8) = 255, P(10) = 315', () => {
    expect([6, 8, 10].map((h) => price(KAHANI, h))).toEqual([195, 255, 315]);
  });
});

describe('antécédent (nombre d’heures pour un budget)', () => {
  it('105 € → 3 h ; 75 € → 2 h ; 150 € → 4 h 30 ; 195 € → 6 h', () => {
    expect(hoursFor(KAHANI, 105)).toBe(3);
    expect(hoursFor(KAHANI, 75)).toBe(2);
    expect(hoursFor(KAHANI, 150)).toBe(4.5);
    expect(hoursFor(KAHANI, 195)).toBe(6);
  });
  it('10 € n’a pas d’antécédent : moins que le diagnostic', () => {
    expect(hoursFor(KAHANI, 10)).toBeNull();
  });
  it('exactement 15 € → 0 h', () => {
    expect(hoursFor(KAHANI, 15)).toBe(0);
  });
});

describe('garage B : 40 € par heure, sans diagnostic', () => {
  it('tableau de valeurs', () => {
    expect(table(GARAGE_B, [0, 1, 2, 3, 4, 5]).map(([, p]) => p)).toEqual([0, 40, 80, 120, 160, 200]);
  });
  it('coefficient directeur et ordonnée à l’origine, lus sur deux points', () => {
    expect(lineFrom([0, 0], [1, 40])).toEqual({ a: 40, b: 0 });
    expect(lineFrom([0, 15], [1, 45])).toEqual({ a: 30, b: 15 });
  });
});

describe('croisement et choix du garage', () => {
  it('les deux prix sont égaux à 1 h 30 : 60 € chacun', () => {
    const x = crossing(KAHANI, GARAGE_B);
    expect(x).toEqual({ h: 1.5, prix: 60 });
    expect(price(GARAGE_B, 1.5)).toBe(60);
  });
  it('avant 1 h 30 B est moins cher, après c’est Kahani', () => {
    expect(cheaper(KAHANI, GARAGE_B, 1)).toBe('b');
    expect(cheaper(KAHANI, GARAGE_B, 1.5)).toBe('egal');
    expect(cheaper(KAHANI, GARAGE_B, 3)).toBe('a');
    expect(price(GARAGE_B, 3) - price(KAHANI, 3)).toBe(15);
  });
  it('trois clients : 1 h → B, 1 h 30 → égal, 3 h → Kahani', () => {
    expect([1, 1.5, 3].map((h) => cheaper(KAHANI, GARAGE_B, h))).toEqual(['b', 'egal', 'a']);
  });
  it('droites parallèles : pas de croisement', () => {
    expect(crossing(KAHANI, { fixe: 40, heure: 30 })).toBeNull();
  });
  it('équation 15 + 30 h = 40 h : 15 = 10 h donc h = 15 sur 10', () => {
    expect(15 / (40 - 30)).toBe(1.5);
  });
});

describe('garages C des questions bilan et bonus', () => {
  it('bilan : C passe par (0 ; 30) et (1 ; 50) → a = 20, b = 30, R(4) = 110, 130 € → 5 h', () => {
    expect(lineFrom([0, 30], [1, 50])).toEqual({ a: 20, b: 30 });
    expect(GARAGE_C).toMatchObject({ fixe: 30, heure: 20 });
    expect(price(GARAGE_C, 4)).toBe(110);
    expect(hoursFor(GARAGE_C, 130)).toBe(5);
  });
  it('bonus séance 3 : (0 ; 20) et (1 ; 45) → coefficient directeur 25', () => {
    expect(lineFrom([0, 20], [1, 45])).toEqual({ a: 25, b: 20 });
    expect(GARAGE_C_BONUS).toMatchObject({ fixe: 20, heure: 25 });
  });
});

describe('écritures', () => {
  it('hm : 1,5 → 1 h 30 ; 3 → 3 h ; 2,25 → 2 h 15', () => {
    expect(hm(1.5)).toBe('1 h 30');
    expect(hm(3)).toBe('3 h');
    expect(hm(2.25)).toBe('2 h 15');
  });
  it('fr : virgule décimale', () => {
    expect(fr(1.5)).toBe('1,5');
    expect(fr(60)).toBe('60');
  });
  it('verdict : jamais le signe ÷ et toujours une phrase complète', () => {
    for (const h of [0, 0.5, 1, 1.5, 2, 3, 5]) {
      const v = verdict(KAHANI, GARAGE_B, h);
      expect(v).not.toMatch(/÷/);
      expect(v.endsWith('.')).toBe(true);
    }
    expect(verdict(KAHANI, GARAGE_B, 1)).toContain('B est moins cher');
    expect(verdict(KAHANI, GARAGE_B, 3)).toContain('Kahani est moins cher');
  });
});
