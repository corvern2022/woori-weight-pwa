import React from 'react';

interface CloudDecoProps {
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const CloudDeco: React.FC<CloudDecoProps> = ({
  size = 120,
  opacity = 0.6,
  style = {},
  className = '',
}) => {
  return (
    <div
      className={`text-white ${className}`}
      style={{
        width: size,
        height: size * 0.6,
        opacity,
        ...style,
      }}
    >
      <svg viewBox="0 0 120 72" width="100%" height="100%" style={{ display: 'block' }}>
        <ellipse cx="30" cy="50" rx="26" ry="20" fill="currentColor" />
        <ellipse cx="60" cy="38" rx="34" ry="28" fill="currentColor" />
        <ellipse cx="90" cy="50" rx="28" ry="20" fill="currentColor" />
        <ellipse cx="58" cy="56" rx="40" ry="14" fill="currentColor" />
      </svg>
    </div>
  );
};

CloudDeco.displayName = 'CloudDeco';
