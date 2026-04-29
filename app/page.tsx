'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Duck } from '@/components/characters/Duck'
import { Dolphin } from '@/components/characters/Dolphin'
import { getSupabaseClient } from '@/lib/supabase'
import { useWeather } from '@/lib/useWeather'
import { usePush } from '@/lib/usePush'

const MOODS: { emoji: string; label: string; color: string; bg: string }[] = [
  { emoji: '😊', label: '행복해',    color: '#D97706', bg: '#FEF3C7' },
  { emoji: '🥰', label: '설레',      color: '#DB2777', bg: '#FCE7F3' },
  { emoji: '🔥', label: '의욕넘쳐',  color: '#EA580C', bg: '#FFEDD5' },
  { emoji: '😎', label: '여유로워',  color: '#0369A1', bg: '#E0F2FE' },
  { emoji: '😌', label: '평온해',    color: '#059669', bg: '#D1FAE5' },
  { emoji: '🥱', label: '피곤해',    color: '#6B7280', bg: '#F3F4F6' },
  { emoji: '😤', label: '스트레스',  color: '#DC2626', bg: '#FEE2E2' },
  { emoji: '🥺', label: '우울해',    color: '#7C3AED', bg: '#EDE9FE' },
  { emoji: '💪', label: '힘차',      color: '#D97706', bg: '#FEF9C3' },
  { emoji: '🫶', label: '사랑해',    color: '#BE185D', bg: '#FDF2F8' },
]

type MoodState = { emoji: string; text: string; updated_at: string } | null

// ── OnboardingScreen ─────────────────────────────────────────────────────────
function OnboardingScreen({ onSelect }: { onSelect: (who: '창희' | '하경') => void }) {
  return (
    <div style={{
      minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 24px',
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>
        오리 레인저
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 16, color: 'var(--ink-mute)', marginBottom: 48, textAlign: 'center' }}>
        나는 누구인가요?
      </div>
      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 340 }}>
        {([
          { who: '창희', char: <Duck size={90} variant="strong" palette="yellow" />, color: 'var(--duck-deep)' },
          { who: '하경', char: <Dolphin size={90} variant="happy" palette="blue" />, color: 'var(--accent-deep)' },
        ] as const).map(({ who, char, color }) => (
          <button key={who} onClick={() => onSelect(who)} style={{
            flex: 1, background: 'var(--card)', border: '2.5px solid transparent', borderRadius: 28,
            padding: '28px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10, boxShadow: 'var(--shadow)',
          }}>
            {char}
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 20, color }}>{who}</div>
          </button>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-mute)', marginTop: 32, textAlign: 'center' }}>
        한 번만 선택하면 기억할게요 💾
      </div>
    </div>
  )
}

// ── Weather effect ────────────────────────────────────────────────────────────
type WeatherType = 'sunny' | 'rain' | 'snow' | 'thunder' | 'none'

function getWeatherType(label: string): WeatherType {
  if (label === '맑음') return 'sunny'
  if (label.includes('눈')) return 'snow'
  if (label === '천둥번개') return 'thunder'
  if (label.includes('비') || label === '소나기' || label === '이슬비') return 'rain'
  return 'none'
}

const RAIN_DROPS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.6 + 2) % 100}%`,
  delay: `${((i * 137) % 900) / 1000}s`,
  duration: `${(420 + (i * 71) % 240) / 1000}s`,
  height: 14 + (i % 5) * 3,
}))

const SNOW_FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 3.6 + 1.5) % 100}%`,
  size: 4 + (i % 4),
  delay: `${((i * 211) % 3200) / 1000}s`,
  duration: `${(2400 + (i * 137) % 2000) / 1000}s`,
}))

