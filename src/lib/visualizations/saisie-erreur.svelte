<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { statsOf, diagnose } from '$lib/numworks/stat1.js';
  import { shuffled } from '$lib/utils/freq.js';
  import '$lib/styles/stat-viz.css';

  /* « Trois élèves ont une erreur » — lire un écran de NumWorks et trouver la cause.
   *
   * Chaque carte montre ce qu'un élève a RÉELLEMENT tapé (V1 / N1) et ce que
   * sa calculatrice affiche (effectif total, moyenne). L'élève choisit la
   * cause parmi quatre ; la bonne réponse est calculée par `diagnose`
   * (logique pure, testée), pas écrite à la main. Une mauvaise cause explique
   * pourquoi ce n'est pas elle. Une bonne cause lance la correction : le
   * tableau se refait ligne par ligne et l'effectif total redescend au ressort
   * jusqu'à la valeur attendue (celle du tableau de la fiche).
   *
   * vd = { expected:[[valeur, effectif],…], cases:[{ who, rows:[[v,n],…] }] } */

  let { vd } = $props();
  const EXPECTED = vd?.expected || [[10, 2], [12, 4], [14, 2], [16, 1], [18, 1]];
  const CASES = vd?.cases || [
    { who: 'A', rows: [[10, 1], [12, 1], [14, 1], [16, 1], [18, 1]] },
    { who: 'B', rows: [[2, 10], [4, 12], [2, 14], [1, 16], [1, 18]] },
    { who: 'C', rows: [[10, 2], [12, 4], [14, 1], [16, 1], [18, 1]] },
    { who: 'D', rows: [[3, 1], [7, 1], [9, 2], [10, 2], [12, 4], [14, 2], [16, 1], [18, 1]] }
  ];

  const CAUSES = {
    'n1-untouched': {
      t: 'Il n’a pas changé les effectifs N1 : ils sont restés à 1.',
      why: 'Tous les effectifs valent 1, donc l’effectif total est le nombre de lignes. À corriger : retourner dans N1 et taper les effectifs du tableau.'
    },
    swapped: {
      t: 'Il a mis les nombres dans N1 et les effectifs dans V1.',
      why: 'L’effectif total est la somme de la colonne N1 : ici elle contient 10 + 12 + 14 + 16 + 18. Les nombres vont en V1, les effectifs en N1.'
    },
    missing: {
      t: 'Il manque un nombre : un jour n’a pas été compté.',
      why: 'Un des effectifs est trop petit. On le voit en comparant l’effectif total de l’écran à celui du tableau.'
    },
    stale: {
      t: 'Un ancien tableau n’a pas été effacé avant de taper.',
      why: 'Des nombres d’avant (3, 7, 9) sont restés en haut. À faire avant de taper : « Effacer le tableau V1/N1 ».'
    }
  };
  // ordre des causes mélangé de façon stable, différent d'une carte à l'autre :
  // la bonne réponse ne tombe jamais toujours au même rang.
  const BASE = ['n1-untouched', 'swapped', 'missing', 'stale'];
  const rowsOf = (pairs) => pairs.map(([v, n]) => ({ v: String(v), n: String(n) }));

  const cases = CASES.map((c, idx) => {
    const typed = rowsOf(c.rows);
    return { ...c, typed, got: statsOf(typed), cause: diagnose(typed, EXPECTED), order: shuffled(BASE, idx + 11) };
  });
  const want = statsOf(rowsOf(EXPECTED));

  let picks = $state(cases.map(() => null));
  let fixed = $state(cases.map(() => false));
  let reduced = false;
  const tN = cases.map((c) => new Tween(c.got?.N ?? 0, { duration: 700, easing: cubicOut }));
  const tM = cases.map((c) => new Tween(c.got?.mean ?? 0, { duration: 700, easing: cubicOut }));

  let solved = $derived(fixed.filter(Boolean).length);

  function pick(i, id) {
    if (fixed[i]) return;
    picks[i] = id;
    if (id === cases[i].cause) {
      setTimeout(() => {
        fixed[i] = true;
        tN[i].set(want.N, { duration: reduced ? 0 : 800 });
        tM[i].set(want.mean, { duration: reduced ? 0 : 800 });
      }, reduced ? 0 : 600);
    }
  }
  const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));
