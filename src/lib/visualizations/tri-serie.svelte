<script>
  import { onMount } from 'svelte';
  import { sortAsc, quartileRank } from '$lib/utils/stats-mv.js';

  /* « Range la série » — bilan du chapitre statistique (équipe du matin).
   *
   * 1. Forme  : 24 pastilles-valeurs à toucher. Elles quittent la zone « relevé
   *    dans le désordre » pour rejoindre leur case numérotée de la série rangée.
   *    Les 24 cases numérotées sont visibles dès le départ (état de repos) :
   *    on voit ce qui reste à remplir.
   * 2. Règle  : on ne peut toucher que la plus petite valeur restante (les
   *    ex æquo sont interchangeables). Toucher une autre valeur la fait trembler
   *    et affiche un indice sans donner la réponse.
   * 3. Couleur : série de données = teinte unique --g ; repères dérivés (Q₁,
   *    médiane, Q₃) = accent --blue. Jamais --warn/--red (jetons d'état
   *    réservés) : l'erreur est signalée par le tremblement + le texte.
   * 4. Mouvement : translate + dépassement « ressort » (cubic-bezier) ; les
   *    repères apparaissent en cascade une fois la série rangée. Coupé par
   *    prefers-reduced-motion (global.css).
   * 5. Accessibilité : pastilles = vrais <button>, annonces dans un
   *    aria-live, ordre de tabulation = ordre du relevé. */

  let { vd } = $props();

  const VALS = vd?.vals ?? [22, 25, 28, 24, 22, 24, 31, 27, 22, 26, 24, 24, 22, 19, 23, 23, 21, 25, 20, 20, 26, 23, 21, 23];
  const UNIT = vd?.unit ?? 'min';
  const N = VALS.length;
  const SORTED = sortAsc(VALS);
  const QR = [quartileRank(N, 0.25), quartileRank(N, 0.75)];

  const CW = 44;
  const CH = 38;
  const GAP = 6;
  const HEAD = 22;
  const SGAP = 22; // espace vertical entre les lignes de la série rangée (place des repères Q₁ / médiane / Q₃)

  let W = $state(320);
  let order = $state([]); // indices (dans VALS) déjà rangés, dans l'ordre de rangement
  let shakeIdx = $state(-1);
  let msg = $state('Touche la plus petite durée du relevé pour la ranger.');
  let wrong = $state(0);
  let hint = $state(-1);
  let ready = $state(false);

  let cols = $derived(Math.max(4, Math.floor((W + GAP) / (CW + GAP))));
  let rows = $derived(Math.ceil(N / cols));
  let poolTop = HEAD;
  let sortTop = $derived(HEAD + rows * (CH + GAP) + 28);
  let height = $derived(sortTop + HEAD + rows * (CH + SGAP) + 8);

  let placed = $derived(order.length);
  let done = $derived(placed === N);
  let remainingMin = $derived(Math.min(...VALS.filter((_, i) => !order.includes(i))));

  const slotOf = (i) => order.indexOf(i);
  function pos(i) {
    const s = slotOf(i);
    const k = s >= 0 ? s : i;
    const r = Math.floor(k / cols);
    const c = k % cols;
    const top = s >= 0 ? sortTop + HEAD : poolTop;
    return { x: c * (CW + GAP), y: top + r * (CH + (s >= 0 ? SGAP : GAP)) };
  }
  function slotPos(k) {
    return { x: (k % cols) * (CW + GAP), y: sortTop + HEAD + Math.floor(k / cols) * (CH + SGAP) };
  }

  function pick(i) {
    if (slotOf(i) >= 0 || done) return;
    if (VALS[i] === remainingMin) {
      order = [...order, i];
      hint = -1;
      if (order.length === N) {
        msg = `Série rangée : ${N} valeurs. Regarde les repères : Q₁ au rang ${QR[0]}, médiane entre les rangs ${N / 2} et ${N / 2 + 1}, Q₃ au rang ${QR[1]}.`;
      } else {
        msg = `${VALS[i]} ${UNIT} rangée au rang ${order.length}. Encore ${N - order.length} à ranger.`;
      }
    } else {
      wrong += 1;
      shakeIdx = i;
      msg = `Il reste une durée plus petite que ${VALS[i]} ${UNIT}. Cherche encore.`;
      setTimeout(() => {
        if (shakeIdx === i) shakeIdx = -1;
      }, 450);
      if (wrong >= 3) {
        const cand = VALS.findIndex((v, k) => slotOf(k) < 0 && v === remainingMin);
        hint = cand;
      }
    }
  }

  let timers = [];
  function autoSort() {
    timers.forEach(clearTimeout);
    timers = [];
    const rest = VALS.map((v, i) => i)
      .filter((i) => slotOf(i) < 0)
      .sort((a, b) => VALS[a] - VALS[b] || a - b);
    rest.forEach((i, k) => {
      timers.push(
        setTimeout(() => {
          order = [...order, i];
          if (order.length === N) msg = `Série rangée. Repère maintenant Q₁ (rang ${QR[0]}), la médiane et Q₃ (rang ${QR[1]}).`;
        }, 70 * k)
      );
    });
    hint = -1;
  }
  function reset() {
    timers.forEach(clearTimeout);
    order = [];
    wrong = 0;
    hint = -1;
    msg = 'Touche la plus petite durée du relevé pour la ranger.';
  }

  // Repères (visibles une fois la série entièrement rangée). Médiane d'effectif
  // pair : une étiquette qui chevauche les deux cases centrales si elles sont
  // sur la même ligne, sinon une étiquette sur chacune.
  let marks = $derived.by(() => {
    if (!done) return [];
    const out = [{ k: QR[0] - 1, t: 'Q₁' }];
    if (N % 2 === 0) {
      const k = N / 2 - 1;
      if ((k % cols) + 2 <= cols) out.push({ k, span: 2, t: 'médiane' });
      else out.push({ k, t: 'médiane' }, { k: k + 1, t: 'médiane' });
    } else out.push({ k: (N - 1) / 2, t: 'médiane' });
    out.push({ k: QR[1] - 1, t: 'Q₃' });
    return out;
  });
  const markAt = (k) => marks.some((m) => k >= m.k && k < m.k + (m.span || 1));

  onMount(() => {
    ready = true;
    return () => timers.forEach(clearTimeout);
  });
