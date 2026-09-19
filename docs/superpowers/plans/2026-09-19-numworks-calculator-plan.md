# NumWorks Calculator Steps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a course step show a NumWorks-style calculator screen (data-entry table or regression graph), wired to a shared per-exercise dataset so the two screens can never disagree.

**Architecture:** A new `src/lib/numworks/` component family (chrome + two screen types + pure regression math), a new optional `calc` field on a course step (same pattern as the existing `img`/`doc`/`viz` fields), and a data-integrity test that fails loudly if a step's `calc.dataset` doesn't exist on its séance.

**Tech Stack:** SvelteKit (Svelte 5 runes), vitest, plain SVG (no charting library, no new dependency).

**Spec:** `docs/superpowers/specs/2026-09-19-numworks-calculator-design.md`

## Global Constraints

- v1 supports **affine regression only** (spec, "v1 scope"). Do not add other regression types in this plan.
- Visual style uses the site's existing tokens (`--bg`, `--surf`, `--surf2`, `--surf3`, `--line`, `--line2`, `--g`, `--g2`, `--tx`, `--dim`, `--dim2`, `--sm` — `src/lib/styles/tokens.css`), never a literal skin of the real NumWorks chassis colours (spec, "Non-goals").
- No scroll-jacking, no parallax library, no new npm dependency (spec, "Non-goals"). Plain SVG is sufficient for the graph; do not add d3-scale/d3-shape or similar.
- Numbers displayed in calculator screens use French decimal comma formatting (site-wide convention — every existing course file writes "3,5" not "3.5").
- `npm test` and `npm run build` must both stay green after every task (existing project convention, confirmed by every prior course-content PR on this repo).

---

## File Structure

New files:
- `src/lib/numworks/format.js` + `format.test.js` — number formatting.
- `src/lib/numworks/regression.js` + `regression.test.js` — affine least-squares fit.
- `src/lib/data/courses/calc-integrity.js` + `calc-integrity.test.js` — validates every `step.calc.dataset` resolves against its séance's `datasets`.
- `src/lib/numworks/DataScreen.svelte` — data-entry table screen.
- `src/lib/numworks/GraphScreen.svelte` — scatter + regression line screen.
- `src/lib/numworks/Shell.svelte` — chrome (title bar) + dispatches to `DataScreen`/`GraphScreen` by `calc.screen`. (The spec described Shell as composing the screens; this plan has it choose between them with a plain `{#if}`, not a Svelte slot, because no component in this codebase currently composes children that way — see `src/lib/components/QuizInput.svelte` for the established "leaf component, plain props in" convention. This keeps the three-file split the spec asked for without introducing a new composition pattern for a first, small feature.)

Modified files:
- `src/routes/c/[id]/[n]/+page.svelte` — renders `Shell` when a step has a `calc` field.
- `src/lib/data/courses/stat2var-ms.js` — first real usage, séance 1 ("Prévoir le nombre d'interventions mensuelles").

---

### Task 1: Number formatting and affine regression (pure functions)

**Files:**
- Create: `src/lib/numworks/format.js`
- Create: `src/lib/numworks/format.test.js`
- Create: `src/lib/numworks/regression.js`
- Create: `src/lib/numworks/regression.test.js`

**Interfaces:**
- Produces: `fmtNum(n: number, decimals = 2): string` — French comma decimal, no trailing zeros.
- Produces: `affine(points: Array<[number, number]>): { a: number, b: number } | null` — least-squares fit; `null` if fewer than 2 points or all points share the same x (undefined slope).

- [ ] **Step 1: Write the failing tests for `fmtNum`**

```js
// src/lib/numworks/format.test.js
import { describe, expect, it } from 'vitest';
import { fmtNum } from './format.js';

describe('fmtNum', () => {
  it('utilise la virgule décimale', () => {
    expect(fmtNum(3.5)).toBe('3,5');
  });
  it('ne laisse pas de zéro inutile', () => {
    expect(fmtNum(12)).toBe('12');
  });
  it('arrondit au nombre de décimales demandé', () => {
    expect(fmtNum(3.14159, 2)).toBe('3,14');
  });
  it('gère les valeurs négatives', () => {
    expect(fmtNum(-2.5)).toBe('-2,5');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- format.test.js`
Expected: FAIL — `format.js` does not exist yet.

- [ ] **Step 3: Implement `format.js`**

