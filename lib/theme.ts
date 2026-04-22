// lib/theme.ts
export const THEMES = {
  light: {
    bg: '#EAF4FB', bgDeep: '#D4ECF7', card: '#FFFFFF', cardAlt: '#F5FAFE',
    ink: '#2A3D54', inkSoft: '#6B8AA8', inkMute: '#A6B7C7',
    accent: '#5BBFE8', accentDeep: '#2F95C4', accentSoft: '#CDE9F6',
    mint: '#9BDBC0', mintDeep: '#5FB894',
    peach: '#FFB89A', peachDeep: '#E88560',
    duck: '#FFC83A', duckDeep: '#E8B020', duckSoft: '#FFF2C4',
    dolphin: '#5BBFE8', dolphinDeep: '#2F95C4', dolphinSoft: '#CDE9F6',
    pink: '#FFB3C8',
    border: 'rgba(42,61,84,0.08)',
    shadow: '0 2px 0 rgba(42,61,84,0.04), 0 10px 26px -8px rgba(47,149,196,0.22)',
    shadowSoft: '0 1px 0 rgba(42,61,84,0.03), 0 6px 16px -6px rgba(47,149,196,0.15)',
    cloudColor: '#fff',
  },
  dark: {
    bg: '#0F1E2E', bgDeep: '#152838', card: '#1E3447', cardAlt: '#17293A',
    ink: '#E8F2FB', inkSoft: '#8FA8BE', inkMute: '#5E7690',
    accent: '#6FCCF2', accentDeep: '#4FB5E0', accentSoft: '#1F3E54',
    mint: '#7ACFB0', mintDeep: '#5FB894',
    peach: '#FFB89A', peachDeep: '#E88560',
    duck: '#FFD76B', duckDeep: '#E8B820', duckSoft: '#3A3018',
    dolphin: '#6FCCF2', dolphinDeep: '#4FB5E0', dolphinSoft: '#1F3E54',
    pink: '#FFB3C8',
    border: 'rgba(255,255,255,0.07)',
    shadow: '0 2px 0 rgba(0,0,0,0.2), 0 10px 26px -8px rgba(0,0,0,0.4)',
    shadowSoft: '0 1px 0 rgba(0,0,0,0.2), 0 6px 16px -6px rgba(0,0,0,0.3)',
    cloudColor: '#1E3447',
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];
