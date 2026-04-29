# Major UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mobile UX 전면 개편 — 폰트 가독성 개선, 홈 단순화, 음주 버그 수정, 체중 차트 재설계, 할일 달력뷰 추가, 댓글 제거.

**Architecture:** 각 태스크는 독립적. Task 1(폰트)→2(BottomNav)→3(홈)→4(음주버그)→5(체중)→6(할일) 순서로 진행. useWeights hook은 Task 5에서 duckEntries/dolphinEntries(날짜 포함)로 확장. 새 TaskCalendarView 컴포넌트는 Task 6에서 신규 생성.

**Tech Stack:** Next.js 15 App Router, TypeScript, React, Supabase, recharts (기존), CSS variables (다크모드)

---

## Task 1: 폰트 전환 — Jua/Gaegu → NanumGothic

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

배경: 현재 Jua(장식체), Gaegu(손글씨체)는 모바일에서 가독성이 나쁨. NanumGothic은 한국어 최적화 고딕체.

- [ ] **Step 1: layout.tsx 폰트 링크 교체**

```tsx
// app/layout.tsx — head의 link 태그 교체
<link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: globals.css CSS 변수 업데이트**

```css
/* :root 상단에 추가/수정 */
:root {
  --font-main: 'Nanum Gothic', sans-serif;
  /* 기존 --font-jua, --font-gaegu 제거 또는 유지(참조용) */
}
```

- [ ] **Step 3: globals.css body 폰트 교체**

```css
html, body {
  font-family: var(--font-main);
  /* 나머지 기존 속성 유지 */
}
```

- [ ] **Step 4: BottomNav.tsx 폰트 교체 (inline style)**

`components/ui/BottomNav.tsx` 내 `fontFamily: 'Jua, sans-serif'` → `fontFamily: "var(--font-main)"` (2곳)

- [ ] **Step 5: 컴포넌트 전체 일괄 치환**

```bash
cd "/Users/dolphin/Documents/claude/00. 시작/woori-weight-pwa"
# Jua 참조 전부 확인
grep -rn "Jua\|Gaegu" --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules | grep -v ".next"
```

모든 `fontFamily: 'Jua, sans-serif'` → `fontFamily: "var(--font-main)"` 으로 치환  
모든 `fontFamily: 'Gaegu, cursive'` → `fontFamily: "var(--font-main)"` 으로 치환

```bash
# sed 일괄 치환 (macOS)
find . -path ./node_modules -prune -o -path ./.next -prune -o -name "*.tsx" -print | \
  xargs sed -i '' \
    -e "s/fontFamily: 'Jua, sans-serif'/fontFamily: \"var(--font-main)\"/g" \
    -e "s/fontFamily: 'Gaegu, cursive'/fontFamily: \"var(--font-main)\"/g" \
    -e "s/fontFamily: 'Gaegu, sans-serif'/fontFamily: \"var(--font-main)\"/g" \
    -e "s/fontFamily: \"Jua, sans-serif\"/fontFamily: \"var(--font-main)\"/g"
```

- [ ] **Step 6: TSC 확인 후 커밋**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add -A
git commit -m "feat: 폰트 Jua/Gaegu → NanumGothic 전환 (가독성 개선)"
```

---

## Task 2: BottomNav — 설정 탭 추가 (4→5개)

**Files:**
- Modify: `components/ui/BottomNav.tsx`

- [ ] **Step 1: tabs 배열에 설정 추가**

```tsx
// components/ui/BottomNav.tsx
const tabs = [
  { id: 'home',     label: '홈',    emoji: '🏠', href: '/' },
  { id: 'tasks',    label: '할일',  emoji: '✅', href: '/tasks' },
  { id: 'weight',   label: '체중',  emoji: '⚖️', href: '/weight' },
  { id: 'drink',    label: '음주',  emoji: '🍺', href: '/drink' },
  { id: 'settings', label: '설정',  emoji: '⚙️', href: '/settings' },
];
```

- [ ] **Step 2: getActive에 settings 추가**

```tsx
function getActive(pathname: string): string {
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/weight')) return 'weight';
  if (pathname.startsWith('/drink')) return 'drink';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'home';
}
```

- [ ] **Step 3: 탭 레이블 폰트 크기 12px로 올리기**

