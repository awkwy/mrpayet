<script>
  import PhMetre from '$lib/visualizations/ph-metre.svelte';
</script>

<svelte:head>
  <title>Mesurer un pH — Tutoriel — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Tutoriel</p>
  <h1>Mesurer un pH</h1>
  <p class="intro">
    Au CCF de physique-chimie, on te demande de mesurer un pH devant l'examinateur et d'expliquer ce que tu
    observes. Ce tutoriel entraîne le geste — plonger l'électrode, lire la valeur, savoir dire si la
    solution est acide, neutre ou basique — sur deux situations réelles.
  </p>

  <h2 class="h2">Diluer la solution désinfectante avant utilisation</h2>
  <p class="ctx">
    Le protocole d'hygiène de la crèche demande de vérifier le pH d'une solution désinfectante avant de
    l'utiliser sur les tables et les jouets. La solution préparée est trop basique (pH 9) : il faut la
    diluer jusqu'à une valeur acceptable (6,5–7,5) avant de pouvoir l'utiliser.
  </p>
  <PhMetre vd={{ mode: 'dilute', label: 'Solution désinfectante', initial: 9, target: [6.5, 7.5] }} />

  <h2 class="h2">Contrôler l'eau des bornes-fontaines du quartier</h2>
  <p class="ctx">
    Faute d'eau courante chez certains habitants, trois bornes-fontaines du quartier sont très utilisées.
    Un habitant signale une eau au goût inhabituel. Avant de faire remonter l'information au service
    technique, tu contrôles le pH des trois points (la norme pour une eau de consommation est 6,5–8,5).
  </p>
  <PhMetre
    vd={{
      mode: 'compare',
      points: [
        { label: 'Borne A', ph: 7.1 },
        { label: 'Borne B', ph: 5.4 },
        { label: 'Borne C', ph: 8.9 }
      ],
      target: [6.5, 8.5]
    }}
  />

  <div class="rules">
    <div class="rule">
      <p class="rn">Lire un pH</p>
      <p class="rw">pH &lt; 7 : solution <b>acide</b>. pH = 7 : <b>neutre</b>. pH &gt; 7 : solution <b>basique</b>.</p>
    </div>
    <div class="rule">
      <p class="rn">Diluer rapproche du neutre</p>
      <p class="rw">Ajouter de l'eau à une solution rapproche toujours son pH de 7, qu'elle soit acide ou basique au départ — sans jamais l'atteindre tout à fait en une seule fois.</p>
    </div>
  </div>
</div>

<style>
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  .eyebrow {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .intro {
    color: var(--dim);
    margin-top: 10px;
  }
  .h2 {
    font-size: 16px;
    margin-top: 34px;
  }
  .ctx {
    color: var(--dim);
    margin-top: 8px;
  }
  .rules {
    display: grid;
    gap: 10px;
    margin-top: 26px;
  }
  .rule {
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .rn {
    color: var(--g);
    font-weight: 600;
  }
  .rw {
    color: var(--dim);
    font-size: 14px;
    margin-top: 4px;
  }
</style>
