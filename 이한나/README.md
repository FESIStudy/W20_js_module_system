# 1. 자바스크립트 모듈 시스템 역사와 등장 배경

## 1.1 자바스크립트 초기 한계

- **글로벌 스코프 오염**
    
    모든 스크립트가 전역 객체(`window` 혹은 `global`)에 변수를 정의하기 때문에, 이름 충돌이 빈번히 발생했습니다.
    
- **모듈화 미지원**
    
    언어나 런타임 차원에서 `import`/`export` 같은 모듈 문법이 없었기 때문에, 코드 재사용이나 책임 분리가 어렵고 유지보수성이 낮았습니다.
    

## 1.2 모듈화 해결을 위한 방법들

### 1.2.1 IIFE(Immediately Invoked Function Expression)

```tsx
(function(){
  // private 변수·함수
  const counter = 0;
  function increment() { /* ... */ }

  // 외부에 노출할 API
  window.myModule = {
    increment,
  };
})();
```

- 즉시 실행 함수로 **별도 스코프**를 만들고, 내부 구현을 숨긴 뒤 필요한 함수·객체만 전역에 노출하는 기법
- 장점: 전역 변수 최소화, 모듈화 흉내 가능
- 단점: 의존성 로딩(스크립트 태그 순서)에 의존, 비동기 로딩 어려움

### 1.2.2 AMD(Asynchronous Module Definition)

```tsx
// myModule.js 파일 정의
define(['depA', 'depB'], function(A, B){
  return {
    foo() { /*...*/ }
  };
});
// 사용
require(['myModule'], function(mod){
  mod.foo();
});
```

- **비동기 로딩**을 지원하여, 브라우저 환경에서 의존성을 선언적으로 관리
- 대표 구현체: RequireJS
- 장점: 스크립트가 비동기로 로드되어 초기 로딩 속도 개선
- 단점: 브라우저 전용, 문법이 비교적 장황

### 1.2.3 UMD (Universal Module Definition)

```tsx
(function(root, factory){
  if (typeof define === 'function' && define.amd) {
    // AMD 환경
    define(['dep'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS 환경
    module.exports = factory(require('dep'));
  } else {
    // 전역 환경
    root.myLib = factory(root.dep);
  }
}(this, function(dep){
  return { /* ... */ };
}));
```

- **AMD**, **CommonJS**, 그리고 **전역(Global)** 환경을 모두 지원하는 모듈 패턴
- 한 패키지를 여러 환경에서 호환되게 배포할 때 유용

### 1.2.4 CommonJS

```tsx
// myModule.js
const A = require('depA');
const B = require('depB');

function foo() { /* ... */ }

module.exports = { foo };

// 사용
const my = require('./myModule');
my.foo();
```

- **동기 로딩** 방식으로, 주로 Node.js 서버 사이드에서 채택
- `require`가 반환하는 값은 **캐시**되기 때문에 동일 모듈을 여러 번 불러올 때도 성능 비용이 적음
- 장점: 간단한 문법, 파일 간 의존성 해석이 직관적
- 단점: 브라우저에서는 기본 지원되지 않아 별도 번들러(예: Browserify)가 필요

### 1.2.5 ES 모듈 (ESM)

```tsx
// export
export function foo() { /* ... */ }
export const bar = 123;

// import
import { foo, bar } from './myModule.js';
```

- **ECMAScript 2015**(ES6) 표준에 도입된 공식 모듈 시스템
- 정적 분석이 가능하여 번들러(예: Webpack, Rollup)에서 **트리 쉐이킹** 지원
- 브라우저와 Node.js(최신 버전) 양쪽에서 점진적으로 네이티브 지원

### 요약

1. **초기 JS**: 전역 오염 문제 → IIFE 등장
2. **브라우저 전용**: 비동기 로딩 위해 AMD → 다양한 환경 지원 위해 UMD
3. **서버 전용**: Node.js에서 CommonJS
4. **표준화**: ES6 모듈(ESM)로 통합되어, 점차 모든 환경에서 네이티브 지원

위에서 의미하는 동기 로딩과 비동기 로딩이라는 말이 잘 이해가 되지 않아서 더 알아보았습니다.

## 2. 동기 로딩 vs 비동기 로딩

### 2.1. 동기 로딩 (Synchronous Loading)

- **CommonJS** 방식(예: Node.js)에서는 `require('foo')`를 만나면,
    1. 파일 시스템에서 `foo.js`를 **즉시** 불러오고
    2. 그 내용을 평가(evaluate)한 다음
    3. 즉시 반환
- 즉, `const foo = require('foo');` 다음 줄이 실행되기 전에 모듈이 완전히 로드되고 실행되어야 합니다.

```jsx
// CommonJS (Node.js)
const fs = require('fs');  // fs 모듈이 다 로드될 때까지 여기서 멈춤
console.log('fs loaded');
```

