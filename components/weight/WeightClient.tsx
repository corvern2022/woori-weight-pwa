"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { BackBtn } from "@/components/ui";
import { useWeights, WeightEntry as WeightData } from "./useWeights";

type View = 'list' | 'entry';
type WhoFilter = 'duck' | 'both' | 'dolphin';

export function WeightClient() {
  const router = useRouter();
  const { duckWeights, dolphinWeights, duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight } = useWeights();
  const [view, setView] = useState<View>('list');
  const [who, setWho] = useState<WhoFilter>('both');
  const [period, setPeriod] = useState<14 | 30>(30);

  if (view === 'entry') {
    return <WeightEntry
      duckWeights={duckWeights}
      dolphinWeights={dolphinWeights}
      onBack={() => setView('list')}
      onSave={async (who, kg, date) => { await addWeight(who, kg, date); setView('list'); }}
    />;
  }

  const W = 340, H = 180, P = 16;

  const duckSlice = (who === 'duck' || who === 'both') ? duckEntries.slice(-period) : [];
  const dolphinSlice = (who === 'dolphin' || who === 'both') ? dolphinEntries.slice(-period) : [];

  // For backward compat (weekly summary)
  const duckData = duckSlice.map(e => e.kg);
  const dolphinData = dolphinSlice.map(e => e.kg);

  const series: Series[] = [];
  if (duckData.length > 0) series.push({ entries: duckSlice, data: duckData, mn: Math.min(...duckData) - 0.3, mx: Math.max(...duckData) + 0.3, color: 'var(--duck-deep)', name: '창희', goal: duckGoal });
  if (dolphinData.length > 0) series.push({ entries: dolphinSlice, data: dolphinData, mn: Math.min(...dolphinData) - 0.3, mx: Math.max(...dolphinData) + 0.3, color: 'var(--accent-deep)', name: '하경', goal: dolphinGoal });

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 10px' }}>
        <BackBtn label="홈" onClick={() => router.push('/')} />
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 30, letterSpacing: -0.5, marginTop: 4 }}>체중</div>
      </div>

      {/* Segmented control */}
      <div style={{ padding: '4px 18px 12px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 100, padding: 4, display: 'flex', boxShadow: 'var(--shadow-soft)' }}>
          {([['duck', '🦆 창희'], ['both', '💞 같이'], ['dolphin', '🐬 하경']] as [WhoFilter, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setWho(v)}
              style={{
                flex: 1, border: 'none',
                background: who === v ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'transparent',
                borderRadius: 100, padding: '8px 0', cursor: 'pointer',
                fontFamily: 'Jua, sans-serif', fontSize: 14,
                color: who === v ? '#fff' : 'var(--ink-soft)',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--duck)', display: 'inline-block', animation: 'bounce 0.6s infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Today cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <TodayCard who="duck" weights={duckWeights} />
            <TodayCard who="dolphin" weights={dolphinWeights} />
          </div>

          {/* Period toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: 'var(--card)', borderRadius: 100, padding: 3, display: 'flex', boxShadow: 'var(--shadow-soft)' }}>
              {([14, 30] as (14 | 30)[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    border: 'none',
                    background: period === p ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'transparent',
                    borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
                    fontFamily: 'Jua, sans-serif', fontSize: 13,
                    color: period === p ? '#fff' : 'var(--ink-soft)',
                  }}
                >{p === 14 ? '2주' : '1달'}</button>
              ))}
            </div>
          </div>

          {/* Line chart - always one combined chart */}
          {series.length > 0 && (
            <CombinedChart series={series} W={W} H={H} P={P} />
          )}

          {/* Weekly summary */}
          <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16, marginBottom: 10 }}>주간 요약</div>
            {series.map((s, i) => {
              const avg = (s.data.reduce((a, b) => a + b, 0) / s.data.length).toFixed(1);
              const delta = (s.data[s.data.length - 1] - s.data[0]).toFixed(1);
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                  {s.name === '창희'
                    ? <Duck size={28} variant="head" palette="yellow" />
                    : <Dolphin size={28} variant="head" palette="blue" />
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-soft)' }}>평균 {avg}kg</div>
                  </div>
                  <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16, color: +delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)' }}>
                    {+delta < 0 ? '↓' : '↑'} {Math.abs(+delta)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setView('entry')}
        style={{
          position: 'fixed', bottom: 28, right: 22,
          padding: '14px 18px', borderRadius: 28, border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          color: '#fff', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(99,163,253,0.46)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Jua, sans-serif', fontSize: 15, zIndex: 5,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
          <path d="M9 3v12M3 9h12" />
        </svg>
        오늘 기록
      </button>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff', fontSize: 14, borderRadius: 100, padding: '8px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 50, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function TodayCard({ who, weights }: { who: 'duck' | 'dolphin'; weights: number[] }) {
  if (weights.length === 0) {
    const bg = who === 'duck' ? 'var(--duck-soft)' : 'var(--dolphin-soft)';
    const col = who === 'duck' ? 'var(--duck-deep)' : 'var(--accent-deep)';
    const border = who === 'duck' ? 'var(--duck-soft)' : 'var(--dolphin-soft)';
    return (
      <div style={{ flex: 1, background: `linear-gradient(160deg, ${bg}, var(--card))`, borderRadius: 22, padding: 14, boxShadow: 'var(--shadow-soft)', border: `1.5px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {who === 'duck' ? <Duck size={28} variant="head" palette="yellow" /> : <Dolphin size={28} variant="head" palette="blue" />}
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 13 }}>{who === 'duck' ? '창희' : '하경'}</div>
        </div>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 22, color: col }}>-</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'Gaegu, cursive' }}>기록 없음</div>
      </div>
    );
  }
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2] ?? last;
  const delta = (last - prev).toFixed(1);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        {who === 'duck'
          ? <Duck size={28} variant="head" palette="yellow" />
          : <Dolphin size={28} variant="head" palette="blue" />
        }
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 13 }}>{who === 'duck' ? '창희' : '하경'}</div>
      </div>
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 26, color: col, letterSpacing: -0.5 }}>
        {last}<span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>kg</span>
      </div>
      <div style={{ fontSize: 12, color: +delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)', fontFamily: 'Gaegu, cursive' }}>
        {+delta < 0 ? '↓' : '↑'} {Math.abs(+delta)}
      </div>
    </div>
  );
}

type Series = { entries: WeightData[]; data: number[]; mn: number; mx: number; color: string; name: string; goal: number | null };

function CombinedChart({ series, W, H, P }: { series: Series[]; W: number; H: number; P: number }) {
  // Collect all dates across all series, sorted
  const allDates = Array.from(new Set(series.flatMap(s => s.entries.map(e => e.date)))).sort();
  if (allDates.length === 0) return null;

  // Unified Y range
  const allKg = series.flatMap(s => s.data);
  const globalMn = Math.min(...allKg) - 0.5;
  const globalMx = Math.max(...allKg) + 0.5;
  const range = globalMx - globalMn || 1;

  const BOTTOM = 22; // space for date labels
  const chartH = H - BOTTOM;
  const xOf = (dateStr: string) => {
    const i = allDates.indexOf(dateStr);
    return allDates.length <= 1 ? W / 2 : P + (i * (W - P * 2)) / (allDates.length - 1);
  };
  const y = (v: number) => P + 10 + ((globalMx - v) / range) * (chartH - P - 10);

  // Pick ~4 date labels to show on X axis
  const labelIdxs = allDates.length <= 4
    ? allDates.map((_, i) => i)
    : [0, Math.floor(allDates.length / 3), Math.floor((allDates.length * 2) / 3), allDates.length - 1];
  const uniqueLabelIdxs = Array.from(new Set(labelIdxs));

  return (
    <div style={{ background: 'var(--card)', borderRadius: 22, padding: '14px 12px 10px', boxShadow: 'var(--shadow-soft)' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, paddingLeft: 4 }}>
        {series.map(s => {
          const last = s.data[s.data.length - 1];
          const delta = +(last - s.data[0]).toFixed(1);
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
              <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 13, color: s.color }}>{s.name}</span>
              <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 12, color: delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)' }}>
                {delta < 0 ? '↓' : '↑'}{Math.abs(delta)}
              </span>
            </div>
          );
        })}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          {series.map((s, idx) => (
            <linearGradient key={idx} id={`cc-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(t => {
          const yv = P + 10 + t * (chartH - P - 10);
          const kg = (globalMx - t * range).toFixed(1);
          return (
            <g key={t}>
              <line x1={P} y1={yv} x2={W - P} y2={yv} stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.5" />
              <text x={P - 2} y={yv + 3} fontSize="8" fontFamily="Jua" fill="var(--ink-soft)" textAnchor="end" opacity="0.6">{kg}</text>
            </g>
          );
        })}

        {/* Date X-axis labels */}
        {uniqueLabelIdxs.map(i => {
          const d = allDates[i];
          const xv = xOf(d);
          const label = `${parseInt(d.slice(5, 7))}/${parseInt(d.slice(8, 10))}`;
          return (
            <text key={d} x={xv} y={H - 4} fontSize="9" fontFamily="Jua" fill="var(--ink-soft)" textAnchor="middle" opacity="0.7">{label}</text>
          );
        })}

        {/* Each series */}
        {series.map((s, idx) => {
          const pts = s.entries.map(e => ({ x: xOf(e.date), y: y(e.kg), kg: e.kg, date: e.date }));
          if (pts.length === 0) return null;
          const linePath = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
          const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${chartH} L ${pts[0].x} ${chartH} Z`;
          const last = pts[pts.length - 1];
          return (
            <g key={idx}>
              <path d={areaPath} fill={`url(#cc-grad-${idx})`} />
              <path d={linePath} stroke={s.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 2.2} fill={s.color} stroke="var(--card)" strokeWidth={i === pts.length - 1 ? 2 : 1} />
              ))}
              {/* Latest value label */}
              <text x={last.x} y={last.y - 8} fontSize="10" fontFamily="Jua" fill={s.color} textAnchor="middle">{last.kg}kg</text>
              {/* Goal line */}
              {s.goal !== null && s.goal >= globalMn && s.goal <= globalMx && (
                <>
                  <line x1={P} y1={y(s.goal)} x2={W - P} y2={y(s.goal)} stroke={s.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                  <text x={W - P - 2} y={y(s.goal) - 3} fontSize="9" fontFamily="Jua" fill={s.color} opacity="0.7" textAnchor="end">목표</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function WeightEntry({
  duckWeights,
  dolphinWeights,
  onBack,
  onSave,
}: {
  duckWeights: number[];
  dolphinWeights: number[];
  onBack: () => void;
  onSave: (who: 'duck' | 'dolphin', kg: number, date: string) => Promise<void>;
}) {
  const actorName = typeof window !== 'undefined' ? (localStorage.getItem('ori_ranger_actor') ?? '') : '';
  const isChang = actorName === '창희';
  const todayStr = new Date().toISOString().slice(0, 10);
  const [who, setWho] = useState<'duck' | 'dolphin'>(actorName === '창희' ? 'duck' : 'dolphin');
  const current = (who === 'duck' ? duckWeights[duckWeights.length - 1] : dolphinWeights[dolphinWeights.length - 1]) ?? 60;
  const [val, setVal] = useState(current);
  const [date, setDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);

  // suppress unused warning
  void isChang; void setWho;

  const step = (d: number) => setVal(v => Math.max(20, Math.min(200, +(v + d).toFixed(1))));

  const handleSave = async () => {
    setSaving(true);
    await onSave(who, +val.toFixed(1), date);
    setSaving(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 22px 14px' }}>
        <BackBtn label="체중" onClick={onBack} />
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 26, letterSpacing: -0.5, marginTop: 6 }}>체중 기록 ⚖️</div>
      </div>

      {/* Date picker */}
      <div style={{ padding: '0 18px', marginBottom: 12 }}>
        <div style={{ background: 'var(--card)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-soft)' }}>
          <span style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: 'var(--ink-soft)' }}>📅 날짜</span>
          <input
            type="date"
            value={date}
            max={todayStr}
            onChange={e => setDate(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'Jua, sans-serif', fontSize: 14, color: 'var(--ink)', outline: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 본인 것만 수정 가능 */}
      <div style={{ padding: '0 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        {actorName === '창희'
          ? <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16, color: 'var(--duck-deep)' }}>🦆 창희의 체중</div>
          : <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16, color: 'var(--accent-deep)' }}>🐬 하경의 체중</div>
        }
      </div>

      {/* Character + number picker */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }}>
        <div style={{ transform: who === 'duck' ? 'rotate(-4deg)' : 'rotate(6deg)', marginBottom: 14 }}>
          {who === 'duck'
            ? <Duck size={110} variant="strong" palette="yellow" />
            : <Dolphin size={110} variant="happy" palette="blue" />
          }
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={() => step(-0.1)} style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', fontFamily: 'Jua, sans-serif', fontSize: 28, color: 'var(--ink-soft)' }}>−</button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <input
              type="number"
              value={val}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v) && v >= 20 && v <= 200) setVal(+v.toFixed(1))
              }}
              step="0.1"
              min="20"
              max="200"
              style={{
                fontFamily: 'Jua, sans-serif',
                fontSize: 72,
                color: 'var(--accent-deep)',
                lineHeight: 1,
                width: 180,
                border: 'none',
                borderBottom: '3px solid var(--accent)',
                background: 'transparent',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: -2,
              }}
            />
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 22, color: 'var(--ink-soft)' }}>kg</div>
          </div>
          <button onClick={() => step(0.1)} style={{ width: 54, height: 54, borderRadius: 27, border: 'none', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', fontFamily: 'Jua, sans-serif', fontSize: 28, color: 'var(--ink-soft)' }}>＋</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {([-1, -0.5, 0.5, 1] as number[]).map(d => (
            <button key={d} onClick={() => step(d)} style={{ padding: '6px 12px', border: 'none', borderRadius: 100, background: 'var(--card-alt)', color: 'var(--ink-soft)', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>
              {d > 0 ? '+' : ''}{d}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ padding: '0 18px 44px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px 0', border: 'none', borderRadius: 20, cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 17,
            boxShadow: '0 6px 20px rgba(99,163,253,0.4)',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? '저장 중...' : '기록하기 🎉'}
        </button>
      </div>
    </div>
  );
}
