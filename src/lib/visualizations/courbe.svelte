<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const PTS = (vd && vd.pts) || [
      [0, 3.5],
      [3, 6],
      [6, 7.5],
      [9, 8.7],
      [12, 9.6],
      [18, 10.9]
    ];
    const F =
      (vd && vd.f) ||
      ((v) => {
        if (v <= PTS[0][0]) return PTS[0][1];
        for (let i = 1; i < PTS.length; i++) {
          if (v <= PTS[i][0]) {
            const [x0, y0] = PTS[i - 1],
              [x1, y1] = PTS[i];
            return y0 + ((y1 - y0) * (v - x0)) / (x1 - x0);
          }
        }
        return PTS[PTS.length - 1][1];
      });
    const XL = (vd && vd.xl) || [0, 18],
      YL = (vd && vd.yl) || [0, 12];
    const XLAB = (vd && vd.xlab) || 'âge (mois)',
      YLAB = (vd && vd.ylab) || 'poids (kg)';
    let mode = 'img',
      px = (vd && vd.x0) || 6;
    const { x, W, H } = cvs(host, 220);
    const md = box(host, 'vctl', `<button data-m="img" class="on">Lire une image</button><button data-m="ant">Lire un antécédent</button>`);
    readout(host, [
      { id: 'qx', k: XLAB, c: 'd' },
      { id: 'qy', k: YLAB, c: 'w' }
    ]);
    const say = box(host, 'say', 'Fais glisser le point sur la courbe.');
    const cur = new Spring(px, { k: 150, d: 20 });
    const L = 44,
      R = W - 12,
      T = 12,
      B = 32;
    const sx = (v) => L + ((v - XL[0]) / (XL[1] - XL[0])) * (R - L);
    const sy = (v) => H - B - ((v - YL[0]) / (YL[1] - YL[0])) * (H - B - T);
    const ix = (p) => XL[0] + ((p - L) / (R - L)) * (XL[1] - XL[0]);
    function draw() {
      const P = Math.max(XL[0], Math.min(XL[1], cur.to(px).step())),
        y = F(P);
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
      x.lineTo(L, H - B);
      x.lineTo(R, H - B);
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      for (let k = 0; k <= 6; k++) {
        const v = XL[0] + (k * (XL[1] - XL[0])) / 6;
        x.fillText('' + Math.round(v), sx(v), H - B + 13);
      }
      x.textAlign = 'right';
      x.textBaseline = 'middle';
      for (let k = 0; k <= 4; k++) {
        const v = YL[0] + (k * (YL[1] - YL[0])) / 4;
        x.fillText('' + Math.round(v), L - 6, sy(v));
      }
      x.textBaseline = 'alphabetic';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.4;
      x.lineJoin = 'round';
      x.beginPath();
      for (let i = 0; i <= 120; i++) {
        const v = XL[0] + (i / 120) * (XL[1] - XL[0]),
          yy = sy(F(v));
        i ? x.lineTo(sx(v), yy) : x.moveTo(sx(v), yy);
      }
      x.stroke();
      const col = mode === 'img' ? '#ffd166' : '#7ec8f2';
      x.strokeStyle = col;
      x.setLineDash([4, 3]);
      x.lineWidth = 1.6;
      x.beginPath();
      if (mode === 'img') {
        x.moveTo(sx(P), H - B);
        x.lineTo(sx(P), sy(y));
        x.lineTo(L, sy(y));
      } else {
        x.moveTo(L, sy(y));
        x.lineTo(sx(P), sy(y));
        x.lineTo(sx(P), H - B);
      }
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = col;
      x.beginPath();
      x.arc(sx(P), sy(y), 4.8, 0, 7);
      x.fill();
      host.querySelector('#qx').textContent = fr(P.toFixed(1));
      host.querySelector('#qy').textContent = fr(y.toFixed(1));
      say.innerHTML =
        mode === 'img'
          ? `À l'entrée <b>${fr(P.toFixed(1))}</b>, on lit sur la courbe la sortie <b>${fr(y.toFixed(1))}</b> : c'est l'<b>image</b> de ${fr(P.toFixed(1))}. Notation : f(${fr(P.toFixed(1))}) = ${fr(y.toFixed(1))}.`
          : `La sortie vaut <b>${fr(y.toFixed(1))}</b> ; l'entrée qui lui correspond est <b>${fr(P.toFixed(1))}</b> : c'est un <b>antécédent</b> de ${fr(y.toFixed(1))}.`;
    }
    const cv = host.querySelector('canvas');
    const grab = (e) => {
      const r = cv.getBoundingClientRect();
      px = ix((e.clientX - r.left) * (W / r.width));
      e.preventDefault();
    };
    cv.addEventListener('pointerdown', (e) => {
      grab(e);
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      if (e.buttons) grab(e);
    });
    md.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.m;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
