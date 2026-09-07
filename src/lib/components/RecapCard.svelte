<script>
  let { r } = $props();
</script>

<div class="rcard">
  <div class="sig"><span class="lbl">Si tu vois</span> {r.sig}</div>
  <div class="met"><span class="lbl">Tu fais</span> {@html r.met}</div>
  <div class="ex"><span class="lbl">Exemple</span> {r.ex}</div>
  <div class="pg"><span class="lbl">Piège</span> {r.pg}</div>
</div>

<style>
  .rcard {
    display: grid;
    gap: 8px;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
    break-inside: avoid;
  }
  .lbl {
    display: inline-block;
    min-width: 78px;
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .sig,
  .ex {
    color: var(--tx);
  }
  .met {
    color: var(--g);
  }
  .pg {
    color: var(--warn);
  }
</style>
