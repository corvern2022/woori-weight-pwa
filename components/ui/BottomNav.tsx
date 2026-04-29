'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'home',     label: '홈',   emoji: '🏠', href: '/' },
  { id: 'tasks',    label: '할일', emoji: '✅', href: '/tasks' },
  { id: 'weight',   label: '체중', emoji: '⚖️', href: '/weight' },
  { id: 'drink',    label: '음주', emoji: '🍺', href: '/drink' },
  { id: 'settings', label: '설정', emoji: '⚙️', href: '/settings' },
];

function getActive(pathname: string): string {
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/weight')) return 'weight';
  if (pathname.startsWith('/drink')) return 'drink';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'home';
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const active = getActive(pathname);

  return (
    <nav
      role="navigation"
      aria-label="메인 메뉴"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', height: 64 }}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                color: isActive ? 'var(--accent-deep)' : 'var(--ink-mute)',
                textDecoration: 'none',
                position: 'relative',
                transition: 'color 0.15s',
              }}
            >
              {/* Pill background for active tab */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 52,
                  height: 40,
                  borderRadius: 14,
                  background: 'var(--accent-soft)',
                  opacity: 0.85,
                  zIndex: 0,
                }} />
              )}
              <span style={{ fontSize: 22, lineHeight: 1, position: 'relative', zIndex: 1 }}>
                {tab.emoji}
              </span>
              <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: 11,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: -0.2,
                position: 'relative',
                zIndex: 1,
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

BottomNav.displayName = 'BottomNav';
