<script>
  import { onMount } from 'svelte';
  import { nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';

  /* Le bac à bougies : expérience aléatoire, issues, événement, probabilité.
   *
   * Un bac de 20 bougies (14 neuves ○, 6 usées ✕ — nombres inventés). Le
   * mécanicien en prend une au hasard, sans regarder.
   *  1. « Je tire une bougie » : le bac se mélange (surbrillance qui saute de
   *     bougie en bougie, de plus en plus lentement) puis s'arrête sur une
   *     issue : on ne peut pas la prévoir = expérience aléatoire.
   *  2. Constructeur de fraction : pour un événement choisi (usée, neuve,
   *     neuve ou usée, bleue), l'élève règle le numérateur (issues favorables)
   *     et le dénominateur (issues possibles). « Vérifier » allume les bougies
   *     favorables en cascade et pose la probabilité sur la règle 0 → 1
   *     (impossible … certain) avec un ressort.
   *  3. Événement contraire : quand U et N sont validés, un bandeau de 20 cases
   *     montre P(U) + P(N) = 1.
   * Les bougies se distinguent par leur forme (○ / ✕), pas par la couleur
   * seule. Couleurs : bougie neuve = --g, usée = --dim, événement mis en
   * avant = --blue. Aucune barre d'état rouge. */

  const N = 20;
  const USED = 6;
  // positions des bougies usées dans le bac (fixes)
  const ISUSED = new Set([1, 5, 8, 11, 14, 18]);
  const kind = (i) => (ISUSED.has(i) ? 'u' : 'n');
  const EVENTS = [
    { id: 'U', lab: 'U : la bougie est usée', fav: USED, short: 'usée', test: (i) => ISUSED.has(i) },
    { id: 'N', lab: 'N : la bougie est neuve', fav: N - USED, short: 'neuve', test: (i) => !ISUSED.has(i) },
    { id: 'NU', lab: 'la bougie est neuve ou usée', fav: N, short: 'neuve ou usée', test: () => true },
    { id: 'B', lab: 'la bougie est bleue', fav: 0, short: 'bleue', test: () => false }
  ];
  const WORD = (p) => (p === 0 ? 'impossible' : p === 1 ? 'certain' : p < 0.5 ? 'peu probable' : 'probable');

  let ev = $state(EVENTS[0]);
  let num = $state(0);
  let den = $state(N);
  let lit = $state(new Set());
  let verified = $state({}); // id -> true
  let msg = $state('');
  let picked = $state(-1);
  let rolling = $state(false);
  let tally = $state({ n: 0, u: 0 });
  let last = $state('');
  let RM = false;
  let timers = [];

  let p = $derived(den > 0 ? num / den : 0);
  let right = $derived(num === ev.fav && den === N);
  let both = $derived(!!verified.U && !!verified.N);

  onMount(() => {
    RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => timers.forEach(clearTimeout);
  });

  function choose(e) {
    ev = e;
    num = 0;
    den = N;
    lit = new Set();
    msg = '';
  }
  const dn = (v) => (num = Math.max(0, Math.min(den, num + v)));
  const dd = (v) => {
    den = Math.max(1, Math.min(40, den + v));
    num = Math.min(num, den);
  };

  function verify() {
    if (right) {
      msg = `Juste : ${ev.fav} bougie${ev.fav > 1 ? 's' : ''} ${ev.short}${ev.fav > 1 ? 's' : ''} sur ${N}. P = ${frac(ev.fav, N)} = ${nf(ev.fav / N)}${ev.fav / N === 0 || ev.fav / N === 1 ? ` : événement ${WORD(ev.fav / N)}` : ''}.`;
      verified = { ...verified, [ev.id]: true };
      // cascade des bougies favorables
      lit = new Set();
      const fav = [...Array(N).keys()].filter(ev.test);
      fav.forEach((i, k) => {
        timers.push(setTimeout(() => (lit = new Set([...lit, i])), RM ? 0 : k * 70));
      });
    } else if (den !== N) {
      msg = `Le dénominateur est le nombre d'issues possibles : combien de bougies peut-on tirer en tout dans le bac ?`;
    } else {
      msg = num > ev.fav ? 'Trop : recompte les bougies qui correspondent à l\'événement.' : 'Pas assez : recompte les bougies qui correspondent à l\'événement.';
    }
  }

  function draw() {
    if (rolling) return;
    rolling = true;
    const target = Math.floor(Math.random() * N);
    const total = RM ? 1 : 18;
    let k = 0;
    let at = Math.floor(Math.random() * N);
    const stepFn = () => {
      at = (at + 1 + Math.floor(Math.random() * 6)) % N;
      picked = k >= total - 1 ? target : at;
      k += 1;
      if (k < total) {
        timers.push(setTimeout(stepFn, 40 + k * k * 1.6));
      } else {
        rolling = false;
        const u = kind(target) === 'u';
        tally = { n: tally.n + 1, u: tally.u + (u ? 1 : 0) };
        last = u ? 'usée' : 'neuve';
      }
    };
    stepFn();
  }
</script>

<div class="viz bacv">
  <div class="bac" role="group" aria-label="Le bac : 20 bougies, 14 neuves et 6 usées">
    {#each Array(N) as _, i}
      {@const k = kind(i)}
      <span class="bg" class:pick={picked === i} class:lit={lit.has(i)} class:rolling={rolling && picked === i}>
        <svg viewBox="0 0 24 40" aria-hidden="true">
          <rect x="8" y="14" width="8" height="20" rx="2" class="body" />
          {#if k === 'n'}
            <circle cx="12" cy="9" r="4.5" class="tip" />
          {:else}
            <path d="M8 5l8 8M16 5l-8 8" class="x" />
          {/if}
        </svg>
        <i class="lbl">{k === 'n' ? '○' : '✕'}</i>
      </span>
    {/each}
  </div>
  <p class="legend">○ neuve (bout creux) &nbsp; ✕ usée (bout plein barré)</p>

  <div class="vctl">
    <button class="p" onclick={draw} disabled={rolling}>Je tire une bougie sans regarder</button>
  </div>
  {#if tally.n}
    <p class="say" aria-live="polite">
      Tirage n°{tally.n} : bougie <b>{last}</b>. En {tally.n} tirage{tally.n > 1 ? 's' : ''}, {tally.u} usée{tally.u > 1 ? 's' : ''}. On ne peut pas prévoir le résultat : c'est une <b>expérience aléatoire</b>. Les deux issues possibles : neuve, usée.
    </p>
  {/if}

  <h4 class="sub">Calcule la chance d'un événement</h4>
  <div class="evs" role="tablist" aria-label="Événement">
    {#each EVENTS as e}
      <button type="button" role="tab" aria-selected={ev.id === e.id} class="evb" class:on={ev.id === e.id} class:ok={verified[e.id]} onclick={() => choose(e)}>
        {e.lab}{verified[e.id] ? ' ✓' : ''}
      </button>
    {/each}
  </div>

  <div class="build">
    <div class="step">
      <span class="k">issues favorables</span>
      <span class="nm"><button aria-label="Une issue favorable de moins" onclick={() => dn(-1)}>−</button><b>{num}</b><button aria-label="Une issue favorable de plus" onclick={() => dn(1)}>+</button></span>
    </div>
    <div class="frc" aria-live="polite">
      <span class="eqt">P =</span>
      <span class="fr big"><span class="fn">{num}</span><span class="sr"> sur </span><span class="fd">{den}</span></span>
      <span class="eqt">= {nf(+p.toFixed(3))}</span>
    </div>
    <div class="step">
      <span class="k">issues possibles</span>
      <span class="nm"><button aria-label="Une issue possible de moins" onclick={() => dd(-1)}>−</button><b>{den}</b><button aria-label="Une issue possible de plus" onclick={() => dd(1)}>+</button></span>
    </div>
  </div>

  <div class="axis" aria-hidden="true">
    <span class="line"></span>
    <span class="dot" style="left:{p * 100}%"></span>
    <span class="e0">0 impossible</span>
    <span class="e1">1 certain</span>
  </div>

  <div class="vctl">
    <button class="p" onclick={verify}>Vérifier la fraction</button>
  </div>
  {#if msg}<p class="say" aria-live="polite">{@html msg}</p>{/if}

  {#if both}
    <div class="comp" aria-live="polite">
      <p class="cl">Événement contraire : U et N se partagent tout le bac.</p>
      <div class="strip">
        <i class="su" style="flex:{USED}"><span>U : {@html frac(USED, N)} = {nf(USED / N)}</span></i>
        <i class="sn" style="flex:{N - USED}"><span>N : {@html frac(N - USED, N)} = {nf((N - USED) / N)}</span></i>
      </div>
      <p>P(U) + P(N) = {nf(USED / N)} + {nf((N - USED) / N)} = <b>1</b>. Donc <b>P(N) = 1 − P(U)</b>.</p>
    </div>
  {/if}
</div>

<style>
  .bac {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 4px;
    margin-top: 2px;
  }
  .bg {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3px 0 1px;
    border-radius: 7px;
    border: 1px solid transparent;
    transition:
      background 0.3s,
      border-color 0.3s,
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .bg svg {
    width: 100%;
    max-width: 27px;
    height: auto;
  }
  .body {
    fill: var(--surf3);
    stroke: var(--line2);
    stroke-width: 1.2;
  }
  .tip {
    fill: none;
    stroke: var(--g);
    stroke-width: 2.4;
  }
  .x {
    stroke: var(--dim);
    stroke-width: 2.6;
    stroke-linecap: round;
  }
  .lbl {
    font-style: normal;
    font-size: 10px;
    line-height: 1;
    color: var(--dim2);
  }
  .bg.pick {
    background: color-mix(in srgb, var(--blue) 18%, transparent);
    border-color: var(--blue);
    transform: translateY(-3px) scale(1.08);
  }
  .bg.lit {
    background: color-mix(in srgb, var(--blue) 14%, transparent);
    border-color: var(--blue);
    animation: bump 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes bump {
    0% {
      transform: scale(0.8);
    }
    60% {
      transform: scale(1.12);
    }
    100% {
      transform: scale(1);
    }
  }
  .legend {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--dim2);
    font-family: var(--sm);
  }
  .sub {
    font-family: var(--sm);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--g2);
    margin: 18px 0 8px;
  }
  .evs {
    display: grid;
    gap: 6px;
  }
  .evb {
    text-align: left;
    padding: 8px 11px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    background: var(--surf);
    color: var(--tx);
    font-size: 14px;
    transition:
      border-color 0.2s,
      background 0.3s;
  }
  .evb.on {
    border-color: var(--blue);
    background: color-mix(in srgb, var(--blue) 11%, var(--surf));
  }
  .evb.ok:not(.on) {
    border-color: var(--g3);
  }
  .build {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    align-items: center;
    margin-top: 12px;
  }
  .step {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }
  .k {
    font-family: var(--sm);
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--dim2);
    text-align: center;
  }
  .nm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nm button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--line2);
    background: var(--surf3);
    color: var(--tx);
    font-size: 20px;
    line-height: 1;
    padding: 0;
  }
  .nm button:active {
    transform: scale(0.9);
  }
  .nm b {
    min-width: 1.6em;
    text-align: center;
    font-family: var(--sm);
    font-size: 19px;
    color: var(--g);
  }
  .frc {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .eqt {
    font-family: var(--sm);
    color: var(--dim);
    font-size: 14px;
  }
  .big {
    font-family: var(--sm);
    font-size: 22px;
    color: var(--tx);
  }
  .axis {
    position: relative;
    height: 44px;
    margin: 14px 10px 0;
  }
  .axis .line {
    position: absolute;
    left: 0;
    right: 0;
    top: 14px;
    height: 4px;
    border-radius: 999px;
    background: var(--surf3);
  }
  .axis .dot {
    position: absolute;
    top: 8px;
    width: 16px;
    height: 16px;
    margin-left: -8px;
    border-radius: 50%;
    background: var(--g);
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 1.5px var(--g3);
    transition: left 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .e0,
  .e1 {
    position: absolute;
    top: 28px;
    font-family: var(--sm);
    font-size: 10.5px;
    color: var(--dim2);
  }
  .e0 {
    left: 0;
  }
  .e1 {
    right: 0;
  }
  .comp {
    margin-top: 14px;
    padding: 11px 12px;
    border-left: 2.5px solid var(--g3);
    border-radius: 0 9px 9px 0;
    background: color-mix(in srgb, var(--g) 6%, transparent);
    animation: rise 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  .comp p {
    margin: 6px 0;
    font-size: 14.5px;
  }
  .cl {
    color: var(--dim);
  }
  .strip {
    display: flex;
    gap: 3px;
    height: 34px;
  }
  .strip i {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-style: normal;
    font-size: 11px;
    font-family: var(--sm);
    overflow: hidden;
  }
  .su {
    background: var(--surf3);
    color: var(--dim);
    border: 1px solid var(--line2);
  }
  .sn {
    background: color-mix(in srgb, var(--g) 18%, var(--surf3));
    color: var(--g);
    border: 1px solid var(--g3);
  }
  .strip span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
</style>
