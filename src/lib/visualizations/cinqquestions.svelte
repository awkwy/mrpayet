<script>
  import { nf } from '$lib/utils/stats-mv.js';
  import { checkNumeric } from '$lib/utils/answer-check.js';

  /* Les 5 questions à se poser avant de répondre : Unité ? Ordre de grandeur ?
   * Arrondi ? Référence ? Phrase ?
   *
   * Quatre situations d'atelier (A à D) présentent chacune un résultat
   * PROPOSÉ qui cache une erreur. L'élève choisit la question qui la ferait
   * découvrir, puis corrige. L'affiche des cinq questions se « allume » au fur
   * et à mesure : une question utilisée = une tuile qui s'éclaire.
   *
   * Couleur : tuile utilisée = --g ; question proposée = --blue. Le mauvais
   * choix n'est pas puni en rouge : la tuile se secoue et le texte explique
   * pourquoi cette question ne révèle pas l'erreur. */

  const Q = [
    { n: 1, t: 'Unité ?', d: 'Tout est dans la même unité ? Ma réponse a-t-elle son unité ?' },
    { n: 2, t: 'Ordre de grandeur ?', d: 'Le résultat est possible pour une vraie voiture, une vraie pièce ?' },
    { n: 3, t: 'Arrondi ?', d: "Combien de chiffres je garde ? Je n'arrondis qu'à la fin." },
    { n: 4, t: 'Référence ?', d: 'J’ai comparé avec le barème, la cote ou le seuil ? Et à quoi ça se rapporte : à ces 5 pièces ou à toute la caisse ?' },
    { n: 5, t: 'Phrase ?', d: 'J’écris ma réponse en une phrase, avec l’unité.' }
  ];

  const SIT = [
    {
      id: 'A',
      title: 'Une vidange est-elle trop longue ?',
      text: "Le barème indique 0,4 h pour une vidange. L'atelier a chronométré 26 min.",
      prop: 'Un apprenti calcule : « 26 − 0,4 = 25,6 : la vidange dure 25,6 de plus que le barème. »',
      ok: [1],
      why: "Il retire des heures à des minutes. Il faut d'abord tout mettre dans la même unité : 0,4 h = 0,4 × 60 = 24 min.",
      fix: { kind: 'num', label: 'La vidange dépasse le barème de combien de minutes ?', a: 2, unit: 'min', sol: '26 − 24 = 2 min : « La vidange dure 2 min de plus que le barème. »' }
    },
    {
      id: 'B',
      title: 'Un pneu bien gonflé ?',
      text: 'Un élève lit sur le manomètre et écrit : « la pression du pneu de la voiture est de 25 bar ». Une voiture de tourisme se gonfle à environ 2 à 3 bar.',
      prop: 'Valeur proposée : 25 bar.',
      ok: [2],
      why: "25 bar, c'est huit à dix fois trop pour une voiture : un pneu éclaterait. C'est impossible, donc l'élève a oublié la virgule.",
      fix: { kind: 'num', label: 'Valeur corrigée (en bar)', a: 2.5, unit: 'bar', sol: '2,5 bar : la virgule était oubliée.' }
    },
    {
      id: 'C',
      title: 'Le chef d’atelier a-t-il raison ?',
      text: 'On contrôle 5 durites dans une caisse de 500 : 1 est défectueuse. Le chef dit : « Cette caisse a 20 % de pièces défectueuses. »',
      prop: 'Le chef conclut pour toute la caisse à partir de 5 durites.',
      ok: [4, 5],
      why: "Sur 5 pièces, 1 sur 5 fait bien 20 %, mais c'est la fréquence de l'échantillon, pas celle de la caisse de 500. Un échantillon de 5 est trop petit : une autre poignée de 5 donnerait autre chose (fluctuation).",
      fix: { kind: 'yesno', label: 'Peut-on dire que toute la caisse est à 20 % ?', a: 'non', sol: 'Non : « Sur 5 durites contrôlées, 1 est défectueuse (20 %). Il faut en contrôler beaucoup plus pour parler de toute la caisse. »' }
    },
    {
      id: 'D',
      title: 'Combien de chiffres écrire ?',
      text: 'La durée moyenne de 24 vidanges (durées relevées à la minute près) donne à la calculatrice : 25,41666667 min.',
      prop: 'Un élève écrit : « 25,41666667 min ».',
      ok: [3],
      why: "Les durées sont relevées à la minute près : écrire huit décimales promet une précision qui n'existe pas. On arrondit à la fin, au dixième.",
      fix: { kind: 'num', label: 'Je l’écris au dixième (en min)', a: 25.4, tol: 0.001, unit: 'min', sol: '25,4 min : « Une vidange dure en moyenne 25,4 min. »' }
    }
  ];

  let cur = $state(0);
  let found = $state(SIT.map(() => 0)); // question trouvée (n) par situation
  let shake = $state(0);
  let tryMsg = $state('');
  let fixVal = $state(SIT.map(() => ''));
  let fixOk = $state(SIT.map(() => false));
  let lit = $derived(new Set(found.filter(Boolean)));
  let done = $derived(fixOk.filter(Boolean).length);

  const S = $derived(SIT[cur]);

  function pick(n) {
    if (found[cur]) return;
    if (S.ok.includes(n)) {
      found[cur] = n;
      tryMsg = '';
    } else {
      shake = n;
      tryMsg = `« ${Q[n - 1].t} » est une bonne habitude, mais elle ne révèle pas l'erreur ici. Relis le résultat proposé.`;
      setTimeout(() => (shake = 0), 450);
    }
  }
  function check(i) {
    const f = SIT[i].fix;
    const v = fixVal[i];
    if (f.kind === 'yesno') fixOk[i] = String(v).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === f.a;
    else fixOk[i] = checkNumeric(v, f.a, f.tol ?? 0);
  }
