<script>
  import { onMount, onDestroy } from 'svelte';
  import { drag } from 'd3-drag';
  import { box, readout, SM, fr, DUR } from './shared.js';
  import { dotPlot, stackDots, spring, select } from './d3.js';

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    let vals = DUR.slice();
    let dragging = -1;

    const { svg, x, W, H, L, R, AX } = dotPlot(host, {
      height: 190,
      min: 10,
      max: 100,
      step: 10,
      bot: 58
    });

    // socle épais de l'axe (rappel de l'ancien tracé #31473d au canvas)
    svg
      .insert('line', '.ax')
      .attr('x1', L)
      .attr('x2', R)
      .attr('y1', AX)
      .attr('y2', AX)
      .attr('stroke', '#31473d')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    const dotsG = svg.append('g').attr('class', 'dots');
    const pivotG = svg.append('g').attr('class', 'pivot');
    const tri = pivotG
      .append('path')
      .attr('d', 'M0,0 L-9,17 L9,17 Z')
      .attr('fill', '#ffd166');
    const label = pivotG
      .append('text')
      .attr('y', H - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffd166')
      .attr('font-family', SM)
      .attr('font-size', 12)
      .attr('font-weight', 'bold');

    const ctl = box(host, 'vctl', `<button class="gh" id="rz">Remettre les vraies durées</button>`);
    readout(host, [
      { id: 'yM', k: 'moyenne' },
      { id: 'yS', k: 'somme', c: 'd' },
      { id: 'yN', k: 'effectif', c: 'd' }
    ]);
    const say = box(host, 'say', 'Fais glisser un point : le pivot suit toujours la moyenne.');

    const sum = () => vals.reduce((s, v) => s + v, 0);
    const mean = () => sum() / vals.length;
    const clampV = (v) => Math.max(10, Math.min(100, v));
    const pivotX = () => Math.max(56, Math.min(W - 56, x(mean())));

    const dragBehavior = drag()
      .container(function () {
        return this.ownerSVGElement;
      })
      .on('start', (event, d) => {
        dragging = d.i;
        render(false);
      })
      .on('drag', (event, d) => {
        vals[d.i] = clampV(Math.round(x.invert(event.x)));
        render(false);
      })
      .on('end', () => {
        dragging = -1;
        render(true);
      });

    function render(animate) {
      const layout = stackDots(vals, x, AX);
      const m = mean();

      const join = dotsG.selectAll('g.dot').data(layout, (d) => d.i);
      const enter = join
        .enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', (d) => `translate(${d.cx},${d.cy})`)
        .call(dragBehavior);
      enter
        .append('circle')
        .attr('class', 'hit')
        .attr('r', 15)
        .attr('fill', 'transparent')
        .style('cursor', 'grab');
      enter.append('circle').attr('class', 'mark');

      const all = enter.merge(join);
      all
        .select('circle.mark')
        .attr('r', (d) => (d.i === dragging ? 6.5 : 5))
        .attr('fill', (d) => (d.i === dragging ? '#ffd166' : 'rgba(126,242,176,.9)'))
        .attr('stroke', (d) => (d.i === dragging ? '#fff' : 'none'))
        .attr('stroke-width', 1.5);

      all.each(function (d) {
        const sel = select(this);
        const t = `translate(${d.cx},${d.cy})`;
        if (animate && d.i !== dragging) {
          sel.transition('move').duration(720).ease(spring).attr('transform', t);
        } else {
          sel.interrupt('move').attr('transform', t);
        }
      });

      const px = pivotX();
      (animate ? tri.transition('p').duration(760).ease(spring) : tri.interrupt('p')).attr(
        'transform',
        `translate(${px},${AX + 24})`
      );
      (animate ? label.transition('p').duration(760).ease(spring) : label.interrupt('p')).attr('x', px);
      label.text('moyenne ' + fr(m.toFixed(1)));

      host.querySelector('#yM').textContent = fr(m.toFixed(2));
      host.querySelector('#yS').textContent = fr(sum().toFixed(0));
      host.querySelector('#yN').textContent = vals.length;

      const below = vals.filter((v) => v < m).length;
      say.innerHTML =
        `Somme ${sum()} ÷ ${vals.length} = <b>${fr(m.toFixed(2))} min</b>. ` +
        `<b>${below}</b> durée${below > 1 ? 's' : ''} sur ${vals.length} ${below > 1 ? 'sont' : 'est'} en dessous de la moyenne` +
        (below > vals.length * 0.7 ? ' — une seule valeur très grande a tiré le pivot vers la droite.' : '.');
    }

    render(false);
    // entrée animée : les points montent de l'axe vers leur pile
    dotsG
      .selectAll('g.dot')
      .attr('transform', (d) => `translate(${d.cx},${AX})`)
      .transition('move')
      .duration(700)
      .delay((d, i) => i * 22)
      .ease(spring)
      .attr('transform', (d) => `translate(${d.cx},${d.cy})`);

    ctl.querySelector('#rz').onclick = () => {
      vals = DUR.slice();
      render(true);
    };

    cleanup = () => {
      svg.selectAll('*').interrupt('move').interrupt('p');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
