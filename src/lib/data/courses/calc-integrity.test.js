import { describe, expect, it } from 'vitest';
import { findBadCalcRefs } from './calc-integrity.js';
import { COURSES } from './index.js';

describe('findBadCalcRefs', () => {
  it('ne signale rien quand toutes les références sont valides', () => {
    const course = {
      id: 'test-good',
      seances: [{ datasets: { d1: [[1, 2]] }, steps: [{ t: 'x', calc: { screen: 'data', dataset: 'd1' } }] }]
    };
    expect(findBadCalcRefs([course])).toEqual([]);
  });

  it('signale une référence vers un dataset inexistant', () => {
    const course = {
      id: 'test-bad',
      seances: [{ datasets: { d1: [[1, 2]] }, steps: [{ t: 'x', calc: { screen: 'data', dataset: 'd2' } }] }]
    };
    expect(findBadCalcRefs([course])).toEqual([
      { courseId: 'test-bad', seanceIndex: 0, stepIndex: 0, dataset: 'd2' }
    ]);
  });

  it('ignore les étapes sans champ calc', () => {
    const course = { id: 'test-none', seances: [{ steps: [{ t: 'x' }] }] };
    expect(findBadCalcRefs([course])).toEqual([]);
  });

  it('aucune référence cassée dans les cours réels du site', () => {
    expect(findBadCalcRefs(COURSES)).toEqual([]);
  });
});
