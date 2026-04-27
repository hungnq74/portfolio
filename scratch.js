// just planning the math
const N = 9;
const totalScroll = N - 1; // 8
const index = 1;

const enterStart = (index - 1) / totalScroll;
const enterEnd = index / totalScroll;

console.log(enterStart, enterEnd);
