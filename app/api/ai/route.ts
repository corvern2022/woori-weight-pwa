import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { AiSummary } from "@/lib/types";

export const runtime = "nodejs";

function fallbackAnswer(summary: AiSummary): string {
  const meSeries = summary.users.find((u) => u.label === "me")?.series ?? [];
  const latest = meSeries.at(-1)?.kg;
  const prev = meSeries.at(-2)?.kg;
  const diff = latest != null && prev != null ? Math.round((latest - prev) * 10) / 10 : null;
  const trendText = diff == null ? "변화 비교 데이터가 아직 부족해요." : diff > 0 ? `직전 기록보다 ${diff.toFixed(1)}kg 증가했어요.` : diff < 0 ? `직전 기록보다 ${Math.abs(diff).toFixed(1)}kg 감소했어요.` : "직전 기록과 동일해요.";

  return [
    `한 줄 요약: ${summary.me_label || "현재 사용자"}님의 최근 체중 흐름을 확인했어요.`,
    `- 최근 기록 개수: ${meSeries.length}개`,
    `- ${trendText}`,
    `- 전주 대비: ${summary.deltas.me.vs_week == null ? "기록 없음" : `${summary.deltas.me.vs_week > 0 ? "+" : ""}${summary.deltas.me.vs_week.toFixed(1)}kg`}`,
    "다음 질문 제안: 최근 2주 중 가장 변동이 컸던 날짜를 알려줘.",
    "",
    "주의: 이 답변은 일반 정보이며 의학적 진단/처방이 아닙니다.",
  ].join("\n");
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
      return NextResponse.json({ answer: fallbackAnswer(summary) });
    }

    const client = new OpenAI({ apiKey });

    // TODO: 스트리밍 UX가 필요하면 responses.stream으로 전환
    const response = await client.responses.create({
      model,
      instructions:
        "너는 2인 체중 기록 코치다. 제공된 데이터에 근거해 트렌드/패턴 중심으로 설명하라. " +
        "의료적 진단, 치료, 처방은 하지 말고 위험 신호가 보이면 전문가 상담을 권유하라. " +
        "출력 형식: 1) 한 줄 요약 2) 관찰 2~3개 bullet 3) 다음 질문 1개.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `질문: ${question}\n\n데이터 요약 JSON:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        },
      ],
    });

    const output = response.output_text?.trim() || "분석 결과를 생성하지 못했습니다.";
    const answer = `${output}\n\n주의: 이 답변은 일반 정보이며 의학적 진단/처방이 아닙니다.`;

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 },
    );
  }
}
