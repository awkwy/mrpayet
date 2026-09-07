<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let inc = 40,
      mode = (vd && vd.mode) || 'refr';
    const { x, W, H } = cvs(host, 210);
    const md = box(
      host,
      'vctl',
      `<button data-m="refl"${mode === 'refl' ? ' class="on"' : ''}>Réflexion (miroir)</button><button data-m="refr"${mode === 'refr' ? ' class="on"' : ''}>Réfraction (eau)</button>`
    );
    slider(host, "Angle d'incidence", 5, 80, 40, (v) => Math.round(v) + '°', (v) => {
      inc = v;
    });
    readout(host, [
      { id: 'ri', k: "angle d'incidence", c: 'd' },
      { id: 'ro', k: mode === 'refl' ? 'angle de réflexion' : 'angle de réfraction', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const sc = new Spring(40, { k: 150, d: 22 });
    function draw() {
      const a = (sc.to(inc).step() * Math.PI) / 180;
      const out = mode === 'refl' ? a : Math.asin(Math.sin(a) / 1.33);
      x.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H * 0.5,
        len = Math.min(cx, cy) - 14;
      if (mode === 'refr') {
        x.fillStyle = 'rgba(126,200,242,.10)';
        x.fillRect(0, cy, W, H - cy);
        x.font = '10px ' + SM;
        x.fillStyle = '#7ec8f2';
        x.textAlign = 'left';
        x.fillText('eau', 6, cy + 16);
        x.fillStyle = '#63776d';
        x.fillText('air', 6, cy - 8);
      }
      x.strokeStyle = 'rgba(255,255,255,.25)';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(10, cy);
      x.lineTo(W - 10, cy);
      x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.25)';
      x.setLineDash([4, 4]);
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(cx, cy - len);
      x.lineTo(cx, cy + len);
      x.stroke();
      x.setLineDash([]);
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('normale', cx + 5, cy - len + 10);
      x.strokeStyle = '#ffd166';
      x.lineWidth = 2.5;
      x.beginPath();
      x.moveTo(cx - Math.sin(a) * len, cy - Math.cos(a) * len);
      x.lineTo(cx, cy);
      x.stroke();
      x.fillStyle = '#ffd166';
      x.font = '11px ' + SM;
      x.textAlign = 'right';
      x.fillText('incident', cx - Math.sin(a) * len * 0.6 - 4, cy - Math.cos(a) * len * 0.6);
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.5;
      if (mode === 'refl') {
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.sin(out) * len, cy - Math.cos(out) * len);
        x.stroke();
        x.fillStyle = '#7ef2b0';
        x.textAlign = 'left';
        x.fillText('réfléchi', cx + Math.sin(out) * len * 0.6 + 4, cy - Math.cos(out) * len * 0.6);
      } else {
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.sin(out) * len, cy + Math.cos(out) * len);
        x.stroke();
        x.fillStyle = '#7ef2b0';
        x.textAlign = 'left';
        x.fillText('réfracté', cx + Math.sin(out) * len * 0.55 + 4, cy + Math.cos(out) * len * 0.55);
      }
      const io = Math.round(inc),
        oo = Math.round((out * 180) / Math.PI);
      host.querySelector('#ri').textContent = io + '°';
      host.querySelector('#ro').textContent = oo + '°';
      say.innerHTML =
        mode === 'refl'
          ? `Sur un <b>miroir</b>, l'angle de réflexion (<b>${oo}°</b>) est <b>égal</b> à l'angle d'incidence (${io}°). Les deux se mesurent par rapport à la <b>normale</b>.`
          : `En passant de l'<b>air</b> à l'<b>eau</b>, le rayon <b>se rapproche de la normale</b> : ${io}° &rarr; <b>${oo}°</b>. Plus l'angle d'incidence augmente, plus l'angle de réfraction augmente.`;
    }
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
