<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let R = 255,
      G = 255,
      B = 255;
    const { x, W, H } = cvs(host, 180);
    slider(host, 'Rouge', 0, 255, 255, (v) => Math.round(v), (v) => {
      R = v;
    });
    slider(host, 'Vert', 0, 255, 255, (v) => Math.round(v), (v) => {
      G = v;
    });
    slider(host, 'Bleu', 0, 255, 255, (v) => Math.round(v), (v) => {
      B = v;
    });
    readout(host, [{ id: 'rgV', k: 'lumière obtenue', c: 'w' }]);
    const say = box(host, 'say', '');
    function draw() {
      x.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H / 2,
        r = Math.min(cx, cy) - 8,
        d = r * 0.55;
      x.globalCompositeOperation = 'lighter';
      x.fillStyle = `rgb(${Math.round(R)},0,0)`;
      x.beginPath();
      x.arc(cx, cy - d * 0.75, r * 0.72, 0, 7);
      x.fill();
      x.fillStyle = `rgb(0,${Math.round(G)},0)`;
      x.beginPath();
      x.arc(cx - d * 0.8, cy + d * 0.55, r * 0.72, 0, 7);
      x.fill();
      x.fillStyle = `rgb(0,0,${Math.round(B)})`;
      x.beginPath();
      x.arc(cx + d * 0.8, cy + d * 0.55, r * 0.72, 0, 7);
      x.fill();
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = `rgb(${Math.round(R)},${Math.round(G)},${Math.round(B)})`;
      x.strokeStyle = 'rgba(255,255,255,.3)';
      x.lineWidth = 1.5;
      x.beginPath();
      x.arc(cx, cy, 15, 0, 7);
      x.fill();
      x.stroke();
      let res = 'une couleur';
      if (R > 200 && G > 200 && B > 200) res = 'du blanc';
      else if (R < 40 && G < 40 && B < 40) res = 'du noir (aucune lumière)';
      else if (R > 200 && G > 200 && B < 40) res = 'du jaune';
      else if (R > 200 && G < 40 && B > 200) res = 'du magenta';
      else if (R < 40 && G > 200 && B > 200) res = 'du cyan';
      else if (R > 200 && G < 40 && B < 40) res = 'du rouge';
      host.querySelector('#rgV').textContent = res.replace('du ', '');
      say.innerHTML =
        `Trois lumières — <b>rouge</b>, <b>vert</b>, <b>bleu</b> — qui se superposent. Ici on obtient <b>${res}</b>.<br>` +
        (R > 200 && G > 200 && B > 200
          ? 'Rouge + vert + bleu au maximum = <b>blanc</b> : c\'est la synthèse additive.'
          : 'Baisse tout à zéro : plus de lumière, c\'est le <b>noir</b>.');
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
