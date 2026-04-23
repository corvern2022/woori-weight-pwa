'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Duck } from '@/components/characters/Duck'
import { Dolphin } from '@/components/characters/Dolphin'
import { Avatar } from '@/components/ui/Avatar'
import { CloudDeco } from '@/components/ui/CloudDeco'
import { getSupabaseClient } from '@/lib/supabase'
import { useWeather } from '@/lib/useWeather'
import type { Task } from '@/components/tasks/types'

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
function TinyTask({ t, onToggle }: { t: Task; onToggle: () => void }) {
  const whoMap: Record<string, string> = { 하경: 'dolphin', 창희: 'duck', 둘다: 'duck' }
  void whoMap
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 0',
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
          margin: '-12px -12px -12px -12px',
        }}
      >
        <div style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          background: t.completed ? 'var(--accent)' : 'transparent',
          border: t.completed ? 'none' : '2px solid var(--ink-mute)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {t.completed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M2 5l2 2 4-5" />
            </svg>
          )}
        </div>
      </button>
      <div
        style={{
          flex: 1,
          fontFamily: 'Gaegu, sans-serif',
          fontSize: 15,
          color: t.completed ? 'var(--ink-mute)' : 'var(--ink)',
          textDecoration: t.completed ? 'line-through' : 'none',
        }}
      >
        {t.title}
      </div>
      <Avatar who={t.assignee === '하경' ? '하경' : '창희'} size={22} />
    </div>
  )
}

// ── DockBtn ──────────────────────────────────────────────────────────────────
function DockBtn({ onClick, icon, label }: { onClick: () => void; icon: 'chat' | 'drink' | 'gear'; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: 'var(--card)',
        border: 'none',
        borderRadius: 16,
        padding: '10px 6px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon === 'chat' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2h12v9H9l-3 3v-3H2z" />
          </svg>
        )}
        {icon === 'drink' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2l1 8h4l1-8H5z" />
            <path d="M6 10v4M10 10v4M5 14h6" />
          </svg>
        )}
        {icon === 'gear' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 11 }}>{label}</div>
    </button>
  )
}

// ── HomePage ─────────────────────────────────────────────────────────────────
const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export default function HomePage() {
  const router = useRouter()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [duckKg, setDuckKg] = useState<number | null>(null)
  const [dolphinKg, setDolphinKg] = useState<number | null>(null)
  const weather = useWeather()
  const today = DAYS[new Date().getDay()]
  const todayStr = new Date().toISOString().slice(0, 10)

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

    // 최근 체중 - 멤버 조회 후 각각 마지막 기록
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
  }, [])

  // 오늘 마감이거나 기한 지난 것 우선, 없으면 최근 추가된 것
  const todayTasks = allTasks.filter(t => t.due_date && t.due_date <= todayStr).slice(0, 3)
  const tasks = todayTasks.length > 0 ? todayTasks : allTasks.slice(0, 3)

  const handleToggle = async (task: Task) => {
    const supabase = getSupabaseClient()
    await supabase.from('tasks').update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null }).eq('id', task.id)
    setAllTasks(prev => {
      const next = prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
      setOpenCount(next.filter(t => !t.completed).length)
      return next
    })
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 60%, var(--bg) 100%)',
        color: 'var(--ink)',
        position: 'relative',
        paddingBottom: 40,
      }}
    >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 15, color: 'var(--ink-soft)', fontFamily: 'Gaegu, sans-serif' }}>
              {today} · {weather.label} {weather.emoji}
            </div>
            {weather.temp !== null && (
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-soft), var(--card))',
                border: '1.5px solid var(--accent-soft)',
                borderRadius: 100,
                padding: '2px 10px',
                fontFamily: 'Jua, sans-serif',
                fontSize: 14,
                color: 'var(--accent-deep)',
              }}>
                {weather.temp}°C
              </div>
            )}
          </div>
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
            💞 D+{Math.floor((new Date().setHours(0,0,0,0) - new Date('2023-07-08').setHours(0,0,0,0)) / 86400000)}
          </div>
        </div>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 28, lineHeight: 1.2, letterSpacing: -0.5, marginTop: 4 }}>
          안녕, <span style={{ color: 'var(--accent-deep)' }}>창희하경!</span>
        </div>
      </div>

      {/* Character area - pointerEvents none so characters don't steal taps */}
      <div style={{ position: 'relative', height: 200, margin: '16px 0 8px', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: '10%', bottom: 16, animation: 'bobY 3.5s ease-in-out infinite' }}>
          <Duck size={120} variant="strong" palette="yellow" />
        </div>
        <div style={{ position: 'absolute', right: '10%', bottom: 16, animation: 'jumpDolphin 2.8s ease-in-out infinite' }}>
          <Dolphin size={120} variant="happy" palette="blue" />
        </div>
        <svg style={{ position: 'absolute', bottom: 24, right: '22%' }} width="24" height="40" viewBox="0 0 24 40">
          <circle cx="12" cy="32" r="3" fill="var(--accent)" opacity="0.5" />
          <circle cx="8" cy="20" r="2" fill="var(--accent)" opacity="0.35" />
          <circle cx="15" cy="10" r="2.5" fill="var(--accent)" opacity="0.25" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, #CDE9F600 0%, var(--accent-soft) 100%)', borderRadius: '50% 50% 0 0 / 20% 20% 0 0' }} />
      </div>

      {/* BigCard row */}
      <div style={{ padding: '8px 18px', display: 'flex', gap: 12 }}>
        <BigCard
          title="할 일"
          count={openCount}
          subtitle="오늘 남음"
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
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16 }}>{todayTasks.length > 0 ? '오늘 마감 할 일' : '최근 할 일'}</div>
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
            <TinyTask key={t.id} t={t} onToggle={() => handleToggle(t)} />
          ))}
        </div>
      </div>

      {/* Bottom dock */}
      <div style={{ padding: '14px 18px 0', display: 'flex', gap: 10 }}>
        <DockBtn onClick={() => router.push('/chat')} icon="chat" label="AI 코치" />
        <DockBtn onClick={() => router.push('/drink')} icon="drink" label="음주 캘린더" />
        <DockBtn onClick={() => router.push('/settings')} icon="gear" label="설정" />
      </div>
    </div>
  )
}
