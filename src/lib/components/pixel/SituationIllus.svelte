<script>
  import { SITUATION_ILLUS } from '$lib/pixel/situations.js';

  let { illus, size = 96, label = '' } = $props();

  let def = $derived(SITUATION_ILLUS[illus]);
  let cols = $derived(def.bitmap[0].length);
  let rows = $derived(def.bitmap.length);
  let cells = $derived(
    def.bitmap.flatMap((row, y) =>
      [...row].map((ch, x) => ({ x, y, ch })).filter((c) => c.ch !== '.')
    )
  );
</script>

<svg
  class="situ-illus"
  viewBox="0 0 {cols} {rows}"
  width={size}
  height={(size * rows) / cols}
  role={label ? 'img' : 'presentation'}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  {#each cells as c (c.x + ',' + c.y)}
    <rect x={c.x} y={c.y} width="1" height="1" fill={def.palette[c.ch]} />
  {/each}
</svg>

<style>
  .situ-illus {
    display: block;
    margin: 0 auto;
    shape-rendering: crispEdges;
    image-rendering: pixelated;
    flex-shrink: 0;
  }
</style>
