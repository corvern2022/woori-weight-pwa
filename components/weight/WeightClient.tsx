"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { BackBtn } from "@/components/ui";
import { WeightChart } from "@/components/WeightChart";
import { useWeights, type WeightEntry } from "./useWeights";
import type { ChartPoint } from "@/lib/types";
import { toSeoulISODate } from "@/lib/date";

type View = 'list' | 'entry';

export function WeightClient() {
  const router = useRouter();
  const { duckWeights, dolphinWeights, duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight } = useWeights();
  const [view, setView] = useState<View>('list');

  // ⚠️ useMemo MUST be before any conditional return (Rules of Hooks)
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

  if (view === 'entry') {
    return <WeightEntryForm
      duckEntries={duckEntries}
      dolphinEntries={dolphinEntries}
      onBack={() => setView('list')}
      onSave={async (who, kg, date) => { await addWeight(who, kg, date); setView('list'); }}
    />;
  }

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

function WeightEntryForm({
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
  const todayStr = toSeoulISODate(new Date());

  const lastKg = (w: 'duck' | 'dolphin') => {
    const e = w === 'duck' ? duckEntries : dolphinEntries;
    return e[e.length - 1]?.kg ?? 70;
  };

  const [who, setWho] = useState<'duck' | 'dolphin'>('duck');
  const [date, setDate] = useState(todayStr);
  const [rawInput, setRawInput] = useState(() => String(lastKg('duck')));
  const [val, setVal] = useState(() => lastKg('duck'));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleWhoChange = (w: 'duck' | 'dolphin') => {
    setWho(w);
    const lk = lastKg(w);
    setVal(lk);
    setRawInput(String(lk));
  };

  // Date preset buttons
  const setPreset = (preset: 'month' | 'yesterday' | 'today') => {
    const d = new Date();
    if (preset === 'month') d.setMonth(d.getMonth() - 1);
    else if (preset === 'yesterday') d.setDate(d.getDate() - 1);
    setDate(toSeoulISODate(d));
  };

  // Format date label
  const dateLabelFull = (() => {
    const d = new Date(date + 'T00:00:00');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
  })();

  // Weight input handlers
  const handleWeightInput = (v: string) => {
    setRawInput(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 20 && n <= 200) setVal(n);
  };
  const handleWeightBlur = () => {
    const n = parseFloat(rawInput);
    if (isNaN(n) || n < 20 || n > 200) {
      setRawInput(val.toFixed(1));
    } else {
      const clamped = +(Math.max(20, Math.min(200, n)).toFixed(1));
      setVal(clamped);
      setRawInput(String(clamped));
    }
  };

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await onSave(who, +(val.toFixed(1)), date);
    setSaveState('saved');
    setTimeout(() => onBack(), 1000);
  };

  const FOOTER_H = 88; // px — height of fixed footer

  const datePresets: { key: 'month' | 'yesterday' | 'today'; label: string }[] = [
    { key: 'month', label: '한달 전' },
    { key: 'yesterday', label: '어제' },
    { key: 'today', label: '오늘' },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 12px' }}>
        <BackBtn label="체중" onClick={onBack} />
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, letterSpacing: -0.5, marginTop: 6 }}>체중 기록 ⚖️</div>
      </div>

      <div style={{ padding: '0 18px', paddingBottom: 'calc(90px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ─ 누구 ─ */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>누구?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['duck', 'dolphin'] as const).map(w => (
              <button
                key={w}
                onClick={() => handleWhoChange(w)}
                style={{
                  flex: 1, minHeight: 52, borderRadius: 16, border: 'none',
                  background: who === w ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--card)',
                  color: who === w ? '#fff' : 'var(--ink)',
                  fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 17,
                  cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
                  transition: 'background 0.15s',
                }}
              >
                {w === 'duck' ? '🦆 창희' : '🐬 하경'}
              </button>
            ))}
          </div>
        </div>

        {/* ─ 날짜 ─ */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>날짜</div>

          {/* 네이티브 date input — 직접 수정 가능 */}
          <input
            type="date"
            value={date}
            max={todayStr}
            onChange={e => { if (e.target.value) setDate(e.target.value); }}
            className="date-input"
            style={{
              width: '100%', borderRadius: 16, border: '1.5px solid var(--border)',
              fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 16,
              padding: '0 16px', boxSizing: 'border-box', outline: 'none',
              marginBottom: 10,
            }}
          />

          {/* 3 preset buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {datePresets.map(({ key, label }) => {
              const isActive = (() => {
                if (key === 'today') return date === todayStr;
                if (key === 'yesterday') {
                  const yd = new Date(); yd.setDate(yd.getDate() - 1);
                  return date === toSeoulISODate(yd);
                }
                return false;
              })();
              return (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  style={{
                    flex: 1, minHeight: 46, borderRadius: 14, border: 'none',
                    background: isActive ? 'var(--accent-deep)' : 'var(--card)',
                    color: isActive ? '#fff' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
                    transition: 'background 0.15s, color 0.15s',
                    letterSpacing: -0.3,
                  }}
                >{label}</button>
              );
            })}
          </div>
        </div>

        {/* ─ 몸무게 ─ */}
        <div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>몸무게</div>
          <div style={{ background: 'var(--card)', borderRadius: 22, padding: '14px 16px', boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => { const next = +(Math.max(20, val - 0.1).toFixed(1)); setVal(next); setRawInput(String(next)); }}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 28, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300 }}
            >−</button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <input
                type="number"
                inputMode="decimal"
                value={rawInput}
                onChange={e => handleWeightInput(e.target.value)}
                onBlur={handleWeightBlur}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                min={20} max={200} step={0.1}
                style={{
                  width: 120, height: 64, textAlign: 'center',
                  border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-main)', fontWeight: 800,
                  fontSize: 46, color: 'var(--accent-deep)', letterSpacing: -2,
                  padding: 0, cursor: 'text',
                }}
              />
              <span style={{ fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 18, color: 'var(--ink-mute)', paddingTop: 16 }}>kg</span>
            </div>
            <button
              onClick={() => { const next = +(Math.min(200, val + 0.1).toFixed(1)); setVal(next); setRawInput(String(next)); }}
              style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--bg-deep)', color: 'var(--ink)', fontSize: 28, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300 }}
            >+</button>
          </div>
        </div>

        {/* ─ 저장 버튼 ─ */}
        <button
          onClick={handleSave}
          disabled={saveState !== 'idle'}
          style={{
            width: '100%', minHeight: 56, borderRadius: 20, border: 'none',
            background: saveState === 'saved'
              ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))'
              : 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 18,
            cursor: saveState !== 'idle' ? 'default' : 'pointer',
            opacity: saveState === 'saving' ? 0.75 : 1,
            boxShadow: saveState === 'saved'
              ? '0 6px 20px rgba(91,184,148,0.45)'
              : '0 6px 20px rgba(91,191,232,0.45)',
            transition: 'background 0.25s, box-shadow 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: -0.3,
          }}
        >
          {saveState === 'saving' && (
            <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          )}
          {saveState === 'saving' ? '저장 중...' : saveState === 'saved' ? '✅ 기록 완료!' : '저장하기'}
        </button>

      </div>
    </div>
  );
}
