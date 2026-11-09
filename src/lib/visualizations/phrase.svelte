<script>
  import { onDestroy } from 'svelte';
  import '$lib/styles/stat-viz.css';

  /* « J'écris ma phrase » — assembler une phrase avec l'indicateur.
   *
   * Communiquer ne se limite pas à un nombre : la phrase récap dit l'effectif
   * total, l'effectif et le pourcentage (ou, selon la séance, la moyenne et la
   * décision). L'élève touche des étiquettes numérotées pour remplir la
   * phrase dans l'ordre ; chaque emplacement porte le NOM de son rôle
   * (« effectif total », « effectif », « pourcentage ») pour que la structure
   * se voie. Vérification au fil de l'eau : un mauvais choix secoue
   * l'emplacement, explique quel rôle est faux (jamais juste « raté »), puis
   * s'efface. Quand la phrase est juste, elle s'affiche en entier.
   *
   * vd = { example?, items:[{ intro, parts:[texte | {s:id}], slots:{ id:{role, answer, hint} }, chips:[…], after? }] }
   * `answer` : chaîne, tableau de chaînes acceptées, ou fonction (valeurs déjà posées) → les deux. */

  let { vd } = $props();
  const ITEMS = vd.items;

  let idx = $state(0);
  let vals = $state({});
  let st = $state({});
  let msg = $state('');
  let shake = $state(null);
  let timers = [];

  let item = $derived(ITEMS[idx]);
  let order = $derived(item.parts.filter((p) => typeof p !== 'string').map((p) => p.s));
  let active = $derived(order.find((id) => st[id] !== 'ok'));
  let done = $derived(order.length > 0 && order.every((id) => st[id] === 'ok'));
  let sentence = $derived(item.parts.map((p) => (typeof p === 'string' ? p : vals[p.s] ?? '…')).join(''));

  function accepted(id, v) {
    const a = item.slots[id].answer;
    const ans = typeof a === 'function' ? a(vals) : a;
    return Array.isArray(ans) ? ans.includes(v) : ans === v;
  }
  function hintOf(id, v) {
    const h = item.slots[id].hint;
    return typeof h === 'function' ? h(v, vals) : h || `Ce n’est pas ${item.slots[id].role}.`;
  }
  function place(v) {
    const id = active;
    if (!id) return;
    vals[id] = v;
    if (accepted(id, v)) {
      st[id] = 'ok';
      msg = '';
    } else {
      st[id] = 'no';
      msg = hintOf(id, v);
      shake = id;
      timers.push(
        setTimeout(() => {
          delete vals[id];
          st[id] = undefined;
          shake = null;
        }, 1100)
      );
    }
  }
  function clear(id) {
    if (st[id] === 'ok') {
      // rouvrir un emplacement : on efface ce qui en dépend
      const from = order.indexOf(id);
      order.slice(from).forEach((k) => {
        delete vals[k];
        st[k] = undefined;
      });
      msg = '';
    }
  }
  function next() {
    idx += 1;
    vals = {};
    st = {};
    msg = '';
  }
  function restart() {
    idx = 0;
    vals = {};
    st = {};
    msg = '';
  }
  onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="viz sv">
  {#if vd.example && idx === 0}
    <div class="ex">
      <span class="k">Exemple</span>
      {@html vd.example}
    </div>
  {/if}

  {#if ITEMS.length > 1}<p class="sv-h">Phrase {idx + 1} sur {ITEMS.length}</p>{/if}
  {#if item.intro}<p class="intro">{@html item.intro}</p>{/if}

  <p class="sentence" aria-live="polite">
    {#each item.parts as p}
      {#if typeof p === 'string'}
        <span class="w">{p}</span>
      {:else}
        <span class="slotwrap">
          <button
            type="button"
            class="slot"
            class:act={active === p.s}
            class:ok={st[p.s] === 'ok'}
            class:no={st[p.s] === 'no'}
            class:sv-shake={shake === p.s}
            class:sv-pop={st[p.s] === 'ok'}
            onclick={() => clear(p.s)}
            aria-label={`${item.slots[p.s].role} : ${vals[p.s] ?? 'à choisir'}`}
          >
            {vals[p.s] ?? '…'}
          </button>
          <span class="role">{item.slots[p.s].role}</span>
        </span>
      {/if}
    {/each}
  </p>

  {#if !done}
    <p class="sv-h pick">
      Touche l’étiquette pour <b>{active ? item.slots[active].role : ''}</b>
    </p>
    <div class="sv-chips" role="group" aria-label="Étiquettes">
      {#each item.chips as c}
        <button type="button" class="sv-chip" onclick={() => place(c)}>{c}</button>
      {/each}
    </div>
    {#if msg}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{msg}</p>{/if}
  {:else}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Phrase juste : <b>« {sentence} »</b></p>
    {#if item.after}<p class="sv-fb sv-pop">{@html typeof item.after === 'function' ? item.after(vals) : item.after}</p>{/if}
    <div class="ctl">
      {#if idx + 1 < ITEMS.length}
        <button type="button" class="sv-btn p" onclick={next}>Phrase suivante →</button>
      {:else}
        <button type="button" class="sv-btn gh" onclick={restart}>Recommencer</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ex {
    margin: 0 0 14px;
    padding: 11px 13px;
    border: 1px dashed var(--line2);
    border-radius: 10px;
    font-size: 14.5px;
    color: var(--dim);
  }
  .ex .k {
    display: block;
    font-family: var(--sm);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim2);
    margin-bottom: 3px;
  }
  .ex :global(b) {
    color: var(--tx);
  }
  .intro {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--dim);
  }
  .intro :global(b) {
    color: var(--tx);
  }
  .sentence {
    margin: 4px 0 16px;
    font-size: 16.5px;
    line-height: 2.7;
    color: var(--tx);
  }
  .slotwrap {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
    line-height: 1.1;
    margin: 0 2px;
  }
  .slot {
    min-width: 54px;
    min-height: 40px;
    padding: 4px 11px;
    border: 1.5px dashed var(--line2);
    border-radius: 9px;
    background: transparent;
    color: var(--dim2);
    font-family: var(--sm);
    font-size: 15px;
    transition: border-color 0.25s, background 0.25s, color 0.25s;
  }
  .slot.act {
    border-color: var(--blue);
    color: var(--blue);
  }
  .slot.ok {
    border-style: solid;
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 10%, transparent);
    color: var(--g);
    font-weight: 700;
  }
  .slot.no {
    border-style: solid;
    border-color: var(--red);
    color: var(--tx);
  }
  .role {
    margin-top: 3px;
    font-family: var(--sm);
    font-size: 9.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .pick {
    margin-top: 6px;
  }
  .pick b {
    color: var(--blue);
  }
  .ctl {
    margin-top: 12px;
  }
</style>
