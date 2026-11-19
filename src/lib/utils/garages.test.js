import { KAHANI, price, table } from './garages.js';

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
