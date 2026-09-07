<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr, DUR } from './shared.js';
  import { dotPlot, stackDots, spring, select } from './d3.js';

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    let ext = 95;

    const { svg, x, W, H, L, R, AX } = dotPlot(host, {
      height: 205,
      min: 0,
      max: 180,
      step: 30,
      bot: 62
    });

    // bandes « moitié basse / moitié haute » de part et d'autre de la médiane
    const bandLo = svg
      .insert('rect', '.ax')
      .attr('y', 12)
      .attr('height', AX - 12)
      .attr('fill', 'rgba(126,242,176,.05)');
    const bandHi = svg
      .insert('rect', '.ax')
      .attr('y', 12)
      .attr('height', AX - 12)
      .attr('fill', 'rgba(126,242,176,.02)');

    const dotsG = svg.append('g').attr('class', 'dots');

    const meanLine = svg
      .append('line')
      .attr('y1', 10)
      .attr('y2', AX)
      .attr('stroke', '#ffd166')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4');
    const medLine = svg
      .append('line')
      .attr('y1', 10)
      .attr('y2', AX)
      .attr('stroke', '#7ef2b0')
      .attr('stroke-width', 2.6);

    const meanLabel = svg
      .append('text')
      .attr('y', H - 23)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffd166')
      .attr('font-family', SM)
      .attr('font-size', 11.5)
      .attr('font-weight', 'bold');
    const medLabel = svg
      .append('text')
      .attr('y', H - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#7ef2b0')
      .attr('font-family', SM)
      .attr('font-size', 11.5)
      .attr('font-weight', 'bold');

    const sl = box(
      host,
      'vsl',
      `<label><span>La onzième durée (bouchon grippé)</span><b>95 min</b></label>` +
        `<input type="range" min="25" max="180" value="95" step="1">`
    );
    const inp = sl.querySelector('input');
    const out = sl.querySelector('b');

    readout(host, [
      { id: 'zM', k: 'moyenne', c: 'w' },
      { id: 'zD', k: 'médiane' },
      { id: 'zE', k: 'étendue', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    function render(animate) {
      const vals = DUR.slice(0, 10).concat([ext]);
      const srt = vals.slice().sort((a, b) => a - b);
      const m = vals.reduce((s, v) => s + v, 0) / vals.length;
      const md = srt[5];
      const et = srt[10] - srt[0];
      const gm = x(m);
      const gd = x(md);

      const T = (sel, name) =>
        animate ? sel.transition(name).duration(620).ease(spring) : sel.interrupt(name);

      T(bandLo, 'b').attr('x', L).attr('width', Math.max(0, gd - L));
      T(bandHi, 'b').attr('x', gd).attr('width', Math.max(0, R - gd));

      const layout = stackDots(vals, x, AX);
      const join = dotsG.selectAll('g.dot').data(layout, (d) => d.i);
      const enter = join
        .enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', (d) => `translate(${d.cx},${d.cy})`);
      enter.append('circle');
      const all = enter.merge(join);
      all
        .select('circle')
        .attr('r', (d) => (d.i === 10 ? 6.5 : 5))
        .attr('fill', (d) => (d.i === 10 ? '#ffd166' : 'rgba(126,242,176,.9)'))
        .attr('stroke', (d) => (d.i === 10 ? '#fff' : 'none'))
        .attr('stroke-width', 1.5);
      all.each(function (d) {
        T(select(this), 'move').attr('transform', `translate(${d.cx},${d.cy})`);
      });

      T(meanLine, 'l').attr('x1', gm).attr('x2', gm);
      T(medLine, 'l').attr('x1', gd).attr('x2', gd);
      T(meanLabel, 'l').attr('x', Math.max(58, Math.min(W - 58, gm)));
      meanLabel.text('moyenne ' + fr(m.toFixed(1)));
      T(medLabel, 'l').attr('x', Math.max(52, Math.min(W - 52, gd)));
      medLabel.text('médiane ' + md);

      host.querySelector('#zM').textContent = fr(m.toFixed(1));
      host.querySelector('#zD').textContent = String(md);
      host.querySelector('#zE').textContent = String(et);

      say.innerHTML =
        `En tirant la valeur extrême jusqu'à <b>${Math.round(ext)} min</b> : la moyenne monte à <b>${fr(
          m.toFixed(1)
        )}</b>, la médiane reste à <b>${md}</b>. ` +
        `La médiane ne dépend que du <b>rang</b> des valeurs — cinq durées en dessous, cinq au-dessus, quoi qu'il arrive à la plus grande. L'étendue, elle, vaut ${et} min : elle signale que des cas très longs existent.`;
    }

    inp.addEventListener('input', () => {
      ext = +inp.value;
      out.textContent = ext + ' min';
      render(true);
    });

    render(false);
    // entrée animée : les points montent de l'axe vers leur pile
    // (même révélation décalée que moyenne.svelte, pour deux vues sœurs cohérentes)
    dotsG
      .selectAll('g.dot')
      .attr('transform', (d) => `translate(${d.cx},${AX})`)
      .transition('move')
      .duration(700)
      .delay((d, i) => i * 22)
      .ease(spring)
      .attr('transform', (d) => `translate(${d.cx},${d.cy})`);

    cleanup = () => {
      svg.selectAll('*').interrupt('b').interrupt('l').interrupt('move');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
