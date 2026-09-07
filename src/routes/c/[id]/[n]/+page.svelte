<script>
  import { base } from '$app/paths';
  import { blocOfCourse, bslug, chapterKey } from '$lib/utils/course-helpers.js';
  import { VIZ } from '$lib/visualizations/registry.js';
  import { markDone, setLast, done } from '$lib/stores/progress.js';
  import ChapterDrawer from '$lib/components/ChapterDrawer.svelte';
  import QuizInput from '$lib/components/QuizInput.svelte';
  import QuizMCQ from '$lib/components/QuizMCQ.svelte';

  let { data } = $props();
  let c = $derived(data.course);
  let n = $derived(data.n);
  let se = $derived(data.seance);
  let bloc = $derived(blocOfCourse(c.id, c.classe));
  let doneSet = $derived($done);

  let showComm = $state(false);
  let sectionCorrect = $state(0);
  let quizScore = $state(0);
  let quizDone = $state(false);

  let totalQ = $derived(se.steps.reduce((s, st) => s + (st.q?.length || 0), 0) + (se.quiz?.length || 0));

  $effect(() => {
    // reset per-chapter tallies when navigating between chapters
    void c.id;
    void n;
    sectionCorrect = 0;
    quizScore = 0;
    quizDone = false;
  });

  $effect(() => {
    setLast(chapterKey(c, n));
  });

  $effect(() => {
    if (totalQ === 0) {
      markDone(chapterKey(c, n));
      return;
    }
    const correct = sectionCorrect + quizScore;
    if (correct / totalQ >= 0.7) markDone(chapterKey(c, n));
  });

  function onSectionCorrect() {
    sectionCorrect += 1;
  }

  function onQuizScored(score) {
    quizScore = score;
    quizDone = true;
  }

  let prev = $derived(n > 0 ? n - 1 : null);
  let next = $derived(n < c.seances.length - 1 ? n + 1 : null);
</script>

<svelte:head>
  <title>{se.t} — {c.titre} — MrPayet</title>
</svelte:head>

<div class="chbar">
  <ChapterDrawer course={c} current={n} {doneSet} />
  <span class="chprog">Chapitre {n + 1}/{c.seances.length}</span>
