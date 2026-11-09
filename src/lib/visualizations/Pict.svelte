<script>
  /* Pictogrammes des types de situation du registre de la médiation. Trait au
   * couleurs du site (var(--…)) : le type se reconnaît à la FORME + au libellé,
   * jamais à la seule couleur. 40×40. */
  let { type, size = 34 } = $props();
</script>

<svg viewBox="0 0 40 40" width={size} height={size} role="img" aria-label={type} class="pict">
  {#if type === 'dispute'}
    <circle cx="12" cy="12" r="5.5" fill="var(--blue)" />
    <circle cx="28" cy="12" r="5.5" fill="var(--tx)" />
    <rect x="5" y="20" width="14" height="15" rx="5" fill="var(--blue)" />
    <rect x="21" y="20" width="14" height="15" rx="5" fill="var(--tx)" />
    <path d="M18 3 L22 10.5 L18.5 10.5 L22.5 19" stroke="var(--warn)" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round" />
  {:else if type === 'insultes'}
    <path d="M5 6h30a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H19l-8 8v-8H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="none" stroke="var(--tx)" stroke-width="2" />
    <text x="20" y="22" font-size="13" text-anchor="middle" font-weight="bold" fill="var(--tx)" font-family="var(--sm)">!#?</text>
  {:else if type === 'objet'}
    <rect x="11" y="3" width="18" height="33" rx="3.5" fill="var(--surf3)" stroke="var(--tx)" stroke-width="2" />
    <text x="20" y="27" font-size="19" text-anchor="middle" font-weight="bold" fill="var(--tx)" font-family="var(--sm)">?</text>
    <rect x="16" y="6" width="8" height="1.8" fill="var(--tx)" />
  {:else}
    <circle cx="20" cy="20" r="16" fill="none" stroke="var(--tx)" stroke-width="2" />
    <circle cx="12" cy="20" r="2.6" fill="var(--tx)" />
    <circle cx="20" cy="20" r="2.6" fill="var(--tx)" />
    <circle cx="28" cy="20" r="2.6" fill="var(--tx)" />
  {/if}
</svg>

<style>
  .pict {
    display: block;
    flex-shrink: 0;
  }
</style>
