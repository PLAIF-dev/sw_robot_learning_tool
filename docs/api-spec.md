# API 명세 — Robot Learning Tool

> Swagger UI: http://localhost:8080/swagger

## 인증

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/login | 로그인 (비밀번호) |
| GET | /api/auth/status | 인증 상태 확인 |
| POST | /api/auth/logout | 로그아웃 |

## 대시보드

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/dashboard/summary | 대시보드 요약 |

## 세션

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/sessions | 세션 목록 |
| POST | /api/sessions | 세션 생성 |
| GET | /api/sessions/{id} | 세션 상세 |
| PUT | /api/sessions/{id} | 세션 수정 |
| POST | /api/sessions/{id}/duplicate | 세션 복제 |
| GET | /api/sessions/{id}/state | 세션 상태 |

## 학습 실행

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/training/current-stage | 현재 단계 조회 |
| PUT | /api/training/current-stage | 단계 변경 |
| GET | /api/training/environment | 환경 설정 조회 |
| PUT | /api/training/environment | 환경 설정 저장 |
| GET | /api/training/classifier | Classifier 상태 |
| POST | /api/training/classifier/collect | 샘플 수집 |
| POST | /api/training/classifier/reset | 초기화 |
| GET | /api/training/demo | 데모 상태 |
| POST | /api/training/demo/start | 데모 시작 |
| POST | /api/training/demo/mark-success | 성공 입력 |
| POST | /api/training/demo/end | 데모 종료 |
| DELETE | /api/training/demo/{id} | 데모 삭제 |
| GET | /api/training/main | 본 학습 상태 |
| POST | /api/training/main/start | 학습 시작 |
| POST | /api/training/main/stop | 학습 중지 |
| POST | /api/training/main/mark-result | 결과 입력 |
| DELETE | /api/training/main/episodes/{id} | 에피소드 삭제 |
| GET | /api/training/evaluation | 평가 요약 |

## 장치 / 시스템

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/devices/status | 전체 장치 상태 |
| GET | /api/devices/robots | 로봇 상태 |
| GET | /api/devices/controllers | 제어 장치 상태 |
| GET | /api/devices/cameras | 카메라 상태 |
| GET | /api/devices/grippers | 그리퍼 상태 |
| PUT | /api/devices/cameras/settings | 카메라 설정 |
| PUT | /api/devices/robots/hand-guide | 핸드가이드 모드 |
| GET | /api/system/info | 시스템 정보 |
| GET | /api/system/logs/recent | 최근 로그 |

## 카메라

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/cameras/channels | 채널 목록 |
| GET | /api/cameras/{channel}/frame | 현재 프레임 |
| GET | /api/cameras/{channel}/frames | 프레임 목록 |
| GET | /api/cameras/{channel}/settings | 설정 조회 |
| PUT | /api/cameras/{channel}/settings | 설정 변경 |

채널: `left` / `right` / `head`

## TCP / IK / 수동 조작

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/control/tcp-state | TCP 상태 조회 |
| POST | /api/control/tcp-select | 제어 대상 선택 |
| POST | /api/control/tcp-move | TCP 이동 |
| POST | /api/control/tcp-rotate | TCP 회전 |
| POST | /api/control/tcp-reset | TCP 초기화 |
| GET | /api/control/joint-state | 관절 상태 조회 |
| POST | /api/control/ik/solve | IK 풀기 |

### IkSolveRequest

```json
{
  "target": "left | right | both",
  "coordinateFrame": "world | local",
  "deltaX": 0.01,
  "deltaY": 0.0,
  "deltaZ": 0.0,
  "deltaRoll": 0.0,
  "deltaPitch": 0.0,
  "deltaYaw": 0.0
}
```

### IkSolveResponse

```json
{
  "success": true,
  "targetTcpPose": { "x": 0.3, "y": 0.1, "z": 0.5, "roll": 0.0, "pitch": 0.0, "yaw": 0.0 },
  "solvedJointState": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
  "ikSuccess": true,
  "errorReason": null
}
```

## 모션 기록

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/records/motion/start | 기록 시작 |
| POST | /api/records/motion/stop | 기록 종료 |
| GET | /api/records/motion | 기록 목록 |
| GET | /api/records/motion/{id} | 기록 상세 |
| DELETE | /api/records/motion/{id} | 기록 삭제 |
| GET | /api/records/motion/{id}/playback | 재생 데이터 |

## 기록 검토

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/records/demos | 데모 목록 |
| GET | /api/records/demos/{id} | 데모 상세 |
| GET | /api/records/demos/{id}/playback | 데모 재생 |
| DELETE | /api/records/demos/{id} | 데모 삭제 |
| GET | /api/records/episodes | 에피소드 목록 |
| GET | /api/records/episodes/{id} | 에피소드 상세 |
| GET | /api/records/episodes/{id}/playback | 에피소드 재생 |
| PATCH | /api/records/episodes/{id} | 에피소드 수정 |
| DELETE | /api/records/episodes/{id} | 에피소드 삭제 |
| GET | /api/records/interventions | 개입 기록 목록 |
| GET | /api/records/interventions/{id} | 개입 기록 상세 |
| GET | /api/records/interventions/{id}/playback | 개입 기록 재생 |

## 체크포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/checkpoints | 체크포인트 목록 |
| POST | /api/checkpoints | 체크포인트 저장 |
| GET | /api/checkpoints/{id} | 체크포인트 상세 |
| DELETE | /api/checkpoints/{id} | 체크포인트 삭제 |

## 표준 에러 응답

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "세션을 찾을 수 없습니다."
  }
}
```

### 에러 코드

| 코드 | 설명 |
|------|------|
| UNAUTHORIZED | 인증 실패 |
| SESSION_NOT_FOUND | 세션 없음 |
| INVALID_STAGE | 잘못된 학습 단계 |
| DEVICE_NOT_AVAILABLE | 장치 사용 불가 |
| IK_FAILED | IK 풀기 실패 |
| RECORD_NOT_FOUND | 기록 없음 |
| CHECKPOINT_NOT_AVAILABLE | 체크포인트 없음 |
