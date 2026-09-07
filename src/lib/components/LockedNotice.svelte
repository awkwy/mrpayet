<script>
  // Affiché à la place d'un contenu dont la semaine de programme n'est pas
  // encore arrivée — y compris quand on y arrive par un lien direct ou un
  // QR code imprimé à l'avance. `lock` vient de courseLock / chapterLock /
  // blocLock ({ from, monday }).
  let { lock, quoi = 'Ce contenu' } = $props();

  let date = $derived(
    lock?.monday?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })
  );
</script>

<div class="locked">
  <p class="lk-t">Pas encore disponible</p>
  <p class="lk-b">
    {quoi} sera accessible à partir de la semaine du <strong>{date}</strong>.
    La classe n'en est pas encore là — reviens à ce moment-là.
  </p>
</div>

<style>
  .locked {
    margin-top: 20px;
    padding: 20px 22px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .lk-t {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .lk-b {
    margin-top: 10px;
    color: var(--dim);
    line-height: 1.6;
  }
  .lk-b strong {
    color: var(--tx);
  }
</style>
