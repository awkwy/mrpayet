<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, mixc, rr, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const CONS = [
      ['Feux de croisement', 110],
      ['Autoradio', 40],
      ['Ventilateur habitacle', 120],
      ['Lunette dégivrante', 180],
      ['Essuie-glace', 60]
    ];
    let on = [true, false, false, false, false],
      cal = 10,
      melt = 0,
      heat = 0;
    const { x, W, H } = cvs(host, 190);
    const btns = box(host, 'vctl', CONS.map((c, i) => `<button data-c="${i}">${c[0]}</button>`).join(''));
    const cals = box(host, 'vctl', [5, 10, 15, 20, 30].map((v) => `<button data-k="${v}">${v} A</button>`).join(''));
    readout(host, [
      { id: 'vP', k: 'puissance totale' },
      { id: 'vI', k: 'intensité I = P ÷ U', c: 'w' },
      { id: 'vC', k: 'calibre', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    const lerp2 = (a, b, t) => a + (b - a) * t;
    const P = () => CONS.reduce((s, c, i) => s + (on[i] ? c[1] : 0), 0);
    function draw() {
      const p = P(),
        I = p / 12,
        ratio = cal ? I / cal : 0;
      x.clearRect(0, 0, W, H);
      const cy = 64,
        fw = Math.min(190, W * 0.48),
        fx = (W - fw) / 2;
      x.strokeStyle = '#31473d';
      x.lineWidth = 3;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(16, cy);
      x.lineTo(fx, cy);
      x.moveTo(fx + fw, cy);
      x.lineTo(W - 16, cy);
      x.stroke();
      const col = melt >= 1 ? '#e2725b' : mixc('#46c288', '#ffd166', Math.min(1, ratio));
      x.fillStyle = 'rgba(0,0,0,.35)';
      x.strokeStyle = col;
      x.lineWidth = 2;
      rr(x, fx, cy - 19, fw, 38, 7);
      x.fill();
      x.stroke();
      x.strokeStyle = melt >= 1 ? 'rgba(226,114,91,.45)' : col;
      x.lineWidth = melt >= 1 ? 1.4 : 2.6;
      const seg = 10,
        amp = 8 * (1 + heat * 0.5);
      x.beginPath();
      for (let i = 0; i <= seg; i++) {
        const t = i / seg,
          px = fx + 10 + t * (fw - 20);
        const gap = melt >= 1 && t > 0.4 && t < 0.6;
        const py = cy + Math.sin(t * Math.PI * 3) * amp * (melt >= 1 ? 0.2 : 1);
        if (i === 0 || gap) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.stroke();
      if (melt >= 1) {
        x.fillStyle = '#e2725b';
        x.font = 'bold 13px ' + SM;
        x.textAlign = 'center';
        x.fillText('FONDU', W / 2, cy + 34);
      }
      const gy = 132,
        gw = W - 44;
      x.fillStyle = '#1c2a24';
      rr(x, 22, gy, gw, 13, 7);
      x.fill();
      const f = Math.max(0, Math.min(1.25, ratio));
      x.fillStyle = col;
      rr(x, 22, gy, gw * Math.min(1, f / 1.25), 13, 7);
      x.fill();
      const mx = 22 + gw * (1 / 1.25);
      x.strokeStyle = '#e7efe9';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(mx, gy - 6);
      x.lineTo(mx, gy + 19);
      x.stroke();
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText(cal + ' A', mx, gy + 30);
      x.textAlign = 'left';
      x.fillText('0 A', 22, gy + 30);
      x.textAlign = 'right';
      x.fillStyle = '#63776d';
      x.fillText('intensité dans le circuit', W - 22, gy - 14);
      host.querySelector('#vP').textContent = p + ' W';
      const iel = host.querySelector('#vI');
      iel.textContent = fr(I.toFixed(1)) + ' A';
      iel.className = 'v ' + (ratio > 1 ? 'r' : ratio > 0.8 ? 'w' : '');
      host.querySelector('#vC').textContent = cal + ' A';
      say.innerHTML =
        melt >= 1
          ? `<b>Le fusible a fondu.</b> ${fr(I.toFixed(1))} A dépassent le calibre de ${cal} A : le circuit s'ouvre et protège le faisceau.`
          : ratio > 0.8
            ? `${fr(I.toFixed(1))} A pour un calibre de ${cal} A : on est tout près de la limite.`
            : `P = ${p} W sous 12 V, donc I = ${p} ÷ 12 = <b>${fr(I.toFixed(1))} A</b>. Le calibre de ${cal} A tient.`;
    }
    function tick() {
      const ratio = P() / 12 / cal;
      heat = lerp2(heat, Math.min(1, ratio), 0.12);
      if (ratio > 1) melt = Math.min(1, melt + 0.035);
      else melt = Math.max(0, melt - 0.08);
      draw();
      loop.raf(tick);
    }
    btns.querySelectorAll('[data-c]').forEach((b) => {
      b.onclick = () => {
        const i = +b.dataset.c;
        on[i] = !on[i];
        b.classList.toggle('on', on[i]);
      };
    });
    cals.querySelectorAll('[data-k]').forEach((b) => {
      b.onclick = () => {
        cal = +b.dataset.k;
        cals.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    btns.querySelector("[data-c='0']").classList.add('on');
    cals.querySelector("[data-k='10']").classList.add('on');
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
