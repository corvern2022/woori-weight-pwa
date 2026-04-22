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
        height: size,
        opacity,
        animation: 'floatCloud 6s ease-in-out infinite',
        ...style,
      }}
    >
      <svg viewBox="0 0 200 120" width="100%" height="100%" style={{ display: 'block' }}>
        <ellipse cx="100" cy="80" rx="90" ry="40" fill="currentColor" />
        <circle cx="70" cy="65" r="35" fill="currentColor" />
        <circle cx="110" cy="55" r="42" fill="currentColor" />
        <circle cx="150" cy="68" r="30" fill="currentColor" />
      </svg>
    </div>
  );
};

CloudDeco.displayName = 'CloudDeco';
