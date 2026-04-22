'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  active: 'home' | 'tasks' | 'weight' | 'chat';
}

const tabs = [
  { id: 'home', label: '홈', emoji: '🏠', href: '/' },
  { id: 'tasks', label: '할일', emoji: '✅', href: '/tasks' },
  { id: 'weight', label: '체중', emoji: '⚖️', href: '/weight' },
  { id: 'chat', label: '코치', emoji: '💬', href: '/chat' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/weight')) return 'weight';
    if (pathname.startsWith('/chat')) return 'chat';
    return active;
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-ink/8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-accent' : 'text-ink-mute'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-xs font-gaegu">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

BottomNav.displayName = 'BottomNav';