</div>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/p/{bslug(c.classe)}">{c.classe}</a>
    {#if bloc}
      / <a href="{base}/bloc/{bslug(c.classe)}/{bloc.id}">{bloc.t}</a>
    {/if}
    / <a href="{base}/c/{c.id}">{c.titre}</a>
  </p>

  <p class="eyebrow">Chapitre {n + 1}</p>
  <h1>{se.t}</h1>

  {#if data.comp}
    <div class="tags">
      {#each data.comp.c as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}

  {#if se.prob}
    <div class="prob">{se.prob}</div>
  {/if}

  {#if se.pdf?.length && c.pdf}
    <div class="dl">
      <span class="dllbl">Télécharger la fiche</span>
      <div class="dllinks">
        {#each se.pdf as stem}
          <a class="dlbtn" href="{base}/fiches/{c.pdf}/{stem}.pdf" target="_blank" rel="noopener">
            {stem.endsWith('-accessible')
              ? 'Version en langue accessible (PDF)'
              : stem.endsWith('-standard')
                ? 'Version standard (PDF)'
                : 'Télécharger (PDF)'}
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <div class="body">
    {#each se.steps as st, si}
      <section class="step">
        <h2 class="st-t"><span class="stn">{si + 1}</span> {st.t}</h2>
        {#if st.txt}
          <p class="txt">{st.txt}</p>
        {/if}
        {#if st.doc}
          <div class="tblwrap">
            <table>
              <thead>
                <tr>
                  {#each st.doc.h as h}
                    <th>{h}</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each st.doc.r as row}
                  <tr>
                    {#each row as cell}
                      <td>{cell}</td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        {#if st.apport}
          <p class="apport">{@html st.apport}</p>
        {/if}
        {#if st.viz && VIZ[st.viz]}
          {#key c.id + '/' + n + '/' + si}
            <div class="viz-host">
              <svelte:component this={VIZ[st.viz]} vd={st.vd} />
            </div>
          {/key}
        {/if}
        {#if st.q}
          <div class="questions">
            {#each st.q as q}
              <QuizInput question={q} onCorrect={onSectionCorrect} />
            {/each}
          </div>
        {/if}
      </section>
    {/each}
  </div>

  {#if se.trace}
    <div class="trace">
      <p class="tracelbl">Trace écrite</p>
      <p>{@html se.trace}</p>
    </div>
  {/if}

  {#if data.comp}
    <div class="comm">
      <p class="tracelbl">Communiquer</p>
      <p class="commq">{data.comp.comm}</p>
      <button type="button" class="reveal" onclick={() => (showComm = !showComm)}>
        {showComm ? 'Masquer' : 'Voir'} une réponse possible
      </button>
      {#if showComm}
        <p class="comma">{data.comp.commA}</p>
      {/if}
    </div>
  {/if}

  {#if se.quiz?.length}
    <div class="quizsect">
      <p class="tracelbl">Quiz</p>
      <QuizMCQ quiz={se.quiz} onScored={onQuizScored} />
    </div>
  {/if}

  <div class="nav">
    {#if prev !== null}
      <a class="navlink" href="{base}/c/{c.id}/{prev}">← {c.seances[prev].t}</a>
    {:else}
      <span></span>
    {/if}
    {#if next !== null}
      <a class="navlink right" href="{base}/c/{c.id}/{next}">{c.seances[next].t} →</a>
    {:else}
      <a class="navlink right" href="{base}/c/{c.id}">Retour au cours →</a>
    {/if}
  </div>
</div>

<style>
  .chbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: var(--surf2);
    border-bottom: 1px solid var(--line);
  }
  .chprog {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 32px 20px 80px;
  }
  .crumb {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
  }
  .crumb a {
    color: var(--dim);
  }
  .eyebrow {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 14px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .tag {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
    border: 1px solid var(--line2);
    border-radius: 20px;
    padding: 2px 9px;
  }
  .prob {
    margin-top: 18px;
    padding: 14px 16px;
    border: 1px solid var(--g3);
    border-radius: var(--r);
    background: var(--surf2);
    color: var(--tx);
  }
  .dl {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .dllbl {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .dllinks {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .dlbtn {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g);
    border: 1px solid var(--g3);
    border-radius: 6px;
    padding: 6px 12px;
  }
  .dlbtn:hover {
    background: var(--surf2);
  }
  .body {
    margin-top: 28px;
    display: grid;
    gap: 32px;
  }
  .st-t {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
  }
  .stn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--surf3);
    color: var(--g);
    font-family: var(--sm);
    font-size: 12px;
    flex-shrink: 0;
  }
  .txt {
    margin-top: 10px;
    color: var(--dim);
  }
  .tblwrap {
    margin-top: 12px;
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 13px;
  }
  th,
  td {
    border: 1px solid var(--line);
    padding: 6px 10px;
    text-align: left;
    white-space: nowrap;
  }
  th {
    background: var(--surf3);
    color: var(--dim);
    font-family: var(--sm);
    font-size: 11px;
    text-transform: uppercase;
  }
  td {
    color: var(--tx);
  }
  .apport {
    margin-top: 12px;
    padding: 12px 14px;
    border-left: 2px solid var(--g3);
    background: var(--surf);
    color: var(--dim);
  }
  .viz-host {
    margin-top: 14px;
  }
  .questions {
    margin-top: 14px;
  }
  .trace,
  .comm,
  .quizsect {
    margin-top: 36px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
  }
  .tracelbl {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 10px;
  }
  .trace p:not(.tracelbl) {
    color: var(--tx);
    line-height: 1.6;
  }
  .commq {
    color: var(--tx);
  }
  .reveal {
    margin-top: 10px;
    background: none;
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 6px 12px;
    color: var(--dim);
    font-family: var(--sm);
    font-size: 12px;
  }
  .comma {
    margin-top: 10px;
    color: var(--dim);
    font-style: italic;
  }
  .nav {
    display: flex;
    justify-content: space-between;
    margin-top: 44px;
  }
  .navlink {
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
    max-width: 45%;
  }
  .navlink.right {
    text-align: right;
    color: var(--g2);
  }
</style>