```tsx
// span 스타일 수정
<span style={{
  fontFamily: 'var(--font-main)',
  fontSize: 11,         // 그대로 유지 (5개라 공간 부족)
  letterSpacing: -0.3,
}}>{tab.label}</span>
```

- [ ] **Step 4: 커밋**

```bash
git add components/ui/BottomNav.tsx
git commit -m "feat: BottomNav 설정 탭 추가 (4→5개)"
```

---

## Task 3: 홈 화면 단순화

**Files:**
- Modify: `app/page.tsx`

요구사항:
- 기한 지난 할 일 섹션 제거
- 스크롤 없는 한 화면
- 커플 미션 제거
- 중간 4개 dock 버튼(AI 코치~설정) 제거 — BottomNav로 이동했으니 불필요
- 음주 dock 버튼도 제거

최종 홈 레이아웃:
```
[헤더: 인사 + 날씨/날짜]
[기분 버블 row: 창희 ↔ 하경]
[BigCard row: 할일 | 체중]
[하단 여백]
```

- [ ] **Step 1: app/page.tsx에서 제거할 섹션 파악**

```bash
grep -n "overdue\|urgent\|mission\|DockBtn\|AI 코치\|채팅\|설정\|음주" app/page.tsx | head -40
```

- [ ] **Step 2: 기한 지난 할 일 관련 state + useEffect 제거**

`app/page.tsx`에서 다음 제거:
- `overdueItems`, `setOverdueItems` state
- `allTasks`, `setAllTasks` state  
- `TaskItem` import
- overdue 관련 useEffect (task_items fetch 로직)
- `dueDateChip`, `TinyTask`, `TinySubTask` 함수
- `overdueTasks`, `overdueSubItems`, `urgentTasksFallback`, `hasUrgent` 변수

대신 `openCount`만 유지 (BigCard에 표시할 미완료 수):
```tsx
const [openCount, setOpenCount] = useState(0)

useEffect(() => {
  // tasks 로드 — completed=false 카운트만
  const supabase = getSupabaseClient()
  supabase.from('tasks').select('id', { count: 'exact' }).eq('completed', false)
    .then(({ count }) => setOpenCount(count ?? 0))
}, [])
```

- [ ] **Step 3: DockBtn 컴포넌트 및 dock 섹션 전체 제거**

`DockBtn` 함수 정의 전체 삭제.  
JSX에서 dock 버튼 섹션 (`{/* Dock */}` 블록) 전체 삭제.

- [ ] **Step 4: 커플 미션 섹션 제거**

JSX에서 미션 관련 블록 삭제 (missions 링크 카드 등).

- [ ] **Step 5: 레이아웃을 no-scroll 단일 화면으로**

```tsx
// 최상위 div
<div style={{
  width: '100%',
  height: '100svh',           // ← minHeight → height (스크롤 방지)
  background: 'var(--bg)',
  color: 'var(--ink)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',         // ← 스크롤 완전 차단
}}>
```

- [ ] **Step 6: 기분 버블 — 창희/하경 각 1개씩만 표시 (공간 절약)**

현재 기분 버블 2개를 나란히 row로 배치:
```tsx
<div style={{ display: 'flex', gap: 10, padding: '8px 18px' }}>
  {/* 창희 기분 버블 */}
  <MoodBubble who="창희" mood={duckMood} onClick={() => openMoodModal('창희')} />
  {/* 하경 기분 버블 */}
  <MoodBubble who="하경" mood={dolphinMood} onClick={() => openMoodModal('하경')} />
</div>
```

- [ ] **Step 7: BigCard row — flex row, 두 카드 나란히**

```tsx
<div style={{ display: 'flex', gap: 12, padding: '0 18px' }}>
  <BigCard
    onClick={() => router.push('/tasks')}
    title="할 일"
    count={openCount}
    subtitle={openCount === 0 ? '다 했어! 🎉' : '미완료'}
    color="var(--accent-soft)"
    colorDeep="var(--accent-deep)"
    icon="task"
  />
  <BigCard
    onClick={() => router.push('/weight')}
    title="체중"
    count=""
    subtitle="기록하러 가기"
    color="var(--duck-soft)"
    colorDeep="var(--duck-deep)"
    icon="weight"
  />
</div>
```

