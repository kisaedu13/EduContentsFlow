# 백엔드 Server Actions 가이드

## Server Actions 패턴
- 파일 상단에 `"use server"` 선언
- 항목별 파일 분리: `projects.ts`, `templates.ts`, `progress.ts` 등
- Zod로 입력 유효성 검증 후 Prisma 쿼리 실행
- `revalidatePath()`로 관련 페이지 캐시 무효화

## Prisma 사용 규칙
- `src/lib/prisma.ts`의 싱글톤 인스턴스 사용
- `select`/`include`를 명시하여 필요한 데이터만 조회 (Vercel 10초 타임아웃 대비)
- 복잡한 작업은 `prisma.$transaction()` 사용

## Admin 권한 체크
- Server Action 시작 시 현재 사용자 프로필을 조회하여 role 확인
- Admin 전용 액션은 `if (profile.role !== 'ADMIN') throw new Error('Unauthorized')`

## 에러 핸들링
- `try/catch`로 감싸고, 에러 시 `{ error: string }` 반환
- 성공 시 `{ success: true, data: ... }` 반환
- `revalidatePath()` 는 성공 시에만 호출

## 핵심 액션
- `projects.ts` — 가장 복잡: `createProjectFromTemplate` (템플릿 스냅샷 복사 + PartProgress 초기화)
- `progress.ts` — `updateProgress` (상태/단계 변경)
- `team.ts` — `createUser` (Supabase admin.createUser)
