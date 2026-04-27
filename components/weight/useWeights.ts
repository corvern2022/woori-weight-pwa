"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { sendPushToPartner } from "@/lib/usePush";
import { toSeoulISODate } from "@/lib/date";

const LOCAL_KEY = "woori_weight_user_id";

export type WeightEntry = { date: string; kg: number };

export function useWeights() {
  const supabase = useMemo(() => {
    try { return getSupabaseClient(); } catch { return null; }
  }, []);

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [duckId, setDuckId] = useState<string | null>(null);
  const [dolphinId, setDolphinId] = useState<string | null>(null);
  const [duckWeights, setDuckWeights] = useState<number[]>([]);
  const [dolphinWeights, setDolphinWeights] = useState<number[]>([]);
  const [duckEntries, setDuckEntries] = useState<WeightEntry[]>([]);
  const [dolphinEntries, setDolphinEntries] = useState<WeightEntry[]>([]);
  const [duckGoal, setDuckGoal] = useState<number | null>(null);
  const [dolphinGoal, setDolphinGoal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) setMyUserId(saved);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, myUserId]);

  // Supabase Realtime 구독
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('weights-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weigh_ins' }, () => { loadData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, () => { loadData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function loadData() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: memberRows } = await supabase
        .from("household_members")
        .select("user_id, display_name, household_id");

      const members = (memberRows ?? []) as Array<{ user_id: string; display_name: string }>;
      const myMember = myUserId ? members.find(m => m.user_id === myUserId) : members[0];
      const partnerMember = members.find(m => m.user_id !== myMember?.user_id);

      if (myMember) setMyUserId(myMember.user_id);
      if (partnerMember) setPartnerId(partnerMember.user_id);

      const { data: weighRows } = await supabase
        .from("weigh_ins")
        .select("date, user_id, weight_kg")
        .order("date", { ascending: true })
        .limit(200);

      const rows = (weighRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number }>;
      // dolphin = '하경', duck = whoever is not '하경'
      const resolvedDolphinId = members.find(m => m.display_name === '하경')?.user_id ?? null;
      const resolvedDuckId = members.find(m => m.display_name !== '하경')?.user_id ?? null;
      setDuckId(resolvedDuckId);
      setDolphinId(resolvedDolphinId);

      const duckData = rows.filter(r => r.user_id === resolvedDuckId).map(r => ({ date: r.date, kg: r.weight_kg }));
      const dolphinData = rows.filter(r => r.user_id === resolvedDolphinId).map(r => ({ date: r.date, kg: r.weight_kg }));

      if (duckData.length >= 1) setDuckEntries(duckData.slice(-30));
      if (dolphinData.length >= 1) setDolphinEntries(dolphinData.slice(-30));
      // backward compat: weights array
      if (duckData.length >= 1) setDuckWeights(duckData.slice(-30).map(e => e.kg));
      if (dolphinData.length >= 1) setDolphinWeights(dolphinData.slice(-30).map(e => e.kg));

      // Load goals from app_config
      const { data: cfgRows } = await supabase.from("app_config").select("key, value").in("key", ["goal_duck", "goal_dolphin"]);
      (cfgRows ?? []).forEach((row: { key: string; value: { v: string } | string }) => {
        const v = parseFloat(typeof row.value === 'object' ? (row.value as { v: string }).v : String(row.value));
        if (!isNaN(v)) {
          if (row.key === "goal_duck") setDuckGoal(v);
          if (row.key === "goal_dolphin") setDolphinGoal(v);
        }
      });
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }

  async function addWeight(who: 'duck' | 'dolphin', kg: number, date?: string) {
    const today = date ?? toSeoulISODate();
    const uid = who === 'duck' ? duckId : dolphinId;

    if (supabase && uid) {
      await supabase.from("weigh_ins").upsert(
        [{ user_id: uid, date: today, weight_kg: kg, drank: false }],
        { onConflict: "user_id,date" }
      );
    } else if (!uid) {
      setToast("유저 정보가 없어요. 잠시 후 다시 시도해주세요 😢");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setToast("기록 완료! 🎉");
    setTimeout(() => setToast(null), 2000);

    // 체중 기록 시 파트너에게 푸시
    const actor = typeof window !== 'undefined' ? (localStorage.getItem('ori_ranger_actor') ?? '') : '';
    const partnerUid = who === 'duck' ? partnerId : myUserId;
    if (supabase && partnerUid) {
      sendPushToPartner(partnerUid, `${actor}이(가) 체중을 기록했어요 ⚖️`, `오늘 몸무게: ${kg}kg`);
    }

    // Reload from DB so chart reflects actual saved data (including past-date entries)
    await loadData();
  }

  return { duckWeights, dolphinWeights, duckEntries, dolphinEntries, duckGoal, dolphinGoal, loading, toast, addWeight };
}
