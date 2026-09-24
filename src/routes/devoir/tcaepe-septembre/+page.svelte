<script>
  import { VERSIONS } from '$lib/data/devoir-tcaepe-septembre.js';

  const CATS = ['Crèche', 'Famille', 'Baby-sitter', 'Centre de loisirs'];

  function pickRandom() {
    return VERSIONS[Math.floor(Math.random() * VERSIONS.length)];
  }

  let current = $state(pickRandom());

  function reroll() {
    current = pickRandom();
  }

</script>

<svelte:head>
  <title>Devoir — les outils du mois de septembre — TC AEPE — MrPayet</title>
</svelte:head>

<div class="wrap">
  <div class="bar no-print">
    <span class="tag">Terminale CAP AEPE &middot; 30 minutes &middot; sur 16 points</span>
    <div class="btns">
      <button class="p" onclick={reroll}>🎲 Nouveau sujet aléatoire</button>
      <button class="gh" onclick={() => window.print()}>🖨️ Imprimer ce sujet</button>
    </div>
  </div>

  <h1>Évaluation — les outils du mois de septembre</h1>
  <p class="version">Version {current.v}</p>
  <p class="meta">Nom : <span class="fill"></span> &middot; Date : <span class="fill short"></span></p>
  <p class="note"><strong>Sans calculatrice, sans téléphone et sans assistant numérique.</strong>
  Les calculs, bâtons, choix d'arrondi et vérifications doivent être visibles sur la copie.</p>

  <section>
    <h2>Partie 1 — Salles d'accueil <span class="pts">(4 points)</span></h2>
    <div class="cadre">
      <p>La crèche a deux salles : <strong>{current.salle1Nom} ({current.salle1M2} m²)</strong>
      et <strong>{current.salle2Nom} ({current.salle2M2} m²)</strong>. Règle : au moins
      <strong>3 m²</strong> par enfant. Ce matin, <strong>{current.attendus} enfants</strong>
      sont attendus.</p>
    </div>
    <ol>
      <li>Capacité maximale de la salle {current.salle1Nom} : {current.salle1M2} ÷ 3 =
      <span class="trou"></span> enfants. <span class="pts">(1 pt)</span></li>
      <li>Capacité maximale de la salle {current.salle2Nom} : {current.salle2M2} ÷ 3 =
      <span class="trou"></span> enfants. <span class="pts">(1 pt)</span></li>
      <li>Capacité totale des deux salles : écris le calcul puis le résultat.
      <span class="rep court"></span> <span class="pts">(1 pt)</span></li>
      <li>Peut-on accueillir les {current.attendus} enfants aujourd'hui ? Si non, combien sont
      en trop ? Justifie avec une phrase courte. <span class="rep"></span>
      <span class="pts">(1 pt)</span></li>
    </ol>
  </section>

  <section>
    <h2>Partie 2 — Construire un diagramme en bâtons <span class="pts">(8 points)</span></h2>
    <div class="cadre">
      <p>Une crèche a interrogé <strong>16 familles</strong> sur leur mode de garde préféré
      pendant les vacances. Voici les 16 réponses :</p>
    </div>
    <table class="brut">
      <tbody>
        {#each [0, 4, 8, 12] as start}
          <tr>
            {#each current.raw.slice(start, start + 4) as r}
              <td>{r}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    <ol>
      <li><strong>Dépouille</strong> en faisant un bâton ( | ) par réponse dans la bonne case,
      puis compte les bâtons pour remplir l'effectif. Vérifie que le total fait 16.
      <span class="pts">(3 pts)</span></li>
    </ol>
    <table class="tally">
      <thead>
        <tr><th>Réponse</th>{#each CATS as c}<th>{c}</th>{/each}<th>Total</th></tr>
      </thead>
      <tbody>
        <tr><th>Bâtons</th>{#each CATS as c}<td></td>{/each}<td></td></tr>
        <tr><th>Effectif</th>{#each CATS as c}<td></td>{/each}<td></td></tr>
      </tbody>
    </table>
    <ol start="2">
      <li><strong>Trace</strong> le diagramme en bâtons directement dans le cadre ci-dessous —
      choisis toi-même l'échelle de l'axe vertical. <span class="pts">(4 pts)</span></li>
    </ol>
    <figure>
      <svg viewBox="0 0 480 300" role="img" aria-label="diagramme en bâtons vierge, axe vertical gradué de 1 en 1 jusqu'à 8, quatre emplacements">
        <rect width="480" height="300" fill="#ffffff" />
        <g stroke="#ccc" stroke-width="1">
          {#each [16, 44, 72, 100, 128, 156, 184, 212, 240] as y}
            <line x1="50" y1={y} x2="450" y2={y} />
          {/each}
        </g>
        <g font-size="10" fill="#333" text-anchor="end">
          {#each [[0, 244], [1, 216], [2, 188], [3, 160], [4, 132], [5, 104], [6, 76], [7, 48], [8, 20]] as [n, y]}
            <text x="45" y={y}>{n}</text>
          {/each}
        </g>
        <g stroke="#111" stroke-width="2" fill="none">
          <line x1="50" y1="10" x2="50" y2="240" />
          <line x1="50" y1="240" x2="450" y2="240" />
        </g>
        <text x="14" y="125" font-size="11" fill="#111" transform="rotate(-90 14 125)">Effectif (familles)</text>
        <text x="250" y="295" font-size="11" fill="#111" text-anchor="middle">Mode de garde</text>
        <g stroke="#999" stroke-width="1" stroke-dasharray="3,2" fill="none">
          <rect x="75" y="10" width="60" height="230" />
          <rect x="185" y="10" width="60" height="230" />
          <rect x="295" y="10" width="60" height="230" />
          <rect x="405" y="10" width="60" height="230" />
        </g>
        <g font-size="10" fill="#111" text-anchor="middle">
          <text x="105" y="257">Crèche</text>
          <text x="215" y="257">Famille</text>
          <text x="325" y="257">Baby-sitter</text>
          <text x="435" y="257">Centre de</text>
          <text x="435" y="268">loisirs</text>
        </g>
      </svg>
    </figure>
    <ol start="3">
      <li>Quel mode de garde est le plus choisi ? Le moins choisi ? Explique en citant les deux
      effectifs. <span class="rep court"></span> <span class="pts">(1 pt)</span></li>
    </ol>
  </section>

  <section>
    <h2>Partie 3 — Histoires de division <span class="pts">(4 points)</span></h2>
    <ol>
      <li>{current.crayonsTotal} crayons de couleur, boîtes de {current.crayonsParBoite} :
      combien de boîtes complètes peut-on remplir ? Écris le calcul.
      <span class="rep court"></span> <span class="pts">(1 pt)</span></li>
      <li>{current.tablesEnfants} enfants, 1 table pour {current.tablesPar} enfants : combien de
      tables faut-il installer ? Arrondis-tu vers le haut ou vers le bas ? Pourquoi (ou la
      division tombe-t-elle juste) ? <span class="rep"></span><span class="rep"></span>
      <span class="pts">(3 pts)</span></li>
    </ol>
  </section>
</div>

<style>
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 24px 20px 60px;
    font-size: 14px;
    line-height: 1.5;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--line);
  }
  .tag {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .btns {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  button.p,
  button.gh {
    font-family: var(--sm);
    font-size: 13px;
    padding: 9px 14px;
    border-radius: var(--r);
    cursor: pointer;
    border: 1px solid var(--g3);
  }
  button.p {
    background: var(--g3);
    color: #0a1410;
    font-weight: 700;
  }
  button.gh {
    background: transparent;
    color: var(--tx);
    border-color: var(--line2);
  }
  .version {
    font-family: var(--sm);
    color: var(--g2);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 2px 0 10px;
  }
  .meta {
    color: var(--dim);
    font-size: 13px;
    margin-bottom: 10px;
  }
  .fill {
    display: inline-block;
    border-bottom: 1px solid var(--line2);
    min-width: 60px;
  }
  .fill.short {
    min-width: 36px;
  }
  .note {
    margin-bottom: 14px;
  }
  h2 {
    margin-top: 22px;
    font-size: 17px;
  }
  .pts {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
    font-weight: normal;
  }
  .cadre {
    border: 1px solid var(--line);
    background: var(--surf);
    border-radius: var(--r);
    padding: 10px 14px;
    margin: 10px 0;
  }
  ol {
    margin: 8px 0 8px 20px;
    padding: 0;
  }
  li {
    margin: 6px 0;
  }
  .trou {
    display: inline-block;
    border-bottom: 1px dotted var(--line2);
    width: 46px;
    height: 16px;
    vertical-align: bottom;
  }
  .rep {
    display: block;
    border-bottom: 1px dotted var(--line2);
    height: 22px;
    margin: 4px 0;
  }
  .rep.court {
    display: inline-block;
    width: 90px;
    height: 16px;
    vertical-align: bottom;
    margin: 0;
  }
  table.brut,
  table.tally {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    font-size: 13px;
  }
  table.brut td,
  table.tally td,
  table.tally th {
    border: 1px solid var(--line2);
    padding: 6px 8px;
    text-align: center;
  }
  table.tally td {
    height: 26px;
  }
  table.tally th {
    background: var(--surf2);
    font-size: 12px;
  }
  figure {
    margin: 10px 0;
  }
  figure svg {
    width: 100%;
    max-width: 480px;
    display: block;
    background: #fff;
    border-radius: 4px;
  }

  @media print {
    :global(nav),
    .no-print {
      display: none !important;
    }
    .wrap {
      max-width: none;
      padding: 0;
    }
  }
</style>
