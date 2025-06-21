# JS의 모듈 시스템

모듈이라하면 코드를 나눠서 한묶음으로 만들어놓은 코드 뭉치라고 생각하면 되는데
이게 왜 필요하냐, 코드를 안나누고 하나 묶음으로 다 넣으면 변수명 짓기도 어렵고
로드도 오래걸린다. 예전에는 자바스크립트에 모듈 시스템이란게 없어서 팔만대장경
처럼 하나에 코드를 다 넣었는데 완전 초기에야 자바스크립트가 많이 쓸 일이 없었으니
상관이 없었을텐데 시간이 지나며 필요해졌음.

모듈의 특징

- 자신만의 파일 스코프를 가져야한다
    - 즉슨 모듈 안에 있는 변수, 함수, 객체등은 비공개 상태(캡슐화)다 -> 타 모듈에서 접근 못한다(export는 또 다른 얘기)

개인적인 궁금증

# package.json에 "type": "module" 은 무엇인가

Node.js에서 .js 확장자를 가진 파일이 CommonJS로 해석될지, ESM으로 해석될지를 결정하는 설정.

{
  "type": "module"
}

이렇게 작성하면:

동일한 .js 파일이라도 ESM으로 판단한다.

당연하게도 import/export 문법을 사용할 수 있다.

💡 기본적으로 Node.js는 .js 파일을 CommonJS로 간주합니다. 따라서 ESM을 쓰려면 type: "module"을 반드시 명시하거나, .mjs 확장자를 사용해야 한다.

- 자바스크립트는 모듈을 지원을 안한다는 애기가 있다.
esm이 아닌 자바스크립트 파일은 스크립트 태그로 분리해서 로드해도 독자적인 모듈 스코프를 가지지 않는다.


브라우저에서 script 태그에 js파일을 따로 할당해도 하나늬 js를 실행시키는거랑 같게 처리된다고 한다

```js
// foo.js
// 전역변수
var x = 'foo'
clg(window.x)
```
```js
// var.js
// 전역변수
var x = 'var'
clg(window.x)
```

```html
<!doctype html>
<html lang="en">
  <body>
    <script  src="foo.js"></script>
    <script  src="var.js"></script>
  </body>
</html>

```

이러면 로그가 'var'가 찍힌 다는 사실

하지만 .mjs확장자를 쓴다면 독자 모듈 스코프를 가지게 된다

```js
// foo.mjs
var x = 'foo'
clg(window.x) // undefined가 출력됨. x변수가 window에 속한게 아니어서!
```
```js
// var.mjs
var x = 'var'
clg(window.x) // undefined가 출력됨. x변수가 window에 속한게 아니어서!
```

```html
<!doctype html>
<html lang="en">
  <body>
    <script  src="foo.mjs"></script>
    <script  src="var.mjs"></script>
  </body>
</html>

```

이러면 언디파인드가 출력된다.
물론 var.mjs는 foo.mjs의 x변수에 접근도 안된다

```js
// foo.mjs
// 전역변수
var x = 'foo'
clg(x) // foo출력
```
```js
// var.mjs
clg(x) // undefined가 출력됨. 
```

그렇다면 cjs는 뭐야 따로 .mjs라고 하지도 않는데, 기본 자바스크립트를 그냥 쓰는건데 모듈스코프를 가지자나

실제로 CommonJS도 모듈 스코프를 가지지만. 다만, 이건 언어 차원(ES 표준)에서 제공되는 스코프가 아니라 Node.js 런타임이 내부적으로 구현한 방식


### ✅ 어떻게 스코프를 가지냐면?

Node.js는 CJS 모듈을 실행할 때 다음과 같이 감싸서 실행해요:

```js
(function(exports, require, module, __filename, __dirname) {
  // 당신이 작성한 CJS 모듈 코드
})();
```

즉, 각각의 CJS 파일은 자동으로 **함수 스코프 안에 감싸져** 있기 때문에 외부로부터 독립적인 스코프를 가지는 것처럼 동작하는 거죠. 이걸 우리는 **모듈 스코프처럼 느끼는 것**이고요.

> 그래서 `var a = 1`을 CJS 파일 안에서 써도 그건 전역(global)이 아니라 그 파일 내부에서만 유효한 변수예요.

---

### ✅ ESM은 진짜로 스펙에 명시된 모듈 스코프

반면, ES Module은 자바스크립트 언어 스펙 레벨에서 **각 모듈 파일은 고유한 모듈 스코프를 가진다**고 정의돼 있어요. 그래서 `import`, `export`가 최상단에서만 가능하고, 변수들도 전역을 오염시키지 않도록 설계되어 있죠.

