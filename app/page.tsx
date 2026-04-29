'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Duck } from '@/components/characters/Duck'
import { Dolphin } from '@/components/characters/Dolphin'
import { CloudDeco } from '@/components/ui/CloudDeco'
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

// ── BigCard ──────────────────────────────────────────────────────────────────
function BigCard({
  onClick,
  title,
  count,
  subtitle,
  color,
  colorDeep,
  icon,
}: {
  onClick: () => void
  title: string
  count: string | number
  subtitle: string
  color: string
  colorDeep: string
  icon: 'task' | 'weight'
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: 'var(--card)',
        borderRadius: 24,
        padding: 16,
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        border: 'none',
        textAlign: 'left',
        color: 'var(--ink)',
        minHeight: 110,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: color,
          opacity: 0.25,
        }}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${color}, ${colorDeep})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        {icon === 'task' ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="14" height="14" rx="2" />
            <path d="M8 11l2 2 4-4" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 16 Q 8 10, 11 13 T 17 11" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 15, fontWeight: 700 }}>{title}</div>
      {count !== '' && <div style={{ fontFamily: 'var(--font-main)', fontSize: 28, fontWeight: 800, color: colorDeep, lineHeight: 1.1, marginTop: 2 }}>{count}</div>}
      {subtitle !== '' && <div style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{subtitle}</div>}
    </button>
  )
}

// ── OnboardingScreen ─────────────────────────────────────────────────────────
function OnboardingScreen({ onSelect }: { onSelect: (who: '창희' | '하경') => void }) {
  return (
    <div style={{
      minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 24px',
    }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
      <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, color: 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>
        오리 레인저
      </div>
      <div style={{ fontFamily: 'var(--font-main)', fontSize: 17, color: 'var(--ink-mute)', marginBottom: 48, textAlign: 'center' }}>
        나는 누구인가요?
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 340 }}>
        <button
          onClick={() => onSelect('창희')}
          style={{
            flex: 1, background: 'var(--card)',
            border: '2.5px solid transparent',
            borderRadius: 28, padding: '28px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: 'var(--shadow)',
            transition: 'all 0.15s',
          }}
        >
          <Duck size={90} variant="strong" palette="yellow" />
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 20, color: 'var(--duck-deep)' }}>창희 🦆</div>
        </button>

        <button
          onClick={() => onSelect('하경')}
          style={{
            flex: 1, background: 'var(--card)',
            border: '2.5px solid transparent',
            borderRadius: 28, padding: '28px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: 'var(--shadow)',
            transition: 'all 0.15s',
          }}
        >
          <Dolphin size={90} variant="happy" palette="blue" />
          <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 20, color: 'var(--accent-deep)' }}>하경 🐬</div>
        </button>
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
  if (label.includes('비') || label === '소나기') return 'rain'
  return 'none'
}

