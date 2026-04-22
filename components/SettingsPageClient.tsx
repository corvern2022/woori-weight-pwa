'use client';

import React, { useState, useEffect } from 'react';
import { BottomNav } from '@/components/ui';
import { DuckDolphinPair } from '@/components/characters';
import { useTheme } from '@/lib/themeContext';

type Actor = '창희' | '하경';

export function SettingsPageClient() {
  const { dark, setDark } = useTheme();
  const [actor, setActor] = useState<Actor | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ori_ranger_actor') as Actor | null;
    if (saved === '창희' || saved === '하경') {
      setActor(saved);
    }
  }, []);

  function selectActor(value: Actor) {
    setActor(value);
    localStorage.setItem('ori_ranger_actor', value);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-ink/10 shadow-soft safe-top">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-jua text-ink text-xl">설정 ⚙️</h1>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4 max-w-lg mx-auto px-4 py-4 pb-20">

        {/* Section 1: 내 정보 */}
        <section className="bg-card rounded-2xl shadow-soft p-4">
          <p className="font-jua text-ink-soft text-sm mb-3">내 정보</p>
          <p className="font-gaegu text-ink-soft text-sm mb-2">나는:</p>
          <div className="flex gap-3">
            <button
              onClick={() => selectActor('창희')}
              className={`flex-1 py-2 px-4 rounded-pill font-gaegu text-base transition-colors ${
                actor === '창희'
                  ? 'bg-duck text-white'
                  : 'bg-card-alt text-ink-mute'
              }`}
            >
              🦆 창희
            </button>
            <button
              onClick={() => selectActor('하경')}
              className={`flex-1 py-2 px-4 rounded-pill font-gaegu text-base transition-colors ${
                actor === '하경'
                  ? 'bg-dolphin text-white'
                  : 'bg-card-alt text-ink-mute'
              }`}
            >
              🐬 하경
            </button>
          </div>
        </section>

        {/* Section 2: 화면 설정 */}
        <section className="bg-card rounded-2xl shadow-soft p-4">
          <p className="font-jua text-ink-soft text-sm mb-3">화면 설정</p>
          <div className="flex items-center justify-between">
            <span className="font-gaegu text-ink">다크 모드</span>
            <button
              onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                dark ? 'bg-duck' : 'bg-ink/20'
              }`}
              aria-label="다크 모드 토글"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  dark ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Section 3: 앱 정보 */}
        <section className="bg-card rounded-2xl shadow-soft p-4">
          <p className="font-jua text-ink-soft text-sm mb-3">앱 정보</p>
          <div className="flex flex-col items-center gap-2">
            <DuckDolphinPair size={80} />
            <p className="font-jua text-ink text-lg">오리 레인저</p>
            <p className="font-gaegu text-ink-mute text-sm">1.0.0</p>
          </div>
        </section>

      </div>

      <BottomNav active="home" />
    </div>
  );
}
