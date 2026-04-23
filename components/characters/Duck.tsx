import React from 'react';

export type DuckPalette = 'yellow' | 'cream' | 'outline';
export type DuckVariant = 'default' | 'wave' | 'strong' | 'head';

export interface DuckProps {
  size?: number;
  variant?: DuckVariant;
  palette?: DuckPalette;
  style?: React.CSSProperties;
}

interface PaletteColors {
  main: string;
  shade: string;
  beak: string;
  beakShade: string;
  eye: string;
  cheek: string;
}

const DUCK_PALETTES: Record<DuckPalette, PaletteColors> = {
  yellow: {
    main: '#FFC83A',
    shade: '#F2A91E',
    beak: '#FF8A3D',
    beakShade: '#E8691A',
    eye: '#2A1F12',
    cheek: '#FFB8B8',
  },
  cream: {
    main: '#FFD76B',
    shade: '#E8B53A',
    beak: '#FF9C5A',
    beakShade: '#E67832',
    eye: '#3A2A18',
    cheek: '#FFC4B8',
  },
  outline: {
    main: '#FFC83A',
    shade: '#2A1F12',
    beak: '#FF8A3D',
    beakShade: '#2A1F12',
    eye: '#2A1F12',
    cheek: '#FFB8B8',
  },
};

export const Duck: React.FC<DuckProps> = ({
  size = 80,
  variant = 'default',
  palette = 'yellow',
  style = {},
}) => {
  const body = DUCK_PALETTES[palette] || DUCK_PALETTES.yellow;
  const isOutline = palette === 'outline';
  const stroke = isOutline ? '#2A1F12' : 'none';
  const sw = isOutline ? 2.2 : 0;

  if (variant === 'default' || variant === 'wave' || variant === 'strong') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <ellipse cx="52" cy="68" rx="30" ry="22" fill={body.shade} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="50" cy="62" rx="28" ry="22" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <path
          d="M40 60 Q 38 74, 52 76 Q 62 74, 58 60 Z"
          fill={body.shade}
          stroke={stroke}
          strokeWidth={sw}
          opacity={0.85}
        />
        <circle cx="50" cy="36" r="20" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="66" cy="40" rx="12" ry="6" fill={body.beak} stroke={stroke} strokeWidth={sw} />
        <path
          d="M54 40 Q 66 43, 78 40"
          stroke={body.beakShade}
          strokeWidth="1.5"
          fill="none"
          opacity={isOutline ? 0 : 0.6}
        />
        <ellipse cx="52" cy="32" rx="3.2" ry="4" fill={body.eye} />
        <circle cx="53" cy="30.5" r="1.1" fill="#fff" />
        {variant === 'strong' && (
          <path
            d="M46 25 Q 50 22, 56 25"
            stroke={body.eye}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        )}
        <ellipse cx="40" cy="38" rx="4" ry="2.5" fill={body.cheek} opacity={0.7} />
        <ellipse cx="42" cy="86" rx="5" ry="3" fill={body.beak} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="56" cy="86" rx="5" ry="3" fill={body.beak} stroke={stroke} strokeWidth={sw} />
        {variant === 'wave' && (
          <g transform="translate(22, 45) rotate(-20)">
            <ellipse cx="0" cy="0" rx="6" ry="5" fill={body.shade} stroke={stroke} strokeWidth={sw} />
          </g>
        )}
        {variant === 'strong' && (
          <g>
            <path
              d="M26 58 Q 18 50, 22 42 Q 26 38, 32 42"
              fill={body.main}
              stroke={stroke}
              strokeWidth={sw}
            />
            <circle cx="22" cy="44" r="5" fill={body.shade} stroke={stroke} strokeWidth={sw} />
          </g>
        )}
      </svg>
    );
  }

  if (variant === 'head') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
        <circle cx="50" cy="50" r="32" fill={body.main} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="72" cy="54" rx="14" ry="7" fill={body.beak} stroke={stroke} strokeWidth={sw} />
        <ellipse cx="52" cy="44" rx="3.5" ry="4.5" fill={body.eye} />
        <circle cx="53" cy="42" r="1.3" fill="#fff" />
        <ellipse cx="38" cy="52" rx="5" ry="3" fill={body.cheek} opacity={0.7} />
      </svg>
    );
  }

  return null;
};

Duck.displayName = 'Duck';