### 2.2. 비동기 로딩 (Asynchronous Loading)

- **AMD** 방식(RequireJS 등)에서는 스크립트 태그를 동적으로 추가해서
    1. 브라우저가 **백그라운드**에서 파일을 가져오도록 하고
    2. **로드가 완료된 뒤** 콜백 함수를 실행
- 페이지 초기 로드 성능을 높일 수 있고, 필요할 때만 모듈을 가져올 수 있다는 장점이 있습니다.

```jsx
// AMD (RequireJS)
require(['foo'], function(foo){
  // foo.js가 로드·평가된 후에야 이 콜백이 실행됩니다.
  foo.doSomething();
});
console.log('이 메시지는 foo.js 로드 완료를 기다리지 않고 바로 찍힙니다.');
```

그렇다면 최근에 가장 많이 사용되는 ES 모듈은 어떤 로딩 방식을 채택했을까요?
ES 모듈(ESM)은 **비동기 로딩** 방식을 채택했지만, 코드상으로는 `import` 구문이 마치 동기처럼 “최초 평가 시점(실행 전에)”에 모듈을 가져오는 것처럼 보입니다.

그렇다면 ES 모듈이 표준이 되었으니 ES 모듈 방식을 쓰는것이 가장 좋은걸까요?
아닙니다. 상황에 따라 여전히 동기로딩 방식이 필요할 수 있고, 런타임 환경에 맞춰 CommonJS나 ESM을 골라서 사용하면 됩니다.

# 2. CommonJS

## 2.1 기본 구조

**export**

```jsx
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = { sum };
```

**import**

```jsx
// app.js
const { sum } = require('./sum');
console.log(sum(2, 3)); // 5
```

- `module.exports`에 할당된 값이 `require()` 호출 결과로 반환됩니다.
- 한 모듈에서 여러 값을 내보내고 싶다면 객체 형태로 묶어서 내보내는 것이 일반적입니다.

## 2.2 실행 타이밍: 런타임 시점

1. **`require()` 호출 시점**에 파일 I/O가 발생
2. 읽어온 코드를 즉시 **파싱(parse) → 평가(evaluate) → 실행(execute)**
3. 모듈 로딩·실행이 끝나야 `require()`가 결과값을 돌려주며, 다음 줄이 실행됨

```jsx
// server.js
console.log('Before require');  
const config = require('./config');  // ← 여기서 파일 시스템을 동기 읽기
console.log('After require');       
```

- 위 예제에서 `Before require`와 `After require` 사이에는 `./config.js` 의 코드가 완전히 실행되어야 합니다.

## 2.3 require의 동작 원리

**캐싱(Caching)**

- 한 번 로드된 모듈은 `require.cache`에 저장되어, **두 번째부터는 파일 시스템을 다시 읽지 않고** 캐시된 `exports` 객체를 돌려줍니다.
- 덕분에 동일 모듈을 반복 호출해도 성능 부담이 적고, 상태 유지(singleton) 형태로 활용할 수도 있습니다.

```jsx
// a.js
console.log('a loaded');
module.exports = { foo: 'bar' };

// app.js
require('./a'); // 로그: 'a loaded'
require('./a'); // 로그 없음, 캐시 사용
```

**순환 참조(Circular Dependencies)**

- A → B → A 형태로 순환 참조가 발생하면, **초기화가 완전히 끝나지 않은** `exports` 객체를 받게 됩니다.
- Node.js는 모듈 로딩 중간에 `exports` 객체를 노출하여 순환 참조를 “완급 조절”하지만, 참조 시점에 따라 `undefined`가 나올 수 있으니 주의가 필요합니다.

```jsx
// a.js
console.log('a start');
const b = require('./b');
console.log('in a, b.foo =', b.foo);
module.exports.foo = 'from A';

// b.js
console.log('b start');
const a = require('./a');
console.log('in b, a.foo =', a.foo);
module.exports.foo = 'from B';

// 실행 순서:
// a start
// b start
// in b, a.foo = undefined
// in a, b.foo = from B
```

**동작 순서**

1. A 모듈이 로드되면 빈 `exports` 객체를 생성하고 캐시에 등록
2. A 내부에서 B를 `require()`
3. B 로딩 시작 → 빈 `exports`를 캐시에 등록
4. B 내부에서 다시 A를 `require()` → 캐시에 이미 등록된 A의 현재(아직 완성 전) `exports`를 반환
5. B 실행 완료 → B의 `exports` 채워짐
6. A로 돌아와 B에서 반환된 값을 사용
7. A 실행 완료 → A의 `exports` 채워짐

이 과정을 통해 순환 의존성을 “완급 조절”하지만, 중간 단계에서 참조된 속성은 아직 할당되지 않아 `undefined`가 될 수 있습니다.

## 2.4 모듈 스코프와 전역 변수

