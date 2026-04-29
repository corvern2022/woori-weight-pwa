'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Duck } from '@/components/characters/Duck'
import { Dolphin } from '@/components/characters/Dolphin'
import { getSupabaseClient } from '@/lib/supabase'
import { useWeather } from '@/lib/useWeather'
import { usePush } from '@/lib/usePush'

const MOODS: { emoji: string; label: string; color: string; bg: string }[] = [
  { emoji: '😊', label: '행복해',   color: '#D97706', bg: '#FEF3C7' },
  { emoji: '🥰', label: '설레',     color: '#DB2777', bg: '#FCE7F3' },
  { emoji: '🔥', label: '의욕넘쳐', color: '#EA580C', bg: '#FFEDD5' },
  { emoji: '😎', label: '여유로워', color: '#0369A1', bg: '#E0F2FE' },
  { emoji: '😌', label: '평온해',   color: '#059669', bg: '#D1FAE5' },
  { emoji: '🥱', label: '피곤해',   color: '#6B7280', bg: '#F3F4F6' },
  { emoji: '😤', label: '스트레스', color: '#DC2626', bg: '#FEE2E2' },
  { emoji: '🥺', label: '우울해',   color: '#7C3AED', bg: '#EDE9FE' },
  { emoji: '💪', label: '힘차',     color: '#D97706', bg: '#FEF9C3' },
  { emoji: '🫶', label: '사랑해',   color: '#BE185D', bg: '#FDF2F8' },
]

type MoodState = { emoji: string; text: string; updated_at: string } | null

// ── Onboarding ────────────────────────────────────────────────────────────────
function OnboardingScreen({ onSelect }: { onSelect: (who: '창희' | '하경') => void }) {
  return (
    <div style={{
      minHeight: '100svh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 24px',
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>오리 레인저</div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 16, color: 'var(--ink-mute)', marginBottom: 48, textAlign: 'center' }}>나는 누구인가요?</div>
      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 340 }}>
        {([
          { who: '창희', char: <Duck size={90} variant="strong" palette="yellow" />, color: 'var(--duck-deep)' },
          { who: '하경', char: <Dolphin size={90} variant="happy" palette="blue" />,  color: 'var(--accent-deep)' },
        ] as const).map(({ who, char, color }) => (
          <button key={who} onClick={() => onSelect(who)} style={{
            flex: 1, background: 'var(--card)', border: '2.5px solid transparent',
            borderRadius: 28, padding: '28px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: 'var(--shadow)',
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

// ── Weather ───────────────────────────────────────────────────────────────────
type WeatherType = 'sunny' | 'partly_cloudy' | 'cloudy' | 'foggy' | 'rain' | 'snow' | 'thunder'

function getWeatherType(label: string): WeatherType {
  if (label === '맑음') return 'sunny'
  if (label === '구름 조금') return 'partly_cloudy'
  if (label === '흐림') return 'cloudy'
  if (label === '안개') return 'foggy'
  if (label === '천둥번개') return 'thunder'
  if (label.includes('눈')) return 'snow'
  if (label.includes('비') || label === '소나기' || label === '이슬비') return 'rain'
  return 'sunny' // 기본값: 맑음 (날씨 로딩 전 또는 알 수 없는 경우)
}

// Deterministic configs
const RAIN_DROPS = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 3.9 + 1.5) % 100}%`,
  delay: `${((i * 137) % 900) / 1000}s`,
  duration: `${(380 + (i * 71) % 220) / 1000}s`,
  height: 16 + (i % 5) * 3,
}))

const SNOW_FLAKES = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 3.4 + 1) % 100}%`,
  size: 5 + (i % 4),
  delay: `${((i * 211) % 3200) / 1000}s`,
  duration: `${(2200 + (i * 137) % 2000) / 1000}s`,
}))

// Deterministic cloud positions for partly_cloudy / cloudy
const CLOUDS = [
  { left: '8%',  top: '8%',  w: 88, h: 44, delay: 0,   dur: 8  },
  { left: '52%', top: '6%',  w: 72, h: 36, delay: 2.5, dur: 10 },
  { left: '28%', top: '22%', w: 60, h: 30, delay: 1.2, dur: 9  },
  { left: '68%', top: '18%', w: 96, h: 48, delay: 3.8, dur: 11 },
]

