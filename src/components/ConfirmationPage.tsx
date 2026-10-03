import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Check, Copy, RotateCcw } from 'lucide-react';
import { formatFriendlyDate } from './Calendar';
import { HandwritingAnimation } from './HandwritingAnimation';

interface ConfirmationPageProps {
  herName?: string;
  selectedDate: Date | null;
  selectedFood: string | null;
  onEditDate: () => void;
  onEditFood: () => void;
  onRestart: () => void;
  reducedMotion?: boolean;
}

interface CelebrationMote {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  isPetal: boolean;
  rotate: number;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  herName = 'Fatima',
  selectedDate,
  selectedFood,
  onEditDate,
  onEditFood,
  onRestart,
  reducedMotion = false,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedDate = selectedDate
    ? formatFriendlyDate(selectedDate)
    : 'Soon';
  const foodChoice = selectedFood || 'Surprise me';

  // Subtle upward-floating celebration particles & tiny delicate petals/confetti
  const celebrationMotes = useMemo<CelebrationMote[]>(() => {
    const palette = [
      'rgba(255, 194, 214, 0.72)',
      'rgba(253, 224, 152, 0.68)',
      'rgba(218, 196, 255, 0.68)',
      'rgba(255, 255, 255, 0.85)',
      'rgba(190, 232, 255, 0.65)',
    ];
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: 12 + ((i * 37) % 76),
      y: 20 + ((i * 29) % 68),
      size: 5 + (i % 4) * 1.8,
      duration: 4.5 + (i % 5) * 0.9,
      delay: (i % 7) * 0.2,
      color: palette[i % palette.length],
      isPetal: i % 3 === 0,
      rotate: (i * 47) % 360,
    }));
  }, []);

  const handleCopySummary = async () => {
    const summary = `It's a date!\n${herName}\nDate: ${formattedDate}\nFood: ${foodChoice}\nLooking forward to it ❤️`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownloadIcs = () => {
    const target = selectedDate || new Date();
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');

    const startStr = `${yyyy}${mm}${dd}T190000`;
    const endStr = `${yyyy}${mm}${dd}T213000`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FatimaDate//Invitation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Date Night with ${herName} (${foodChoice})`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `DESCRIPTION:Date with ${herName} — ${foodChoice}. Looking forward to it ❤️`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `date-with-${herName.toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      {/* Subtle Celebratory Floating Petals & Glowing Particles */}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        >
          {celebrationMotes.map((m) => (
            <motion.span
              key={m.id}
              initial={{ opacity: 0, y: 28, scale: 0.4, rotate: m.rotate }}
              animate={{
                opacity: [0, 0.9, 0],
                y: [28, -64],
                scale: [0.5, 1.05, 0.75],
                rotate: [m.rotate, m.rotate + (m.isPetal ? 65 : 20)],
              }}
              transition={{
                duration: m.duration,
                delay: m.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: `${m.size}px`,
                height: m.isPetal ? `${m.size * 1.45}px` : `${m.size}px`,
                backgroundColor: m.color,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.7)',
                willChange: 'transform, opacity',
              }}
              className="absolute rounded-full"
            />
          ))}
        </div>
      )}

      {/* Heading */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center mb-7"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1D1D1F]">
          It&apos;s a date.
        </h1>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, scale: 0.97 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.55,
          delay: 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 w-full apple-card rounded-3xl p-6 sm:p-8 flex flex-col"
      >
        {/* Handwritten Fatima Header inside the Summary Card */}
        <div className="flex flex-col items-center pb-5 mb-5 border-b border-[#1D1D1F]/[0.07]">
          <HandwritingAnimation
            text={herName}
            durationMs={1450}
            reducedMotion={reducedMotion}
            strokeWidth={5.8}
            className="max-w-[230px]"
          />
          <span className="sr-only">{herName}</span>
        </div>

        {/* Date & Food Details */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-4 py-1">
            <span className="text-[13px] font-medium text-[#1D1D1F]/55">
              Date:
            </span>
            <button
              type="button"
              onClick={onEditDate}
              title="Change date"
              className="text-[15px] sm:text-base font-semibold text-[#1D1D1F] hover:text-[#1D1D1F]/70 transition-colors text-right cursor-pointer"
            >
              {formattedDate}
            </button>
          </div>

          <div className="h-px w-full bg-[#1D1D1F]/[0.06]" />

          <div className="flex items-baseline justify-between gap-4 py-1">
            <span className="text-[13px] font-medium text-[#1D1D1F]/55">
              Food:
            </span>
            <button
              type="button"
              onClick={onEditFood}
              title="Change food"
              className="text-[15px] sm:text-base font-semibold text-[#1D1D1F] hover:text-[#1D1D1F]/70 transition-colors text-right cursor-pointer"
            >
              {foodChoice}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Final Message */}
      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          delay: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 mt-7 text-[16px] sm:text-[17px] font-medium text-[#1D1D1F]/90 text-center"
      >
        Looking forward to it ❤️
      </motion.p>

      {/* Subtle Secondary Utilities */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2.5"
      >
        <button
          type="button"
          onClick={handleCopySummary}
          className="min-h-[42px] px-4 py-2 rounded-xl text-[13px] font-medium text-[#1D1D1F]/80 bg-white/75 hover:bg-white border border-white/80 shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied details</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy details</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="min-h-[42px] px-4 py-2 rounded-xl text-[13px] font-medium text-[#1D1D1F]/80 bg-white/75 hover:bg-white border border-white/80 shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Add to Calendar</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          aria-label="Replay invitation"
          className="min-h-[42px] px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#1D1D1F]/55 hover:text-[#1D1D1F]/85 hover:bg-white/40 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>
      </motion.div>
    </div>
  );
};
