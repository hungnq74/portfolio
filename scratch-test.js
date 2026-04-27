const N = 9;
const totalSteps = N;
const index = 1;
const enterStart = index === 0 ? 0 : (index - 0.5) / totalSteps;
const enterEnd   = index === 0 ? 0 : index / totalSteps;
console.log(enterStart, enterEnd);
