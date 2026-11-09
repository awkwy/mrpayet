<script>
  import { nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';

  /* Le registre du garage de Kahani : 20 véhicules à compter, puis les bâtons,
   * puis la moyenne des vidanges de scooter.
   *
   * Partie 1 — on touche chaque véhicule : il glisse dans sa colonne, l'effectif
   * monte, le bâton grandit en ressort, et le tableau effectif / fréquence /
   * pourcentage se remplit. La fréquence est une fraction (effectif sur 20),
   * jamais « ÷ ».
   * Partie 2 — les 10 vidanges de scooter : on additionne pas à pas (total qui
   * monte), on partage entre 10, puis on compare au panneau (0,3 h = 18 min).
   *
   * Couleur : la série (effectifs) = teinte unique --g ; le panneau (valeur de
   * référence) = --blue ; la moyenne mesurée = --g. Jamais --warn / --red.
   * Les véhicules se distinguent par leur FORME et leur nom, pas par la
   * couleur. */

  const KINDS = [
    { id: 's', name: 'Scooter', cm3: 50, n: 6 },
    { id: 'm', name: 'Moto', cm3: 125, n: 5 },
    { id: 'v', name: 'Voiture', cm3: 1500, n: 5 },
    { id: 'p', name: 'Pick-up', cm3: 2400, n: 4 }
  ];
  // ordre d'arrivée au garage (mélangé, fixe)
  const ORDER = 'vspmsvpsmvsmpsvmpsvm'.split('');
  const TOTAL = ORDER.length;
  const VID = [18, 20, 15, 25, 20, 18, 22, 20, 17, 25];
  const PANNEAU_H = 0.3;

  let tab = $state('reg');
  let counted = $state(ORDER.map(() => false));
  let shake = $state(-1);
  let msg = $state('Touche un véhicule du registre pour le compter dans sa colonne.');
  let show = $state('eff'); // eff | freq | pct

  let tally = $derived(Object.fromEntries(KINDS.map((k) => [k.id, ORDER.filter((o, i) => o === k.id && counted[i]).length])));
  let nDone = $derived(counted.filter(Boolean).length);
  const maxN = Math.max(...KINDS.map((k) => k.n));

  function count(i) {
    if (counted[i]) return;
    counted[i] = true;
    const k = KINDS.find((x) => x.id === ORDER[i]);
    msg = `${k.name} compté : ${tally[k.id] + 0} → ${tally[k.id] + 1}.`;
    const left = ORDER.filter((o, j) => !counted[j] || j === i).length;
    if (counted.filter(Boolean).length === TOTAL) msg = `Les ${TOTAL} véhicules sont comptés. Le plus nombreux : le scooter, ${KINDS[0].n} véhicules sur ${TOTAL}.`;
  }
  function all() {
    ORDER.forEach((_, i) => setTimeout(() => (counted[i] = true), i * 55));
    msg = `Les ${TOTAL} véhicules sont comptés.`;
  }
  function reset() {
    counted = ORDER.map(() => false);
    msg = 'Touche un véhicule du registre pour le compter dans sa colonne.';
  }

  // partie 2
  let step = $state(0); // 0 rien, 1..10 additions, 11 moyenne, 12 heures
  let sum = $derived(VID.slice(0, Math.min(step, 10)).reduce((a, b) => a + b, 0));
  const next = () => (step = Math.min(12, step + 1));
  const redo = () => (step = 0);
  const runAll = () => {
    step = 0;
    for (let i = 1; i <= 12; i++) setTimeout(() => (step = i), i * 260);
  };
  const MEAN = VID.reduce((a, b) => a + b, 0) / VID.length; // 20
</script>

<div class="viz rg">
  <div class="vctl" role="tablist">
    <button role="tab" aria-selected={tab === 'reg'} class:on={tab === 'reg'} onclick={() => (tab = 'reg')}>Le registre</button>
    <button role="tab" aria-selected={tab === 'vid'} class:on={tab === 'vid'} onclick={() => (tab = 'vid')}>Vidanges de scooter</button>
  </div>

  {#if tab === 'reg'}
    <div class="grid" role="group" aria-label="Les 20 véhicules entrés au garage ce mois-ci">
      {#each ORDER as o, i}
        {@const k = KINDS.find((x) => x.id === o)}
        <button type="button" class="veh" class:done={counted[i]} onclick={() => count(i)} aria-label="{k.name} {k.cm3} cm³, {counted[i] ? 'compté' : 'à compter'}">
          <svg viewBox="0 0 40 26" aria-hidden="true">
            {#if o === 's'}
              <circle cx="9" cy="19" r="5" /><circle cx="31" cy="19" r="5" /><path d="M9 19h13l5-8h5M16 11h6" />
            {:else if o === 'm'}
              <circle cx="8" cy="19" r="5.5" /><circle cx="32" cy="19" r="5.5" /><path d="M8 19l8-9h8l8 9M16 10l-3-4h5M24 10l4-3" />
            {:else if o === 'v'}
              <circle cx="11" cy="20" r="4" /><circle cx="29" cy="20" r="4" /><path d="M3 20v-6l5-1 4-5h14l5 5 6 1v6h-4M15 20h10" />
            {:else}
              <circle cx="11" cy="20" r="4" /><circle cx="31" cy="20" r="4" /><path d="M3 20v-8h12l4-5h6v13M25 12h12v8h-2M15 20h12" />
            {/if}
          </svg>
          <span>{k.name}</span>
        </button>
      {/each}
    </div>

    <div class="bars" aria-label="Diagramme en bâtons des effectifs">
      {#each KINDS as k}
        <div class="col">
          <div class="bw"><div class="b" style="height:{(tally[k.id] / maxN) * 100}%"><span>{tally[k.id]}</span></div></div>
          <span class="nm">{k.name}</span>
        </div>
      {/each}
    </div>

    <div class="vctl">
      <button class:on={show === 'eff'} onclick={() => (show = 'eff')}>Effectif</button>
      <button class:on={show === 'freq'} onclick={() => (show = 'freq')}>Fréquence</button>
      <button class:on={show === 'pct'} onclick={() => (show = 'pct')}>Pourcentage</button>
    </div>
    <div class="tw">
      <table>
        <thead>
          <tr><th></th>{#each KINDS as k}<th>{k.name}</th>{/each}<th>Total</th></tr>
        </thead>
        <tbody>
          <tr>
            <th>Effectif</th>
            {#each KINDS as k}<td class:hl={show === 'eff'}>{tally[k.id]}</td>{/each}
            <td>{nDone}</td>
          </tr>
          <tr>
            <th>Fréquence</th>
            {#each KINDS as k}
              <td class:hl={show === 'freq'}>
                {@html frac(tally[k.id], TOTAL)}<br /><small>= {nf(+(tally[k.id] / TOTAL).toFixed(2), 2)}</small>
              </td>
            {/each}
            <td>{@html frac(nDone, TOTAL)}<br /><small>= {nf(+(nDone / TOTAL).toFixed(2), 2)}</small></td>
          </tr>
          <tr>
            <th>%</th>
            {#each KINDS as k}<td class:hl={show === 'pct'}>{nf(Math.round((tally[k.id] / TOTAL) * 100))} %</td>{/each}
            <td>{nf(Math.round((nDone / TOTAL) * 100))} %</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="say" aria-live="polite">{msg}</p>
    <div class="vctl">
      <button class="p" onclick={all} disabled={nDone === TOTAL}>Compter tout le registre</button>
      <button class="gh" onclick={reset}>Recommencer</button>
    </div>
  {:else}
    <p class="intro">Les 10 dernières vidanges de scooter (en minutes). Le panneau du garage affiche <b>0,3 h</b>, soit <b>18 min</b>.</p>
    <div class="chips" role="list">
      {#each VID as v, i}
        <span class="chip" role="listitem" class:on={step > i}>{v}</span>
      {/each}
    </div>
    <div class="calc" aria-live="polite">
      <p class:dim={step < 1}>Somme des durées : <b>{step < 1 ? '…' : nf(sum)} min</b>{#if step >= 1 && step < 10} <small>(après {step} vidange{step > 1 ? 's' : ''})</small>{/if}</p>
      <p class:dim={step < 11}>
        Moyenne :
        {#if step >= 11}
          {@html frac(nf(sum), 10)} = <b>{nf(MEAN)} min</b>
        {:else}…{/if}
      </p>
      <p class:dim={step < 12}>
        En heures :
        {#if step >= 12}
          {@html frac(nf(MEAN), 60)} ≈ <b>{nf(+(MEAN / 60).toFixed(2), 2)} h</b>
        {:else}…{/if}
      </p>
    </div>
    <div class="cmp" aria-hidden={step < 11}>
      <div class="rowb">
        <span class="lb">Panneau</span>
        <span class="tr"><i class="ref" style="width:{(18 / 25) * 100}%"></i></span>
        <span class="vl">18 min</span>
      </div>
      <div class="rowb">
        <span class="lb">Mesuré</span>
        <span class="tr"><i class="mes" style="width:{step >= 11 ? (MEAN / 25) * 100 : 0}%"></i></span>
        <span class="vl">{step >= 11 ? nf(MEAN) + ' min' : '…'}</span>
      </div>
    </div>
    {#if step >= 11}
      <p class="say">« Une vidange de scooter dure en moyenne <b>{nf(MEAN)} min</b>, soit <b>{nf(MEAN - 18)} min</b> de plus que le panneau. »</p>
    {/if}
    <div class="vctl">
      <button class="p" onclick={next} disabled={step >= 12}>Étape suivante</button>
      <button class="gh" onclick={runAll}>Tout calculer</button>
      <button class="gh" onclick={redo}>Recommencer</button>
    </div>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin-top: 12px;
  }
  .veh {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 5px 2px 3px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    background: var(--surf);
    color: var(--tx);
    font-size: 9.5px;
    font-family: var(--sm);
    transition:
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.4s,
      border-color 0.3s;
  }
  .veh svg {
    width: 100%;
    max-width: 42px;
    fill: none;
    stroke: var(--g);
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .veh:active {
    transform: scale(0.92);
  }
  .veh.done {
    opacity: 0.38;
    transform: scale(0.9);
    border-style: dashed;
  }
  .bars {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 14px;
    align-items: end;
  }
  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .bw {
    width: 100%;
    height: 96px;
    display: flex;
    align-items: flex-end;
    border-bottom: 1px solid var(--line2);
  }
  .b {
    width: 100%;
    min-height: 0;
    background: linear-gradient(180deg, var(--g), var(--g2));
    border-radius: 5px 5px 0 0;
    transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  }
  .b span {
    position: absolute;
    top: -17px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: var(--sm);
    font-size: 12px;
    font-weight: 700;
    color: var(--g);
  }
  .nm {
    font-family: var(--sm);
    font-size: 10.5px;
    color: var(--dim);
  }
  .tw {
    overflow-x: auto;
    margin-top: 10px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 13px;
  }
  th,
  td {
    border: 1px solid var(--line);
    padding: 5px 6px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  thead th {
    font-family: var(--sm);
    font-size: 10px;
    text-transform: uppercase;
    color: var(--dim2);
    font-weight: 400;
  }
  tbody th {
    text-align: left;
    color: var(--dim);
    font-weight: 400;
    font-size: 12px;
  }
  td.hl {
    background: color-mix(in srgb, var(--g) 11%, transparent);
    color: var(--g);
  }
  small {
    color: var(--dim2);
  }
  .intro {
    margin: 10px 0 0;
    color: var(--dim);
    font-size: 14.5px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .chip {
    min-width: 40px;
    padding: 6px 0;
    text-align: center;
    border-radius: 8px;
    border: 1px solid var(--line2);
    background: var(--surf);
    color: var(--dim);
    font-family: var(--sm);
    font-size: 14px;
    transition:
      background 0.35s,
      color 0.35s,
      transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .chip.on {
    background: color-mix(in srgb, var(--g) 16%, var(--surf3));
    color: var(--g);
    border-color: var(--g);
    transform: translateY(-3px);
  }
  .calc p {
    margin: 6px 0;
    font-size: 15px;
    color: var(--tx);
    transition: opacity 0.4s;
  }
  .calc p.dim {
    opacity: 0.4;
  }
  .calc b {
    color: var(--g);
    font-family: var(--sm);
  }
  .cmp {
    margin-top: 10px;
  }
  .rowb {
    display: grid;
    grid-template-columns: 5.2em 1fr 4em;
    gap: 8px;
    align-items: center;
    margin: 6px 0;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .tr {
    height: 12px;
    border-radius: 999px;
    background: var(--surf3);
    overflow: hidden;
  }
  .tr i {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 1s cubic-bezier(0.34, 1.35, 0.64, 1);
  }
  .tr .ref {
    background: var(--blue);
  }
  .tr .mes {
    background: var(--g);
  }
  .vl {
    color: var(--tx);
    text-align: right;
  }
</style>
