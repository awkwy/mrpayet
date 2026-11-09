<script>
  import Phrase from './phrase.svelte';
  import { checkNumeric } from '$lib/utils/answer-check.js';

  /* Auto-test : une éval flash ou une mini-évaluation passée en autonomie.
   *
   * Principe : les réponses restent CACHÉES tant que l'élève n'a pas rendu son
   * auto-test. À « Je rends mon auto-test », chaque question est corrigée sur
   * place (✓ / ✕ + explication) et le score se répartit en compétences
   * Analyser · Réaliser · Communiquer, jauges animées en ressort.
   * Les questions ouvertes (rédiger une phrase) ne sont pas devinées par la
   * machine : la phrase modèle s'affiche et l'élève coche lui-même les critères
   * remplis (auto-évaluation), comme sur la grille papier.
   *
   * vd (voir $lib/data/selftests-stats.js) = {
   *   intro, data (HTML),
   *   questions:[{ id, comp:'A'|'R'|'C', pts, section?, bonus?, q (HTML), kind, … }]
   * }
   *   kind 'choice' : options[], correct, why
   *   kind 'nums'   : fields[{label,a,tol,unit,pts}], why
   *   kind 'list'   : a[] (série à écrire dans l'ordre), why
   *   kind 'phrase' : phrase{parts,bank}, why
   *   kind 'open'   : model (HTML), criteria[]
   *
   * Couleur : réussi = --g ; à revoir = --red + « ✕ » (vrai statut binaire,
   * toujours doublé d'un pictogramme et d'un texte). Barres de compétences en
   * teinte de données unique --g. */

  let { vd } = $props();
  const Q = vd?.questions ?? [];
  const COMPS = [
    ['A', 'Analyser'],
    ['R', 'Réaliser'],
    ['C', 'Communiquer']
  ];

  let submitted = $state(false);
  let picks = $state(Object.fromEntries(Q.map((q) => [q.id, null])));
  let nums = $state(Object.fromEntries(Q.map((q) => [q.id, (q.fields ?? []).map(() => '')])));
  let lists = $state(Object.fromEntries(Q.map((q) => [q.id, ''])));
  let texts = $state(Object.fromEntries(Q.map((q) => [q.id, ''])));
  let ticks = $state(Object.fromEntries(Q.map((q) => [q.id, (q.criteria ?? []).map(() => false)])));
  let phr = $state(Object.fromEntries(Q.map((q) => [q.id, { score: 0, max: 1 }])));
  let revealBars = $state(false);

  function parseList(s) {
    return String(s)
      .split(/[;\s]+/)
      .map((z) => z.trim().replace(',', '.'))
      .filter(Boolean)
      .map(Number);
  }
  function got(q) {
    switch (q.kind) {
      case 'choice':
        return picks[q.id] === q.correct ? q.pts : 0;
      case 'nums':
        return q.fields.reduce((t, f, i) => t + (checkNumeric(nums[q.id][i], f.a, f.tol ?? 0) ? (f.pts ?? 1) : 0), 0);
      case 'list': {
        const l = parseList(lists[q.id]);
        return l.length === q.a.length && l.every((v, i) => v === q.a[i]) ? q.pts : 0;
      }
      case 'phrase':
        return (phr[q.id].score / phr[q.id].max) * q.pts;
      case 'open':
        return (ticks[q.id].filter(Boolean).length / q.criteria.length) * q.pts;
      default:
        return 0;
    }
  }
  const qOk = (q) => got(q) >= q.pts - 1e-9;

  let tot = $derived(
    COMPS.map(([k, name]) => {
      const qs = Q.filter((q) => q.comp === k && !q.bonus);
      return { k, name, max: qs.reduce((t, q) => t + q.pts, 0), got: submitted ? qs.reduce((t, q) => t + got(q), 0) : 0 };
    })
  );
  let total = $derived(tot.reduce((t, c) => t + c.got, 0));
  let totalMax = $derived(tot.reduce((t, c) => t + c.max, 0));
  let bonusQ = $derived(Q.filter((q) => q.bonus));
  let bonus = $derived(submitted ? bonusQ.reduce((t, q) => t + got(q), 0) : 0);
  const f1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

  function submit() {
    submitted = true;
    revealBars = false;
    requestAnimationFrame(() => requestAnimationFrame(() => (revealBars = true)));
    setTimeout(() => document.getElementById('autotest-score-' + (vd?.id ?? ''))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  }
  function restart() {
    submitted = false;
    revealBars = false;
    Q.forEach((q) => {
      picks[q.id] = null;
      nums[q.id] = (q.fields ?? []).map(() => '');
      lists[q.id] = '';
      texts[q.id] = '';
      ticks[q.id] = (q.criteria ?? []).map(() => false);
    });
    phraseKey += 1;
  }
  let phraseKey = $state(0);
  let answered = $derived(
    Q.filter(
      (q) =>
        (q.kind === 'choice' && picks[q.id] !== null) ||
        (q.kind === 'nums' && nums[q.id].some((v) => String(v).trim())) ||
        (q.kind === 'list' && lists[q.id].trim()) ||
        (q.kind === 'phrase' && phr[q.id].filled) ||
        (q.kind === 'open' && texts[q.id].trim())
    ).length
  );
  const verdict = (r) =>
    r >= 0.85 ? 'Très solide : tu maîtrises le chapitre.' : r >= 0.6 ? "Bien : relis les questions marquées ✕ et recommence-les." : 'À reprendre : reviens sur la séance, puis refais cet auto-test.';
</script>

<div class="viz at" data-testid="autotest">
  {#if vd?.intro}<p class="intro">{@html vd.intro}</p>{/if}
  {#if vd?.data}<div class="data">{@html vd.data}</div>{/if}

  {#key phraseKey}
    {#each Q as q, qi (q.id)}
      {#if q.section && (qi === 0 || Q[qi - 1].section !== q.section)}
        <h3 class="sec">{q.section}</h3>
      {/if}
      <section class="q" class:good={submitted && qOk(q)} class:bad={submitted && !qOk(q) && q.kind !== 'open'}>
        <div class="qh">
          <span class="num">{qi + 1}</span>
          <span class="qt">{@html q.q}</span>
          <span class="meta">
            {#if q.comp}<span class="cp" data-c={q.comp}>{COMPS.find((c) => c[0] === q.comp)?.[1]}</span>{/if}
            <span class="pt">{q.bonus ? 'bonus ' : ''}{q.pts} pt{q.pts > 1 ? 's' : ''}</span>
          </span>
        </div>

        {#if q.kind === 'choice'}
          <div class="opts" role="radiogroup" aria-label="Choix de réponse">
            {#each q.options as o, oi}
              <button
                type="button"
                class="opt"
                role="radio"
                aria-checked={picks[q.id] === oi}
                class:picked={picks[q.id] === oi}
                class:right={submitted && oi === q.correct}
                class:wrong={submitted && picks[q.id] === oi && oi !== q.correct}
                disabled={submitted}
                onclick={() => (picks[q.id] = oi)}
              >
                {o}
                {#if submitted && oi === q.correct}<span class="vv"> ✓</span>{/if}
                {#if submitted && picks[q.id] === oi && oi !== q.correct}<span class="vv"> ✕</span>{/if}
              </button>
            {/each}
          </div>
        {:else if q.kind === 'nums'}
          <div class="fields">
            {#each q.fields as f, fi}
              {@const fok = submitted && checkNumeric(nums[q.id][fi], f.a, f.tol ?? 0)}
              <label class="fld" class:right={fok} class:wrong={submitted && !fok}>
                <span>{f.label}</span>
                <input type="text" inputmode="decimal" autocomplete="off" bind:value={nums[q.id][fi]} disabled={submitted} />
                {#if f.unit}<span class="u">{f.unit}</span>{/if}
                {#if submitted}<span class="vv">{fok ? '✓' : '✕'}</span>{/if}
                {#if submitted && !fok}<span class="exp">attendu : {String(f.show ?? f.a).replace('.', ',')}</span>{/if}
              </label>
            {/each}
          </div>
        {:else if q.kind === 'list'}
          <label class="fld wide" class:right={submitted && qOk(q)} class:wrong={submitted && !qOk(q)}>
            <input
              type="text"
              autocomplete="off"
              placeholder="ex. 19 ; 20 ; 22 …"
              bind:value={lists[q.id]}
              disabled={submitted}
              aria-label="Relevés rangés du plus petit au plus grand"
            />
            {#if submitted}<span class="vv">{qOk(q) ? '✓' : '✕'}</span>{/if}
          </label>
          {#if submitted && !qOk(q)}<p class="exp">attendu : {q.a.join(' ; ').replace(/\./g, ',')}</p>{/if}
        {:else if q.kind === 'phrase'}
          <Phrase
            vd={q.phrase}
            bare
            reveal={submitted}
            onstate={(s) => {
              phr[q.id] = s;
            }}
          />
        {:else if q.kind === 'open'}
          <textarea rows="3" bind:value={texts[q.id]} disabled={submitted} placeholder="Écris ta phrase ici" aria-label="Ta réponse rédigée"></textarea>
          {#if submitted}
            <div class="model">
              <p class="mlbl">Une réponse possible</p>
              <p>{@html q.model}</p>
              <p class="mlbl">Auto-évaluation : coche ce que ta phrase contient</p>
              {#each q.criteria as c, ci}
                <label class="chk"><input type="checkbox" bind:checked={ticks[q.id][ci]} /> {c}</label>
              {/each}
            </div>
          {/if}
        {/if}

        {#if submitted && q.why}
          <p class="why">{@html q.why}</p>
        {/if}
      </section>
    {/each}
  {/key}

  {#if !submitted}
    <div class="vctl">
      <button type="button" class="p" onclick={submit}>Je rends mon auto-test</button>
      <span class="hold">{answered} / {Q.length} questions abordées · les réponses s'affichent quand tu rends.</span>
    </div>
  {:else}
    <div class="score" id={'autotest-score-' + (vd?.id ?? '')} aria-live="polite">
      <p class="big"><b>{f1(total)}</b> / {totalMax} <span>{vd?.unitTitle ?? 'points'}</span></p>
      {#each tot as c}
        <div class="row">
          <span class="nm">{c.name}</span>
          <span class="tk"><i style="width:{revealBars && c.max ? (c.got / c.max) * 100 : 0}%"></i></span>
          <span class="sc">{f1(c.got)}/{c.max}</span>
        </div>
      {/each}
      {#if bonusQ.length}<p class="bn">Bonus (hors total) : {f1(bonus)} / {bonusQ.reduce((t, q) => t + q.pts, 0)}</p>{/if}
      <p class="vd">{verdict(total / totalMax)}</p>
      <div class="vctl"><button type="button" class="gh" onclick={restart}>Recommencer l'auto-test</button></div>
    </div>
  {/if}
</div>

<style>
  .intro {
    margin: 0 0 8px;
    color: var(--dim);
    font-size: 14px;
  }
  .data {
    margin: 0 0 12px;
    padding: 10px 12px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    background: var(--surf);
    font-size: 14.5px;
  }
  .data :global(b) {
    color: var(--g);
  }
  .sec {
    font-family: var(--sm);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--g2);
    margin: 20px 0 8px;
  }
  .q {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 11px 12px;
    margin: 10px 0;
    background: color-mix(in srgb, var(--bg) 40%, transparent);
    transition:
      border-color 0.4s,
      background 0.4s;
  }
  .q.good {
    border-color: var(--g3);
    background: color-mix(in srgb, var(--g) 7%, transparent);
  }
  .q.bad {
    border-color: color-mix(in srgb, var(--red) 55%, var(--line));
  }
  .qh {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 9px;
    align-items: start;
  }
  .num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--surf3);
    color: var(--g);
    font-family: var(--sm);
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .qt {
    color: var(--tx);
  }
  .meta {
    grid-column: 2;
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: var(--sm);
    font-size: 10.5px;
    color: var(--dim2);
  }
  .cp {
    border: 1px solid var(--line2);
    border-radius: 999px;
    padding: 0 8px;
    color: var(--dim);
  }
  .opts {
    display: grid;
    gap: 6px;
    margin-top: 9px;
  }
  .opt {
    text-align: left;
    padding: 9px 12px;
    border: 1px solid var(--line2);
    border-radius: 8px;
    background: var(--surf);
    color: var(--tx);
    font-size: 14.5px;
    transition:
      border-color 0.2s,
      background 0.3s,
      transform 0.2s;
  }
  .opt.picked {
    border-color: var(--blue);
    background: color-mix(in srgb, var(--blue) 12%, var(--surf));
  }
  .opt:active:not(:disabled) {
    transform: scale(0.985);
  }
  .opt.right {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 14%, var(--surf));
  }
  .opt.wrong {
    border-color: var(--red);
    background: color-mix(in srgb, var(--red) 12%, var(--surf));
  }
  .vv {
    font-family: var(--sm);
    font-weight: 700;
  }
  .fields {
    display: grid;
    gap: 8px;
    margin-top: 9px;
  }
  .fld {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 14.5px;
    color: var(--dim);
  }
  .fld.wide {
    margin-top: 9px;
  }
  .fld input {
    width: 7.2em;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 7px;
    padding: 7px 9px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
  }
  .fld.wide input {
    width: 100%;
    max-width: 22em;
  }
  .fld.right input {
    border-color: var(--g);
  }
  .fld.wrong input {
    border-color: var(--red);
  }
  .fld.right .vv {
    color: var(--g);
  }
  .fld.wrong .vv {
    color: var(--red);
  }
  .u {
    color: var(--dim2);
  }
  .exp {
    font-size: 13px;
    color: var(--dim);
    margin: 2px 0 0;
  }
  textarea {
    width: 100%;
    margin-top: 9px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 8px;
    padding: 9px 10px;
    color: var(--tx);
    font-family: var(--sa);
    font-size: 14.5px;
    resize: vertical;
  }
  .model {
    margin-top: 9px;
    padding: 10px 12px;
    border-left: 2.5px solid var(--g3);
    border-radius: 0 8px 8px 0;
    background: color-mix(in srgb, var(--g) 6%, transparent);
    animation: rise 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .model p {
    margin: 3px 0;
  }
  .mlbl {
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--dim2);
    margin-top: 8px !important;
  }
  .chk {
    display: block;
    font-size: 14px;
    color: var(--tx);
    padding: 4px 0;
  }
  .why {
    margin: 9px 0 0;
    font-size: 13.5px;
    color: var(--dim);
    animation: rise 0.45s ease both;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
  }
  .hold {
    font-size: 12.5px;
    color: var(--dim2);
    align-self: center;
  }
  .score {
    margin-top: 16px;
    padding: 14px;
    border: 1px solid var(--g3);
    border-radius: 12px;
    background: var(--surf2);
  }
  .big {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--dim);
  }
  .big b {
    font-family: var(--sm);
    font-size: 30px;
    color: var(--g);
  }
  .row {
    display: grid;
    grid-template-columns: 6.8em 1fr 3.2em;
    align-items: center;
    gap: 9px;
    margin: 7px 0;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .tk {
    height: 9px;
    border-radius: 999px;
    background: var(--surf3);
    overflow: hidden;
  }
  .tk i {
    display: block;
    height: 100%;
    background: var(--g);
    border-radius: 999px;
    transition: width 1.1s cubic-bezier(0.34, 1.45, 0.64, 1);
  }
  .sc {
    text-align: right;
    color: var(--tx);
  }
  .bn {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--dim);
  }
  .vd {
    margin: 10px 0 0;
    color: var(--tx);
  }
</style>
