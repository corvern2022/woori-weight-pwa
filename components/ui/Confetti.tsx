'use client';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  dx: number;
  delay: number;
}

const COLORS = [
  'var(--duck)',
  'var(--dolphin)',
  'var(--mint)',
  'var(--peach)',
  'var(--pink)',
];

export function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80,
      y: 50 + Math.random() * 30,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 4,
      dx: (Math.random() - 0.5) * 120,
      delay: Math.random() * 0.3,
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '2px',
            animation: `confettiFly 0.8s ease-out ${p.delay}s forwards`,
            ['--dx' as string]: `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