---

### 🎯 정리하면

| 구분              | CJS                 | ESM                 |
| --------------- | ------------------- | ------------------- |
| 모듈 스코프          | Node.js가 함수로 감싸서 구현 | 자바스크립트 언어 스펙에 의해 구현 |
| top-level await | ❌ 안 됨               | ✅ 가능                |
| 엄격 모드           | 선택적                 | 항상 strict mode      |

---

### ✅ 번들러가 개입하는 경우

Webpack, Vite 등의 번들러는 각 모듈을 내부적으로 \*\*IIFE(즉시 실행 함수)\*\*로 감싸거나 자체적인 모듈 시스템을 만들어서, CJS이든 ESM이든 **스코프 충돌 없이 하나의 파일로 병합**해줍니다. 이게 바로 번들링의 핵심 기능 중 하나예요.

---
라고 한다. 그니까 esm이랑 cjs언어 스팩 레벨 자체가 다른것이다.

궁금증. top-level await, 엄격 모드는 무엇인가


좋은 포인트예요. 표에 있는 `Top-level await`과 `엄격 모드(strict mode)`는 **ESM이 제공하는 특징**이고, CJS에서는 기본적으로 **지원하지 않거나 명시적으로 설정해야 하는 특징**이에요.

---

### ✅ Top-level await

* **ESM**: `await` 키워드를 **모듈의 최상단에서 사용 가능**해요. 예:

  ```js
  // ESM
  const data = await fetch('...');
  ```
* **CJS**: top-level에서 `await`를 쓰면 문법 오류가 나요. 무조건 함수 안에서 써야 함.

  ```js
  async function run() {
    const data = await fetch('...');
  }
  ```

> 즉, `Top-level await = 모듈 최상단에서 await 가능 여부`라고 이해하면 됨.

---

### ✅ 엄격 모드 (`strict mode`)

* **ESM**: 모든 ESM 모듈은 자동으로 `strict mode`에서 실행됨. 따로 `"use strict"` 안 써도 됨.
* **CJS**: 기본은 느슨한 모드 (non-strict). 원하면 파일 최상단에 `"use strict"`를 명시해야 함.

---

따라서 표의 의미는:

| 항목              | CJS                          | ESM                 |
| --------------- | ---------------------------- | ------------------- |
| Top-level await | ❌ `함수 안에서만 await 가능`         | ✅ 모듈 최상단에서 await 가능 |
| 엄격 모드           | 선택적 (`\"use strict\"` 직접 명시) | 항상 엄격 모드 적용됨 (자동)   |


---

### ✅ 엄격 모드(strict mode)란?

\*\*`"use strict"`\*\*는 자바스크립트의 **strict mode**를 활성화하는 선언이에요. ECMAScript 5부터 도입됐고, 더 안전한 자바스크립트를 작성할 수 있도록 제한을 가해줍니다.

#### 예를 들어…

```js
// 비엄격 모드에서는 에러 안 남
x = 10;

// 엄격 모드에서는 ReferenceError 발생
"use strict";
x = 10; // ❌ 선언 없이 변수 사용 금지
```

#### 주요 특징:

* 선언 없이 변수 사용 시 에러
* `this`가 명확히 설정되지 않으면 `undefined` (비엄격에선 `window`)
* 중복 매개변수 금지
* `with` 문 금지
* 함수/변수 이름에 예약어 사용 금지 (`let`, `enum`, 등)

👉 **ES Modules(ESM)은 항상 strict mode로 동작**하고,
👉 **CommonJS(CJS)는 명시적으로 `"use strict"`를 써야 적용**돼요.

---

### ✅ 왜 CJS에서는 비동기 함수를 감싸야 하나요?

자바스크립트에서 `await`는 **비동기 함수 안에서만 쓸 수 있는 문법**이에요:

```js
// ❌ 최상단에서 await 사용 불가 (CJS에서는 문법 에러)
const res = await fetch(...);

// ✅ 함수로 감싸면 사용 가능
async function main() {
  const res = await fetch(...);
}
main();
```

이유는 다음과 같아요:

* CJS는 스펙상 **top-level await를 지원하지 않음** (런타임이 `await` 문을 실행하기 전에 함수로 감싸서 실행할 수단이 없음)
* 반면, **ESM은 엔진이 전체 모듈을 비동기로 처리할 수 있기 때문에** top-level await를 허용해요

💡 CJS에서 top-level await이 안 되는 이유는 단순히 스펙에서 허용하지 않았기 때문이고, 이를 해결하려면 `async function`으로 감싸는 게 유일한 방법이에요.

---

라고 한다.





