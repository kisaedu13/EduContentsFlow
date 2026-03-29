# 프론트엔드 컴포넌트 가이드

## 컴포넌트 구분
- **Server Component** (기본): 데이터 페칭, 정적 렌더링. `async` 함수로 Prisma 직접 호출 가능.
- **Client Component**: 상호작용 필요 시만. 파일 상단에 `"use client"` 필수.

## shadcn/ui 사용
- `src/components/ui/` 디렉토리에 자동 생성됨
- 새 컴포넌트 추가: `npx shadcn@latest add [component-name]`
- 커스터마이징 시 ui/ 파일 직접 수정 가능 (소유 코드)

## 상태 관리
- 서버 상태: Server Components에서 직접 fetch
- 클라이언트 상태: React useState/useReducer
- 낙관적 업데이트: `useOptimistic` + Server Actions
- 폼 상태: `useFormStatus`, `useActionState`

## 스타일링
- Tailwind v4 유틸리티 클래스 사용
- `cn()` 함수로 조건부 클래스 결합 (`src/lib/utils.ts`)
- 다크모드: `dark:` 접두사

## 파일 구조
- `ui/` — shadcn/ui 기본 컴포넌트
- `layout/` — 사이드바, 헤더, 네비게이션
- `progress/` — 진행 보드 관련 (핵심)
- `timeline/` — 주간 타임라인
- `projects/` — 프로젝트 카드, 목록, 폼
- `templates/` — 워크플로우 에디터
- `team/` — 팀원 관리
- `dashboard/` — 대시보드 위젯
