"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { AiChat } from "@/components/AiChat";
import { DeltaStats } from "@/components/DeltaStats";
import { PeriodToggle } from "@/components/PeriodToggle";
import { TodayEntryCard } from "@/components/TodayEntryCard";
import { WeightChart } from "@/components/WeightChart";
import { addDaysISO, buildDateRange, toSeoulISODate } from "@/lib/date";
import { getSupabaseClient } from "@/lib/supabase";
import type { AiSummary, ChartPoint, HouseholdMember, WeighInRow } from "@/lib/types";

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [joinCode, setJoinCode] = useState("");

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [rows, setRows] = useState<WeighInRow[]>([]);

  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [viewMode, setViewMode] = useState<"both" | "me">("both");
  const [weightInput, setWeightInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayISO = useMemo(() => toSeoulISODate(), []);
  const yesterdayISO = useMemo(() => addDaysISO(todayISO, -1), [todayISO]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayISO);
    }
  }, [selectedDate, todayISO]);

  async function refreshHousehold(targetUser: User) {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data: hid, error: hidError } = await supabase.rpc("get_my_household_id");
      if (hidError) throw hidError;

      setHouseholdId(hid ?? null);
      if (!hid) {
        setMembers([]);
        setRows([]);
        setInviteCode("");
        return;
      }

      const [{ data: memberRows, error: memberError }, { data: weighRows, error: weighError }, { data: houseRow, error: houseErr }] = await Promise.all([
        supabase.from("household_members").select("user_id, display_name").eq("household_id", hid),
        supabase.from("weigh_ins").select("date, user_id, weight_kg").eq("household_id", hid).order("date", { ascending: true }),
        supabase.from("households").select("invite_code").eq("id", hid).single(),
      ]);

      if (memberError) throw memberError;
      if (weighError) throw weighError;
      if (houseErr) throw houseErr;

      const safeMembers = (memberRows ?? []) as HouseholdMember[];
      const safeWeighRows = (weighRows ?? []) as Array<{ date: string; user_id: string; weight_kg: number | string }>;
      setMembers(safeMembers);
      setRows(
        safeWeighRows.map((r) => ({
          date: r.date,
          user_id: r.user_id,
          weight_kg: Number(r.weight_kg),
        })),
      );
      setInviteCode(houseRow?.invite_code ?? "");

    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!supabase) return;
    async function init() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setAuthLoading(false);
      if (data.user) {
        setDisplayName((data.user.user_metadata?.display_name as string) ?? "");
        await refreshHousehold(data.user);
      }
    }

    void init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setDisplayName((nextUser.user_metadata?.display_name as string) ?? "");
        void refreshHousehold(nextUser);
      } else {
        setHouseholdId(null);
        setMembers([]);
        setRows([]);
        setInviteCode("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    if (!householdId) return;

    const channel = supabase
      .channel(`weigh-ins-${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weigh_ins",
          filter: `household_id=eq.${householdId}`,
        },
        async () => {
          if (user) await refreshHousehold(user);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [householdId, supabase, user]);

  useEffect(() => {
    if (!user || !selectedDate) return;
    const mine = rows.find((r) => r.user_id === user.id && r.date === selectedDate);
    setWeightInput(mine ? Number(mine.weight_kg).toFixed(1) : "");
  }, [rows, selectedDate, user]);

  const myName = useMemo(() => {
    if (!user) return "나";
    return members.find((m) => m.user_id === user.id)?.display_name ?? "나";
  }, [members, user]);

  const partner = useMemo(() => {
    if (!user) return null;
    return members.find((m) => m.user_id !== user.id) ?? null;
  }, [members, user]);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!user) return [];
    const dates = buildDateRange(todayISO, rangeDays);
    const map = new Map<string, number>();
    rows.forEach((row) => map.set(`${row.user_id}|${row.date}`, Number(row.weight_kg)));

    return dates.map((date) => ({
      date,
      me: map.get(`${user.id}|${date}`) ?? null,
      partner: partner ? (map.get(`${partner.user_id}|${date}`) ?? null) : null,
    }));
  }, [partner, rangeDays, rows, todayISO, user]);

  const deltas = useMemo(() => {
    if (!user) return { vsYesterday: null, vsWeek: null };
    const mySeries = rows.filter((r) => r.user_id === user.id).map((r) => ({ date: r.date, kg: r.weight_kg }));
    return {
      vsYesterday: computeDelta(mySeries, todayISO, 1),
      vsWeek: computeDelta(mySeries, todayISO, 7),
    };
  }, [rows, todayISO, user]);

  const aiSummary = useMemo<AiSummary>(() => {
    if (!user) {
      return {
        range_days: rangeDays,
        today: todayISO,
        me_label: "",
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

    const meSeries = inRange.filter((r) => r.user_id === user.id).map((r) => ({ date: r.date, kg: r.weight_kg }));
    const partnerSeries = partner
      ? inRange.filter((r) => r.user_id === partner.user_id).map((r) => ({ date: r.date, kg: r.weight_kg }))
      : [];

    return {
      range_days: rangeDays,
      today: todayISO,
      me_label: myName,
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
  }, [myName, partner, rangeDays, rows, todayISO, user]);

  async function signUp() {
    if (!supabase) return;
    setAuthMessage(null);
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });
    setAuthMessage(signError ? signError.message : "회원가입 완료. 바로 로그인하세요.");
  }

  async function signIn() {
    if (!supabase) return;
    setAuthMessage(null);
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      setAuthMessage(signError.message);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function createHousehold() {
    if (!supabase) return;
    if (!displayName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("create_my_household", {
        p_display_name: displayName,
      });
      if (rpcError) throw rpcError;
      setInviteCode(data ?? "");
      if (user) await refreshHousehold(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "초대코드 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function joinHousehold() {
    if (!supabase) return;
    if (!displayName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!joinCode.trim()) {
      setError("초대코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("join_household_with_code", {
        p_invite_code: joinCode.toUpperCase(),
        p_display_name: displayName,
      });
      if (rpcError) throw rpcError;
      if (user) await refreshHousehold(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "참여 실패");
    } finally {
      setLoading(false);
    }
  }

  async function saveTodayWeight() {
    if (!supabase || !user || !householdId) return;
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
          user_id: user.id,
          date: selectedDate,
          weight_kg: parsed,
        },
        { onConflict: "user_id,date" },
      );

      if (upsertError) throw upsertError;
      await refreshHousehold(user);
      setToast("저장 성공");
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <main className="p-4 text-sm text-slate-500">인증 확인 중...</main>;
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

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 safe-top safe-bottom">
        <section className="rounded-2xl bg-card p-6 shadow-card">
          <h1 className="text-2xl font-bold">우리 체중계</h1>
          <p className="mt-2 text-sm text-slate-500">2인 공유를 위해 로그인하세요.</p>
          <div className="mt-4 space-y-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="이름 (예: 돌핀)"
              className="w-full rounded-xl border border-slate-200 px-3 py-3"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-3"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-3"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={signIn} className="rounded-xl bg-accent py-3 text-white">
              로그인
            </button>
            <button type="button" onClick={signUp} className="rounded-xl border border-slate-200 py-3">
              회원가입
            </button>
          </div>
          {authMessage ? <p className="mt-3 text-sm text-slate-600">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  if (!householdId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 safe-top safe-bottom">
        <section className="rounded-2xl bg-card p-6 shadow-card">
          <h1 className="text-2xl font-bold">친구 연결</h1>
          <p className="mt-2 text-sm text-slate-500">초대코드를 만들거나 입력해서 2인 연결하세요.</p>

          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="내 이름"
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3"
          />

          <button
            type="button"
            onClick={createHousehold}
            className="mt-3 w-full rounded-xl bg-accent py-3 font-semibold text-white"
          >
            내 초대코드 만들기
          </button>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold">상대 코드로 참여</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="초대코드 6자리"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
            />
            <button
              type="button"
              onClick={joinHousehold}
              className="mt-2 w-full rounded-xl border border-slate-200 py-3 font-semibold"
            >
              코드로 참여
            </button>
          </div>

          {loading ? <p className="mt-3 text-sm text-slate-500">처리 중...</p> : null}
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-8 pt-4 safe-top safe-bottom">
      <header className="mb-4 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">우리 체중계</h1>
            <p className="text-xs text-slate-500">내 이름: {myName}</p>
          </div>
          <button type="button" onClick={signOut} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            로그아웃
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">우리 코드: <span className="font-bold">{inviteCode || "-"}</span></p>
      </header>

      {loading ? <p className="mb-4 text-sm text-slate-500">불러오는 중...</p> : null}
      {error ? <p className="mb-4 text-sm text-red-500">에러: {error}</p> : null}

      <div className="space-y-4">
        <TodayEntryCard
          todayISO={todayISO}
          yesterdayISO={yesterdayISO}
          selectedDate={selectedDate}
          weightInput={weightInput}
          saving={saving}
          onChangeDate={setSelectedDate}
          onChangeWeight={setWeightInput}
          onSave={saveTodayWeight}
        />

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">체중 그래프</h2>
            <PeriodToggle value={rangeDays} onChange={setRangeDays} />
          </div>

          <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm ${
                viewMode === "both" ? "bg-white font-semibold shadow" : "text-slate-500"
              }`}
              onClick={() => setViewMode("both")}
            >
              둘 다 보기
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm ${
                viewMode === "me" ? "bg-white font-semibold shadow" : "text-slate-500"
              }`}
              onClick={() => setViewMode("me")}
            >
              나만 보기
            </button>
          </div>

          <div className="mt-3">
            <WeightChart data={chartData} showPartner={viewMode === "both"} />
          </div>
        </section>

        <DeltaStats vsYesterday={deltas.vsYesterday} vsWeek={deltas.vsWeek} />

        <AiChat summary={aiSummary} />
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
