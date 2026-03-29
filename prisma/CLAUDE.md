# 데이터베이스 스키마 가이드

## 핵심 설계 원칙
- 프로젝트 생성 시 워크플로우 템플릿의 트랙/단계를 **복사(snapshot)**
- 템플릿 수정이 기존 프로젝트에 영향을 주지 않음
- `PartProgress`가 핵심: `파트 × 트랙 → 현재 단계 + 상태`

## 테이블 관계
```
WorkflowTemplate → WorkflowTrack → WorkflowPhase  (템플릿, 재사용)
Project → ProjectTrack → ProjectPhase              (프로젝트별 복사본)
Project → ProjectPart → PartProgress               (진행 추적)
Project → ProjectPart → PartAssignment              (담당자 배정)
Project → WeeklySchedule                           (주간 일정)
Profile → PartAssignment                           (사용자)
```

## 마이그레이션
- `npx prisma migrate dev --name [설명]` — 개발 마이그레이션
- `npx prisma migrate deploy` — 프로덕션 마이그레이션
- `npx prisma generate` — Prisma Client 재생성

## 시드 데이터
- `prisma/seed.ts`에 기본 템플릿 포함
- PT 트랙: 초안 작성 → 검토 → 수정본 제출
- 영상 트랙: 제작중 → 제작본 제출 → 수정중 → 수정본 제출

## 주의사항
- `@@map()` 으로 snake_case 테이블명 사용
- Supabase profiles 테이블은 auth.users 트리거로 자동 생성
- `directUrl`은 마이그레이션 전용, `url`은 앱 쿼리용 (커넥션 풀러)
