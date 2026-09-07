<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, lerp, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let broken = [false, false],
      t = 0;
    const { x, W, H } = cvs(host, 210);
    const ctl = box(
      host,
      'vctl',
      `<button data-b="0">Griller la lampe gauche</button><button data-b="1">Griller la lampe droite</button><button class="gh" id="rz">Tout réparer</button>`
    );
    readout(host, [
      { id: 'nE', k: 'entrée' },
      { id: 'nG', k: 'branche gauche' },
      { id: 'nD', k: 'branche droite' }
    ]);
    const say = box(host, 'say', '');
    const IB = 4.6;
    function draw() {
      const Ig = broken[0] ? 0 : IB,
        Id = broken[1] ? 0 : IB,
        Ie = Ig + Id;
      x.clearRect(0, 0, W, H);
      const nx = W * 0.5,
        ny = 52,
        by = 150,
        lx = W * 0.22,
        rx = W * 0.78;
      x.lineWidth = 3;
      x.lineCap = 'round';
      const wire = (x1, y1, x2, y2, I) => {
        x.strokeStyle = I > 0 ? '#46c288' : '#2a3a33';
        x.beginPath();
        x.moveTo(x1, y1);
        x.lineTo(x2, y2);
        x.stroke();
        if (I > 0) {
          const n = 4;
          for (let i = 0; i < n; i++) {
            const p = (t * 0.012 + i / n) % 1;
            x.fillStyle = '#7ef2b0';
            x.beginPath();
            x.arc(lerp(x1, x2, p), lerp(y1, y2, p), 3, 0, 7);
            x.fill();
          }
        }
      };
      wire(nx, 16, nx, ny, Ie);
      wire(nx, ny, lx, by - 24, Ig);
      wire(nx, ny, rx, by - 24, Id);
      x.fillStyle = '#ffd166';
      x.beginPath();
      x.arc(nx, ny, 6, 0, 7);
      x.fill();
      x.font = '11px ' + SM;
      x.fillStyle = '#ffd166';
      x.textAlign = 'left';
      x.fillText('nœud', nx + 11, ny);
      [
        [lx, Ig, 0],
        [rx, Id, 1]
      ].forEach(([px, I, i]) => {
        x.fillStyle = I > 0 ? 'rgba(255,209,102,.22)' : 'rgba(0,0,0,.3)';
        x.strokeStyle = I > 0 ? '#ffd166' : '#3a4a43';
        x.lineWidth = 2;
        x.beginPath();
        x.arc(px, by, 20, 0, 7);
        x.fill();
        x.stroke();
        if (I > 0) {
          const g = x.createRadialGradient(px, by, 2, px, by, 34);
          g.addColorStop(0, 'rgba(255,209,102,.30)');
          g.addColorStop(1, 'rgba(255,209,102,0)');
          x.fillStyle = g;
          x.beginPath();
          x.arc(px, by, 34, 0, 7);
          x.fill();
        } else {
          x.strokeStyle = '#e2725b';
          x.lineWidth = 2.4;
          x.beginPath();
          x.moveTo(px - 8, by - 8);
          x.lineTo(px + 8, by + 8);
          x.moveTo(px + 8, by - 8);
          x.lineTo(px - 8, by + 8);
          x.stroke();
        }
        x.font = '12px ' + SM;
        x.fillStyle = I > 0 ? '#7ef2b0' : '#63776d';
        x.textAlign = 'center';
        x.fillText(fr(I.toFixed(1)) + ' A', px, by + 38);
      });
      x.font = '12px ' + SM;
      x.fillStyle = '#7ef2b0';
      x.textAlign = 'left';
      x.fillText(fr(Ie.toFixed(1)) + ' A', nx + 11, 30);
      host.querySelector('#nE').textContent = fr(Ie.toFixed(1)) + ' A';
      host.querySelector('#nG').textContent = fr(Ig.toFixed(1)) + ' A';
      host.querySelector('#nD').textContent = fr(Id.toFixed(1)) + ' A';
      say.innerHTML =
        `À l'entrée : <b>${fr(Ie.toFixed(1))} A</b>. En sortie : ${fr(Ig.toFixed(1))} + ${fr(Id.toFixed(1))} = <b>${fr(Ie.toFixed(1))} A</b>. ` +
        (Ig === 0 && Id === 0
          ? 'Plus rien ne circule.'
          : Ig === 0 || Id === 0
            ? "Une branche est coupée : l'ampèremètre d'entrée le voit tout de suite, sans rien démonter."
            : 'Ce qui entre au nœud ressort en totalité : c\'est la loi des nœuds.');
    }
    function tick() {
      t++;
      draw();
      loop.raf(tick);
    }
    ctl.querySelectorAll('[data-b]').forEach((b) => {
      b.onclick = () => {
        const i = +b.dataset.b;
        broken[i] = !broken[i];
        b.classList.toggle('on', broken[i]);
        b.textContent = (broken[i] ? 'Réparer' : 'Griller') + ' la lampe ' + (i ? 'droite' : 'gauche');
      };
    });
    ctl.querySelector('#rz').onclick = () => {
      broken = [false, false];
      ctl.querySelectorAll('[data-b]').forEach((b, i) => {
        b.classList.remove('on');
        b.textContent = 'Griller la lampe ' + (i ? 'droite' : 'gauche');
      });
    };
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
