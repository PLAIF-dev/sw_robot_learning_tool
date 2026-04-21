# Robot Learning Tool Agent Handoff

이 문서는 다른 에이전트가 `robot-learning-tool` 저장소에 바로 들어와서 구조를 빠르게 파악할 수 있도록 정리한 인수인계 문서다.
현재 기준점은 `학습 실행` 메뉴를 6단계 운영 흐름으로 개편한 뒤의 상태다.

## 1. 제품 개요

- 제품명: `Robot Learning Tool`
- 목적: 듀얼암 로봇 작업 학습 운영
- 핵심 흐름: 작업 생성 -> 장비/카메라 설정 -> 판단 기준 데이터 준비 -> 초기 시연 선별 -> 자동 학습 실행 -> 결과 검토 및 배포

사용자 노출 문구는 제품 톤을 유지해야 한다.

- 허용: 제품 설명, 운영 안내, 기능 목적
- 금지: 구현 지시문, 변명체 문구, `prototype`, `mock`, `목업` 같은 표현
- 예외: 로그인 화면의 기본 비밀번호 `1111` 안내는 유지 가능

## 2. 저장소 구조

```text
robot-learning-tool/
├─ frontend/                         # React + TypeScript + Vite
│  ├─ src/
│  │  ├─ App.tsx                     # 라우팅 진입점
│  │  └─ app/
│  │     ├─ api/                     # axios 기반 API 래퍼
│  │     ├─ components/              # 레이아웃/카메라/로봇 UI
│  │     ├─ hooks/                   # 폴링, 키보드 제어
│  │     ├─ pages/                   # 주요 화면
│  │     ├─ store/                   # zustand 상태 저장소
│  │     ├─ constants.ts             # 라우트/단계명/공통 라벨
│  │     ├─ types.ts                 # 공통 타입
│  │     └─ styles.css               # 전역 스타일
│  └─ package.json
├─ backend/
│  ├─ RobotLearningTool.Api/
│  ├─ RobotLearningTool.Application/
│  ├─ RobotLearningTool.Domain/
│  └─ RobotLearningTool.Infrastructure/
├─ docs/
│  ├─ api-spec.md
│  ├─ demo-scenario.md
│  ├─ menu-structure.md
│  ├─ product-overview.md
│  └─ agent-handoff.md               # 이 문서
└─ README.md
```

## 3. 프론트엔드 라우팅

라우팅 진입점은 `frontend/src/App.tsx`다.

- `/login` -> `LoginPage`
- `/app/dashboard` -> `DashboardPage`
- `/app/tasks` -> `SessionsPage`
- `/app/training` -> `TrainingPage`
- `/app/review` -> `ReviewPage`
- `/app/checkpoints` -> `CheckpointsPage`
- `/app/system` -> `SystemPage`

인증이 필요할 때는 `ProtectedApp`이 `AppLayout`을 감싼다.

## 4. 공통 레이아웃

핵심 파일:

- `frontend/src/app/components/layout/AppLayout.tsx`
- `frontend/src/app/components/layout/TopBar.tsx`
- `frontend/src/app/components/layout/SideNav.tsx`
- `frontend/src/app/components/layout/RightPanel.tsx`
- `frontend/src/app/components/layout/EventLog.tsx`

구성:

- 상단: `TopBar`
- 좌측: 메뉴 네비게이션
- 중앙: 현재 페이지
- 우측: 장비/제어 보조 패널
- 하단: 최근 이벤트 로그

`AppLayout`에서 아래 초기 동작을 수행한다.

- 인증 복구
- 작업 목록 조회
- TCP 제어 상태 갱신
- 장비 상태 폴링 시작

## 5. 상태 저장소

주요 zustand 스토어:

### `authStore.ts`

- 로그인/로그아웃/세션 복구 담당
- 로그인 API 실패 시 비밀번호가 `1111`이면 로컬 토큰으로 진입 허용
- 이 fallback은 로그인 화면 데모 접속을 위해 남겨둔 예외 처리다

### `sessionStore.ts`

- 작업 목록
- 활성 작업
- 작업 생성/중복/전환

### `deviceStore.ts`

- 장비 상태 본문만 저장
- 장비 연결 정보는 `devicesApi.getStatus()`에서 가져온다

### `connectionStore.ts`

- 백엔드 연결 여부만 별도 저장
- `backendConnected: boolean`

### `controlStore.ts`

- TCP 이동, 조인트 상태, 현재 제어 대상 등 로봇 제어 화면 상태 관리

## 6. 백엔드 연결 상태 처리

핵심 파일:

- `frontend/src/app/api/client.ts`
- `frontend/src/app/store/connectionStore.ts`
- `frontend/src/app/components/layout/TopBar.tsx`

동작 방식:

1. 모든 API 요청은 `apiClient`를 통과한다.
2. 응답 성공 시 `connectionStore.backendConnected = true`
3. 네트워크 오류 등으로 응답 자체를 못 받으면 `connectionStore.backendConnected = false`
4. `TopBar`는 이 값을 읽어 우상단에 `연결중` 또는 `연결 끊김`을 표시한다.

주의:

- 장비 상태 fallback과 백엔드 연결 판정은 분리되어 있다.
- 연결 UI를 건드릴 때는 `deviceStore`가 아니라 `connectionStore`와 `api/client.ts`를 먼저 본다.

