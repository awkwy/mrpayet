<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const P = 0.2;
    let n = 10,
      fs = [],
      anim = null;
    const { x, W, H } = cvs(host, 215);
    const nb = box(host, 'vctl', [10, 30, 100, 1000].map((v) => `<button data-n="${v}"${v === 10 ? ' class="on"' : ''}>n = ${v}</button>`).join(''));
    const ctl = box(
      host,
      'vctl',
      `<button class="p" id="o1">Prélever 1</button><button class="p" id="o20">Prélever 20</button><button class="gh" id="rz">Recommencer</button>`
    );
    readout(host, [
      { id: 'fE', k: 'étendue des fréquences' },
      { id: 'fN', k: 'échantillons', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    const L = 48,
      R = 18,
      AX = H - 46,
      xOf = (f) => L + f * (W - L - R);
    function draw() {
      x.clearRect(0, 0, W, H);
      x.strokeStyle = 'rgba(255,255,255,.2)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(L, AX);
      x.lineTo(W - R, AX);
      x.stroke();
      x.font = '11px ' + SM;
      x.fillStyle = 'rgba(255,255,255,.5)';
      x.textAlign = 'center';
      for (let t = 0; t <= 1.0001; t += 0.25) {
        x.beginPath();
        x.moveTo(xOf(t), AX);
        x.lineTo(xOf(t), AX + 5);
        x.stroke();
        x.fillText(fr(t.toFixed(2)), xOf(t), AX + 17);
      }
      x.strokeStyle = '#ffd166';
      x.setLineDash([5, 4]);
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(xOf(P), 16);
      x.lineTo(xOf(P), AX);
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = '#ffd166';
      x.fillText('p = 0,20', xOf(P), 10);
      if (fs.length > 1) {
        const mn = Math.min(...fs),
          mx = Math.max(...fs);
        x.strokeStyle = '#7ef2b0';
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(xOf(mn), AX - 5);
        x.lineTo(xOf(mn), AX + 5);
        x.moveTo(xOf(mx), AX - 5);
        x.lineTo(xOf(mx), AX + 5);
        x.moveTo(xOf(mn), AX);
        x.lineTo(xOf(mx), AX);
        x.stroke();
      }
      const bk = {};
      fs.forEach((f) => {
        const k = Math.round(xOf(f));
        bk[k] = (bk[k] || 0) + 1;
        x.fillStyle = 'rgba(126,242,176,.85)';
        x.beginPath();
        x.arc(k, Math.max(14, AX - 9 - (bk[k] - 1) * 6.5), 3.2, 0, 7);
        x.fill();
      });
      if (anim) {
        const { done, tot, bad } = anim,
          cols = Math.min(tot, 40);
        for (let i = 0; i < done; i++) {
          const s = Math.min(10, (W - L - R) / cols - 2);
          x.fillStyle = i < bad ? '#ffd166' : '#2b4038';
          x.fillRect(L + (i % cols) * (s + 2), 14 + Math.floor(i / cols) * (s + 2), s, s);
        }
      }
    }
    const smp = () => {
      let b = 0;
      for (let i = 0; i < n; i++) if (Math.random() < P) b++;
      return b;
    };
    function upd() {
      draw();
      host.querySelector('#fN').textContent = fs.length;
      if (fs.length > 1) {
        const e = Math.max(...fs) - Math.min(...fs);
        host.querySelector('#fE').textContent = fr(e.toFixed(3));
        say.innerHTML =
          `Sur ${fs.length} échantillons de <b>n = ${n}</b>, les fréquences vont de <b>${fr(Math.min(...fs).toFixed(2))}</b> à <b>${fr(Math.max(...fs).toFixed(2))}</b> : l'étendue vaut <b style="color:var(--g)">${fr(e.toFixed(3))}</b>. ` +
          (n >= 100 ? 'Avec un grand n, les fréquences se resserrent autour de p.' : 'Passe à n = 100 puis n = 1000 : regarde le nuage se resserrer.');
      } else if (fs.length === 1) {
        host.querySelector('#fE').textContent = '—';
        say.innerHTML = `Fréquence de cet échantillon : <b>${fr(fs[0].toFixed(2))}</b>. Il en faut plusieurs pour parler d'étendue.`;
      }
    }
    function one() {
      const bad = smp();
      anim = { done: 0, tot: n, bad };
      const per = Math.max(1, Math.ceil(n / 14));
      const step = () => {
        anim.done = Math.min(anim.tot, anim.done + per);
        draw();
        if (anim.done < anim.tot) loop.raf(step);
        else {
          fs.push(bad / n);
          anim = null;
          upd();
        }
      };
      step();
    }
    function many(k) {
      let i = 0;
      anim = null;
      const step = () => {
        fs.push(smp() / n);
        upd();
        if (++i < k) loop.raf(step);
      };
      step();
    }
    ctl.querySelector('#o1').onclick = () => {
      if (!anim) one();
    };
    ctl.querySelector('#o20').onclick = () => {
      if (!anim) many(20);
    };
    ctl.querySelector('#rz').onclick = () => {
      fs = [];
      anim = null;
      host.querySelector('#fE').textContent = '—';
      host.querySelector('#fN').textContent = '0';
      draw();
      say.textContent = 'Prélève un échantillon.';
    };
    nb.querySelectorAll('[data-n]').forEach((b) => {
      b.onclick = () => {
        n = +b.dataset.n;
        fs = [];
        anim = null;
        nb.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        host.querySelector('#fE').textContent = '—';
        host.querySelector('#fN').textContent = '0';
        draw();
        say.innerHTML = `Taille d'échantillon <b>n = ${n}</b>. Prélève plusieurs échantillons et regarde l'étendue.`;
      };
    });
    for (let i = 0; i < 12; i++) fs.push(smp() / n);
    upd();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
