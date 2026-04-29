"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { BackBtn } from "@/components/ui";
import { WeightChart } from "@/components/WeightChart";
import { useWeights, type WeightEntry } from "./useWeights";
import type { ChartPoint } from "@/lib/types";

type View = 'list' | 'entry';

export function WeightClient() {
  const router = useRouter();
  const { duckWeights, dolphinWeights, duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight } = useWeights();
  const [view, setView] = useState<View>('list');

  if (view === 'entry') {
    return <WeightEntry
      duckEntries={duckEntries}
      dolphinEntries={dolphinEntries}
      onBack={() => setView('list')}
      onSave={async (who, kg, date) => { await addWeight(who, kg, date); setView('list'); }}
    />;
  }

  // Build unified ChartPoint[] from both entries (date union)
  const chartData = useMemo((): ChartPoint[] => {
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

  void duckGoal; void dolphinGoal; // reserved for future goal line

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 10px' }}>
        <BackBtn label="홈" onClick={() => router.push('/')} />
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 28, letterSpacing: -0.5, marginTop: 4 }}>체중</div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--duck)', display: 'inline-block', animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Today cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <TodayCard who="duck" entries={duckEntries} />
            <TodayCard who="dolphin" entries={dolphinEntries} />
          </div>

          {/* Unified chart */}
          <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              최근 30일 체중
            </div>
            {chartData.length > 0 ? (
              <WeightChart data={chartData} showPartner meLabel="창희" partnerLabel="하경" />
            ) : (
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--font-main)', fontSize: 14 }}>
                기록이 없어요
              </div>
            )}
          </div>

          {/* Weekly summary */}
          {(duckWeights.length > 0 || dolphinWeights.length > 0) && (
            <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>주간 요약</div>
              {[
                { weights: duckWeights, name: '창희', color: 'var(--duck-deep)', iDuck: true },
                { weights: dolphinWeights, name: '하경', color: 'var(--accent-deep)', iDuck: false },
              ].filter(s => s.weights.length > 0).map((s, i) => {
                const avg = (s.weights.reduce((a, b) => a + b, 0) / s.weights.length).toFixed(1);
                const delta = (s.weights[s.weights.length - 1] - s.weights[0]).toFixed(1);
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                    {s.iDuck
                      ? <Duck size={28} variant="head" palette="yellow" />
                      : <Dolphin size={28} variant="head" palette="blue" />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-soft)' }}>평균 {avg}kg</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16, color: +delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)' }}>
                      {+delta < 0 ? '↓' : '↑'} {Math.abs(+delta)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff', fontSize: 14, borderRadius: 100, padding: '8px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 50, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function TodayCard({ who, entries }: { who: 'duck' | 'dolphin'; entries: WeightEntry[] }) {
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2]?.kg ?? null;
  const delta = latest && prev != null ? (latest.kg - prev) : null;
  const bg = who === 'duck' ? 'var(--duck-soft)' : 'var(--dolphin-soft)';
  const col = who === 'duck' ? 'var(--duck-deep)' : 'var(--accent-deep)';
  const border = who === 'duck' ? 'var(--duck-soft)' : 'var(--dolphin-soft)';

  return (
    <div style={{
      flex: 1,
      background: `linear-gradient(160deg, ${bg}, var(--card))`,
      borderRadius: 22, padding: 14,
      boxShadow: 'var(--shadow-soft)',
      border: `1.5px solid ${border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {who === 'duck'
          ? <Duck size={24} variant="head" palette="yellow" />
          : <Dolphin size={24} variant="head" palette="blue" />
        }
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13 }}>{who === 'duck' ? '창희' : '하경'}</div>
      </div>
      {latest ? (
        <>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: col, letterSpacing: -0.5 }}>
            {latest.kg}<span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>kg</span>
          </div>
          {delta !== null && (
            <div style={{ fontSize: 12, color: delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)', fontFamily: 'var(--font-main)', fontWeight: 700 }}>
              {delta < 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-main)', marginTop: 2 }}>
            {latest.date.slice(5).replace('-', '/')}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: col }}>-</div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'var(--font-main)' }}>기록 없음</div>
        </>
      )}
    </div>
  );
}

function WeightEntry({
  duckEntries,
  dolphinEntries,
  onBack,
  onSave,
}: {
  duckEntries: WeightEntry[];
  dolphinEntries: WeightEntry[];
  onBack: () => void;
  onSave: (who: 'duck' | 'dolphin', kg: number, date: string) => Promise<void>;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [who, setWho] = useState<'duck' | 'dolphin'>('duck');
  const lastKg = (w: 'duck' | 'dolphin') => {
    const e = w === 'duck' ? duckEntries : dolphinEntries;
    return e[e.length - 1]?.kg ?? 70;
  };
  const [val, setVal] = useState(lastKg('duck'));
  const [date, setDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);

  const step = (d: number) => setVal(v => Math.max(20, Math.min(200, +(v + d).toFixed(1))));

  const handleSave = async () => {
    setSaving(true);
    await onSave(who, +val.toFixed(1), date);
    setSaving(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 22px 16px' }}>
        <BackBtn label="체중" onClick={onBack} />
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, letterSpacing: -0.5, marginTop: 6 }}>체중 기록 ⚖️</div>
      </div>

      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Who */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>누구?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['duck', 'dolphin'] as const).map(w => (
              <button
                key={w}
                onClick={() => { setWho(w); setVal(lastKg(w)); }}
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

        {/* Date */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>날짜</div>
          <input
            type="date"
            value={date}
            max={todayStr}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', minHeight: 52, borderRadius: 16, border: '2px solid var(--border)',
              background: 'var(--card)', color: 'var(--ink)',
              fontFamily: 'var(--font-main)', fontSize: 16, padding: '0 16px',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Weight picker */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>몸무게 (kg)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--card)', borderRadius: 22, padding: '12px 20px', boxShadow: 'var(--shadow-soft)' }}>
            <button
              onClick={() => step(-0.1)}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 26, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >−</button>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 40, color: 'var(--accent-deep)', letterSpacing: -1 }}>
              {val.toFixed(1)}
            </div>
            <button
              onClick={() => step(0.1)}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 26, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >+</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {([-1, -0.5, +0.5, +1] as number[]).map(d => (
              <button
                key={d}
                onClick={() => step(d)}
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

      {/* Save button */}
      <div style={{ padding: '20px 18px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', minHeight: 56, borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 18,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            boxShadow: '0 6px 20px rgba(99,163,253,0.4)',
          }}
        >{saving ? '저장 중...' : '저장하기 🎉'}</button>
      </div>
    </div>
  );
}