- [ ] **Step 8: TSC 확인 후 커밋**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add app/page.tsx
git commit -m "feat: 홈 화면 단순화 — 단일 화면, 불필요 섹션 제거"
```

---

## Task 4: 음주 버그 수정 — 토글 즉시 롤백 문제

**Files:**
- Modify: `components/DrinkPageClient.tsx`

**버그 원인:** `weigh_ins` 테이블의 `household_id` 컬럼이 NOT NULL인데, 새 음주 기록 insert 시 `household_id`가 누락되어 DB 오류 → optimistic update가 자동 롤백됨.

- [ ] **Step 1: household_id를 state로 저장**

```tsx
// DrinkPageClient.tsx
const [householdId, setHouseholdId] = useState<string | null>(null);

// loadData useEffect 내에서
const safeMembers = (memberRows ?? []) as Array<HouseholdMember & { household_id: string }>;
const hid = safeMembers[0]?.household_id ?? null;
setHouseholdId(hid);                    // ← 추가
setMembers(safeMembers.map((m) => ({ user_id: m.user_id, display_name: m.display_name })));
```

- [ ] **Step 2: toggleDrink의 upsert에 household_id 포함**

```tsx
async function toggleDrink(userId: string | undefined, date: Date) {
  if (!userId || !householdId) return;   // householdId 없으면 bail
  const ds = toSeoulISODate(date);
  const existing = rows.find((r) => r.user_id === userId && r.date === ds);
  const newVal = !(existing?.drank ?? false);

  // Optimistic update
  setRows((prev) => {
    const next = prev.filter((r) => !(r.user_id === userId && r.date === ds));
    if (newVal) next.push({ date: ds, user_id: userId, weight_kg: existing?.weight_kg ?? 0, drank: true });
    return next;
  });

  const supabase = getSupabaseClient();
  let error: unknown = null;
  if (existing) {
    const res = await supabase.from('weigh_ins')
      .update({ drank: newVal })
      .eq('user_id', userId)
      .eq('date', ds);
    error = res.error;
  } else {
    // ← household_id 포함
    const res = await supabase.from('weigh_ins').upsert(
      [{ household_id: householdId, user_id: userId, date: ds, weight_kg: 0, drank: true }],
      { onConflict: 'user_id,date' }
    );
    error = res.error;
  }

  if (error) {
    // Rollback
    setRows((prev) => {
      const next = prev.filter((r) => !(r.user_id === userId && r.date === ds));
      if (existing?.drank) next.push({ date: ds, user_id: userId, weight_kg: existing.weight_kg ?? 0, drank: true });
      return next;
    });
  }
}
```

- [ ] **Step 3: TSC 확인 후 커밋**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add components/DrinkPageClient.tsx
git commit -m "fix: 음주 토글 버그 수정 — household_id 누락으로 인한 롤백 해결"
```

---

## Task 5: 체중 페이지 전면 재설계

**Files:**
- Modify: `components/weight/useWeights.ts`
- Modify: `components/weight/WeightClient.tsx`
- Modify: `components/WeightChart.tsx`

요구사항:
- 창희/하경/같이 토글 → **항상 같이 (두 사람 한 그래프)** 
- 그래프 x축에 날짜 표시
- 터치해서 날짜/수치 확인 가능 (recharts Tooltip 활용)
- 모바일 체중 기입 완전히 작동
- 과거 날짜도 기입 가능

### 5-1: useWeights — duckEntries/dolphinEntries 추가 (날짜 포함)

- [ ] **Step 1: useWeights.ts에 entries state 추가**

```ts
// useWeights.ts
export type WeightEntry = { date: string; kg: number };

export function useWeights() {
  // 기존 state들 유지하되 추가:
  const [duckEntries, setDuckEntries] = useState<WeightEntry[]>([]);
  const [dolphinEntries, setDolphinEntries] = useState<WeightEntry[]>([]);
  // duckWeights, dolphinWeights는 하위 호환용으로 유지
```

- [ ] **Step 2: loadData에서 entries 세팅**

```ts
// loadData 내 기존 filter 로직 대체
const duckRaw = rows
  .filter(r => r.user_id === resolvedDuckId)
  .map(r => ({ date: r.date, kg: r.weight_kg }));
const dolphinRaw = rows
  .filter(r => r.user_id === resolvedDolphinId)
  .map(r => ({ date: r.date, kg: r.weight_kg }));

setDuckEntries(duckRaw.slice(-30));        // 최근 30일
setDolphinEntries(dolphinRaw.slice(-30));
setDuckWeights(duckRaw.slice(-14).map(e => e.kg));    // 하위 호환
setDolphinWeights(dolphinRaw.slice(-14).map(e => e.kg));
```

