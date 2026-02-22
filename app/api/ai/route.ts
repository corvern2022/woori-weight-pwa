import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { AiSummary } from "@/lib/types";

export const runtime = "nodejs";

type SeriesPoint = { date: string; kg: number; drank?: boolean };

function normalizeAiAnswer(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripDisallowedSections(text: string): string {
  return text
    .split("\n")
    .filter((line) => !line.trim().startsWith("다음 질문"))
    .filter((line) => !line.trim().startsWith("주의:"))
    .join("\n")
    .trim();
}

function getSeries(summary: AiSummary, label: "me" | "partner"): SeriesPoint[] {
  return [...(summary.users.find((u) => u.label === label)?.series ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function detectTarget(summary: AiSummary, question: string): "me" | "partner" {
  const q = question.toLowerCase();
  const meName = summary.me_label.toLowerCase();
  const partnerName = summary.partner_label.toLowerCase();

  const asksPartner =
    (partnerName && q.includes(partnerName)) ||
    q.includes("상대") ||
    q.includes("파트너") ||
    q.includes("창창") ||
    q.includes("창희");

  const asksMe =
    (meName && q.includes(meName)) ||
    q.includes("나") ||
    q.includes("내") ||
    q.includes("하경");

  if (asksPartner && !asksMe) return "partner";
  return "me";
}

function formatDiff(diff: number | null): string {
  if (diff == null || Number.isNaN(diff)) return "기록 없음";
  return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg`;
}

function minPoint(series: SeriesPoint[]): SeriesPoint | null {
  if (series.length === 0) return null;
  return series.reduce((min, cur) => (cur.kg < min.kg ? cur : min), series[0]);
}

function fallbackAnswer(summary: AiSummary, question: string): string {
  const meName = summary.me_label || "나";
  const partnerName = summary.partner_label || "상대";
  const meSeries = getSeries(summary, "me");
  const partnerSeries = getSeries(summary, "partner");
  const target = detectTarget(summary, question);
  const targetName = target === "me" ? meName : partnerName;
  const targetSeries = target === "me" ? meSeries : partnerSeries;
  const targetDeltaWeek = target === "me" ? summary.deltas.me.vs_week : summary.deltas.partner.vs_week;
  const q = question.toLowerCase();

  const asksLowest =
    (q.includes("가장") || q.includes("최저")) &&
    (q.includes("낮") || q.includes("최소") || q.includes("lowest"));

  if (asksLowest) {
    const meMin = minPoint(meSeries);
    const partnerMin = minPoint(partnerSeries);
    return [
      "한 줄 요약: 두 사람의 최저 체중 날짜를 찾았어요.",
      `- ${meName}: ${meMin ? `${meMin.date}, ${meMin.kg.toFixed(1)}kg` : "기록 없음"}`,
      `- ${partnerName}: ${partnerMin ? `${partnerMin.date}, ${partnerMin.kg.toFixed(1)}kg` : "기록 없음"}`,
    ].join("\n");
  }

  const latest = targetSeries.at(-1)?.kg;
  const first14 = targetSeries.at(Math.max(0, targetSeries.length - 14))?.kg;
  const trend14 =
    latest != null && first14 != null ? Math.round((latest - first14) * 10) / 10 : null;

  return [
    `한 줄 요약: ${targetName}님의 최근 2주 흐름은 ${trend14 == null ? "데이터 부족" : trend14 > 0 ? "상승" : trend14 < 0 ? "하락" : "유지"}이에요.`,
    `- 최근 기록 개수: ${targetSeries.length}개`,
    `- 2주 변화: ${formatDiff(trend14)}`,
    `- 전주 대비: ${formatDiff(targetDeltaWeek)}`,
  ].join("\n");
}

function buildFacts(summary: AiSummary): string {
  function factsFor(label: "me" | "partner", name: string): string[] {
    const series = [...(summary.users.find((u) => u.label === label)?.series ?? [])].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    if (series.length === 0) return [`${name}: 기록 없음`];

    const latest = series.at(-1);
    const first14 = series.at(Math.max(0, series.length - 14));
    const trend14 =
      latest && first14 ? Math.round((latest.kg - first14.kg) * 10) / 10 : null;

    let maxSwingDate: string | null = null;
    let maxSwing = 0;
    for (let i = Math.max(1, series.length - 7); i < series.length; i += 1) {
      const swing = Math.abs(series[i].kg - series[i - 1].kg);
      if (swing > maxSwing) {
        maxSwing = swing;
        maxSwingDate = series[i].date;
      }
    }

    const drankDays = series.filter((s) => s.drank).length;
    return [
      `${name}: 최근 기록 ${series.length}개`,
      `${name}: 최근 체중 ${latest?.kg.toFixed(1)}kg`,
      `${name}: 2주 변화 ${trend14 == null ? "계산불가" : `${trend14 > 0 ? "+" : ""}${trend14.toFixed(1)}kg`}`,
      `${name}: 최근 1주 최대 변동 ${maxSwingDate ? `${maxSwingDate} (${maxSwing.toFixed(1)}kg)` : "데이터 부족"}`,
      `${name}: 기간 내 음주 체크 ${drankDays}회`,
      `${name}: 전일 ${label === "me" ? summary.deltas.me.vs_yesterday : summary.deltas.partner.vs_yesterday ?? null}`,
      `${name}: 전주 ${label === "me" ? summary.deltas.me.vs_week : summary.deltas.partner.vs_week ?? null}`,
    ];
  }

  const meName = summary.me_label || "나";
  const partnerName = summary.partner_label || "상대";
  return [...factsFor("me", meName), ...factsFor("partner", partnerName)].join("\n");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { question?: string; summary?: AiSummary };
    const question = body.question?.trim();
    const summary = body.summary;

    if (!question) {
      return NextResponse.json({ error: "질문을 입력해주세요." }, { status: 400 });
    }

    if (!summary) {
      return NextResponse.json({ error: "분석할 데이터가 없습니다." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-5.2";

    if (!apiKey || apiKey === "test") {
      return NextResponse.json({ answer: fallbackAnswer(summary, question) });
    }

    const client = new OpenAI({ apiKey });
    const facts = buildFacts(summary);

    // TODO: 스트리밍 UX가 필요하면 responses.stream으로 전환
    const response = await client.responses.create({
      model,
      instructions:
        "너는 2인 체중 기록 코치다. 말은 짧고 정확하게 한국어로 답한다. " +
        "반드시 제공된 수치와 날짜를 근거로만 설명하고, 모르면 모른다고 말한다. " +
        "의료적 진단/치료/처방은 금지한다. " +
        "출력 형식: 1) 한 줄 요약 2) 관찰(각 줄 '- '로 시작하는 bullet 2~3개). " +
        "'다음 질문 제안'과 '주의문'은 절대 출력하지 마라.",
      max_output_tokens: 420,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `질문: ${question}\n\n` +
                `핵심 계산 결과:\n${facts}\n\n` +
                `데이터 요약 JSON:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        },
      ],
    });

    const output = stripDisallowedSections(
      normalizeAiAnswer(
      response.output_text?.trim() || "한 줄 요약: 분석 결과를 생성하지 못했습니다.",
      ),
    );
    return NextResponse.json({ answer: output });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 },
    );
  }
}