```js
// src/lib/numworks/format.js
export function fmtNum(n, decimals = 2) {
  const f = 10 ** decimals;
  const rounded = Math.round(n * f) / f;
  return rounded.toString().replace('.', ',');
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- format.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Write the failing tests for `affine`**

```js
// src/lib/numworks/regression.test.js
import { describe, expect, it } from 'vitest';
import { affine } from './regression.js';

describe('affine', () => {
  it('retrouve exactement une droite sans bruit', () => {
    const fit = affine([[0, 1], [1, 3], [2, 5]]); // y = 2x + 1
    expect(fit.a).toBeCloseTo(2, 6);
    expect(fit.b).toBeCloseTo(1, 6);
  });

  it('retrouve la droite du cours stat2var-ms séance 1', () => {
    const fit = affine([[1, 15.5], [3, 22.5], [6, 33], [9, 43.5], [12, 54]]);
    expect(fit.a).toBeCloseTo(3.5, 6);
    expect(fit.b).toBeCloseTo(12, 6);
  });

  it('renvoie null avec moins de 2 points', () => {
    expect(affine([])).toBeNull();
    expect(affine([[1, 2]])).toBeNull();
  });

  it('renvoie null si tous les points ont le même x (pente indéfinie)', () => {
    expect(affine([[2, 3], [2, 7]])).toBeNull();
  });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- regression.test.js`
Expected: FAIL — `regression.js` does not exist yet.

- [ ] **Step 7: Implement `regression.js`**

```js
// src/lib/numworks/regression.js
export function affine(points) {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
    sxy += x * y;
    sxx += x * x;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const a = (n * sxy - sx * sy) / denom;
  const b = (sy - a * sx) / n;
  return { a, b };
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npm test -- regression.test.js`
Expected: PASS (4 tests)

- [ ] **Step 9: Commit**

```bash
git add src/lib/numworks/format.js src/lib/numworks/format.test.js src/lib/numworks/regression.js src/lib/numworks/regression.test.js
git commit -m "feat(numworks): affine regression and number formatting utilities"
```

---

### Task 2: Course data-integrity check for `calc.dataset` references

**Files:**
- Create: `src/lib/data/courses/calc-integrity.js`
- Create: `src/lib/data/courses/calc-integrity.test.js`

**Interfaces:**
- Consumes: `COURSES` from `src/lib/data/courses/index.js` (existing — array of course objects, each with `.id` and `.seances`, each séance has `.steps` and optionally `.datasets`).
- Produces: `findBadCalcRefs(courses: Array): Array<{ courseId: string, seanceIndex: number, stepIndex: number, dataset: string }>`.

- [ ] **Step 1: Write the failing tests**

```js
// src/lib/data/courses/calc-integrity.test.js
import { describe, expect, it } from 'vitest';
import { findBadCalcRefs } from './calc-integrity.js';
import { COURSES } from './index.js';

describe('findBadCalcRefs', () => {
  it('ne signale rien quand toutes les références sont valides', () => {
    const course = {
      id: 'test-good',
      seances: [{ datasets: { d1: [[1, 2]] }, steps: [{ t: 'x', calc: { screen: 'data', dataset: 'd1' } }] }]
    };
    expect(findBadCalcRefs([course])).toEqual([]);
  });

  it('signale une référence vers un dataset inexistant', () => {
    const course = {
      id: 'test-bad',
      seances: [{ datasets: { d1: [[1, 2]] }, steps: [{ t: 'x', calc: { screen: 'data', dataset: 'd2' } }] }]
    };
    expect(findBadCalcRefs([course])).toEqual([
      { courseId: 'test-bad', seanceIndex: 0, stepIndex: 0, dataset: 'd2' }
    ]);
  });

  it('ignore les étapes sans champ calc', () => {
    const course = { id: 'test-none', seances: [{ steps: [{ t: 'x' }] }] };
    expect(findBadCalcRefs([course])).toEqual([]);
  });

  it('aucune référence cassée dans les cours réels du site', () => {
    expect(findBadCalcRefs(COURSES)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- calc-integrity.test.js`
Expected: FAIL — `calc-integrity.js` does not exist yet.

- [ ] **Step 3: Implement `calc-integrity.js`**

```js
// src/lib/data/courses/calc-integrity.js
export function findBadCalcRefs(courses) {
  const bad = [];
  for (const course of courses) {
    course.seances.forEach((seance, seanceIndex) => {
      const datasets = seance.datasets || {};
      (seance.steps || []).forEach((step, stepIndex) => {
        if (step.calc && !(step.calc.dataset in datasets)) {
          bad.push({ courseId: course.id, seanceIndex, stepIndex, dataset: step.calc.dataset });
        }
      });
    });
  }
  return bad;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- calc-integrity.test.js`
Expected: PASS (4 tests) — the real-courses assertion passes vacuously for now (no course uses `calc` yet); it becomes a meaningful safety net from Task 6 onward.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/courses/calc-integrity.js src/lib/data/courses/calc-integrity.test.js
git commit -m "feat(courses): validate calc.dataset references against séance datasets"
```

---

### Task 3: `DataScreen.svelte` — the data-entry table

**Files:**
- Create: `src/lib/numworks/DataScreen.svelte`

**Interfaces:**
- Consumes: `fmtNum` from `./format.js` (Task 1).
- Produces: a Svelte component with props `{ points: Array<[number, number]>, cols?: [string, string] }`, default `cols = ['x', 'y']`. Consumed by `Shell.svelte` (Task 5).

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/lib/numworks/DataScreen.svelte -->
<script>
  import { fmtNum } from './format.js';

  let { points, cols = ['x', 'y'] } = $props();
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
      {#each points as [x, y], i (i)}
        <tr>
          <td class="idx">{i + 1}</td>
          <td>{fmtNum(x)}</td>
          <td>{fmtNum(y)}</td>
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
  td {
    color: var(--tx);
  }
  .idx {
    color: var(--dim2);
    text-align: left;
    width: 28px;
  }
</style>
```

- [ ] **Step 2: Verify the project still builds**

Run: `npm run build`
Expected: build succeeds (this component isn't wired into any route yet, so this just confirms it compiles cleanly as a Svelte file — Svelte's compiler runs over every file it touches at build time).

- [ ] **Step 3: Commit**

```bash
git add src/lib/numworks/DataScreen.svelte
git commit -m "feat(numworks): data-entry table screen component"
```

---

### Task 4: `GraphScreen.svelte` — scatter plot with regression line

**Files:**
- Create: `src/lib/numworks/GraphScreen.svelte`

**Interfaces:**
- Consumes: `affine` from `./regression.js` (Task 1), `fmtNum` from `./format.js` (Task 1).
- Produces: a Svelte component with props `{ points: Array<[number, number]>, reg?: string }`, default `reg = 'affine'`. Consumed by `Shell.svelte` (Task 5). Only `reg === 'affine'` computes a fit in v1 (Global Constraints); any other value renders the scatter with no line.

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/lib/numworks/GraphScreen.svelte -->
<script>
  import { affine } from './regression.js';
  import { fmtNum } from './format.js';

  let { points, reg = 'affine' } = $props();

  const W = 300;
  const H = 200;
  const PAD = 26;

  let fit = $derived(reg === 'affine' ? affine(points) : null);

  let xs = $derived(points.map((p) => p[0]));
  let ys = $derived(points.map((p) => p[1]));
  let xMin = $derived(Math.min(...xs));
  let xMax = $derived(Math.max(...xs));
  let yMin = $derived(Math.min(0, ...ys));
  let yMax = $derived(Math.max(...ys));
  let xSpan = $derived(xMax - xMin || 1);
  let ySpan = $derived(yMax - yMin || 1);

  function sx(x) {
    return PAD + ((x - xMin) / xSpan) * (W - 2 * PAD);
  }
  function sy(y) {
    return H - PAD - ((y - yMin) / ySpan) * (H - 2 * PAD);
  }

  let line = $derived(
    fit
      ? { x1: sx(xMin), y1: sy(fit.a * xMin + fit.b), x2: sx(xMax), y2: sy(fit.a * xMax + fit.b) }
      : null
  );
</script>

<div class="gs">
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points et droite de régression">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="axis" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="axis" />
    {#if line}
      <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} class="fit" />
    {/if}
    {#each points as [x, y], i (i)}
      <circle cx={sx(x)} cy={sy(y)} r="3" class="pt" />
    {/each}
  </svg>
  <div class="info">
    {#if fit}
      <span class="regtype">Régression affine</span>
      <span class="eq">y = {fmtNum(fit.a, 3)}x {fit.b >= 0 ? '+' : '−'} {fmtNum(Math.abs(fit.b), 3)}</span>
    {:else}
      <span class="regtype">Pas de régression calculable</span>
    {/if}
  </div>
</div>

<style>
  .gs {
    display: grid;
    gap: 8px;
  }
  svg {
    width: 100%;
    height: auto;
    background: var(--surf);
    border: 1px solid var(--line);
    border-radius: 6px;
  }
  .axis {
    stroke: var(--line2);
    stroke-width: 1;
  }
  .fit {
    stroke: var(--g);
    stroke-width: 1.5;
  }
  .pt {
    fill: var(--blue);
  }
  .info {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .regtype {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--g2);
  }
  .eq {
    color: var(--tx);
  }
</style>
```

- [ ] **Step 2: Verify the project still builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/numworks/GraphScreen.svelte
git commit -m "feat(numworks): regression graph screen component"
```

---

### Task 5: `Shell.svelte` — chrome and screen dispatch

**Files:**
- Create: `src/lib/numworks/Shell.svelte`

**Interfaces:**
- Consumes: `DataScreen.svelte` (Task 3), `GraphScreen.svelte` (Task 4).
- Produces: a Svelte component with props `{ calc: { screen: 'data'|'graph', dataset: string, cols?: [string,string], reg?: string }, points: Array<[number,number]> }`. Consumed by `src/routes/c/[id]/[n]/+page.svelte` (Task 6).

- [ ] **Step 1: Implement the component**

```svelte
<!-- src/lib/numworks/Shell.svelte -->
<script>
  import DataScreen from './DataScreen.svelte';
  import GraphScreen from './GraphScreen.svelte';

  let { calc, points } = $props();

  const TITLES = { data: 'Statistiques — Données', graph: 'Statistiques — Régression' };
  let title = $derived(TITLES[calc.screen] || 'Calculatrice');
</script>

<div class="nw-shell">
  <div class="nw-bar">{title}</div>
  <div class="nw-screen">
    {#if calc.screen === 'data'}
      <DataScreen {points} cols={calc.cols} />
    {:else if calc.screen === 'graph'}
      <GraphScreen {points} reg={calc.reg} />
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
  .nw-bar {
    padding: 8px 14px;
    background: var(--surf3);
    color: var(--dim);
    font-family: var(--sm);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--line);
  }
  .nw-screen {
    padding: 14px;
  }
</style>
```

- [ ] **Step 2: Verify the project still builds**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/numworks/Shell.svelte
git commit -m "feat(numworks): calculator shell, dispatches data/graph screens"
```

---

### Task 6: Wire `calc` into the course step renderer

**Files:**
- Modify: `src/routes/c/[id]/[n]/+page.svelte`

**Interfaces:**
- Consumes: `Shell.svelte` (Task 5); `se.datasets` (a plain object on the séance, already available on `data.seance` — no loader change needed since `src/routes/c/[id]/[n]/+page.js` already returns the whole séance object unmodified).

- [ ] **Step 1: Add the import**

Find this line near the top of the `<script>` block:

```svelte
  import { VIZ } from '$lib/visualizations/registry.js';
```

Add directly after it:

```svelte
  import Shell from '$lib/numworks/Shell.svelte';
```

- [ ] **Step 2: Render the calculator block**

Find this block inside the `{#each se.steps as st, si}` loop:

```svelte
        {#if st.viz && VIZ[st.viz]}
          {#key c.id + '/' + n + '/' + si}
            <div class="viz-host">
              <svelte:component this={VIZ[st.viz]} vd={st.vd} />
            </div>
          {/key}
        {/if}
        {#if st.q}
```

Replace it with (adds a `calc` branch between the two, same `{#if}`/`{/if}` structure as every other optional step field):

```svelte
        {#if st.viz && VIZ[st.viz]}
          {#key c.id + '/' + n + '/' + si}
            <div class="viz-host">
              <svelte:component this={VIZ[st.viz]} vd={st.vd} />
            </div>
          {/key}
        {/if}
        {#if st.calc}
          {@const calcPoints = se.datasets?.[st.calc.dataset] || []}
          <div class="calc-host">
            <Shell calc={st.calc} points={calcPoints} />
          </div>
        {/if}
        {#if st.q}
```

- [ ] **Step 3: Add the CSS rule**

Find this rule in the `<style>` block:

```css
  .viz-host {
    margin-top: 14px;
  }
```

Add directly after it:

```css
  .calc-host {
    margin-top: 14px;
  }
```

- [ ] **Step 4: Verify the project still builds**

Run: `npm run build`
Expected: build succeeds (no course uses `calc` yet, so this only proves the new branch compiles and the existing pages are unaffected).

- [ ] **Step 5: Commit**

```bash
git add "src/routes/c/[id]/[n]/+page.svelte"
git commit -m "feat(courses): render calculator screens for steps with a calc field"
```

---

### Task 7: First real exercise — wire it into `stat2var-ms.js` séance 1

**Files:**
- Modify: `src/lib/data/courses/stat2var-ms.js`

**Interfaces:**
- Consumes: the `calc` step field (Task 6) and `datasets` séance field (Task 6's renderer change; no schema code enforces this beyond `calc-integrity.js`, Task 2).

- [ ] **Step 1: Add the dataset and two calculator steps**

Find this block (the first séance of the file, from its opening through the "Étape 2" step):

```js
 {t:"Prévoir le nombre d'interventions mensuelles",
  prob:"Combien d'interventions peut-on prévoir pour le mois prochain, et pour la même période l'an prochain ?",
  steps:[
   {t:"La situation",txt:"Vous travaillez pour une société de sécurité privée. Le responsable planning veut anticiper le nombre d'interventions (rondes supplémentaires, levées de doute, main courante) pour ajuster les effectifs. Il vous donne le nombre moyen d'interventions par mois depuis le début de l'année."},
   {t:"Étape 1 — Le nuage de points",
    doc:{h:["Mois (x)","1","3","6","9","12"],r:[["Interventions (y)","16","22","33","44","54"]]},
    apport:"En reportant ces points sur un graphique, on obtient un nuage qui monte à peu près <b>régulièrement</b> : un <b>ajustement affine</b> est adapté."},
   {t:"Étape 2 — La droite donnée par la calculatrice",
    apport:"La calculatrice (ou le tableur), à partir de ces points, donne la droite d'ajustement : <b>y = 3,5x + 12</b>. On n'a pas besoin de refaire ce calcul à la main : on l'utilise directement.",
    q:[{q:"Nombre d'interventions prévu au mois 6 (déjà dans les données, pour vérifier) : 3,5 × 6 + 12 = ?",a:33,tol:0,sol:"On retrouve bien la valeur du tableau : le modèle colle aux données déjà connues."}]},
```

Replace it with (adds `datasets` on the séance, and two new `calc` steps — note the dataset uses the exact model values `[1,15.5],[3,22.5],[6,33],[9,43.5],[12,54]`, not the rounded display values `16,22,33,44,54` from the `doc` table: the exact values are what makes the live-computed regression land exactly on the `y = 3,5x + 12` already used in "Étape 2", so the interactive graph screen and the hand-worked example never disagree — see the spec's "Core idea: one shared dataset per exercise"):

```js
 {t:"Prévoir le nombre d'interventions mensuelles",
  prob:"Combien d'interventions peut-on prévoir pour le mois prochain, et pour la même période l'an prochain ?",
  datasets:{d1:[[1,15.5],[3,22.5],[6,33],[9,43.5],[12,54]]},
  steps:[
   {t:"La situation",txt:"Vous travaillez pour une société de sécurité privée. Le responsable planning veut anticiper le nombre d'interventions (rondes supplémentaires, levées de doute, main courante) pour ajuster les effectifs. Il vous donne le nombre moyen d'interventions par mois depuis le début de l'année."},
   {t:"Étape 1 — Le nuage de points",
    doc:{h:["Mois (x)","1","3","6","9","12"],r:[["Interventions (y)","16","22","33","44","54"]]},
    apport:"En reportant ces points sur un graphique, on obtient un nuage qui monte à peu près <b>régulièrement</b> : un <b>ajustement affine</b> est adapté."},
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

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites including `calc-integrity.test.js` (this is the first course content the "aucune référence cassée dans les cours réels du site" assertion actually exercises non-vacuously).

- [ ] **Step 3: Run the full build**

Run: `npm run build`
Expected: build succeeds, including prerendering `/c/stat2var-ms/0`.

- [ ] **Step 4: Manual check**

Run `npm run preview` (after build) and open `/c/stat2var-ms/0` (path prefixed by the site's configured base path if any — check `svelte.config.js`) in a browser at phone width (~390px) and desktop width. Confirm: the data screen shows 5 rows matching the dataset; the graph screen's displayed equation reads `y = 3,5x + 12` (matching Étape 2's text exactly); both screens fit without horizontal overflow at phone width.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/courses/stat2var-ms.js
git commit -m "feat(courses): first NumWorks calculator exercise in stat2var-ms séance 1"
```

---

## Follow-up (not in this plan)

- Exponentielle/Logarithmique regression types (spec, "v1 scope" — flagged as a better fit for `stat2var-ms.js` séance 2 than its current manual log change-of-variable).
- Extending the calculator steps to other courses once this first one is confirmed working end-to-end.
