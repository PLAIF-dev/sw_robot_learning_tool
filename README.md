# Robot Learning Tool

Robot Learning Tool는 듀얼암 로봇 작업 학습을 운영하기 위한 통합 제품입니다.
작업 생성, 장비 설정, 카메라 작업 영역 설정, 판단 기준 데이터 준비, 초기 시연 선별, 자동 학습 운영,
결과 비교와 모델 선택까지 한 제품 안에서 이어서 수행할 수 있습니다.

## 제품 구성

- `대시보드`: 현재 작업, 장비 연결 상태, 최근 실행 현황을 확인합니다.
- `작업`: 신규 작업과 추가 작업을 생성하고 관리합니다.
- `학습 실행`: 기본 설정부터 결과 검토 및 배포까지 단계별 흐름을 진행합니다.
- `기록 검토`: 시연, 실행 기록, 개입 기록을 다시 확인합니다.
- `저장된 모델`: 저장된 모델 목록과 주요 성능 지표를 비교합니다.
- `시스템`: 백엔드 연결 상태와 시스템 정보를 확인합니다.

## 학습 실행 단계

1. `기본 설정`
로봇 모델, 제어장치, 실행 기본값을 설정합니다.

2. `카메라 ROI 설정`
왼쪽, 오른쪽, 헤드 카메라의 작업 영역을 설정합니다.

3. `판단 기준 데이터 준비`
성공, 실패, 비교 라벨을 수집해 작업 품질 판단 기준을 준비합니다.

4. `초기 작업 데이터 준비`
초기 시연을 수집하고, 사용할 시연을 선별해 시작 모델을 준비합니다.

5. `자동 학습 실행`
자동 실행 현황, 현재 판단 기준, 수동 개입 이력을 확인하며 학습을 운영합니다.

6. `결과 검토 및 배포`
저장된 모델을 비교하고 운영에 적용할 최종 모델을 선택합니다.

## 빠른 시작

```bash
git clone <this-repo>
cd robot-learning-tool
cp .env.example .env
docker compose up --build
```

### 접속 주소

| 서비스 | 주소 |
| --- | --- |
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |

### 로그인

- 기본 비밀번호: `1111`

## 로컬 실행

### 백엔드

```bash
cd backend
dotnet run --project RobotLearningTool.Api
```

백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

## 주요 화면

- `로그인`: 운영 화면 접속
- `대시보드`: 전체 작업과 장비 상태 요약
- `작업`: 학습 작업 생성 및 전환
- `학습 실행`: 단계별 작업 수행
- `기록 검토`: 시연 및 실행 기록 재확인
- `저장된 모델`: 모델 비교 및 기준 모델 확인
- `시스템`: 시스템 정보 및 연결 상태 확인

## 디렉터리 구조

```text
robot-learning-tool/
├─ frontend/                  # React + TypeScript + Vite
│  ├─ src/
│  ├─ Dockerfile
│  └─ package.json
├─ backend/                   # ASP.NET Core 백엔드
│  ├─ RobotLearningTool.Api/
│  ├─ RobotLearningTool.Application/
│  ├─ RobotLearningTool.Domain/
│  ├─ RobotLearningTool.Infrastructure/
│  ├─ Dockerfile
│  └─ RobotLearningTool.sln
├─ docker/
├─ docs/
├─ samples/
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## 팀 공유 포인트

- 제품 명칭은 `Robot Learning Tool`로 통일합니다.
- 화면 문구는 내부 구현 용어보다 운영자가 이해하는 작업 용어를 우선합니다.
- `학습 실행` 메뉴는 장비 설정, 데이터 준비, 자동 학습 운영, 결과 비교까지 실제 운영 흐름에 맞춰 설계되어 있습니다.
