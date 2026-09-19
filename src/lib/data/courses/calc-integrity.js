export function findBadCalcRefs(courses) {
  const bad = [];
  for (const course of courses) {
    course.seances.forEach((seance, seanceIndex) => {
      const datasets = seance.datasets || {};
      (seance.steps || []).forEach((step, stepIndex) => {
        if (step.calc && !(step.calc.dataset in datasets)) {
          bad.push({ courseId: course.id, seanceIndex, stepIndex, dataset: step.calc.dataset });
        }
      });
    });
  }
  return bad;
}
