# 데이터베이스 스키마 가이드

## 핵심 모델
- **Task** (★ 핵심): 계층형 업무. parentId 자기참조로 하위업무 지원. depth 비정규화.
- **TemplateTask**: 템플릿용 업무 구조 (Task와 동일 패턴)
- **Announcement**: 프로젝트별 공지사항
- **Profile**: Supabase auth.users 트리거로 자동 생성

## 테이블 관계
```
WorkflowTemplate → TemplateTask (계층형, 템플릿 업무 구조)
Project → Task (계층형, 실제 업무)
Project → Announcement (공지사항)
Task → Profile (담당자)
```

## 레거시 모델 (사용 중단)
- ProjectPart, PartProgress, ProjectTrack, ProjectPhase, PartAssignment
- WorkflowTrack, WorkflowPhase
- 스키마에 남아있지만 앱에서 더 이상 사용하지 않음

## 마이그레이션
- `npx prisma migrate dev --name [설명]` — 개발 마이그레이션
- `npx prisma migrate deploy` — 프로덕션 마이그레이션
- `npx prisma generate` — Prisma Client 재생성

## 주의사항
- `@@map()` 으로 snake_case 테이블명 사용
- Supabase profiles 테이블은 auth.users 트리거로 자동 생성
- `directUrl`은 마이그레이션 전용, `url`은 앱 쿼리용 (커넥션 풀러)
