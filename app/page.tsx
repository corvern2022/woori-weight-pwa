'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Duck } from '@/components/characters/Duck'
import { Dolphin } from '@/components/characters/Dolphin'
import { Avatar } from '@/components/ui/Avatar'
import { CloudDeco } from '@/components/ui/CloudDeco'
import { getSupabaseClient } from '@/lib/supabase'
import { useWeather } from '@/lib/useWeather'
import { usePush } from '@/lib/usePush'
import { toSeoulISODate } from '@/lib/date'
import type { Task } from '@/components/tasks/types'

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
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 17 }}>{title}</div>
      {count !== "" && <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 30, color: colorDeep, lineHeight: 1.1, marginTop: 2 }}>{count}</div>}
      {subtitle !== "" && <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>{subtitle}</div>}
    </button>
  )
}

// ── TinyTask ─────────────────────────────────────────────────────────────────
function dueDateChip(dateStr: string | null, todayStr: string): { label: string; color: string; bg: string } | null {
  if (!dateStr) return null
  if (dateStr === todayStr) return { label: '오늘', color: 'var(--mint-deep)', bg: 'var(--mint)' }
  if (dateStr < todayStr) {
    const diff = Math.round((new Date(todayStr).getTime() - new Date(dateStr).getTime()) / 86400000)
    return { label: `${diff}일 지남`, color: 'var(--peach-deep)', bg: '#FFE8E0' }
  }
  const diff = Math.round((new Date(dateStr).getTime() - new Date(todayStr).getTime()) / 86400000)
  return { label: `${diff}일 후`, color: 'var(--ink-soft)', bg: 'var(--bg-deep)' }
}

function TinyTask({ t, onToggle, todayStr }: { t: Task; onToggle: () => void; todayStr: string }) {
  const chip = dueDateChip(t.due_date, todayStr)
  const whoEmoji = t.assignee === '창희' ? '🦆' : t.assignee === '하경' ? '🐬' : '💞'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px dashed var(--accent-soft)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          marginLeft: -12,
        }}
      >
        <div style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: t.completed ? 'var(--accent)' : 'transparent',
          border: t.completed ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {t.completed && (
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Jua, sans-serif',
            fontSize: 14,
            color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
            textDecoration: t.completed ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <span style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 11, color: 'var(--ink-soft)' }}>{whoEmoji} {t.assignee}</span>
          {chip && (
            <span style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 6,
              fontFamily: 'Gaegu, sans-serif',
              background: chip.bg, color: chip.color,
            }}>{chip.label}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── OnboardingScreen ─────────────────────────────────────────────────────────
function OnboardingScreen({ onSelect }: { onSelect: (who: '창희' | '하경') => void }) {
  const [hovered, setHovered] = useState<'duck' | 'dolphin' | null>(null)
  return (
    <div style={{
      minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 24px',
    }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 26, color: 'var(--ink)', marginBottom: 6, textAlign: 'center' }}>
        오리 레인저
      </div>
      <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 17, color: 'var(--ink-mute)', marginBottom: 48, textAlign: 'center' }}>
        나는 누구인가요?
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 340 }}>
        {/* 창희 */}
        <button
          onMouseEnter={() => setHovered('duck')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onSelect('창희')}
          style={{
            flex: 1, background: hovered === 'duck' ? 'var(--duck-soft)' : 'var(--card)',
            border: `2.5px solid ${hovered === 'duck' ? 'var(--duck)' : 'transparent'}`,
            borderRadius: 28, padding: '28px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: hovered === 'duck' ? '0 8px 28px rgba(255,200,50,0.25)' : 'var(--shadow)',
            transition: 'all 0.2s',
            transform: hovered === 'duck' ? 'translateY(-4px)' : 'none',
          }}
        >
          <Duck size={90} variant="strong" palette="yellow" />
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 20, color: 'var(--duck-deep)' }}>창희 🦆</div>
        </button>

        {/* 하경 */}
        <button
          onMouseEnter={() => setHovered('dolphin')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onSelect('하경')}
          style={{
            flex: 1, background: hovered === 'dolphin' ? 'var(--dolphin-soft)' : 'var(--card)',
            border: `2.5px solid ${hovered === 'dolphin' ? 'var(--dolphin)' : 'transparent'}`,
            borderRadius: 28, padding: '28px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: hovered === 'dolphin' ? '0 8px 28px rgba(99,163,253,0.25)' : 'var(--shadow)',
            transition: 'all 0.2s',
            transform: hovered === 'dolphin' ? 'translateY(-4px)' : 'none',
          }}
        >
          <Dolphin size={90} variant="happy" palette="blue" />
          <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 20, color: 'var(--accent-deep)' }}>하경 🐬</div>
        </button>
      </div>

      <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-mute)', marginTop: 32, textAlign: 'center' }}>
        한 번만 선택하면 기억할게요 💾
      </div>
    </div>
  )
}

