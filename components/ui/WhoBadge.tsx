import React from 'react';

type WhoValue = '창희' | '하경' | '둘다' | 'duck' | 'dolphin' | 'both';

interface WhoBadgeProps {
  who: WhoValue;
  size?: 'sm' | 'md';
}

const whoMap: Record<WhoValue, { bg: string; fg: string; emoji: string; label: string }> = {
  '창희': { bg: 'var(--duck)', fg: 'var(--ink)', emoji: '🦆', label: '창희' },
  '하경': { bg: 'var(--dolphin)', fg: '#fff', emoji: '🐬', label: '하경' },
  '둘다': { bg: 'var(--pink)', fg: 'var(--ink)', emoji: '💞', label: '같이' },
  'duck': { bg: 'var(--duck)', fg: 'var(--ink)', emoji: '🦆', label: '창희' },
  'dolphin': { bg: 'var(--dolphin)', fg: '#fff', emoji: '🐬', label: '하경' },
  'both': { bg: 'var(--pink)', fg: 'var(--ink)', emoji: '💞', label: '같이' },
};

export const WhoBadge: React.FC<WhoBadgeProps> = ({ who, size = 'md' }) => {
  const m = whoMap[who] ?? whoMap['하경'];
  const fontSize = size === 'sm' ? 10 : 11;
  const padding = size === 'sm' ? '1px 6px' : '2px 8px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize,
        padding,
        borderRadius: 8,
        fontFamily: 'Jua, sans-serif',
        background: m.bg,
        color: m.fg,
      }}
    >
      {m.emoji} {m.label}
    </span>
  );
};

WhoBadge.displayName = 'WhoBadge';
