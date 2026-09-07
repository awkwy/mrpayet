<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let a = 15,
      b = 40;
    const { x, W, H } = cvs(host, 220);
    slider(host, 'Coefficient directeur a (€ par heure)', -10, 40, 15, (z) => fr(z.toFixed(0)) + ' €/h', (z) => {
      a = z;
    });
    slider(host, 'Ordonnée à l\'origine b (forfait, €)', 0, 120, 40, (z) => Math.round(z) + ' €', (z) => {
      b = z;
    });
    readout(host, [
      { id: 'afe', k: 'équation', c: 'd' },
      { id: 'af0', k: 'f(0) = forfait', c: 'w' },
      { id: 'afv', k: 'sens de variation' }
    ]);
    const say = box(host, 'say', '');
    const sa = new Spring(15, { k: 150, d: 22 }),
      sb = new Spring(40, { k: 150, d: 22 });
    const XL = [0, 10],
      YL = [0, 300];
    function draw() {
      const A = sa.to(a).step(),
        B = sb.to(b).step();
      x.clearRect(0, 0, W, H);
      const L = 40,
        R = W - 12,
        T = 12,
        Bt = 30;
      const sx = (v) => L + ((v - XL[0]) / (XL[1] - XL[0])) * (R - L);
      const sy = (v) => H - Bt - ((Math.max(YL[0], Math.min(YL[1], v)) - YL[0]) / (YL[1] - YL[0])) * (H - Bt - T);
      x.strokeStyle = 'rgba(255,255,255,.07)';
      x.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const gy = T + (i * (H - Bt - T)) / 5;
        x.beginPath();
        x.moveTo(L, gy);
        x.lineTo(R, gy);
        x.stroke();
      }
      x.strokeStyle = 'rgba(255,255,255,.2)';
      x.beginPath();
      x.moveTo(L, T);
      x.lineTo(L, H - Bt);
      x.lineTo(R, H - Bt);
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      for (let k = 0; k <= 10; k += 2) x.fillText(k + 'h', sx(k), H - Bt + 13);
      x.textAlign = 'right';
      x.textBaseline = 'middle';
      for (let k = 0; k <= 300; k += 100) x.fillText(k + ' €', L - 6, sy(k));
      x.textBaseline = 'alphabetic';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.6;
      x.beginPath();
      x.moveTo(sx(0), sy(B));
      x.lineTo(sx(10), sy(A * 10 + B));
      x.stroke();
      x.fillStyle = '#ffd166';
      x.beginPath();
      x.arc(sx(0), sy(B), 4.5, 0, 7);
      x.fill();
      const px = sx(4),
        py = sy(A * 4 + B),
        py2 = sy(A * 5 + B);
      x.strokeStyle = '#7ec8f2';
      x.lineWidth = 1.6;
      x.setLineDash([3, 3]);
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(sx(5), py);
      x.lineTo(sx(5), py2);
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = '#7ec8f2';
      x.font = '10px ' + SM;
      x.textAlign = 'left';
      x.fillText('+1 h', px + 6, py + (A >= 0 ? -4 : 12));
      x.fillText((A >= 0 ? '+' : '') + fr(A.toFixed(0)) + ' €', sx(5) + 4, (py + py2) / 2);
      host.querySelector('#afe').textContent = 'f(x) = ' + fr(A.toFixed(0)) + 'x + ' + Math.round(B);
      host.querySelector('#af0').textContent = Math.round(B) + ' €';
      const ve = host.querySelector('#afv');
      ve.textContent = A > 0 ? 'croissante' : A < 0 ? 'décroissante' : 'constante';
      ve.className = 'v ' + (A < 0 ? 'r' : '');
      say.innerHTML =
        `<b>f(x) = ${fr(A.toFixed(0))}x + ${Math.round(B)}</b>. Le <b>coefficient directeur</b> a = ${fr(A.toFixed(0))} : quand x augmente de 1 h, le coût ` +
        (A > 0 ? `monte de ${fr(A.toFixed(0))} €` : A < 0 ? `baisse de ${fr((-A).toFixed(0))} €` : `ne change pas`) +
        `. L'<b>ordonnée à l'origine</b> b = ${Math.round(B)} : c'est f(0), le point de départ (ici le forfait).`;
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