- [ ] **Step 3: addWeight에 household_id 추가**

```ts
async function addWeight(who: 'duck' | 'dolphin', kg: number, date?: string) {
  const today = date ?? new Date().toISOString().slice(0, 10);
  const uid = who === 'duck' ? duckId : dolphinId;

  if (supabase && uid && householdId) {
    await supabase.from("weigh_ins").upsert(
      [{ household_id: householdId, user_id: uid, date: today, weight_kg: kg, drank: false }],
      { onConflict: "user_id,date" }
    );
  }
  // ... 나머지 기존 코드
}
```

household_id를 state로 저장:
```ts
const [householdId, setHouseholdId] = useState<string | null>(null);

// loadData에서:
const memberRows2 = memberRows as Array<{ user_id: string; display_name: string; household_id: string }>;
const hid = memberRows2[0]?.household_id ?? null;
setHouseholdId(hid);
```

- [ ] **Step 4: return에 duckEntries/dolphinEntries 추가**

```ts
return { duckWeights, dolphinWeights, duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight };
```

### 5-2: WeightChart — 두 사람 통합 그래프, 날짜 x축

- [ ] **Step 5: WeightChart props 타입 업데이트**

```tsx
// components/WeightChart.tsx
// 기존 ChartPoint 타입 활용 (lib/types.ts에 이미 있음)
// Props 유지, data는 ChartPoint[] 그대로 사용
```

`lib/types.ts`의 `ChartPoint` 확인:
```bash
grep -n "ChartPoint" lib/types.ts
```

ChartPoint가 `{ date: string; me: number|null; partner: number|null; ... }` 형태인지 확인. 맞으면 그대로 활용.

- [ ] **Step 6: WeightChart 그래프 개선 — x축 날짜, 툴팁**

기존 WeightChart.tsx의 Tooltip custom content에서:
- label을 M/D 형식으로 표시 (`iso.slice(5)` → `"04-29"` → `"4/29"` 변환)
- 툴팁에 두 사람 수치 모두 표시

```tsx
// labelDate 함수 수정
function labelDate(iso: string): string {
  const parts = iso.slice(5).split('-');  // "04-29" → ["04","29"]
  return `${parseInt(parts[0])}/${parseInt(parts[1])}`;  // "4/29"
}
```

- [ ] **Step 7: XAxis tick 간격 조정 (30개 포인트에서 7개만 표시)**

```tsx
<XAxis
  dataKey="date"
  tickFormatter={labelDate}
  tick={{ fontSize: 11, fontFamily: "var(--font-main)" }}
  interval={Math.floor(data.length / 6)}   // 약 6개 tick만 표시
/>
```

### 5-3: WeightClient — 재설계

- [ ] **Step 8: WeightClient 상단 — 통합 차트로 교체**

기존 3-way toggle(창희/같이/하경) 제거.

`ChartPoint[]` 데이터 생성 로직:
```tsx
// WeightClient.tsx 상단
import { useWeights } from './useWeights';
import { WeightChart } from '@/components/WeightChart';

// hook에서 entries 받기
const { duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight } = useWeights();

// 날짜 합집합으로 ChartPoint[] 생성
const chartData = useMemo(() => {
  const dates = Array.from(new Set([
    ...duckEntries.map(e => e.date),
    ...dolphinEntries.map(e => e.date),
  ])).sort();
  const duckMap = Object.fromEntries(duckEntries.map(e => [e.date, e.kg]));
  const dolphinMap = Object.fromEntries(dolphinEntries.map(e => [e.date, e.kg]));
  return dates.map(date => ({
    date,
    me: duckMap[date] ?? null,
    partner: dolphinMap[date] ?? null,
    meDrank: false,
    partnerDrank: false,
  }));
}, [duckEntries, dolphinEntries]);
```

- [ ] **Step 9: WeightClient 레이아웃 — 오늘 기록 카드 + 통합 차트**

