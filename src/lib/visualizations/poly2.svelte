<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  const XL = (vd && vd.xl) || [0, 12];
  const YL = (vd && vd.yl) || [-60, 60];
  const XLAB = (vd && vd.xlab) || 'x';

  onMount(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let a = (vd && vd.a0) ?? -2,
      x1 = (vd && vd.x10) ?? 3,
      x2 = (vd && vd.x20) ?? 9;

    const { x, W, H } = cvs(host, 220);
    slider(host, 'Coefficient a', -3, 3, a, (z) => 'a = ' + fr(z.toFixed(1)), (z) => {
      a = z === 0 ? 0.1 : z;
    });
    slider(host, 'Racine x₁', XL[0], XL[1], x1, (z) => fr(z.toFixed(0)), (z) => {
      x1 = z;
    });
    slider(host, 'Racine x₂', XL[0], XL[1], x2, (z) => fr(z.toFixed(0)), (z) => {
      x2 = z;
    });
    readout(host, [
      { id: 'p2e', k: 'f(x)', c: 'd' },
      { id: 'p2s', k: 'sommet', c: 'w' },
      { id: 'p2v', k: 'branches' }
    ]);
    const say = box(host, 'say', '');
    const table = box(
      host,
      'viz-data',
      `<details><summary>Voir les valeurs actuelles</summary>
        <table>
          <thead><tr><th>a</th><th>x₁</th><th>x₂</th><th>Sommet</th><th>f(sommet)</th></tr></thead>
          <tbody><tr id="p2row"><td></td><td></td><td></td><td></td><td></td></tr></tbody>
        </table>
      </details>`
    );
    const sa = new Spring(a, { k: 150, d: 22 }),
      s1 = new Spring(x1, { k: 150, d: 22 }),
      s2 = new Spring(x2, { k: 150, d: 22 });

    const L = 42,
      R = W - 14,
      T = 14,
      B = 30;
    const sx = (v) => L + ((v - XL[0]) / (XL[1] - XL[0])) * (R - L);
    const sy = (v) => H - B - ((v - YL[0]) / (YL[1] - YL[0])) * (H - B - T);

    function draw() {
      const A = RM ? a : sa.to(a).step();
      const X1 = RM ? x1 : s1.to(x1).step();
      const X2 = RM ? x2 : s2.to(x2).step();
      const f = (v) => A * (v - X1) * (v - X2);
      const sommetX = (X1 + X2) / 2;
      const sommetY = f(sommetX);

      x.clearRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.07)';
      x.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const gy = T + (i * (H - B - T)) / 4;
        x.beginPath();
        x.moveTo(L, gy);
        x.lineTo(R, gy);
        x.stroke();
      }
      x.strokeStyle = 'rgba(255,255,255,.2)';
      x.beginPath();
      x.moveTo(L, T);
      x.lineTo(L, sy(0));
      x.lineTo(R, sy(0));
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      for (let k = 0; k <= 6; k++) {
        const v = XL[0] + (k * (XL[1] - XL[0])) / 6;
        x.fillText(fr(Math.round(v)), sx(v), sy(0) + 13);
      }

      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.6;
      x.lineJoin = 'round';
      x.beginPath();
      let started = false;
      for (let i = 0; i <= 120; i++) {
        const v = XL[0] + ((XL[1] - XL[0]) * i) / 120;
        const py = sy(f(v));
        if (py < T - 4 || py > H - B + 4) {
          started = false;
          continue;
        }
        if (!started) {
          x.moveTo(sx(v), py);
          started = true;
        } else x.lineTo(sx(v), py);
      }
      x.stroke();

      x.fillStyle = '#ffd166';
      x.beginPath();
      x.arc(sx(sommetX), sy(sommetY), 4.5, 0, 7);
      x.fill();

      host.querySelector('#p2e').textContent =
        fr(A.toFixed(1)) + '(' + XLAB + ' − ' + fr(X1.toFixed(0)) + ')(' + XLAB + ' − ' + fr(X2.toFixed(0)) + ')';
      host.querySelector('#p2s').textContent = '(' + fr(sommetX.toFixed(1)) + ' ; ' + fr(sommetY.toFixed(1)) + ')';
      const ve = host.querySelector('#p2v');
      ve.textContent = A > 0 ? 'vers le haut (minimum)' : 'vers le bas (maximum)';
      ve.className = 'v ' + (A < 0 ? 'r' : '');
      say.innerHTML =
        `<b>f(${XLAB}) = ${fr(A.toFixed(1))}(${XLAB} − ${fr(X1.toFixed(0))})(${XLAB} − ${fr(X2.toFixed(0))})</b>. ` +
        (A > 0
          ? `a &gt; 0 : la parabole est tournée vers le <b>haut</b>, elle a un <b>minimum</b> au sommet.`
          : `a &lt; 0 : la parabole est tournée vers le <b>bas</b>, elle a un <b>maximum</b> au sommet.`) +
        ` Le <b>sommet</b> est toujours au milieu des deux racines : (${fr(X1.toFixed(0))} + ${fr(X2.toFixed(0))}) ÷ 2 = ${fr(sommetX.toFixed(1))}.`;

      const row = host.querySelector('#p2row');
      row.children[0].textContent = fr(A.toFixed(1));
      row.children[1].textContent = fr(X1.toFixed(0));
      row.children[2].textContent = fr(X2.toFixed(0));
      row.children[3].textContent = fr(sommetX.toFixed(1));
      row.children[4].textContent = fr(sommetY.toFixed(1));
    }
    function tick() {
      draw();
      if (!RM) loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz" role="img" aria-label="Explorateur de parabole : trois curseurs pour le coefficient a et les deux racines x1, x2 d'un polynôme de degré 2 sous forme factorisée. La courbe et le tableau des valeurs se mettent à jour en direct."></div>
