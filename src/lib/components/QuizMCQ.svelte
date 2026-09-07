<script>
  let { quiz, onScored } = $props();
  let picks = $state(quiz.map(() => null));
  let answered = $derived(picks.every((p) => p !== null));
  let score = $derived(picks.filter((p, i) => p === quiz[i].c).length);

  function pick(qi, oi) {
    if (picks[qi] !== null) return;
    picks[qi] = oi;
    if (picks.every((p) => p !== null) && onScored) onScored(score);
  }
</script>

<div class="quiz">
  {#each quiz as item, qi}
    <div class="q">
      <div class="qt">{item.q}</div>
      <div class="opts">
        {#each item.o as opt, oi}
          <button
            type="button"
            class="opt"
            class:picked={picks[qi] === oi}
            class:correct={picks[qi] !== null && oi === item.c}
            class:wrong={picks[qi] === oi && oi !== item.c}
            disabled={picks[qi] !== null}
            onclick={() => pick(qi, oi)}
          >
            {opt}
          </button>
        {/each}
      </div>
      {#if picks[qi] !== null}
        <div class="expl">{item.e}</div>
      {/if}
    </div>
  {/each}
  {#if answered}
    <div class="score">Score : {score}/{quiz.length}</div>
  {/if}
</div>

<style>
  .quiz {
    display: grid;
    gap: 20px;
  }
  .qt {
    color: var(--tx);
    margin-bottom: 8px;
  }
  .opts {
    display: grid;
    gap: 6px;
  }
  .opt {
    text-align: left;
    padding: 9px 12px;
    border: 1px solid var(--line2);
    border-radius: 6px;
    background: var(--surf);
    color: var(--tx);
    font-family: var(--sa, inherit);
    font-size: 14px;
  }
  .opt:hover:not(:disabled) {
    border-color: var(--g3);
  }
  .opt.correct {
    border-color: var(--g3);
    color: var(--g);
  }
  .opt.wrong {
    border-color: var(--red);
    color: var(--red);
  }
  .expl {
    margin-top: 6px;
    font-size: 13px;
    color: var(--dim);
  }
  .score {
    font-family: var(--sm);
    color: var(--g);
    margin-top: 4px;
  }
</style>
