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
