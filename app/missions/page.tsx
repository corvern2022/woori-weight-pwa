'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

// ── 사전 정의 미션 목록 ──────────────────────────────────────────────────────
const PRESET_MISSIONS = [
  { id: 'no_drink_30',  emoji: '🚫🍺', title: '30일 금주', desc: '30일 동안 술을 마시지 않아요', days: 30, category: '건강' },
  { id: 'no_drink_7',   emoji: '🧃',    title: '7일 금주',  desc: '일주일 동안 술 없이 지내봐요',   days: 7,  category: '건강' },
  { id: 'weight_duck_5', emoji: '🦆💪', title: '창희 5kg 감량', desc: '창희가 5kg 감량에 도전해요', days: 90, category: '다이어트' },
  { id: 'weight_dolphin_3', emoji: '🐬✨', title: '하경 3kg 감량', desc: '하경이 3kg 감량에 도전해요', days: 60, category: '다이어트' },
  { id: 'date_weekly',  emoji: '💑',    title: '주 1회 데이트', desc: '매주 함께 특별한 시간을 보내요', days: 28, category: '커플' },
  { id: 'morning_msg',  emoji: '🌅',    title: '30일 아침 메시지', desc: '매일 아침 서로에게 메시지를 보내요', days: 30, category: '커플' },
  { id: 'walk_30',      emoji: '🚶',    title: '30일 함께 산책', desc: '매일 함께 산책해요', days: 30, category: '건강' },
  { id: 'cook_together', emoji: '👨‍🍳',  title: '주 1회 요리', desc: '매주 함께 요리를 해요', days: 28, category: '커플' },
  { id: 'no_phone_dinner', emoji: '📵', title: '식사 중 폰 금지', desc: '저녁 식사 시간엔 스마트폰을 내려놔요', days: 14, category: '커플' },
  { id: 'sleep_early',  emoji: '😴',    title: '2주 일찍 자기', desc: '자정 전에 함께 잠들기', days: 14, category: '건강' },
]

type MissionStatus = 'active' | 'completed' | 'failed'

type Mission = {
  id: string
  preset_id: string
  title: string
  emoji: string
  desc: string
  started_at: string
  days: number
  status: MissionStatus
  completed_at?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  '건강':    '#4ade80',
  '다이어트': '#fb923c',
  '커플':    '#f472b6',
}

function daysLeft(startedAt: string, days: number): number {
  const start = new Date(startedAt).setHours(0, 0, 0, 0)
  const end = start + days * 86400000
  const now = Date.now()
  return Math.max(0, Math.ceil((end - now) / 86400000))
}

function progressPct(startedAt: string, days: number): number {
  const start = new Date(startedAt).setHours(0, 0, 0, 0)
  const elapsed = Date.now() - start
  return Math.min(100, Math.round((elapsed / (days * 86400000)) * 100))
}

