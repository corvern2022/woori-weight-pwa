import React from 'react';

export type DolphinPalette = 'blue' | 'pink' | 'outline';
export type DolphinVariant = 'default' | 'cry' | 'happy' | 'head';

export interface DolphinProps {
  size?: number;
  variant?: DolphinVariant;
  palette?: DolphinPalette;
  style?: React.CSSProperties;
}

interface PaletteColors {
  main: string;
  shade: string;
  belly: string;
  eye: string;
  cheek: string;
  tear: string;
}

const DOLPHIN_PALETTES: Record<DolphinPalette, PaletteColors> = {
  blue: {
    main: '#7FC8E8',
    shade: '#4FA8D4',
    belly: '#E8F4FB',
    eye: '#1F2D3D',
    cheek: '#FFB3C8',
    tear: '#5BBFE8',
  },
  pink: {
    main: '#F4A8C0',
    shade: '#D97AA0',
    belly: '#FFEEF3',
    eye: '#3F1F2D',
    cheek: '#FFB3C8',
    tear: '#7FC8E8',
  },
  outline: {
    main: '#7FC8E8',
    shade: '#2A1F12',
    belly: '#E8F4FB',
    eye: '#2A1F12',
    cheek: '#FFB3C8',
    tear: '#5BBFE8',
  },
};

export const Dolphin: React.FC<DolphinProps> = ({
  size = 80,
  variant = 'default',
  palette = 'blue',
  style = {},
}) => {
  const body = DOLPHIN_PALETTES[palette] || DOLPHIN_PALETTES.blue;
  const isOutline = palette === 'outline';
  const stroke = isOutline ? '#2A1F12' : 'none';
  const sw = isOutline ? 2.2 : 0;

  if (variant === 'default' || variant === 'cry' || variant === 'happy') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <path
          d="M12 62 Q 4 54, 6 46 L 18 56 Q 16 64, 12 62 Z"
          fill={body.shade}
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M14 70 Q 6 76, 4 70 L 18 62 Q 20 68, 14 70 Z"
          fill={body.shade}
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M20 58 Q 30 36, 60 36 Q 82 38, 86 52 Q 84 64, 74 66 Q 50 72, 30 70 Q 22 68, 20 58 Z"
          fill={body.main}
          stroke={stroke}
          strokeWidth={sw}
        />
        <path
          d="M28 62 Q 40 68, 60 68 Q 72 66, 78 60 Q 70 72, 50 72 Q 34 72, 28 62 Z"
          fill={body.belly}
          opacity={isOutline ? 0.6 : 0.75}
        />
        <path
          d="M54 38 Q 58 28, 66 32 Q 64 38, 60 40 Z"
          fill={body.shade}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse
          cx="42"
          cy="64"
          rx="7"
          ry="4"
          fill={body.shade}
          stroke={stroke}
          strokeWidth={sw}
          transform="rotate(15 42 64)"
        />
        <path
          d="M80 52 Q 86 52, 86 54 Q 84 56, 80 56"
          stroke={body.shade}
          strokeWidth="1.2"
          fill="none"
          opacity={isOutline ? 0 : 0.5}
        />
        {variant !== 'cry' && (
          <path
            d="M78 55 Q 82 58, 82 54"
            stroke={body.eye}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {variant === 'cry' && (
          <path
            d="M78 58 Q 82 54, 82 58"
            stroke={body.eye}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {variant === 'happy' ? (
          <path
            d="M68 46 Q 72 42, 76 46"
            stroke={body.eye}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <>
            <ellipse cx="72" cy="48" rx="2.8" ry="3.5" fill={body.eye} />
            <circle cx="73" cy="46.5" r="1" fill="#fff" />
          </>
        )}
        {variant === 'cry' && (
          <>
            <ellipse cx="70" cy="56" rx="2" ry="3.5" fill={body.tear} opacity={0.85} />
            <ellipse cx="75" cy="58" rx="1.8" ry="3" fill={body.tear} opacity={0.85} />
          </>
        )}
        <ellipse cx="62" cy="54" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
      </svg>
    );
  }

  if (variant === 'head') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <ellipse cx="50" cy="52" rx="34" ry="28" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="50" cy="60" rx="28" ry="18" fill={body.belly} opacity={0.8} />
        <ellipse cx="62" cy="48" rx="3" ry="4" fill={body.eye} />
        <circle cx="63" cy="46" r="1.1" fill="#fff" />
        <path
          d="M70 58 Q 74 62, 74 56"
          stroke={body.eye}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="46" cy="58" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
      </svg>
    );
  }

  return null;
};

Dolphin.displayName = 'Dolphin';
