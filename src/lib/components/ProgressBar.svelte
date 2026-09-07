<script>
  let { done, total } = $props();
  let pct = $derived(total ? Math.round((done / total) * 100) : 0);
</script>

<div class="prog">
  <div class="track">
    <div class="fill" style="width:{pct}%"></div>
  </div>
  <span class="lbl">{done}/{total} chapitre{total > 1 ? 's' : ''} terminé{total > 1 ? 's' : ''}</span>
</div>

<style>
  .prog {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .track {
    flex: 1;
    height: 6px;
    border-radius: 4px;
    background: var(--surf3);
    overflow: hidden;
    max-width: 220px;
  }
  .fill {
    height: 100%;
    background: var(--g);
  }
  .lbl {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
    white-space: nowrap;
  }
</style>