```tsx
return (
  <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
    {/* 헤더 */}
    <div style={{ padding: '54px 22px 10px' }}>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28 }}>체중</div>
    </div>

    <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 오늘 수치 카드 — 창희/하경 나란히 */}
      <div style={{ display: 'flex', gap: 10 }}>
        <TodayCard who="duck" entries={duckEntries} />
        <TodayCard who="dolphin" entries={dolphinEntries} />
      </div>

      {/* 통합 그래프 */}
      <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          최근 30일
        </div>
        {loading
          ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>
          : <WeightChart data={chartData} showPartner meLabel="창희" partnerLabel="하경" />
        }
      </div>
    </div>

    {/* FAB */}
    <button
      onClick={() => setView('entry')}
      style={{
        position: 'fixed',
        bottom: 'calc(68px + env(safe-area-inset-bottom))',
        right: 22,
        padding: '14px 20px', borderRadius: 28, border: 'none',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(99,163,253,0.46)',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15, zIndex: 5,
        minHeight: 52,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M9 3v12M3 9h12" />
      </svg>
      기록하기
    </button>
  </div>
);
```

- [ ] **Step 10: TodayCard — entries 기반으로 수정**

```tsx
function TodayCard({ who, entries }: { who: 'duck' | 'dolphin'; entries: WeightEntry[] }) {
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const delta = latest && prev ? (latest.kg - prev.kg) : null;
  const col = who === 'duck' ? 'var(--duck-deep)' : 'var(--accent-deep)';
  const bg = who === 'duck' ? 'var(--duck-soft)' : 'var(--dolphin-soft)';

  return (
    <div style={{ flex: 1, background: bg, borderRadius: 22, padding: 14, boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
        {who === 'duck' ? '🦆 창희' : '🐬 하경'}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28, color: col, lineHeight: 1 }}>
        {latest ? `${latest.kg}` : '-'}
        <span style={{ fontSize: 14, fontWeight: 400 }}>kg</span>
      </div>
      {delta !== null && (
        <div style={{ fontSize: 13, color: delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)', marginTop: 2 }}>
          {delta < 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)}
        </div>
      )}
      {latest && (
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
          {latest.date.slice(5).replace('-', '/')}
        </div>
      )}
    </div>
  );
}
```

### 5-4: WeightEntry — 과거 날짜 입력 + 모바일 최적화

- [ ] **Step 11: WeightEntry에 날짜 선택기 추가**

```tsx
function WeightEntry({ onBack, onSave }: {
  onBack: () => void;
  onSave: (who: 'duck' | 'dolphin', kg: number, date: string) => Promise<void>;
}) {
  const [who, setWho] = useState<'duck' | 'dolphin'>('duck');
  const [kg, setKg] = useState(70.0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(who, kg, date);
    setSaving(false);
    onBack();
  }

  return (
    <div style={{ width: '100%', height: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 22px 16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--ink-soft)' }}>←</button>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, marginTop: 8 }}>체중 기록</div>
      </div>

      <div style={{ flex: 1, padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 누구? */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--ink-soft)' }}>누구?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['duck', 'dolphin'] as const).map(w => (
              <button
                key={w}
                onClick={() => setWho(w)}
                style={{
                  flex: 1, minHeight: 52, borderRadius: 16, border: 'none',
                  background: who === w ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--card)',
                  color: who === w ? '#fff' : 'var(--ink)',
                  fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 17,
                  cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
                }}
              >
                {w === 'duck' ? '🦆 창희' : '🐬 하경'}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--ink-soft)' }}>날짜</div>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', minHeight: 52, borderRadius: 16, border: '2px solid var(--border)',
              background: 'var(--card)', color: 'var(--ink)',
              fontFamily: 'var(--font-main)', fontSize: 16, padding: '0 16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 체중 */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--ink-soft)' }}>몸무게 (kg)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--card)', borderRadius: 22, padding: '12px 20px', boxShadow: 'var(--shadow-soft)' }}>
            <button
              onClick={() => setKg(k => Math.max(30, +(k - 0.1).toFixed(1)))}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 26, cursor: 'pointer', flexShrink: 0 }}
            >−</button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 36, color: 'var(--accent-deep)' }}>
              {kg.toFixed(1)}
            </div>
            <button
              onClick={() => setKg(k => Math.min(200, +(k + 0.1).toFixed(1)))}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 26, cursor: 'pointer', flexShrink: 0 }}
            >+</button>
          </div>
          {/* 빠른 +/- 0.5 버튼 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[-1, -0.5, +0.5, +1].map(d => (
              <button
                key={d}
                onClick={() => setKg(k => Math.max(30, Math.min(200, +(k + d).toFixed(1))))}
                style={{
                  flex: 1, minHeight: 44, borderRadius: 12, border: 'none',
                  background: 'var(--card)', color: 'var(--ink-soft)',
                  fontFamily: 'var(--font-main)', fontSize: 14, cursor: 'pointer',
                }}
              >{d > 0 ? `+${d}` : d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding: '16px 22px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', minHeight: 56, borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 18,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
          }}
        >{saving ? '저장 중...' : '저장하기'}</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 12: TSC 확인 후 커밋**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add components/weight/ components/WeightChart.tsx
git commit -m "feat: 체중 페이지 재설계 — 통합 그래프, 날짜 x축, 과거 기록 입력"
```