// Pure-CSS cloud blob
function CloudBlob({ left, top, w, h, delay, dur, opacity }: {
  left: string; top: string; w: number; h: number; delay: number; dur: number; opacity: number
}) {
  return (
    <div style={{
      position: 'absolute', left, top,
      width: w, height: h,
      background: 'rgba(255,255,255,0.88)',
      borderRadius: `${h}px ${h}px ${h * 0.8}px ${h * 0.8}px`,
      boxShadow: `
        ${w * 0.28}px -${h * 0.36}px 0 ${h * 0.18}px rgba(255,255,255,0.82),
        ${w * 0.55}px -${h * 0.18}px 0 ${h * 0.08}px rgba(255,255,255,0.75),
        -${w * 0.12}px -${h * 0.22}px 0 ${h * 0.12}px rgba(255,255,255,0.78)
      `,
      opacity,
      animation: `floatCloud ${dur}s ease-in-out infinite ${delay}s`,
      filter: 'drop-shadow(0 4px 8px rgba(100,140,180,0.18))',
      pointerEvents: 'none',
    }} />
  )
}

function WeatherEffect({ type }: { type: WeatherType }) {

  /* ── 맑음 ── */
  if (type === 'sunny') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* warm ambient glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.32) 0%, rgba(255,190,0,0.10) 50%, transparent 70%)',
        animation: 'sunGlow 4s ease-in-out infinite',
      }} />
      {/* sun */}
      <div style={{ position: 'absolute', top: 20, right: 22, width: 62, height: 62 }}>
        {/* rotating rays */}
        <div style={{ position: 'absolute', top: -24, left: -24, right: -24, bottom: -24, animation: 'rayRotate 18s linear infinite' }}>
          {[0,40,80,120,160,200,240,280,320].map(deg => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 18, height: 3.5, marginTop: -1.75, borderRadius: 3,
              background: 'rgba(255,210,0,0.7)',
              transform: `rotate(${deg}deg) translateX(40px)`,
              transformOrigin: '0 50%',
            }} />
          ))}
        </div>
        {/* disc */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFFDE0, #FFD600)',
          boxShadow: '0 0 0 6px rgba(255,220,0,0.20), 0 0 32px rgba(255,200,0,0.50)',
          animation: 'sunGlow 4s ease-in-out infinite',
        }} />
      </div>
      {/* light streaks */}
      {[110, 130, 152].map((angle, i) => (
        <div key={i} style={{
          position: 'absolute', top: 51, right: 53,
          width: 2, height: 60 + i * 30,
          background: 'linear-gradient(to bottom, rgba(255,215,0,0.24), transparent)',
          transformOrigin: 'top center',
          transform: `rotate(${angle}deg)`,
        }} />
      ))}
    </div>
  )

  /* ── 구름 조금 ── */
  if (type === 'partly_cloudy') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* smaller sun peeking */}
      <div style={{ position: 'absolute', top: 18, right: 20, width: 48, height: 48 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFFDE0, #FFD600)',
          boxShadow: '0 0 0 4px rgba(255,220,0,0.18), 0 0 20px rgba(255,200,0,0.38)',
          animation: 'sunGlow 4s ease-in-out infinite',
        }} />
      </div>
      {/* 2 clouds */}
      <CloudBlob {...CLOUDS[0]} opacity={0.92} />
      <CloudBlob {...CLOUDS[1]} opacity={0.78} />
    </div>
  )

  /* ── 흐림 ── */
  if (type === 'cloudy') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* gray sky tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(160,175,195,0.18) 0%, transparent 70%)',
      }} />
      {CLOUDS.map((c, i) => <CloudBlob key={i} {...c} opacity={0.88 - i * 0.05} />)}
    </div>
  )

  /* ── 안개 ── */
  if (type === 'foggy') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${15 + i * 22}%`, height: 28,
          background: 'rgba(200,215,230,0.35)',
          borderRadius: 20,
          animation: `floatCloud ${10 + i * 3}s ease-in-out infinite ${i * 2}s`,
        }} />
      ))}
    </div>
  )

  /* ── 비 / 천둥번개 ── */
  if (type === 'rain' || type === 'thunder') return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: type === 'thunder'
          ? 'linear-gradient(180deg, rgba(45,55,110,0.22) 0%, transparent 70%)'
          : 'linear-gradient(180deg, rgba(75,110,150,0.15) 0%, transparent 65%)',
      }} />
      {/* clouds above rain */}
      <CloudBlob {...CLOUDS[0]} opacity={type === 'thunder' ? 0.65 : 0.72} />
      <CloudBlob {...CLOUDS[3]} opacity={type === 'thunder' ? 0.55 : 0.62} />
      {/* drops */}
      {RAIN_DROPS.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, top: -22,
          width: type === 'thunder' ? 2.8 : 2, height: d.height, borderRadius: 2,
          background: type === 'thunder' ? 'rgba(140,185,255,0.82)' : 'rgba(90,165,255,0.68)',
          animationName: 'rainFall', animationDuration: d.duration, animationDelay: d.delay,
          animationTimingFunction: 'linear', animationIterationCount: 'infinite',
        }} />
      ))}
      {type === 'thunder' && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(210,225,255,0.88)',
          animation: 'lightningFlash 3.8s 1.2s linear infinite',
        }} />
      )}
    </div>
  )

  /* ── 눈 ── */
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(195,215,255,0.12) 0%, transparent 55%)',
      }} />
      {/* light clouds */}
      <CloudBlob {...CLOUDS[1]} opacity={0.60} />
      <CloudBlob {...CLOUDS[2]} opacity={0.50} />
      {SNOW_FLAKES.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', left: f.left, top: -12,
          width: f.size, height: f.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: `0 0 ${f.size + 3}px rgba(200,225,255,0.80)`,
          animationName: 'snowFall', animationDuration: `${f.duration}s`,
          animationDelay: `${f.delay}s`, animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
  )
}

// ── HomePage ──────────────────────────────────────────────────────────────────
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
        const { data } = await supabase.from('weigh_ins').select('weight_kg')
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

  if (actor === null) return null
  if (actor === '') return <OnboardingScreen onSelect={(who) => { localStorage.setItem('ori_ranger_actor', who); setActor(who) }} />

  const dDay = Math.floor((new Date().setHours(0,0,0,0) - new Date('2023-07-08').setHours(0,0,0,0)) / 86400000)
  const now = new Date()
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 (${['일','월','화','수','목','금','토'][now.getDay()]})`
  const weatherType = getWeatherType(weather.label)
  const weatherReady = !weather.loading && weather.label !== '날씨 확인 중' && weather.label !== ''

  return (
    <div style={{
      width: '100%', height: '100svh',
      background: 'var(--bg)', color: 'var(--ink)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '52px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 2,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{
            fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 20,
            color: 'var(--ink)', letterSpacing: -0.5,
          }}>
            오리 레인저 🦆
          </div>
          <div style={{
            fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--ink-soft)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{dateLabel}</span>
            {weatherReady && (
              <>
                <span style={{ opacity: 0.35 }}>·</span>
                <span>{weather.emoji} {weather.label}</span>
                {weather.temp !== null && (
                  <span style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>{weather.temp}°</span>
                )}
              </>
            )}
          </div>
        </div>
        {/* D+N pill */}
        <div style={{
          background: 'linear-gradient(135deg, var(--peach), var(--pink))',
          borderRadius: 100, padding: '6px 16px',
          fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 15,
          color: '#fff', boxShadow: '0 4px 12px rgba(255,130,100,0.3)',
          letterSpacing: -0.3, lineHeight: 1,
        }}>
          💞 D+{dDay}
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div style={{
        flex: 1, minHeight: 0,
        margin: '0 14px', marginBottom: 12,
        borderRadius: 28,
        background: 'linear-gradient(170deg, var(--accent-soft) 0%, var(--bg-deep) 55%, var(--dolphin-soft) 100%)',
        boxShadow: 'var(--shadow)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Weather overlay */}
        <WeatherEffect type={weatherType} />

        {/* Water shimmer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
          background: 'linear-gradient(180deg, transparent 0%, rgba(100,175,220,0.18) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Characters — absolutely centered */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '12px 8px 28px',
          zIndex: 2,
        }}>
          {/* Duck */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            {duckMood ? (
              <div style={{
                background: 'var(--duck-soft)', border: '1.5px solid var(--duck)',
                borderRadius: '14px 14px 14px 4px', padding: '6px 11px',
                fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--duck-deep)',
                maxWidth: 110, wordBreak: 'keep-all', lineHeight: 1.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}>
                {duckMood.emoji} {duckMood.text}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--border)',
                borderRadius: '14px 14px 14px 4px', padding: '5px 10px',
                fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)',
              }}>오늘 기분은?</div>
            )}
            <button
              onClick={() => { setMoodTarget('duck'); setMoodModal(true) }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', animation: 'bobY 3.5s ease-in-out infinite' }}
            >
              <Duck size={118} variant="strong" palette="yellow" />
            </button>
            <div style={{
              fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13,
              color: 'var(--duck-deep)', letterSpacing: -0.3,
            }}>창희 🦆</div>
          </div>

          {/* Center */}
          <div style={{
            fontSize: 26, flexShrink: 0,
            animation: 'bobY 4s ease-in-out infinite 1.2s',
            filter: 'drop-shadow(0 2px 6px rgba(239,68,68,0.25))',
          }}>
            💕
          </div>

          {/* Dolphin */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            {dolphinMood ? (
              <div style={{
                background: 'var(--dolphin-soft)', border: '1.5px solid var(--dolphin)',
                borderRadius: '14px 14px 4px 14px', padding: '6px 11px',
                fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--accent-deep)',
                maxWidth: 110, wordBreak: 'keep-all', lineHeight: 1.4, textAlign: 'right',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}>
                {dolphinMood.emoji} {dolphinMood.text}
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.7)', border: '1.5px solid var(--border)',
                borderRadius: '14px 14px 4px 14px', padding: '5px 10px',
                fontFamily: 'var(--font-main)', fontSize: 11, color: 'var(--ink-mute)',
              }}>오늘 기분은?</div>
            )}
            <button
              onClick={() => { setMoodTarget('dolphin'); setMoodModal(true) }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', animation: 'jumpDolphin 2.8s ease-in-out infinite' }}
            >
              <Dolphin size={118} variant="happy" palette="blue" />
            </button>
            <div style={{
              fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13,
              color: 'var(--accent-deep)', letterSpacing: -0.3,
            }}>하경 🐬</div>
          </div>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div style={{ display: 'flex', gap: 10, padding: '0 14px', marginBottom: 14, flexShrink: 0 }}>
        {/* Task card */}
        <button onClick={() => router.push('/tasks')} style={{
          flex: 1, background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--peach-deep)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ fontFamily: 'var(--font-main)', fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', letterSpacing: 0.2, marginBottom: 3 }}>📋 할 일</div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 30, color: 'var(--peach-deep)', lineHeight: 1, letterSpacing: -1 }}>
            {openCount === 0 ? '🎉' : openCount}
          </div>
          <div style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>
            {openCount === 0 ? '모두 완료!' : `${openCount}개 남음`}
          </div>
        </button>

        {/* Weight card */}
        <button onClick={() => router.push('/weight')} style={{
          flex: 1, background: 'var(--card)', borderRadius: 20, padding: '14px 16px',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--accent-deep)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ fontFamily: 'var(--font-main)', fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', letterSpacing: 0.2, marginBottom: 3 }}>⚖️ 체중</div>
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 24, color: 'var(--accent-deep)', lineHeight: 1, letterSpacing: -0.5 }}>
            {duckKg !== null ? `${duckKg}` : dolphinKg !== null ? `${dolphinKg}` : '—'}
            {(duckKg !== null || dolphinKg !== null) && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-mute)' }}> kg</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 3 }}>
            {duckKg !== null && dolphinKg !== null
              ? `🦆${duckKg} · 🐬${dolphinKg}`
              : duckKg !== null ? `창희 ${duckKg}kg`
              : dolphinKg !== null ? `하경 ${dolphinKg}kg`
              : '기록 없음'}
          </div>
        </button>
      </div>

      {/* BottomNav spacer */}
      <div style={{ height: 'calc(64px + env(safe-area-inset-bottom))', flexShrink: 0 }} />

      {/* ── Mood Modal ── */}
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
                    display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                    minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
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
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 14,
                border: '2px solid var(--accent-soft)', fontFamily: 'var(--font-main)', fontSize: 15,
                background: 'var(--bg)', color: 'var(--ink)', outline: 'none', marginBottom: 12,
              }}
            />
            <button onClick={saveMood} style={{
              width: '100%', padding: '13px 0', border: 'none', borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}>
              저장하기 {moodEmoji}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
