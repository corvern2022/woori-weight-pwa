'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { toSeoulISODate } from '@/lib/date';
import type { HouseholdMember, WeighInRow } from '@/lib/types';

const LOCAL_KEY = 'woori_weight_user_id';

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  return grid;
}

export function DrinkPageClient() {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [actor, setActor] = useState<string>('');
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [rows, setRows] = useState<WeighInRow[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) setMyUserId(saved);
      setActor(localStorage.getItem('ori_ranger_actor') ?? '');
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data: memberRows, error: memberError } = await supabase
          .from('household_members')
          .select('user_id, display_name, household_id');
        if (memberError) throw memberError;

        const safeMembers = (memberRows ?? []) as Array<HouseholdMember & { household_id: string }>;
        setMembers(safeMembers.map((m) => ({ user_id: m.user_id, display_name: m.display_name })));

        const hid = safeMembers[0]?.household_id ?? null;
        if (!hid) { setRows([]); return; }

        const monthStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
        const monthEnd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-31`;

        const { data: weighRows, error: weighError } = await supabase
          .from('weigh_ins')
          .select('*')
          .eq('household_id', hid)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: true });
        if (weighError) throw weighError;

        setRows(
          ((weighRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number | string; drank?: boolean | null }>).map((r) => ({
            date: r.date,
            user_id: r.user_id,
            weight_kg: Number(r.weight_kg),
            drank: Boolean(r.drank),
          })),
        );
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [viewYear, viewMonth]);

  const grid = buildMonthGrid(viewYear, viewMonth);
  const todayStr = toSeoulISODate(now);

  const duckMember = members.find((m) => m.display_name.includes('창희')) ?? members[0];
  const dolphinMember = members.find((m) => m.display_name.includes('하경')) ?? members[1];

  function drankOnDate(userId: string | undefined, date: Date): boolean {
    if (!userId) return false;
    const ds = toSeoulISODate(date);
    return rows.some((r) => r.user_id === userId && r.date === ds && r.drank);
  }

  let duckCount = 0, dolphinCount = 0, bothCount = 0;
  grid.forEach((d) => {
    if (!d) return;
    const dd = drankOnDate(duckMember?.user_id, d);
    const dp = drankOnDate(dolphinMember?.user_id, d);
    if (dd) duckCount++;
    if (dp) dolphinCount++;
    if (dd && dp) bothCount++;
  });

  void myUserId;
  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  function goPrev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function goNext() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  async function toggleDrink(userId: string | undefined, date: Date) {
    if (!userId) return;
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
      const res = await supabase.from('weigh_ins').update({ drank: newVal }).eq('user_id', userId).eq('date', ds);
      error = res.error;
    } else {
      const res = await supabase.from('weigh_ins').upsert([{ user_id: userId, date: ds, weight_kg: 0, drank: true }], { onConflict: 'user_id,date' });
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

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 28, letterSpacing: -0.5 }}>음주 캘린더 🍺</div>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={goPrev} aria-label="이전 달" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--ink-soft)', padding: '4px 6px', lineHeight: 1 }}>‹</button>
            <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 13, color: 'var(--ink-soft)', minWidth: 72, textAlign: 'center' }}>{monthLabel}</div>
            <button onClick={goNext} aria-label="다음 달" disabled={isCurrentMonth} style={{ border: 'none', background: 'none', cursor: isCurrentMonth ? 'default' : 'pointer', fontSize: 22, color: isCurrentMonth ? 'var(--ink-mute)' : 'var(--ink-soft)', padding: '4px 6px', lineHeight: 1 }}>›</button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ padding: '6px 18px 10px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: 'var(--duck-soft)', borderRadius: 18, padding: 10 }}>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 11 }}>🦆 창희</div>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 22, color: 'var(--duck-deep)', lineHeight: 1 }}>{duckCount}일</div>
        </div>
        <div style={{ flex: 1, background: 'var(--dolphin-soft)', borderRadius: 18, padding: 10 }}>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 11 }}>🐬 하경</div>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 22, color: 'var(--accent-deep)', lineHeight: 1 }}>{dolphinCount}일</div>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--pink), var(--peach))', borderRadius: 18, padding: 10, color: 'var(--ink)' }}>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 11 }}>💞 같이</div>
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 22, lineHeight: 1 }}>{bothCount}일</div>
        </div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px calc(80px + env(safe-area-inset-bottom))' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 40 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--peach)', display: 'inline-block', animation: 'bounce 1s infinite' }} />
            <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--peach)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: '150ms' }} />
            <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--peach)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: '300ms' }} />
          </div>
        ) : (
          <>
            {/* Calendar card */}
            <div style={{ background: 'var(--card)', borderRadius: 22, padding: 14, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
                {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
                  <div key={d} style={{ textAlign: 'center', fontFamily: 'Jua, sans-serif', fontSize: 11, color: i >= 5 ? 'var(--peach-deep)' : 'var(--ink-mute)', padding: '2px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {grid.map((d, i) => {
                  if (!d) return <div key={i} style={{ aspectRatio: '1' }} />;
                  const ds = toSeoulISODate(d);
                  const duckDrank = drankOnDate(duckMember?.user_id, d);
                  const dolphinDrank = drankOnDate(dolphinMember?.user_id, d);
                  const isToday = ds === todayStr;
                  const isFuture = ds > todayStr;
                  return (
                    <div
                      key={i}
                      style={{ aspectRatio: '1', borderRadius: 10, border: isToday ? '2px solid var(--accent)' : '1.5px solid transparent', background: duckDrank || dolphinDrank ? 'var(--duck-soft)' : 'var(--card-alt)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isFuture ? 'default' : 'pointer', opacity: isFuture ? 0.4 : 1 }}
                      onClick={() => {
                        if (isFuture) return;
                        const myMember = actor === '창희' ? duckMember : dolphinMember;
                        void toggleDrink(myMember?.user_id, d);
                      }}
                    >
                      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 13, color: isToday ? 'var(--accent-deep)' : 'var(--ink)' }}>{d.getDate()}</div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {duckDrank && <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--duck-deep)' }} />}
                        {dolphinDrank && <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-deep)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, padding: '10px 4px 0', fontFamily: 'Gaegu, sans-serif', fontSize: 12, color: 'var(--ink-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--duck-deep)' }} /> 창희
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent-deep)' }} /> 하경
                </div>
              </div>
            </div>

            {/* Coach comment */}
            <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, marginTop: 12, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 15, marginBottom: 6 }}>💡 코치 한 마디</div>
              <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                이번 달 둘이 같이 마신 날이 {bothCount}일! 같이 마시는 게 훨씬 즐겁지만, 주 2회 이내로 유지해보자 🌊
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
