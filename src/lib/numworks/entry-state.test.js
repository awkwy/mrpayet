import { describe, expect, it } from 'vitest';
import { buildEntryState, entryComplete } from './entry-state.js';

describe('buildEntryState', () => {
  it('marque une case non touchée comme state=null', () => {
    const state = buildEntryState([[1, 15.5]], [['', '']]);
    expect(state).toEqual([[{ state: null, neg: false }, { state: null, neg: false }]]);
  });

  it('marque une valeur correcte comme ok', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '15.5']]);
    expect(state[0][0].state).toBe('ok');
    expect(state[0][1].state).toBe('ok');
  });

  it('accepte la virgule décimale française', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '15,5']]);
    expect(state[0][1].state).toBe('ok');
  });

  it('marque une valeur incorrecte comme no', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '16']]);
    expect(state[0][1].state).toBe('no');
  });

  it('signale neg=true quand la valeur correcte est négative, quelle que soit la saisie', () => {
    const state = buildEntryState([[-2, 3]], [['', '']]);
    expect(state[0][0].neg).toBe(true);
    expect(state[0][1].neg).toBe(false);
  });

  it('gère plusieurs lignes indépendamment', () => {
    const state = buildEntryState(
      [[1, 10], [2, 20]],
      [['1', '10'], ['', '']]
    );
    expect(state[0][0].state).toBe('ok');
    expect(state[0][1].state).toBe('ok');
    expect(state[1][0].state).toBe(null);
    expect(state[1][1].state).toBe(null);
  });
});

describe('entryComplete', () => {
  it("faux tant qu'une case n'est pas ok", () => {
    const state = [[{ state: 'ok', neg: false }, { state: null, neg: false }]];
    expect(entryComplete(state)).toBe(false);
  });

  it("faux tant qu'une case est marquée no", () => {
    const state = [[{ state: 'ok', neg: false }, { state: 'no', neg: false }]];
    expect(entryComplete(state)).toBe(false);
  });

  it('vrai quand toutes les cases sont ok, sur plusieurs lignes', () => {
    const state = [
      [{ state: 'ok', neg: false }, { state: 'ok', neg: false }],
      [{ state: 'ok', neg: false }, { state: 'ok', neg: false }]
    ];
    expect(entryComplete(state)).toBe(true);
  });
});
