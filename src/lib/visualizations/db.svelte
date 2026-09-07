<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let lvl = 92;
    const { x, W, H } = cvs(host, 264);
    slider(host, 'Niveau mesuré au sonomètre', 20, 130, 92, (v) => Math.round(v) + ' dB', (v) => {
      lvl = v;
    });
    readout(host, [
      { id: 'dL', k: 'niveau', c: 'w' },
      { id: 'dZ', k: 'zone' }
    ]);
    const say = box(host, 'say', '');
    const cur = new Spring(92, { k: 120, d: 20 });
    const MARKS = [
      [40, 'bibliothèque'],
      [60, 'conversation'],
      [85, 'seuil de DANGER'],
      [100, 'concert'],
      [120, 'seuil de DOULEUR'],
      [130, 'réacteur']
    ];
    function draw() {
      const P = cur.to(lvl).step();
      x.clearRect(0, 0, W, H);
      const L = W * 0.44,
        T = 12,
        B = 12,
        yOf = (v) => H - B - (v / 130) * (H - T - B);
      const g = x.createLinearGradient(0, yOf(0), 0, yOf(130));
      g.addColorStop(0, '#2b7d57');
      g.addColorStop(84 / 130, '#4f9a52');
      g.addColorStop(85 / 130, '#e79a3a');
      g.addColorStop(119 / 130, '#d8863a');
      g.addColorStop(120 / 130, '#e2725b');
      g.addColorStop(1, '#e2725b');
      x.fillStyle = g;
      x.fillRect(L, yOf(130), 24, yOf(0) - yOf(130));
      x.font = '10px ' + SM;
      x.textAlign = 'right';
      x.textBaseline = 'middle';
      MARKS.forEach(([v, lab]) => {
        x.strokeStyle = 'rgba(255,255,255,.18)';
        x.beginPath();
        x.moveTo(L, yOf(v));
        x.lineTo(L + 24, yOf(v));
        x.stroke();
        x.fillStyle = v === 85 || v === 120 ? '#ffd166' : '#8fa79b';
        x.fillText(v + ' · ' + lab, L - 6, yOf(v));
      });
      const y = yOf(P);
      x.fillStyle = '#fff';
      x.fillRect(L - 4, y - 1.5, 32, 3);
      x.beginPath();
      x.moveTo(L + 28, y);
      x.lineTo(L + 38, y - 6);
      x.lineTo(L + 38, y + 6);
      x.closePath();
      x.fill();
      x.font = 'bold 13px ' + SM;
      x.textAlign = 'left';
      x.fillText(Math.round(P) + ' dB', L + 42, y);
      x.textBaseline = 'alphabetic';
      host.querySelector('#dL').textContent = Math.round(P) + ' dB';
      const ze = host.querySelector('#dZ');
      ze.textContent = P < 85 ? 'sans danger immédiat' : P < 120 ? 'zone de danger' : 'seuil de douleur';
      ze.className = 'v ' + (P < 85 ? '' : P < 120 ? 'w' : 'r');
      say.innerHTML =
        P < 85
          ? `${Math.round(P)} dB : en dessous du seuil de danger (85 dB). Écoute prolongée sans risque.`
          : P < 120
            ? `${Math.round(P)} dB : <b>au-dessus du seuil de danger</b> (85 dB). Le risque dépend de la <b>durée</b> d'exposition ; les dommages sont définitifs.`
            : `${Math.round(P)} dB : <b>seuil de douleur</b> (120 dB). Danger immédiat pour l'oreille.`;
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
