<script>
  import { pair, tally, freq, THEORIE } from '$lib/utils/deux-lancers.js';
  import { frNum } from '$lib/utils/freq.js';
  import '$lib/styles/stat-viz.css';

  /* « Le jeton soleil-lune lancé deux fois » — simulation.
   *
   * Remplace la calculatrice pour qui n'en a pas : chaque paire = deux
   * randint(1,2) (1 = soleil, 2 = lune). On ajoute 1, 20 ou 100 paires ; les
   * trois fréquences (deux soleils, un de chaque, deux lunes) bougent beaucoup
   * au début, puis se calment près de 1 sur 4, 2 sur 4, 1 sur 4 (traits
   * pointillés = repère théorique, accent --blue ; série de données = --g).
   * Accessibilité : résumé annoncé (aria-live), tableau des effectifs
   * repliable, pas d'animation sous prefers-reduced-motion.
   * vd.show (booléen) : montre les repères théoriques d'emblée. */

  let { vd } = $props();
  let pairs = $state([]);
  let showTheory = $state(!!vd?.show);
  let t = $derived(tally(pairs));
  const ICON = { S: '☀', L: '☾' };
  const SORTES = [
    { k: 'ss', label: 'Deux soleils', code: '☀☀' },
    { k: 'mix', label: 'Un de chaque', code: '☀☾' },
    { k: 'll', label: 'Deux lunes', code: '☾☾' }
  ];
  let last = $derived(pairs.slice(-5).reverse());
  let summary = $derived(
    t.total
      ? `${t.total} paires : deux soleils ${t.ss}, un de chaque ${t.mix}, deux lunes ${t.ll}.`
      : 'Aucune paire lancée pour le moment.'
  );

  function add(n) {
    const next = pairs.slice();
    for (let i = 0; i < n; i++) next.push(pair());
    pairs = next;
  }
</script>

<div class="viz sv dl">
  <p class="sv-h">Jeton soleil ☀ · lune ☾ — deux lancers de suite</p>
  <p class="how">Chaque paire = deux <b>randint(1,2)</b> : 1 = soleil, 2 = lune. Ajoute des paires et regarde les fréquences.</p>

  <div class="ctl" role="group" aria-label="Lancer des paires">
    <button type="button" class="sv-btn p" onclick={() => add(1)}>+1 paire</button>
    <button type="button" class="sv-btn" onclick={() => add(20)}>+20</button>
    <button type="button" class="sv-btn" onclick={() => add(100)}>+100</button>
    <button type="button" class="sv-btn gh" onclick={() => (pairs = [])} disabled={!pairs.length}>Recommencer</button>
  </div>

  <p class="last" aria-hidden="true">
    {#if last.length}
      Dernières paires :
      {#each last as p}<span class="pr">{ICON[p[0]]}{ICON[p[1]]}</span>{/each}
    {:else}
      Appuie sur « +1 paire ».
    {/if}
  </p>

  <div class="bars">
    {#each SORTES as s}
      {@const f = freq(t[s.k], t.total)}
      <div class="b">
        <div class="lab"><span class="code" aria-hidden="true">{s.code}</span> {s.label}</div>
        <div class="track" aria-hidden="true">
          <span class="fill" style:width={`${f * 100}%`}></span>
          {#if showTheory}<span class="theo" style:left={`${THEORIE[s.k] * 100}%`}></span>{/if}
        </div>
        <div class="num"><b>{t[s.k]}</b> sur {t.total} = <b>{t.total ? frNum(f, 3) : '—'}</b></div>
      </div>
    {/each}
  </div>

  <label class="chk"><input type="checkbox" bind:checked={showTheory} /> Montrer 1 sur 4 · 2 sur 4 · 1 sur 4 (traits bleus)</label>

  <p class="sv-fb" aria-live="polite" role="status">{summary}</p>

  <details class="data">
    <summary>Voir sous forme de tableau</summary>
    <table>
      <thead><tr><th scope="col">Résultat</th><th scope="col">Nombre de paires</th><th scope="col">Fréquence</th></tr></thead>
      <tbody>
        {#each SORTES as s}
          <tr><th scope="row">{s.label}</th><td>{t[s.k]}</td><td>{t.total ? frNum(freq(t[s.k], t.total), 3) : '—'}</td></tr>
        {/each}
        <tr><th scope="row">Total</th><td>{t.total}</td><td>{t.total ? '1' : '—'}</td></tr>
      </tbody>
    </table>
  </details>
</div>

<style>
  .how { font-size: 13.5px; color: var(--dim); margin: 0 0 12px; }
  .how b { color: var(--tx); }
  .ctl { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .last { font-family: var(--sm); font-size: 13px; color: var(--dim); margin: 0 0 12px; min-height: 1.6em; }
  .pr { display: inline-block; margin-left: 8px; padding: 1px 8px; border: 1px solid var(--line2); border-radius: 8px; color: var(--tx); }
  .b { margin-bottom: 11px; }
  .lab { font-size: 13.5px; color: var(--tx); margin-bottom: 4px; }
  .code { font-family: var(--sm); margin-right: 4px; }
  .track { position: relative; height: 14px; border-radius: 7px; background: var(--surf3); border: 1px solid var(--line); }
  .fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--g); border-radius: 7px; transition: width 0.45s cubic-bezier(0.34, 1.2, 0.64, 1); }
  .theo { position: absolute; top: -4px; bottom: -4px; border-left: 2px dashed var(--blue); }
  .num { font-family: var(--sm); font-size: 12.5px; color: var(--dim); margin-top: 3px; }
  .num b { color: var(--tx); }
  .chk { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--dim); margin: 4px 0 0; }
  .data { margin-top: 12px; font-size: 13px; color: var(--dim); }
  .data summary { cursor: pointer; min-height: 32px; }
  .data table { border-collapse: collapse; width: 100%; margin-top: 6px; }
  .data th, .data td { border: 1px solid var(--line2); padding: 5px 8px; text-align: left; }
  @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
</style>
