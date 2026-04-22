'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface BackBtnProps {
  onClick?: () => void;
  label?: string;
}

export const BackBtn: React.FC<BackBtnProps> = ({ onClick, label = '뒤로' }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-transparent text-ink-soft hover:text-ink transition-colors"
      aria-label={label}
    >
      <span>←</span>
      <span>{label}</span>
    </button>
  );
};

BackBtn.displayName = 'BackBtn';
