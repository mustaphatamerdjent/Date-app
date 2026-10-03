import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface DreamyGardenBackgroundProps {
  isCelebrating?: boolean;
  reducedMotion?: boolean;
}

type FlowerVariant = 'daisy' | 'five-petal' | 'wildflower' | 'abstract';
type DepthLayer = 'far' | 'mid' | 'near';

interface FlowerItem {
  id: string;
  variant: FlowerVariant;
  depth: DepthLayer;
  /** Percentage X coordinate (0-100) positioned around edges/frame to keep center clear */
  x: number;
  /** Percentage Y coordinate (0-100) */
  y: number;
  size: number;
  petalColor: string;
  centerColor: string;
  opacity: number;
  durationSec: number;
  delaySec: number;
  animStyle: 'a' | 'b' | 'spin';
  initialRotate: number;
  celebrationOnly?: boolean;
}

interface AmbientParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  durationSec: number;
  delaySec: number;
}

/**
 * Renders one of four delicate, minimal Apple-inspired botanical SVG flowers.
 */
const BotanicalFlowerSvg: React.FC<{
  variant: FlowerVariant;
  petalColor: string;
  centerColor: string;
  size: number;
}> = React.memo(({ variant, petalColor, centerColor, size }) => {
  if (variant === 'daisy') {
    // 8 slender organic petals around a warm center
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        <g opacity="0.92">
          {angles.map((deg) => (
            <ellipse
              key={deg}
              cx="32"
              cy="15"
              rx="5.2"
              ry="13"
              fill={petalColor}
              transform={`rotate(${deg} 32 32)`}
            />
          ))}
        </g>
        <circle cx="32" cy="32" r="7.5" fill={centerColor} />
        <circle cx="32" cy="32" r="4.2" fill="#FFFFFF" fillOpacity="0.45" />
      </svg>
    );
  }

  if (variant === 'five-petal') {
    // Soft rounded 5-petal blossom with delicate stamen dots
    const angles = [0, 72, 144, 216, 288];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        <g opacity="0.9">
          {angles.map((deg) => (
            <path
              key={deg}
              d="M32 30 C23 22, 20 9, 28 7 C30.5 6.3, 32 8.2, 32 8.2 C32 8.2, 33.5 6.3, 36 7 C44 9, 41 22, 32 30 Z"
              fill={petalColor}
              transform={`rotate(${deg} 32 32)`}
            />
          ))}
        </g>
        <circle cx="32" cy="32" r="5.8" fill={centerColor} />
        <circle cx="29.5" cy="29.5" r="1.3" fill="#FFFFFF" fillOpacity="0.7" />
      </svg>
    );
  }

  if (variant === 'wildflower') {
    // 6-petal soft cosmos wildflower
    const angles = [0, 60, 120, 180, 240, 300];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="overflow-visible"
      >
        <g opacity="0.88">
          {angles.map((deg) => (
            <path
              key={deg}
              d="M32 31 C25 23, 24 11, 32 8 C40 11, 39 23, 32 31 Z"
              fill={petalColor}
              transform={`rotate(${deg} 32 32)`}
            />
          ))}
        </g>
        <circle cx="32" cy="32" r="6.2" fill={centerColor} />
      </svg>
    );
  }

  // 'abstract': Delicate overlapping 4-petal translucent bloom
  const angles = [0, 90, 180, 270];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="overflow-visible"
    >
      <g opacity="0.82">
        {angles.map((deg) => (
          <ellipse
            key={`outer-${deg}`}
            cx="32"
            cy="18"
            rx="9"
            ry="12.5"
            fill={petalColor}
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
        {angles.map((deg) => (
          <ellipse
            key={`inner-${deg}`}
            cx="32"
            cy="20"
            rx="6.5"
            ry="10"
            fill="#FFFFFF"
            fillOpacity="0.5"
            transform={`rotate(${deg + 45} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="5.5" fill={centerColor} />
    </svg>
  );
});

BotanicalFlowerSvg.displayName = 'BotanicalFlowerSvg';

const GARDEN_FLOWERS: FlowerItem[] = [
  // FAR LAYER (smaller, softer, slightly blurred, atmospheric depth)
  {
    id: 'f-far-1',
    variant: 'daisy',
    depth: 'far',
    x: 16,
    y: 18,
    size: 22,
    petalColor: '#FFFFFF',
    centerColor: '#FDE68A',
    opacity: 0.48,
    durationSec: 16,
    delaySec: -2,
    animStyle: 'a',
    initialRotate: 12,
  },
  {
    id: 'f-far-2',
    variant: 'five-petal',
    depth: 'far',
    x: 82,
    y: 14,
    size: 20,
    petalColor: '#FFE4EE',
    centerColor: '#FBBF24',
    opacity: 0.45,
    durationSec: 19,
    delaySec: -6,
    animStyle: 'b',
    initialRotate: -18,
  },
  {
    id: 'f-far-3',
    variant: 'wildflower',
    depth: 'far',
    x: 24,
    y: 78,
    size: 18,
    petalColor: '#EFE5FF',
    centerColor: '#FDE047',
    opacity: 0.42,
    durationSec: 21,
    delaySec: -9,
    animStyle: 'spin',
    initialRotate: 35,
  },
  {
    id: 'f-far-4',
    variant: 'abstract',
    depth: 'far',
    x: 76,
    y: 82,
    size: 22,
    petalColor: '#E6F4FF',
    centerColor: '#FDE68A',
    opacity: 0.44,
    durationSec: 17,
    delaySec: -4,
    animStyle: 'a',
    initialRotate: 40,
  },
  {
    id: 'f-far-5',
    variant: 'daisy',
    depth: 'far',
    x: 48,
    y: 11,
    size: 17,
    petalColor: '#FFF8EE',
    centerColor: '#FCD34D',
    opacity: 0.38,
    durationSec: 23,
    delaySec: -11,
    animStyle: 'b',
    initialRotate: 8,
  },
  {
    id: 'f-far-6',
    variant: 'five-petal',
    depth: 'far',
    x: 54,
    y: 89,
    size: 19,
    petalColor: '#FFE8F0',
    centerColor: '#FDE68A',
    opacity: 0.4,
    durationSec: 20,
    delaySec: -7,
    animStyle: 'a',
    initialRotate: -24,
  },
  {
    id: 'f-far-7',
    variant: 'wildflower',
    depth: 'far',
    x: 11,
    y: 52,
    size: 20,
    petalColor: '#FFF5D6',
    centerColor: '#F59E0B',
    opacity: 0.42,
    durationSec: 18,
    delaySec: -3,
    animStyle: 'b',
    initialRotate: 15,
  },
  {
    id: 'f-far-8',
    variant: 'daisy',
    depth: 'far',
    x: 89,
    y: 47,
    size: 21,
    petalColor: '#F3E8FF',
    centerColor: '#FDE68A',
    opacity: 0.42,
    durationSec: 22,
    delaySec: -14,
    animStyle: 'spin',
    initialRotate: 0,
  },

  // MID LAYER (medium size, framing the screen edges gracefully)
  {
    id: 'f-mid-1',
    variant: 'five-petal',
    depth: 'mid',
    x: 8,
    y: 26,
    size: 36,
    petalColor: '#FFE4EE',
    centerColor: '#FCD34D',
    opacity: 0.68,
    durationSec: 15,
    delaySec: -1,
    animStyle: 'a',
    initialRotate: -12,
  },
  {
    id: 'f-mid-2',
    variant: 'daisy',
    depth: 'mid',
    x: 91,
    y: 24,
    size: 34,
    petalColor: '#FFFFFF',
    centerColor: '#FBBF24',
    opacity: 0.72,
    durationSec: 17,
    delaySec: -5,
    animStyle: 'b',
    initialRotate: 22,
  },
  {
    id: 'f-mid-3',
    variant: 'wildflower',
    depth: 'mid',
    x: 7,
    y: 72,
    size: 38,
    petalColor: '#EFE5FF',
    centerColor: '#FCD34D',
    opacity: 0.66,
    durationSec: 19,
    delaySec: -8,
    animStyle: 'b',
    initialRotate: 18,
  },
  {
    id: 'f-mid-4',
    variant: 'abstract',
    depth: 'mid',
    x: 92,
    y: 70,
    size: 35,
    petalColor: '#FFF5D6',
    centerColor: '#F59E0B',
    opacity: 0.68,
    durationSec: 16,
    delaySec: -12,
    animStyle: 'a',
    initialRotate: -20,
  },
  {
    id: 'f-mid-5',
    variant: 'five-petal',
    depth: 'mid',
    x: 31,
    y: 9,
    size: 30,
    petalColor: '#E6F4FF',
    centerColor: '#FDE047',
    opacity: 0.6,
    durationSec: 20,
    delaySec: -4,
    animStyle: 'spin',
    initialRotate: 0,
  },
  {
    id: 'f-mid-6',
    variant: 'daisy',
    depth: 'mid',
    x: 68,
    y: 91,
    size: 32,
    petalColor: '#FFF8EE',
    centerColor: '#FBBF24',
    opacity: 0.64,
    durationSec: 18,
    delaySec: -9,
    animStyle: 'a',
    initialRotate: 14,
  },

  // NEAR FOREGROUND LAYER (larger, sharper, corner accents)
  {
    id: 'f-near-1',
    variant: 'five-petal',
    depth: 'near',
    x: 5,
    y: 10,
    size: 52,
    petalColor: '#FFFFFF',
    centerColor: '#FBBF24',
    opacity: 0.84,
    durationSec: 14,
    delaySec: -2,
    animStyle: 'a',
    initialRotate: 15,
  },
  {
    id: 'f-near-2',
    variant: 'daisy',
    depth: 'near',
    x: 94,
    y: 11,
    size: 48,
    petalColor: '#FFE4EE',
    centerColor: '#F59E0B',
    opacity: 0.82,
    durationSec: 16,
    delaySec: -7,
    animStyle: 'b',
    initialRotate: -16,
  },
  {
    id: 'f-near-3',
    variant: 'wildflower',
    depth: 'near',
    x: 6,
    y: 89,
    size: 50,
    petalColor: '#FFF8EE',
    centerColor: '#FBBF24',
    opacity: 0.84,
    durationSec: 15,
    delaySec: -5,
    animStyle: 'b',
    initialRotate: 24,
  },
  {
    id: 'f-near-4',
    variant: 'abstract',
    depth: 'near',
    x: 93,
    y: 88,
    size: 54,
    petalColor: '#EFE5FF',
    centerColor: '#FCD34D',
    opacity: 0.82,
    durationSec: 17,
    delaySec: -10,
    animStyle: 'a',
    initialRotate: -8,
  },

  // CELEBRATION BLOOMS (gently appear on Page 4 — Confirmation)
  {
    id: 'f-cel-1',
    variant: 'five-petal',
    depth: 'mid',
    x: 15,
    y: 36,
    size: 40,
    petalColor: '#FFE4EE',
    centerColor: '#FBBF24',
    opacity: 0.8,
    durationSec: 14,
    delaySec: 0,
    animStyle: 'a',
    initialRotate: 10,
    celebrationOnly: true,
  },
  {
    id: 'f-cel-2',
    variant: 'daisy',
    depth: 'mid',
    x: 85,
    y: 35,
    size: 38,
    petalColor: '#FFFFFF',
    centerColor: '#F59E0B',
    opacity: 0.82,
    durationSec: 15,
    delaySec: -3,
    animStyle: 'b',
    initialRotate: -14,
    celebrationOnly: true,
  },
  {
    id: 'f-cel-3',
    variant: 'wildflower',
    depth: 'mid',
    x: 18,
    y: 64,
    size: 34,
    petalColor: '#FFF5D6',
    centerColor: '#FBBF24',
    opacity: 0.76,
    durationSec: 16,
    delaySec: -2,
    animStyle: 'a',
    initialRotate: 28,
    celebrationOnly: true,
  },
  {
    id: 'f-cel-4',
    variant: 'five-petal',
    depth: 'mid',
    x: 83,
    y: 62,
    size: 36,
    petalColor: '#EFE5FF',
    centerColor: '#FCD34D',
    opacity: 0.78,
    durationSec: 17,
    delaySec: -4,
    animStyle: 'b',
    initialRotate: -22,
    celebrationOnly: true,
  },
];

export const DreamyGardenBackground: React.FC<DreamyGardenBackgroundProps> = ({
  isCelebrating = false,
  reducedMotion = false,
}) => {
  const farLayerRef = useRef<HTMLDivElement | null>(null);
  const midLayerRef = useRef<HTMLDivElement | null>(null);
  const nearLayerRef = useRef<HTMLDivElement | null>(null);
  const blobLayerRef = useRef<HTMLDivElement | null>(null);

  const [isTabHidden, setIsTabHidden] = useState(false);

  // Subtle floating luminous particles
  const particles = useMemo<AmbientParticle[]>(() => {
    const colors = [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 228, 238, 0.85)',
      'rgba(254, 240, 195, 0.85)',
      'rgba(235, 224, 255, 0.8)',
      'rgba(218, 242, 255, 0.8)',
    ];
    return Array.from({ length: 20 }, (_, i) => ({
      id: `p-${i}`,
      x: 6 + ((i * 41) % 88),
      y: 8 + ((i * 29) % 84),
      size: 3 + (i % 4) * 1.4,
      color: colors[i % colors.length],
      durationSec: 8 + (i % 6) * 2.2,
      delaySec: -(i * 1.3),
    }));
  }, []);

  // Pause animations when tab is hidden for performance
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Smooth interactive parallax on desktop + gentle autonomous drift on mobile
  useEffect(() => {
    if (reducedMotion || isTabHidden) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastMouseTime = 0;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      targetX = nx;
      targetY = ny;
      lastMouseTime = performance.now();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animateParallax = (now: number) => {
      // If no recent mouse activity (e.g. mobile or idle), apply a gentle autonomous figure-8 breeze
      if (now - lastMouseTime > 2500) {
        const t = now * 0.00035;
        targetX = Math.sin(t) * 0.45;
        targetY = Math.cos(t * 0.75) * 0.45;
      }

      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;

      if (blobLayerRef.current) {
        blobLayerRef.current.style.transform = `translate3d(${(currentX * -14).toFixed(2)}px, ${(currentY * -14).toFixed(2)}px, 0)`;
      }
      if (farLayerRef.current) {
        farLayerRef.current.style.transform = `translate3d(${(currentX * -7).toFixed(2)}px, ${(currentY * -7).toFixed(2)}px, 0)`;
      }
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translate3d(${(currentX * -15).toFixed(2)}px, ${(currentY * -15).toFixed(2)}px, 0)`;
      }
      if (nearLayerRef.current) {
        nearLayerRef.current.style.transform = `translate3d(${(currentX * -24).toFixed(2)}px, ${(currentY * -24).toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(animateParallax);
    };

    rafId = requestAnimationFrame(animateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, isTabHidden]);

  const farFlowers = useMemo(
    () => GARDEN_FLOWERS.filter((f) => f.depth === 'far' && !f.celebrationOnly),
    []
  );
  const midFlowers = useMemo(
    () => GARDEN_FLOWERS.filter((f) => f.depth === 'mid' && !f.celebrationOnly),
    []
  );
  const nearFlowers = useMemo(
    () => GARDEN_FLOWERS.filter((f) => f.depth === 'near' && !f.celebrationOnly),
    []
  );
  const celebrationFlowers = useMemo(
    () => GARDEN_FLOWERS.filter((f) => f.celebrationOnly),
    []
  );

  const getAnimClass = (style: 'a' | 'b' | 'spin') => {
    if (reducedMotion) return '';
    if (style === 'a') return 'animate-flower-a';
    if (style === 'b') return 'animate-flower-b';
    return 'animate-flower-spin';
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${
        isTabHidden ? 'garden-paused' : ''
      }`}
      style={{
        background:
          'linear-gradient(135deg, #FFF9F7 0%, #FDF6FA 38%, #F6F7FF 72%, #FDFBF7 100%)',
      }}
    >
      {/* 1. Large Blurred Atmospheric Gradient Blobs */}
      <div
        ref={blobLayerRef}
        className="absolute inset-[-12%] transition-opacity duration-1000"
        style={{ willChange: 'transform' }}
      >
        {/* Soft Rose-Pink & Coral Blob (Top Left) */}
        <div
          className={`absolute -top-[8%] -left-[8%] w-[62vw] h-[62vw] max-w-[680px] max-h-[680px] rounded-full opacity-65 ${
            reducedMotion ? '' : 'animate-blob-1'
          }`}
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(255, 178, 204, 0.62) 0%, rgba(255, 200, 178, 0.42) 45%, rgba(255, 255, 255, 0) 72%)',
            filter: 'blur(52px)',
          }}
        />

        {/* Dreamy Lavender & Periwinkle Blue Blob (Top Right) */}
        <div
          className={`absolute -top-[5%] -right-[10%] w-[65vw] h-[65vw] max-w-[720px] max-h-[720px] rounded-full opacity-60 ${
            reducedMotion ? '' : 'animate-blob-2'
          }`}
          style={{
            background:
              'radial-gradient(circle at 55% 45%, rgba(208, 184, 255, 0.58) 0%, rgba(178, 224, 255, 0.45) 48%, rgba(255, 255, 255, 0) 72%)',
            filter: 'blur(56px)',
          }}
        />

        {/* Warm Peach, Apricot & Soft Sunlight Yellow Blob (Bottom Left) */}
        <div
          className={`absolute -bottom-[12%] -left-[6%] w-[60vw] h-[60vw] max-w-[660px] max-h-[660px] rounded-full opacity-60 ${
            reducedMotion ? '' : 'animate-blob-3'
          }`}
          style={{
            background:
              'radial-gradient(circle at 45% 55%, rgba(255, 224, 166, 0.58) 0%, rgba(255, 188, 175, 0.44) 48%, rgba(255, 255, 255, 0) 72%)',
            filter: 'blur(54px)',
          }}
        />

        {/* Soft Cyan-Blue & Lilac Mist Blob (Bottom Right) */}
        <div
          className={`absolute -bottom-[10%] -right-[8%] w-[58vw] h-[58vw] max-w-[640px] max-h-[640px] rounded-full opacity-55 ${
            reducedMotion ? '' : 'animate-blob-1'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(182, 232, 248, 0.55) 0%, rgba(226, 196, 255, 0.42) 50%, rgba(255, 255, 255, 0) 74%)',
            filter: 'blur(54px)',
            animationDelay: '-12s',
          }}
        />

        {/* Extra Magical Golden-Rose Aura when Page 4 (Confirmation) is reached */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: isCelebrating ? 0.85 : 0.25,
            background:
              'radial-gradient(circle at 50% 46%, rgba(255, 212, 228, 0.5) 0%, rgba(255, 234, 196, 0.35) 38%, rgba(255, 255, 255, 0) 68%)',
          }}
        />
      </div>

      {/* Soft Center Readability Halo so foreground text is always ultra-crisp */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(255, 253, 251, 0.55) 0%, rgba(255, 253, 251, 0.22) 36%, rgba(255, 253, 251, 0) 68%)',
        }}
      />

      {/* 2. Tiny Floating Luminous Garden Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${reducedMotion ? '' : 'animate-particle'}`}
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                '--p-dur': `${p.durationSec}s`,
                '--p-delay': `${p.delaySec}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* 3. Far Depth Layer Flowers (Small, soft blur, atmospheric distance) */}
      <div
        ref={farLayerRef}
        className="absolute inset-0"
        style={{ filter: 'blur(1.6px)', willChange: 'transform' }}
      >
        {farFlowers.map((flower) => (
          <div
            key={flower.id}
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              opacity: flower.opacity,
              transform: `translate(-50%, -50%) rotate(${flower.initialRotate}deg)`,
            }}
            className="absolute"
          >
            <div
              className={getAnimClass(flower.animStyle)}
              style={
                {
                  '--flower-dur': `${flower.durationSec}s`,
                  '--flower-delay': `${flower.delaySec}s`,
                } as React.CSSProperties
              }
            >
              <BotanicalFlowerSvg
                variant={flower.variant}
                petalColor={flower.petalColor}
                centerColor={flower.centerColor}
                size={flower.size}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Mid Depth Layer Flowers (Medium size, gentle glow around edges) */}
      <div
        ref={midLayerRef}
        className="absolute inset-0"
        style={{ filter: 'blur(0.4px)', willChange: 'transform' }}
      >
        {midFlowers.map((flower) => (
          <div
            key={flower.id}
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              opacity: flower.opacity,
              transform: `translate(-50%, -50%) rotate(${flower.initialRotate}deg)`,
              filter: 'drop-shadow(0 4px 12px rgba(255, 190, 210, 0.25))',
            }}
            className="absolute"
          >
            <div
              className={getAnimClass(flower.animStyle)}
              style={
                {
                  '--flower-dur': `${flower.durationSec}s`,
                  '--flower-delay': `${flower.delaySec}s`,
                } as React.CSSProperties
              }
            >
              <BotanicalFlowerSvg
                variant={flower.variant}
                petalColor={flower.petalColor}
                centerColor={flower.centerColor}
                size={flower.size}
              />
            </div>
          </div>
        ))}

        {/* Additional Celebration Blooms that appear smoothly on Page 4 */}
        <AnimatePresence>
          {isCelebrating &&
            celebrationFlowers.map((flower, idx) => (
              <motion.div
                key={flower.id}
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.3, rotate: flower.initialRotate - 25 }
                }
                animate={{
                  opacity: flower.opacity,
                  scale: 1,
                  rotate: flower.initialRotate,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + idx * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  left: `${flower.x}%`,
                  top: `${flower.y}%`,
                  filter: 'drop-shadow(0 6px 16px rgba(255, 182, 205, 0.35))',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={getAnimClass(flower.animStyle)}
                  style={
                    {
                      '--flower-dur': `${flower.durationSec}s`,
                      '--flower-delay': `${flower.delaySec}s`,
                    } as React.CSSProperties
                  }
                >
                  <BotanicalFlowerSvg
                    variant={flower.variant}
                    petalColor={flower.petalColor}
                    centerColor={flower.centerColor}
                    size={flower.size}
                  />
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* 5. Near Foreground Layer Flowers (Sharper, larger corner framing blooms) */}
      <div
        ref={nearLayerRef}
        className="absolute inset-0"
        style={{ willChange: 'transform' }}
      >
        {nearFlowers.map((flower) => (
          <div
            key={flower.id}
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              opacity: flower.opacity,
              transform: `translate(-50%, -50%) rotate(${flower.initialRotate}deg)`,
              filter: 'drop-shadow(0 8px 20px rgba(235, 175, 200, 0.32))',
            }}
            className="absolute"
          >
            <div
              className={getAnimClass(flower.animStyle)}
              style={
                {
                  '--flower-dur': `${flower.durationSec}s`,
                  '--flower-delay': `${flower.delaySec}s`,
                } as React.CSSProperties
              }
            >
              <BotanicalFlowerSvg
                variant={flower.variant}
                petalColor={flower.petalColor}
                centerColor={flower.centerColor}
                size={flower.size}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