function WeatherEffect({ type }: { type: WeatherType }) {
  if (type === 'none') return null

  if (type === 'sunny') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,0,0.22) 0%, rgba(255,190,0,0.06) 55%, transparent 70%)',
          animation: 'sunGlow 4s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', top: 16, right: 18, width: 44, height: 44 }}>
          <div style={{ position: 'absolute', top: -18, left: -18, right: -18, bottom: -18, animation: 'rayRotate 20s linear infinite' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <div key={deg} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 13, height: 2.5, marginTop: -1.25,
                borderRadius: 2, background: 'rgba(255,205,0,0.6)',
                transform: `rotate(${deg}deg) translateX(28px)`, transformOrigin: '0 50%',
              }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFDE7, #FFD740)',
            boxShadow: '0 0 0 4px rgba(255,220,0,0.16), 0 0 20px rgba(255,200,0,0.38)',
            animation: 'sunGlow 4s ease-in-out infinite',
          }} />
        </div>
      </div>
    )
  }

  if (type === 'rain' || type === 'thunder') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: type === 'thunder'
            ? 'linear-gradient(180deg, rgba(50,60,115,0.16) 0%, transparent 65%)'
            : 'linear-gradient(180deg, rgba(80,115,155,0.10) 0%, transparent 60%)',
        }} />
        {RAIN_DROPS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.left, top: -20,
            width: type === 'thunder' ? 2.5 : 1.8, height: d.height,
            borderRadius: 1,
            background: type === 'thunder' ? 'rgba(150,190,255,0.76)' : 'rgba(100,175,255,0.62)',
            animationName: 'rainFall', animationDuration: d.duration,
            animationDelay: d.delay, animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }} />
        ))}
        {type === 'thunder' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(210,225,255,0.92)',
            animation: 'lightningFlash 3.8s 1.2s linear infinite',
          }} />
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(200,220,255,0.08) 0%, transparent 55%)',
      }} />
      {SNOW_FLAKES.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', left: f.left, top: -10,
          width: f.size, height: f.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.93)',
          boxShadow: `0 0 ${f.size + 2}px rgba(200,230,255,0.75)`,
          animationName: 'snowFall', animationDuration: `${f.duration}s`,
          animationDelay: `${f.delay}s`, animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
  )
}

