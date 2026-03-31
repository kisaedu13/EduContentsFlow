# EduContentsFlow Design System

> 이 문서는 디자인 리뉴얼 작업의 레퍼런스입니다.
> 기능과 로직은 변경하지 않고, 스타일(Tailwind 클래스)만 수정합니다.

---

## 1. Tailwind Config 토큰

아래 내용을 `tailwind.config.ts`의 `theme.extend`에 머지하세요.

```ts
{
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
      sidebar: '#A1A1AA',
      'sidebar-active': '#FAFAFA',
    },
    border: {
      default: '#E4E4E7',
      subtle: '#F4F4F5',
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
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  boxShadow: {
    card: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
    md: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    lg: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  },
}
```

## 2. globals.css 추가

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

body {
  font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #F7F7F8;
  -webkit-font-smoothing: antialiased;
}
```

## 3. Typography 스케일

| 용도 | 크기 | 굵기 | 비고 |
|------|------|------|------|
| 페이지 제목 | 22px | 700 | letter-spacing: -0.3px |
| 섹션 제목 | 18px | 600 | letter-spacing: -0.2px |
| 카드 제목 | 16px | 600 | |
| 본문 | 15px | 400 | |
| 캡션 | 14px | 400 | color: text-secondary |
| 라벨 (테이블 헤더 등) | 13px | 500 | color: text-secondary |
| 통계 숫자 | 28px | 700 | letter-spacing: -0.5px |

## 4. 컴포넌트별 스타일 규칙

### 사이드바
- 배경: `bg-sidebar` (#18181B) 다크 테마
- 네비 항목: `text-sidebar` (#A1A1AA), hover 시 `bg-sidebar-hover`, active 시 `bg-sidebar-active` + `text-sidebar-active` (흰색)
- 로고 영역: 아이콘(28x28, brand-primary 배경, rounded-sm) + 텍스트(14px/600 흰색) + 서브텍스트(12px 회색)
- 하단: "+ 새 프로젝트" 버튼(brand-primary 배경) + 유저 프로필
- 폰트 크기: 네비 항목 14px, 서브텍스트 12px

### 카드
- border 제거 → `shadow-card` 사용
- hover 시 `shadow-md`로 승격
- border-radius: `rounded-lg` (12px)
- 패딩: 16~18px
- transition: all 0.15s

### 프로젝트 카드
- 왼쪽에 3px 컬러 보더 (상태색: 준비중=노랑, 진행중=파랑, 완료=초록)
- 구성: 프로젝트명(16px/600) + 상태뱃지 / 설명(14px, text-secondary) / 프로그레스바 / 푸터(13px, text-tertiary)

### 상태 뱃지 (Status Badge)
- pill 형태: `rounded-full`, padding 3px 10px
- 내부에 6px 원형 dot + 텍스트
- 색상 매핑:
  - 준비중: bg `status-ready-bg`, text `#B45309`, dot `status-ready`
  - 진행중: bg `status-progress-bg`, text `#1D4ED8`, dot `status-progress`
  - 완료: bg `status-done-bg`, text `#047857`, dot `status-done`
  - 보류: bg `status-hold-bg`, text `#374151`, dot `status-hold`
  - 대기: bg `status-wait-bg`, text `#52525B`, dot `status-wait`

### 버튼
- Primary: `bg-brand-primary`, 흰 텍스트, hover 시 `bg-brand-primary-hover`
- Secondary: 흰 배경, `border-default` 테두리, hover 시 `bg-base`
- Ghost: 투명 배경, `text-secondary`, hover 시 `bg-base`
- 크기: 기본 padding 8px 16px / 13px, Small padding 6px 12px / 12px
- border-radius: `rounded-sm` (6px)
- transition: all 0.15s

### 테이블
- 외곽: `border-default` + `rounded-md`로 감싸기
- 헤더: `bg-base` 배경, 13px/500, `text-secondary`
- 행: hover 시 `#FAFAFE` 배경
- 하위 업무: padding-left 44px, `text-secondary`
- 진척도 컬럼: 80px 너비 프로그레스바 + 퍼센트 텍스트
- 날짜 없는 셀: `—` 표시, `text-tertiary`

### 프로그레스바
- 트랙: 높이 4px, `border-subtle` 배경, `rounded-full`
- 채움: `brand-primary` 배경 (완료 시 `status-done`)

### 폼 (Input / Textarea)
- padding 9px 12px, `border-default` 테두리, `rounded-sm`
- placeholder: `text-tertiary`
- focus: `border-brand-primary` + `ring-2 ring-brand-primary/10`
- 라벨: 14px/500, margin-bottom 6px
- 힌트: 13px, `text-tertiary`

### 통계 카드 (대시보드)
- 4열 그리드
- 각 카드: `shadow-card`, `rounded-md`, padding 16px
- 구성: 아이콘(32x32 rounded-sm, 상태색 light 배경) → 라벨(13px, text-secondary) → 숫자(28px/700)

### 탭 네비게이션
- border-bottom 1px, `border-default`
- 각 탭: 14px, `text-secondary`, active 시 `text-primary` + 하단 2px `brand-primary` 보더

### 브레드크럼
- 13px, `text-tertiary`
- 현재 페이지: `text-secondary`
- 구분자: ›

## 5. 전역 규칙

- 모든 인터랙티브 요소에 `transition: all 0.15s ease` 적용
- 배경색 기본: `bg-base` (#F7F7F8)
- 카드/서피스: `bg-surface` (#FFFFFF)
- 기존 border 스타일 → shadow-card로 대체 (테이블 외곽은 border 유지)
- 아바타: 24x24 원형, 이름 첫 글자, 배경색은 brand-primary 또는 brand-secondary
