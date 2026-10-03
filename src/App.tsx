/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { DreamyGardenBackground } from './components/DreamyGardenBackground';
import { PageTransition } from './components/PageTransition';
import { QuestionPage } from './components/QuestionPage';
import { Calendar } from './components/Calendar';
import { FoodSelection } from './components/FoodSelection';
import { ConfirmationPage } from './components/ConfirmationPage';

type Step = 'question' | 'date' | 'food' | 'confirmation';

const HER_NAME = 'Fatima';

export default function App() {
  const [step, setStep] = useState<Step>('question');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState<number>(0);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleBack = () => {
    if (step === 'date') setStep('question');
    else if (step === 'food') setStep('date');
    else if (step === 'confirmation') setStep('food');
  };

  const handleRestart = () => {
    setStep('question');
    setReplayKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-x-hidden">
      {/* Continuous Dreamy Digital Garden Animated Background */}
      <DreamyGardenBackground
        isCelebrating={step === 'confirmation'}
        reducedMotion={reducedMotion}
      />

      {/* Minimal Floating Top Controls (Back on steps 2-4, subtle Replay on step 1) */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 h-14 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {step !== 'question' && (
              <motion.button
                key="back-btn"
                type="button"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                onClick={handleBack}
                aria-label="Go back"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-[13px] font-medium text-[#1D1D1F]/70 hover:text-[#1D1D1F] bg-white/45 hover:bg-white/75 backdrop-blur-md border border-white/60 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto flex items-center gap-1">
          {step === 'question' && (
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              title="Replay handwriting animation"
              aria-label="Replay handwriting animation"
              className="min-h-[40px] min-w-[40px] rounded-xl text-[#1D1D1F]/35 hover:text-[#1D1D1F]/80 hover:bg-white/50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Single-Page Experience */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center">
        <PageTransition stepKey={step} reducedMotion={reducedMotion}>
          {step === 'question' && (
            <QuestionPage
              herName={HER_NAME}
              onAccept={() => setStep('date')}
              reducedMotion={reducedMotion}
              replayKey={replayKey}
            />
          )}

          {step === 'date' && (
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onContinue={() => setStep('food')}
              reducedMotion={reducedMotion}
            />
          )}

          {step === 'food' && (
            <FoodSelection
              selectedFood={selectedFood}
              onSelectFood={setSelectedFood}
              onContinue={() => setStep('confirmation')}
              reducedMotion={reducedMotion}
            />
          )}

          {step === 'confirmation' && (
            <ConfirmationPage
              herName={HER_NAME}
              selectedDate={selectedDate}
              selectedFood={selectedFood}
              onEditDate={() => setStep('date')}
              onEditFood={() => setStep('food')}
              onRestart={handleRestart}
              reducedMotion={reducedMotion}
            />
          )}
        </PageTransition>
      </main>
    </div>
  );
}
