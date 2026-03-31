# EduContentsFlow 디자인 리뉴얼 지침서

> **중요**: `docs/mockup-pages.html`을 브라우저에서 열어 시각적 레퍼런스로 확인하세요.
> 해당 HTML의 스타일을 **정확히 동일하게** 구현하는 것이 목표입니다.
> 기능과 로직은 절대 변경하지 마세요. Tailwind 클래스와 CSS만 수정합니다.

---

## STEP 1: 사전 설정

### 1-1. Pretendard 폰트 추가
`globals.css` 또는 `layout.tsx`에 추가:
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

### 1-2. tailwind.config.ts 수정
`theme.extend`에 아래 내용을 **머지**(기존 값 유지하면서 추가/덮어쓰기):

```ts
fontFamily: {
  sans: ['Pretendard Variable', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
},
colors: {
  sidebar: { DEFAULT: '#18181B', hover: '#27272A', active: '#3F3F46' },
  brand: { DEFAULT: '#4F46E5', hover: '#4338CA', light: '#EEF2FF' },
  surface: '#FFFFFF',
  base: '#F7F7F8',
  status: {
    ready: { DEFAULT: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
    progress: { DEFAULT: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
    done: { DEFAULT: '#10B981', bg: '#ECFDF5', text: '#065F46' },
    hold: { DEFAULT: '#6B7280', bg: '#F3F4F6', text: '#374151' },
    wait: { DEFAULT: '#A1A1AA', bg: '#F4F4F5', text: '#52525B' },
  },
},
boxShadow: {
  card: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
  'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
},
```

### 1-3. body 기본 스타일
```css
body {
  font-family: 'Pretendard Variable', -apple-system, sans-serif;
  background: #F7F7F8;
  -webkit-font-smoothing: antialiased;
}
```

---

## STEP 2: 사이드바

현재 사이드바의 **배경색만 변경하고 레이아웃은 유지**합니다.

