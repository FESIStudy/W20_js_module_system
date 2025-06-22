## 자바스크립트의 한계

- 자바스크립트는 1995년 브라우저에서의 **간단한 동적 처리를 위해 설계**되었기 때문에, 여러 한계를 가지고 있었다.
    - **모듈 시스템 부재:** 다양한 모듈들을 쉽게 로드할 수 없고, 네임스페이스를 구분하지 않는다.
    - **글로벌 스코프 오염**: 모든 스크립트가 전역 범위에서 실행되며 서로 접근할 수 있다.
    - **전역 변수 충돌**: 여러 스크립트가 동일한 전역 변수를 사용하면 충돌이 발생한다.
    - **의존성 관리 어려움**: 의존성을 올바른 순서에 위치시켜야 했고, 순서가 지켜지지 않으면 제대로 실행되지 않는다.

<br/>

## CommonJS

### CommonJS의 등장

- 2009년 Kevin Dangoor는 자바스크립트에도 **서버사이드**를 위한 표준이 필요하다며, 다음과 같은 사항이 부족하다고 발표했다.
    - 서로 호환되는 표준 라이브러리가 없다.
    - 데이터베이스에 연결할 수 있는 표준 인터페이스가 없다.
    - 다른 모듈을 삽입하는 표준적인 방법이 없다.
    - 코드를 패키징해서 배포하고 설치하는 방법이 필요하다.
    - 의존성 문제까지 해결하는 공통 패키지 모듈 저장소가 필요하다.
- 위의 발표 덕분에 CommonJS가 만들어졌고, CommonS에 의해 모듈 시스템이 만들어졌다.
    - CommonJS의 ‘Common’은 자바스크립트를 브라우저에서만 사용하는 언어가 아닌 범용적인 언어로 사용할 수 있게 하겠다는 의지를 나타내는 것이라고 볼 수 있다.
    - CommonJS는 하나의 워킹 그룹이다.

<br/>

### CommonJS 기본 문법

- `require()` 함수로 모듈을 불러오고, `export` 객체로 모듈을 내보낸다.

```jsx
// math.js - 모듈 내보내기
module.exports.add = (a, b) => a + b;
module.exports.subtract = (a, b) => a - b;

// 또는
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// app.js - 모듈 가져오기
const math = require('./math');
console.log(math.add(2, 3)); // 5

// 또는 구조분해할당
const { add, subtract } = require('./math');
```

- 실행 타이밍: **런타임 시점**
    - CommonJS는 런타임(실행 단계)에서 모듈을 분석한다.
    - 따라서 **동적 require**가 가능하다.
        
        ```jsx
        // 동적 require 가능
        let moduleName = 'math';
        
        if (condition) {
        	moduleName = 'other-math';
        }
        
        const module = require(`./${moduleNAme}`);
        ```
        
<br/>

### require의 동작 원리

- 캐싱 메커니즘
    - Node.js에서 모듈을 `require()` 하면, 동일한 파일 경로의 모듈은 한 번만 로드되고 실행된다.
    - 이후 같은 모듈을 다시 `require()` 하면, 이미 메모리에 로드된 결과(`module.exports`)를 그대로 반환하여 성능을 높인다.
    - 캐시된 모듈 정보는 `require.cache`에 저장되며, 필요하면 수동으로 `delete require.cache[모듈경로]`로 무효화할 수 있다.
- 동기 호출
    - `require()`는 반드시 **동기적**으로 동작한다.
    - Node.js가 코드를 위에서 아래로 실행하다가 `require()`를 만나면, 해당 모듈 파일을 찾아 로드하고, 내부 코드를 즉시 실행하여 `module.exports`를 얻는다.
    - 모듈 로딩이 끝나야 이후 코드를 실행할 수 있다.

<br/>

### 순환 참조 처리 방식

- Node.js에서는 **순환 의존성을 허용**한다.
- 순환 참조가 발생 시, 현재 로딩 중인 모듈은 중간 상태의 `exports` 객체를 반환하여 무한 루프를 방지한다. 이후 로드가 완료되면 exports는 완전한 상태로 덮어씌워진다.
    
    ```jsx
    // a.js
    const b = require('./b');
    module.exports = { name: 'A', b };
    
    // b.js  
    const a = require('./a'); // a의 exports는 아직 완전히 초기화되지 않음
    module.exports = { name: 'B', a };
    ```
    
- 결과적으로 `b.js`가 `a.js`의 완전한 `exports`를 받지 못하므로 값이 `undefined`이거나 부분적으로만 초기화된다.

<br/>

### 모듈 스코프와 내장 변수

