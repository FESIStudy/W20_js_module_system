### 모듈 시스템

어플리케이션의 규모가 커지면서 유지보수와 재사용을 위해 여러 파일로 분리하는것이 효율적이다. 이 분리된 파일을 모듈이라고 부른다. 그리고 이러한 모듈을 효과적으로 불러오고 모듈 단위로 구성해주는 AMD, UMD, CommonJS와 같은 라이브러리가 등장하게 되고, ES6 이후에 ES Modules이 등장하며 모듈의 개발로 SPA를 고통받지 않고 구현할 수 있게 되었다.

### CJS vs MJS

그렇다면, JS 모듈을 불러올 때 어떤 방식을 사용하는지 좀 더 알아보자.

- mjs : Module JS(ECMAScript Module)
- cjs: Common JS(Common JS Module)

### CommonJS 모듈

```jsx
// util.js
module.exports.sum = (x, y) => x + y;
// main.js
const {sum} = require('./util.js');
console.log(sum(2, 4)); // 6
```

- 비표준이며, 역사적으로 Node.js에서 주로 사용되었다.
- `require`와 `module.exports` 문법을 사용한다.
- `Node.js` 초기 버전부터 사용되었으며, 여전히 많은 기존 `Node.js` 코드베이스에서 사용된다.
- 특징
    - **동기적 로드**: 모듈이 필요한 시점에 즉시 로드되고 해당 모듈의 코드가 실행될 때까지 다음 진행이 차단된다. 브라우저 환경에서 차단은 성능 혹은 동작에 문제가 발생할 수 있다.
    - **서버 사이드 혹은 런타임에서 사용**
    - **Tree-shaking이 어려워** 번들의 크기에 영향을 미칠 수 있다.
    - **캐싱**: 같은 모듈이 여러번 로드되어도 한번만 실행된다. 이는 무한 루프를 방지하고 성능을 향상시킨다.

### ECMAScript 모듈(ESM)

```jsx
// util.js
export const sum = (x, y) => x + y;
// main.js
import { sum } from './util.js';
console.log(sum(2, 4)); // 6
```

- **공식 표준**으로, ES6(ECMAScript 2015)부터 도입되었다.
- `import`와 `export` 문법을 사용한다.
- 브라우저와 `Node.js`(버전 12 이상)에서 기본적으로 지원된다.
- 특징
    - 인스턴스화, 평가 단계를 거치며 다양한 특징들을 가지게 된다.
    - 비동기적 로드
        - Top-Level Await를 지원하기 때문에 가능하다.
    - 정적 분석
        - 빌드 타임에 모듈 의존성을 파악할 수 있어 불필요한 모듈을 불러오지 않고 최적화할 수 있다.
        - Tree-shaking을 쉽게 할 수 있다.
    - dynamic import
        - 리액트의 lazy, Next.JS의 dynamic처럼 번들러를 활용해 코드 스플리팅과 모듈 로딩 성능을 최적화할 수 있다.

### package.json

.mjs, .cjs 확장자를 명시하는게 아니라 .js 확장자를 사용하면, package.json의 type 속성에 따라 사용할 방식을 지정할 수 있다.

<img width="293" alt="image" src="https://github.com/user-attachments/assets/f6fbae45-bd74-44ed-9254-13cbb4d05c6d" />

- module: 모든 .js 파일이 ECMAScript Module 파일로 취급
- commonjs: 기본 설정. 생략 가능. 모든 .js 파일이 CommonJS Module 파일로 취급

### 로딩 방식 (동기 vs 비동기)

- **CJS는 동기 로딩**이므로 순차적으로 파일을 불러오는 방식 → Node.js에서 적합
- **MJS는 비동기 로딩**이므로 먼저 파싱 후 모듈을 병렬로 로딩 → 브라우저 환경에 적합

> ⚠️ 그래서 require()는 조건문 안에서도 사용할 수 있지만, import는 항상 모듈 최상단에서만 사용 가능
> 

### 트리 셰이킹 지원 여부