</script>

<div class="viz tri" class:ready>
  <div class="zone" bind:clientWidth={W} style="height:{height}px">
    <span class="lbl" style="top:0">Relevé (dans l'ordre où on l'a noté)</span>
    <span class="lbl" style="top:{sortTop}px">Série rangée (du plus petit au plus grand)</span>

    {#each SORTED as _, k}
      {@const p = slotPos(k)}
      <span class="slot" class:mk={done && markAt(k)} style="transform:translate({p.x}px,{p.y}px)" aria-hidden="true">{k + 1}</span>
    {/each}

    {#each VALS as v, i}
      {@const p = pos(i)}
      {@const s = slotOf(i)}
      <button
        type="button"
        class="chip"
        class:placed={s >= 0}
        class:shake={shakeIdx === i}
        class:hint={hint === i}
        style="transform:translate({p.x}px,{p.y}px)"
        onclick={() => pick(i)}
        aria-label={s >= 0 ? `${v} ${UNIT}, rangée au rang ${s + 1}` : `${v} ${UNIT}, à ranger`}
        aria-disabled={s >= 0}
        tabindex={s >= 0 ? -1 : 0}
      >
        {v}
      </button>
    {/each}

    {#each marks as m, mi}
      {@const p = slotPos(m.k)}
      {@const sp = m.span || 1}
      <span class="tag" style="transform:translate({p.x}px,{p.y + CH + 1}px);width:{sp * CW + (sp - 1) * GAP}px;animation-delay:{mi * 120}ms">{m.t}</span>
    {/each}
  </div>

  <div class="bar" aria-hidden="true"><i style="width:{(placed / N) * 100}%"></i></div>
  <p class="say" aria-live="polite">{msg}</p>

  <div class="vctl">
    <button type="button" class="gh" onclick={reset}>Recommencer</button>
    <button type="button" class="gh" onclick={autoSort} disabled={done}>Range à ma place</button>
  </div>
</div>

<style>
  .zone {
    position: relative;
    width: 100%;
  }
  .lbl {
    position: absolute;
    left: 0;
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--dim2);
  }
  .chip,
  .slot,
  .tag {
    position: absolute;
    left: 0;
    top: 0;
    width: 44px;
  }
  .chip {
    height: 38px;
    border-radius: 9px;
    border: 1px solid var(--g3);
    background: var(--surf3);
    color: var(--g);
    font-family: var(--sm);
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition:
      transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.3s,
      border-color 0.3s;
    touch-action: manipulation;
  }
  .chip.placed {
    background: color-mix(in srgb, var(--g) 16%, var(--surf3));
    border-color: var(--g);
    cursor: default;
  }
  .chip.hint {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 30%, transparent);
  }
  .chip.shake {
    animation: shake 0.42s ease;
  }
  @keyframes shake {
    0%,
    100% {
      margin-left: 0;
    }
    20% {
      margin-left: -6px;
    }
    45% {
      margin-left: 6px;
    }
    70% {
      margin-left: -3px;
    }
  }
  .slot {
    height: 38px;
    border-radius: 9px;
    border: 1px dashed var(--line2);
    color: var(--dim2);
    font-family: var(--sm);
    font-size: 11px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 2px;
    transition: border-color 0.4s;
  }
  .slot.mk {
    border-color: var(--blue);
  }
  .tag {
    height: 16px;
    text-align: center;
    font-family: var(--sm);
    font-size: 10px;
    font-weight: 700;
    color: var(--blue);
    white-space: nowrap;
    overflow: visible;
    animation: rise 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes rise {
    from {
      opacity: 0;
      margin-top: -8px;
    }
    to {
      opacity: 1;
      margin-top: 0;
    }
  }
  .bar {
    height: 5px;
    border-radius: 999px;
    background: var(--surf3);
    margin-top: 6px;
    overflow: hidden;
  }
  .bar i {
    display: block;
    height: 100%;
    background: var(--g);
    border-radius: 999px;
    transition: width 0.6s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  .vctl button:disabled {
    opacity: 0.4;
  }
</style>
