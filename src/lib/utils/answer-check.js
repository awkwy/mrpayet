function normalize(z) {
  return String(z)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // virgule décimale = point (« 0,3 » et « 0.3 » sont la même réponse)
    .replace(/(\d),(?=\d)/g, '$1.')
    .replace(/\s+/g, ' ')
    .trim();
}

// Réponse attendue = un simple nombre (« 0.3 », « 40 », « 12 »). Sans cette règle,
// le test « commence par » acceptait 0,35 pour 0,3 et 400 pour 40 : or la
// différence entre ces écritures est justement ce qu'on entraîne (fréquence,
// × 100). Un nombre suivi d'une unité (« 120 € », « x = 4 ») reste accepté :
// on compare le premier ou le dernier nombre lu.
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;
function matchesNumber(v, n) {
  const nums = v.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return false;
  return Number(nums[0]) === n || Number(nums[nums.length - 1]) === n;
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
    if (PLAIN_NUMBER.test(na)) return matchesNumber(v, Number(na));
    return v === na || v.startsWith(na) || v.endsWith(na);
  });
}

export function checkAnswer(value, question) {
  return question.txt ? checkText(value, question.a) : checkNumeric(value, question.a, question.tol || 0);
}
