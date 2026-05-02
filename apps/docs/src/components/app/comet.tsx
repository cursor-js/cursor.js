import { useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import './comet.css';

export function Comet({ angle = 45, isVisible = true }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallingStars = useMemo(() => {
    // Return empty array on server to avoid hydration mismatch
    if (!mounted) return [];

    const goldSparkles = [
      '#f8ffc4',
      '#ffed8a',
      '#ffcf5f',
      '#bfb177',
      '#ffe940',
      '#dbbc74',
      '#e3d881',
      '#e6d65e',
      '#e6cb05',
    ];
    const colors = goldSparkles;

    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    return Array.from({ length: 30 }, (_, i) => {
      const p = Math.pow(Math.random(), 2); // Yıldızları orijine (kuyruğun başına) daha fazla yığmak için kare aldık.
      const base = p * 120; // Dağılma mesafesini (eskiden 320) büyük ölçüde azalttık.
      const ox = (Math.random() - 0.5) * 30;
      const oy = (Math.random() - 0.5) * 30;
      const dist = 60 + Math.random() * 120;

      return {
        id: i,
        x: 30 + base * cosA + ox,
        y: 30 + base * sinA + oy,
        dx: dist * cosA,
        dy: dist * sinA,
        size: 6 + Math.random() * 14,
        duration: 1.5 + Math.random() * 2.5,
        delay: -Math.random() * 4, // Negatif delay ile render olur olmaz sayfa öncesinden başlamış gibi hemen dökülürler.
        color: colors[Math.floor(Math.random() * colors.length)],
        isRound: Math.random() > 0.5,
      };
    });
  }, [resolvedTheme, angle]);

  return (
    <div
      className="comet"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
        pointerEvents: 'none',
      }}
    >
      <div className="comet-head" />

      <div className="comet-tail" style={{ '--angle': `${angle}deg` }}>
        <div className="tail-glow" />
        <div className="tail-glow-2" />
      </div>

      {fallingStars.map((star) =>
        star.isRound ? (
          <div
            key={star.id}
            className="falling-star"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.color,
              '--dx': `${star.dx}px`,
              '--dy': `${star.dy}px`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
            }}
          />
        ) : (
          <div
            key={star.id}
            className="star-shape"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              '--size': `${star.size}px`,
              '--color': star.color,
              '--dx': `${star.dx}px`,
              '--dy': `${star.dy}px`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
            }}
          >
            <StarSVG color={star.color} />
          </div>
        ),
      )}
    </div>
  );
}

function StarSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={color} />
    </svg>
  );
}
