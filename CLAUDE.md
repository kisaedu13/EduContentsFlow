# EduContentsFlow

교육 콘텐츠 제작 프로젝트 관리 웹앱. 대한산업안전협회 안전보건교육본부에서 사용.

## 기술 스택
- Next.js 15 (App Router) + TypeScript (strict)
- shadcn/ui + Tailwind CSS v4
- Supabase (Auth + PostgreSQL) + Prisma ORM
- Vercel 배포

## 컨벤션
- 한국어 전용 UI (i18n 불필요)
- 날짜 포맷: YYYY.MM.DD
- 폰트: Pretendard (self-hosted woff2)
- Server Components 기본, Client Components는 "use client" 명시
- Server Actions으로 mutation ("use server")
- Prisma만 데이터 접근 (Supabase Client는 Auth 전용)

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (풀러), `DIRECT_URL` (직접 연결)

## 도메인별 가이드
- `src/components/CLAUDE.md` — 프론트엔드 컴포넌트 패턴
- `src/actions/CLAUDE.md` — 백엔드 Server Actions 패턴
- `src/app/CLAUDE.md` — 라우팅/페이지 구조
- `prisma/CLAUDE.md` — 데이터베이스 스키마 규칙

## 주요 명령어
- `npm run dev` — 개발 서버
- `npx prisma migrate dev` — DB 마이그레이션
- `npx prisma generate` — Prisma Client 생성
- `npx prisma db seed` — 시드 데이터

@AGENTS.md
