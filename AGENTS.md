# React Template 에이전트 가이드

## 무엇을 다루는가

- 이 저장소는 Webpack 기반 React 19 클라이언트와 Express 서버를 한 저장소에서 빌드·배포하는 애플리케이션 템플릿이다.
- `client/src`는 화면, 라우팅, 컨텍스트, 공통 컴포넌트와 브라우저 전역 유틸리티의 기준 경로다.
- `server/src`는 정적 클라이언트 제공, `/api` 프록시, 버전·배포 엔드포인트, 세션과 스케줄러의 기준 경로다.
- 루트 `.env`를 클라이언트 Webpack과 서버가 함께 읽는다. 실제 비밀값은 커밋하지 말고 키 목록은 `.env.example`과 동기화한다.

## 반드시 지킬 경계

- 클라이언트는 Webpack `ProvidePlugin`으로 React 훅, 공통 컴포넌트, `api`, `g` 등을 자동 주입한다. 새 전역을 추가하거나 이름을 바꿀 때는 `client/webpack/ProvidePlugin.*.js`와 `client/src/@types/webpack.ProvidePlugin.*.d.ts`를 함께 갱신한다.
- 새 화면은 컴포넌트 export, `client/src/router/index.tsx` 라우트, 필요 시 레이아웃을 하나의 계약으로 다룬다.
- `/api`는 개발 서버와 Express 서버 모두에서 `API_URL`로 프록시되며 앞의 `/api`가 제거된다. 프록시 앞에 두어야 하는 로컬 엔드포인트의 순서를 보존한다.
- `client/dist`, `client/build`, `server/dist`, `server/@dev`는 생성 결과다. 요청 없이 생성 파일을 직접 편집하거나 배포 스크립트를 실행하지 않는다.
- `.publish*`, `pm2:*`, `reset:gitignore`, `reinstall*`, `deploy/github`는 브랜치·프로세스·의존성 또는 배포 상태를 바꾼다. 사용자의 명시적 요청과 대상 환경 확인 없이 실행하지 않는다.

## 작업 방법

- 시작 전에 `git status --short`와 관련 진입점·barrel export·타입 선언을 확인하고, 사용자 변경을 보존한다.
- Node 버전은 `.nvmrc`의 `24.12.0`을 기준으로 한다. 의존성은 루트, `client`, `server`에 각각 설치되는 구조다.
- 일반 코드 변경 후 루트에서 `npm run verify`를 실행한다. 빌드 또는 배포 관련 변경은 추가로 `npm run build`를 실행한다.
- UI 동작은 정적 검사만으로 완료 처리하지 않는다. 가능하면 `npm run dev`로 실제 라우팅·로딩·API 프록시를 확인하고, 서버 변경은 필요 시 `npm run server:dev`로 별도 검증한다.
- 저장소 전용 작업 절차는 `.agents/skills/react-template-orchestrator/SKILL.md`, 구조 설명과 변경 영향표는 그 스킬의 `references/architecture.md`, 협업 규약은 `docs/harness/react-template/team-spec.md`를 따른다.