// ── HomePage ─────────────────────────────────────────────────────────────────
const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export default function HomePage() {
  const router = useRouter()
  const [actor, setActor] = useState<string | null>(null)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [duckKg, setDuckKg] = useState<number | null>(null)
  const [dolphinKg, setDolphinKg] = useState<number | null>(null)
  const [duckMood, setDuckMood] = useState<MoodState>(null)
  const [dolphinMood, setDolphinMood] = useState<MoodState>(null)
  const [moodModal, setMoodModal] = useState(false)
  const [moodTarget, setMoodTarget] = useState<'duck' | 'dolphin'>('duck')
  const [moodDraft, setMoodDraft] = useState('')
  const [moodEmoji, setMoodEmoji] = useState('😊')
  const [anniversaryDate, setAnniversaryDate] = useState('2023-07-08')
  const [editingAnniversary, setEditingAnniversary] = useState(false)
  const [pushUserId, setPushUserId] = useState<string | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  usePush(pushUserId)
  const weather = useWeather()
  const today = DAYS[new Date().getDay()]
  const todayStr = toSeoulISODate()

  // 앱 초기화: Supabase 우선, localStorage 폴백
  useEffect(() => {
    async function initActor() {
      const userId = localStorage.getItem('woori_weight_user_id')
      setPushUserId(userId)
      // Supabase에서 actor 복원 시도
      if (userId) {
        try {
          const { data } = await getSupabaseClient()
            .from('app_config')
            .select('value')
            .eq('key', `actor_${userId}`)
            .single()
          const name = (data?.value as { name?: string } | null)?.name
          if (name === '창희' || name === '하경') {
            localStorage.setItem('ori_ranger_actor', name)
            setActor(name)
            return
          }
        } catch { /* 폴백 */ }
      }
      const saved = localStorage.getItem('ori_ranger_actor')
      setActor(saved ?? '')
    }
    void initActor()
  }, [])

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (isIOS && !isStandalone && !dismissed) {
      setShowInstallBanner(true)
    }
  }, [])

  const loadMoods = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data } = await supabase.from('app_config').select('key, value').in('key', ['mood_duck', 'mood_dolphin'])
    if (!data) return
    data.forEach((row: { key: string; value: MoodState }) => {
      if (row.key === 'mood_duck') setDuckMood(row.value)
      if (row.key === 'mood_dolphin') setDolphinMood(row.value)
    })
    const { data: dDayRow } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'anniversary_date')
      .maybeSingle()
    if (dDayRow?.value) {
      const v = dDayRow.value as { date?: string }
      if (v.date) setAnniversaryDate(v.date)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabaseClient()

    supabase
      .from('tasks')
      .select('*')
      .eq('completed', false)
      .order('due_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        if (data) { setAllTasks(data as Task[]); setOpenCount(data.length) }
      })

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
    await getSupabaseClient().from('app_config').upsert({ key, value, updated_at: new Date().toISOString() })
    if (moodTarget === 'duck') setDuckMood(value)
    else setDolphinMood(value)
    setMoodModal(false)
    setMoodDraft('')
  }

  async function handleOnboardingSelect(who: '창희' | '하경') {
    localStorage.setItem('ori_ranger_actor', who)
    setActor(who)
    try {
      const userId = localStorage.getItem('woori_weight_user_id')
      if (userId) {
        await getSupabaseClient().from('app_config').upsert(
          { key: `actor_${userId}`, value: { name: who }, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      }
    } catch { /* localStorage 폴백 */ }
  }

  // 온보딩: actor 미설정 시 선택 화면 (null = 아직 로드 전, '' = 미설정)
  if (actor === null) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 28, color: 'var(--accent-deep)' }}>오리 레인저 🦆</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'bounce 0.8s infinite', animationDelay: `${i*0.15}s` }} />
        ))}
      </div>
    </div>
  )  // hydration 대기
  if (actor === '') return <OnboardingScreen onSelect={handleOnboardingSelect} />

  // 기한 지난 / 오늘 마감 / 최근 할 일 구분
  const overdueTasks = allTasks.filter(t => !t.completed && t.due_date && t.due_date < todayStr)
  const dueTodayTasks = allTasks.filter(t => !t.completed && t.due_date && t.due_date === todayStr)
  const urgentTasks = [...overdueTasks, ...dueTodayTasks]
  const tasks = urgentTasks.length > 0 ? urgentTasks.slice(0, 3) : allTasks.filter(t => !t.completed).slice(0, 3)

  function sectionTitle() {
    if (overdueTasks.length > 0 && dueTodayTasks.length > 0) return `⚠️ 기한 지남 ${overdueTasks.length}개 · 오늘 마감 ${dueTodayTasks.length}개`
    if (overdueTasks.length > 0) return `⚠️ 기한 지난 할 일 ${overdueTasks.length}개`
    if (dueTodayTasks.length > 0) return '오늘 마감 할 일'
    return '최근 할 일'
  }

  const handleToggle = async (task: Task) => {
    // Optimistic update
    setAllTasks(prev => {
      const next = prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
      setOpenCount(next.filter(t => !t.completed).length)
      return next
    })
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('tasks').update({
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null
    }).eq('id', task.id)
    if (error) {
      // Rollback
      setAllTasks(prev => {
        const next = prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t)
        setOpenCount(next.filter(t => !t.completed).length)
        return next
      })
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 60%, var(--bg) 100%)',
        color: 'var(--ink)',
        position: 'relative',
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
    >
      {/* iOS PWA install banner */}
      {showInstallBanner && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          color: '#fff', padding: 'calc(env(safe-area-inset-top) + 10px) 16px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 14 }}>알림을 받으려면 홈 화면에 추가하세요 📲</div>
            <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 12, opacity: 0.85, marginTop: 2 }}>Safari → 공유 버튼 → 홈 화면에 추가</div>
          </div>
          <button
            onClick={() => { setShowInstallBanner(false); localStorage.setItem('pwa_install_dismissed', '1'); }}
            style={{ border: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', cursor: 'pointer', padding: '4px 10px', fontFamily: 'Jua, sans-serif', fontSize: 12 }}
          >닫기</button>
        </div>
      )}

      {/* Header clouds - pointer-events none so they don't block taps */}
      <div style={{ position: 'absolute', top: 58, left: -20, animation: 'floatCloud 8s ease-in-out infinite', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}>
        <CloudDeco size={100} opacity={1} />
      </div>
      <div style={{ position: 'absolute', top: 130, right: -30, animation: 'floatCloud 10s ease-in-out infinite 2s', opacity: 0.35, pointerEvents: 'none', zIndex: 0 }}>
        <CloudDeco size={90} opacity={1} />
      </div>

      {/* Top text */}
      <div style={{ padding: '14px 22px 0', position: 'relative', zIndex: 2 }}>
        {/* Weather row + D-day badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'Jua, sans-serif' }}>
            <span>{new Date().getMonth() + 1}월 {new Date().getDate()}일({['일','월','화','수','목','금','토'][new Date().getDay()]})</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>서울</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{weather.label}</span>
            <span>{weather.emoji}</span>
            {weather.temp !== null && <span style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>{weather.temp}°C</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--peach), var(--pink))',
              borderRadius: 100,
              padding: '3px 12px',
              fontFamily: 'Jua, sans-serif',
              fontSize: 13,
              color: '#fff',
              boxShadow: 'var(--shadow-soft)',
              whiteSpace: 'nowrap',
            }}>
              💞 D+{Math.floor((new Date().setHours(0,0,0,0) - new Date(anniversaryDate).setHours(0,0,0,0)) / 86400000)}
            </div>
            <button
              onClick={() => setEditingAnniversary(true)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-mute)', padding: '2px 4px' }}
              aria-label="기념일 수정"
            >✏️</button>
          </div>
          {editingAnniversary && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
              onClick={() => setEditingAnniversary(false)}>
              <div style={{ background: 'var(--card)', borderRadius: 20, padding: 24, margin: 20 }} onClick={e => e.stopPropagation()}>
                <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 18, marginBottom: 16 }}>💑 기념일 설정</div>
                <input
                  type="date"
                  defaultValue={anniversaryDate}
                  onChange={async (e) => {
                    const newDate = e.target.value;
                    setAnniversaryDate(newDate);
                    try {
                      await getSupabaseClient().from('app_config').upsert(
                        { key: 'anniversary_date', value: { date: newDate }, updated_at: new Date().toISOString() },
                        { onConflict: 'key' }
                      );
                    } catch { /* ignore */ }
                    setEditingAnniversary(false);
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--accent-soft)', borderRadius: 12, fontFamily: 'Jua, sans-serif', fontSize: 16, background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
                />
              </div>
            </div>
          )}
        </div>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 28, lineHeight: 1.2, letterSpacing: -0.5, marginTop: 4 }}>
          <span style={{ color: 'var(--accent-deep)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            오리 레인저
            {/* 파워레인저 헬멧 쓴 오리 SVG */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 몸통 */}
              <ellipse cx="16" cy="22" rx="8" ry="7" fill="#FCD34D"/>
              {/* 날개 */}
              <ellipse cx="9" cy="23" rx="3.5" ry="2" fill="#F59E0B" transform="rotate(-15 9 23)"/>
              <ellipse cx="23" cy="23" rx="3.5" ry="2" fill="#F59E0B" transform="rotate(15 23 23)"/>
              {/* 헬멧 (파워레인저 스타일) */}
              <ellipse cx="16" cy="13" rx="8" ry="8.5" fill="#EF4444"/>
              {/* 헬멧 바이저 (눈 부분 검은 V자) */}
              <path d="M9 12 L16 17 L23 12" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M9 12 Q16 10 23 12 L23 14 Q16 12 9 14 Z" fill="#111827"/>
              {/* 헬멧 꼭대기 핀 */}
              <rect x="14.5" y="4" width="3" height="5" rx="1.5" fill="#DC2626"/>
              {/* 부리 */}
              <ellipse cx="16" cy="19.5" rx="3" ry="1.5" fill="#F97316"/>
              {/* 발 */}
              <ellipse cx="13" cy="29" rx="2.5" ry="1.2" fill="#F97316"/>
              <ellipse cx="19" cy="29" rx="2.5" ry="1.2" fill="#F97316"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Character area */}
      <div style={{ position: 'relative', height: 220, margin: '12px 0 8px' }}>
        {/* Duck (창희) + 말풍선 */}
        <div style={{ position: 'absolute', left: '8%', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {duckMood && (
            <div style={{
              background: 'var(--duck-soft)', border: '1.5px solid var(--duck)', borderRadius: '14px 14px 14px 4px',
              padding: '5px 10px', fontFamily: 'Jua, sans-serif', fontSize: 12, color: 'var(--duck-deep)',
              maxWidth: 100, wordBreak: 'keep-all', lineHeight: 1.3, whiteSpace: 'pre-wrap',
            }}>
              {duckMood.emoji} {duckMood.text || ''}
              {(() => {
                const updatedAt = duckMood.updated_at ? new Date(duckMood.updated_at) : null;
                if (!updatedAt) return null;
                const diffMs = Date.now() - updatedAt.getTime();
                const diffH = Math.floor(diffMs / 3600000);
                const diffD = Math.floor(diffMs / 86400000);
                const label = diffD >= 1 ? `${diffD}일 전` : diffH >= 1 ? `${diffH}시간 전` : '방금';
                return <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2, textAlign: 'right' }}>{label}</div>;
              })()}
            </div>
          )}
          <button onClick={() => { setMoodTarget('duck'); setMoodEmoji(duckMood?.emoji ?? '😊'); setMoodDraft(duckMood?.text ?? ''); setMoodModal(true) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'bobY 3.5s ease-in-out infinite' }}>
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 몸통 */}
              <ellipse cx="55" cy="78" rx="28" ry="25" fill="#FDE68A"/>
              {/* 날개 L */}
              <ellipse cx="28" cy="82" rx="12" ry="7" fill="#FBBF24" transform="rotate(-20 28 82)"/>
              {/* 날개 R */}
              <ellipse cx="82" cy="82" rx="12" ry="7" fill="#FBBF24" transform="rotate(20 82 82)"/>
              {/* 헬멧 */}
              <ellipse cx="55" cy="44" rx="27" ry="30" fill="#EF4444"/>
              {/* 헬멧 광택 */}
              <ellipse cx="45" cy="30" rx="9" ry="6" fill="#FCA5A5" opacity="0.5"/>
              {/* 헬멧 핀 */}
              <rect x="50" y="12" width="10" height="16" rx="5" fill="#DC2626"/>
              {/* 바이저 */}
              <path d="M30 43 Q55 56 80 43 Q55 36 30 43Z" fill="#1E293B"/>
              {/* 바이저 반짝임 */}
              <path d="M34 41 Q55 52 76 41" stroke="#475569" strokeWidth="2" fill="none" opacity="0.4"/>
              {/* 부리 */}
              <path d="M46 70 Q55 76 64 70 Q55 82 46 70Z" fill="#FB923C"/>
              {/* 볼터치 */}
              <ellipse cx="36" cy="60" rx="6" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
              <ellipse cx="74" cy="60" rx="6" ry="3.5" fill="#FCA5A5" opacity="0.4"/>
              {/* 발 */}
              <ellipse cx="43" cy="104" rx="11" ry="5" fill="#FB923C"/>
              <ellipse cx="67" cy="104" rx="11" ry="5" fill="#FB923C"/>
              {/* 별 */}
              <text x="76" y="22" fontSize="18" textAnchor="middle">⭐</text>
            </svg>
          </button>
          {!duckMood && (
            <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 11, color: 'var(--ink-mute)', marginTop: -4, textAlign: 'center' }}>
              탭 👆
            </div>
          )}
        </div>

        {/* Dolphin (하경) + 말풍선 */}
        <div style={{ position: 'absolute', right: '8%', bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {dolphinMood && (
            <div style={{
              background: 'var(--dolphin-soft)', border: '1.5px solid var(--dolphin)', borderRadius: '14px 14px 4px 14px',
              padding: '5px 10px', fontFamily: 'Jua, sans-serif', fontSize: 12, color: 'var(--accent-deep)',
              maxWidth: 100, wordBreak: 'keep-all', lineHeight: 1.3, whiteSpace: 'pre-wrap', textAlign: 'right',
            }}>
              {dolphinMood.emoji} {dolphinMood.text || ''}
              {(() => {
                const updatedAt = dolphinMood.updated_at ? new Date(dolphinMood.updated_at) : null;
                if (!updatedAt) return null;
                const diffMs = Date.now() - updatedAt.getTime();
                const diffH = Math.floor(diffMs / 3600000);
                const diffD = Math.floor(diffMs / 86400000);
                const label = diffD >= 1 ? `${diffD}일 전` : diffH >= 1 ? `${diffH}시간 전` : '방금';
                return <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2, textAlign: 'right' }}>{label}</div>;
              })()}
            </div>
          )}
          <button onClick={() => { setMoodTarget('dolphin'); setMoodEmoji(dolphinMood?.emoji ?? '😊'); setMoodDraft(dolphinMood?.text ?? ''); setMoodModal(true) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', animation: 'jumpDolphin 2.8s ease-in-out infinite' }}>
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 꼬리 */}
              <path d="M55 95 Q40 105 30 100 Q45 90 55 95Z" fill="#60A5FA"/>
              <path d="M55 95 Q70 105 80 100 Q65 90 55 95Z" fill="#60A5FA"/>
              {/* 몸통 */}
              <ellipse cx="55" cy="76" rx="24" ry="22" fill="#93C5FD"/>
              {/* 지느러미 L */}
              <path d="M32 72 Q20 80 22 90 Q30 80 36 78Z" fill="#60A5FA"/>
              {/* 지느러미 R */}
              <path d="M78 72 Q90 80 88 90 Q80 80 74 78Z" fill="#60A5FA"/>
              {/* 헬멧 */}
              <ellipse cx="55" cy="44" rx="26" ry="28" fill="#A78BFA"/>
              {/* 헬멧 광택 */}
              <ellipse cx="45" cy="30" rx="8" ry="5.5" fill="#C4B5FD" opacity="0.55"/>
              {/* 등지느러미/핀 */}
              <path d="M49 14 Q55 6 61 14 Q57 12 55 14 Q53 12 49 14Z" fill="#7C3AED"/>
              {/* 바이저 */}
              <path d="M31 43 Q55 55 79 43 Q55 36 31 43Z" fill="#1E293B"/>
              {/* 바이저 반짝임 */}
              <path d="M35 41 Q55 51 75 41" stroke="#6366F1" strokeWidth="2" fill="none" opacity="0.5"/>
              {/* 입 */}
              <path d="M45 68 Q55 74 65 68" stroke="#7C3AED" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* 볼터치 */}
              <ellipse cx="37" cy="58" rx="6" ry="3.5" fill="#C4B5FD" opacity="0.5"/>
              <ellipse cx="73" cy="58" rx="6" ry="3.5" fill="#C4B5FD" opacity="0.5"/>
              {/* 반짝임 */}
              <text x="78" y="22" fontSize="18" textAnchor="middle">✨</text>
            </svg>
          </button>
          {!dolphinMood && (
            <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 11, color: 'var(--ink-mute)', marginTop: -4, textAlign: 'center' }}>
              탭 👆
            </div>
          )}
        </div>

        <svg style={{ position: 'absolute', bottom: 24, right: '22%', pointerEvents: 'none' }} width="24" height="40" viewBox="0 0 24 40">
          <circle cx="12" cy="32" r="3" fill="var(--accent)" opacity="0.5" />
          <circle cx="8" cy="20" r="2" fill="var(--accent)" opacity="0.35" />
          <circle cx="15" cy="10" r="2.5" fill="var(--accent)" opacity="0.25" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, #CDE9F600 0%, var(--accent-soft) 100%)', borderRadius: '50% 50% 0 0 / 20% 20% 0 0', pointerEvents: 'none' }} />
      </div>

      {/* 기분 설정 모달 */}
      {moodModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setMoodModal(false)}>
          <div style={{ background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 17, marginBottom: 14, textAlign: 'center' }}>
              {moodTarget === 'duck' ? '🦆 창희' : '🐬 하경'} 오늘 기분은?
            </div>
            {/* 감정 칩 선택 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MOODS.map(m => {
                const selected = moodEmoji === m.emoji
                return (
                  <button
                    key={m.emoji}
                    onClick={() => setMoodEmoji(m.emoji)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                      background: selected ? m.bg : 'var(--bg)',
                      outline: selected ? `2px solid ${m.color}` : '2px solid transparent',
                      transition: 'all 0.15s',
                      transform: selected ? 'scale(1.06)' : 'scale(1)',
                    }}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{m.emoji}</span>
                    <span style={{
                      fontFamily: 'Jua, sans-serif', fontSize: 15,
                      color: selected ? m.color : 'var(--ink-mute)',
                      fontWeight: selected ? 700 : 400,
                    }}>{m.label}</span>
                  </button>
                )
              })}
            </div>
            {/* 텍스트 입력 */}
            <input
              value={moodDraft}
              onChange={e => setMoodDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMood()}
              placeholder="한 줄 메시지 (선택)"
              maxLength={20}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 14, border: '2px solid var(--accent-soft)', fontFamily: 'Jua, sans-serif', fontSize: 15, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', marginBottom: 12 }}
            />
            <button onClick={saveMood} style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', color: '#fff', fontFamily: 'Jua, sans-serif', fontSize: 16, cursor: 'pointer' }}>
              저장하기 {moodEmoji}
            </button>
          </div>
        </div>
      )}

      {/* BigCard row */}
      <div style={{ padding: '8px 18px', display: 'flex', gap: 12 }}>
        <BigCard
          title="할 일"
          count={urgentTasks.length > 0 ? urgentTasks.length : openCount}
          subtitle={overdueTasks.length > 0 ? '긴급 처리 필요' : dueTodayTasks.length > 0 ? '오늘 마감' : '미완료 전체'}
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
            : "기록 불러오는 중..."}
          color="var(--accent)"
          colorDeep="var(--accent-deep)"
          icon="weight"
          onClick={() => router.push('/weight')}
        />
      </div>

      {/* Today's tasks */}
      <div style={{ padding: '10px 18px 0' }}>
        <div style={{ background: 'var(--card)', borderRadius: 24, padding: 16, boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16 }}>{sectionTitle()}</div>
            <button
              onClick={() => router.push('/tasks')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Gaegu, sans-serif', fontSize: 13, color: 'var(--accent)' }}
            >
              전체 보기 →
            </button>
          </div>
          {tasks.length === 0 && (
            <div style={{ fontFamily: 'Gaegu, sans-serif', fontSize: 14, color: 'var(--ink-mute)', textAlign: 'center', padding: '12px 0' }}>
              할 일이 없어요 🎉
            </div>
          )}
          {tasks.map(t => (
            <TinyTask key={t.id} t={t} onToggle={() => handleToggle(t)} todayStr={todayStr} />
          ))}
        </div>
      </div>

    </div>
  )
}
