console.log('[math.js] evaluated');

function add(a, b) {
  return a + b;
}

function unused() {
  console.log('never used');
}

module.exports = {
  add,
  unused,
};
