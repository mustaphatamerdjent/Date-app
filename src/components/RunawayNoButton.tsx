import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface RunawayNoButtonProps {
  yesButtonRef: React.RefObject<HTMLButtonElement | null>;
  forbiddenZoneRef: React.RefObject<HTMLElement | null>;
  onEvade?: (count: number) => void;
  reducedMotion?: boolean;
}

interface Offset {
  x: number;
  y: number;
  rotate: number;
}

const PLAYFUL_NO_LABELS = [
  'No',
  'Are you sure?',
  'Really?',
  'Nice try 😭',
  'Still trying? 😭',
  'Not an option ✨',
  'Just click Yes',
];

function boxesOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
  padding = 0
): boolean {
  return !(
    a.right + padding < b.left ||
    a.left - padding > b.right ||
    a.bottom + padding < b.top ||
    a.top - padding > b.bottom
  );
}

export const RunawayNoButton: React.FC<RunawayNoButtonProps> = ({
  yesButtonRef,
  forbiddenZoneRef,
  onEvade,
  reducedMotion = false,
}) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const offsetRef = useRef<Offset>({ x: 0, y: 0, rotate: 0 });
  const evadeCountRef = useRef(0);
  const lastEvadeTimeRef = useRef(0);

  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0, rotate: 0 });
  const [evadeCount, setEvadeCount] = useState(0);

  const computeEscapeOffset = useCallback(
    (pointerX: number, pointerY: number) => {
      const anchorEl = anchorRef.current;
      if (!anchorEl) return;

      const now = performance.now();
      if (now - lastEvadeTimeRef.current < 95) return;

      const anchorRect = anchorEl.getBoundingClientRect();
      // Account for wider playful labels like "Are you sure?" (~160px)
      const btnW = Math.max(158, buttonRef.current?.offsetWidth || anchorRect.width || 140);
      const btnH = Math.max(52, buttonRef.current?.offsetHeight || anchorRect.height || 52);

      const originCenterX = anchorRect.left + anchorRect.width / 2;
      const originCenterY = anchorRect.top + anchorRect.height / 2;

      const currentCenterX = originCenterX + offsetRef.current.x;
      const currentCenterY = originCenterY + offsetRef.current.y;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const yesRect = yesButtonRef.current?.getBoundingClientRect() || null;
      const heroRect = forbiddenZoneRef.current?.getBoundingClientRect() || null;

      let dx = currentCenterX - pointerX;
      let dy = currentCenterY - pointerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) {
        const randomAngle = Math.random() * Math.PI * 2;
        dx = Math.cos(randomAngle);
        dy = Math.sin(randomAngle);
      } else {
        dx /= dist;
        dy /= dist;
      }

      const baseAngle = Math.atan2(dy, dx);

      // Safe viewport bounds so the button never clips off-screen
      const edgeMarginX = Math.max(24, btnW * 0.58);
      const edgeMarginTop = Math.max(76, btnH * 1.2);
      const edgeMarginBottom = Math.max(76, btnH * 1.2);

      const playfieldRadiusX = Math.min(285, vw * 0.4);
      const playfieldRadiusY = Math.min(210, vh * 0.34);

      const minX = Math.max(edgeMarginX, vw / 2 - playfieldRadiusX);
      const maxX = Math.min(vw - edgeMarginX, vw / 2 + playfieldRadiusX);
      const minY = Math.max(edgeMarginTop, vh / 2 - playfieldRadiusY * 0.45);
      const maxY = Math.min(vh - edgeMarginBottom, vh / 2 + playfieldRadiusY);

      interface Candidate {
        cx: number;
        cy: number;
        score: number;
      }

      const candidates: Candidate[] = [];

      const angleOffsets = [
        0,
        0.35,
        -0.35,
        0.75,
        -0.75,
        1.2,
        -1.2,
        1.7,
        -1.7,
        2.3,
        -2.3,
        Math.PI,
      ];
      const stepDistances = [135, 175, 215];

      for (const dStep of stepDistances) {
        for (const aOff of angleOffsets) {
          const angle = baseAngle + aOff;
          const cx = currentCenterX + Math.cos(angle) * dStep;
          const cy = currentCenterY + Math.sin(angle) * dStep;
          candidates.push({ cx, cy, score: 0 });
        }
      }

      for (let i = 0; i < 16; i++) {
        const theta = (i / 16) * Math.PI * 2;
        for (const r of [120, 175, 225]) {
          const cx = originCenterX + Math.cos(theta) * r;
          const cy = originCenterY + Math.sin(theta) * (r * 0.72);
          candidates.push({ cx, cy, score: 0 });
        }
      }

      let bestCandidate: Candidate | null = null;
      let bestScore = -Infinity;

      for (const cand of candidates) {
        const { cx, cy } = cand;

        if (cx < minX || cx > maxX || cy < minY || cy > maxY) {
          continue;
        }

        const candBox = {
          left: cx - btnW / 2,
          right: cx + btnW / 2,
          top: cy - btnH / 2,
          bottom: cy + btnH / 2,
        };

        if (yesRect && boxesOverlap(candBox, yesRect, 30)) {
          continue;
        }

        if (heroRect && boxesOverlap(candBox, heroRect, 20)) {
          continue;
        }

        const distFromPointer = Math.hypot(cx - pointerX, cy - pointerY);
        const distFromCurrent = Math.hypot(cx - currentCenterX, cy - currentCenterY);

        if (distFromPointer < 105 || distFromCurrent < 65) {
          continue;
        }

        const moveVecX = (cx - currentCenterX) / distFromCurrent;
        const moveVecY = (cy - currentCenterY) / distFromCurrent;
        const dot = moveVecX * dx + moveVecY * dy;

        const distFromOrigin = Math.hypot(cx - originCenterX, cy - originCenterY);
        const score =
          dot * 65 +
          Math.min(180, distFromPointer) * 0.5 -
          distFromOrigin * 0.18 +
          (Math.random() * 14 - 7);

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = cand;
        }
      }

      if (!bestCandidate) {
        const fallbackCandidates = [
          { cx: originCenterX, cy: Math.min(maxY, originCenterY + 95) },
          { cx: Math.max(minX, originCenterX - 88), cy: Math.min(maxY, originCenterY + 85) },
          { cx: Math.min(maxX, originCenterX + 88), cy: Math.min(maxY, originCenterY + 85) },
          { cx: originCenterX, cy: Math.max(minY, originCenterY - 85) },
        ];
        let maxPointerDist = -1;
        for (const fb of fallbackCandidates) {
          const candBox = {
            left: fb.cx - btnW / 2,
            right: fb.cx + btnW / 2,
            top: fb.cy - btnH / 2,
            bottom: fb.cy + btnH / 2,
          };
          if (yesRect && boxesOverlap(candBox, yesRect, 18)) continue;
          const d = Math.hypot(fb.cx - pointerX, fb.cy - pointerY);
          if (d > maxPointerDist) {
            maxPointerDist = d;
            bestCandidate = { cx: fb.cx, cy: fb.cy, score: d };
          }
        }
      }

      if (bestCandidate) {
        const nextX = bestCandidate.cx - originCenterX;
        const nextY = bestCandidate.cy - originCenterY;
        const nextRotate = reducedMotion
          ? 0
          : Math.max(-6, Math.min(6, (nextX - offsetRef.current.x) * 0.025));

        const nextOffset = { x: nextX, y: nextY, rotate: nextRotate };
        offsetRef.current = nextOffset;
        lastEvadeTimeRef.current = now;
        evadeCountRef.current += 1;
        setOffset(nextOffset);
        setEvadeCount(evadeCountRef.current);
        onEvade?.(evadeCountRef.current);
      }
    },
    [yesButtonRef, forbiddenZoneRef, onEvade, reducedMotion]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const anchorEl = anchorRef.current;
      if (!anchorEl) return;

      const anchorRect = anchorEl.getBoundingClientRect();
      const currentCenterX = anchorRect.left + anchorRect.width / 2 + offsetRef.current.x;
      const currentCenterY = anchorRect.top + anchorRect.height / 2 + offsetRef.current.y;

      const btnW = buttonRef.current?.offsetWidth || anchorRect.width || 128;
      const distance = Math.hypot(e.clientX - currentCenterX, e.clientY - currentCenterY);
      const proximityRadius = Math.max(94, btnW * 0.72);

      if (distance < proximityRadius) {
        computeEscapeOffset(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [computeEscapeOffset]);

  useEffect(() => {
    const handleResize = () => {
      offsetRef.current = { x: 0, y: 0, rotate: 0 };
      setOffset({ x: 0, y: 0, rotate: 0 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchOrPointerAttempt = (
    e:
      | React.TouchEvent<HTMLButtonElement>
      | React.PointerEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    computeEscapeOffset(clientX, clientY);
  };

  const currentLabel =
    evadeCount === 0
      ? PLAYFUL_NO_LABELS[0]
      : PLAYFUL_NO_LABELS[
          Math.min(
            PLAYFUL_NO_LABELS.length - 1,
            1 + ((evadeCount - 1) % (PLAYFUL_NO_LABELS.length - 1))
          )
        ];

  return (
    <div
      ref={anchorRef}
      className="relative inline-flex items-center justify-center min-w-[132px] min-h-[52px]"
    >
      <motion.button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        aria-label={currentLabel}
        animate={{
          x: offset.x,
          y: offset.y,
          rotate: offset.rotate,
        }}
        transition={
          reducedMotion
            ? { duration: 0.15 }
            : {
                type: 'spring',
                stiffness: 340,
                damping: 23,
                mass: 0.75,
              }
        }
        onMouseEnter={handleTouchOrPointerAttempt}
        onPointerDown={handleTouchOrPointerAttempt}
        onTouchStart={handleTouchOrPointerAttempt}
        onClick={handleTouchOrPointerAttempt}
        className="min-w-[132px] min-h-[52px] px-7 py-3.5 rounded-2xl text-[15px] font-medium text-[#1D1D1F]/80 bg-white/75 backdrop-blur-md border border-white/80 shadow-[0_8px_24px_-6px_rgba(38,24,44,0.08)] select-none cursor-default whitespace-nowrap"
        style={{
          willChange: 'transform',
          touchAction: 'none',
        }}
      >
        {currentLabel}
      </motion.button>
    </div>
  );
};
