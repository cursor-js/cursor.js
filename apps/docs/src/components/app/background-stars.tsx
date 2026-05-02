import { useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import './background-stars.css';

export function BackgroundStars({ count = 80 }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    if (!mounted || resolvedTheme !== 'dark') return [];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }, [count]);

  return (
    <>
      {stars.map((s) => (
        <div
          key={s.id}
          className="bg-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--dur': `${s.dur}s`,
            '--delay': `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