- **CommonJS**는 `require()`가 런타임에서 모듈을 불러오므로, **정적 분석이 어려워 트리 셰이킹이 불가능**
- **ESModule**은 정적인 `import`/`export`를 사용하므로 **번들러가 사용하지 않는 코드를 제거할 수 있음**

```jsx
// utils.js
export const A = () => {};
export const B = () => {};

// main.js
import { A } from './utils';
// B는 사용되지 않으므로 제거 가능 (트리 셰이킹)
```

### 면접 질문 대비

**1. `require()`와 `import`는 정확히 어떤 시점에 평가되는가?**

`require()`는 런타임 시점에 평가되어 모듈을 동기적으로 로드하며, 코드 흐름에 따라 실행 중 언제든 호출될 수 있습니다. 반면, `import`는 모듈이 파싱되는 단계에서 정적으로 평가되며, 실행 전에 전체 의존성 그래프가 구성되기 때문에 항상 파일의 최상단에서만 사용할 수 있습니다.

**2. 트리 셰이킹이 가능한 구조는 어떤 전제에서 가능한가?**

트리 셰이킹이 가능하려면 `import`와 `export`가 정적으로 분석 가능한 형태로 작성되어야 하며, 모듈이 ESModule 형식을 따르고, 사이드 이펙트가 없어야 합니다. 또한, 이를 지원하는 번들러(Webpack, Rollup 등)를 사용할 때만 실제로 사용되지 않는 코드가 제거됩니다.

**3. 순환 참조 발생 시 CJS vs ESM의 반환 값은 어떻게 다른가?**

CommonJS에서는 순환 참조가 발생할 경우 모듈이 완전히 초기화되기 전에 `require()`가 실행되어 불완전한 객체가 반환될 수 있습니다. 반면, ESModule은 모듈 간의 참조를 미리 등록하고, 실제 값은 초기화 이후에 동적으로 바인딩되기 때문에 더 안정적인 순환 참조 처리가 가능합니다.

**4. ESM에서의 top-level await은 어떤 문제를 해결해주는가?**

ESM에서는 모듈의 최상위에서 `await`를 사용할 수 있어, 데이터베이스 연결이나 설정 파일 로드와 같은 비동기 작업을 별도의 함수 없이도 처리할 수 있게 해줍니다. 이는 기존 CommonJS 환경에서 비동기 초기화가 번거로웠던 문제를 해결하고, 코드의 구조를 더 단순하게 만들어 줍니다.

**5. 번들링 시 ESM과 CJS가 함께 존재할 때 어떻게 처리되는가?**

번들링 도구는 ESM과 CJS를 혼합하여 처리할 수 있도록 인터롭(interop) 레이어를 삽입합니다. ESM에서 CJS를 불러올 경우 자동으로 default export 형태로 래핑되며, 반대로 CJS에서 ESM을 불러오려면 보통 동적 `import()`가 사용되어야 합니다. 이 과정에서 모듈 구조 차이로 인한 `default` 접근 오류 등이 발생할 수 있습니다.

**6. Node.js에서 두 시스템을 혼용했을 때 발생할 수 있는 에러는?**

Node.js에서 CommonJS와 ESModule을 혼용하면 `import`를 지원하지 않는 CJS 파일에서 import 문을 사용할 경우 구문 오류가 발생하거나, CJS의 `require()`로 ESModule을 불러올 때 `ERR_REQUIRE_ESM`와 같은 런타임 에러가 발생할 수 있습니다. 또한, ESModule에서는 `__dirname`이나 `require()`를 사용할 수 없어 `ReferenceError`가 발생하는 등 환경별 제약도 존재합니다.

---

https://velog.io/@juwon98/mjs-vs-cjs

https://mxx-kor.github.io/blog/module-cjs-esm

[https://mong-blog.tistory.com/entry/JSModule-CommonJS와-ES-Modules는-무엇일까](https://mong-blog.tistory.com/entry/JSModule-CommonJS%EC%99%80-ES-Modules%EB%8A%94-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C)
