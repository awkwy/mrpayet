<script>
  let { entryState, typed, cols = ['x', 'y'], onedit } = $props();

  function toggleSign(i, j) {
    const v = typed[i][j] || '';
    onedit(i, j, v.startsWith('-') ? v.slice(1) : '-' + v);
  }
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
      {#each entryState as row, i (i)}
        <tr>
          <td class="idx">{i + 1}</td>
          {#each row as cell, j (j)}
            <td>
              <div class="cellin">
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  value={typed[i][j]}
                  oninput={(e) => onedit(i, j, e.target.value)}
                  class={cell.state}
                />
                {#if cell.neg}
                  <button
                    type="button"
                    class="sign"
                    onclick={() => toggleSign(i, j)}
                    aria-label="Insérer ou retirer le signe moins"
                  >
                    −
                  </button>
                {/if}
              </div>
            </td>
          {/each}
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
  .idx {
    color: var(--dim2);
    text-align: left;
    width: 28px;
  }
  .cellin {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
  input {
    width: 100%;
    max-width: 80px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 5px 7px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 13px;
    text-align: right;
  }
  input:focus-visible {
    border-color: var(--g);
  }
  input.ok {
    border-color: var(--g3);
  }
  input.no {
    border-color: var(--red);
  }
  .sign {
    flex-shrink: 0;
    width: 24px;
    height: 26px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
  }
  .sign:hover,
  .sign:focus-visible {
    border-color: var(--g);
  }
</style>
