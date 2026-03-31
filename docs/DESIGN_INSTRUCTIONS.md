# EduContentsFlow 디자인 리뉴얼 작업 지시서

> **중요**: 기능과 로직은 절대 변경하지 않는다. CSS/Tailwind 클래스만 수정한다.
> 시각적 레퍼런스: `docs/design-mockup-v2.html`을 브라우저로 열어서 목업을 확인하라.

---

## STEP 1: 기본 설정

### 1-1. Pretendard 폰트 추가
`globals.css` (또는 layout.tsx)에 추가:
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

### 1-2. tailwind.config.ts
`theme.extend`에 아래 토큰을 머지 (기존 값은 유지, 충돌 시 아래 값 우선):
```ts
fontFamily: {
  sans: ['Pretendard Variable', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
},
colors: {
  bg: {
    base: '#F7F7F8',
    surface: '#FFFFFF',
    sidebar: '#18181B',
    'sidebar-hover': '#27272A',
    'sidebar-active': '#3F3F46',
  },
  brand: {
    primary: '#4F46E5',
    'primary-hover': '#4338CA',
    'primary-light': '#EEF2FF',
  },
  text: {
    primary: '#18181B',
    secondary: '#71717A',
    tertiary: '#A1A1AA',
    inverse: '#FAFAFA',
  },
  status: {
    ready: '#F59E0B',
    'ready-bg': '#FFFBEB',
    progress: '#3B82F6',
    'progress-bg': '#EFF6FF',
    done: '#10B981',
    'done-bg': '#ECFDF5',
    hold: '#6B7280',
    'hold-bg': '#F3F4F6',
    wait: '#A1A1AA',
    'wait-bg': '#F4F4F5',
  },
},
boxShadow: {
  card: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
  'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
},
```

### 1-3. 전역 body 스타일
```css
body {
  background: #F7F7F8;
  -webkit-font-smoothing: antialiased;
}
```

---

## STEP 2: 사이드바

### 변경 내용
- 배경색: `bg-[#18181B]` (다크)
- 네비 항목 기본: `text-[#A1A1AA]`, 14px
- 네비 항목 hover: `bg-[#27272A] text-[#D4D4D8]`
- 네비 항목 active: `bg-[#27272A] text-white font-medium`
- 아이콘: 18x18, stroke 스타일, `opacity-60` → active 시 `opacity-100`
- 로고: 아이콘 30x30 `bg-brand-primary rounded-lg` + 텍스트 14px/600 흰색 + 서브 11px 회색
- "+ 새 프로젝트" 버튼: `bg-brand-primary text-white rounded-lg` 전체 너비, 14px
- 하단 유저: 아바타 30x30 원형 `bg-[#3F3F46]`, 이름 13px 흰색, 역할 11px 회색
- 사이드바 하단 구분선: `border-t border-[#27272A]`
- 모든 요소에 `transition-all duration-150`

---

## STEP 3: 대시보드

### 통계 카드
- 4열 그리드, gap 12px
- 각 카드: `bg-white rounded-[10px] p-[18px] shadow-card hover:shadow-card-hover transition-shadow`
- **border 없음** (기존 border 제거)
- 아이콘: 34x34 `rounded-lg` + 연한 배경색 (예: 전체=brand-primary-light, 진행중=status-progress-bg)
- 라벨: 13px `text-[#71717A] font-medium`
- 숫자: 28px `font-bold tracking-tight`
- 진행중 숫자: `text-[#3B82F6]`, 완료 숫자: `text-[#10B981]`

### 프로젝트 카드
- **border 없음** → `shadow-card` 사용
- `rounded-[10px] p-[18px]`
- 왼쪽 `border-l-[3px]` — 상태에 따라 색상:
  - 준비중: `border-l-[#F59E0B]`
  - 진행중: `border-l-[#3B82F6]`
  - 완료: `border-l-[#10B981]`
  - 보류: `border-l-[#6B7280]`
- hover: `shadow-card-hover translate-y-[-1px]`
- 프로젝트명: 15px `font-semibold`
- 설명: 13px `text-[#71717A]`
- 프로그레스바: 높이 4px, 트랙 `bg-[#F4F4F5]`, 채움 `bg-brand-primary` (완료 시 `bg-status-done`)
- 푸터: 12px `text-[#A1A1AA]`

---

## STEP 4: 상태 뱃지 (Status Badge)

기존 상태 뱃지 컴포넌트를 아래 스타일로 교체:
- pill 형태: `inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full text-[12px] font-medium`
- 내부에 6px 원형 dot: `w-[6px] h-[6px] rounded-full`
- 색상:
  - 준비중: `bg-[#FFFBEB] text-[#B45309]`, dot `bg-[#F59E0B]`
  - 진행중: `bg-[#EFF6FF] text-[#1D4ED8]`, dot `bg-[#3B82F6]`
  - 완료: `bg-[#ECFDF5] text-[#047857]`, dot `bg-[#10B981]`
  - 보류: `bg-[#F3F4F6] text-[#374151]`, dot `bg-[#6B7280]`
  - 대기: `bg-[#F4F4F5] text-[#52525B]`, dot `bg-[#A1A1AA]`

---

## STEP 5: 업무 테이블 (프로젝트 상세) ⭐ 핵심

### 테이블 외곽
- `border border-[#E4E4E7] rounded-[10px] overflow-hidden bg-white`

