# React Template 구조와 변경 영향

## 실행 구조

```text
브라우저
  └─ client/src/index.tsx
      └─ App → RootLayout
          ├─ init/axios
          ├─ BrowserRouter + AppContextProvider
          ├─ RootLayoutAppInitializer → g.nav / g.location
          └─ DefaultLayout → router/index.tsx → 화면 컴포넌트

개발: client webpack-dev-server : APP_HOST:APP_PORT
  └─ /api/* → API_URL/*

운영: server/src/app.ts : APP_PORT 또는 APP_SECURE_PORT
  ├─ /api/version/app                 로컬 버전 응답
  ├─ /api/* → API_URL/*               외부 API 프록시
  ├─ /deploy/github                   GitHub push 배포 훅
  ├─ client/dist 정적 파일 제공
  └─ 나머지 경로 → EJS로 index.html 렌더링
```

## 패키지와 생성 결과

| 영역 | 소스·설정 | 생성 결과 | 핵심 명령 |
| --- | --- | --- | --- |
| 루트 | `package.json`, `.env`, 배포 스크립트 | 배포 브랜치/묶음 | `npm run verify`, `npm run build` |
| 클라이언트 | `client/src`, `client/public`, `client/webpack` | `client/dist`, `client/build/report.html` | `npm run client:dev`, `npm run client:build` |
| 서버 | `server/src`, `server/webpack.config.js`, `server/ecosystem.config.js` | 개발 `server/@dev`, 운영 `server/dist/app.js` | `npm run server:dev`, `npm run server:build` |

루트에 npm workspace 설정은 없다. 각 디렉터리는 별도 `package.json`과 의존성 설치 경계를 가진다.

## 클라이언트 경계

### 진입점과 레이아웃

- `client/src/index.tsx`가 React root를 만들고 `App`을 렌더링한다.
- `RootLayout`이 전역 초기화, 오류 경계, HTML 로딩 제어, 라우터, 앱 컨텍스트를 소유한다.
- `RootLayoutAppInitializer`는 React Router 상태를 `g.nav`와 `g.location`에 연결한다.
- `DefaultLayout` 아래에서 `client/src/router/index.tsx`의 화면 라우트가 렌더링된다.

### 컴포넌트 규칙

- 공통 컴포넌트는 `client/src/component/@Common/{분류}/{이름}`에 구현, 타입, `index.ts`를 둔다.
- 기능 화면은 `client/src/component/{기능}` 아래에 두고 인접 `index.ts`와 `client/src/component/index.ts`로 export한다.
- 경로 별칭은 `client/tsconfig.json`이 기준이며 Webpack이 이를 읽어 동일 alias를 만든다.

### 자동 주입 전역

`client/webpack/ProvidePlugin.js`는 다음 묶음을 합친다.

- `ProvidePlugin.react.js`: `React`
- `ProvidePlugin.react-hooks.js`: React 훅
- `ProvidePlugin.pdg.js`: `@pdg/*` 비교·날짜·데이터·훅 유틸리티
- `ProvidePlugin.third-party.js`: router 훅, styled-components, dayjs 등
- `ProvidePlugin.common-component.js`: `Button`, `PageRootContainer`, `T` 등 공통 컴포넌트
- `ProvidePlugin.app.js`: `api`, `g`, `env`, `loadable`, 컨텍스트 훅 등 앱 전역

각 식별자의 TypeScript 선언은 `client/src/@types/webpack.ProvidePlugin.*.d.ts`에 있다. 공통 컴포넌트 목록은 ESLint 전역에도 사용되므로 주입 설정, 타입 선언, ESLint 인식을 함께 맞춘다.

### API 계약

- 화면 코드는 `client/src/global/api`의 `api` 또는 `createApi`를 기준으로 호출한다.
- 공통 응답은 `ApiResult`, 목록은 필요 시 `ApiPaging` 계약을 사용한다.
- 브라우저 요청의 `/api/foo`는 개발 Webpack과 운영 Express 모두 외부 `API_URL/foo`로 전달된다.
- `APP_HOST`와 `API_URL` 도메인이 다르면 쿠키가 적용되지 않는다는 기존 운영 제약이 있다.
- Axios 초기화는 `XSRF-TOKEN` 쿠키를 `X-CSRF-TOKEN` 헤더로 연결한다.

