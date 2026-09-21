<script>
  import Multimetre from '$lib/visualizations/multimetre.svelte';
</script>

<svelte:head>
  <title>Utiliser un multimètre — Tutoriel — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Tutoriel</p>
  <h1>Utiliser un multimètre</h1>
  <p class="intro">
    Au CCF de physique-chimie, une partie de l'épreuve se passe devant l'examinateur : il te demande de
    manipuler un appareil de mesure et d'expliquer ce que tu fais. Ce tutoriel entraîne exactement ce
    geste — choisir la bonne position, la bonne borne, et placer les sondes au bon endroit — sur un
    circuit simple, avant de le refaire pour de vrai.
  </p>

  <Multimetre />

  <div class="rules">
    <div class="rule">
      <p class="rn">Voltmètre — en parallèle</p>
      <p class="rw">Pour mesurer une tension, les deux sondes se posent <b>aux bornes du dipôle</b>, sans rien débrancher : le circuit reste fermé.</p>
    </div>
    <div class="rule">
      <p class="rn">Ampèremètre — en série</p>
      <p class="rw">Pour mesurer une intensité, il faut <b>ouvrir le circuit</b> et insérer l'appareil dans la coupure : tout le courant doit le traverser.</p>
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
  .rules {
    display: grid;
    gap: 10px;
    margin-top: 22px;
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
