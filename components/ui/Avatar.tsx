import React from 'react';
import { Duck } from '@/components/characters/Duck';
import { Dolphin } from '@/components/characters/Dolphin';

interface AvatarProps {
  who: '창희' | '하경';
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ who, size = 40 }) => {
  const bgColor = who === '창희' ? 'bg-duck-soft' : 'bg-dolphin-soft';

  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ width: size, height: size }}
    >
      {who === '창희' ? (
        <Duck size={size * 0.8} variant="head" palette="yellow" />
      ) : (
        <Dolphin size={size * 0.8} variant="head" palette="blue" />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';
