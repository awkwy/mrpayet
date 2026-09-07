<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const PLATEAU = 100,
      START = 20;
    let T = START,
      phase = 0,
      playing = false;
    const { x, W, H } = cvs(host, 200);
    const ctl = box(host, 'vctl', `<button class="p" id="go">&#9654; Chauffer</button><button class="gh" id="rz">Recommencer</button>`);
    readout(host, [
      { id: 'cT', k: 'température', c: 'w' },
      { id: 'cE', k: 'état' }
    ]);
    const say = box(host, 'say', '');
    const hist = [];
    for (let i = 0; i <= 16; i++) hist.push([i, START + i * 2.6]);
    let _seed = hist[hist.length - 1];
    T = _seed[1];
    const L = 44,
      R = W - 12,
      TT = 12,
      B = 28,
      MAXt = 60,
      MAXT = 140;
    const sx = (v) => L + (v / MAXt) * (R - L),
      sy = (v) => H - B - (v / MAXT) * (H - B - TT);
    function step() {
      if (!playing) return;
      const last = hist[hist.length - 1][0] + 1;
      if (T < PLATEAU - 0.01 && phase === 0) {
        T += 2.2;
        if (T >= PLATEAU) {
          T = PLATEAU;
          phase = 1;
        }
      } else if (phase === 1) {
        phase = 1.0001;
      } else if (phase >= 1 && phase < 1.9) {
        phase += 0.08;
      } else if (phase >= 1.9) {
        T += 1.6;
        if (T >= 135) playing = false;
      }
      hist.push([last, T]);
      if (hist.length > MAXt) hist.shift();
      loop.raf(step);
    }
    function draw() {
      x.clearRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.08)';
      x.lineWidth = 1;
      for (let v = 0; v <= MAXT; v += 20) {
        x.beginPath();
        x.moveTo(L, sy(v));
        x.lineTo(R, sy(v));
        x.stroke();
      }
      x.strokeStyle = 'rgba(255,255,255,.2)';
      x.beginPath();
      x.moveTo(L, TT);
      x.lineTo(L, H - B);
      x.lineTo(R, H - B);
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'right';
      x.textBaseline = 'middle';
      for (let v = 0; v <= MAXT; v += 40) x.fillText(v + '°', L - 6, sy(v));
      x.textBaseline = 'alphabetic';
      x.textAlign = 'center';
      x.fillText('temps', (L + R) / 2, H - 8);
      x.strokeStyle = '#ffd166';
      x.setLineDash([5, 4]);
      x.lineWidth = 1.4;
      x.beginPath();
      x.moveTo(L, sy(PLATEAU));
      x.lineTo(R, sy(PLATEAU));
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = '#ffd166';
      x.textAlign = 'left';
      x.fillText("100 °C : l'eau bout", L + 4, sy(PLATEAU) - 6);
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.4;
      x.lineJoin = 'round';
      x.beginPath();
      hist.forEach(([tt, v], i) => {
        i ? x.lineTo(sx(tt), sy(v)) : x.moveTo(sx(tt), sy(v));
      });
      x.stroke();
      const l = hist[hist.length - 1];
      x.fillStyle = '#7ef2b0';
      x.beginPath();
      x.arc(sx(l[0]), sy(l[1]), 4, 0, 7);
      x.fill();
      const st = T >= PLATEAU - 0.5 && phase < 1.9 ? 'eau + vapeur (ébullition)' : T >= 134 ? "vapeur d'eau" : 'eau liquide';
      host.querySelector('#cT').textContent = fr(T.toFixed(0)) + ' °C';
      host.querySelector('#cE').textContent = st;
      say.innerHTML =
        phase >= 1 && phase < 1.9
          ? `<b>Palier</b> : on chauffe toujours, mais la température <b>reste à 100 °C</b>. Toute l'énergie sert à transformer l'eau en vapeur, pas à la réchauffer.`
          : T >= 134
            ? `L'eau est entièrement devenue vapeur : la température peut à nouveau monter.`
            : `La température <b>monte</b> régulièrement tant qu'il n'y a pas de changement d'état.`;
    }
    ctl.querySelector('#go').onclick = function () {
      playing = !playing;
      this.innerHTML = playing ? '&#10073;&#10073; Pause' : '&#9654; Chauffer';
      if (playing) step();
    };
    ctl.querySelector('#rz').onclick = () => {
      playing = false;
      T = START;
      phase = 0;
      hist.length = 0;
      hist.push([0, START]);
      ctl.querySelector('#go').innerHTML = '&#9654; Chauffer';
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
