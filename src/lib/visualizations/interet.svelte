<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let C = 3000,
      t = 3,
      mois = 36;
    const { x, W, H } = cvs(host, 170);
    slider(host, 'Capital placé', 500, 10000, 3000, (v) => Math.round(v) + ' €', (v) => {
      C = v;
    });
    slider(host, 'Taux annuel', 1, 8, 3, (v) => v + ' %', (v) => {
      t = v;
    });
    slider(host, 'Durée', 1, 60, 36, (v) => Math.round(v) + ' mois', (v) => {
      mois = v;
    });
    readout(host, [
      { id: 'iI', k: 'intérêts', c: 'w' },
      { id: 'iV', k: 'valeur acquise' },
      { id: 'iN', k: 'durée', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const n = mois / 12,
        I = C * (t / 100) * n,
        V = C + I,
        maxV = 10000 * 1.5;
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        y = 44,
        h = 42;
      const wc = (R - L) * (C / maxV),
        wi = (R - L) * (I / maxV);
      x.fillStyle = '#2b7d57';
      rr(x, L, y, Math.max(2, wc), h, 4);
      x.fill();
      x.fillStyle = '#ffd166';
      rr(x, L + wc, y, Math.max(1, wi), h, 4);
      x.fill();
      x.font = 'bold 12px ' + SM;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      if (wc > 60) {
        x.fillStyle = '#cdeede';
        x.fillText(Math.round(C) + ' €', L + wc / 2, y + h / 2);
      }
      if (wi > 46) {
        x.fillStyle = '#0a0e0c';
        x.fillText('+' + fr(I.toFixed(0)), L + wc + wi / 2, y + h / 2);
      }
      x.textBaseline = 'alphabetic';
      x.font = '10.5px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('capital', L, y - 8);
      x.textAlign = 'right';
      x.fillStyle = '#ffd166';
      x.fillText('intérêts', L + wc + wi, y - 8);
      x.textAlign = 'center';
      x.fillStyle = '#8fa79b';
      x.font = '11px ' + SM;
      x.fillText('valeur acquise : ' + fr(V.toFixed(2)) + ' €', W / 2, H - 12);
      host.querySelector('#iI').textContent = fr(I.toFixed(2)) + ' €';
      host.querySelector('#iV').textContent = fr(V.toFixed(2)) + ' €';
      host.querySelector('#iN').textContent =
        mois < 12 ? Math.round(mois) + ' mois' : fr((mois / 12).toFixed(mois % 12 ? 1 : 0)) + ' an' + (mois >= 24 ? 's' : '');
      say.innerHTML =
        `I = C × t × n = ${Math.round(C)} × ${fr((t / 100).toFixed(2))} × ${fr(n.toFixed(2))} = <b>${fr(I.toFixed(2))} €</b>. ` +
        (mois < 12
          ? `Durée en mois : n = ${Math.round(mois)} ÷ 12 = ${fr(n.toFixed(2))} année.`
          : `L'intérêt est proportionnel à la durée.`) +
        `<br>Valeur acquise = ${Math.round(C)} + ${fr(I.toFixed(2))} = <b>${fr(V.toFixed(2))} €</b>.`;
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
