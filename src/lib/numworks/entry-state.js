import { checkNumeric } from '../utils/answer-check.js';

/**
 * Compares what the student has typed so far against the exercise's real
 * dataset, cell by cell. Never returns the correct values themselves —
 * only whether each typed cell is right, wrong, or still untouched, plus
 * whether that cell's correct value is negative (so the caller can show a
 * ± button without learning the actual value).
 *
 * @param {Array<[number, number]>} points - the correct dataset
 * @param {Array<[string, string]>} typed - parallel array of what's typed
 * @returns {Array<Array<{state: 'ok'|'no'|null, neg: boolean}>>}
 */
export function buildEntryState(points, typed) {
  return points.map((correctRow, i) => {
    const typedRow = typed[i] || ['', ''];
    return correctRow.map((correct, j) => {
      const v = (typedRow[j] ?? '').trim();
      const state = v === '' ? null : checkNumeric(v, correct) ? 'ok' : 'no';
      return { state, neg: correct < 0 };
    });
  });
}

/** True only once every cell in entryState is confirmed correct. */
export function entryComplete(entryState) {
  return entryState.every((row) => row.every((cell) => cell.state === 'ok'));
}
