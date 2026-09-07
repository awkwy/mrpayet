<script>
  import { base } from '$app/paths';

  let { course, current, doneSet } = $props();
  let open = $state(false);

  function onKeydown(e) {
    if (e.key === 'Escape') open = false;
  }
</script>

<svelte:window onkeydown={onKeydown} />

<button type="button" class="toggle" onclick={() => (open = true)} aria-label="Sommaire des chapitres">☰ Sommaire</button>

{#if open}
  <div class="overlay" onclick={() => (open = false)} role="presentation"></div>
  <nav class="drawer" aria-label="Sommaire des chapitres">
    <div class="dh">
      <span>{course.titre}</span>
      <button type="button" class="close" onclick={() => (open = false)} aria-label="Fermer">✕</button>
    </div>
    {#each course.seances as se, i}
      <a
        class="drow"
        class:current={i === current}
        href="{base}/c/{course.id}/{i}"
        onclick={() => (open = false)}
      >
        <span class="ck" class:on={doneSet.has(course.id + '/' + i)}>{doneSet.has(course.id + '/' + i) ? '✓' : i + 1}</span>
        <span>{se.t}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  .toggle {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
    background: none;
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 6px 10px;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20;
  }
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(320px, 85vw);
    background: var(--surf2);
    border-right: 1px solid var(--line);
    z-index: 21;
    overflow-y: auto;
    padding: 16px;
  }
  .dh {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--tx);
    font-weight: 600;
    margin-bottom: 14px;
    gap: 8px;
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 16px;
  }
  .drow {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 8px;
    border-radius: 6px;
    color: var(--dim);
    font-size: 14px;
  }
  .drow.current {
    background: var(--surf3);
    color: var(--tx);
  }
  .ck {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--line2);
    font-family: var(--sm);
    font-size: 10px;
    flex-shrink: 0;
  }
  .ck.on {
    color: var(--g);
    border-color: var(--g3);
  }
</style>
