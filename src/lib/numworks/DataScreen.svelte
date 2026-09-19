<script>
  import { fmtNum } from './format.js';

  let { points, cols = ['x', 'y'] } = $props();
</script>

<div class="ds">
  <table>
    <thead>
      <tr>
        <th class="idx">N</th>
        <th>{cols[0]}</th>
        <th>{cols[1]}</th>
      </tr>
    </thead>
    <tbody>
      {#each points as [x, y], i (i)}
        <tr>
          <td class="idx">{i + 1}</td>
          <td>{fmtNum(x)}</td>
          <td>{fmtNum(y)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .ds {
    font-family: var(--sm);
    font-size: 13px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 5px 8px;
    text-align: right;
    border-bottom: 1px solid var(--line);
  }
  th {
    color: var(--dim);
    font-weight: 400;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.03em;
  }
  td {
    color: var(--tx);
  }
  .idx {
    color: var(--dim2);
    text-align: left;
    width: 28px;
  }
</style>
