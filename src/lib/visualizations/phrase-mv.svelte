<script>
  /* Constructeur de phrase : une phrase de conclusion à compléter avec une
   * banque de mots (et, au besoin, un nombre à saisir). C'est la « phrase
   * réponse » des fiches (conclusion du bilan, phrase de la bougie neuve,
   * lecture d'image / antécédent), rendue manipulable.
   *
   * vd = {
   *   parts: [ "texte ", { id:'a', a:'réponse' | ['variantes'], type?:'word'|'num', w?:poids } , " texte" ],
   *   bank:  [ 'mot', … ]          banque de mots (leurres compris)
   *   ok?:   "message de réussite" (HTML)
   * }
   * Props facultatives pour l'auto-test : `reveal` (bool, n'affiche le
   * verdict que si vrai) et `onstate({filled, score, max})`.
   *
   * Un mot touché dans la banque va dans la première case libre (ou dans la case
   * sélectionnée) avec un petit rebond ; toucher une case remplie la vide.
   * Couleurs : case juste = --g ; case à revoir = liseré --dim2 (l'erreur est
   * une étape, pas un statut d'alerte). Pas de couleur seule : ✓ / « à revoir ». */

  let { vd, reveal = null, onstate = null, bare = false } = $props();

  const parts = vd?.parts ?? [];
  const slots = parts.filter((p) => typeof p === 'object');
  const bank = vd?.bank ?? [];
  const deferred = reveal !== null;

  let fills = $state(Object.fromEntries(slots.map((s) => [s.id, ''])));
  let used = $state(bank.map(() => false)); // chips de la banque déjà posées
  let from = $state(Object.fromEntries(slots.map((s) => [s.id, -1]))); // index de banque
  let sel = $state(null);
  let checked = $state(false);
  let popId = $state('');

  const norm = (z) =>
    String(z)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .replace(',', '.')
      .trim();
  const isOk = (s) => {
    const a = Array.isArray(s.a) ? s.a : [s.a];
    return a.some((x) => norm(x) === norm(fills[s.id]));
  };
  const weight = (s) => s.w ?? 1;
  let max = $derived(slots.reduce((t, s) => t + weight(s), 0));
  let score = $derived(slots.reduce((t, s) => t + (isOk(s) ? weight(s) : 0), 0));
  let filled = $derived(slots.every((s) => String(fills[s.id]).trim() !== ''));
  let shown = $derived(deferred ? !!reveal : checked);

  $effect(() => {
    if (onstate) onstate({ filled, score, max, slots: slots.map((s) => ({ id: s.id, ok: isOk(s), v: fills[s.id] })) });
  });

  function put(bi) {
    if (used[bi]) return;
    const target = sel && slots.find((s) => s.id === sel && s.type !== 'num') ? sel : (slots.find((s) => s.type !== 'num' && !fills[s.id]) || {}).id;
    if (!target) return;
    fills[target] = bank[bi];
    from[target] = bi;
    used[bi] = true;
    sel = null;
    popId = target;
    checked = false;
    setTimeout(() => (popId = ''), 500);
  }
  function clear(s) {
    if (s.type === 'num') return;
    const bi = from[s.id];
    if (bi >= 0) used[bi] = false;
    fills[s.id] = '';
    from[s.id] = -1;
    checked = false;
  }
  function reset() {
    slots.forEach((s) => ((fills[s.id] = ''), (from[s.id] = -1)));
    used = bank.map(() => false);
    checked = false;
    sel = null;
  }
</script>