| 요소 | 변경 내용 |
|------|----------|
| 사이드바 배경 | `bg-[#18181B]` (어두운 zinc) |
| 로고 아이콘 | `bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg w-8 h-8` |
| 로고 텍스트 | `text-white font-semibold text-[15px]` |
| 로고 서브텍스트 | `text-zinc-500 text-[11px]` |
| 네비 항목 기본 | `text-zinc-400 text-[14px] rounded-[7px] px-3 py-2.5 hover:bg-zinc-800 hover:text-zinc-300` |
| 네비 항목 active | `bg-zinc-800 text-white font-medium` |
| 네비 아이콘 | `w-[18px] h-[18px] opacity-60`, active시 `opacity-100` |
| + 새 프로젝트 버튼 | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-[7px] w-full py-2.5 text-[14px] font-medium` |
| 유저 프로필 영역 | 상단에 `border-t border-zinc-800` 구분선 |
| 유저 아바타 | `bg-zinc-700 text-zinc-400 w-8 h-8 rounded-full text-[13px]` |
| 유저 이름 | `text-white text-[14px] font-medium` |
| 유저 role | `text-zinc-500 text-[12px]` |

---

## STEP 3: 대시보드 페이지

| 요소 | 변경 내용 |
|------|----------|
| 메인 영역 배경 | `bg-[#F7F7F8]` |
| 페이지 제목 | `text-[24px] font-bold tracking-tight` |
| 페이지 설명 | `text-[15px] text-zinc-500` |
| 통계 카드 | border 제거 → `bg-white rounded-[10px] shadow-card hover:shadow-card-hover transition-shadow p-[18px_20px]` |
| 통계 아이콘 | `w-9 h-9 rounded-lg` + 상태별 light 배경색 |
| 통계 라벨 | `text-[13px] text-zinc-500 font-medium` |
| 통계 숫자 | `text-[28px] font-bold tracking-tight` |
| 프로젝트 카드 | border 제거 → `bg-white rounded-[10px] shadow-card hover:shadow-card-hover border-l-[3px]` + 상태별 왼쪽 보더 색상 |
| 프로젝트명 | `text-[16px] font-semibold` |
| 프로젝트 설명 | `text-[14px] text-zinc-500` |
| 프로그레스바 | `h-1 bg-zinc-100 rounded-full` 안에 `bg-indigo-600 rounded-full` |

---

## STEP 4: 프로젝트 목록 페이지

대시보드와 동일한 프로젝트 카드 스타일 적용. 2열 그리드 레이아웃.

---

## STEP 5: 프로젝트 상세 (업무 테이블) ⭐ 핵심

### 테이블 컨테이너
기존 테이블 wrapper에 적용:
`bg-white rounded-[10px] shadow-card overflow-hidden`

### 테이블 헤더 (thead)
`bg-[#FAFAFA]` 배경, th는 `text-[12px] font-semibold text-zinc-500 uppercase tracking-wide py-[11px] px-4`

### 테이블 행 (tbody tr)
`hover:bg-[#FAFAFF] transition-colors`
td는 `py-[14px] px-4 text-[14px] border-b border-zinc-100`

### ⭐ 업무명 셀 - 액션 버튼 위치 변경
**현재 문제**: 삭제, 편집, 하위추가 아이콘이 업무명 앞에 있어서 지저분함
**해결**: 액션 버튼을 행의 **오른쪽 끝에 배치**하고, **hover시에만 표시**

구현 방법:
```
각 tr.task-row에 `relative group` 클래스 추가

행 마지막에 액션 버튼 div 추가:
<div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 
            opacity-0 group-hover:opacity-100 transition-opacity
            bg-gradient-to-r from-transparent via-[#FAFAFF] to-[#FAFAFF] pl-6">
  <button class="w-7 h-7 rounded-md border border-zinc-200 bg-white 
                 flex items-center justify-center text-zinc-500 text-[13px]
                 hover:bg-zinc-50 hover:text-zinc-900">+</button>
  <button class="w-7 h-7 rounded-md border border-zinc-200 bg-white 
                 flex items-center justify-center text-zinc-500 text-[13px]
                 hover:bg-zinc-50 hover:text-zinc-900">✎</button>
  <button class="w-7 h-7 rounded-md border border-zinc-200 bg-white 
                 flex items-center justify-center text-zinc-500 text-[13px]
                 hover:bg-red-50 hover:text-red-600 hover:border-red-200">✕</button>
</div>
```

### ⭐ 하위 업무 추가 버튼 디자인 변경
**현재 문제**: `+ 하위 업무 추가...` 텍스트가 너무 튀고 디자인과 안 어울림
**해결**: 미니멀한 인라인 버튼으로 교체

```
상위 업무와 하위 업무 사이에 별도 행으로 배치:
<tr>
  <td colspan="전체열수" class="py-2 px-4">
    <button class="inline-flex items-center gap-1 ml-7 px-2 py-1 
                   text-[13px] text-zinc-400 rounded-[5px]
                   border border-dashed border-transparent
                   hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200
                   transition-all">
      + 하위 업무 추가
    </button>
  </td>
</tr>
```

### 상위 업무 행
- 업무명: `font-medium` + 왼쪽에 ▾ 토글 버튼 (20x20, `text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded`)
- 토글 버튼만 표시, 다른 아이콘은 표시하지 않음

### 하위 업무 행
- 업무명: `pl-9 text-zinc-600 font-normal` (들여쓰기)
- 앞에 아이콘 없음, 텍스트만

### 진척도 컬럼
숫자만 표시하지 말고 프로그레스바 포함:
```
<div class="flex items-center gap-2 justify-end">
  <div class="w-[72px] h-1 bg-zinc-100 rounded-full overflow-hidden">
    <div class="h-full bg-indigo-600 rounded-full" style="width:0%"></div>
  </div>
  <span class="text-[13px] text-zinc-400 w-8 text-right">0%</span>
</div>
```

### 날짜 없는 셀
`년-월-일` 대신 `—` 표시, `text-zinc-300` 색상

---

## STEP 6: 상태 뱃지

모든 상태 뱃지를 pill + dot 스타일로 통일:

```html
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium
             {상태별배경} {상태별텍스트색}">
  <span class="w-[7px] h-[7px] rounded-full {상태별dot색}"></span>
  상태텍스트
</span>
```

상태별 클래스:
- 준비중: `bg-amber-50 text-amber-800` + dot `bg-amber-500`
- 진행중: `bg-blue-50 text-blue-800` + dot `bg-blue-500`
- 완료: `bg-emerald-50 text-emerald-800` + dot `bg-emerald-500`
- 보류: `bg-gray-100 text-gray-700` + dot `bg-gray-500`
- 대기: `bg-zinc-100 text-zinc-600` + dot `bg-zinc-400`

---

## STEP 7: 버튼

| 종류 | Tailwind 클래스 |
|------|----------------|
| Primary | `bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-[7px] text-[14px] font-medium transition-colors` |
| Secondary | `bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 px-4 py-2.5 rounded-[7px] text-[14px] font-medium transition-colors` |
| Ghost | `bg-transparent hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 px-3 py-2 rounded-[7px] text-[14px] transition-colors` |
| Small 사이즈 | 위 클래스에서 `px-3 py-[7px] text-[13px]` 으로 변경 |

---

## STEP 8: 폼 (템플릿 생성 페이지)

| 요소 | Tailwind 클래스 |
|------|----------------|
| 폼 카드 | `bg-white rounded-xl p-8 shadow-card max-w-[580px]` |
| 라벨 | `text-[14px] font-semibold mb-2 block` |
| Input | `w-full px-3.5 py-[11px] border border-zinc-200 rounded-lg text-[15px] placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all` |
| Textarea | 위 + `resize-y min-h-[100px]` |
| 힌트 | `text-[13px] text-zinc-400 mt-1.5` |

---

## STEP 9: 간트 차트 (일정 탭)

| 요소 | 변경 내용 |
|------|----------|
| 컨테이너 | `bg-white rounded-[10px] shadow-card overflow-x-auto` |
| 네비게이션 버튼 | `w-8 h-8 rounded-[7px] border border-zinc-200 bg-white hover:bg-zinc-50` |
| 오늘 버튼 | `px-3.5 py-1.5 rounded-[7px] border border-zinc-200 bg-white text-[13px] font-medium` |
| 오늘 날짜 열 헤더 | `text-indigo-600 font-bold bg-indigo-50` |
| 오늘 세로선 | `w-0.5 bg-indigo-600` |
| 간트 바 | `h-6 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600` |

---

## STEP 10: 전역 설정

- 모든 인터랙티브 요소: `transition-all duration-150` 또는 `transition-colors`
- 기존 border 스타일 카드 → `shadow-card` 로 교체 (테이블 컨테이너는 shadow-card 사용, 내부 행 구분은 `border-b border-zinc-100`)
- 아바타: `w-7 h-7 rounded-full bg-indigo-600 text-white text-[12px] font-semibold flex items-center justify-center`
- 브레드크럼: `text-[13px] text-zinc-400`, 현재 페이지 `text-zinc-500`, 구분자 `›`
- 탭: `text-[14px] text-zinc-500 py-3 px-[18px] border-b-2 border-transparent`, active `text-zinc-900 border-indigo-600 font-medium`
