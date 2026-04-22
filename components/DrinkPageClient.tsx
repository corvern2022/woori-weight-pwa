'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { HouseholdMember, WeighInRow } from '@/lib/types';
import { AlcoholCalendarCard } from '@/components/AlcoholCalendarCard';
import { BottomNav } from '@/components/ui';
import { Duck, Dolphin } from '@/components/characters';

const LOCAL_KEY = 'woori_weight_user_id';

export function DrinkPageClient() {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [rows, setRows] = useState<WeighInRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) setMyUserId(saved);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = getSupabaseClient();

        const { data: memberRows, error: memberError } = await supabase
          .from('household_members')
          .select('user_id, display_name, household_id');
        if (memberError) throw memberError;

        const safeMembers = (memberRows ?? []) as Array<HouseholdMember & { household_id: string }>;
        setMembers(safeMembers.map((m) => ({ user_id: m.user_id, display_name: m.display_name })));

        const hid = safeMembers[0]?.household_id ?? null;
        if (!hid) {
          setRows([]);
          return;
        }

        const since = new Date();
        since.setDate(since.getDate() - 365);
        const sinceISO = since.toISOString().slice(0, 10);

        const { data: weighRows, error: weighError } = await supabase
          .from('weigh_ins')
          .select('*')
          .eq('household_id', hid)
          .gte('date', sinceISO)
          .order('date', { ascending: true });
        if (weighError) throw weighError;

        setRows(
          ((weighRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number | string; drank?: boolean | null }>).map((r) => ({
            date: r.date,
            user_id: r.user_id,
            weight_kg: Number(r.weight_kg),
            drank: Boolean(r.drank),
          })),
        );
      } catch {
        // silently ignore errors for now
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const meId = myUserId ?? (members[0]?.user_id ?? '');

  return (
    <div className="bg-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-ink/10 shadow-soft safe-top">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-jua text-ink text-xl">음주 기록 🍺</h1>
          <div className="flex items-center gap-1">
            <Duck size={32} variant="head" />
            <Dolphin size={32} variant="head" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-peach animate-bounce [animation-delay:0ms]" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-peach animate-bounce [animation-delay:150ms]" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-peach animate-bounce [animation-delay:300ms]" />
          </div>
        ) : members.length === 0 ? (
          <p className="font-gaegu text-ink-soft text-center py-16">멤버 정보를 불러오는 중...</p>
        ) : (
          <AlcoholCalendarCard rows={rows} members={members} meId={meId} />
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
}
