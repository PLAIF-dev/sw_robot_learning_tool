# Frontend

Robot Learning Tool Prototype의 React + TypeScript + Vite 프론트엔드입니다.

## 개발 실행

```bash
npm install
npm run dev
```

기본 개발 포트는 `5173`이며, API는 `VITE_API_BASE_URL` 또는 `/api` 프록시를 통해 백엔드와 통신합니다.

## 프로덕션 빌드

```bash
npm run build
```

## 주요 구성

- `src/app/pages`: 로그인, 대시보드, 세션, 학습 실행, 기록 검토, 체크포인트, 시스템 화면
- `src/app/components`: 공통 레이아웃, 우측 상시 패널, TCP 조작, 카메라 뷰, 3D 로봇 뷰어
- `src/app/store`: 인증, 세션, 장치, TCP 제어 전역 상태
- `src/app/api`: REST API 호출 및 mock fallback