- CommonJS 모듈 내부 코드는 **독립된 함수로 래핑**되어 실행됩니다.
- 따라서 모듈 파일의 최상단에서 선언된 변수는 모듈 스코프(local scope)에만 존재하며, 전역(`global`)을 오염시키지 않습니다.

```jsx
// wrapper.js (런타임 내부)
(function (exports, require, module, __filename, __dirname) {
  // 이 안이 각 모듈의 실제 실행 컨텍스트
});
```

## 2.5 __dirname & __filename

- `__dirname`: 현재 모듈 파일이 위치한 **디렉터리 경로**
- `__filename`: 현재 모듈 파일의 **전체 경로**

```jsx
// path-info.js
console.log(__dirname);   // e.g. /Users/you/project
console.log(__filename);  // e.g. /Users/you/project/path-info.js
```

## 2.6 Node.js에서의 적용과 한계

### 적용

- 서버 사이드 애플리케이션 초기화, 스크립트 유틸리티, CLI 도구 등 **별도 빌드 없이** 바로 실행 가능
- `require()`와 `module.exports`만으로 의존성 관리가 간단하고 직관

### 한계

1. **브라우저 미지원**
    - 브라우저는 기본적으로 CommonJS를 이해하지 못하므로, Browserify·Webpack 같은 번들러가 필요합니다.
2. **정적 분석 불가**
    - 런타임에 `require(path)`를 해석하기 때문에, 번들러가 코드를 분석해 미사용 코드를 제거하는 “트리 쉐이킹”이 어렵습니다.
3. **순환 참조 위험**
    - 순환 참조가 복잡해질수록 예측 불가능한 `undefined` 참조 버그가 생기기 쉽습니다.

# 3. ES(ECMAScript) Module

## 3.1 기본 문법

**export**

```jsx
// 모듈 파일: math.js

// 네임드(named) export
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}

// 디폴트(default) export
export default function subtract(a, b) {
  return a - b;
}
```

**import**

```jsx
// 사용하는 파일: app.js

// 네임드 import
import { PI, add } from './math.js';
console.log(PI, add(2,3));  // 3.14159 5

// 디폴트 import (이름은 자유)
import sub from './math.js';
console.log(sub(5,2));      // 3
```

## 3.2 실행 타이밍: 정적 분석 단계에서 import 결정

- 모든 `import`/`export` 구문은 **코드 실행 전에** 파서가 읽어서
    - **의존성 그래프**를 구성
    - **평가 순서**(dependency order)를 결정
- 런타임에 `import`를 만나서 모듈을 해석하는 CommonJS와 달리, ESM은 **빌드(혹은 로딩) 시점**에 이미 “누구를 언제 불러올지”가 확정됩니다.

## 3.3 Top-Level await 지원

- ES2022부터 ESM 최상위 수준에서 `await`가 가능해졌습니다.
- 모듈 전체가 **비동기**로 평가될 수 있어, 초기 설정이나 동기 I/O 없는 비동기 초기화에 유용합니다.

```jsx
// lazy-init.js
const data = await fetch('/config.json').then(r => r.json());
export const CONFIG = data;

// app.js
import { CONFIG } from './lazy-init.js';
console.log(CONFIG);
```

## 3.4 import와 export의 정적 구조

1. **정적 위치**
    - `import`와 `export`는 모두 **파일 최상단**(탑레벨)에서만 사용 가능
2. **문법적 제약**
    - 동적 `import()`와 달리, `import {…} from '…'`은 런타임 변수나 조건문 안에 쓸 수 없습니다.
3. **명시적 의존성**
    - “어떤 이름을 어디서 가져오는지”가 코드상에 그대로 드러나 가독성이 좋습니다.

## 3.5 트리 쉐이킹(Tree-Shaking)이 가능한 구조

- **정적 분석**으로 “어떤 `export`가 사용되지 않는지”를 번들러가 판별합니다.
- 미사용 코드(dead code)를 제거하여 번들 크기를 줄일 수 있습니다.

```jsx
// 유틸 모듈: utils.js
export function used() { /* … */ }
export function unused() { /* … */ }

// app.js
import { used } from './utils.js';
used();   // 번들러는 `unused` 함수 코드를 포함하지 않음
```

### 언제 무엇을 쓰는게 좋을까?

| 상황 | 추천 모듈 시스템 | 이유 |
| --- | --- | --- |
| 브라우저+번들러 → 최신 최적화, 트리 쉐이킹까지 | ES 모듈 (ESM) | 정적 분석·트리 쉐이킹, 표준 문법 |
| Node.js 서버 스타트업 초기 로딩 | CommonJS 또는 ESM | 빠른 스크립트 실행 → CJS, 혹은 최신 Node + `"type": "module"`로 ESM |
| 런타임 중 조건부 로드 | 동적 `import()` (ESM) | 비동기 I/O로 필요할 때만 가져오기 |
| 레거시 프로젝트 | CommonJS | 별도 빌드 없이 바로 `require()` 사용 |