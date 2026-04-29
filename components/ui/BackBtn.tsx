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
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        padding: '0 4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--ink-soft)',
        fontFamily: 'var(--font-main)',
        fontSize: 15,
        fontWeight: 600,
        touchAction: 'manipulation',
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>←</span>
      <span>{label}</span>
    </button>
  );
};

BackBtn.displayName = 'BackBtn';