- CommonJS에서는 각 모듈 파일이 즉시실행 함수(IIFE) 형태로 감싸져 실행된다.
    
    ```jsx
    (function (exports, require, module, __filename, __dirname) {
        // 모듈 코드
    });
    ```
    
- 이를 통해 모듈은 고유한 스코프를 가지며 전역 오염을 방지한다.
- 사용 가능한 내장 변수
    - `__dirname`: 현재 모듈 파일이 위치한 디렉터리의 절대 경로
    - `__filename`: 현재 모듈 파일의 절대 경로
    - `module`: 현재 모듈 자체를 나타내는 객체
    - `exports`: `module.exports`의 단축 참조
    - `require`: 모듈 로더 함수

<br/>

### Node.js에서의 적용과 한계

- 장점
    - Node.js에서 기본적으로 지원하여 설정이 필요 없다.
    - 오래된 패키지나 기존 코드와의 호환성이 좋다.
    - 동기적 로딩으로 간단한 구조를 가진다.
- 한계
    - 동기적으로 동작하여 성능 문제를 일으킬 수 있다.
    - Tree Shaking을 지원하지 않는다.
    - 브라우저 환경에서 직접 실행할 수 없다. (번들링 필요)

<br/>

## AMD (Asynchronous Module Definition)

- **비동기 상황에서도** 동작하는 자바스크립트 모듈을 만들기 위해 CommonJS에서 독립한 워킹 그룹이다.
    - CommonJS의 목적: 서버사이드에서 자바스크립트를 사용하는 것(브라우저 밖으로 꺼내기 위한 노력)
    - AMD: 브라우저 환경에서 비동기적으로 모듈을 로드하는 것에 중점을 둠
- CommonJS에서 분리되어 나온 그룹이기 때문에, `require`나 exports같은 문법을 그대로 사용할 수 있다.

<br/>

### define()

- 브라우저 환경의 자바스크립트는 모듈 간 스코프가 따로 존재하지 않기 때문에, 파일 간 모듈을 구분해주기 위해 `define()` 함수의 클로저를 활용한다.
- 예시 코드
    
    ```jsx
    // example.js
    define(['lodash', 'yumyum'], function(_, Y) {
      console.log(_); // lodash
      console.log(Y); // yumyum
      return {
        a: _,
        b: Y,
      }
    });
    
    // lodash, yumyum 사용 시
    require(['example'], function (example) {
      console.log(example.a); // lodash
      console.log(example.b); // yumyum
      console.log(lodash); // undefined 또는 에러
    });
    ```
    
<br/>

## ESM (ECMAScript Modules)

- ES6부터 지원되는 자바스크립트의 표준 모듈 시스템
    
    ```jsx
    // math.js - 모듈 내보내기
    export const add = (a, b) => a + b;
    export const subtract = (a, b) => a - b;
    
    // 기본 내보내기
    export default function multiply(a, b) {
        return a * b;
    }
    
    // main.js - 모듈 가져오기
    import { add, subtract } from './math.js';
    import multiply from './math.js';
    
    // 모든 것을 한번에 가져오기
    import * as math from './math.js';
    
    ```
    
- 실행 타이밍: **정적 분석 단계**
    - ESM은 컴파일 단계(코드가 번들링되는 시점)에서 모듈을 분석한다.
    - import문은 정적으로 평가되기 때문에 **모든 모듈의 가장 상위 레벨과 제어 흐름 구문의 바깥쪽에** 기술되어야 한다.
        
        ```jsx
        // ❌ 불가능 - 조건문 내부에서 import
        if (condition) {
            import module1 from './module1.js';
        }
        
        // ✅ 가능 - 최상위 레벨에서 import
        import module1 from './module1.js';
        
        ```
        
<br/>

### Top-level await 지원

- ES2022(ES13)부터 도입된 기능으로, 모듈 스코프에서 직접 await 키워드를 사용할 수 있다.
    
    ```jsx
    // 기존 방식 - async 함수로 감싸야 함
    async function main() {
        const result = await fetchData();
        console.log(result);
    }
    main();
    
    // Top-level await 사용
    const result = await fetchData();
    console.log(result);
    ```
    
- 특징
    - ESM에서만 사용할 수 있다.
    - 해당 비동기 작업이 완료될 때까지 다른 모듈의 실행을 막는다.
    - 모듈 간의 실행 순서를 보장해준다.

<br/>

### import와 export의 정적 구조