---

## Task 6: 할일 — 달력뷰 추가 + 댓글 제거 + 하위 아젠다 모바일 수정

**Files:**
- Create: `components/tasks/TaskCalendarView.tsx`
- Modify: `components/tasks/TasksClient.tsx`
- Modify: `components/tasks/TaskDetail.tsx`

요구사항:
- 기본: 달력뷰 (월간 그리드, 날짜별 할일 점 표시)
- 달력의 날짜 탭 → 해당 날짜 할일 목록 아래에 표시
- 토글로 목록뷰 전환 가능
- TaskDetail: 댓글 기능 제거, 하위 아젠다 추가 폼 항상 노출

### 6-1: TaskCalendarView 컴포넌트 신규 생성

- [ ] **Step 1: TaskCalendarView.tsx 생성**

```tsx
// components/tasks/TaskCalendarView.tsx
"use client";

import { useMemo, useState } from "react";
import type { Task } from "./types";

type Props = {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onToggle: (id: string, completed: boolean) => void;
};

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  return grid;
}

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function TaskCalendarView({ tasks, onTaskClick, onToggle }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().slice(0, 10)
  );

  const grid = buildMonthGrid(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);

  // 날짜별 할일 매핑
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push(t);
      }
    });
    return map;
  }, [tasks]);

  // due_date 없는 할일 (달력에 표시 안 됨 → 선택 날짜 아래 "날짜 없음" 섹션에 표시)
  const noDateTasks = tasks.filter(t => !t.due_date && !t.completed);

  // 선택된 날짜의 할일
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function goPrev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function goNext() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function dateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 8px' }}>
        <button
          onClick={goPrev}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)' }}
        >‹</button>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16 }}>
          {viewYear}년 {viewMonth + 1}월
        </div>
        <button
          onClick={goNext}
          style={{ minWidth: 44, minHeight: 44, border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-soft)' }}
        >›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: 2 }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'var(--font-main)', fontWeight: 700,
            fontSize: 12, color: 'var(--ink-mute)', paddingBottom: 4,
          }}>{d}</div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: 2 }}>
        {grid.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const ds = dateStr(d);
          const dayTasks = tasksByDate[ds] ?? [];
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const isPast = ds < todayStr;
          const hasOverdue = dayTasks.some(t => !t.completed && isPast);

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
              style={{
                minHeight: 52,
                borderRadius: 12,
                border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                background: isSelected
                  ? 'var(--accent-soft)'
                  : isToday
                  ? 'var(--card)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '6px 2px',
                position: 'relative',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-main)',
                fontWeight: isToday ? 800 : 400,
                fontSize: 15,
                color: isToday
                  ? 'var(--accent-deep)'
                  : isPast && !isSelected
                  ? 'var(--ink-mute)'
                  : 'var(--ink)',
              }}>
                {d.getDate()}
              </span>
              {/* 할일 점 */}
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {dayTasks.slice(0, 3).map((t, ti) => (
                    <div key={ti} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: t.completed
                        ? 'var(--mint-deep)'
                        : hasOverdue && !t.completed && isPast
                        ? 'var(--peach-deep)'
                        : 'var(--accent)',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택 날짜 할일 목록 */}
      {selectedDate && (
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8 }}>
            {selectedDate.slice(5).replace('-', '/')} 할 일
            {selectedTasks.length === 0 && <span style={{ color: 'var(--ink-mute)' }}> — 없음</span>}
          </div>
          {selectedTasks.map(t => (
            <CalendarTaskRow key={t.id} t={t} onOpen={() => onTaskClick(t.id)} onToggle={() => onToggle(t.id, t.completed)} />
          ))}
        </div>
      )}

      {/* 날짜 없는 할일 */}
      {noDateTasks.length > 0 && (
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, color: 'var(--ink-mute)', marginBottom: 8 }}>
            📌 날짜 없음 ({noDateTasks.length})
          </div>
          {noDateTasks.map(t => (
            <CalendarTaskRow key={t.id} t={t} onOpen={() => onTaskClick(t.id)} onToggle={() => onToggle(t.id, t.completed)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarTaskRow({ t, onOpen, onToggle }: { t: Task; onOpen: () => void; onToggle: () => void }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 0', borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{
          width: 44, height: 44, borderRadius: 22, border: 'none',
          background: 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: t.completed ? 'var(--accent)' : 'transparent',
          border: t.completed ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {t.completed && (
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>
      <button
        onClick={onOpen}
        style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', padding: 0,
          fontFamily: 'var(--font-main)', fontSize: 15, color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
          textDecoration: t.completed ? 'line-through' : 'none',
        }}
      >
        {t.title}
      </button>
    </div>
  );
}
```

