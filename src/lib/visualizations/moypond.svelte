<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const AGES = [1, 2, 3];
    const eff = [10, 20, 10];
    const { x, W, H } = cvs(host, 190);
    AGES.forEach((a, i) => {
      slider(host, a + ' an' + (a > 1 ? 's' : ''), 0, 30, eff[i], (v) => Math.round(v) + ' enfants', (v) => {
        eff[i] = v;
      });
    });
    readout(host, [
      { id: 'pT', k: 'effectif total', c: 'd' },
      { id: 'pS', k: 'somme pondérée', c: 'd' },
      { id: 'pM', k: 'âge moyen' }
    ]);
    const say = box(host, 'say', '');
    const fx = new Spring(0, { k: 140, bounce: true });
    function draw() {
      const E = eff.map((v) => Math.round(v)),
        tot = E.reduce((a, b) => a + b, 0) || 1;
      const somme = E.reduce((s, e, i) => s + e * AGES[i], 0),
        moy = somme / tot;
      const L = 28,
        R = W - 14,
        B = 44,
        T = 22,
        xOf = (a) => L + ((a - 0.4) / 3) * (R - L);
      x.clearRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.15)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(L, H - B);
      x.lineTo(R, H - B);
      x.stroke();
      const mxE = Math.max(...E, 1);
      AGES.forEach((a, i) => {
        const h = (E[i] / mxE) * (H - B - T),
          bx = xOf(a) - 22;
        x.fillStyle = '#46c288';
        rr(x, bx, H - B - h, 44, h, 4);
        x.fill();
        x.font = 'bold 12px ' + SM;
        x.fillStyle = '#e7efe9';
        x.textAlign = 'center';
        if (h > 16) x.fillText(E[i], bx + 22, H - B - h + 14);
        x.font = '10px ' + SM;
        x.fillStyle = '#8fa79b';
        x.fillText(a + ' an' + (a > 1 ? 's' : ''), bx + 22, H - B + 15);
      });
      const gx = xOf(moy);
      if (!fx.x) fx.set(gx);
      const FX = fx.to(gx).step();
      x.strokeStyle = '#ffd166';
      x.lineWidth = 2;
      x.setLineDash([5, 4]);
      x.beginPath();
      x.moveTo(FX, T);
      x.lineTo(FX, H - B);
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = '#ffd166';
      x.beginPath();
      x.moveTo(FX, H - B + 2);
      x.lineTo(FX - 8, H - B + 15);
      x.lineTo(FX + 8, H - B + 15);
      x.closePath();
      x.fill();
      x.font = 'bold 11px ' + SM;
      x.textAlign = 'center';
      x.fillText('moyenne ' + fr(moy.toFixed(2)), Math.max(44, Math.min(W - 44, FX)), H - 12);
      host.querySelector('#pT').textContent = tot;
      host.querySelector('#pS').textContent = somme;
      host.querySelector('#pM').textContent = fr(moy.toFixed(2)) + ' ans';
      say.innerHTML = `Somme pondérée : ${AGES.map((a, i) => a + '×' + E[i]).join(' + ')} = <b>${somme}</b>. Âge moyen : ${somme} ÷ ${tot} = <b>${fr(moy.toFixed(2))} ans</b>.<br>Déplace les effectifs : deux répartitions très différentes peuvent donner le même âge moyen.`;
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