- import와 export는 항상 파일의 최상단에 위치해야 하며, CommonJS의 require와 달리 실행 도중 동적으로 평가될 수 없다.
    
    ```jsx
    // ✅ 정적 구조 - 빌드 타임에 분석 가능
    import { add } from './utils/math.js';
    export const result = add(1, 2);
    
    // ❌ 동적 구조 - ESM에서 불가능
    const utilName = getUtilName();
    import util from `./utils/${utilName}.js`;
    ```
    
<br/>

### 트리 쉐이킹

- 정적으로 구조화된 import와 export 문법을 사용하기 때문에, 빌드 도구는 모듈 간의 의존성을 **빌드 시점에 분석**할 수 있어 사용되지 않는 코드를 안전하게 제거할 수 있다. (→ 번들 크기 감소)
    
    ```jsx
    // lodash-es에서 특정 함수만 import
    import { debounce, throttle } from 'lodash-es';
    // 번들러가 debounce, throttle만 포함하고 나머지는 제거
    ```
    
<br/>

### 순환 참조 처리 방식

- ESM은 순환 참조를 위해 **라이브 바인딩(live binding)**을 유지한다.
- 즉, 이름 참조는 연결되어 있으나 값은 아직 할당되지 않았을 수 있다.
- 예시
    
    ```jsx
    // a.mjs
    import { valueB } from './b.mjs';
    export const valueA = 'A';
    console.log('a.mjs', valueB); // undefined
    
    // b.mjs
    import { valueA } from './a.mjs';
    export const valueB = 'B';
    console.log('b.mjs', valueA); // 'A'
    ```
    
    - ESM은 **import 구문이 정적으로 호이스팅**되므로
        - `a` 로드 → `b` import → `b` 로드 → `a` import → … (순환 참조)
    - `a`의 `valueA`는 이미 export로 선언되어 있으나, 아직 초기화 단계 전이므로 `b`가 `a.valueA`를 참조하면 `undefined`가 뜬다.
    
    > 초기화 이전 참조는 TDZ(Temporal Dead Zone) 오류로 잡히기도 한다.
    > 
<br/>

### 사용법

- 브라우저
    
    ```jsx
    <script type="module">
        import { sayHi } from './sayHi.js';
        sayHi('John');
    </script>
    ```
    
- Node.js
    - package.json에 `"type": "module"` 설정
        - 해당 패키지의 모든 `.js` 파일이 ESM으로 해석된다.
        - `.js` 파일을 ESM으로 사용하고 싶을 때 사용한다.
    - 또는 `.mjs` 확장자 사용
        - package.json 설정과 무관하게 항상 ESM으로 해석된다.
<br/>

## CJS와 ESM 비교

| **항목** | **CommonJS (CJS)** | **ECMAScript Modules (ESM)** |
| --- | --- | --- |
| 문법 | **`require()`** / **`module.exports`** | **`import`** / **`export`** |
| 분석 시점 | 런타임 (실행 단계) | 컴파일 시점 (정적 분석) |
| 로딩 방식 | 동적 (Dynamic) | 정적 (Static) |
| 실행 방식 | 동기적 | 비동기적 |
| 트리 쉐이킹 | 어려움 | 효율적 |
| Top-level await | 지원 안함 | 지원 |
| 조건부 import | 가능 | 불가능 (동적 import() 제외) |
| 캐싱 | 지원 | 지원 |
| 순환 참조 | 중간 상태의 `exports` 반환 | undefined 반환 또는 TDZ 문제 발생 |

<br/>

## CJS, ESM 혼용 문제 및 해결 전략

- CJS에서 ESM import 시 에러
    - ex. “SyntaxError: Cannout use import statement outside a module”
    - 발생 원인
        - package.json에 `"type": "module"` 설정이 없는 상태에서 import 문 사용
        - CommonJS 환경에서 ESM 문법 사용
    - 해결 방법
        1. package.json에 `“type”: “module”` 추가
        2. 파일 확장자를 `.mjs`로 변경
        3. CommonJS 문법(`require`)으로 변경
- ESM에서 CJS import 시 default와 named export 문제
    - ESM에서 CJS를 import할 때는 default import만 가능하며, named import는 사용할 수 없다.
        
        ```jsx
        // CJS 모듈 (lodash)
        module.exports = { shuffle: function() {}, debounce: function() {} };
        
        // ❌ ESM에서 named import 불가능
        import { shuffle } from 'lodash';
        
        // ✅ ESM에서 default import만 가능
        import _ from 'lodash';
        import lodash from 'lodash';
        const { shuffle } = lodash;
        ```
        
- 디펜던시가 ESM only인 경우 대응법
    1. 프로젝트를 ESM으로 마이그레이션
    2. 동적 import 사용 
    3. 호환 가능한 대체 패키지 찾기
    4. ESM wrapper 생성
    
