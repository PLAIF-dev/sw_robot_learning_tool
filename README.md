# Robot Learning Tool Prototype

양팔 로봇 학습 세션 운영 툴의 웹 기반 프로토타입입니다.

> **현재 범위**: 실제 장비/학습 알고리즘 연동 없이 Mock 데이터 기반으로 동작하는 UX/워크플로우 검증용 프로토타입입니다. 팀 리뷰 및 시연 목적으로 제작되었습니다.

---

## 메뉴 구조

```
├── 대시보드         - 세션 요약, 장치 상태, 빠른 시작
├── 세션             - 세션 목록, 신규/추가 학습 세션 생성
├── 학습 실행        - 단계형 워크플로우
│   ├── 기본 환경 설정
│   ├── Classifier 학습
│   ├── 데모 수집
│   ├── 본 학습
│   └── 평가 / 완료 상태
├── 기록 검토        - 수동 조작 / 데모 / 에피소드 / 개입 기록
├── 모델/체크포인트  - 체크포인트 목록 및 관리
└── 시스템           - 연결 상태, 설정, 로그
```

우측 상시 패널: 로봇/카메라/그리퍼 상태 + TCP 수동 조작

---

## 빠른 시작

```bash
git clone <this-repo>
cd robot-learning-tool

# 환경 변수 설정 (선택 - 기본값으로 실행 가능)
cp .env.example .env

# 전체 실행
docker compose up --build
```

### 접속 주소

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |

### 로그인

- 기본 비밀번호: `1111`

---

## 로컬 개발 (Docker 없이)

### 백엔드

```bash
cd backend
dotnet run --project RobotLearningTool.Api
# http://localhost:8080
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## 키보드 조작 (학습 실행 화면)

| 키 | 동작 (왼팔) |
|----|------------|
| W / S | 앞 / 뒤 |
| A / D | 좌 / 우 |
| Q / E | 위 / 아래 |

| 키 | 동작 (오른팔) |
|----|--------------|
| ↑ / ↓ | 앞 / 뒤 |
| ← / → | 좌 / 우 |
| PgUp / PgDn | 위 / 아래 |

---

## 주요 화면

> 스크린샷 자리 - 구현 후 추가 예정

| 화면 | 설명 |
|------|------|
| 로그인 | 비밀번호 입력 |
| 대시보드 | 전체 현황 요약 |
| 세션 | 학습 세션 관리 |
| 학습 실행 | 단계별 학습 워크플로우 |
| 기록 검토 | 수동/데모/에피소드 기록 재생 |
| 체크포인트 | 모델 저장 및 관리 |

---

## 디렉터리 구조

```
robot-learning-tool/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/            # ASP.NET Core 10 / .NET 10
│   ├── RobotLearningTool.Api/
│   ├── RobotLearningTool.Application/
│   ├── RobotLearningTool.Domain/
│   ├── RobotLearningTool.Infrastructure/
│   ├── Dockerfile
│   └── RobotLearningTool.sln
├── docker/             # 추가 docker 설정
├── docs/               # 문서
│   ├── product-overview.md
│   ├── menu-structure.md
│   ├── api-spec.md
│   └── demo-scenario.md
├── samples/            # 샘플 데이터
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 향후 확장 포인트

| 항목 | 현재 | 확장 방향 |
|------|------|----------|
| 장치 제어 | Mock | 실제 로봇 SDK 연동 |
| IK 솔버 | Mock (단순 계산) | 실제 IK 라이브러리 |
| 학습 알고리즘 | Mock 상태 | 실제 RL/IL 학습기 |
| 카메라 | Mock 프레임 | 실제 카메라 스트림 |
| 인증 | 단순 비밀번호 | JWT / OAuth |
| 데이터 저장 | 인메모리 | DB 연동 |
| 3D 뷰어 | 기하학 Mock | URDF/STL 로더 |
