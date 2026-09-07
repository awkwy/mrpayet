<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, rr, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const FIX = [
      ['Loyer', 520],
      ['Transport', 170],
      ['Alimentation', 340],
      ['Téléphone', 38],
      ['Mutuelle', 32]
    ];
    const PROJ = [
      ['A', 275],
      ['B', 305],
      ['C', 287]
    ];
    const SAL = 1380,
      TOT = FIX.reduce((s, f) => s + f[1], 0),
      REST = SAL - TOT;
    let pick = 0;
    const grow = new Spring(1, { k: 130, bounce: true });
    const { x, W, H } = cvs(host, 210);
    const md = box(
      host,
      'vctl',
      PROJ.map((p, i) => `<button data-p="${i}"${i === 0 ? ' class="on"' : ''}>Projet ${p[0]} · ${p[1]} €</button>`).join('')
    );
    readout(host, [
      { id: 'gR', k: 'reste après charges' },
      { id: 'gP', k: 'coût du projet', c: 'w' },
      { id: 'gV', k: 'verdict', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    const COLS = ['#2b7d57', '#37907f', '#46c288', '#63a88a', '#7ef2b0'];
    function draw() {
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        w = R - L,
        sc = w / SAL;
      x.font = '11px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('Salaire net ' + SAL + ' €', L, 16);
      let cx0 = L;
      FIX.forEach((f, i) => {
        const ww = f[1] * sc;
        x.fillStyle = COLS[i % COLS.length];
        rr(x, cx0, 26, Math.max(1, ww - 1.5), 30, 3);
        x.fill();
        cx0 += ww;
      });
      x.fillStyle = 'rgba(126,242,176,.16)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 1.4;
      rr(x, cx0, 26, R - cx0, 30, 3);
      x.fill();
      x.stroke();
      x.fillStyle = '#7ef2b0';
      x.textAlign = 'center';
      x.font = 'bold 12px ' + SM;
      if (R - cx0 > 52) x.fillText(REST + ' €', (cx0 + R) / 2, 41);
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('dépenses fixes ' + TOT + ' €', L, 70);
      x.textAlign = 'right';
      x.fillStyle = '#7ef2b0';
      x.fillText('disponible', R, 70);
      const by = 96,
        bh = 24,
        sc2 = w / 400;
      x.strokeStyle = '#7ef2b0';
      x.setLineDash([5, 4]);
      x.lineWidth = 1.8;
      const th = L + REST * sc2;
      x.beginPath();
      x.moveTo(th, by - 8);
      x.lineTo(th, by + 3 * (bh + 11) + 2);
      x.stroke();
      x.setLineDash([]);
      x.font = '11px ' + SM;
      x.fillStyle = '#7ef2b0';
      x.textAlign = 'center';
      x.fillText('seuil ' + REST + ' €', th, by - 15);
      const G = grow.step();
      PROJ.forEach(([nm, v], i) => {
        const yy = by + i * (bh + 11),
          ok = v <= REST,
          sel = i === pick;
        const ww = v * sc2 * (sel ? G : 1);
        x.fillStyle = ok ? 'rgba(126,242,176,.20)' : 'rgba(226,114,91,.18)';
        x.strokeStyle = sel ? (ok ? '#7ef2b0' : '#e2725b') : 'rgba(255,255,255,.14)';
        x.lineWidth = sel ? 2 : 1;
        rr(x, L, yy, Math.max(4, ww), bh, 4);
        x.fill();
        x.stroke();
        x.font = (sel ? 'bold ' : '') + '11.5px ' + SM;
        x.fillStyle = sel ? (ok ? '#7ef2b0' : '#e2725b') : '#63776d';
        x.textAlign = 'left';
        x.fillText('Projet ' + nm + ' · ' + v + ' €', L + 8, yy + bh / 2);
      });
      const [nm, v] = PROJ[pick],
        ok = v <= REST;
      host.querySelector('#gR').textContent = REST + ' €';
      host.querySelector('#gP').textContent = v + ' €';
      const ve = host.querySelector('#gV');
      ve.textContent = ok ? 'finançable' : 'trop cher';
      ve.className = 'v ' + (ok ? '' : 'r');
      say.innerHTML = ok
        ? `${v} ≤ ${REST} : l'inéquation est vérifiée, le projet <b>${nm}</b> passe. Il resterait ${REST - v} €.`
        : `${v} > ${REST} : le projet <b>${nm}</b> dépasse de <b>${v - REST} €</b>. L'inéquation coût ≤ ${REST} n'est pas vérifiée.`;
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    md.querySelectorAll('[data-p]').forEach((b) => {
      b.onclick = () => {
        pick = +b.dataset.p;
        grow.set(0);
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
