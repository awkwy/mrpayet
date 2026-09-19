<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, rr, SM, fr, createLoop } from './shared.js';

  // vd = {
  //   level1: [{label, p}, ...],
  //   level2: [[{label, p}, ...], ...]  (un tableau de branches par entrée de level1),
  //   favorable: [[i, j], ...] (optionnel — feuilles à mettre en évidence)
  // }
  let { vd } = $props();
  let host;
  const loop = createLoop();

  const leaves = [];
  vd.level1.forEach((l1, i) => (vd.level2[i] || []).forEach((l2, j) => leaves.push({ i, j, l1, l2 })));
  const favSet = new Set((vd.favorable || []).map(([i, j]) => i + ':' + j));
  const ariaLabel =
    'Arbre pondéré. Premier niveau : ' +
    vd.level1.map((l1) => `${l1.label} (probabilité ${fr(l1.p)})`).join(', ') +
    '. ' +
    leaves
      .map(
        (l) =>
          `Depuis ${l.l1.label} : ${l.l2.label} (probabilité ${fr(l.l2.p)})` +
          (favSet.has(l.i + ':' + l.j) ? ', chemin favorable' : '')
      )
      .join('. ');

  onMount(() => {
    const level1 = vd.level1;
    const level2 = vd.level2;
    const favorable = favSet;
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const PAD = 20,
      BOXH = 24,
      GAP = 36;
    const leafY = (k) => PAD + BOXH / 2 + k * GAP;
    // +14 : marge basse pour le libellé d'un nœud du bas de l'arbre, qui se
    // dessine sous le nœud (symétrique du libellé d'un nœud du haut, dessiné
    // au-dessus) plutôt que de s'entasser au-dessus avec les autres.
    const H = leafY(leaves.length - 1) + BOXH / 2 + PAD + 14;

    let k = 0;
    const groups = level1.map((l1, i) => {
      const l2s = level2[i] || [];
      const ys = l2s.map(() => leafY(k++));
      const y1 = ys.reduce((a, b) => a + b, 0) / (ys.length || 1);
      return { l1, y1, l2s, ys };
    });
    const departY = groups.reduce((a, g) => a + g.y1, 0) / (groups.length || 1);

    const { x, W } = cvs(host, H);
    const ctl = box(host, 'vctl', `<button class="p" id="bd">&#8635; Revoir la construction</button>`);
    box(
      host,
      'viz-data',
      `<details><summary>Voir les chemins</summary>` +
        `<table><thead><tr><th>1ᵉʳ niveau</th><th>2ᵉ niveau</th><th>Probabilité</th><th>Chemin favorable</th></tr></thead>` +
        `<tbody>${leaves
          .map(
            (l) =>
              `<tr><td>${l.l1.label} (${fr(l.l1.p)})</td><td>${l.l2.label} (${fr(l.l2.p)})</td>` +
              `<td>${fr((l.l1.p * l.l2.p).toFixed(4))}</td><td>${favorable.has(l.i + ':' + l.j) ? 'oui' : ''}</td></tr>`
          )
          .join('')}</tbody></table></details>`
    );

    const x0 = 26,
      x1 = Math.min(110, W * 0.28),
      x2 = Math.min(W - 100, W * 0.6);

    let grown = 1 + level1.length + leaves.length; // tout construit par défaut

    function draw() {
      x.clearRect(0, 0, W, H);
      x.font = '11.5px ' + SM;

      // départ
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      x.fillText('départ', x0, departY - 16);
      x.fillStyle = '#7ef2b0';
      x.beginPath();
      x.arc(x0, departY, 5, 0, 7);
      x.fill();

      let step = 1;
      groups.forEach((g) => {
        const on1 = grown >= step + 1;
        x.strokeStyle = on1 ? '#46c288' : '#24352e';
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(x0, departY);
        x.lineTo(x1, g.y1);
        x.stroke();
        if (on1) {
          // Nœud du bas de l'arbre (sous le point de départ) : libellé + probabilité
          // dessinés SOUS le nœud, symétrique du nœud du haut où ils sont dessinés
          // au-dessus — évite d'entasser tous les libellés côte à côte au milieu.
          const below = g.y1 > departY;
          x.fillStyle = '#e7efe9';
          x.textAlign = 'center';
          x.fillText(g.l1.label, x1, below ? g.y1 + 31 : g.y1 - 22);
          x.fillStyle = '#8fa79b';
          x.fillText(fr(g.l1.p), x1, below ? g.y1 + 16 : g.y1 - 7);
          x.fillStyle = '#46c288';
          x.beginPath();
          x.arc(x1, g.y1, 4.5, 0, 7);
          x.fill();
        }
        step++;
      });

      leaves.forEach((leaf, idx) => {
        const g = groups[leaf.i];
        const y2 = g.ys[leaf.j];
        const on2 = grown >= step + idx;
        x.strokeStyle = on2 ? '#365046' : '#1a2621';
        x.lineWidth = 1.5;
        x.beginPath();
        x.moveTo(x1, g.y1);
        x.lineTo(x2, y2);
        x.stroke();
        if (on2) {
          x.fillStyle = '#63776d';
          x.textAlign = 'right';
          x.fillText(fr(leaf.l2.p), x2 - 8, y2 - 9);
          const f = favorable.has(leaf.i + ':' + leaf.j);
          const bw = Math.min(150, W - x2 - 12);
          x.fillStyle = f ? '#ffd166' : '#16211d';
          x.strokeStyle = f ? '#ffd166' : '#365046';
          x.lineWidth = 1.4;
          rr(x, x2 + 4, y2 - BOXH / 2, bw, BOXH, 6);
          x.fill();
          x.stroke();
          x.fillStyle = f ? '#04120a' : '#8fa79b';
          x.textAlign = 'center';
          // La largeur du texte varie (labels réels, pas des codes courts fixes) :
          // on réduit la police jusqu'à tenir dans la boîte plutôt que de déborder.
          let fs = 11;
          const maxTextW = bw - 10;
          x.font = fs + 'px ' + SM;
          while (fs > 7 && x.measureText(leaf.l2.label).width > maxTextW) {
            fs -= 1;
            x.font = fs + 'px ' + SM;
          }
          x.fillText(leaf.l2.label, x2 + 4 + bw / 2, y2);
          x.font = '11.5px ' + SM;
        }
      });
    }

    ctl.querySelector('#bd').onclick = () => {
      const totalSteps = 1 + level1.length + leaves.length;
      if (RM) {
        grown = totalSteps;
        draw();
        return;
      }
      grown = 0;
      draw();
      let f0 = 0;
      const step = () => {
        f0++;
        if (f0 % 4 === 0) {
          grown++;
          draw();
        }
        if (grown < totalSteps) loop.raf(step);
      };
      loop.raf(step);
    };

    draw();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz" role="img" aria-label={ariaLabel}></div>