<div class="ph" class:viz={!bare}>
  {#if vd?.intro}<p class="intro">{@html vd.intro}</p>{/if}
  <p class="sent" aria-live="polite">
    {#each parts as p}
      {#if typeof p === 'string'}
        <span class="t">{p}</span>
      {:else if p.type === 'num'}
        <span class="slot num" class:ok={shown && isOk(p)} class:no={shown && !isOk(p) && String(fills[p.id]).trim() !== ''}>
          <input
            type="text"
            inputmode="decimal"
            autocomplete="off"
            bind:value={fills[p.id]}
            oninput={() => (checked = false)}
            aria-label={p.label ?? 'nombre à écrire'}
          />
        </span>
      {:else}
        <button
          type="button"
          class="slot"
          class:sel={sel === p.id}
          class:filled={fills[p.id]}
          class:ok={shown && isOk(p)}
          class:no={shown && !isOk(p) && fills[p.id]}
          class:pop={popId === p.id}
          onclick={() => (fills[p.id] ? clear(p) : (sel = sel === p.id ? null : p.id))}
          aria-label={fills[p.id] ? `${fills[p.id]} (toucher pour retirer)` : `case vide ${slots.indexOf(p) + 1}`}
        >
          {fills[p.id] || '…'}
          {#if shown && fills[p.id]}<span class="v" aria-hidden="true">{isOk(p) ? ' ✓' : ' ?'}</span>{/if}
        </button>
      {/if}
    {/each}
  </p>

  <div class="bank" role="group" aria-label="Banque de mots">
    {#each bank as w, bi}
      <button type="button" class="chipw" class:used={used[bi]} disabled={used[bi]} onclick={() => put(bi)}>{w}</button>
    {/each}
  </div>

  {#if !deferred}
    <div class="vctl">
      <button type="button" class="p" onclick={() => (checked = true)} disabled={!filled}>Vérifier ma phrase</button>
      <button type="button" class="gh" onclick={reset}>Effacer</button>
    </div>
    {#if checked}
      <p class="say" class:win={score === max} aria-live="polite">
        {#if score === max}
          {@html vd?.ok ?? 'Phrase juste.'}
        {:else}
          {score} case{score > 1 ? 's' : ''} sur {max} {score > 1 ? 'justes' : 'juste'}. Les cases marquées « ? » sont à revoir : touche-les pour les vider et choisis un autre mot.
        {/if}
      </p>
    {/if}
  {/if}
</div>

<style>
  .intro {
    margin: 0 0 8px;
    color: var(--dim);
    font-size: 14px;
  }
  .sent {
    margin: 4px 0 12px;
    font-size: 15.5px;
    line-height: 2.5;
    color: var(--tx);
  }
  .slot {
    display: inline-block;
    min-width: 5.2em;
    padding: 1px 9px;
    margin: 0 2px;
    border: 1.5px dashed var(--line2);
    border-radius: 8px;
    background: var(--bg);
    color: var(--dim2);
    font-family: var(--sa);
    font-size: 15px;
    line-height: 1.6;
    text-align: center;
    transition:
      border-color 0.25s,
      background 0.4s;
  }
  .slot.sel {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 25%, transparent);
  }
  .slot.filled {
    border-style: solid;
    border-color: var(--g3);
    color: var(--tx);
    background: var(--surf3);
  }
  .slot.ok {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 15%, var(--bg));
    color: var(--g);
  }
  .slot.no {
    border-color: var(--dim2);
    border-style: dotted;
  }
  .slot.pop {
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pop {
    0% {
      transform: scale(0.8);
    }
    60% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  .slot.num {
    min-width: 4.5em;
    padding: 0;
  }
  .slot.num input {
    width: 4.6em;
    background: transparent;
    border: 0;
    color: var(--tx);
    text-align: center;
    font-family: var(--sm);
    font-size: 15px;
    padding: 2px 4px;
  }
  .bank {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .chipw {
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--g3);
    background: var(--surf3);
    color: var(--g);
    font-size: 14px;
    transition:
      transform 0.2s,
      opacity 0.3s;
  }
  .chipw:active:not(:disabled) {
    transform: scale(0.94);
  }
  .chipw.used {
    opacity: 0.3;
    border-style: dashed;
  }
  .say.win {
    border-left-color: var(--g);
  }
  .vctl button:disabled {
    opacity: 0.4;
  }
</style>