## 서버 경계

- `server/src/init`이 루트 `.env`와 서버 전역 유틸리티를 먼저 초기화한다.
- Redis 세션은 관련 환경값이 모두 있고 `SESSION_DRIVER=redis`일 때만 설치된다.
- `/api/version/app`은 외부 프록시보다 먼저 등록되어 로컬에서 처리된다.
- 외부 API 프록시는 `^/api`를 제거하고 선택적으로 keep-alive agent를 사용한다.
- JSON/body parser는 현재 프록시 뒤, `/deploy/github` 앞에 있다. 순서 변경은 프록시 본문과 webhook 서명 계산에 영향을 줄 수 있다.
- 마지막 `*` 라우트는 React Router 새로고침을 위해 `client/dist/index.html`을 EJS로 렌더링한다.
- 스케줄러는 로컬이 아닌 환경에서만 PM2 일일 reload job을 등록하며, `JobBase`가 같은 프로세스 안의 중복 실행을 막는다.
- SIGINT 처리, HTTPS→HTTPS 리다이렉트, keep-alive timeout은 서버 생명주기 계약이다.

## 변경 영향표

| 변경 종류 | 함께 확인할 곳 | 최소 검증 |
| --- | --- | --- |
| 새 화면·라우트 | 기능 폴더 `index.ts`, `component/index.ts`, `router/index.tsx`, 레이아웃 | `npm run verify` + 브라우저 직접 확인 |
| 공통 컴포넌트 | 구현·타입·barrel, 필요 시 ProvidePlugin과 `.d.ts` | `npm run verify` + 사용 화면 확인 |
| 전역 유틸리티 | 실제 export, ProvidePlugin, 전역 `.d.ts`, ESLint globals | `npm run verify` + `npm run client:build` |
| API 요청/응답 | 화면 타입, `global/api`, 오류 처리, 프록시 경로 | `npm run verify` + 실제 요청 확인 |
| 서버 로컬 API | 컨트롤러 export, `app.ts` 라우트 순서, body parser | `npm run verify` + HTTP 상태/본문 확인 |
| 환경 변수 | `.env.example`, 소비 코드, 개발·운영 차이 | `npm run verify` + 해당 환경 기동 |
| Webpack/자산 | client 또는 server config, public 복사, dist 소비 경로 | `npm run build` |
| 세션·보안·배포 | Redis 조건, CSP/CSRF, webhook 서명, PM2 경로 | 전체 빌드 + 격리된 환경 검증과 별도 리뷰 |

## 알려진 검증 경계

- 현재 저장소에는 자동 테스트 스크립트가 없다. `npm run verify`는 lint와 TypeScript 정적 검사만 보장한다.
- `npm run build`는 번들 생성 가능성을 검증하지만 브라우저 UX, 외부 API, Redis, HTTPS, Slack, GitHub webhook, PM2 동작까지 증명하지 않는다.
- 클라이언트는 `react`와 `react-dom`을 실행 시 사용하지만 현재 `client/package.json`의 직접 의존성에는 선언하지 않는다. 설치된 모듈만 있는 환경의 빌드 성공을 새 환경의 재현성 증거로 보지 말고, 의존성 정책을 바꿀 때는 깨끗한 설치를 별도로 확인한다.
- `client/tsconfig.json`과 `server/tsconfig.json`은 `src/**/*.test.tsx`를 제외하므로 테스트를 추가하면 별도 테스트 runner와 타입 검사 범위를 설계해야 한다.
- `client/dist`와 `server/dist`는 기본 `.gitignore` 대상이지만 배포 준비 과정에서 규칙을 바꾸는 기존 절차가 있다. 일반 개발 중에는 ignore 규칙을 변경하지 않는다.
