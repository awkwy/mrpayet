<script>
  /** Rend un sprite pixel-art (voir `$lib/pixel/sprites.js`) en grille de
      <rect> SVG — un carré par caractère peint du bitmap. `ink` colore les
      pixels '#', `accent` colore les pixels '+' ; un même bitmap se
      redessine ainsi dans plusieurs tons (ex. étoile pleine vs verrouillée)
      sans dupliquer le dessin. `shape-rendering: crispEdges` +
      `image-rendering: pixelated` gardent les arêtes nettes au
      redimensionnement — le rendu retro voulu plutôt qu'un flou anti-alias. */
  let { bitmap, ink = 'var(--tx)', accent = 'var(--warn)', size = 28, label = '' } = $props();

  let cols = $derived(bitmap[0].length);
  let rows = $derived(bitmap.length);
  let cells = $derived(
    bitmap.flatMap((row, y) =>
      [...row].map((ch, x) => ({ x, y, ch })).filter((c) => c.ch !== '.')
    )
  );
</script>

<svg
  class="pixel-icon"
  viewBox="0 0 {cols} {rows}"
  width={size}
  height={(size * rows) / cols}
  role={label ? 'img' : 'presentation'}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  {#each cells as c (c.x + ',' + c.y)}
    <rect x={c.x} y={c.y} width="1" height="1" fill={c.ch === '+' ? accent : ink} />
  {/each}
</svg>

<style>
  .pixel-icon {
    display: block;
    shape-rendering: crispEdges;
    image-rendering: pixelated;
    flex-shrink: 0;
  }
</style>