export default function MissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [celebrating, setCelebrating] = useState<string | null>(null)

  const loadMissions = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'missions')
      .single()
    if (data?.value) {
      setMissions(data.value as Mission[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadMissions() }, [loadMissions])

  // 자동 완료 체크: 기간 지난 active 미션을 completed로
  useEffect(() => {
    const now = Date.now()
    let changed = false
    const updated = missions.map(m => {
      if (m.status === 'active') {
        const end = new Date(m.started_at).setHours(0, 0, 0, 0) + m.days * 86400000
        if (now > end) { changed = true; return { ...m, status: 'completed' as MissionStatus, completed_at: new Date(end).toISOString() } }
      }
      return m
    })
    if (changed) saveMissions(updated)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(missions)])

  async function saveMissions(list: Mission[]) {
    setMissions(list)
    const supabase = getSupabaseClient()
    await supabase.from('app_config').upsert({ key: 'missions', value: list, updated_at: new Date().toISOString() })
  }

  async function startMission(preset: typeof PRESET_MISSIONS[0]) {
    const already = missions.find(m => m.preset_id === preset.id && m.status === 'active')
    if (already) return
    const m: Mission = {
      id: `${preset.id}_${Date.now()}`,
      preset_id: preset.id,
      title: preset.title,
      emoji: preset.emoji,
      desc: preset.desc,
      started_at: new Date().toISOString(),
      days: preset.days,
      status: 'active',
    }
    await saveMissions([m, ...missions])
    setShowPicker(false)
  }

  async function completeMission(id: string) {
    const updated = missions.map(m =>
      m.id === id ? { ...m, status: 'completed' as MissionStatus, completed_at: new Date().toISOString() } : m
    )
    await saveMissions(updated)
    setCelebrating(id)
    setTimeout(() => setCelebrating(null), 3000)
  }

  async function failMission(id: string) {
    const updated = missions.map(m =>
      m.id === id ? { ...m, status: 'failed' as MissionStatus, completed_at: new Date().toISOString() } : m
    )
    await saveMissions(updated)
  }

  async function deleteMission(id: string) {
    await saveMissions(missions.filter(m => m.id !== id))
  }

  const active = missions.filter(m => m.status === 'active')
  const done = missions.filter(m => m.status !== 'active')

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'Jua, sans-serif' }}>
      {/* 헤더 */}
      <div style={{ padding: '56px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'var(--card)', border: 'none', borderRadius: 12, width: 40, height: 40, cursor: 'pointer', color: 'var(--ink)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >←</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🎯 커플 미션</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>함께 도전해요</div>
        </div>
      </div>

      {/* 진행 중 미션 */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>진행 중 {active.length > 0 && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>{active.length}</span>}</div>
          <button
            onClick={() => setShowPicker(true)}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >+ 새 미션</button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)' }}>불러오는 중...</div>}

        {!loading && active.length === 0 && (
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>아직 진행 중인 미션이 없어요</div>
            <div style={{ color: 'var(--ink-muted)', fontSize: 13 }}>+ 새 미션 버튼을 눌러 시작해요!</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {active.map(m => {
            const pct = progressPct(m.started_at, m.days)
            const left = daysLeft(m.started_at, m.days)
            const isCelebrating = celebrating === m.id
            return (
              <div key={m.id} style={{ background: 'var(--card)', borderRadius: 20, padding: '18px 16px', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
                {isCelebrating && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 36, borderRadius: 20 }}>
                    🎉🎊✨🎉🎊✨
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 32 }}>{m.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{m.title}</div>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 12, marginTop: 2 }}>{m.desc}</div>

                    {/* 프로그레스 바 */}
                    <div style={{ marginTop: 12, height: 8, background: 'var(--bg)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--dolphin))', borderRadius: 99, transition: 'width 0.6s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--ink-muted)' }}>
                      <span>{pct}% 완료</span>
                      <span>D-{left} 남음</span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => completeMission(m.id)}
                    style={{ flex: 1, background: '#4ade8022', color: '#16a34a', border: '1px solid #4ade80', borderRadius: 12, padding: '8px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >🏆 완료 선언</button>
                  <button
                    onClick={() => failMission(m.id)}
                    style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px', fontSize: 13, color: 'var(--ink-muted)', cursor: 'pointer' }}
                  >포기</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 완료된 미션 */}
      {done.length > 0 && (
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>완료한 미션 🏆</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {done.map(m => (
              <div key={m.id} style={{ background: 'var(--card)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.75 }}>
                <div style={{ fontSize: 26 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                    {m.status === 'completed' ? '✅ 성공!' : '❌ 포기'} · {m.completed_at ? new Date(m.completed_at).toLocaleDateString('ko-KR') : ''}
                  </div>
                </div>
                <button onClick={() => deleteMission(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-muted)' }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />

      {/* 미션 선택 바텀시트 */}
      {showPicker && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowPicker(false)}
        >
          <div
            style={{ width: '100%', background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '20px 0 32px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 17, paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>미션 선택</div>
            {Object.entries(
              PRESET_MISSIONS.reduce((acc, p) => { (acc[p.category] ??= []).push(p); return acc }, {} as Record<string, typeof PRESET_MISSIONS>)
            ).map(([cat, presets]) => (
              <div key={cat} style={{ padding: '12px 20px 0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: CATEGORY_COLORS[cat] ?? 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</div>
                {presets.map(p => {
                  const isActive = missions.some(m => m.preset_id === p.id && m.status === 'active')
                  return (
                    <button
                      key={p.id}
                      disabled={isActive}
                      onClick={() => startMission(p)}
                      style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 4px', background: 'none', border: 'none', cursor: isActive ? 'default' : 'pointer', opacity: isActive ? 0.5 : 1, textAlign: 'left', color: 'var(--ink)' }}
                    >
                      <span style={{ fontSize: 28 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title} {isActive && '(진행 중)'}</div>
                        <div style={{ color: 'var(--ink-muted)', fontSize: 12 }}>{p.desc} · {p.days}일</div>
                      </div>
                      {!isActive && <span style={{ fontSize: 18, color: 'var(--accent)' }}>+</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
