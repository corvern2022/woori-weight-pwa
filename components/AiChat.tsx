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
    <section className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar p-4">
        {messages.length === 0 ? (
          <p className="font-gaegu text-sm text-ink-mute">질문을 입력하면 최근 기록 기반으로 분석해줘요.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-duck-soft text-ink rounded-2xl rounded-br-sm"
                    : "bg-dolphin-soft text-ink rounded-2xl rounded-bl-sm"
                }`}
              >
                <p className="font-gaegu whitespace-pre-wrap leading-6">{m.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dolphin-soft rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-dolphin animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-dolphin animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-dolphin animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border-t border-ink/10 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 최근 30일 패턴 알려줘"
          className="bg-card-alt border border-ink/15 text-ink rounded-pill flex-1 px-4 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendQuestion(input);
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={() => sendQuestion(input)}
          className={`rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
            canSend ? "bg-dolphin text-white" : "bg-card-alt text-ink-mute"
          }`}
        >
          전송
        </button>
      </div>
    </section>
  );
}
