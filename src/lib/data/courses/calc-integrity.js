export function findBadCalcRefs(courses) {
  const bad = [];
  for (const course of courses) {
    course.seances.forEach((seance, seanceIndex) => {
      const datasets = seance.datasets || {};
      (seance.steps || []).forEach((step, stepIndex) => {
        // `mode: 'stat1'` (Stat1Shell) porte sa série dans `calc.series`, pas dans `datasets`.
        if (step.calc && step.calc.mode !== 'stat1' && !(step.calc.dataset in datasets)) {
          bad.push({ courseId: course.id, seanceIndex, stepIndex, dataset: step.calc.dataset });
        }
      });
    });
  }
  return bad;
}
