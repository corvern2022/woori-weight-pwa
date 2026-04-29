'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ChatMessage, AiSummary } from '@/lib/types';
import { BackBtn } from '@/components/ui';

const emptySummary: AiSummary = {
  range_days: 30,
  today: '',
  me_label: '나',
  partner_label: '파트너',
  users: [],
  deltas: {
    me: { vs_yesterday: null, vs_week: null },
    partner: { vs_yesterday: null, vs_week: null },
  },
};

const SUGGESTIONS = ['오늘 뭐 먹을까?', '운동 추천해줘', '목표 다시 세팅', '하경이 응원 메시지'];

function ChatBubble({ m }: { m: ChatMessage }) {
  const isMe = m.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', animation: 'slideUp 0.3s ease-out', gap: 6 }}>
      {!isMe && (
        <div style={{ width: 30, height: 30, borderRadius: 15, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>✨</div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: isMe ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))' : 'var(--card)',
          color: isMe ? '#fff' : 'var(--ink)',
          borderRadius: 18,
          padding: '10px 14px',
          fontFamily: 'var(--font-main)',
          fontSize: 15,
          lineHeight: 1.4,
          boxShadow: 'var(--shadow-soft)',
          borderBottomLeftRadius: isMe ? 18 : 4,
          borderBottomRightRadius: isMe ? 4 : 18,
          whiteSpace: 'pre-wrap',
        }}>{m.content}</div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 6 }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>✨</div>
      <div style={{ background: 'var(--card)', borderRadius: 18, borderBottomLeftRadius: 4, padding: '10px 14px', display: 'flex', gap: 4, boxShadow: 'var(--shadow-soft)' }}>
        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0ms]" style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', display: 'inline-block' }} />
        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:150ms]" style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', display: 'inline-block', animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:300ms]" style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', display: 'inline-block', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export function ChatPageClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content, summary: emptySummary }),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error ?? 'AI 응답을 가져오지 못했습니다.');
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: payload.answer! }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: error instanceof Error ? error.message : 'AI 호출 중 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, var(--bg), var(--bg-deep))', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '54px 22px 10px' }}>
        <BackBtn label="홈" onClick={() => router.push('/')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          {/* Sparkle avatar */}
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ fontSize: 22 }}>✨</div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)', animation: 'shine 3s linear infinite' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: 20 }}>오리&amp;돌핀 코치</div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'var(--mint-deep)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--mint-deep)', display: 'inline-block' }} /> 온라인 · 친근한 코치 모드
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 18px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && !loading && (
          <p style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 24 }}>코치한테 말을 걸어보세요 ✨</p>
        )}
        {messages.map((m) => <ChatBubble key={m.id} m={m} />)}
        {loading && <TypingIndicator />}
      </div>

      {/* Suggestion chips */}
      <div style={{ padding: '0 14px 4px' }}>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)} style={{ padding: '6px 12px', borderRadius: 100, border: '1px solid var(--accent-soft)', background: 'var(--card)', color: 'var(--accent-deep)', fontFamily: 'var(--font-main)', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div style={{ padding: '0 16px 46px' }}>
        <div style={{ background: 'var(--card)', borderRadius: 22, padding: 6, display: 'flex', gap: 4, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="코치한테 말 걸기..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-main)', fontSize: 15, color: 'var(--ink)', padding: '6px 12px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{ border: 'none', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', borderRadius: 16, padding: '8px 14px', cursor: input.trim() && !loading ? 'pointer' : 'default', color: '#fff', fontFamily: 'var(--font-main)', fontSize: 14, opacity: input.trim() && !loading ? 1 : 0.5 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M14 2L2 7l5 2 2 5z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
