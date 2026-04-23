'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Duck, Dolphin } from '@/components/characters';
import { useTheme } from '@/lib/themeContext';
import { getSupabaseClient } from '@/lib/supabase';

function getDaysTogether(): number {
  const start = new Date('2023-07-08');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function BackBtn() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'Jua, sans-serif', fontSize: 15,
        color: 'var(--accent-deep)', padding: 0,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      홈
    </button>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 13, color: 'var(--ink-soft)', padding: '0 6px 6px', letterSpacing: 0.5 }}>{title}</div>
      <div style={{ background: 'var(--card)', borderRadius: 20, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, value, onToggle, hint }: { label: string; value: boolean; onToggle: () => void; hint?: string }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(42,61,84,0.08)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 15 }}>{label}</div>
        {hint && <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 12, color: 'var(--ink-soft)' }}>{hint}</div>}
      </div>
      <button onClick={onToggle} style={{
        width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--ink-mute)',
        position: 'relative', transition: 'all 0.25s',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 10, background: '#fff',
          position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left 0.25s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}/>
      </button>
    </div>
  );
}

function EditableRow({ label, value, unit, onSave }: { label: string; value: string; unit: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(42,61,84,0.08)' }}>
      <div style={{ flex: 1, fontFamily: 'Jua, sans-serif', fontSize: 15 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{
              width: 70, padding: '4px 8px', borderRadius: 10, border: '1.5px solid var(--accent)',
              fontFamily: 'Jua, sans-serif', fontSize: 15, textAlign: 'center',
              background: 'var(--bg)', color: 'var(--ink)', outline: 'none',
            }}
            autoFocus
          />
          <span style={{ fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-soft)' }}>{unit}</span>
          <button onClick={handleSave} style={{ border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '4px 10px', fontFamily: 'Jua, sans-serif', fontSize: 13, cursor: 'pointer' }}>저장</button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Gaegu, cursive', fontSize: 14, color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {value}{unit} <span style={{ fontSize: 12 }}>✏️</span>
        </button>
      )}
    </div>
  );
}

export function SettingsPageClient() {
  const { dark, setDark } = useTheme();
  const [notif, setNotif] = useState(true);
  const [duckGoal, setDuckGoal] = useState('69.0');
  const [dolphinGoal, setDolphinGoal] = useState('50.0');
  const [drinkLimit, setDrinkLimit] = useState('2');
  const [toast, setToast] = useState<string | null>(null);
  const days = getDaysTogether();

  useEffect(() => {
    async function loadGoals() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.from('app_config').select('key, value').in('key', ['goal_duck', 'goal_dolphin', 'drink_limit']);
        if (!data) return;
        data.forEach((row: { key: string; value: { v: string } | string }) => {
          const v = typeof row.value === 'object' && row.value !== null ? (row.value as { v: string }).v : String(row.value);
          if (row.key === 'goal_duck') setDuckGoal(v);
          if (row.key === 'goal_dolphin') setDolphinGoal(v);
          if (row.key === 'drink_limit') setDrinkLimit(v);
        });
      } catch { /* ignore */ }
    }
    void loadGoals();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function saveGoal(key: string, value: string) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('app_config').upsert({ key, value: { v: value }, updated_at: new Date().toISOString() });
      showToast('저장됐어 ✅');
    } catch {
      showToast('저장 실패');
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 22px 10px' }}>
        <BackBtn />
        <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 30, letterSpacing: -0.5, marginTop: 4 }}>설정</div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 50px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Couple card */}
        <div style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--card))', borderRadius: 22, padding: 16, boxShadow: 'var(--shadow-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Duck size={44} variant="strong" palette="yellow"/>
          <Dolphin size={48} variant="happy" palette="blue"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Jua, sans-serif', fontSize: 16 }}>창희 &amp; 하경</div>
            <div style={{ fontFamily: 'Gaegu, cursive', fontSize: 13, color: 'var(--ink-soft)' }}>함께한 지 {days}일 💞 시작일 2023.07.08</div>
          </div>
        </div>

        <SettingGroup title="화면">
          <SettingRow label="다크모드 🌙" value={dark} onToggle={() => setDark(!dark)} hint="야간에 눈이 편해"/>
        </SettingGroup>

        <SettingGroup title="알림">
          <SettingRow label="푸시 알림" value={notif} onToggle={() => setNotif(!notif)} hint="할 일 · 댓글 · 체중 입력 알림"/>
        </SettingGroup>

        <SettingGroup title="목표">
          <EditableRow label="🦆 창희 목표 체중" value={duckGoal} unit="kg" onSave={v => { setDuckGoal(v); saveGoal('goal_duck', v); }} />
          <EditableRow label="🐬 하경 목표 체중" value={dolphinGoal} unit="kg" onSave={v => { setDolphinGoal(v); saveGoal('goal_dolphin', v); }} />
          <EditableRow label="🍺 주 음주 제한" value={drinkLimit} unit="회" onSave={v => { setDrinkLimit(v); saveGoal('drink_limit', v); }} />
        </SettingGroup>

        <div style={{ textAlign: 'center', fontFamily: 'Gaegu, cursive', fontSize: 12, color: 'var(--ink-mute)', marginTop: 10 }}>
          오리 레인저 v1.0 · made with 🩵
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff', fontSize: 14, borderRadius: 100, padding: '8px 16px', zIndex: 50, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
