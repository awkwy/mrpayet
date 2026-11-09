<script>
  import { checkAnswer, checkNumeric, checkText } from '$lib/utils/answer-check.js';

  let { question, onCorrect } = $props();
  let value = $state('');
  let state = $state(null); // null | 'ok' | 'no'
  let hintVisible = $state(false);
  let hintTimer;

  // Retour sur une mauvaise réponse (question ouverte avec feedback) :
  //   question.hints = [{ v: valeur_fausse_courante, tol?, say }]  — erreur typique reconnue ;
  //   question.hint  = consigne générale si aucune erreur typique ne correspond.
  // Affiché après une courte pause de frappe, pour ne pas clignoter à chaque touche.
  let hintText = $derived.by(() => {
    if (state !== 'no' || !hintVisible) return '';
    for (const h of question.hints || []) {
      const hit = question.txt ? checkText(value, h.v) : checkNumeric(value, h.v, h.tol || 0);
      if (hit) return h.say;
    }
    return question.hint || '';
  });

  function check() {
    clearTimeout(hintTimer);
    hintVisible = false;
    if (!value.trim()) {
      state = null;
      return;
    }
    const ok = checkAnswer(value, question);
    const wasOk = state === 'ok';
    state = ok ? 'ok' : 'no';
    if (ok && !wasOk && onCorrect) onCorrect();
    if (!ok && (question.hint || question.hints)) hintTimer = setTimeout(() => (hintVisible = true), 900);
  }

  function toggleSign() {
    value = value.startsWith('-') ? value.slice(1) : '-' + value;
    check();
  }
</script>

<div class="qr">
  <!-- `qh` / `solh` : variantes HTML (fractions, voir $lib/utils/fr.js) du texte
       brut `q` / `sol` ; absentes dans les anciens exercices. -->
  <label class="ql">{#if question.qh}{@html question.qh}{:else}{question.q}{/if}</label>
  <div class="qin">
    <input
      type="text"
      inputmode={question.txt ? 'text' : 'decimal'}
      autocomplete="off"
      bind:value
      oninput={check}
      class={state}
    />
    {#if !question.txt && question.a < 0}
      <button type="button" class="sign" onclick={toggleSign} aria-label="Insérer ou retirer le signe moins">−</button>
    {/if}
    <span class="mk {state}">{state === 'ok' ? '✓' : state === 'no' ? '✕' : ''}</span>
  </div>
  {#if question.sol || question.solh}
    <div class="sol" class:visible={state === 'ok'}>{#if question.solh}{@html question.solh}{:else}{question.sol}{/if}</div>
  {/if}
  {#if hintText}
    <div class="hint" role="status">{hintText}</div>
  {/if}
</div>

<style>
  .qr {
    margin: 10px 0;
  }
  .ql {
    display: block;
    color: var(--tx);
    margin-bottom: 6px;
  }
  .qin {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  input {
    flex: 1;
    max-width: 220px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 8px 10px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
  }
  input:focus-visible {
    border-color: var(--g);
  }
  input.ok {
    border-color: var(--g3);
  }
  input.no {
    border-color: var(--red);
  }
  .sign {
    flex-shrink: 0;
    width: 32px;
    height: 34px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
  }
  .sign:hover,
  .sign:focus-visible {
    border-color: var(--g);
  }
  .mk {
    font-family: var(--sm);
    width: 16px;
  }
  .mk.ok {
    color: var(--g);
  }
  .mk.no {
    color: var(--red);
  }
  .sol {
    margin-top: 6px;
    font-size: 13px;
    color: var(--dim);
    visibility: hidden;
  }
  .sol.visible {
    visibility: visible;
  }
  .hint {
    margin-top: 6px;
    padding: 6px 10px;
    border-left: 2px solid var(--red);
    font-size: 13px;
    color: var(--dim);
  }
</style>