// Deterministic drop/flake configs (no Math.random → no SSR mismatch)
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

  /* ── 맑음: 태양 + 빛 줄기 ── */
  if (type === 'sunny') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Warm ambient corona */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 210, height: 210, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,0,0.28) 0%, rgba(255,190,0,0.07) 55%, transparent 70%)',
          animation: 'sunGlow 4s ease-in-out infinite',
        }} />
        {/* Sun disc + rotating rays */}
        <div style={{ position: 'absolute', top: 20, right: 20, width: 52, height: 52 }}>
          {/* Rays ring — expands -22px on all sides (96×96) */}
          <div style={{
            position: 'absolute', top: -22, left: -22, right: -22, bottom: -22,
            animation: 'rayRotate 20s linear infinite',
          }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <div key={deg} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: 15, height: 2.5, marginTop: -1.25,
                borderRadius: 2,
                background: 'rgba(255,205,0,0.65)',
                transform: `rotate(${deg}deg) translateX(32px)`,
                transformOrigin: '0 50%',
              }} />
            ))}
          </div>
          {/* Sun disc on top */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFDE7, #FFD740)',
            boxShadow: '0 0 0 5px rgba(255,220,0,0.18), 0 0 24px rgba(255,200,0,0.42)',
            animation: 'sunGlow 4s ease-in-out infinite',
          }} />
        </div>
        {/* Light streaks radiating down-left from sun center */}
        {[108, 126, 145].map((angle, i) => (
          <div key={i} style={{
            position: 'absolute', top: 46, right: 46,
            width: 1.5, height: 55 + i * 28,
            background: 'linear-gradient(to bottom, rgba(255,215,0,0.20), transparent)',
            transformOrigin: 'top center',
            transform: `rotate(${angle}deg)`,
          }} />
        ))}
      </div>
    )
  }

  /* ── 비 / 천둥번개 ── */
  if (type === 'rain' || type === 'thunder') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
        {/* Sky tint */}
        <div style={{
          position: 'absolute', inset: 0,
          background: type === 'thunder'
            ? 'linear-gradient(180deg, rgba(50,60,115,0.16) 0%, transparent 65%)'
            : 'linear-gradient(180deg, rgba(80,115,155,0.10) 0%, transparent 60%)',
        }} />
        {/* Rain drops */}
        {RAIN_DROPS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: d.left, top: -20,
            width: type === 'thunder' ? 2.5 : 1.8,
            height: d.height,
            borderRadius: 1,
            background: type === 'thunder'
              ? 'rgba(150,190,255,0.76)'
              : 'rgba(100,175,255,0.62)',
            animationName: 'rainFall',
            animationDuration: d.duration,
            animationDelay: d.delay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }} />
        ))}
        {/* Lightning flash overlay */}
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

  /* ── 눈 ── */
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
      {/* Cool sky tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(200,220,255,0.08) 0%, transparent 55%)',
      }} />
      {SNOW_FLAKES.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: f.left, top: -10,
          width: f.size, height: f.size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.93)',
          boxShadow: `0 0 ${f.size + 2}px rgba(200,230,255,0.75)`,
          animationName: 'snowFall',
          animationDuration: `${f.duration}s`,
          animationDelay: `${f.delay}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
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

    // 미완료 할 일 수만 로드
    supabase.from('tasks').select('id', { count: 'exact' }).eq('completed', false)
      .then(({ count }) => setOpenCount(count ?? 0))

    // 최근 체중
    supabase.from('household_members').select('user_id, display_name').then(({ data: members }) => {
      if (!members) return
      members.forEach(async (m: { user_id: string; display_name: string }) => {
        const { data } = await supabase
          .from('weigh_ins')
          .select('weight_kg')
          .eq('user_id', m.user_id)
          .order('date', { ascending: false })
          .limit(1)
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
  const dateLabel = `${now.getMonth() + 1}월 ${now.getDate()}일(${['일','월','화','수','목','금','토'][now.getDay()]})`

  return (
    <div
      style={{
        width: '100%',
        height: '100svh',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 60%, var(--bg) 100%)',
        color: 'var(--ink)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Clouds */}
      <div style={{ position: 'absolute', top: 58, left: -20, animation: 'floatCloud 8s ease-in-out infinite', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}>
        <CloudDeco size={100} opacity={1} />
      </div>
      <div style={{ position: 'absolute', top: 130, right: -30, animation: 'floatCloud 10s ease-in-out infinite 2s', opacity: 0.35, pointerEvents: 'none', zIndex: 0 }}>
        <CloudDeco size={90} opacity={1} />
      </div>

      {/* Header */}
      <div style={{ padding: '14px 22px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--font-main)' }}>
            <span>{dateLabel}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{weather.label}</span>
            <span>{weather.emoji}</span>
            {weather.temp !== null && <span style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>{weather.temp}°C</span>}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--peach), var(--pink))',
            borderRadius: 100,
            padding: '3px 12px',
            fontFamily: 'var(--font-main)',
            fontWeight: 700,
            fontSize: 13,
            color: '#fff',
            boxShadow: 'var(--shadow-soft)',
            whiteSpace: 'nowrap',
          }}>
            💞 D+{dDay}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: 26, lineHeight: 1.2, letterSpacing: -0.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent-deep)' }}>오리 레인저</span>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="22" rx="8" ry="7" fill="#FCD34D"/>
            <ellipse cx="9" cy="23" rx="3.5" ry="2" fill="#F59E0B" transform="rotate(-15 9 23)"/>
            <ellipse cx="23" cy="23" rx="3.5" ry="2" fill="#F59E0B" transform="rotate(15 23 23)"/>
            <ellipse cx="16" cy="13" rx="8" ry="8.5" fill="#EF4444"/>
            <path d="M9 12 L16 17 L23 12" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M9 12 Q16 10 23 12 L23 14 Q16 12 9 14 Z" fill="#111827"/>
            <rect x="14.5" y="4" width="3" height="5" rx="1.5" fill="#DC2626"/>
            <ellipse cx="16" cy="19.5" rx="3" ry="1.5" fill="#F97316"/>
            <ellipse cx="13" cy="29" rx="2.5" ry="1.2" fill="#F97316"/>
            <ellipse cx="19" cy="29" rx="2.5" ry="1.2" fill="#F97316"/>
          </svg>
        </div>
      </div>

      {/* Character area — flex 1 so it fills available space */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* Weather effect overlay */}
        <WeatherEffect type={getWeatherType(weather.label)} />
        {/* Duck */}
        <div style={{ position: 'absolute', left: '8%', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {duckMood && (
            <div style={{
              background: 'var(--duck-soft)', border: '1.5px solid var(--duck)', borderRadius: '14px 14px 14px 4px',
              padding: '5px 10px', fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--duck-deep)',
              maxWidth: 100, wordBreak: 'keep-all', lineHeight: 1.3, whiteSpace: 'pre-wrap',
            }}>
              {duckMood.emoji} {duckMood.text || ''}
            </div>
          )}
          <button onClick={() => { setMoodTarget('duck'); setMoodModal(true) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'bobY 3.5s ease-in-out infinite' }}>
            <Duck size={100} variant="strong" palette="yellow" />
          </button>
        </div>

        {/* Dolphin */}
        <div style={{ position: 'absolute', right: '8%', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {dolphinMood && (
            <div style={{
              background: 'var(--dolphin-soft)', border: '1.5px solid var(--dolphin)', borderRadius: '14px 14px 4px 14px',
              padding: '5px 10px', fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--accent-deep)',
              maxWidth: 100, wordBreak: 'keep-all', lineHeight: 1.3, whiteSpace: 'pre-wrap', textAlign: 'right',
            }}>
              {dolphinMood.emoji} {dolphinMood.text || ''}
            </div>
          )}
          <button onClick={() => { setMoodTarget('dolphin'); setMoodModal(true) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'jumpDolphin 2.8s ease-in-out infinite' }}>
            <Dolphin size={100} variant="happy" palette="blue" />
          </button>
        </div>

        {/* Water shimmer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, #CDE9F600 0%, var(--accent-soft) 100%)', borderRadius: '50% 50% 0 0 / 20% 20% 0 0', pointerEvents: 'none' }} />
      </div>

      {/* BigCard row */}
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 12, position: 'relative', zIndex: 2 }}>
        <BigCard
          title="할 일"
          count={openCount}
          subtitle={openCount === 0 ? '다 했어! 🎉' : '미완료'}
          color="var(--peach)"
          colorDeep="var(--peach-deep)"
          icon="task"
          onClick={() => router.push('/tasks')}
        />
        <BigCard
          title="체중"
          count=""
          subtitle={duckKg !== null || dolphinKg !== null
            ? `🦆 ${duckKg ?? '-'}kg  🐬 ${dolphinKg ?? '-'}kg`
            : '기록 불러오는 중...'}
          color="var(--accent)"
          colorDeep="var(--accent-deep)"
          icon="weight"
          onClick={() => router.push('/weight')}
        />
      </div>

      {/* BottomNav spacer */}
      <div style={{ height: 'calc(60px + env(safe-area-inset-bottom))' }} />

      {/* 기분 설정 모달 */}
      {moodModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setMoodModal(false)}>
          <div style={{ background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 17, marginBottom: 14, textAlign: 'center' }}>
              {moodTarget === 'duck' ? '🦆 창희' : '🐬 하경'} 오늘 기분은?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MOODS.map(m => {
                const selected = moodEmoji === m.emoji
                return (
                  <button
                    key={m.emoji}
                    onClick={() => setMoodEmoji(m.emoji)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 14px', minHeight: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
                      background: selected ? m.bg : 'var(--bg)',
                      outline: selected ? `2px solid ${m.color}` : '2px solid transparent',
                      transition: 'all 0.15s',
                      transform: selected ? 'scale(1.06)' : 'scale(1)',
                    }}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{m.emoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-main)', fontSize: 15,
                      color: selected ? m.color : 'var(--ink-mute)',
                      fontWeight: selected ? 700 : 400,
                    }}>{m.label}</span>
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
            <button onClick={saveMood} style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', color: '#fff', fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              저장하기 {moodEmoji}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
