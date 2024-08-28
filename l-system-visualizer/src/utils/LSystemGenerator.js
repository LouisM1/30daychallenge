export function generateLSystem(axiom, rules, iterations) {
  let result = axiom;
  for (let i = 0; i < iterations; i++) {
    result = result.split('').map(char => rules[char] || char).join('');
  }
  return result;
}