### 6-2: TasksClient — 달력/목록 토글

- [ ] **Step 2: TasksClient에 viewMode state 추가 + 달력뷰 연결**

```tsx
// components/tasks/TasksClient.tsx
import { TaskCalendarView } from './TaskCalendarView';

type ViewMode = 'calendar' | 'list';

export function TasksClient() {
  // 기존 state 유지
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');  // 기본: 달력
  // ...

  return (
    <div style={{ ... }}>
      {/* 헤더 */}
      <div style={{ padding: '54px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28 }}>할 일</div>
          <div style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-soft)' }}>
            {openCount === 0 ? '다 했다! 🎉' : `${doneCount}/${tasks.length} 완료`}
          </div>
        </div>
        {/* 뷰 토글 버튼 */}
        <button
          onClick={() => setViewMode(m => m === 'calendar' ? 'list' : 'calendar')}
          style={{
            minHeight: 44, minWidth: 44, borderRadius: 14, border: 'none',
            background: 'var(--card)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-soft)', fontSize: 20,
          }}
        >
          {viewMode === 'calendar' ? '☰' : '📅'}
        </button>
      </div>

      {/* 컨텐츠 */}
      {loading ? (
        <LoadingSpinner />
      ) : viewMode === 'calendar' ? (
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
          <TaskCalendarView
            tasks={tasks}
            onTaskClick={(id) => router.push(`/tasks/${id}`)}
            onToggle={(id, completed) => handleToggleDone(id, completed)}
          />
        </div>
      ) : (
        <>
          {/* 기존 필터 탭 + 목록 */}
          <FilterTabs filter={filter} setFilter={setFilter} filterCounts={filterCounts} />
          <TaskList ... />
        </>
      )}

      {/* FAB는 유지 */}
    </div>
  );
}
```

### 6-3: TaskDetail — 댓글 제거 + 하위 아젠다 폼 개선

- [ ] **Step 3: TaskDetail에서 댓글 관련 제거**

`components/tasks/TaskDetail.tsx`에서 삭제:
- `ThreadPanel` import 및 렌더링
- `CommentBubble` 컴포넌트
- `REACTION_EMOJIS` 상수
- 댓글 관련 state: `commentText`, `commentActor`, `showReactionPicker` 등
- `addComment` 함수 호출부
- 하단 fixed 댓글 입력바 전체

`useTasks.ts`에서 `addComment` 제거:
- `addComment` 함수 삭제
- return에서 `addComment` 제거

- [ ] **Step 4: 하위 아젠다 추가 폼 항상 노출 (인라인)**

현재 ChecklistPanel은 접힌 패널 형태. 대신 `TaskDetail` 내부에서 직접 인라인으로 표시:

