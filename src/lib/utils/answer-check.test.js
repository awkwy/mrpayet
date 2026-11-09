import { describe, it, expect } from 'vitest';
import { checkNumeric, checkText, checkAnswer } from './answer-check.js';

describe('checkNumeric', () => {
  it('accepts a correctly typed negative value', () => {
    expect(checkNumeric('-25', -25)).toBe(true);
  });

  it('rejects a negative value outside tolerance', () => {
    expect(checkNumeric('-24', -25, 0)).toBe(false);
  });

  it('accepts a negative value within tolerance', () => {
    expect(checkNumeric('-24.5', -25, 1)).toBe(true);
  });

  it('rejects the unsigned magnitude when the answer is negative', () => {
    expect(checkNumeric('25', -25)).toBe(false);
  });

  it('accepts a comma decimal separator for a negative value', () => {
    expect(checkNumeric('-25,0', -25)).toBe(true);
  });

  it('rejects empty input', () => {
    expect(checkNumeric('', -25)).toBe(false);
  });
});

describe('checkText', () => {
  it('matches case- and accent-insensitively', () => {
    expect(checkText('Fusible', 'fusible')).toBe(true);
  });

  it('accepte la virgule ou le point pour un nombre décimal', () => {
    expect(checkText('0.3', '0,3')).toBe(true);
    expect(checkText('0,3', '0,3')).toBe(true);
  });

  it('ne confond pas 0,3 avec 0,35 ni 40 avec 400', () => {
    expect(checkText('0,35', '0,3')).toBe(false);
    expect(checkText('400', '40')).toBe(false);
    expect(checkText('4', '40')).toBe(false);
  });

  it('accepte encore un nombre suivi d\'une unité', () => {
    expect(checkText('120 €', '120')).toBe(true);
    expect(checkText('x = 4', '4')).toBe(true);
  });

  it('matches any answer in an array of accepted answers', () => {
    expect(checkText('lampe', ['ampoule', 'lampe'])).toBe(true);
  });
});

describe('checkAnswer', () => {
  it('routes negative numeric questions to checkNumeric', () => {
    expect(checkAnswer('-25', { a: -25, tol: 0 })).toBe(true);
  });

  it('routes text questions (question.a as array) to checkText', () => {
    expect(checkAnswer('lampe', { txt: true, a: ['lampe', 'ampoule'] })).toBe(true);
  });
});
