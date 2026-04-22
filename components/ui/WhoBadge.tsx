import React from 'react';

interface WhoBadgeProps {
  who: '창희' | '하경' | '둘다';
  size?: 'sm' | 'md';
}

const stylesByWho = {
  '창희': {
    bg: 'bg-duck/20',
    text: 'text-duck-deep',
    emoji: '🦆',
  },
  '하경': {
    bg: 'bg-dolphin/20',
    text: 'text-dolphin-deep',
    emoji: '🐬',
  },
  '둘다': {
    bg: 'bg-pink/20',
    text: 'text-pink',
    emoji: '💞',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export const WhoBadge: React.FC<WhoBadgeProps> = ({ who, size = 'md' }) => {
  const style = stylesByWho[who];
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-gaegu ${style.bg} ${style.text} ${sizeClass}`}
    >
      {style.emoji}
      {who}
    </span>
  );
};

WhoBadge.displayName = 'WhoBadge';
