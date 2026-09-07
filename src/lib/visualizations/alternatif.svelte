<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let f = 50,
      mode = 'alt',
      t = 0;
    const { x, W, H } = cvs(host, 200);
    const md = box(
      host,
      'vctl',
      `<button data-m="alt" class="on">Secteur ~ 230 V</button><button data-m="cc">Véhicule = 12 V</button>`
    );
    const slw = document.createElement('div');
    host.appendChild(slw);
    const sl = slider(slw, 'Fréquence', 1, 100, 50, (v) => v + ' Hz', (v) => {
      f = v;
    });
    readout(host, [
      { id: 'aF', k: 'fréquence' },
      { id: 'aT', k: 'période T = 1 ÷ f', c: 'w' },
      { id: 'aU', k: 'valeur efficace', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      x.clearRect(0, 0, W, H);
      const L = 40,
        R = 14,
        T = 18,
        B = 44,
        cy = (T + H - B) / 2,
        amp = (H - B - T) / 2 - 6;
      x.strokeStyle = 'rgba(255,255,255,.16)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(L, T);
      x.lineTo(L, H - B);
      x.lineTo(W - R, H - B);
      x.stroke();
      x.setLineDash([4, 4]);
      x.strokeStyle = 'rgba(255,255,255,.14)';
      x.beginPath();
      x.moveTo(L, cy);
      x.lineTo(W - R, cy);
      x.stroke();
      x.setLineDash([]);
      x.font = '11px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'right';
      x.fillText('0', L - 7, cy);
      const win = 0.04,
        px = (v) => L + (v / win) * (W - L - R);
      if (mode === 'alt') {
        const peak = 325;
        x.strokeStyle = '#7ec8f2';
        x.lineWidth = 2.4;
        x.beginPath();
        for (let i = 0; i <= 260; i++) {
          const tt = (i / 260) * win;
          const v = Math.sin(2 * Math.PI * f * (tt + t / 900));
          const yy = cy - v * amp;
          i ? x.lineTo(px(tt), yy) : x.moveTo(px(tt), yy);
        }
        x.stroke();
        const ye = cy - amp * (230 / peak);
        x.strokeStyle = '#ffd166';
        x.setLineDash([6, 5]);
        x.lineWidth = 1.6;
        x.beginPath();
        x.moveTo(L, ye);
        x.lineTo(W - R, ye);
        x.stroke();
        x.setLineDash([]);
        x.fillStyle = '#ffd166';
        x.textAlign = 'left';
        x.font = '11px ' + SM;
        x.fillText('230 V eff.', L + 6, ye - 11);
        x.fillStyle = '#7ec8f2';
        x.textAlign = 'right';
        x.fillText('crête 325 V', W - R - 2, cy - amp + 10);
        const T1 = 1 / f;
        if (T1 <= win) {
          x.strokeStyle = '#7ef2b0';
          x.lineWidth = 2;
          const y0 = H - B + 14;
          x.beginPath();
          x.moveTo(px(0), y0 - 5);
          x.lineTo(px(0), y0 + 5);
          x.moveTo(px(T1), y0 - 5);
          x.lineTo(px(T1), y0 + 5);
          x.moveTo(px(0), y0);
          x.lineTo(px(T1), y0);
          x.stroke();
          x.fillStyle = '#7ef2b0';
          x.textAlign = 'center';
          x.font = '11px ' + SM;
          x.fillText('T = ' + fr((1000 / f).toFixed(1)) + ' ms', (px(0) + px(T1)) / 2, y0 + 16);
        }
      } else {
        x.strokeStyle = '#7ef2b0';
        x.lineWidth = 2.6;
        const yy = cy - amp * 0.42;
        x.beginPath();
        x.moveTo(L, yy);
        x.lineTo(W - R, yy);
        x.stroke();
        x.fillStyle = '#7ef2b0';
        x.textAlign = 'left';
        x.font = '11px ' + SM;
        x.fillText('12 V, constante', L + 8, yy - 12);
      }
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      x.font = '11px ' + SM;
      x.fillText('40 millisecondes', W / 2, H - 12);
      host.querySelector('#aF').textContent = mode === 'alt' ? Math.round(f) + ' Hz' : '0 Hz';
      host.querySelector('#aT').textContent = mode === 'alt' ? fr((1000 / f).toFixed(1)) + ' ms' : '—';
      host.querySelector('#aU').textContent = mode === 'alt' ? '230 V' : '12 V';
      say.innerHTML =
        mode === 'cc'
          ? 'Sur le véhicule, la tension est <b>continue</b> : elle garde le même signe et la même valeur. Pas de période, pas de fréquence.'
          : `Le signal traverse zéro et change de signe : c'est une tension <b>alternative</b>. À ${Math.round(f)} Hz, une période dure ${fr((1000 / f).toFixed(1))} ms.` +
            (Math.round(f) === 50 ? ' C\'est le cas du secteur français : 50 Hz, soit 20 ms.' : '');
    }
    function tick() {
      t++;
      draw();
      loop.raf(tick);
    }
    md.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.m;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        slw.style.opacity = mode === 'alt' ? '1' : '.35';
        sl.disabled = mode !== 'alt';
      };
    });
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
