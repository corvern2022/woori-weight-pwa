export default function TaskDetailLoading() {
  return (
    <div style={{ width: '100%', minHeight: '100svh', background: 'var(--bg)' }}>
      {/* Header skeleton */}
      <div style={{ padding: '54px 22px 16px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ width: 60, height: 20, borderRadius: 10, background: 'var(--bg-deep)', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 50, height: 22, borderRadius: 100, background: 'var(--bg-deep)' }} />
          <div style={{ width: 40, height: 22, borderRadius: 100, background: 'var(--bg-deep)' }} />
        </div>
        <div style={{ width: '70%', height: 28, borderRadius: 10, background: 'var(--bg-deep)', marginBottom: 8 }} />
        <div style={{ width: '50%', height: 16, borderRadius: 8, background: 'var(--bg-deep)' }} />
      </div>

      {/* Sub-tasks skeleton */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ width: 80, height: 18, borderRadius: 8, background: 'var(--bg-deep)', marginBottom: 12 }} />
        <div style={{ background: 'var(--card)', borderRadius: 18, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--bg-deep)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 16, borderRadius: 8, background: 'var(--bg-deep)', opacity: 1 - i * 0.2 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Comment skeleton */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ width: 50, height: 18, borderRadius: 8, background: 'var(--bg-deep)', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-deep)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 48, borderRadius: 14, background: 'var(--bg-deep)' }} />
        </div>
      </div>
    </div>
  );
}
