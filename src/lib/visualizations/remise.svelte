<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let rem = 8;
    const HT = 250,
      TVA = 0.2,
      TTC = HT * (1 + TVA);
    const { x, W, H } = cvs(host, 205);
    slider(host, 'Taux de remise', 0, 30, 8, (v) => v + ' %', (v) => {
      rem = v;
    });
    readout(host, [
      { id: 'rT', k: 'TTC avant remise', c: 'd' },
      { id: 'rC', k: 'coefficient', c: 'w' },
      { id: 'rF', k: 'à payer' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const remR = Math.round(rem);
      const k = 1 - rem / 100,
        fin = TTC * k;
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        w = R - L,
        sc = w / 360;
      const bar = (y, segs, lab) => {
        let cx0 = L;
        segs.forEach(([v, col, tx]) => {
          const ww = v * sc;
          x.fillStyle = col;
          rr(x, cx0, y, Math.max(1, ww - 1.5), 28, 4);
          x.fill();
          if (ww > 46) {
            x.font = '11px ' + SM;
            x.fillStyle = '#04120a';
            x.textAlign = 'center';
            x.fillText(tx, cx0 + ww / 2, y + 14);
          }
          cx0 += ww;
        });
        x.font = '10.5px ' + SM;
        x.fillStyle = '#63776d';
        x.textAlign = 'left';
        x.fillText(lab, L, y - 9);
      };
      bar(
        26,
        [
          [HT, '#46c288', '250 HT'],
          [HT * TVA, '#ffd166', 'TVA 50']
        ],
        '1 · prix HT + TVA 20 % = 300 € TTC'
      );
      const rv = TTC * (rem / 100);
      bar(
        92,
        [
          [TTC - rv, '#7ef2b0', fr((TTC - rv).toFixed(0)) + ' €'],
          [rv, 'rgba(226,114,91,.55)', rv * sc > 46 ? '−' + fr(rv.toFixed(0)) : '']
        ],
        '2 · on retire la remise de ' + remR + ' %'
      );
      const fw = TTC * k * sc;
      x.fillStyle = 'rgba(126,242,176,.16)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2;
      rr(x, L, 158, Math.max(4, fw), 28, 4);
      x.fill();
      x.stroke();
      x.font = 'bold 12px ' + SM;
      x.fillStyle = '#7ef2b0';
      x.textAlign = 'left';
      x.fillText(fr(fin.toFixed(2)) + ' €', L + 9, 172);
      x.font = '10.5px ' + SM;
      x.fillStyle = '#63776d';
      x.fillText('3 · ou directement 300 × ' + fr(k.toFixed(2)), L, 149);
      host.querySelector('#rT').textContent = '300 €';
      host.querySelector('#rC').textContent = '× ' + fr(k.toFixed(2));
      host.querySelector('#rF').textContent = fr(fin.toFixed(2)) + ' €';
      say.innerHTML =
        remR === 0
          ? 'Sans remise, le coefficient vaut 1 : on paie le TTC entier, 300 €.'
          : `Deux chemins, un seul résultat : 300 − ${fr(((TTC * rem) / 100).toFixed(2))} = <b>${fr(fin.toFixed(2))} €</b>, ou bien 300 × ${fr(k.toFixed(2))} = <b>${fr(fin.toFixed(2))} €</b>. Le <b>coefficient multiplicateur</b> fait le calcul en une fois.`;
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
