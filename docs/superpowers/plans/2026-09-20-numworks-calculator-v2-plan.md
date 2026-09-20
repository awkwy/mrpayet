# NumWorks Calculator v2 (Interactive Entry) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the NumWorks calculator steps from two scroll-revealed, pre-filled screens into one persistent widget per exercise where the student types their own data (validated as they go) and switches between Données/Graphique themselves.

**Architecture:** `Shell.svelte` becomes the single owner of both the correct dataset and the student's in-progress typed values; it derives per-cell correctness with a new pure helper (`entry-state.js`, reusing the site's existing `checkNumeric`) and only ever hands `DataScreen`/`GraphScreen` what they need to render — never the answer key itself to `DataScreen`.

**Tech Stack:** SvelteKit, Svelte 5 runes (`$state`, `$derived`, `$props`), vitest.

**Spec:** `docs/superpowers/specs/2026-09-20-numworks-calculator-v2-design.md` (on branch `fm/mrpayet-calc-v2-design`, PR #46 — read it before starting; this plan implements it task by task).

## Global Constraints

- `calc` step field: `{dataset, cols, reg}` — no `screen` field (spec "Data model").
- Validation reuses `checkNumeric` from `src/lib/utils/answer-check.js`, tolerance 0 (exact match against the exercise's dataset) — never reimplement numeric comparison.
- `DataScreen.svelte` must never receive the correct dataset values, only a derived per-cell state array (spec "Component architecture" — this is a hard boundary, not a style preference).
- No on-screen graphical keypad. Each cell is an ordinary `<input inputmode="decimal">` plus the `QuizInput.svelte`-style `±` button when the correct value is negative (spec "Data entry").
- `npm test` and `npm run build` must both stay green after every task.
- Every visual task (`Shell.svelte`, `DataScreen.svelte`, `GraphScreen.svelte`) needs real-browser screenshot verification before being considered done — this environment has no Chrome by default; use the chromium workaround (`/usr/bin/chromium --headless=new --remote-debugging-port=9333 --remote-debugging-address=127.0.0.1 --no-sandbox --disable-gpu about:blank &`, then pass `CHROME_DEVTOOLS_AXI_BROWSER_URL=http://127.0.0.1:9333` on every `chrome-devtools-axi` call — see project memory "env-infra-blockers" for the full sequence, `stop` → `start` → `open`/`selectpage`).

---

### Task 1: `entry-state.js` — pure per-cell validation logic

**Files:**
- Create: `src/lib/numworks/entry-state.js`
- Test: `src/lib/numworks/entry-state.test.js`

**Interfaces:**
- Consumes: `checkNumeric(value, answer, tol = 0)` from `src/lib/utils/answer-check.js` (existing, unchanged — returns `true`/`false`).
- Produces:
  - `buildEntryState(points, typed)` → `Array<Array<{state: 'ok'|'no'|null, neg: boolean}>>`, same shape as `points` (rows × 2 cols).
  - `entryComplete(entryState)` → `boolean`, `true` only when every cell's `state` is `'ok'`.
  - Both are consumed by `Shell.svelte` in Task 4 and by `DataScreen.svelte` in Task 2 (via the `entryState` it receives — `DataScreen` never calls these functions itself, only renders their output).

- [ ] **Step 1: Write the failing tests**

```js
// src/lib/numworks/entry-state.test.js
import { describe, expect, it } from 'vitest';
import { buildEntryState, entryComplete } from './entry-state.js';

describe('buildEntryState', () => {
  it('marque une case non touchée comme state=null', () => {
    const state = buildEntryState([[1, 15.5]], [['', '']]);
    expect(state).toEqual([[{ state: null, neg: false }, { state: null, neg: false }]]);
  });

  it('marque une valeur correcte comme ok', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '15.5']]);
    expect(state[0][0].state).toBe('ok');
    expect(state[0][1].state).toBe('ok');
  });

  it('accepte la virgule décimale française', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '15,5']]);
    expect(state[0][1].state).toBe('ok');
  });

  it('marque une valeur incorrecte comme no', () => {
    const state = buildEntryState([[1, 15.5]], [['1', '16']]);
    expect(state[0][1].state).toBe('no');
  });

  it('signale neg=true quand la valeur correcte est négative, quelle que soit la saisie', () => {
    const state = buildEntryState([[-2, 3]], [['', '']]);
    expect(state[0][0].neg).toBe(true);
    expect(state[0][1].neg).toBe(false);
  });

  it('gère plusieurs lignes indépendamment', () => {
    const state = buildEntryState(
      [[1, 10], [2, 20]],
      [['1', '10'], ['', '']]
    );
    expect(state[0][0].state).toBe('ok');
    expect(state[0][1].state).toBe('ok');
    expect(state[1][0].state).toBe(null);
    expect(state[1][1].state).toBe(null);
  });
});

describe('entryComplete', () => {
  it("faux tant qu'une case n'est pas ok", () => {
    const state = [[{ state: 'ok', neg: false }, { state: null, neg: false }]];
    expect(entryComplete(state)).toBe(false);
  });

  it("faux tant qu'une case est marquée no", () => {
    const state = [[{ state: 'ok', neg: false }, { state: 'no', neg: false }]];
    expect(entryComplete(state)).toBe(false);
  });

  it('vrai quand toutes les cases sont ok, sur plusieurs lignes', () => {
    const state = [
      [{ state: 'ok', neg: false }, { state: 'ok', neg: false }],
      [{ state: 'ok', neg: false }, { state: 'ok', neg: false }]
    ];
    expect(entryComplete(state)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- entry-state`
Expected: FAIL — `Cannot find module './entry-state.js'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```js
// src/lib/numworks/entry-state.js
import { checkNumeric } from '../utils/answer-check.js';

/**
 * Compares what the student has typed so far against the exercise's real
 * dataset, cell by cell. Never returns the correct values themselves —
 * only whether each typed cell is right, wrong, or still untouched, plus
 * whether that cell's correct value is negative (so the caller can show a
 * ± button without learning the actual value).
 *
 * @param {Array<[number, number]>} points - the correct dataset
 * @param {Array<[string, string]>} typed - parallel array of what's typed
 * @returns {Array<Array<{state: 'ok'|'no'|null, neg: boolean}>>}
 */
export function buildEntryState(points, typed) {
  return points.map((correctRow, i) => {
    const typedRow = typed[i] || ['', ''];
    return correctRow.map((correct, j) => {
      const v = (typedRow[j] ?? '').trim();
      const state = v === '' ? null : checkNumeric(v, correct) ? 'ok' : 'no';
      return { state, neg: correct < 0 };
    });
  });
}

/** True only once every cell in entryState is confirmed correct. */
export function entryComplete(entryState) {
  return entryState.every((row) => row.every((cell) => cell.state === 'ok'));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- entry-state`
Expected: PASS, all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/numworks/entry-state.js src/lib/numworks/entry-state.test.js
git commit -m "feat(numworks): add pure per-cell entry validation"
```

---

### Task 2: `DataScreen.svelte` — editable, validated table

**Files:**
- Modify: `src/lib/numworks/DataScreen.svelte` (full rewrite of the script + template; keep the existing `<style>` block's table rules, extend them)

**Interfaces:**
- Consumes: `entryState` (Task 1's `buildEntryState` output shape — `Array<Array<{state, neg}>>`), passed in as a prop, never computed by this component.
- Produces: calls `onedit(row: number, col: number, value: string)` on every keystroke — no return value. `Shell.svelte` (Task 4) supplies this callback and owns what happens to it.

- [ ] **Step 1: Replace the component**

```svelte
<!-- src/lib/numworks/DataScreen.svelte -->
<script>
  let { entryState, typed, cols = ['x', 'y'], onedit } = $props();

  function toggleSign(i, j) {
    const v = typed[i][j] || '';
    onedit(i, j, v.startsWith('-') ? v.slice(1) : '-' + v);
  }
</script>

<div class="ds">
  <table>
    <thead>
      <tr>
        <th class="idx">N</th>
        <th>{cols[0]}</th>
        <th>{cols[1]}</th>
      </tr>
    </thead>
    <tbody>
      {#each entryState as row, i (i)}
        <tr>
          <td class="idx">{i + 1}</td>
          {#each row as cell, j (j)}
            <td>
              <div class="cellin">
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  value={typed[i][j]}
                  oninput={(e) => onedit(i, j, e.target.value)}
                  class={cell.state}
                />
                {#if cell.neg}
                  <button
                    type="button"
                    class="sign"
                    onclick={() => toggleSign(i, j)}
                    aria-label="Insérer ou retirer le signe moins"
                  >
                    −
                  </button>
                {/if}
              </div>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .ds {
    font-family: var(--sm);
    font-size: 13px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 5px 8px;
    text-align: right;
    border-bottom: 1px solid var(--line);
  }
  th {
    color: var(--dim);
    font-weight: 400;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.03em;
  }
  .idx {
    color: var(--dim2);
    text-align: left;
    width: 28px;
  }
  .cellin {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
  input {
    width: 100%;
    max-width: 80px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 5px 7px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 13px;
    text-align: right;
  }
  input:focus-visible {
    border-color: var(--g);
  }
  input.ok {
    border-color: var(--g3);
  }
  input.no {
    border-color: var(--red);
  }
  .sign {
    flex-shrink: 0;
    width: 24px;
    height: 26px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }
  .sign:hover,
  .sign:focus-visible {
    border-color: var(--g);
  }
</style>
```

- [ ] **Step 2: Verify the build stays green**

Run: `npm run build`
Expected: succeeds — this component isn't wired into any route yet (`Shell.svelte` still passes the old `points`/`cols` props until Task 4), so this step only confirms the file itself is valid Svelte with no syntax errors. A route-level check comes in Task 4/5.

- [ ] **Step 3: Commit**

```bash
git add src/lib/numworks/DataScreen.svelte
git commit -m "feat(numworks): make DataScreen an editable, validated table"
```

---

### Task 3: `GraphScreen.svelte` — incomplete-entry placeholder

**Files:**
- Modify: `src/lib/numworks/GraphScreen.svelte`

**Interfaces:**
- Consumes: `points` prop, now optional (`undefined` means "not every cell confirmed yet" — set by `Shell.svelte` in Task 4, not by this component).
- Produces: unchanged public shape (`{ points, reg }` props) — existing callers (none outside `Shell.svelte`) are unaffected by this being optional now.

- [ ] **Step 1: Guard every derived value on `points` being present**

In `src/lib/numworks/GraphScreen.svelte`, replace the derived-value block:

```js
  let xs = $derived(points.map((p) => p[0]));
  let ys = $derived(points.map((p) => p[1]));
  let xMin = $derived(Math.min(...xs));
  let xMax = $derived(Math.max(...xs));
  let yMin = $derived(Math.min(0, ...ys));
  let yMax = $derived(Math.max(...ys));
  let xSpan = $derived(xMax - xMin || 1);
  let ySpan = $derived(yMax - yMin || 1);
```

with:

```js
  let xs = $derived(points ? points.map((p) => p[0]) : []);
  let ys = $derived(points ? points.map((p) => p[1]) : []);
  let xMin = $derived(xs.length ? Math.min(...xs) : 0);
  let xMax = $derived(xs.length ? Math.max(...xs) : 1);
  let yMin = $derived(ys.length ? Math.min(0, ...ys) : 0);
  let yMax = $derived(ys.length ? Math.max(...ys) : 1);
  let xSpan = $derived(xMax - xMin || 1);
  let ySpan = $derived(yMax - yMin || 1);
```

And replace this line:

```js
  let fit = $derived(fitFn ? fitFn(points) : null);
```

with:

```js
  let fit = $derived(points && fitFn ? fitFn(points) : null);
```

And in the `curvePoints` derivation, replace:

```js
  let curvePoints = $derived.by(() => {
    if (!modelFn) return '';
```

with:

```js
  let curvePoints = $derived.by(() => {
    if (!points || !modelFn) return '';
```

- [ ] **Step 2: Add the incomplete-state branch to the template**

Replace the top-level template:

```svelte
<div class="gs">
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points et courbe de régression">
```

with:

```svelte
<div class="gs">
  {#if !points}
    <p class="incomplete">Complète la saisie des données pour voir le graphique.</p>
  {:else}
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points et courbe de régression">
```

and close the new `{:else}` branch right after the existing closing `</div>` of `.info`, i.e. change:

```svelte
    {:else}
      <span class="regtype">Pas de régression calculable</span>
    {/if}
  </div>
</div>
```

to:

```svelte
    {:else}
      <span class="regtype">Pas de régression calculable</span>
    {/if}
  </div>
  {/if}
</div>
```

- [ ] **Step 3: Add the placeholder style**

Add to the `<style>` block:

```css
  .incomplete {
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
    text-align: center;
    padding: 24px 8px;
  }
```

- [ ] **Step 4: Verify the build stays green**

Run: `npm run build`
Expected: succeeds. As with Task 2, this component isn't wired to `undefined` yet until Task 4 — this confirms no syntax/type error and that the existing (always-`points`-present) call sites still render identically.

- [ ] **Step 5: Commit**

```bash
git add src/lib/numworks/GraphScreen.svelte
git commit -m "feat(numworks): show a placeholder in GraphScreen until entry is complete"
```

---

### Task 4: `Shell.svelte` — stateful tabs, owns validation

**Files:**
- Modify: `src/lib/numworks/Shell.svelte` (full rewrite)

**Interfaces:**
- Consumes: `calc` prop shape is now `{dataset, cols, reg}` (no `screen`) — `points` prop unchanged (the real dataset array, resolved by the route the same way as today). `buildEntryState`/`entryComplete` from Task 1. `DataScreen`'s `{entryState, typed, cols, onedit}` prop contract from Task 2. `GraphScreen`'s `{points, reg}` prop contract from Task 3 (with `points` now possibly `undefined`).
- Produces: no external interface change — still a single `<Shell calc={...} points={...} />` usage, same as v1 (verified in Task 5's route check).

- [ ] **Step 1: Replace the component**

```svelte
<!-- src/lib/numworks/Shell.svelte -->
<script>
  import DataScreen from './DataScreen.svelte';
  import GraphScreen from './GraphScreen.svelte';
  import { buildEntryState, entryComplete } from './entry-state.js';

  let { calc, points } = $props();

  let screen = $state('data');
  let typed = $state(points.map(() => ['', '']));

  let entryState = $derived(buildEntryState(points, typed));
  let complete = $derived(entryComplete(entryState));

  function onedit(row, col, value) {
    typed[row][col] = value;
  }
</script>

<div class="nw-shell">
  <div class="nw-tabs">
    <button type="button" class:on={screen === 'data'} onclick={() => (screen = 'data')}>
      Données
    </button>
    <button type="button" class:on={screen === 'graph'} onclick={() => (screen = 'graph')}>
      Graphique
    </button>
  </div>
  <div class="nw-screen">
    {#if screen === 'data'}
      <DataScreen {entryState} {typed} cols={calc.cols} {onedit} />
    {:else}
      <GraphScreen points={complete ? points : undefined} reg={calc.reg} />
    {/if}
  </div>
</div>

<style>
  .nw-shell {
    max-width: 360px;
    margin: 14px auto 0;
    border: 1px solid var(--line2);
    border-radius: 14px;
    background: var(--surf2);
    overflow: hidden;
  }
  .nw-tabs {
    display: flex;
  }
  .nw-tabs button {
    flex: 1;
    padding: 8px 14px;
    background: var(--surf3);
    color: var(--dim);
    border: none;
    border-bottom: 1px solid var(--line);
    font-family: var(--sm);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
  }
  .nw-tabs button.on {
    color: var(--tx);
    background: var(--surf2);
    border-bottom-color: var(--g);
  }
  .nw-tabs button:focus-visible {
    outline: 1px solid var(--g);
    outline-offset: -1px;
  }
  .nw-screen {
    padding: 14px;
  }
</style>
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all existing tests still pass, including `entry-state.test.js` from Task 1 and `calc-integrity.test.js` (unaffected — it only checks `step.calc.dataset` references, never `screen`).

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: succeeds. This is the first task where `Shell.svelte` actually calls `buildEntryState`/`entryComplete` against real course data (`stat2var-ms.js`, still on its old two-step `calc` shape at this point — that's fine, `calc.cols`/`calc.reg` are still read the same way; the old `screen` field is simply ignored now, so both existing steps render as two separate calculator widgets, exactly as before but each one now has tabs and typed entry instead of a title bar).

- [ ] **Step 4: Manual screenshot verification**

Start the chromium workaround (if not already running) and the preview server:

```bash
nohup bash -c 'cd <worktree> && npm run preview -- --port 4323' > /tmp/preview.log 2>&1 &
```

Open `http://localhost:4323/c/stat2var-ms/0` and screenshot the first calculator widget (mobile width, 400px). Verify:
- Both tabs render (Données / Graphique), Données active by default.
- Typing a correct value in a cell turns its border the "ok" colour (same green as `QuizInput`'s `.ok`).
- Typing a wrong value turns it the "no"/red colour.
- Clicking the Graphique tab before every cell is correct shows "Complète la saisie des données pour voir le graphique." instead of a chart.
- Once every cell is correct, clicking Graphique shows the real chart with the regression line, matching the exercise's known equation (y = 3,5x + 12).

- [ ] **Step 5: Commit**

```bash
git add src/lib/numworks/Shell.svelte
git commit -m "feat(numworks): Shell owns tab navigation and entry validation"
```

---

### Task 5: Migrate `stat2var-ms.js` to the one-step `calc` shape

**Files:**
- Modify: `src/lib/data/courses/stat2var-ms.js:14-22` (séance 1) and `:43-48` (séance 2)

**Interfaces:**
- Consumes: the new `calc: {dataset, cols, reg}` shape from this plan's Global Constraints — no `screen` field.
- Produces: nothing further downstream consumes this file directly other than the route renderer (unchanged, see Step 3 below) and `calc-integrity.js` (unchanged, only checks `dataset` references).

- [ ] **Step 1: Collapse séance 1's two calculator steps into one**

In `src/lib/data/courses/stat2var-ms.js`, replace:

```js
   {t:"Sur la calculatrice — écran Données",
    apport:"Sur la calculatrice, ces points s'entrent dans l'écran <b>Statistiques → Données</b>, une colonne par variable.",
    calc:{screen:"data",dataset:"d1",cols:["Mois","Interv."]}},
   {t:"Étape 2 — La droite donnée par la calculatrice",
    apport:"La calculatrice (ou le tableur), à partir de ces points, donne la droite d'ajustement : <b>y = 3,5x + 12</b>. On n'a pas besoin de refaire ce calcul à la main : on l'utilise directement.",
    q:[{q:"Nombre d'interventions prévu au mois 6 (déjà dans les données, pour vérifier) : 3,5 × 6 + 12 = ?",a:33,tol:0,sol:"On retrouve bien la valeur du tableau : le modèle colle aux données déjà connues."}]},
   {t:"Sur la calculatrice — écran Régression",
    apport:"En choisissant une <b>régression affine</b>, l'écran graphique affiche le nuage de points et la droite d'ajustement — on retrouve bien y = 3,5x + 12.",
    calc:{screen:"graph",dataset:"d1",reg:"affine"}},
```

with:

```js
   {t:"Sur la calculatrice",
    apport:"Entre ces points toi-même dans l'écran <b>Statistiques → Données</b> de la calculatrice ci-dessous (une colonne par variable), puis passe à l'écran <b>Régression</b> pour voir la droite d'ajustement — tu dois retrouver y = 3,5x + 12.",
    calc:{dataset:"d1",cols:["Mois","Interv."],reg:"affine"}},
   {t:"Étape 2 — La droite donnée par la calculatrice",
    apport:"La calculatrice (ou le tableur), à partir de ces points, donne la droite d'ajustement : <b>y = 3,5x + 12</b>. On n'a pas besoin de refaire ce calcul à la main : on l'utilise directement.",
    q:[{q:"Nombre d'interventions prévu au mois 6 (déjà dans les données, pour vérifier) : 3,5 × 6 + 12 = ?",a:33,tol:0,sol:"On retrouve bien la valeur du tableau : le modèle colle aux données déjà connues."}]},
```

- [ ] **Step 2: Collapse séance 2's two calculator steps into one**

Replace:

```js
   {t:"Sur la calculatrice — écran Données",
    apport:"Plutôt que de calculer z = log(y) à la main, on peut entrer directement les années et les logements équipés dans l'écran <b>Statistiques → Données</b>.",
    calc:{screen:"data",dataset:"d1",cols:["Année","Logements"]}},
   {t:"Sur la calculatrice — écran Régression exponentielle",
    apport:"NumWorks propose directement un modèle <b>Exponentielle</b> (y = a·e^(bx)), sans passer par le changement de variable : on retrouve a ≈ 10 et b ≈ 0,1151 — exactement la même courbe que z = 0,05x + 1 (10^0,05 = e^0,1151…), juste écrite autrement.",
    calc:{screen:"graph",dataset:"d1",reg:"exponentielle"}},
```

with:

```js
   {t:"Sur la calculatrice",
    apport:"Entre directement les années et les logements équipés dans l'écran <b>Statistiques → Données</b>, puis passe à l'écran <b>Régression</b> et choisis le modèle <b>Exponentielle</b> (y = a·e^(bx)) — sans passer par le changement de variable : tu dois retrouver a ≈ 10 et b ≈ 0,1151, exactement la même courbe que z = 0,05x + 1 (10^0,05 = e^0,1151…), juste écrite autrement.",
    calc:{dataset:"d1",cols:["Année","Logements"],reg:"exponentielle"}},
```

- [ ] **Step 3: Verify the route wiring needs no change**

Read `src/routes/c/[id]/[n]/+page.svelte` around its `{#if st.calc}` branch. Confirm it still reads:

```svelte
{#if st.calc}
  {@const calcPoints = se.datasets?.[st.calc.dataset] || []}
  <div class="calc-host">
    <Shell calc={st.calc} points={calcPoints} />
```

No `st.calc.screen` reference exists here — this file needs no edit. (If a reference to `st.calc.screen` is found, that's a signal this plan's file list was incomplete; stop and add a step before continuing.)

- [ ] **Step 4: Run the full test suite and build**

Run: `npm test && npm run build`
Expected: all tests pass (`calc-integrity.test.js`'s "aucune référence cassée dans les cours réels du site" check still passes, since both steps still reference the existing `d1` dataset key); build succeeds.

- [ ] **Step 5: Manual screenshot verification of both migrated exercises**

Using the same chromium workaround as Task 4:
- `http://localhost:4323/c/stat2var-ms/0`: one calculator widget (not two), tabs work, typing the séance's 5 points (`[1,15.5],[3,22.5],[6,33],[9,43.5],[12,54]]`) marks every cell ok, switching to Graphique shows y ≈ 3,5x + 12.
- `http://localhost:4323/c/stat2var-ms/1`: one calculator widget, typing the séance's 5 points (`[0,10],[5,17.78],[10,31.62],[15,56.23],[20,100]]`, rounded as needed) marks every cell ok, switching to Graphique shows the exponential curve with a ≈ 10, b ≈ 0,1151.

Save both screenshots (mobile width) as evidence, the same way every visual PR this session has.

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/courses/stat2var-ms.js
git commit -m "feat(courses): migrate stat2var-ms calculator steps to one-widget shape"
```

---

### Task 6: Final verification and PR

**Files:** none (verification only).

- [ ] **Step 1: Run the full suite one more time from a clean state**

Run: `npm test && npm run build`
Expected: all green.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin <branch-name>
gh-axi pr create -R awkwy/mrpayet --title "feat(numworks): interactive, self-navigated calculator entry" --base main --body "<summary + links to both spec PRs (#46 for the design, plus the earlier v1 design/plan PRs) + the screenshot evidence from Tasks 4 and 5>"
```

- [ ] **Step 3: Report to the captain**

Summarize in plain language (per this project's standing communication convention — see `AGENTS.md` section 9 if working under Firstmate supervision): what changed for the student (types their own data, switches screens themselves, validated as they go), the two migrated exercises, the explicit scope choices carried over from the spec (no real epsilon firmware, no on-screen key-grid, Régression-only), and the PR's full URL.

## Self-Review Notes

- **Spec coverage:** every section of `2026-09-20-numworks-calculator-v2-design.md` maps to a task — "Interaction model"/"Data model" → Tasks 4–5, "Data entry" → Tasks 1–2, "Component architecture" → Tasks 1–4, "Testing" → Task 1's unit tests plus every task's build/manual-verification steps.
- **Placeholder scan:** no TBD/TODO; every code step above is complete, copy-pasteable code, not a description of code.
- **Type consistency:** `entryState` shape (`Array<Array<{state, neg}>>`) is identical across Task 1's tests, Task 2's `DataScreen` props, and Task 4's `Shell` usage. `onedit(row, col, value)` signature is identical in Task 2 (call site) and Task 4 (definition). `buildEntryState`/`entryComplete` names and signatures match between Task 1 (definition) and Task 4 (usage).