```tsx
{/* 하위 아젠다 추가 — 항상 보임 */}
<div style={{ padding: '12px 0 0' }}>
  <form
    onSubmit={e => {
      e.preventDefault();
      if (!newItemText.trim()) return;
      addChecklistItem(taskId, newItemText.trim(), newItemDue || null);
      setNewItemText('');
      setNewItemDue('');
    }}
  >
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={newItemText}
        onChange={e => setNewItemText(e.target.value)}
        placeholder="하위 아젠다 추가..."
        style={{
          flex: 1, minHeight: 48, borderRadius: 14,
          border: '1.5px solid var(--border)', background: 'var(--card)',
          color: 'var(--ink)', padding: '0 14px',
          fontFamily: 'var(--font-main)', fontSize: 15, outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          minWidth: 52, minHeight: 48, borderRadius: 14, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 18,
          cursor: 'pointer',
        }}
      >+</button>
    </div>
    <input
      type="date"
      value={newItemDue}
      onChange={e => setNewItemDue(e.target.value)}
      style={{
        marginTop: 6, width: '100%', minHeight: 44, borderRadius: 12,
        border: '1.5px solid var(--border)', background: 'var(--card)',
        color: 'var(--ink)', padding: '0 12px',
        fontFamily: 'var(--font-main)', fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  </form>
</div>
```

- [ ] **Step 5: SubItem 체크박스 터치 영역 확대**

```tsx
// SubItem 내 체크박스 버튼
<button
  onClick={onToggle}
  style={{
    width: 44, height: 44,          // ← 44px 터치 영역
    borderRadius: 22,
    background: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, cursor: 'pointer',
  }}
>
  <div style={{
    width: 24, height: 24, borderRadius: 6,   // ← 24px 내부 체크박스
    background: item.done ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))' : 'transparent',
    border: item.done ? 'none' : '2px solid var(--ink-mute)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {item.done && (
      <svg width="13" height="13" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 5l2 2 4-5" />
      </svg>
    )}
  </div>
</button>
```

- [ ] **Step 6: 수정/삭제 버튼 최소 44px 터치 영역**

```tsx
<button
  onClick={() => { setEditContent(item.content); setEditDue(item.due_date ?? ''); setEditing(true); }}
  style={{
    minWidth: 44, minHeight: 44,      // ← 터치 영역
    border: 'none', background: 'none', cursor: 'pointer',
    borderRadius: 10, fontSize: 18, color: 'var(--ink-mute)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}
>✏️</button>
<button
  onClick={onDelete}
  style={{
    minWidth: 44, minHeight: 44,
    border: 'none', background: 'none', cursor: 'pointer',
    borderRadius: 10, fontSize: 18, color: 'var(--peach-deep)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}
>🗑️</button>
```

- [ ] **Step 7: TSC 확인 후 커밋**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add components/tasks/
git commit -m "feat: 할일 달력뷰 추가, 댓글 제거, 하위 아젠다 모바일 수정"
```

---

## Task 7: 최종 정리 + 터치 반응 개선

**Files:**
- Modify: `app/globals.css`
- Modify: `components/tasks/TaskForm.tsx` (버튼 높이)
- Modify: `components/tasks/TaskCard.tsx` (폰트 크기)

- [ ] **Step 1: globals.css — active 상태 피드백 추가**

```css
/* 모든 버튼에 터치 시 즉각 시각 피드백 */
button, a {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;         /* 300ms 지연 제거 */
}

button:active {
  opacity: 0.75;
  transform: scale(0.97);
  transition: opacity 0.05s, transform 0.05s;
}
```

- [ ] **Step 2: TaskForm 버튼 높이 44px 이상으로**

```tsx
// 담당자 버튼: padding → minHeight: 52
// 카테고리 칩: padding → minHeight: 44
// 저장/취소 버튼: minHeight: 52
```

- [ ] **Step 3: TaskCard 폰트 12px 이상으로**

```tsx
// 뱃지/날짜 등 11px → 12px 로 통일
```

- [ ] **Step 4: 최종 TSC 확인 + push**

```bash
node node_modules/.bin/tsc --noEmit --project tsconfig.json
git add -A
git commit -m "fix: 터치 반응 개선, 버튼 최소 높이, 폰트 가독성"
git push origin main
```

---

## 체크리스트 (완료 추적)

- [ ] Task 1: 폰트 NanumGothic
- [ ] Task 2: BottomNav 5개
- [ ] Task 3: 홈 단순화
- [ ] Task 4: 음주 버그
- [ ] Task 5: 체중 재설계
- [ ] Task 6: 할일 달력뷰
- [ ] Task 7: 터치/폰트 마무리
