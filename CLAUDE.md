# EduContentsFlow

교육 콘텐츠 제작 프로젝트 관리 웹앱. 대한산업안전협회 안전보건교육본부에서 사용.

## 기술 스택
- Next.js 16 (App Router) + TypeScript (strict)
- shadcn/ui (base-ui 기반) + Tailwind CSS v4
- Supabase (Auth + PostgreSQL) + Prisma ORM
- Vercel 배포

## 컨벤션
- 한국어 전용 UI (i18n 불필요)
- 날짜 포맷: YYYY.MM.DD
- 폰트: Pretendard (self-hosted woff2)
- Server Components 기본, Client Components는 "use client" 명시
- Server Actions으로 mutation ("use server")
- Prisma만 데이터 접근 (Supabase Client는 Auth 전용)

## 핵심 데이터 모델
- **Task** (계층형 업무): projectId, parentId(자기참조), name, status(WAITING/IN_PROGRESS/FEEDBACK/COMPLETE), assigneeId, startDate, endDate, progress(0~100), depth, sortOrder
- **TemplateTask**: 템플릿용 업무 구조 (Task와 동일한 계층 구조)
- **Announcement**: 프로젝트별 공지사항 (알림방)
- **Profile**: Supabase Auth 연동 사용자 (ADMIN/MEMBER)
- **Project**: 프로젝트 (PREPARING/IN_PROGRESS/COMPLETED/ON_HOLD)

## 프로젝트 생성 흐름
1. 템플릿 선택 (선택사항) → TemplateTask 계층구조를 Task로 복사
2. 빈 프로젝트도 생성 가능 → 사용자가 수동으로 업무 추가

## 로그인
- 아이디만 입력 (도메인 @educontents.kr 내부 처리)
- admin / admin1234

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (풀러), `DIRECT_URL` (직접 연결)

## 배포
- **Vercel**: https://edu-contents-flow.vercel.app
- **GitHub**: https://github.com/kisaedu13/EduContentsFlow
- GitHub push 시 Vercel 자동 배포
- Vercel 함수 리전: `hnd1` (도쿄) — vercel.json

## 성능 최적화 패턴
- **인증**: 미들웨어는 `getSession()` (JWT 쿠키, 네트워크 호출 없음), 서버 액션은 `getVerifiedProfile()` (`getUser()` 서버 검증)
- **페이지 렌더링**: `getCurrentProfile()`은 `getSession()` + `unstable_cache` 프로필 캐싱 (60초)
- **레이아웃**: Suspense로 사이드바 감싸서 페이지 렌더링 비블로킹
- **loading.tsx**: 주요 라우트에 스켈레톤 UI (dashboard, projects, projects/[id], templates)
- **쿼리 병렬화**: `Promise.all`로 독립 쿼리 동시 실행 (dashboard, project detail)
- **데이터 캐싱**: `unstable_cache`로 대시보드/프로젝트 목록 10초 캐싱
- **프리페치**: 사이드바/프로젝트 카드 Link에 `prefetch={false}` (불필요한 RSC 요청 차단)
- **Optimistic UI**: `useOptimistic`(announcement-board), `useState` 낙관적 업데이트 (task-table, project-status-selector)
- **router.refresh() 금지**: 서버 액션의 `revalidatePath()`가 캐시 갱신 처리

## 도메인별 가이드
- `src/components/CLAUDE.md` — 프론트엔드 컴포넌트 패턴
- `src/actions/CLAUDE.md` — 백엔드 Server Actions 패턴
- `src/app/CLAUDE.md` — 라우팅/페이지 구조
- `prisma/CLAUDE.md` — 데이터베이스 스키마 규칙

## 주요 명령어
- `npm run dev` — 개발 서버
- `npx prisma migrate dev` — DB 마이그레이션
- `npx prisma generate` — Prisma Client 생성

@AGENTS.md
