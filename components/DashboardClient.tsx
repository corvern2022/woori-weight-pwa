"use client";

import { useEffect, useMemo, useState } from "react";
import { AiChat } from "@/components/AiChat";
import { AlcoholCalendarCard } from "@/components/AlcoholCalendarCard";
import { DeltaStats } from "@/components/DeltaStats";
import { GoalCard } from "@/components/GoalCard";
import { PeriodToggle } from "@/components/PeriodToggle";
import { TodayEntryCard } from "@/components/TodayEntryCard";
import { WeightChart } from "@/components/WeightChart";
import { BottomNav } from "@/components/ui";
import { addDaysISO, buildDateRange, toSeoulISODate } from "@/lib/date";
import { getSupabaseClient } from "@/lib/supabase";
import type { AiSummary, ChartPoint, HouseholdMember, WeighInRow } from "@/lib/types";

const LOCAL_KEY = "woori_weight_user_id";

function computeDelta(series: Array<{ date: string; kg: number }>, today: string, diff: number) {
  const map = new Map(series.map((p) => [p.date, p.kg]));
  const current = map.get(today);
  const past = map.get(addDaysISO(today, -diff));
  if (current == null || past == null) return null;
  return Math.round((current - past) * 10) / 10;
}

export function DashboardClient() {
  const supabaseInit = useMemo(() => {
    try {
      return { client: getSupabaseClient(), error: null as string | null };
    } catch (err) {
      return {
        client: null,
        error: err instanceof Error ? err.message : "Supabase 설정 오류",
      };
    }
  }, []);
  const supabase = supabaseInit.client;
  const supabaseError = supabaseInit.error;

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [rows, setRows] = useState<WeighInRow[]>([]);

  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [viewMode, setViewMode] = useState<"both" | "me">("both");
  const [weightInput, setWeightInput] = useState("");
  const [drank, setDrank] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [dietStartDate, setDietStartDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayISO = useMemo(() => toSeoulISODate(), []);

  useEffect(() => {
    if (!selectedDate) setSelectedDate(todayISO);
  }, [selectedDate, todayISO]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) setMyUserId(saved);
    }
  }, []);

  async function loadData() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data: memberRows, error: memberError } = await supabase
        .from("household_members")
        .select("user_id, display_name, household_id");
      if (memberError) throw memberError;

      const safeMembers = (memberRows ?? []) as Array<HouseholdMember & { household_id: string }>;
      setMembers(safeMembers.map((m) => ({ user_id: m.user_id, display_name: m.display_name })));

      const hid = safeMembers[0]?.household_id ?? null;
      setHouseholdId(hid);

      if (!hid) {
        setRows([]);
        return;
      }

      const { data: weighRows, error: weighError } = await supabase
        .from("weigh_ins")
        .select("*")
        .eq("household_id", hid)
        .order("date", { ascending: true });
      if (weighError) throw weighError;

      setRows(
        ((weighRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number | string; drank?: boolean | null }>).map((r) => ({
          date: r.date,
          user_id: r.user_id,
          weight_kg: Number(r.weight_kg),
          drank: Boolean(r.drank),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }

  async function loadGoal(userId: string) {
    if (!supabase) return;
    const { data: profileRow } = await supabase
      .from("user_profiles")
      .select("goal_kg, diet_start_date")
      .eq("user_id", userId)
      .maybeSingle();
    if (profileRow?.goal_kg != null) {
      setGoalInput(Number(profileRow.goal_kg).toFixed(1));
    } else {
      setGoalInput("");
    }
    setDietStartDate(profileRow?.diet_start_date ?? "");
  }

  useEffect(() => {
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    if (myUserId) void loadGoal(myUserId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId, supabase]);

  useEffect(() => {
    if (!myUserId || !selectedDate) return;
    const mine = rows.find((r) => r.user_id === myUserId && r.date === selectedDate);
    setWeightInput(mine ? Number(mine.weight_kg).toFixed(1) : "");
    setDrank(mine ? Boolean(mine.drank) : false);
  }, [rows, selectedDate, myUserId]);

  function selectUser(userId: string) {
    localStorage.setItem(LOCAL_KEY, userId);
    setMyUserId(userId);
  }

  const myName = useMemo(() => {
    if (!myUserId) return "나";
    return members.find((m) => m.user_id === myUserId)?.display_name ?? "나";
  }, [members, myUserId]);

  const partner = useMemo(() => {
    if (!myUserId) return null;
    return members.find((m) => m.user_id !== myUserId) ?? null;
  }, [members, myUserId]);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!myUserId) return [];
    const dates = buildDateRange(todayISO, rangeDays);
    const map = new Map<string, number>();
    const drankMap = new Map<string, boolean>();
    rows.forEach((row) => {
      map.set(`${row.user_id}|${row.date}`, Number(row.weight_kg));
      drankMap.set(`${row.user_id}|${row.date}`, Boolean(row.drank));
    });

    return dates.map((date) => ({
      date,
      me: map.get(`${myUserId}|${date}`) ?? null,
      partner: partner ? (map.get(`${partner.user_id}|${date}`) ?? null) : null,
      meDrank: drankMap.get(`${myUserId}|${date}`) ?? false,
      partnerDrank: partner ? (drankMap.get(`${partner.user_id}|${date}`) ?? false) : false,
    }));
  }, [partner, rangeDays, rows, todayISO, myUserId]);

  const deltas = useMemo(() => {
    if (!myUserId) return { vsYesterday: null, vsWeek: null };
    const mySeries = rows.filter((r) => r.user_id === myUserId).map((r) => ({ date: r.date, kg: r.weight_kg }));
    return {
      vsYesterday: computeDelta(mySeries, todayISO, 1),
      vsWeek: computeDelta(mySeries, todayISO, 7),
    };
  }, [rows, todayISO, myUserId]);

  const aiSummary = useMemo<AiSummary>(() => {
    if (!myUserId) {
      return {
        range_days: rangeDays,
        today: todayISO,
        me_label: "",
        partner_label: "",
        users: [
          { label: "me", series: [] },
          { label: "partner", series: [] },
        ],
        deltas: {
          me: { vs_yesterday: null, vs_week: null },
          partner: { vs_yesterday: null, vs_week: null },
        },
      };
    }

    const start = addDaysISO(todayISO, -(rangeDays - 1));
    const inRange = rows.filter((row) => row.date >= start && row.date <= todayISO);

    const meSeries = inRange
      .filter((r) => r.user_id === myUserId)
      .map((r) => ({ date: r.date, kg: r.weight_kg, drank: r.drank }));
    const partnerSeries = partner
      ? inRange
          .filter((r) => r.user_id === partner.user_id)
          .map((r) => ({ date: r.date, kg: r.weight_kg, drank: r.drank }))
      : [];

    return {
      range_days: rangeDays,
      today: todayISO,
      me_label: myName,
      partner_label: partner?.display_name ?? "",
      users: [
        { label: "me", series: meSeries },
        { label: "partner", series: partnerSeries },
      ],
      deltas: {
        me: {
          vs_yesterday: computeDelta(meSeries, todayISO, 1),
          vs_week: computeDelta(meSeries, todayISO, 7),
        },
        partner: {
          vs_yesterday: computeDelta(partnerSeries, todayISO, 1),
          vs_week: computeDelta(partnerSeries, todayISO, 7),
        },
      },
    };
  }, [myName, partner, rangeDays, rows, todayISO, myUserId]);

  const myCurrentWeight = useMemo(() => {
    if (!myUserId) return null;
    const mine = rows
      .filter((r) => r.user_id === myUserId && r.date <= todayISO)
      .sort((a, b) => a.date.localeCompare(b.date));
    const latest = mine.at(-1);
    return latest ? latest.weight_kg : null;
  }, [rows, todayISO, myUserId]);

  async function saveTodayWeight() {
    if (!supabase || !myUserId || !householdId) return;
    if (!selectedDate) {
      setToast("날짜를 먼저 선택해주세요.");
      return;
    }

    const parsed = Math.round(Number.parseFloat(weightInput) * 10) / 10;
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setToast("몸무게를 올바르게 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase.from("weigh_ins").upsert(
        {
          household_id: householdId,
          user_id: myUserId,
          date: selectedDate,
          weight_kg: parsed,
          drank,
        },
        { onConflict: "user_id,date" },
      );

      if (upsertError) throw upsertError;
      await loadData();
      setToast("저장 성공");
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function saveGoalWeight() {
    if (!supabase || !myUserId) return;
    const parsed = Math.round(Number.parseFloat(goalInput) * 10) / 10;
    const hasGoal = Number.isFinite(parsed) && parsed > 0;

    if (!hasGoal && !dietStartDate) {
      setToast("목표 체중 또는 시작일 중 하나는 입력해주세요.");
      return;
    }

    setSavingGoal(true);
    try {
      const { error: upsertError } = await supabase.from("user_profiles").upsert(
        {
          user_id: myUserId,
          goal_kg: hasGoal ? parsed : null,
          diet_start_date: dietStartDate || null,
        },
        { onConflict: "user_id" },
      );
      if (upsertError) throw upsertError;
      setToast("목표 저장 완료");
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목표 저장 실패");
    } finally {
      setSavingGoal(false);
    }
  }

  function moveToPreviousDate() {
    if (!selectedDate) return;
    setSelectedDate(addDaysISO(selectedDate, -1));
  }

  function moveToNextDate() {
    if (!selectedDate) return;
    setSelectedDate(addDaysISO(selectedDate, 1));
  }

  if (supabaseError || !supabase) {
    return (
      <main className="mx-auto max-w-md p-4">
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h1 className="text-lg font-bold">설정 확인 필요</h1>
          <p className="mt-2 text-sm text-red-500">
            {supabaseError ?? "Supabase 연결 설정이 없습니다."}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            .env.local 에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣고 서버를 재시작하세요.
          </p>
        </section>
      </main>
    );
  }

  if (!myUserId && members.length > 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 safe-top safe-bottom">
        <section className="rounded-3xl bg-card p-6 shadow-card">
          <h1 className="font-jua text-2xl text-ink">우리 체중계</h1>
          <p className="mt-2 font-gaegu text-sm text-ink-soft">나는 누구인가요?</p>
          <div className="mt-4 space-y-2">
            {members.map((m) => (
              <button
                key={m.user_id}
                type="button"
                onClick={() => selectUser(m.user_id)}
                className="w-full rounded-xl border border-ink/10 py-3 font-gaegu text-lg font-semibold text-ink hover:bg-card-alt"
              >
                {m.display_name}
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (loading && members.length === 0) {
    return <main className="p-4 font-gaegu text-sm text-ink-mute">불러오는 중...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-20 pt-4 safe-top safe-bottom">
      <header className="mb-4 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-jua text-2xl text-ink">우리 체중계</h1>
            <p className="font-gaegu text-xs text-ink-mute">현재: {myName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(LOCAL_KEY);
              setMyUserId(null);
            }}
            className="rounded-xl border border-ink/10 px-3 py-2 font-gaegu text-sm text-ink"
          >
            전환
          </button>
        </div>
      </header>

      {loading ? <p className="mb-4 font-gaegu text-sm text-ink-mute">불러오는 중...</p> : null}
      {error ? <p className="mb-4 text-sm text-red-500">에러: {error}</p> : null}

      <div className="space-y-4">
        <TodayEntryCard
          todayISO={todayISO}
          selectedDate={selectedDate}
          weightInput={weightInput}
          drank={drank}
          saving={saving}
          onPreviousDate={moveToPreviousDate}
          onNextDate={moveToNextDate}
          onChangeDate={setSelectedDate}
          onChangeWeight={setWeightInput}
          onChangeDrank={setDrank}
          onSave={saveTodayWeight}
        />

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-jua text-lg text-ink">체중 그래프</h2>
            <PeriodToggle value={rangeDays} onChange={setRangeDays} />
          </div>

          <div className="mt-3 inline-flex rounded-xl bg-card-alt p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 font-gaegu text-sm ${
                viewMode === "both" ? "bg-accent font-semibold text-white shadow" : "text-ink-soft"
              }`}
              onClick={() => setViewMode("both")}
            >
              둘 다 보기
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 font-gaegu text-sm ${
                viewMode === "me" ? "bg-accent font-semibold text-white shadow" : "text-ink-soft"
              }`}
              onClick={() => setViewMode("me")}
            >
              나만 보기
            </button>
          </div>

          <p className="mt-2 font-gaegu text-xs text-ink-mute">
            파랑: {myName}
            {partner ? ` / 민트: ${partner.display_name}` : ""}
          </p>

          <div className="mt-3">
            <WeightChart
              data={chartData}
              showPartner={viewMode === "both"}
              meLabel={myName}
              partnerLabel={partner?.display_name ?? "상대"}
            />
          </div>
        </section>

        <DeltaStats vsYesterday={deltas.vsYesterday} vsWeek={deltas.vsWeek} />

        {myUserId ? <AlcoholCalendarCard rows={rows} members={members} meId={myUserId} /> : null}

        <GoalCard
          goalInput={goalInput}
          dietStartDate={dietStartDate}
          saving={savingGoal}
          currentWeight={myCurrentWeight}
          onChangeGoal={setGoalInput}
          onChangeDietStartDate={setDietStartDate}
          onSaveGoal={saveGoalWeight}
          todayISO={todayISO}
        />

        <AiChat summary={aiSummary} />
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-2 font-gaegu text-sm text-white shadow-card">
          {toast}
        </div>
      ) : null}

      <BottomNav active="weight" />
    </main>
  );
}
