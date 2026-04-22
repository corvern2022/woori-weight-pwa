import React from 'react';
import { Duck, type DuckPalette } from './Duck';
import { Dolphin } from './Dolphin';

export type DuckDolphinPairPalette = 'yellow' | 'cream' | 'outline';

export interface DuckDolphinPairProps {
  size?: number;
  palette?: DuckPalette;
  style?: React.CSSProperties;
}

export const DuckDolphinPair: React.FC<DuckDolphinPairProps> = ({
  size = 140,
  palette = 'yellow',
  style = {},
}) => {
  const containerHeight = size * 0.75;
  const dolphinPalette = palette === 'yellow' ? 'blue' : 'pink';

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: containerHeight,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <Duck size={size * 0.65} variant="default" palette={palette} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 4 }}>
        <Dolphin size={size * 0.7} variant="default" palette={dolphinPalette} />
      </div>
    </div>
  );
};

DuckDolphinPair.displayName = 'DuckDolphinPair';
