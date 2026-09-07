<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, slider, readout, dotplot, Spring, SM, fr, DUR, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let ext = 95;
    const fm = new Spring(0, { k: 150, bounce: true }),
      fd = new Spring(0, { k: 150, bounce: true });
    const P = dotplot(host, 205, { min: 0, max: 180, step: 30, bot: 62 });
    slider(host, 'La onzième durée (bouchon grippé)', 25, 180, 95, (v) => v + ' min', (v) => {
      ext = v;
    });
    readout(host, [
      { id: 'zM', k: 'moyenne', c: 'w' },
      { id: 'zD', k: 'médiane' },
      { id: 'zE', k: 'étendue', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const vals = DUR.slice(0, 10).concat([ext]);
      const srt = vals.slice().sort((a, b) => a - b);
      const m = vals.reduce((s, v) => s + v, 0) / vals.length,
        md = srt[5],
        et = srt[10] - srt[0];
      const gm = P.xOf(m),
        gd = P.xOf(md);
      if (!fm.x) {
        fm.set(gm);
        fd.set(gd);
      }
      const FM = fm.to(gm).step(),
        FD = fd.to(gd).step();
      P.x.clearRect(0, 0, P.W, P.H);
      P.axis();
      P.x.fillStyle = 'rgba(126,242,176,.05)';
      P.x.fillRect(P.L, 12, FD - P.L, P.AX - 12);
      P.x.fillStyle = 'rgba(126,242,176,.02)';
      P.x.fillRect(FD, 12, P.R - FD, P.AX - 12);
      P.dots(vals, 10);
      P.x.strokeStyle = '#ffd166';
      P.x.lineWidth = 2;
      P.x.setLineDash([5, 4]);
      P.x.beginPath();
      P.x.moveTo(FM, 10);
      P.x.lineTo(FM, P.AX);
      P.x.stroke();
      P.x.setLineDash([]);
      P.x.strokeStyle = '#7ef2b0';
      P.x.lineWidth = 2.6;
      P.x.beginPath();
      P.x.moveTo(FD, 10);
      P.x.lineTo(FD, P.AX);
      P.x.stroke();
      P.x.font = 'bold 11.5px ' + SM;
      P.x.textAlign = 'center';
      P.x.fillStyle = '#ffd166';
      P.x.fillText('moyenne ' + fr(m.toFixed(1)), Math.max(58, Math.min(P.W - 58, FM)), P.H - 23);
      P.x.fillStyle = '#7ef2b0';
      P.x.fillText('médiane ' + md, Math.max(52, Math.min(P.W - 52, FD)), P.H - 6);
      host.querySelector('#zM').textContent = fr(m.toFixed(1));
      host.querySelector('#zD').textContent = String(md);
      host.querySelector('#zE').textContent = String(et);
      say.innerHTML =
        `En tirant la valeur extrême jusqu'à <b>${Math.round(ext)} min</b> : la moyenne monte à <b>${fr(m.toFixed(1))}</b>, la médiane reste à <b>${md}</b>. ` +
        `La médiane ne dépend que du <b>rang</b> des valeurs — cinq durées en dessous, cinq au-dessus, quoi qu'il arrive à la plus grande. L'étendue, elle, vaut ${et} min : elle signale que des cas très longs existent.`;
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
