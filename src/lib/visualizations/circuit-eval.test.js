import { describe, it, expect } from 'vitest';
import { evaluateCircuit } from './circuit-eval.js';

// Boucle correcte : n1 -gen- n2 -fusible- n3 -lampe- n4 -fil- n1
// Le fusible partage n2 avec le générateur : conforme.
const correctLoop = [
  { a: 'n1', b: 'n2', type: 'generateur' },
  { a: 'n2', b: 'n3', type: 'fusible' },
  { a: 'n3', b: 'n4', type: 'lampe' },
  { a: 'n4', b: 'n1', type: 'fil' }
];

describe('evaluateCircuit', () => {
  it('renvoie green pour une boucle fermée avec fusible adjacent au générateur', () => {
    expect(evaluateCircuit(correctLoop)).toEqual({ status: 'green', reason: 'ok' });
  });

  it('renvoie orange quand le fusible est éloigné du générateur (boucle sinon correcte)', () => {
    const displaced = [
      { a: 'n1', b: 'n2', type: 'generateur' },
      { a: 'n2', b: 'n3', type: 'fil' },
      { a: 'n3', b: 'n4', type: 'fusible' },
      { a: 'n4', b: 'n1', type: 'lampe' }
    ];
    expect(evaluateCircuit(displaced)).toEqual({ status: 'orange', reason: 'fuse-not-adjacent' });
  });

  it('renvoie red avec les trois dipôles manquants sur une grille vide', () => {
    expect(evaluateCircuit([])).toEqual({
      status: 'red',
      reason: 'missing',
      missing: ['générateur', 'fusible', 'lampe']
    });
  });

  it('renvoie red en listant fusible et lampe manquants quand seul le générateur est posé', () => {
    const onlyGen = [{ a: 'n1', b: 'n2', type: 'generateur' }];
    expect(evaluateCircuit(onlyGen)).toEqual({
      status: 'red',
      reason: 'missing',
      missing: ['fusible', 'lampe']
    });
  });

  it('renvoie red short-circuit quand un fil relie directement les deux bornes du générateur', () => {
    const bypass = [
      ...correctLoop,
      { a: 'n1', b: 'n2', type: 'fil' } // court-circuite le générateur malgré une boucle par ailleurs complète
    ];
    expect(evaluateCircuit(bypass)).toEqual({ status: 'red', reason: 'short-circuit' });
  });

  it('renvoie red open quand un fil part en l’air (branche en trop, degré 3)', () => {
    const danglingBranch = [...correctLoop, { a: 'n2', b: 'n5', type: 'fil' }];
    expect(evaluateCircuit(danglingBranch)).toEqual({ status: 'red', reason: 'open' });
  });

  it('renvoie red open quand une sous-boucle est déconnectée du générateur', () => {
    const disconnectedSubloop = [
      ...correctLoop,
      { a: 'n5', b: 'n6', type: 'fil' },
      { a: 'n6', b: 'n5', type: 'fil' }
    ];
    expect(evaluateCircuit(disconnectedSubloop)).toEqual({ status: 'red', reason: 'open' });
  });
});
