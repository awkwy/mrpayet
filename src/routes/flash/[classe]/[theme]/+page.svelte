<script>
  import { base } from '$app/paths';
  import { checkText } from '$lib/utils/answer-check.js';

  let { data } = $props();

  let pool = $state([]);
  let idx = $state(0);
  let value = $state('');
  let results = $state([]);
  let timeLeft = $state(300);
  let finished = $state(false);
  let restartKey = $state(0);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  $effect(() => {
    void data.slug;
    void data.theme;
    void restartKey;
    pool = shuffle(data.items).slice(0, 8);
    idx = 0;
    value = '';
    results = [];
    timeLeft = 300;
    finished = false;
    const id = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(id);
        finished = true;
      }
    }, 1000);
    return () => clearInterval(id);
  });

  function submit(skip) {
    if (finished || !pool.length) return;
    const [q, a] = pool[idx];
    const ok = !skip && checkText(value, a);
    results = [...results, { q, a, given: skip ? '' : value, ok, skipped: skip }];
    value = '';
    if (idx + 1 >= pool.length) {
      finished = true;
    } else {
      idx += 1;
    }
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  let score = $derived(results.filter((r) => r.ok).length);
</script>

<svelte:head>
  <title>{data.title} — {data.classe} — Flash — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/flash/{data.slug}">{data.classe}</a> / {data.title}
  </p>

  {#if !finished && pool.length}
    <div class="bar">
      <span class="prog">Question {idx + 1}/{pool.length}</span>
      <span class="time" class:low={timeLeft <= 30}>{fmtTime(timeLeft)}</span>
    </div>

    <div class="qcard">
      <div class="qt">{pool[idx][0]}</div>
      <div class="qin">
        <input
          type="text"
          autocomplete="off"
          bind:value
          onkeydown={(e) => e.key === 'Enter' && submit(false)}
        />
        <button type="button" class="btn ok" onclick={() => submit(false)}>Valider</button>
        <button type="button" class="btn skip" onclick={() => submit(true)}>Passer</button>
      </div>
    </div>
  {:else}
    <div class="results">
      <h1>Score : {score}/{results.length}</h1>
      <div class="rows">
        {#each results as r}
          <div class="rrow" class:ok={r.ok} class:skip={r.skipped}>
            <span class="rq">{r.q}</span>
            <span class="ra">
              {#if r.skipped}
                passé — réponse : {r.a}
              {:else if r.ok}
                {r.given} ✓
              {:else}
                {r.given} — attendu : {r.a}
              {/if}
            </span>
          </div>
        {/each}
      </div>
      <div class="actions">
        <button type="button" class="btn ok" onclick={() => (restartKey += 1)}>Recommencer</button>
        <a class="btn skip" href="{base}/flash/{data.slug}">Changer de thème</a>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  .crumb {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
  }
  .crumb a {
    color: var(--dim);
  }
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 20px;
    font-family: var(--sm);
  }
  .prog {
    color: var(--dim);
    font-size: 13px;
  }
  .time {
    font-size: 18px;
    color: var(--g);
  }
  .time.low {
    color: var(--red);
  }
  .qcard {
    margin-top: 20px;
    padding: 24px 20px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .qt {
    font-size: 20px;
    color: var(--tx);
  }
  .qin {
    display: flex;
    gap: 8px;
    margin-top: 18px;
    flex-wrap: wrap;
  }
  input {
    flex: 1;
    min-width: 140px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 9px 12px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 15px;
  }
  input:focus-visible {
    border-color: var(--g);
  }
  .btn {
    border-radius: 6px;
    padding: 9px 14px;
    font-family: var(--sm);
    font-size: 13px;
    border: 1px solid var(--line2);
    background: none;
    color: var(--dim);
  }
  .btn.ok {
    border-color: var(--g3);
    color: var(--g);
  }
  .btn.skip {
    color: var(--dim);
  }
  .results h1 {
    font-size: 22px;
  }
  .rows {
    display: grid;
    gap: 8px;
    margin-top: 18px;
  }
  .rrow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surf);
    font-size: 14px;
  }
  .rrow.ok {
    border-color: var(--g3);
  }
  .rrow.skip {
    opacity: 0.7;
  }
  .rq {
    color: var(--tx);
  }
  .ra {
    color: var(--dim);
    white-space: nowrap;
    font-family: var(--sm);
    font-size: 12px;
  }
  .rrow.ok .ra {
    color: var(--g);
  }
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }
</style>
