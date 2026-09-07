<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, dotplot, Spring, SM, fr, DUR, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let vals = DUR.slice(),
      drag = -1;
    const fx = new Spring(0, { k: 150, bounce: true });
    const P = dotplot(host, 190, { min: 10, max: 100, step: 10, bot: 58 });
    const ctl = box(host, 'vctl', `<button class="gh" id="rz">Remettre les vraies durées</button>`);
    readout(host, [
      { id: 'yM', k: 'moyenne' },
      { id: 'yS', k: 'somme', c: 'd' },
      { id: 'yN', k: 'effectif', c: 'd' }
    ]);
    const say = box(host, 'say', 'Fais glisser un point : le pivot suit toujours la moyenne.');
    const mean = () => vals.reduce((s, v) => s + v, 0) / vals.length;
    function draw() {
      const m = mean(),
        gx = P.xOf(m);
      if (!fx.x) fx.set(gx);
      const FX = fx.to(gx).step();
      P.x.clearRect(0, 0, P.W, P.H);
      P.x.strokeStyle = '#31473d';
      P.x.lineWidth = 4;
      P.x.lineCap = 'round';
      P.x.beginPath();
      P.x.moveTo(P.L, P.AX);
      P.x.lineTo(P.R, P.AX);
      P.x.stroke();
      P.axis();
      P.dots(vals, drag);
      P.x.fillStyle = '#ffd166';
      P.x.beginPath();
      P.x.moveTo(FX, P.AX + 24);
      P.x.lineTo(FX - 9, P.AX + 41);
      P.x.lineTo(FX + 9, P.AX + 41);
      P.x.closePath();
      P.x.fill();
      P.x.font = 'bold 12px ' + SM;
      P.x.fillStyle = '#ffd166';
      P.x.textAlign = 'center';
      P.x.fillText('moyenne ' + fr(m.toFixed(1)), Math.max(56, Math.min(P.W - 56, FX)), P.H - 6);
      host.querySelector('#yM').textContent = fr(m.toFixed(2));
      host.querySelector('#yS').textContent = fr(vals.reduce((s, v) => s + v, 0).toFixed(0));
      host.querySelector('#yN').textContent = vals.length;
      const below = vals.filter((v) => v < m).length;
      say.innerHTML =
        `Somme ${vals.reduce((s, v) => s + v, 0)} ÷ ${vals.length} = <b>${fr(m.toFixed(2))} min</b>. ` +
        `<b>${below}</b> durée${below > 1 ? 's' : ''} sur ${vals.length} ${below > 1 ? 'sont' : 'est'} en dessous de la moyenne` +
        (below > vals.length * 0.7 ? ' — une seule valeur très grande a tiré le pivot vers la droite.' : '.');
    }
    function pos(e) {
      const r = P.c.getBoundingClientRect();
      return (e.clientX - r.left) * (P.W / r.width);
    }
    P.c.addEventListener('pointerdown', (e) => {
      const px = pos(e);
      let best = -1,
        bd = 1e9;
      vals.forEach((v, i) => {
        const d = Math.abs(P.xOf(v) - px);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (bd < 26) {
        drag = best;
        P.c.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    });
    P.c.addEventListener('pointermove', (e) => {
      if (drag < 0) return;
      vals[drag] = Math.max(10, Math.min(100, Math.round(P.vOf(pos(e)))));
      e.preventDefault();
    });
    P.c.addEventListener('pointerup', () => {
      drag = -1;
    });
    P.c.addEventListener('pointercancel', () => {
      drag = -1;
    });
    ctl.querySelector('#rz').onclick = () => {
      vals = DUR.slice();
    };
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