</script>

<div class="viz sv">
  <p class="sv-h">Série du cours : effectif total attendu <b>{want.N}</b>, moyenne attendue <b>{fmt(want.mean)}</b></p>

  {#each cases as c, i}
    <section class="card" class:solved={fixed[i]}>
      <h3>Élève {c.who}</h3>
      <div class="scr">
        <table aria-label={`Tableau tapé par l’élève ${c.who}`}>
          <thead><tr><th>V1</th><th>N1</th></tr></thead>
          <tbody>
            {#each fixed[i] ? EXPECTED : c.rows as [v, n], k (fixed[i] + '-' + k)}
              <tr class:sv-pop={fixed[i]}><td>{v}</td><td>{n}</td></tr>
            {/each}
          </tbody>
        </table>
        <dl class="res">
          <div><dt>Effectif total</dt><dd class:bad={!fixed[i]} class:good={fixed[i]}>{fmt(tN[i].current)}</dd></div>
          <div><dt>Moyenne</dt><dd class:bad={!fixed[i]} class:good={fixed[i]}>{fmt(tM[i].current)}</dd></div>
        </dl>
      </div>

      <p class="sv-h">Quelle est la cause ?</p>
      <div class="opts">
        {#each c.order as id}
          <button
            type="button"
            class="opt"
            class:no={picks[i] === id && id !== c.cause}
            class:ok={picks[i] === id && id === c.cause}
            disabled={fixed[i]}
            onclick={() => pick(i, id)}
          >
            {CAUSES[id].t}
          </button>
        {/each}
      </div>
      {#if picks[i] && picks[i] !== c.cause}
        <p class="sv-fb no sv-pop"><span class="ic">✕</span> Pas celle-là. Compare l’effectif total de l’écran ({fmt(c.got.N)}) à celui du tableau ({want.N}), puis regarde les colonnes.</p>
      {:else if picks[i] === c.cause}
        <p class="sv-fb ok sv-pop"><span class="ic">✓</span> <b>{CAUSES[c.cause].t}</b> {CAUSES[c.cause].why}</p>
      {/if}
    </section>
  {/each}

  {#if solved === cases.length}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Les quatre erreurs sont trouvées. Le réflexe : <b>toujours comparer l’effectif total de l’écran à celui de mon tableau</b>.</p>
  {/if}
</div>

<style>
  .sv-h b {
    color: var(--g);
  }
  .card {
    margin-top: 14px;
    padding: 12px 13px;
    background: var(--surf);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    transition: border-color 0.3s;
  }
  .card.solved {
    border-color: var(--g3);
  }
  .scr + :global(.sv-h) {
    margin-top: 14px;
  }
  h3 {
    margin: 0 0 8px;
    font-family: var(--sm);
    font-size: 13px;
    color: var(--tx);
  }
  .scr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    align-items: start;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--sm);
    font-size: 12.5px;
  }
  th {
    font-weight: 400;
    font-size: 10px;
    color: var(--dim2);
    text-align: right;
  }
  td {
    text-align: right;
    padding: 2px 6px;
    color: var(--tx);
    border-bottom: 1px solid var(--line);
  }
  .res {
    margin: 0;
    display: grid;
    gap: 8px;
    font-family: var(--sm);
  }
  .res dt {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim2);
  }
  .res dd {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: color 0.3s;
  }
  .res dd.bad {
    color: var(--warn);
  }
  .res dd.good {
    color: var(--g);
  }
  .opts {
    display: grid;
    gap: 6px;
  }
  .opt {
    text-align: left;
    padding: 9px 12px;
    min-height: 44px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    background: var(--surf3);
    color: var(--tx);
    font-size: 13.5px;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, background 0.2s;
  }
  .opt:active {
    transform: scale(0.98);
  }
  .opt.no {
    border-color: var(--red);
  }
  .opt.ok {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 10%, var(--surf3));
  }
  .opt[disabled] {
    opacity: 0.75;
  }
</style>
