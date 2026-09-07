<script>
  import { page } from '$app/state';
  import { base } from '$app/paths';

  const links = [
    { href: `${base}/`, label: 'Accueil', match: (p) => p === `${base}/` },
    {
      href: `${base}/cours`,
      label: 'Cours',
      match: (p) =>
        p.startsWith(`${base}/cours`) || p.startsWith(`${base}/p/`) || p.startsWith(`${base}/bloc/`) || p.startsWith(`${base}/c/`)
    },
    { href: `${base}/revisions`, label: 'Révisions', match: (p) => p.startsWith(`${base}/revisions`) || p.startsWith(`${base}/r`) },
    { href: `${base}/flash`, label: 'Flash', match: (p) => p.startsWith(`${base}/flash`) }
  ];
</script>

<nav>
  <a class="brand" href="{base}/">MrPayet</a>
  <div class="links">
    {#each links as l}
      <a href={l.href} class:on={l.match(page.url.pathname)}>{l.label}</a>
    {/each}
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    font-family: var(--sm);
    font-size: 13px;
  }
  .brand {
    color: var(--g);
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .links {
    display: flex;
    gap: 18px;
  }
  a {
    color: var(--dim);
  }
  a.on {
    color: var(--g);
  }
</style>
