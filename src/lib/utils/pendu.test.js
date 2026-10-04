import { describe, it, expect } from 'vitest';
import {
  MAX_ERRORS, MELANGE, normalizeLetter, normalizeWord, wordsForTheme, pickWord,
  newGame, guess, wrongLetters, errors, status, board, letterState
} from './pendu.js';
import { PENDU_THEMES } from '$lib/data/pendu-words.js';

const play = (state, letters) => [...letters].reduce(guess, state);

describe('normalisation', () => {
  it('ramène les lettres accentuées à la lettre de base', () => {
    expect(normalizeLetter('é')).toBe('E');
    expect(normalizeLetter('è')).toBe('E');
    expect(normalizeLetter('ç')).toBe('C');
    expect(normalizeLetter('ô')).toBe('O');
    expect(normalizeLetter('a')).toBe('A');
  });
  it('rejette ce qui n\'est pas une lettre', () => {
    for (const x of ['', '1', ' ', 'Enter', '-', undefined, 12]) expect(normalizeLetter(x)).toBe('');
  });
  it('normalise un mot entier', () => {
    expect(normalizeWord('périmètre')).toBe('PERIMETRE');
  });
});

describe('vocabulaire', () => {
  it('ne contient que des mots simples, sans doublon dans un thème', () => {
    for (const th of PENDU_THEMES) {
      expect(new Set(th.words).size, th.id).toBe(th.words.length);
      for (const w of th.words) {
        expect(w, w).toMatch(/^[a-zàâäçéèêëîïôöùûüÿ]{3,}$/);
        expect(normalizeWord(w)).toHaveLength(w.length);
      }
    }
  });
  it('le mélange réunit tous les thèmes sans doublon', () => {
    const all = wordsForTheme(MELANGE);
    expect(new Set(all).size).toBe(all.length);
    for (const th of PENDU_THEMES) for (const w of th.words) expect(all).toContain(w);
  });
  it('thème inconnu : liste vide', () => {
    expect(wordsForTheme('nope')).toEqual([]);
  });
});

describe('pickWord', () => {
  const words = ['a', 'b', 'c'];
  it('suit le générateur fourni, y compris aux bornes', () => {
    expect(pickWord(words, () => 0)).toBe('a');
    expect(pickWord(words, () => 0.999999)).toBe('c');
    expect(pickWord(words, () => 1)).toBe('c');
  });
  it('évite les mots récents', () => {
    expect(pickWord(words, () => 0, ['a'])).toBe('b');
  });
  it('retombe sur toute la liste si tout est à éviter', () => {
    expect(pickWord(words, () => 0, ['a', 'b', 'c'])).toBe('a');
  });
  it('liste vide : chaîne vide', () => {
    expect(pickWord([])).toBe('');
  });
});

describe('partie', () => {
  it('une lettre accentuée se joue avec sa lettre de base', () => {
    const g = guess(newGame('énergie'), 'e');
    expect(board(g).filter((c) => c.shown).map((c) => c.ch)).toEqual(['É', 'E', 'E']);
    expect(errors(g)).toBe(0);
  });
  it('compte les erreurs sans doublon et ignore les rejeux', () => {
    const g = play(newGame('lampe'), 'zzxz');
    expect(wrongLetters(g)).toEqual(['Z', 'X']);
    expect(errors(g)).toBe(2);
    expect(guess(g, 'z')).toBe(g);
  });
  it('victoire quand toutes les lettres sont trouvées', () => {
    const g = play(newGame('lampe'), 'lamp');
    expect(status(g)).toBe('playing');
    expect(status(guess(g, 'é'))).toBe('won');
  });
  it('défaite après MAX_ERRORS erreurs, mot révélé, partie figée', () => {
    let g = play(newGame('ion'), 'zxwvqkjh');
    expect(MAX_ERRORS).toBe(8);
    expect(status(g)).toBe('lost');
    expect(board(g).every((c) => c.shown && c.missed)).toBe(true);
    expect(guess(g, 'i')).toBe(g);
  });
  it('ne mute pas l\'état précédent', () => {
    const g = newGame('ion');
    guess(g, 'i');
    expect(g.guessed).toEqual([]);
  });
  it('letterState distingue juste / faux / non jouée', () => {
    const g = play(newGame('ion'), 'iz');
    expect(letterState(g, 'i')).toBe('right');
    expect(letterState(g, 'z')).toBe('wrong');
    expect(letterState(g, 'o')).toBeNull();
  });
});
