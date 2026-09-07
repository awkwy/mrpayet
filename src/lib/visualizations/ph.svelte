<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let ph = 7,
      base = 7;
    const { x, W, H } = cvs(host, 150);
    slider(host, 'pH mesuré', 0, 14, 7, (v) => 'pH ' + v, (v) => {
      ph = v;
      base = v;
    });
    const ctl = box(host, 'vctl', `<button class="p" id="dil">Ajouter de l'eau (diluer)</button><button class="gh" id="rz">Recommencer</button>`);
    readout(host, [
      { id: 'hP', k: 'pH', c: 'w' },
      { id: 'hC', k: 'nature de la solution' }
    ]);
    const say = box(host, 'say', '');
    const cur = new Spring(7, { k: 110, d: 20 });
    const colAt = (p) => (p < 3 ? '#e2725b' : p < 6 ? '#e79a3a' : p < 8 ? '#7ef2b0' : p < 11 ? '#5aa9d6' : '#7d6ae0');
    function draw() {
      const P = cur.to(ph).step();
      x.clearRect(0, 0, W, H);
      const L = 14,
        R = W - 14,
        y = 46,
        h = 24;
      for (let i = 0; i <= 140; i++) {
        const p = i / 10,
          xx = L + (p / 14) * (R - L);
        x.fillStyle = colAt(p);
        x.fillRect(xx, y, (R - L) / 140 + 1, h);
      }
      x.font = '10px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      [0, 7, 14].forEach((p) => x.fillText(String(p), L + (p / 14) * (R - L), y + h + 13));
      x.fillStyle = '#63776d';
      x.fillText('acide', L + (2 / 14) * (R - L), y - 9);
      x.fillText('neutre', L + (7 / 14) * (R - L), y - 9);
      x.fillText('basique', L + (12 / 14) * (R - L), y - 9);
      const cxp = L + (P / 14) * (R - L);
      x.fillStyle = '#fff';
      x.beginPath();
      x.moveTo(cxp, y - 2);
      x.lineTo(cxp - 6, y - 12);
      x.lineTo(cxp + 6, y - 12);
      x.closePath();
      x.fill();
      x.fillRect(cxp - 1.5, y, 3, h);
      x.font = 'bold 14px ' + SM;
      x.textAlign = 'center';
      x.fillText('pH ' + fr(P.toFixed(1)), cxp, y + h + 30);
      const nat = P < 6.5 ? 'acide' : P > 7.5 ? 'basique' : 'neutre';
      host.querySelector('#hP').textContent = fr(P.toFixed(1));
      const ce = host.querySelector('#hC');
      ce.textContent = nat;
      ce.className = 'v ' + (nat === 'acide' ? 'r' : nat === 'basique' ? '' : 'w');
      say.innerHTML =
        Math.abs(base - P) > 0.15
          ? `En diluant, le pH se rapproche de <b>7</b> : ${base < 7 ? "l'acide voit son pH monter" : base > 7 ? 'la base voit son pH baisser' : 'une solution neutre reste neutre'}. Ici ${fr(base.toFixed(1))} &rarr; ${fr(P.toFixed(1))}.`
          : P < 6.5
            ? `pH ${fr(P.toFixed(1))} &lt; 7 : solution <b>acide</b> (détartrant, vinaigre).`
            : P > 7.5
              ? `pH ${fr(P.toFixed(1))} &gt; 7 : solution <b>basique</b> (savon, eau de Javel).`
              : `pH proche de 7 : solution <b>neutre</b>, comme l'eau pure — ce qu'il faut pour la peau des bébés.`;
    }
    ctl.querySelector('#dil').onclick = () => {
      ph = ph + (7 - ph) * 0.45;
    };
    ctl.querySelector('#rz').onclick = () => {
      ph = base;
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
