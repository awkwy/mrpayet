function normalize(z) {
  return String(z)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkNumeric(value, answer, tol = 0) {
  const v = String(value).trim().replace(',', '.');
  if (!v) return false;
  const x = parseFloat(v);
  return !isNaN(x) && Math.abs(x - answer) <= tol + 1e-9;
}

export function checkText(value, answer) {
  const v = normalize(value);
  if (!v) return false;
  const answers = Array.isArray(answer) ? answer : [answer];
  return answers.some((a) => {
    const na = normalize(a);
    return v === na || v.startsWith(na) || v.endsWith(na);
  });
}

export function checkAnswer(value, question) {
  return question.txt ? checkText(value, question.a) : checkNumeric(value, question.a, question.tol || 0);
}
