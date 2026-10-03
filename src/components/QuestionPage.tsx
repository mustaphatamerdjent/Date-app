import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HandwritingAnimation } from './HandwritingAnimation';
import { RunawayNoButton } from './RunawayNoButton';

interface QuestionPageProps {
  herName: string;
  onAccept: () => void;
  reducedMotion?: boolean;
  replayKey?: number;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({
  herName,
  onAccept,
  reducedMotion = false,
  replayKey = 0,
}) => {
  const [handwritingComplete, setHandwritingComplete] = useState(false);
  const [evadeCount, setEvadeCount] = useState(0);

  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const heroZoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHandwritingComplete(false);
    setEvadeCount(0);
  }, [herName, replayKey]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center py-6">
      {/* Protected zone for Hero Handwriting + Question so the No button never overlaps it */}
      <div
        ref={heroZoneRef}
        className="w-full flex flex-col items-center justify-center px-4 pb-2"
      >
        <HandwritingAnimation
          text={herName}
          durationMs={2050}
          reducedMotion={reducedMotion}
          replayKey={replayKey}
          onComplete={() => setHandwritingComplete(true)}
          className="mb-3 sm:mb-5"
        />

        {/* The Question — revealed smoothly after handwriting completes */}
        <motion.p
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 12 }
          }
          animate={
            handwritingComplete
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: reducedMotion ? 0 : 12 }
          }
          transition={
            reducedMotion
              ? { duration: 0.15 }
              : {
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          className="text-2xl sm:text-3xl md:text-[34px] font-medium tracking-[-0.025em] text-[#1D1D1F] leading-snug"
          style={{
            textWrap: 'balance',
            willChange: 'transform, opacity',
          }}
        >
          will you go out on a date?
        </motion.p>
      </div>

      {/* Yes / No Actions — revealed smoothly right after the question */}
      <motion.div
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 10 }
        }
        animate={
          handwritingComplete
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: reducedMotion ? 0 : 10 }
        }
        transition={
          reducedMotion
            ? { duration: 0.15, delay: 0.05 }
            : {
                duration: 0.6,
                delay: 0.16,
                ease: [0.16, 1, 0.3, 1],
              }
        }
        className="mt-10 sm:mt-12 flex items-center justify-center gap-4 sm:gap-5"
        style={{
          pointerEvents: handwritingComplete ? 'auto' : 'none',
          willChange: 'transform, opacity',
        }}
      >
        <motion.button
          ref={yesButtonRef}
          type="button"
          onClick={onAccept}
          whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          animate={
            !reducedMotion && evadeCount >= 2
              ? { scale: Math.min(1.08, 1 + evadeCount * 0.015) }
              : { scale: 1 }
          }
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 24,
          }}
          className="min-w-[128px] min-h-[52px] px-8 py-3.5 rounded-2xl text-[15px] font-semibold text-white bg-[#1D1D1F] hover:bg-[#2C2C2E] shadow-[0_12px_28px_-6px_rgba(29,29,31,0.28)] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D1D1F]"
        >
          Yes
        </motion.button>

        <RunawayNoButton
          yesButtonRef={yesButtonRef}
          forbiddenZoneRef={heroZoneRef}
          onEvade={(count) => setEvadeCount(count)}
          reducedMotion={reducedMotion}
        />
      </motion.div>
    </div>
  );
};
