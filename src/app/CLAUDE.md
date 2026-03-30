# 라우팅/페이지 구조 가이드

## Route Groups
- `(auth)` — 인증 관련 (로그인). 사이드바 없는 센터 레이아웃.
- `(dashboard)` — 인증 후 메인. 사이드바 + 헤더 레이아웃.

## Admin 전용 페이지
- `/projects/new`, `/projects/[id]/edit` — 프로젝트 생성/수정
- `/templates`, `/templates/new`, `/templates/[id]` — 업무 템플릿 관리
- `/team` — 팀원 관리
- 페이지 컴포넌트에서 profile.role 확인 후 redirect

## 프로젝트 상세 탭 구조
- `/projects/[id]` → ProjectTabs (Client Component)
  - 업무 탭: TaskTable (계층형 업무 테이블, 인라인 편집)
  - 일정 탭: TaskGanttChart (일별 간트차트)
  - 알림방 탭: AnnouncementBoard (공지사항)

## 페이지 구조 패턴
```tsx
// Server Component 페이지
export default async function Page() {
  const profile = await getCurrentProfile();
  if (profile.role !== 'ADMIN') redirect('/dashboard');

  const data = await prisma.someModel.findMany();
  return <ClientComponent data={data} />;
}
```

## 데이터 페칭
- 페이지에서 직접 Prisma 쿼리 (Server Component)
- Client Component는 props로 데이터 전달받음
- mutation은 Server Actions 사용
- 낙관적 업데이트: useTransition + 로컬 상태 업데이트
