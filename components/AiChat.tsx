"use client";

import { useMemo, useState } from "react";
import type { AiSummary, ChatMessage } from "@/lib/types";

type Props = {
  summary: AiSummary;
};

export function AiChat({ summary }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendQuestion(question: string) {
    const content = question.trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content, summary }),
      });

      const payload = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) {
        throw new Error(payload.error ?? "AI 응답을 가져오지 못했습니다.");
      }
      const answerText = payload.answer;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answerText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error instanceof Error ? error.message : "AI 호출 중 오류가 발생했습니다.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="text-lg font-bold">AI 문답</h2>
      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">질문을 입력하면 최근 기록 기반으로 분석해줘요.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.role === "user" ? "ml-8 bg-blue-100" : "mr-8 bg-white"
              }`}
            >
              <p className="whitespace-pre-wrap leading-6">{m.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="safe-bottom sticky bottom-0 mt-3 flex gap-2 bg-card pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 최근 30일 패턴 알려줘"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendQuestion(input);
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={() => sendQuestion(input)}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </section>
  );
}