### 테이블 헤더
- `bg-[#FAFAFA]`
- th: `text-left p-[10px_16px] text-[13px] font-medium text-[#71717A]`

### 테이블 행
- td: `p-[12px_16px] border-b border-[#F4F4F5]`
- 마지막 행 border-bottom 제거
- hover: `bg-[#FAFAFE]`

### 업무명 셀 — 상위 업무
- `flex items-center gap-2 font-medium`
- chevron 아이콘 (18x18, stroke): 접혀있으면 `>` 방향, 펼쳐져있으면 90도 회전
- 하위 업무가 없는 상위 업무는 chevron 자리에 동일한 width의 빈 공간 (정렬 유지)

### 업무명 셀 — 하위 업무
- `pl-[42px] text-[#71717A] font-normal`

### ⭐ 액션 아이콘 (편집/삭제) — 반드시 hover 시에만 표시
```
기본 상태: opacity-0 (보이지 않음)
행 hover 시: opacity-100 (나타남)
```
- 액션 버튼 컨테이너: `flex gap-1 ml-2 opacity-0 transition-opacity duration-150`
- 부모 tr hover 시: `group-hover:opacity-100` (Tailwind의 group 기능 활용)
- 각 버튼: `w-6 h-6 rounded flex items-center justify-center text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#18181B]`
- 아이콘 크기: 14px

### ⭐ 하위 업무 추가 버튼 — 작고 미묘하게
기존의 "＋ 하위 업무 추가..." 행을 아래 스타일로 변경:
- 별도 행이 아닌, 상위 업무의 마지막 하위 업무 아래에 위치
- `pl-[42px] py-[6px]`
- 버튼 스타일: `inline-flex items-center gap-1 px-2 py-1 rounded text-[12px] text-[#A1A1AA] hover:bg-[#F4F4F5] hover:text-[#71717A] transition-all`
- + 아이콘: 12px
- 텍스트: "하위 업무 추가"
- **기존처럼 독립적인 큰 행이 아닌, 작은 텍스트 링크 느낌**

### 진척도 컬럼
- `flex items-center gap-2 justify-end`
- 프로그레스바: 60px 너비, 3px 높이, `bg-[#F4F4F5] rounded-full`
- 채움: `bg-brand-primary rounded-full` (완료 업무는 `bg-status-done`)
- 퍼센트 텍스트: 12px `text-[#A1A1AA]` 고정폭 28px 우측정렬

### 빈 셀 (날짜 미설정 등)
- `text-[#D4D4D8]` 에 "—" 표시

---

## STEP 6: 버튼

### Primary
- `bg-[#4F46E5] text-white rounded-lg px-4 py-2 text-[14px] font-medium hover:bg-[#4338CA] transition-all`
- small: `px-[14px] py-[6px] text-[13px] rounded-md`

### Secondary
- `bg-white text-[#18181B] border border-[#E4E4E7] rounded-lg px-4 py-2 text-[14px] font-medium hover:bg-[#F4F4F5] transition-all`

### Ghost
- `bg-transparent text-[#71717A] rounded-lg px-4 py-2 text-[14px] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-all`

---

## STEP 7: 폼 (템플릿 생성 등)

### 폼 컨테이너
- `bg-white rounded-xl p-7 shadow-card max-w-[560px]`

### Input
- `w-full px-[14px] py-[10px] border border-[#E4E4E7] rounded-lg text-[14px] outline-none transition-all`
- placeholder: `text-[#A1A1AA]`
- focus: `border-[#4F46E5] ring-[3px] ring-[#4F46E5]/10`

### Label
- `text-[14px] font-medium mb-[6px]`
- 선택 표시: `text-[#A1A1AA] font-normal`

### Textarea
- input과 동일 + `resize-y min-h-[88px]`

---

## STEP 8: 탭 네비게이션

- 컨테이너: `flex border-b border-[#E4E4E7]`
- 각 탭: `flex items-center gap-[6px] px-[18px] py-[11px] text-[14px] text-[#71717A] border-b-2 border-transparent transition-all`
- hover: `text-[#18181B]`
- active: `text-[#18181B] border-b-[#4F46E5] font-medium`
- 아이콘: 16px stroke

---

## STEP 9: 간트 차트 (일정 탭)

### 네비게이션 바
- `flex items-center gap-3`
- 화살표 버튼: `w-8 h-8 rounded-md border border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]`
- 오늘 버튼: `px-[14px] py-[6px] rounded-md border border-[#E4E4E7] bg-white text-[13px] font-medium`
- 날짜 범위: `text-[14px] text-[#71717A]`

### 간트 바
- 색상: `bg-[#4F46E5]` opacity 85%
- 높이: 20px, `rounded`
- 오늘 표시선: `bg-[#4F46E5]` 2px 너비, opacity 30%

---

## 전역 규칙 요약

1. 모든 카드/컨테이너: border 제거 → `shadow-card` 사용 (테이블 외곽만 border 유지)
2. 모든 인터랙티브 요소: `transition-all duration-150`
3. 페이지 배경: `bg-[#F7F7F8]`
4. 카드/폼/테이블 배경: `bg-white`
5. 페이지 제목: 22px/700, 설명: 14px `text-[#71717A]`
6. 브레드크럼: 13px `text-[#A1A1AA]`, 현재: `text-[#71717A]`