// ── Stat chip (compact info pill) ────────────────────────────────────────────
function StatChip({
  label, value, sub, accent, onClick,
}: {
  label: string; value: string | number; sub?: string; accent: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, background: 'var(--card)', borderRadius: 20,
      padding: '14px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
      boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden',
    }}>
      {/* accent glow strip at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: '20px 20px 0 0', opacity: 0.7,
      }} />
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: 0.3, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: accent, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 3 }}>{sub}</div>}
    </button>
  )
}

// ── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [actor, setActor] = useState<string | null>(null)
  const [openCount, setOpenCount] = useState(0)
  const [duckKg, setDuckKg] = useState<number | null>(null)
  const [dolphinKg, setDolphinKg] = useState<number | null>(null)
  const [duckMood, setDuckMood] = useState<MoodState>(null)
  const [dolphinMood, setDolphinMood] = useState<MoodState>(null)
  const [moodModal, setMoodModal] = useState(false)
  const [moodTarget, setMoodTarget] = useState<'duck' | 'dolphin'>('duck')
  const [moodDraft, setMoodDraft] = useState('')
  const [moodEmoji, setMoodEmoji] = useState('😊')
  const [pushUserId, setPushUserId] = useState<string | null>(null)
  usePush(pushUserId)
  const weather = useWeather()

  useEffect(() => {
    const saved = localStorage.getItem('ori_ranger_actor')
    setActor(saved ?? '')
    setPushUserId(localStorage.getItem('woori_weight_user_id'))
  }, [])

  const loadMoods = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data } = await supabase.from('app_config').select('key, value').in('key', ['mood_duck', 'mood_dolphin'])
    if (!data) return
    data.forEach((row: { key: string; value: MoodState }) => {
      if (row.key === 'mood_duck') setDuckMood(row.value)
      if (row.key === 'mood_dolphin') setDolphinMood(row.value)
    })
  }, [])

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.from('tasks').select('id', { count: 'exact' }).eq('completed', false)
      .then(({ count }) => setOpenCount(count ?? 0))
    supabase.from('household_members').select('user_id, display_name').then(({ data: members }) => {
      if (!members) return
      members.forEach(async (m: { user_id: string; display_name: string }) => {
        const { data } = await supabase
          .from('weigh_ins').select('weight_kg')
          .eq('user_id', m.user_id).order('date', { ascending: false }).limit(1)
        const kg = data?.[0]?.weight_kg ?? null
        if (m.display_name === '창희') setDuckKg(kg)
        else setDolphinKg(kg)
      })
    })
    loadMoods()
  }, [loadMoods])

  async function saveMood() {
    const key = moodTarget === 'duck' ? 'mood_duck' : 'mood_dolphin'
    const moodLabel = MOODS.find(m => m.emoji === moodEmoji)?.label ?? ''
    const value: MoodState = { emoji: moodEmoji, text: moodDraft.trim() || moodLabel, updated_at: new Date().toISOString() }
    await getSupabaseClient().from('app_config').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    if (moodTarget === 'duck') setDuckMood(value)
    else setDolphinMood(value)
    setMoodModal(false)
    setMoodDraft('')
    setMoodEmoji('😊')
  }

  function handleOnboardingSelect(who: '창희' | '하경') {
    localStorage.setItem('ori_ranger_actor', who)
    setActor(who)
  }

  if (actor === null) return null
  if (actor === '') return <OnboardingScreen onSelect={handleOnboardingSelect} />

  const dDay = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date('2023-07-08').setHours(0, 0, 0, 0)) / 86400000)
  const now = new Date()
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 (${['일','월','화','수','목','금','토'][now.getDay()]})`
  const weatherType = getWeatherType(weather.label)

  return (
    <div style={{
      width: '100%', height: '100svh',
      background: 'var(--bg)',
      color: 'var(--ink)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 12px', flexShrink: 0, position: 'relative', zIndex: 3 }}>
        {/* Top row: date/weather left, D+N right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-soft)' }}>
            <span>{dateLabel}</span>
            {weather.label && weather.label !== '날씨 확인 중' && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{weather.emoji}</span>
                <span>{weather.label}</span>
                {weather.temp !== null && (
                  <span style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>{weather.temp}°</span>
                )}
              </>
            )}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--peach), var(--pink))',
            borderRadius: 100, padding: '4px 14px',
            fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 14,
            color: '#fff', boxShadow: 'var(--shadow-soft)', letterSpacing: -0.3,
          }}>
            💞 D+{dDay}
          </div>
        </div>

        {/* Greeting */}
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, lineHeight: 1.2 }}>
          오늘도 같이 파이팅! 🦆🐬
        </div>

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <StatChip
            label="📋 할 일"
            value={openCount === 0 ? '🎉' : openCount}
            sub={openCount === 0 ? '모두 완료!' : `${openCount}개 남음`}
            accent="var(--peach-deep)"
            onClick={() => router.push('/tasks')}
          />
          <StatChip
            label="⚖️ 체중"
            value={duckKg !== null ? `${duckKg}` : '-'}
            sub={
              duckKg !== null && dolphinKg !== null
                ? `창희 ${duckKg}kg · 하경 ${dolphinKg}kg`
                : duckKg !== null ? `창희 ${duckKg}kg`
                : dolphinKg !== null ? `하경 ${dolphinKg}kg`
                : '기록 없음'
            }
            accent="var(--accent-deep)"
            onClick={() => router.push('/weight')}
          />
        </div>
      </div>

      {/* ── Character zone ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Weather overlay */}
        <WeatherEffect type={weatherType} />

        {/* Ambient gradient background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 55%, var(--accent-soft) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Water shimmer at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(180deg, transparent 0%, var(--accent-soft) 100%)',
          borderRadius: '60% 60% 0 0 / 30% 30% 0 0',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Duck — left side */}
        <div style={{
          position: 'absolute', left: '6%', bottom: '18%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2,
        }}>
          {/* Mood bubble */}
          {duckMood ? (
            <div style={{
              background: 'var(--duck-soft)', border: '1.5px solid var(--duck)',
              borderRadius: '16px 16px 16px 4px', padding: '6px 12px',
              fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--duck-deep)',
              maxWidth: 110, wordBreak: 'keep-all', lineHeight: 1.4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {duckMood.emoji} {duckMood.text}
            </div>
          ) : (
            <div style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '16px 16px 16px 4px', padding: '5px 10px',
              fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)',
            }}>
              기분 어때?
            </div>
          )}
          <button
            onClick={() => { setMoodTarget('duck'); setMoodModal(true) }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'bobY 3.5s ease-in-out infinite', display: 'block' }}
          >
            <Duck size={120} variant="strong" palette="yellow" />
          </button>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 12, color: 'var(--duck-deep)' }}>창희</div>
        </div>

        {/* Dolphin — right side */}
        <div style={{
          position: 'absolute', right: '6%', bottom: '18%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2,
        }}>
          {dolphinMood ? (
            <div style={{
              background: 'var(--dolphin-soft)', border: '1.5px solid var(--dolphin)',
              borderRadius: '16px 16px 4px 16px', padding: '6px 12px',
              fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--accent-deep)',
              maxWidth: 110, wordBreak: 'keep-all', lineHeight: 1.4, textAlign: 'right',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {dolphinMood.emoji} {dolphinMood.text}
            </div>
          ) : (
            <div style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: '16px 16px 4px 16px', padding: '5px 10px',
              fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)',
            }}>
              기분 어때?
            </div>
          )}
          <button
            onClick={() => { setMoodTarget('dolphin'); setMoodModal(true) }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'jumpDolphin 2.8s ease-in-out infinite', display: 'block' }}
          >
            <Dolphin size={120} variant="happy" palette="blue" />
          </button>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 12, color: 'var(--accent-deep)' }}>하경</div>
        </div>

        {/* Center heart */}
        <div style={{
          position: 'absolute', bottom: '34%', left: '50%', transform: 'translateX(-50%)',
          fontSize: 28, animation: 'bobY 4s ease-in-out infinite 1s', zIndex: 2, pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 8px rgba(239,68,68,0.3))',
        }}>
          💕
        </div>
      </div>

      {/* BottomNav spacer */}
      <div style={{ height: 'calc(60px + env(safe-area-inset-bottom))', flexShrink: 0 }} />

      {/* ── Mood modal ── */}
      {moodModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setMoodModal(false)}
        >
          <div
            style={{ background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 17, marginBottom: 14, textAlign: 'center' }}>
              {moodTarget === 'duck' ? '🦆 창희' : '🐬 하경'} 오늘 기분은?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MOODS.map(m => {
                const selected = moodEmoji === m.emoji
                return (
                  <button key={m.emoji} onClick={() => setMoodEmoji(m.emoji)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 14px', minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: selected ? m.bg : 'var(--bg)',
                    outline: selected ? `2px solid ${m.color}` : '2px solid transparent',
                    transition: 'all 0.15s', transform: selected ? 'scale(1.06)' : 'scale(1)',
                  }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{m.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-main)', fontSize: 15, color: selected ? m.color : 'var(--ink-mute)', fontWeight: selected ? 700 : 400 }}>{m.label}</span>
                  </button>
                )
              })}
            </div>
            <input
              value={moodDraft}
              onChange={e => setMoodDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMood()}
              placeholder="한 줄 메시지 (선택)"
              maxLength={20}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 14, border: '2px solid var(--accent-soft)', fontFamily: 'var(--font-main)', fontSize: 15, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', marginBottom: 12 }}
            />
            <button onClick={saveMood} style={{ width: '100%', padding: '13px 0', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              저장하기 {moodEmoji}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