## 7. 학습 실행 화면 구조

핵심 파일:

- `frontend/src/app/pages/TrainingPage.tsx`
- `frontend/src/app/constants.ts`
- `frontend/src/app/types.ts`
- `frontend/src/app/api/training.ts`
- `frontend/src/app/api/checkpoints.ts`

현재 `학습 실행`은 아래 6단계다.

1. `기본 설정`
2. `카메라 ROI 설정`
3. `판단 기준 데이터 준비`
4. `초기 작업 데이터 준비`
5. `자동 학습 실행`
6. `결과 검토 및 배포`

### 단계별 개요

#### 1) 기본 설정

- 로봇 모델
- 제어장치
- 학습 기본값
- 장비 연결 점검

#### 2) 카메라 ROI 설정

- 좌/우/헤드 3채널 각각 별도 ROI 조정
- 큰 카메라 뷰를 우선 사용

#### 3) 판단 기준 데이터 준비

- 3채널 카메라 동시 표시
- 시연 녹화 시작/종료
- 성공/실패/작업 구간 아님 태깅
- 구간 비교 라벨링 drawer
- 판단 기준 모델 버전 표시

#### 4) 초기 작업 데이터 준비

- 3채널 카메라 + 3D 로봇 뷰
- `수집하기` / `기록 보기` 서브탭
- 좋은 시연 선택
- 시작 모델 준비

#### 5) 자동 학습 실행

- 3채널 카메라 + 3D 로봇 뷰
- 자동 실행 시작/중지
- 수동 개입 / 직접 조작 / 개입 내용 저장
- 현재 판단 기준, 성공 비율, 수동 개입 횟수, 운영 로그

#### 6) 결과 검토 및 배포

- 준비 상태 카드
- 저장된 모델 비교 테이블
- 최종 모델 선택
- replay 시점 선택 및 기록 요약 패널

## 8. 카메라 관련 컴포넌트

핵심 파일:

- `frontend/src/app/components/camera/CameraPanel.tsx`
- `frontend/src/app/components/camera/CameraView.tsx`
- `frontend/src/app/components/camera/RoiEditorCard.tsx`
- `frontend/src/app/api/cameras.ts`

포인트:

- `CameraPanel`은 `single` 또는 `triple` 레이아웃을 지원한다.
- 판단 기준 데이터 준비와 초기 작업 데이터 준비는 반드시 3채널 동시 노출이다.
- ROI 단계는 `RoiEditorCard` 3개를 동시에 배치한다.

## 9. 모델 비교 화면

핵심 파일:

- `frontend/src/app/pages/CheckpointsPage.tsx`
- `frontend/src/app/api/checkpoints.ts`

역할:

- 저장된 모델 목록 표시
- 성공 비율/평균 시간/누적 실행 수 비교
- 추천 모델 표시

학습 실행의 마지막 단계와 별도로, 저장된 모델 전용 화면도 존재한다.

## 10. 공통 라벨 수정 위치

용어를 수정할 때 우선 확인할 파일:

- `frontend/src/app/constants.ts`
- `frontend/src/app/types.ts`
- `frontend/src/app/pages/TrainingPage.tsx`
- `frontend/src/app/components/layout/TopBar.tsx`
- `README.md`

특히 단계명은 `constants.ts`의 `TRAINING_STAGE_LABELS`와 `TRAINING_STAGES`를 같이 수정해야 한다.

## 11. API fallback에 대한 이해

현재 프론트는 일부 API에서 `safeGet()`을 사용한다.

- API가 실패해도 fallback 데이터로 화면이 유지될 수 있다.
- 그래서 “화면이 떠 있다”와 “백엔드가 실제로 연결되어 있다”는 의미가 다를 수 있다.
- 이 차이를 보정하기 위해 연결 상태는 `connectionStore`로 분리했다.

수정 시 아래를 구분해야 한다.

- 화면용 fallback 데이터
- 실제 연결 상태

## 12. 문구/톤 가이드

반드시 지킬 것:

- 제품명은 `Robot Learning Tool`로 통일
- 사용자 문구는 제품/운영 톤 유지
- “이 화면은 ~입니다”, “분리했습니다”, “현재는 ~만 보여줍니다” 같은 구현 메모성 문구 지양
- 내부 개발 용어를 그대로 전면 노출하지 않기

권장 톤:

- 기능 목적 중심
- 짧고 단정한 설명
- 작업자가 바로 이해할 수 있는 운영 언어

## 13. 다음 수정 시 추천 진입점

### 학습 실행 UI를 손볼 때

1. `constants.ts`
2. `types.ts`
3. `TrainingPage.tsx`
4. 필요한 `api/*.ts`

### 상단 연결 상태를 손볼 때

1. `api/client.ts`
2. `store/connectionStore.ts`
3. `components/layout/TopBar.tsx`

### 로그인 규칙을 손볼 때

1. `store/authStore.ts`
2. `pages/LoginPage.tsx`

### 카메라 동작을 손볼 때

1. `components/camera/*`
2. `api/cameras.ts`
3. `store/deviceStore.ts`

## 14. 검증 기준

프론트 수정 후 기본 검증:

```bash
cd frontend
npm run build
```

현재 빌드는 통과한다.
다만 Vite 번들 크기 경고는 남아 있으며, 이는 기능 오류가 아니라 청크 크기 경고다.
