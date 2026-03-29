# 라우팅/페이지 구조 가이드

## Route Groups
- `(auth)` — 인증 관련 (로그인). 사이드바 없는 센터 레이아웃.
- `(dashboard)` — 인증 후 메인. 사이드바 + 헤더 레이아웃.

## Admin 전용 페이지
- `/projects/new`, `/projects/[id]/edit` — 프로젝트 생성/수정
- `/templates`, `/templates/new`, `/templates/[id]` — 워크플로우 템플릿
- `/team` — 팀원 관리
- 페이지 컴포넌트에서 profile.role 확인 후 redirect

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
