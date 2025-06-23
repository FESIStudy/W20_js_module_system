import * as math from '../cjs/math.js'; // CJS import
console.log(math.add(10, 20));
console.log(math.default?.add?.(10, 20)); // 패키지에 따라 default로 래핑될 수 있음