# NumWorks calculator steps — design

Date: 2026-09-19
Status: approved by the captain in chat, spec written for the record before implementation.

## Motivation

The captain's students sit their exams with a physical NumWorks calculator
(github.com/numworks/epsilon). The site should let them practice the actual
calculator workflow — not just the underlying maths — restyled in the site's
own design language, embedded directly in a course's steps rather than as a
separate widget or popup.

Concretely, for a regression exercise: one step shows the NumWorks data-entry
screen with the exercise's (x, y) values; the next step (reached by scrolling,
like any other step) shows the graph screen with the regression curve and the
regression-type choice — mirroring the real calculator's Statistiques →
Régression workflow, but skipping the "press the graph tab" navigation, since
the site's steps already are the navigation.

## Non-goals for this slice

- Not a pixel-accurate skin of the real NumWorks firmware (grey/white
  chassis, exact fonts). Functionally faithful screens and workflow, visually
  in the site's own tokens (`--bg`, `--surf`, `--g2`, …).
- Not a general-purpose calculator emulator covering every NumWorks app.
  Scope is Statistiques → Régression only (see "v1 scope" below).
- Not a draggable/floating popup (an earlier, now-superseded idea — see
  project memory "NumWorks calculator idea"). The calculator screens are
  inline content blocks in the normal step flow, like the site's existing
  `img`/`doc` step content.
- No scroll-jacking or custom parallax machinery. The site's steps already
  render as stacked blocks the student scrolls through; that alone gives the
  "scrolling reveals the next calculator state" effect. Motion/parallax
  polish is an optional later addition, not part of this design.

## Core idea: one shared dataset per exercise

Today, numeric content in a course step is hand-authored per step (see
`src/lib/data/courses/*.js`): a question's answer is typed by whoever wrote
the file, independently of any other step. For NumWorks regression steps,
that would let the data-entry screen and the graph screen silently disagree
if someone edited one without the other.

Instead, each regression exercise defines **one dataset** (an array of
`[x, y]` points) once, and every calculator screen that exercise uses reads
from that same dataset. The regression coefficients shown on the graph
screen are computed **live**, from that dataset, by an actual regression
function — never hand-typed by the course author. Changing the dataset
changes both screens together; there is no way for them to disagree.

## Data model

Datasets live once per séance, next to its `steps` array:

```js
{t:"Le devis...", datasets:{d1:[[1,15.5],[3,22.5],[6,33],[9,43.5]]},
 steps:[
  {t:"Saisir les données", calc:{screen:"data", dataset:"d1", cols:["X","Y"]}},
  ...
  {t:"Lire le graphique", calc:{screen:"graph", dataset:"d1", reg:"affine"}}
 ]}
```

`calc` is a new optional field on a step object, following the same pattern
as the existing `img`/`doc`/`viz`/`q` fields (see `courses/calculs-commerciaux.js`
for the established step-field conventions). A step can carry a `calc` field
alongside its existing fields (`apport`, `q`, …) exactly like any other.

`screen` selects which calculator screen component to render; `dataset`
names an entry in the séance's `datasets` map; screen-specific options
(`cols`, `reg`, …) configure that screen.

## Component architecture

A new component family, separate from `src/lib/visualizations/` (those are
single-purpose canvas widgets; this needs several screen types sharing one
piece of state, closer to a tiny app than a single widget):

- `src/lib/numworks/Shell.svelte` — the calculator's proportions and chrome
  (title bar, screen area), in the site's tokens.
- `src/lib/numworks/DataScreen.svelte` — the data-entry/edit table (columns
  X/Y, one row per point).
- `src/lib/numworks/GraphScreen.svelte` — scatter plot + regression curve,
  with the regression-type indicator.
- `src/lib/numworks/regression.js` — the actual math. v1: affine
  (least-squares: a = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²), b = (Σy − aΣx) / n),
  unit-tested the same way `progression.test.js` tests `progression.js`.
- Wiring: `src/routes/c/[id]/[n]/+page.svelte` (the step renderer) grows a
  `{#if step.calc}` branch, resolves `step.calc.dataset` against
  `data.seance.datasets`, and renders the matching screen component inside
  `Shell.svelte`.

## v1 scope

Statistiques → Régression, **affine regression only**. This matches what
the current courses actually teach (`stat2var-ms.js` séance 1).

**Deliberately out of v1, flagged for a fast follow-up:** NumWorks' own
regression menu also offers Exponentielle and Logarithmique directly — which
is actually a more faithful way to teach `stat2var-ms.js` séance 2's
"ajustement non affine" (currently taught via a manual z = log(y) change of
variable) than the workaround used there, since the real calculator does
that fit directly. Once affine is solid, extending `regression.js` and
`GraphScreen.svelte` with those two types is the natural next slice — not
bundled into this one, to keep this slice reviewable.

## Testing

- `regression.js`: unit tests (vitest) covering the affine fit against
  hand-computed values, mirroring `src/lib/data/progression.test.js`.
- `npm run build`: existing full prerender check must stay green (a
  malformed `calc`/`dataset` reference should fail the build the same way a
  bad `blocId` reference does today, not fail silently at runtime).
- Manual check in a real course step before shipping the first exercise that
  uses it, since this is new rendering surface with no existing coverage to
  lean on.
