import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface PageTransitionProps {
  stepKey: string;
  children: React.ReactNode;
  reducedMotion?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  stepKey,
  children,
  reducedMotion = false,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 18, scale: 0.985, filter: 'blur(4px)' }
        }
        animate={
          reducedMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
        }
        exit={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -14, scale: 0.988, filter: 'blur(4px)' }
        }
        transition={
          reducedMotion
            ? { duration: 0.15 }
            : {
                duration: 0.56,
                ease: [0.16, 1, 0.3, 1],
              }
        }
        className="relative z-10 w-full min-h-[100dvh] flex flex-col items-center justify-center px-5 py-12 sm:px-8"
        style={{
          willChange: 'transform, opacity, filter',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
