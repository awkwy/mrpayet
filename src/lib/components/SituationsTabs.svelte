<script>
  // Rendu en onglets (flowbite-svelte Tabs/TabItem) d'un petit ensemble de
  // situations à comparer, chacune illustrée — remplace un tableau large qui
  // forçait un défilement horizontal sur mobile (voir AGENTS.md, étape
  // « Trois milieux, trois risques »). `tabStyle="none"` désactive tout le
  // thème visuel par défaut de flowbite-svelte (classes Tailwind gray/primary
  // qui jureraient avec la palette néon du site) : seuls la structure ARIA et
  // l'état sélectionné/non sélectionné sont réutilisés, l'apparence vient
  // entièrement du CSS scoped ci-dessous, en tokens.css. Nouveau champ
  // d'étape distinct de `doc:{h,r}` (jamais retiré du rendu tableau
  // générique) : `situations:[{t, illus, fields:[[label,value],...]}, …]`.
  import { Tabs, TabItem } from 'flowbite-svelte';
  import SituationIllus from './pixel/SituationIllus.svelte';
  import '$lib/styles/flowbite.css';

  let { situations } = $props();
</script>

<div class="situations">
  <Tabs tabStyle="none" class="situ-list">
    {#each situations as s (s.t)}
      <TabItem
        title={s.t}
        tabStyle="none"
        activeClass="situ-tab situ-tab-active"
        inactiveClass="situ-tab"
      >
        <div class="situ-body">
          <SituationIllus illus={s.illus} label={s.t} size={92} />
          <dl class="situ-fields">
            {#each s.fields as [label, value] (label)}
              <div class="situ-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            {/each}
          </dl>
        </div>
      </TabItem>
    {/each}
  </Tabs>
</div>

<style>
  .situations :global(.situ-list) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
  }
  .situations :global(.situ-tab) {
    display: inline-block;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
    background: var(--surf2);
    border: 1px solid var(--line2);
    border-radius: var(--r);
    padding: 8px 12px;
    cursor: pointer;
  }
  .situations :global(.situ-tab:hover) {
    color: var(--tx);
    border-color: var(--g3);
  }
  .situations :global(.situ-tab-active) {
    color: var(--g);
    background: var(--surf3);
    border-color: var(--g3);
  }
  .situ-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .situ-fields {
    display: grid;
    gap: 10px;
    width: 100%;
    margin: 0;
  }
  .situ-row {
    display: grid;
    gap: 2px;
  }
  .situ-row dt {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .situ-row dd {
    margin: 0;
    color: var(--tx);
  }
</style>
