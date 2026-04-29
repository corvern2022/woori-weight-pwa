export default function FontComparePage() {
  const sample = {
    title: '오리 레인저',
    subtitle: '4월 29일 (화) · 맑음 ☀️ 18°',
    bigNum: '3',
    bigLabel: '📋 할 일',
    bigSub: '3개 남음',
    body: '체중 기록, 음주 기록, 할 일 관리를 함께해요.',
    small: '오늘도 파이팅! 💪',
  }

  const fonts = [
    {
      name: 'Pretendard',
      desc: '가독성 최상 · 토스, 카카오 채택',
      import: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
      family: 'Pretendard, -apple-system, sans-serif',
      tag: '✦ 추천',
      tagColor: '#2F95C4',
    },
    {
      name: 'Noto Sans KR',
      desc: '안정적 · 구글 표준 한글 폰트',
      import: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
      family: '\'Noto Sans KR\', sans-serif',
      tag: '무난함',
      tagColor: '#059669',
    },
    {
      name: 'IBM Plex Sans KR',
      desc: '모던 · 기술적 느낌, 숫자 가독성 탁월',
      import: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;700&display=swap',
      family: '\'IBM Plex Sans KR\', sans-serif',
      tag: '개성',
      tagColor: '#7C3AED',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&family=IBM+Plex+Sans+KR:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #EAF4FB; padding: 24px 16px; }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 11, fontWeight: 700, color: '#6B8AA8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
          폰트 미리보기 · 3종 비교
        </div>

        {fonts.map((font, idx) => (
          <div key={idx} style={{
            background: '#fff', borderRadius: 20, padding: '20px',
            marginBottom: 16, boxShadow: '0 2px 16px rgba(47,149,196,0.12)',
            border: idx === 0 ? '2px solid #2F95C4' : '2px solid transparent',
          }}>
            {/* Font meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontFamily: 'Pretendard, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#2A3D54' }}>{font.name}</div>
              <div style={{
                background: font.tagColor + '18', color: font.tagColor,
                fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px',
              }}>{font.tag}</div>
              <div style={{ flex: 1, fontSize: 11, color: '#6B8AA8', textAlign: 'right' }}>{font.desc}</div>
            </div>

            {/* Sample card */}
            <div style={{
              background: '#EAF4FB', borderRadius: 14, padding: '16px',
              fontFamily: font.family,
            }}>
              {/* Header */}
              <div style={{ fontSize: 12, color: '#6B8AA8', marginBottom: 2 }}>{sample.subtitle}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2A3D54', letterSpacing: -0.5, marginBottom: 12 }}>{sample.title}</div>

              {/* Stat chips */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#A6B7C7', fontWeight: 600 }}>{sample.bigLabel}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#E88560', lineHeight: 1.1 }}>{sample.bigNum}</div>
                  <div style={{ fontSize: 11, color: '#6B8AA8' }}>{sample.bigSub}</div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#A6B7C7', fontWeight: 600 }}>⚖️ 체중</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#2F95C4', lineHeight: 1.1 }}>72.3</div>
                  <div style={{ fontSize: 11, color: '#6B8AA8' }}>창희 72.3 · 하경 54.1</div>
                </div>
              </div>

              {/* Body text */}
              <div style={{ fontSize: 14, color: '#2A3D54', lineHeight: 1.6, marginBottom: 6 }}>{sample.body}</div>
              <div style={{ fontSize: 12, color: '#6B8AA8' }}>{sample.small}</div>

              {/* Weight range display */}
              <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                {['400 일반', '700 굵게', '900 진하게'].map((w, i) => (
                  <div key={i} style={{
                    fontSize: 13, color: '#2A3D54',
                    fontWeight: i === 0 ? 400 : i === 1 ? 700 : 900,
                  }}>{w}</div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{
          fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#6B8AA8',
          textAlign: 'center', marginTop: 8, lineHeight: 1.6,
        }}>
          현재: Nanum Gothic · Pretendard 교체 시 globals.css + layout.tsx 수정 필요
        </div>
      </div>
    </>
  )
}
