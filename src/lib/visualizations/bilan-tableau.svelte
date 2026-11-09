<script>
  import { summary, round, nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';
  import { checkNumeric } from '$lib/utils/answer-check.js';

  /* Tableau des indicateurs à deux colonnes qui se corrige tout seul.
   *
   * Chaque case est un champ numérique : dès que la valeur saisie est juste, la
   * case passe en --g avec un « pop » et une coche ; une valeur fausse laisse
   * un liseré neutre et un message (jamais de rouge : l'erreur n'est pas un
   * statut binaire d'état ici, c'est une étape de calcul en cours).
   * Chaque ligne a un indice (« ? ») qui déroule la méthode — rang d'un
   * quartile, fraction de la moyenne — sans donner le résultat.
   * Les séries sont données par `vd.teams` ; les valeurs de référence sont
   * calculées par $lib/utils/stats-mv.js (même convention que les fiches). */

  let { vd } = $props();

  const TEAMS = vd?.teams ?? [
    {
      name: 'Équipe du matin',
      short: 'matin',
      vals: [22, 25, 28, 24, 22, 24, 31, 27, 22, 26, 24, 24, 22, 19, 23, 23, 21, 25, 20, 20, 26, 23, 21, 23]
    },
    {
      name: "Équipe de l'après-midi",
      short: 'après-midi',
      vals: [12, 14, 16, 17, 18, 19, 19, 20, 21, 22, 22, 23, 23, 24, 25, 26, 27, 28, 29, 29, 30, 32, 34, 35]
    }
  ];
  const UNIT = vd?.unit ?? 'min';
  const S = TEAMS.map((t) => summary(t.vals));
  const N = TEAMS[0].vals.length;
  const SUM = TEAMS.map((t) => t.vals.reduce((a, b) => a + b, 0));

  // tol : tolérance sur la saisie ; ref : valeur exacte
  const ROWS = [
    { id: 'mean', lab: 'Moyenne', ref: (s) => s.mean, tol: 0.06, hint: (i) => `On additionne les ${N} durées puis on partage : ${frac(SUM[i], N)} ≈ ${nf(S[i].mean, 1)} ${UNIT}. Ou « Moyenne » à la calculatrice.` },
    { id: 'min', lab: 'Minimum', ref: (s) => s.min, tol: 0, hint: () => `La 1ʳᵉ valeur de la série <b>rangée</b>.` },
    { id: 'max', lab: 'Maximum', ref: (s) => s.max, tol: 0, hint: () => `La ${N}ᵉ (dernière) valeur de la série <b>rangée</b>.` },
    { id: 'range', lab: 'Étendue', ref: (s) => s.range, tol: 0, hint: () => `Maximum − minimum.` },
    { id: 'q1', lab: 'Q₁', ref: (s) => s.q1, tol: 0, hint: () => `Rang : ${N} × 0,25 = ${N * 0.25}${Number.isInteger(N * 0.25) ? ' (entier : on le garde)' : ' (arrondi au rang du dessus)'}. On lit la valeur à ce rang dans la série rangée.` },
    { id: 'med', lab: 'Médiane', ref: (s) => s.med, tol: 0, hint: () => `${N} est pair : milieu de la ${N / 2}ᵉ et de la ${N / 2 + 1}ᵉ valeur, soit ${frac('(' + (N / 2) + 'ᵉ + ' + (N / 2 + 1) + 'ᵉ)', 2)}.` },
    { id: 'q3', lab: 'Q₃', ref: (s) => s.q3, tol: 0, hint: () => `Rang : ${N} × 0,75 = ${N * 0.75}${Number.isInteger(N * 0.75) ? ' (entier : on le garde)' : ' (arrondi au rang du dessus)'}. On lit la valeur à ce rang.` },
    { id: 'iqr', lab: 'Écart interquartile', ref: (s) => s.iqr, tol: 0, hint: () => `Q₃ − Q₁ : la largeur de la boîte.` },
    { id: 'sigma', lab: 'Écart type σ', ref: (s) => s.sigma, tol: 0.06, hint: () => `À la calculatrice : mode statistiques, entre les ${N} valeurs, lis la ligne <b>σ</b> (pas « s »). Arrondi au dixième.` }
  ];

  let vals = $state(ROWS.map(() => TEAMS.map(() => '')));
  let tried = $state(ROWS.map(() => TEAMS.map(() => false)));
  let pop = $state(ROWS.map(() => TEAMS.map(() => false)));
  let open = $state(-1);
  let showSeries = $state(false);

  const ok = (r, t) => checkNumeric(vals[r][t], round(ROWS[r].ref(S[t]), ROWS[r].id === 'mean' || ROWS[r].id === 'sigma' ? 1 : 0), ROWS[r].tol);
  let nOk = $derived(ROWS.reduce((a, _, r) => a + TEAMS.reduce((b, _t, t) => b + (ok(r, t) ? 1 : 0), 0), 0));
  const TOTAL = ROWS.length * TEAMS.length;
  let all = $derived(nOk === TOTAL);

  function onInput(r, t) {
    tried[r][t] = vals[r][t].trim() !== '';
    if (ok(r, t)) {
      pop[r][t] = true;
      setTimeout(() => (pop[r][t] = false), 600);
    }
  }
</script>

<div class="viz bt">
  <div class="head">
    <span class="cnt"><b>{nOk}</b> / {TOTAL} cases justes</span>
    <span class="bar" aria-hidden="true"><i style="width:{(nOk / TOTAL) * 100}%"></i></span>
  </div>

  <div class="tw">
    <table>
      <thead>
        <tr>
          <th scope="col"><span class="sr">Indicateur</span></th>
          {#each TEAMS as t}
            <th scope="col">{t.short ?? t.name}</th>
          {/each}
          <th scope="col"><span class="sr">Indice</span></th>
        </tr>
      </thead>
      <tbody>
        {#each ROWS as row, r}
          <tr>
            <th scope="row">{row.lab} <small>({UNIT})</small></th>
            {#each TEAMS as t, ti}
              <td>
                <span class="cell" class:good={ok(r, ti)} class:pop={pop[r][ti]} class:off={tried[r][ti] && !ok(r, ti)}>
                  <input
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    bind:value={vals[r][ti]}
                    oninput={() => onInput(r, ti)}
                    aria-label="{row.lab}, {t.short ?? t.name}"
                  />
                  <span class="mk" aria-hidden="true">{ok(r, ti) ? '✓' : ''}</span>
                </span>
              </td>
            {/each}
            <td>
              <button type="button" class="q" aria-expanded={open === r} aria-label="Indice pour {row.lab}" onclick={() => (open = open === r ? -1 : r)}>?</button>
            </td>
          </tr>
          {#if open === r}
            <tr class="hintrow">
              <td colspan={TEAMS.length + 2}>
                <div class="hint">
                  {#each TEAMS as t, ti}
                    <p><b>{t.short ?? t.name}</b> : {@html row.hint(ti)}</p>
                  {/each}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

  {#if all}
    <p class="say win" aria-live="polite">
      Tableau complet. Même moyenne et même médiane, mais l'écart interquartile passe de <b>{S[0].iqr}</b> à <b>{S[1].iqr}</b> et σ de <b>{nf(S[0].sigma, 1)}</b> à <b>{nf(S[1].sigma, 1)}</b> : les deux équipes ne travaillent pas pareil.
    </p>
  {:else}
    <p class="say" aria-live="polite">
      Remplis chaque case. Elle devient verte quand elle est juste ; « ? » donne la méthode, pas le résultat. Commence par ranger la série.
    </p>
  {/if}

  <details class="viz-data" bind:open={showSeries}>
    <summary>Voir les séries rangées</summary>
    {#each TEAMS as t}
      <p class="ser"><b>{t.short ?? t.name}</b> : {[...t.vals].sort((a, b) => a - b).join(' · ')}</p>
    {/each}
  </details>
</div>

<style>
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .cnt b {
    color: var(--g);
    font-size: 15px;
  }
  .bar {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    background: var(--surf3);
    overflow: hidden;
  }
  .bar i {
    display: block;
    height: 100%;
    background: var(--g);
    border-radius: 999px;
    transition: width 0.7s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  .tw {
    margin-top: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  thead th {
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--dim2);
    font-weight: 400;
    text-align: center;
    padding: 0 3px 6px;
  }
  thead th:first-child {
    width: 36%;
  }
  thead th:last-child {
    width: 34px;
  }
  tbody th {
    text-align: left;
    font-weight: 400;
    font-size: 13px;
    color: var(--tx);
    padding: 3px 4px 3px 0;
  }
  tbody th small {
    color: var(--dim2);
    font-size: 10.5px;
  }
  td {
    padding: 3px;
  }
  .cell {
    position: relative;
    display: block;
  }
  .cell input {
    width: 100%;
    min-width: 0;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 7px;
    padding: 8px 20px 8px 8px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
    text-align: center;
    transition:
      border-color 0.25s,
      background 0.4s;
  }
  .cell.off input {
    border-color: var(--dim2);
  }
  .cell.good input {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 14%, var(--bg));
    color: var(--g);
  }
  .cell.pop {
    animation: pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pop {
    0% {
      transform: scale(0.92);
    }
    55% {
      transform: scale(1.07);
    }
    100% {
      transform: scale(1);
    }
  }
  .mk {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--g);
    font-size: 12px;
  }
  .q {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--line2);
    background: var(--surf3);
    color: var(--blue);
    font-family: var(--sm);
    font-weight: 700;
    font-size: 13px;
    padding: 0;
  }
  .hintrow td {
    padding: 0 0 6px;
  }
  .hint {
    background: color-mix(in srgb, var(--blue) 9%, transparent);
    border-left: 2.5px solid var(--blue);
    border-radius: 0 7px 7px 0;
    padding: 8px 11px;
    font-size: 13px;
    color: var(--dim);
    animation: slide 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .hint p {
    margin: 2px 0;
  }
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  .say.win {
    border-left-color: var(--g);
  }
  .ser {
    margin: 6px 0 0;
    word-spacing: 1px;
  }
</style>
