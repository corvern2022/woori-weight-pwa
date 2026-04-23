"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Duck } from "@/components/characters/Duck";
import { Dolphin } from "@/components/characters/Dolphin";
import { BackBtn } from "@/components/ui";
import { useWeights } from "./useWeights";

type View = 'list' | 'entry';
type WhoFilter = 'duck' | 'both' | 'dolphin';

export function WeightClient() {
  const router = useRouter();
  const { duckWeights, dolphinWeights, duckGoal, dolphinGoal, loading, toast, addWeight } = useWeights();
  const [view, setView] = useState<View>('list');
  const [who, setWho] = useState<WhoFilter>('both');

  if (view === 'entry') {
    return <WeightEntry
      duckWeights={duckWeights}
      dolphinWeights={dolphinWeights}
      onBack={() => setView('list')}
      onSave={async (who, kg, date) => { await addWeight(who, kg, date); setView('list'); }}
    />;
  }

  const W = 320, H = 160, P = 14;

  const series: Series[] = [];
  if (who === 'duck' || who === 'both') {
    const data = duckWeights;
    if (data.length > 0) series.push({ data, mn: Math.min(...data) - 0.3, mx: Math.max(...data) + 0.3, color: 'var(--duck-deep)', name: '창희', goal: duckGoal });
  }
  if (who === 'dolphin' || who === 'both') {
    const data = dolphinWeights;
    if (data.length > 0) series.push({ data, mn: Math.min(...data) - 0.3, mx: Math.max(...data) + 0.3, color: 'var(--accent-deep)', name: '하경', goal: dolphinGoal });
  }

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

          {/* Line chart */}
          {who === 'both' ? (
            // 같이 모드: 두 사람 각자 미니 차트
            <div style={{ display: 'flex', gap: 10 }}>
              {series.map((s, idx) => (
                <MiniChart key={idx} s={s} W={W} H={130} P={P} gradId={`grad-w-${idx}`} />
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--card)', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16 }}>
                  {`${who === 'duck' ? '창희' : '하경'} · 2주`}
                </div>
                <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-soft)' }}>14일</div>
              </div>
              {series.map((s, idx) => (
                <svg key={idx} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id={`grad-w-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const x = (i: number) => s.data.length <= 1 ? W / 2 : P + (i * (W - P * 2)) / (s.data.length - 1);
                    const range = s.mx - s.mn || 1;
                    const y = (v: number) => P + 14 + ((s.mx - v) / range) * (H - P * 2 - 24);
                    const linePath = s.data.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
                    const areaPath = `${linePath} L ${x(s.data.length - 1)} ${H - P} L ${P} ${H - P} Z`;
                    return (
                      <g>
                        <path d={areaPath} fill={`url(#grad-w-${idx})`} />
                        <path d={linePath} stroke={s.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {s.data.map((v, i) => (
                          <circle key={i} cx={x(i)} cy={y(v)} r={i === s.data.length - 1 ? 4.5 : 2.2} fill={s.color} stroke="var(--card)" strokeWidth={i === s.data.length - 1 ? 2 : 1} />
                        ))}
                        <text x={x(s.data.length - 1) + 8} y={y(s.data[s.data.length - 1]) + 4} fontSize="11" fontFamily="Jua" fill={s.color}>{s.name}</text>
                        {s.goal !== null && s.goal >= s.mn && s.goal <= s.mx && (
                          <>
                            <line x1={P} y1={y(s.goal)} x2={W - P} y2={y(s.goal)} stroke={s.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
                            <text x={P + 2} y={y(s.goal) - 3} fontSize="10" fontFamily="Jua" fill={s.color} opacity="0.7">목표</text>
                          </>
                        )}
                      </g>
                    );
                  })()}
                </svg>
              ))}
            </div>
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

type Series = { data: number[]; mn: number; mx: number; color: string; name: string; goal: number | null };

function MiniChart({ s, W, H, P, gradId }: { s: Series; W: number; H: number; P: number; gradId: string }) {
  const x = (i: number) => s.data.length <= 1 ? W / 2 : P + (i * (W - P * 2)) / (s.data.length - 1);
  const range = s.mx - s.mn || 1;
  const y = (v: number) => P + 14 + ((s.mx - v) / range) * (H - P * 2 - 24);
  const linePath = s.data.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  const areaPath = `${linePath} L ${x(s.data.length - 1)} ${H - P} L ${P} ${H - P} Z`;
  const last = s.data[s.data.length - 1];
  const delta = +(last - s.data[0]).toFixed(1);

  return (
    <div style={{ flex: 1, background: 'var(--card)', borderRadius: 20, padding: '12px 12px 8px', boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: s.color }}>{s.name}</div>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 12, color: delta < 0 ? 'var(--mint-deep)' : 'var(--peach-deep)' }}>
          {delta < 0 ? '↓' : '↑'}{Math.abs(delta)}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} stroke={s.color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {s.data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === s.data.length - 1 ? 4 : 2} fill={s.color} stroke="var(--card)" strokeWidth={i === s.data.length - 1 ? 2 : 1} />
        ))}
        {/* 최신값 레이블 */}
        <text x={x(s.data.length - 1)} y={y(last) - 7} fontSize="10" fontFamily="Jua" fill={s.color} textAnchor="middle">{last}kg</text>
        {s.goal !== null && s.goal >= s.mn && s.goal <= s.mx && (
          <>
            <line x1={P} y1={y(s.goal)} x2={W - P} y2={y(s.goal)} stroke={s.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
            <text x={P + 2} y={y(s.goal) - 3} fontSize="9" fontFamily="Jua" fill={s.color} opacity="0.7">목표</text>
          </>
        )}
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const [who, setWho] = useState<'duck' | 'dolphin'>('duck');
  const current = who === 'duck' ? duckWeights[duckWeights.length - 1] : dolphinWeights[dolphinWeights.length - 1];
  const [val, setVal] = useState(current);
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

      {/* Who toggle */}
      <div style={{ padding: '0 18px', display: 'flex', gap: 8, marginBottom: 18 }}>
        {([['duck', '🦆 창희'], ['dolphin', '🐬 하경']] as ['duck' | 'dolphin', string][]).map(([v, l]) => (
          <button
            key={v}
            onClick={() => {
              setWho(v);
              setVal(v === 'duck' ? duckWeights[duckWeights.length - 1] : dolphinWeights[dolphinWeights.length - 1]);
            }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 14, cursor: 'pointer',
              background: who === v ? (v === 'duck' ? 'var(--duck)' : 'var(--dolphin)') : 'var(--card)',
              color: who === v && v === 'dolphin' ? '#fff' : 'var(--ink)',
              fontFamily: 'Jua, sans-serif', fontSize: 14, boxShadow: 'var(--shadow-soft)',
            }}
          >{l}</button>
        ))}
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
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 84, letterSpacing: -2, color: 'var(--accent-deep)', lineHeight: 1 }}>{val.toFixed(1)}</div>
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
