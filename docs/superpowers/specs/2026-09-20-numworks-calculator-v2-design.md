# NumWorks calculator steps v2 — genuinely operational entry — design

Date: 2026-09-20
Status: approved by the captain in chat (interaction model, scope, and data-entry
approach each confirmed), spec written for the record before implementation.
Builds on `2026-09-19-numworks-calculator-design.md` (v1, shipped in PR #40/#41)
— read that first; this document only covers what changes.

## Motivation

The captain's feedback on v1: it isn't "vraiment opérationnelle" yet. Today the
data screen and the graph screen are two separate course *steps* — the student
scrolls, and the next screen appears already filled in. Nothing is typed,
nothing is navigated. That's a slideshow of calculator screens, not practice
on the calculator itself.

The captain also asked whether the real NumWorks firmware (github.com/numworks/epsilon)
could be embedded directly, for pixel-exact fidelity. Researched and reported
back in chat: legally fine (CC BY-NC-SA 4.0 — modification and redistribution
allowed for non-commercial use, share-alike on the modified parts), but not
practical here — NumWorks builds their own web simulator with Emscripten
(C++ → WebAssembly) and says the build itself "takes quite a lot of time" even
for them; this environment has no Emscripten/cmake toolchain installed, and
the result would be the real grey/white NumWorks chrome, not the site's own
colours, without extra work on top of an already heavy build. The captain
chose the from-scratch route instead — recoded, styled to the site, but
genuinely interactive.

## Non-goals for this slice

- Still not the real epsilon firmware (see above — explicitly declined by the
  captain after weighing the tradeoff).
- Still Statistiques → Régression only — no Fonctions/graphing, Solveur,
  Suites apps. The captain confirmed this stays for a later slice.
- Not a standalone free-use calculator page. The widget stays embedded per
  exercise, like v1.
- Not a graphical on-screen key-grid matching the real device's physical
  button layout. See "Data entry" below for what "clavier tactile" resolves
  to in this slice, and why — this is a scope simplification the captain has
  not seen and reviews with the rest of this spec.
- Not free-form data entry. The captain chose the guided/validated approach
  (below) over letting the student type arbitrary values.

## Interaction model

v1 had one `calc` step per screen (`screen: "data"` in one step, `screen:
"graph"` in the next). v2 collapses this to **one `calc` step per exercise**;
`Shell.svelte` becomes a small stateful widget that owns which screen is
showing, with two tab controls at the top of the shell — **Données** /
**Graphique** — that the student clicks themselves, the same gesture as
switching apps on the real calculator. Nothing changes screen on scroll
anymore.

Switching to **Graphique** before the data is fully and correctly entered
shows a placeholder ("Complète la saisie des données pour voir le
graphique.") instead of a chart — matches the real workflow (no data, no
curve) without hard-blocking navigation.

## Data entry — guided and validated

Both columns (X and Y) start blank. The student types each value themselves;
each cell is checked against the exercise's dataset as they type, the same
tolerance-based check already used for `step.q[]` answers
(`checkNumeric`/`checkAnswer` in `src/lib/utils/answer-check.js`) — reused,
not reinvented. A correct cell is marked (border colour, same convention as
`QuizInput.svelte`); the regression and graph are computed only once every
cell in the dataset is confirmed correct.

**Scope simplification, flagged for the captain's review:** "clavier
tactile" here means each cell is an ordinary touch-friendly numeric input
(`inputmode="decimal"`, plus the site's existing ± button for negative
values — see `QuizInput.svelte`), which brings up the phone's own numeric
keyboard. It is **not** a custom on-screen key-grid drawn to look like the
calculator's physical buttons. Reasoning: every other numeric entry point on
the site already works this way, it's proven and accessible, and a bespoke
key-grid is a separate, sizeable design/build effort (layout, key sizing for
touch, focus management) that doesn't change whether the practice is
"opérationnelle" — the student is still typing their own values and driving
the calculator themselves, which is the part the captain asked for. A
graphical key-grid remains a possible later visual-fidelity pass, not part of
this slice.

## Data model

The `calc` step field drops `screen` (the shell now owns navigation) and
keeps `dataset`, `cols`, `reg`:

```js
// v1 (two steps, superseded):
{calc:{screen:"data",dataset:"d1",cols:["Mois","Interv."]}}
{calc:{screen:"graph",dataset:"d1",reg:"affine"}}

// v2 (one step):
{calc:{dataset:"d1",cols:["Mois","Interv."],reg:"affine"}}
```

`datasets` on the séance is unchanged — still the single source of truth
both screens read from; nothing here reopens that decision.

**Migration:** the two existing exercises in `stat2var-ms.js` (séance 1,
affine; séance 2, exponentielle) move from their current two-step `calc`
pairs to the new one-step form as part of this work, not left on the old
shape.

## Component architecture

`Shell.svelte` keeps receiving the real dataset via its existing `points`
prop (unchanged from v1) and is the only place that ever holds the correct
values — that's what lets it both validate entry and drive the regression
from a single source, same principle as v1's "one shared dataset".

- `Shell.svelte` — gains `$state` for the active screen (`'data' | 'graph'`,
  default `'data'`) and a per-cell entry-state array (typed string + ok/no/
  unset), derived by checking each typed value against `points` with
  `checkNumeric`. Renders the two tab controls. Passes the entry-state array
  down to `DataScreen` (for rendering) and, once every cell is confirmed,
  passes `points` itself down to `GraphScreen` (unset otherwise, which is
  what triggers the "incomplete" placeholder).
- `DataScreen.svelte` — becomes an editable table: each cell an `<input>`
  (see "Data entry" above) instead of static text. It never sees the correct
  values — only the entry-state array to render — and reports each keystroke
  up to `Shell` via an `onedit(row, col, value)` callback prop, the same
  outward-callback shape `QuizInput` uses (`onCorrect`), except the checking
  itself happens in `Shell`, not in this component.
- `GraphScreen.svelte` — unchanged rendering logic (still driven by
  `regression.js`, still one shared computation) when it receives `points`;
  gains the "incomplete" placeholder branch for when `Shell` hasn't passed
  `points` yet (not every cell confirmed).
- `regression.js`, `format.js` — unchanged.
- Wiring (`src/routes/c/[id]/[n]/+page.svelte`) — the `{#if st.calc}` branch
  drops the `calcPoints` prop name change is not needed (still passes the
  dataset), just stops branching on `calc.screen` since that field is gone.

## Testing

- `answer-check.js` reuse is exercised by its own existing tests; no new
  logic to unit-test there.
- New behaviour worth a component-level check: a `DataScreen` reports a cell
  as confirmed only when the typed value matches the dataset (mirrors the
  existing `checkAnswer` test coverage, just exercised through the new
  callback wiring).
- `npm run build`: full prerender must stay green, same bar as v1.
- Manual verification in a real course step (both migrated `stat2var-ms`
  exercises) before shipping, with real screenshots — same discipline used
  for every visual change this session, not just a code review.
