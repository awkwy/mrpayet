<script>
  import { checkAnswer } from '$lib/utils/answer-check.js';

  let { question, onCorrect } = $props();
  let value = $state('');
  let state = $state(null); // null | 'ok' | 'no'

  function check() {
    if (!value.trim()) {
      state = null;
      return;
    }
    const ok = checkAnswer(value, question);
    const wasOk = state === 'ok';
    state = ok ? 'ok' : 'no';
    if (ok && !wasOk && onCorrect) onCorrect();
  }
</script>

<div class="qr">
  <label class="ql">{question.q}</label>
  <div class="qin">
    <input
      type="text"
      inputmode={question.txt ? 'text' : 'decimal'}
      autocomplete="off"
      bind:value
      oninput={check}
      class={state}
    />
    <span class="mk {state}">{state === 'ok' ? '✓' : state === 'no' ? '✕' : ''}</span>
  </div>
  {#if question.sol}
    <div class="sol" class:visible={state === 'ok'}>{question.sol}</div>
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
</style>