<br/>

## 새롭게 알게 된 점

- Next.js의 `package.json`에는 `type: "module"`이 없는데 왜 import/export 사용이 가능할까?
    - Next.js는 내부 빌드 과정에서 ESM을 CommonJS나 ESM으로 변환해 최종 번들을 만든다.
        - Babel: ESM 문법과 최신 JS 문법을 구형 JS로 변환
        - Webpack (또는 다른 번들러): 서로 다른 모듈을 하나의 그래프로 통합
    - 결과적으로 브라우저 쪽 번들은 ESM 기반으로 동작하고, 서버 쪽은 Node.js에서 돌릴 수 있도록 최적화된 형태로 처리한다.
    
<br/>

## 면접 대비 질문 리스트

- `require()`와 `import`는 정확히 어떤 시점에 평가되는가?
    - `require()`는 CommonJS의 함수로, **런타임에 동적으로 평가**됩니다. `import`는 ES 모듈 시스템의 문법으로, **모듈 로드 단계에서 정적으로 분석되어 먼저 평가**되고, 런타임 이전에 의존성이 결정됩니다.
- 트리 쉐이킹이 가능한 구조는 어떤 전제에서 가능한가?
    - 트리 쉐이킹은 **모듈의 구조가 정적으로 분석 가능**해야 작동합니다. ESM은 import/export가 정적으로 선언되어 있어 의존성을 빌드 단계에서 안전하게 분석할 수 있으므로 트리 쉐이킹이 가능합니다. 반면, CommonJS는 require()가 런타임에 동적으로 실행되어 모듈 경로를 예측하기 어려워 트리 쉐이킹이 어렵습니다.
- 순환 참조 발생 시 CJS vs ESM의 반환 값은 어떻게 다른가?
    - CJS에서는 모듈이 순환 참조되면, `require()`가 순차적으로 실행되므로 아직 완전히 초기화되지 않은 `exports` 객체가 반환됩니다. 즉, `exports`가 중간 상태일 수 있습니다. ESM에서는 `import`가 호이스팅되어 모듈이 연결되며, 순환 참조 시 라이브 바인딩을 유지하기 때문에 아직 초기화되지 않은 변수에 접근하면 `undefined`가 나올 수 있지만, 참조 자체는 끊기지 않습니다.
- ESM에서의 top-level await은 어떤 문제를 해결해주는가?
    - ESM의 top-level-await은 모듈 스코프에서 직접 `await`를 쓸 수 있게 해주어, 비동기 초기화 로직 (DB 연결, 동적 import 등)을 위해 별도의 비동기 함수로 감싸지 않아도 됩니다. 이를 통해 모듈 간의 비동기 의존성을 더 자연스럽게 처리할 수 있습니다.
- 번들링 시 ESM과 CJS가 함께 존재할 때 어떻게 처리되는가?
    - ESM과 CJS가 혼재된 프로젝트를 번들링할 때는 `Webpack`이나 `Vite` 같은 번들러가 두 모듈 시스템을 모두 인식해 적절한 방식으로 하나의 번들로 통합합니다. ESM에서 CJS를 import하면 `module.exports`가 `default`로 매핑되고, 반대로도 마찬가지로 interop 레이어가 삽입됩니다. Babel은 문법 변환을 담당하고, 실제 로딩은 번들러가 처리합니다.
        - interop 레이어 삽입
            - ESM → CJS: `__esModule` 플래그로 `default`와 네임드 export 정리
            - CJS → ESM: 동적 import로 감싸서 비동기 처리
- Node.js에서 두 시스템을 혼용했을 때 발생할 수 있는 에러는?
    - ESM 파일에서 `require()`를 사용하면 `ReferenceError`가 발생하며, CJS 파일에서 `import` 문법을 쓰면 `SyntaxError`가 발생합니다. ESM에서 CJS를 import할 때는 `module.exports`가 `default`에 매핑되므로 구조 분해할 때 예상치 못한 값이 나올 수 있습니다.
        
        ```jsx
        // CJS
        module.exports = { a: 1 };
        
        // ESM
        import a from './cjs'; // ❌ a는 { a: 1 } 전체임
        const { a: value } = a; // 이렇게 써야 함
        ```
        

## 참고자료

https://d2.naver.com/helloworld/12864

https://velog.io/@yesbb/%EB%AA%A8%EB%93%88-%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%9D%98-%EC%97%AD%EC%82%AC-%EA%B7%B8%EB%A6%AC%EA%B3%A0-ESM

https://roseline.oopy.io/dev/translation-why-cjs-and-esm-cannot-get-along