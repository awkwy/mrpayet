<script>
  import { onMount } from 'svelte';
  import { parseCell, effectiveRows, statsOf, compareToExpected, diagnose } from './stat1.js';

  /* Calculatrice NumWorks — statistique à UNE variable (V1 = valeurs, N1 = effectifs).
   *
   * Même esprit que Shell.svelte (régression à deux variables) : recodée aux
   * couleurs du site, jamais le firmware réel. Différence voulue : l'onglet
   * Stats affiche ce que l'élève a RÉELLEMENT tapé, erreurs comprises (N1 oublié
   * → effectif total 5 au lieu de 10), comme la vraie machine ; le contrôle
   * « mon effectif total est le même que dans mon tableau » est une ligne à part,
   * sous la machine, qui explique l'écart.
   *
   * `calc` : { series:[[valeur, effectif],…], start:'home'|'data'|'graph'|'stats'|'calculs',
   *            stale?:bool (ancien tableau à vider), prefill?:bool, log?:bool (carnet de lecture
   *            du graphique), calculs?:{expr, expect, say}, unit:'personnes' }
   * Mode guidé (par défaut) : bulle de consigne avec les touches, cases colorées. Mode libre : rien
   * que la machine et le contrôle.
   * Hors programme CAP : médiane et quartiles — repliés dans « pour les curieux ». */

  let { calc } = $props();

  const EXPECTED = calc.series || [];
  const UNIT = calc.unit || 'personnes';
  const START = calc.start || 'home';
  const MAXROWS = 12;
  const uid = 'nw' + Math.random().toString(36).slice(2, 7);

  const blank = () => ({ v: '', n: '' });
  const full = () => EXPECTED.map(([v, n]) => ({ v: String(v), n: String(n) }));
  function initialRows() {
    if (calc.prefill ?? (START === 'graph' || START === 'stats')) return [...full(), blank()];
    const base = calc.stale
      ? [
          { v: '3', n: '1' },
          { v: '7', n: '1' },
          { v: '9', n: '2' }
        ]
      : [];
    while (base.length < EXPECTED.length + 1) base.push(blank());
    return base;
  }

  let screen = $state(START);
  let rows = $state(initialRows());
  let guided = $state(true);
  let cleared = $state(!calc.stale);
  let menuOpen = $state(false);
  let sel = $state(null); // index de la barre choisie
  let seen = $state({}); // valeurs lues sur le graphique
  let grown = $state(false);
  let reduced = $state(false);
  let visitedStats = $state(START === 'stats');
  let host;

  // ----- Calculs -----
  let expr = $state('');
  let result = $state(null); // { frac, dec }
  let calcDone = $state(false);

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => (grown = true));
  });

  $effect(() => {
    // les barres repartent de zéro à chaque ouverture de l'onglet Graphique
    if (screen === 'graph') {
      grown = false;
      const id = requestAnimationFrame(() => requestAnimationFrame(() => (grown = true)));
      return () => cancelAnimationFrame(id);
    }
  });

  let stats = $derived(statsOf(rows));
  let cmp = $derived(compareToExpected(rows, EXPECTED));
  let diag = $derived(diagnose(rows, EXPECTED));
  let want = $derived(statsOf(EXPECTED.map(([v, n]) => ({ v: String(v), n: String(n) }))));

  // barres du graphique : une barre par valeur, rangées
  let bars = $derived.by(() => {
    const agg = new Map();
    for (const r of effectiveRows(rows)) if (r.n > 0) agg.set(r.v, (agg.get(r.v) || 0) + r.n);
    return [...agg.entries()].sort((a, b) => a[0] - b[0]).map(([v, n]) => ({ v, n }));
  });
  let ymax = $derived(Math.max(1, ...bars.map((b) => b.n)));
  let total = $derived(bars.reduce((s, b) => s + b.n, 0));

  const dev = (x) => String(Math.round(x * 1e4) / 1e4);
  const comma = (x) => dev(x).replace('.', ',');

  function setCell(i, key, value) {
    rows[i][key] = value;
    if (i === rows.length - 1 && key === 'v' && value.trim() !== '' && rows.length < MAXROWS) rows.push(blank());
  }
  function onKey(e, i, key) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const next = host.querySelector(`[data-r="${i + 1}"][data-c="${key}"]`);
    if (next) next.focus();
  }
  function cellState(i, key) {
    if (!guided || !EXPECTED[i] || (calc.stale && !cleared)) return ''; // ancien tableau : on ne colore rien avant de l'avoir effacé
    const raw = (rows[i]?.[key] ?? '').trim();
    if (key === 'n' && raw === '') return '';
    if (raw === '') return '';
    const got = parseCell(raw);
    return got === EXPECTED[i][key === 'v' ? 0 : 1] ? 'ok' : 'no';
  }
  function clearTable() {
    rows = [blank(), blank(), blank(), blank(), blank(), blank()];
    cleared = true;
    menuOpen = false;
  }
  function go(s) {
    screen = s;
    menuOpen = false;
    if (s === 'stats') visitedStats = true;
    if (s === 'calculs' && calc.calculs && !expr) expr = '';
  }

  // ----- graphique : sélection d'une barre -----
  function pick(i) {
    if (!bars.length) return;
    sel = Math.max(0, Math.min(bars.length - 1, i));
    const b = bars[sel];
    seen[b.v] = true;
  }
  function stepSel(d) {
    pick(sel === null ? 0 : sel + d);
  }

  // ----- Calculs -----
  const KEYS = [
    ['7', '8', '9', 'frac'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['0', '.', 'del', '+']
  ];
  function press(k) {
    result = null;
    calcDone = false;
    if (k === 'del') expr = expr.slice(0, -1);
    else if (k === 'frac') expr += '/';
    else if (expr.length < 24) expr += k;
  }
  function tokens(s) {
    return s.replace(/×/g, '*').replace(/−/g, '-');
  }
  function evaluate(s) {
    const t = tokens(s);
    if (!/^[0-9.+\-*/]+$/.test(t)) return null;
    let i = 0;
    const num = () => {
      const m = /^\d*\.?\d+|^\d+\.?/.exec(t.slice(i));
      if (!m) throw new Error('num');
      i += m[0].length;
      return Number(m[0]);
    };
    const term = () => {
      let a = num();
      while (t[i] === '*' || t[i] === '/') {
        const op = t[i++];
        const b = num();
        a = op === '*' ? a * b : a / b;
      }
      return a;
    };
    try {
      let a = term();
      while (t[i] === '+' || t[i] === '-') {
        const op = t[i++];
        const b = term();
        a = op === '+' ? a + b : a - b;
      }
      return i === t.length && Number.isFinite(a) ? a : null;
    } catch {
      return null;
    }
  }
  function asFraction(x) {
    if (Number.isInteger(x)) return null;
    for (let d = 2; d <= 100; d++) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) {
        const g = gcd(Math.abs(n), d);
        return `${n / g}/${d / g}`;
      }
    }
    return null;
  }
  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }
  function exe() {
    const v = evaluate(expr);
    if (v === null) {
      result = { err: true };
      return;
    }
    const f = asFraction(v);
    result = { frac: f, dec: dev(v), val: v };
    calcDone = !!calc.calculs && Math.abs(v - calc.calculs.expect) < 1e-9;
  }
  // 2/10 → fraction empilée (chiffres uniquement : aucune entrée libre dans le HTML)
  function exprHtml(s) {
    const FRAC = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/;
    return s
      .split(/(\d+(?:\.\d+)?\/\d+(?:\.\d+)?)/)
      .map((part) => {
        const m = FRAC.exec(part);
        return m ? `<span class="fr"><span>${m[1]}</span><span>${m[2]}</span></span>` : part.replace(/\//g, '⁄');
      })
      .join('');
  }

  // ----- consigne -----
  let staleActive = $derived(!!calc.stale && !cleared);
  let coach = $derived.by(() => {
    if (!guided) return null;
    if (screen === 'home') {
      return {
        say: calc.calculs && START === 'home' && !calc.series?.length
          ? 'Appuie sur <b>Home</b>, puis choisis <b>Calculs</b>.'
          : 'Appuie sur <b>Home</b>, puis choisis l’application <b>Statistiques</b> avec les flèches. Appuie sur <b>OK</b>.',
        keys: ['Home', '↓', 'OK']
      };
    }
    if (screen === 'calculs') {
      if (!calc.calculs) return { say: 'Tape ton calcul, puis appuie sur <b>EXE</b>.', keys: ['EXE'] };
      if (calcDone) return { say: calc.calculs.done || 'Bien joué. Lis le nombre décimal à côté de la fraction.', keys: [] };
      return { say: calc.calculs.say, keys: ['EXE'] };
    }
    if (screen === 'data') {
      if (staleActive)
        return {
          say: 'Il y a déjà des nombres ? Monte <b>↑</b> sur « Valeurs V1 », appuie sur <b>OK</b>, choisis « Effacer le tableau V1/N1 ».',
          keys: ['↑', 'OK']
        };
      for (let i = 0; i < EXPECTED.length; i++) {
        if (parseCell(rows[i]?.v) !== EXPECTED[i][0])
          return { say: `Dans « Valeurs V1 », tape <b>${EXPECTED[i][0]}</b>. Appuie sur <b>OK</b> : le curseur descend tout seul.`, keys: ['OK'] };
      }
      for (let i = 0; i < EXPECTED.length; i++) {
        const raw = (rows[i]?.n ?? '').trim();
        const n = raw === '' ? 1 : parseCell(raw);
        if (n !== EXPECTED[i][1])
          return { say: `Va dans « Effectifs N1 » avec <b>→</b>. Ligne ${EXPECTED[i][0]} : tape l’effectif <b>${EXPECTED[i][1]}</b>, puis <b>OK</b>.`, keys: ['→', 'OK'] };
      }
      if (cmp.ok)
        return { say: 'Le tableau est complet. Monte <b>↑</b> jusqu’aux onglets, va sur « Stats » avec <b>→</b>, puis <b>OK</b>.', keys: ['↑', '→', 'OK'] };
      return { say: 'Compare ton tableau à celui de la fiche : une case est différente.', keys: [] };
    }
    if (screen === 'stats')
      return { say: 'Descends avec <b>↓</b>. Lis « Effectif total » et « Moyenne ». Compare l’effectif total à ton tableau.', keys: ['↓'] };
    if (screen === 'graph')
      return sel === null
        ? { say: 'Tu vois des barres. Appuie sur <b>OK</b> : une barre change de couleur (elle devient rouge sur ta NumWorks).', keys: ['OK'] }
        : { say: 'Change de barre avec <b>←</b> et <b>→</b>. En bas, lis « Effectif » et « Fréquence » : ils parlent de la barre choisie.', keys: ['←', '→'] };
    return null;
  });

  // contrôle sous la machine
  let verdict = $derived.by(() => {
    if (!visitedStats) return { state: 'wait', text: 'Ouvre l’onglet Stats pour contrôler.' };
    if (!stats) return { state: 'no', text: 'L’écran ne montre aucune donnée : retourne dans Données.' };
    if (cmp.ok) return { state: 'ok', text: `Effectif total ${stats.N} : c’est le même nombre que dans mon tableau.` };
    const why = {
      'n1-untouched': `Effectif total ${stats.N} au lieu de ${want.N} : les effectifs N1 sont restés à 1. Retourne dans Données et tape les effectifs de ton tableau.`,
      swapped: `Effectif total ${stats.N} au lieu de ${want.N} : les nombres de personnes sont dans N1 et les effectifs dans V1. Relis les noms des colonnes.`,
      stale: `Effectif total ${stats.N} au lieu de ${want.N} : d’anciens nombres sont restés dans le tableau. Efface le tableau, puis retape.`,
      missing: `Effectif total ${stats.N} au lieu de ${want.N} : il manque des jours. Recompte ton tableau, ligne par ligne.`,
      empty: 'Aucune donnée.',
      other: `Effectif total ${stats.N} au lieu de ${want.N} : compare ton écran à ton tableau, ligne par ligne.`
    };
    return { state: 'no', text: why[diag] || why.other };
  });

  const logRows = $derived(EXPECTED.map(([v, n]) => ({ v, n, read: !!seen[v] })));
  const barX = (i) => 34 + (i + 0.5) * ((284 - 34) / Math.max(1, bars.length));
  const bw = $derived(Math.min(34, ((284 - 34) / Math.max(1, bars.length)) * 0.55));
  const barH = (n) => (n / ymax) * 112;
</script>

<div class="nwx" bind:this={host}>
  <div class="head">
    <label class="mode">
      <input type="checkbox" bind:checked={guided} />
      <span>Mode guidé</span>
    </label>
    <span class="unit">{UNIT}</span>
  </div>

  {#if coach}
    <div class="coach" role="status">
      <span class="coachtxt">{@html coach.say}</span>
      {#if coach.keys.length}
        <span class="keys" aria-hidden="true">
          {#each coach.keys as k}<kbd>{k}</kbd>{/each}
        </span>
      {/if}
    </div>
  {/if}

  <div class="dev">
    <div class="bar">
      <button type="button" class="homebtn" onclick={() => go('home')} aria-label="Home : retour à la liste des applications">⌂ Home</button>
      {#if screen === 'data' || screen === 'graph' || screen === 'stats'}
        <div class="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={screen === 'data'} class:on={screen === 'data'} onclick={() => go('data')}>Données</button>
          <button type="button" role="tab" aria-selected={screen === 'graph'} class:on={screen === 'graph'} onclick={() => go('graph')}>Graphique</button>
          <button type="button" role="tab" aria-selected={screen === 'stats'} class:on={screen === 'stats'} onclick={() => go('stats')}>Stats</button>
        </div>
      {:else if screen === 'calculs'}
        <span class="appname">Calculs</span>
      {/if}
    </div>

    <div class="screen">
      {#if screen === 'home'}
        <div class="tiles">
          <button type="button" class="tile" class:pulse={guided && !calc.calculs} onclick={() => go('data')}>
            <span class="ico" aria-hidden="true">▮▮▯</span>Statistiques
          </button>
          <button type="button" class="tile" class:pulse={guided && !!calc.calculs && !calc.series?.length} onclick={() => go('calculs')}>
            <span class="ico" aria-hidden="true">1⁄2</span>Calculs
          </button>
        </div>
      {:else if screen === 'data'}
        <table class="tbl">
          <thead>
            <tr>
              <th class="idx"></th>
              <th>
                <button type="button" class="hdr" aria-haspopup="menu" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}>
                  Valeurs V1 ▾
                </button>
              </th>
              <th>Effectifs N1</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row, i (i)}
              <tr>
                <td class="idx">{i + 1}</td>
                <td>
                  <input
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    data-r={i}
                    data-c="v"
                    aria-label={`Valeur V1, ligne ${i + 1}`}
                    value={row.v}
                    class={cellState(i, 'v')}
                    oninput={(e) => setCell(i, 'v', e.currentTarget.value)}
                    onkeydown={(e) => onKey(e, i, 'v')}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    data-r={i}
                    data-c="n"
                    aria-label={`Effectif N1, ligne ${i + 1}`}
                    placeholder={row.v.trim() !== '' ? '1' : ''}
                    value={row.n}
                    class={cellState(i, 'n')}
                    oninput={(e) => setCell(i, 'n', e.currentTarget.value)}
                    onkeydown={(e) => onKey(e, i, 'n')}
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if menuOpen}
          <div class="menu" role="menu">
            <button type="button" role="menuitem" class:pulse={guided && staleActive} onclick={clearTable}>Effacer le tableau V1/N1</button>
            <button type="button" role="menuitem" onclick={() => (menuOpen = false)}>Annuler</button>
          </div>
        {/if}
      {:else if screen === 'stats'}
        {#if !stats}
          <p class="empty">Aucune donnée. Retourne dans l’onglet Données.</p>
        {:else}
          <dl class="stats">
            <div class="hl"><dt>Effectif total</dt><dd>{dev(stats.N)}</dd></div>
            <div><dt>Minimum</dt><dd>{dev(stats.min)}</dd></div>
            <div><dt>Maximum</dt><dd>{dev(stats.max)}</dd></div>
            <div class="hl"><dt>Moyenne</dt><dd>{dev(stats.mean)}</dd></div>
          </dl>
          <details class="curious">
            <summary>Plus bas dans la liste : pour les curieux</summary>
            <p>Médiane, quartiles et étendue ne sont <b>pas au programme du CAP</b> : tu peux les ignorer.</p>
            <dl class="stats dim">
              <div><dt>Étendue</dt><dd>{dev(stats.range)}</dd></div>
              <div><dt>Médiane</dt><dd>{dev(stats.median)}</dd></div>
              <div><dt>Q1</dt><dd>{dev(stats.q1)}</dd></div>
              <div><dt>Q3</dt><dd>{dev(stats.q3)}</dd></div>
            </dl>
          </details>
        {/if}
      {:else if screen === 'graph'}
        {#if !bars.length}
          <p class="empty">Rien à dessiner. Retourne dans l’onglet Données.</p>
        {:else}
          <svg viewBox="0 0 300 168" class="chart" role="img" aria-label={`Graphique en barres : ${bars.map((b) => `${b.v} → effectif ${b.n}`).join(', ')}`}>
            {#each Array.from({ length: Math.ceil(ymax) + 1 }, (_, k) => k) as k}
              <line x1="34" x2="288" y1={132 - (k / ymax) * 112} y2={132 - (k / ymax) * 112} class="grid" />
              <text x="28" y={135 - (k / ymax) * 112} text-anchor="end" class="tick">{k}</text>
            {/each}
            {#each bars as b, i (b.v)}
              <g>
                <rect
                  class="barr"
                  class:sel={sel === i}
                  x={barX(i) - bw / 2}
                  y={132 - barH(b.n)}
                  width={bw}
                  height={barH(b.n)}
                  rx="3"
                  style:transform={grown || reduced ? 'scaleY(1)' : 'scaleY(0)'}
                  style:transition-delay={reduced ? '0ms' : `${i * 70}ms`}
                />
                <text x={barX(i)} y="148" text-anchor="middle" class="tick x">{b.v}</text>
                <rect
                  class="hit"
                  x={barX(i) - bw / 2 - 4}
                  y="10"
                  width={bw + 8}
                  height="122"
                  tabindex="0"
                  role="button"
                  aria-label={`Barre ${b.v}`}
                  onclick={() => pick(i)}
                  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(i))}
                />
              </g>
            {/each}
          </svg>
          <div class="readbar">
            {#if sel === null}
              <span class="dimt">OK pour choisir une barre</span>
            {:else}
              <span>Valeur <b>{bars[sel].v}</b></span>
              <span>Effectif <b>{bars[sel].n}</b></span>
              <span>Fréquence <b>{total ? dev(bars[sel].n / total) : 0}</b></span>
            {/if}
          </div>
          <div class="arrows">
            <button type="button" onclick={() => stepSel(-1)} aria-label="Barre précédente">←</button>
            <button type="button" class="ok" onclick={() => (sel === null ? pick(0) : pick(sel))}>OK</button>
            <button type="button" onclick={() => stepSel(1)} aria-label="Barre suivante">→</button>
          </div>
        {/if}
      {:else if screen === 'calculs'}
        <div class="line">
          <div class="expr" aria-live="polite">{@html exprHtml(expr) || '<span class="dimt">…</span>'}</div>
          {#if result}
            <div class="res">
              {#if result.err}
                <span class="errt">Syntaxe</span>
              {:else if result.frac}
                <span class="fr"><span>{result.frac.split('/')[0]}</span><span>{result.frac.split('/')[1]}</span></span>
                <span> = {result.dec}</span>
              {:else}
                <span>{result.dec}</span>
              {/if}
            </div>
          {/if}
        </div>
        <div class="pad">
          {#each KEYS as line}
            {#each line as k}
              <button type="button" class="key" onclick={() => press(k)} aria-label={k === 'frac' ? 'Touche fraction : numérateur sur dénominateur' : k === 'del' ? 'Effacer le dernier signe' : k}>
                {#if k === 'frac'}<span class="fr"><span>▫</span><span>▫</span></span>{:else if k === 'del'}⌫{:else}{k}{/if}
              </button>
            {/each}
          {/each}
          <button type="button" class="key exe" onclick={exe}>EXE</button>
        </div>
        {#if result && !result.err}
          <p class="note">L’écran écrit un <b>point</b> ({result.dec}) : toi, écris une <b>virgule</b> ({result.dec.replace('.', ',')}).</p>
        {/if}
      {/if}
    </div>
  </div>

  {#if calc.series?.length && screen !== 'calculs' && screen !== 'home'}
    <div class="check" class:ok={verdict.state === 'ok'} class:no={verdict.state === 'no'} role="status">
      <span class="ck" aria-hidden="true">{verdict.state === 'ok' ? '✓' : verdict.state === 'no' ? '✕' : '○'}</span>
      <span><b>Je vérifie.</b> {verdict.text}</span>
    </div>
  {/if}

  {#if calc.log}
    <table class="log">
      <caption>Mon carnet de lecture : ce que je lis sur chaque barre</caption>
      <thead>
        <tr><th>Valeur</th><th>Effectif</th><th>Fréquence</th></tr>
      </thead>
      <tbody>
        {#each logRows as r}
          <tr class:seen={r.read}>
            <td>{r.v}</td>
            <td class="rv">{r.read ? r.n : '?'}</td>
            <td class="rv">{r.read ? comma(r.n / (want?.N || 1)) : '?'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .nwx {
    max-width: 380px;
    margin: 14px auto 0;
    font-family: var(--sa);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
    margin-bottom: 8px;
  }
  .mode {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
    min-height: 28px;
  }
  .mode input {
    accent-color: var(--g);
    width: 16px;
    height: 16px;
  }
  .unit {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--dim2);
  }
  .coach {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    background: color-mix(in srgb, var(--g) 7%, transparent);
    border-left: 2.5px solid var(--g3);
    border-radius: 0 8px 8px 0;
    padding: 9px 12px;
    margin-bottom: 10px;
    font-size: 13.5px;
    line-height: 1.45;
    color: var(--dim);
    animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .coach :global(b) {
    color: var(--tx);
  }
  .keys {
    display: inline-flex;
    gap: 4px;
    flex-shrink: 0;
  }
  kbd {
    font-family: var(--sm);
    font-size: 11px;
    padding: 3px 7px;
    border: 1px solid var(--line2);
    border-bottom-width: 3px;
    border-radius: 6px;
    background: var(--surf3);
    color: var(--tx);
  }
  .dev {
    border: 1px solid var(--line2);
    border-radius: 14px;
    background: var(--surf2);
    overflow: hidden;
  }
  .bar {
    display: flex;
    align-items: stretch;
    background: var(--surf3);
    border-bottom: 1px solid var(--line);
  }
  .homebtn {
    border: 0;
    background: transparent;
    color: var(--dim);
    padding: 9px 12px;
    font-family: var(--sm);
    font-size: 11px;
    border-right: 1px solid var(--line);
    min-height: 40px;
  }
  .tabs {
    display: flex;
    flex: 1;
  }
  .tabs button {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--dim);
    font-family: var(--sm);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 2px solid transparent;
    min-height: 40px;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .tabs button.on {
    color: var(--tx);
    background: var(--surf2);
    border-bottom-color: var(--g);
  }
  .appname {
    align-self: center;
    padding: 0 12px;
    font-family: var(--sm);
    font-size: 11px;
    color: var(--tx);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .screen {
    padding: 12px;
    min-height: 200px;
    position: relative;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .tile {
    display: grid;
    gap: 8px;
    justify-items: center;
    padding: 18px 8px 14px;
    background: var(--surf3);
    border: 1px solid var(--line2);
    border-radius: 12px;
    color: var(--tx);
    font-size: 13px;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s;
  }
  .tile:active {
    transform: scale(0.95);
  }
  .tile .ico {
    font-family: var(--sm);
    font-size: 19px;
    color: var(--g);
  }
  .pulse {
    border-color: var(--g);
    animation: halo 1.6s ease-in-out infinite;
  }
  .tbl {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--sm);
    font-size: 13px;
  }
  .tbl th {
    font-weight: 400;
    font-size: 10.5px;
    color: var(--dim);
    text-align: right;
    padding: 2px 4px 6px;
  }
  .tbl td {
    padding: 2px 4px;
    border-bottom: 1px solid var(--line);
  }
  .idx {
    color: var(--dim2);
    width: 22px;
    text-align: left !important;
    font-size: 11px;
  }
  .hdr {
    background: none;
    border: 1px dashed var(--line2);
    border-radius: 6px;
    color: var(--dim);
    font-family: var(--sm);
    font-size: 10.5px;
    padding: 4px 6px;
  }
  input[type='text'] {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
    padding: 6px 8px;
    text-align: right;
    min-height: 32px;
  }
  input[type='text']::placeholder {
    color: var(--dim2);
  }
  input[type='text'].ok {
    border-color: var(--g3);
  }
  input[type='text'].no {
    border-color: var(--red);
  }
  .menu {
    position: absolute;
    top: 38px;
    left: 30px;
    display: grid;
    background: var(--surf3);
    border: 1px solid var(--line2);
    border-radius: 8px;
    overflow: hidden;
    z-index: 3;
    animation: pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .menu button {
    background: none;
    border: 0;
    border-bottom: 1px solid var(--line);
    color: var(--tx);
    text-align: left;
    padding: 10px 12px;
    font-size: 12.5px;
    min-height: 40px;
  }
  .stats {
    display: grid;
    gap: 2px;
    margin: 0;
    font-family: var(--sm);
    font-size: 13px;
  }
  .stats > div {
    display: flex;
    justify-content: space-between;
    padding: 7px 8px;
    border-radius: 6px;
  }
  .stats > .hl {
    background: var(--surf3);
  }
  .stats dt {
    color: var(--tx);
  }
  .stats dd {
    margin: 0;
    color: var(--g2);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .stats.dim dd {
    color: var(--dim);
    font-weight: 400;
  }
  .curious {
    margin-top: 10px;
    font-size: 12px;
    color: var(--dim);
    font-family: var(--sm);
  }
  .curious summary {
    cursor: pointer;
    color: var(--dim2);
  }
  .empty {
    color: var(--dim);
    text-align: center;
    padding: 36px 8px;
    font-size: 13px;
  }
  .chart {
    width: 100%;
    height: auto;
    display: block;
  }
  .grid {
    stroke: var(--line);
    stroke-width: 1;
  }
  .tick {
    fill: var(--dim2);
    font-family: var(--sm);
    font-size: 9px;
  }
  .tick.x {
    fill: var(--dim);
    font-size: 11px;
  }
  .barr {
    fill: var(--g);
    transform-box: fill-box;
    transform-origin: 50% 100%;
    transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.2s, height 0.5s, y 0.5s;
  }
  .barr.sel {
    fill: var(--blue);
  }
  .hit {
    fill: transparent;
    cursor: pointer;
  }
  .hit:focus-visible {
    stroke: var(--g);
    stroke-width: 2;
  }
  .readbar {
    display: flex;
    gap: 14px;
    justify-content: center;
    font-family: var(--sm);
    font-size: 12.5px;
    color: var(--dim);
    min-height: 26px;
    align-items: center;
  }
  .readbar b {
    color: var(--blue);
    font-size: 14px;
  }
  .dimt {
    color: var(--dim2);
  }
  .arrows {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 6px;
  }
  .arrows button {
    min-width: 52px;
    min-height: 42px;
    border: 1px solid var(--line2);
    border-bottom-width: 3px;
    border-radius: 10px;
    background: var(--surf3);
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
  }
  .arrows .ok {
    background: var(--g);
    border-color: var(--g);
    color: #04120a;
    font-weight: 700;
  }
  .line {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 10px 12px;
    min-height: 74px;
    font-family: var(--sm);
  }
  .expr {
    font-size: 17px;
    color: var(--tx);
    min-height: 34px;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .res {
    text-align: right;
    font-size: 18px;
    color: var(--g);
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    align-items: center;
    animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .errt {
    color: var(--red);
  }
  .pad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 10px;
  }
  .key {
    min-height: 42px;
    border: 1px solid var(--line2);
    border-bottom-width: 3px;
    border-radius: 9px;
    background: var(--surf3);
    color: var(--tx);
    font-family: var(--sm);
    font-size: 15px;
    transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .key:active {
    transform: translateY(2px) scale(0.96);
  }
  .key.exe {
    grid-column: 1 / -1;
    background: var(--g);
    border-color: var(--g);
    color: #04120a;
    font-weight: 700;
  }
  .note {
    font-size: 12px;
    color: var(--dim);
    margin: 8px 0 0;
  }
  .check {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    margin-top: 10px;
    padding: 9px 12px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--dim);
    transition: border-color 0.3s, background 0.3s;
  }
  .check b {
    color: var(--tx);
  }
  .check.ok {
    border-color: var(--g3);
    background: color-mix(in srgb, var(--g) 8%, transparent);
  }
  .check.no {
    border-color: var(--red);
    background: color-mix(in srgb, var(--red) 8%, transparent);
  }
  .ck {
    font-family: var(--sm);
    font-weight: 700;
    min-width: 14px;
  }
  .check.ok .ck {
    color: var(--g);
  }
  .check.no .ck {
    color: var(--red);
  }
  .log {
    width: 100%;
    margin-top: 12px;
    border-collapse: collapse;
    font-family: var(--sm);
    font-size: 12.5px;
  }
  .log caption {
    text-align: left;
    color: var(--dim);
    margin-bottom: 6px;
  }
  .log th,
  .log td {
    padding: 5px 8px;
    border-bottom: 1px solid var(--line);
    text-align: center;
  }
  .log th {
    color: var(--dim2);
    font-weight: 400;
  }
  .log .rv {
    color: var(--dim2);
    transition: color 0.4s;
  }
  .log tr.seen .rv {
    color: var(--blue);
    font-weight: 700;
    animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes halo {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--g) 40%, transparent);
    }
    50% {
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--g) 0%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .coach,
    .menu,
    .res,
    .log tr.seen .rv,
    .pulse {
      animation: none;
    }
    .barr {
      transition: none;
    }
  }
</style>