</script>

<div class="viz cq">
  <div class="poster" role="list" aria-label="Les 5 questions">
    {#each Q as q}
      <div class="tile" role="listitem" class:on={lit.has(q.n)} class:shake={shake === q.n} title={q.d}>
        <span class="n">{q.n}</span>
        <span class="t">{q.t}</span>
      </div>
    {/each}
  </div>

  <div class="tabs" role="tablist" aria-label="Situations">
    {#each SIT as s, i}
      <button role="tab" aria-selected={cur === i} class:on={cur === i} class:ok={fixOk[i]} onclick={() => ((cur = i), (tryMsg = ''))}>
        {s.id}{fixOk[i] ? ' ✓' : ''}
      </button>
    {/each}
  </div>

  <div class="card">
    <h4>Situation {S.id} — {S.title}</h4>
    <p>{S.text}</p>
    <p class="prop"><b>À vérifier.</b> {S.prop}</p>

    {#if !found[cur]}
      <p class="ask">Quelle question te fait découvrir le problème ?</p>
      <div class="qs">
        {#each Q as q}
          <button type="button" class="qb" class:shake={shake === q.n} onclick={() => pick(q.n)}>
            <span class="n">{q.n}</span> {q.t}
          </button>
        {/each}
      </div>
      {#if tryMsg}<p class="say" aria-live="polite">{tryMsg}</p>{/if}
    {:else}
      <p class="say win" aria-live="polite">
        Bien vu : <b>{Q[found[cur] - 1].n}. {Q[found[cur] - 1].t}</b> {S.why}
      </p>
      <div class="fix">
        <label for="fx{cur}">{S.fix.label}</label>
        <div class="row">
          {#if S.fix.kind === 'yesno'}
            {#each ['oui', 'non'] as yn}
              <button type="button" class="yn" class:sel={fixVal[cur] === yn} onclick={() => ((fixVal[cur] = yn), check(cur))}>{yn === 'oui' ? 'Oui' : 'Non'}</button>
            {/each}
          {:else}
            <input id="fx{cur}" type="text" inputmode="decimal" autocomplete="off" bind:value={fixVal[cur]} oninput={() => check(cur)} />
            <span class="u">{S.fix.unit}</span>
          {/if}
          <span class="mk" aria-hidden="true">{fixOk[cur] ? '✓' : ''}</span>
        </div>
        {#if fixOk[cur]}<p class="sol" aria-live="polite">{S.fix.sol}</p>{/if}
      </div>
    {/if}
  </div>

  <p class="prog">{done} / {SIT.length} situations corrigées · {lit.size} / 5 questions utilisées</p>
</div>

<style>
  .poster {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 7px 2px;
    border: 1px dashed var(--line2);
    border-radius: 9px;
    background: var(--surf);
    transition:
      background 0.5s,
      border-color 0.5s,
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .tile .n {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid var(--line2);
    font-family: var(--sm);
    font-size: 11.5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--dim2);
  }
  .tile .t {
    font-family: var(--sm);
    font-size: 8.8px;
    letter-spacing: 0.02em;
    text-align: center;
    color: var(--dim2);
    line-height: 1.15;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }
  .tile.on {
    border-style: solid;
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 13%, var(--surf));
    transform: translateY(-2px);
  }
  .tile.on .n {
    background: var(--g);
    border-color: var(--g);
    color: var(--bg);
  }
  .tile.on .t {
    color: var(--g);
  }
  .tile.shake,
  .qb.shake {
    animation: shake 0.42s ease;
  }
  @keyframes shake {
    20% {
      transform: translateX(-5px);
    }
    45% {
      transform: translateX(5px);
    }
    70% {
      transform: translateX(-3px);
    }
  }
  .tabs {
    display: flex;
    gap: 6px;
    margin-top: 14px;
  }
  .tabs button {
    flex: 1;
    padding: 8px 0;
    border: 1px solid var(--line2);
    border-radius: 8px;
    background: var(--surf);
    color: var(--dim);
    font-family: var(--sm);
    font-weight: 700;
  }
  .tabs button.on {
    border-color: var(--blue);
    color: var(--blue);
    background: color-mix(in srgb, var(--blue) 9%, var(--surf));
  }
  .tabs button.ok:not(.on) {
    border-color: var(--g3);
    color: var(--g);
  }
  .card {
    margin-top: 10px;
    padding: 12px;
    border: 1px solid var(--line2);
    border-radius: 11px;
    background: var(--surf);
  }
  h4 {
    margin: 0 0 6px;
    font-family: var(--sm);
    font-size: 13.5px;
    color: var(--tx);
  }
  .card p {
    margin: 6px 0;
    font-size: 14.5px;
    color: var(--dim);
  }
  .prop {
    padding: 8px 10px;
    border-left: 2.5px solid var(--blue);
    background: color-mix(in srgb, var(--blue) 7%, transparent);
    border-radius: 0 7px 7px 0;
    color: var(--tx) !important;
  }
  .ask {
    color: var(--tx) !important;
    margin-top: 12px !important;
  }
  .qs {
    display: grid;
    gap: 6px;
  }
  .qb {
    display: flex;
    align-items: center;
    gap: 9px;
    text-align: left;
    padding: 8px 11px;
    border: 1px solid var(--line2);
    border-radius: 9px;
    background: var(--surf3);
    color: var(--tx);
    font-size: 14.5px;
  }
  .qb:active {
    transform: scale(0.98);
  }
  .qb .n {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--bg);
    border: 1px solid var(--line2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--sm);
    font-size: 11.5px;
    color: var(--blue);
  }
  .say.win {
    border-left-color: var(--g);
  }
  .fix {
    margin-top: 12px;
  }
  .fix label {
    display: block;
    color: var(--tx);
    font-size: 14.5px;
    margin-bottom: 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .row input {
    width: 8em;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 7px;
    padding: 8px 10px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
  }
  .yn {
    padding: 7px 18px;
    border: 1px solid var(--line2);
    border-radius: 8px;
    background: var(--surf3);
    color: var(--tx);
  }
  .yn.sel {
    border-color: var(--blue);
    background: color-mix(in srgb, var(--blue) 12%, var(--surf3));
  }
  .u {
    color: var(--dim2);
  }
  .mk {
    color: var(--g);
    font-family: var(--sm);
    width: 1.2em;
  }
  .sol {
    color: var(--g) !important;
    animation: rise 0.45s ease both;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
  }
  .prog {
    margin: 10px 0 0;
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
  }
</style>
