import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export interface FoodOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FoodSelectionProps {
  selectedFood: string | null;
  onSelectFood: (foodTitle: string) => void;
  onContinue: () => void;
  reducedMotion?: boolean;
}

export const FOOD_OPTIONS: FoodOption[] = [
  {
    id: 'pizza',
    title: 'Pizza',
    description: 'Something cheesy sounds good.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 3 4 20c5.2-1.8 10.8-1.8 16 0L12 3Z" />
        <path d="M6.2 15.5c3.8-1.2 7.8-1.2 11.6 0" />
        <circle cx="12" cy="10.5" r="1" />
        <circle cx="10" cy="13.5" r="1" />
        <circle cx="14.2" cy="13.2" r="1" />
      </svg>
    ),
  },
  {
    id: 'burgers',
    title: 'Burgers',
    description: 'Casual, classic, and undefeated.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M5 11a7 7 0 0 1 14 0H5Z" />
        <path d="M4 14h16" />
        <path d="M5 17h14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
      </svg>
    ),
  },
  {
    id: 'sushi',
    title: 'Sushi',
    description: "Let's keep it classy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <ellipse cx="12" cy="10" rx="7" ry="4" />
        <path d="M5 10v5c0 2.2 3.1 4 7 4s7-1.8 7-4v-5" />
        <ellipse cx="12" cy="10" rx="2.6" ry="1.4" />
      </svg>
    ),
  },
  {
    id: 'tacos',
    title: 'Tacos',
    description: 'Messy but worth it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 16a8 8 0 0 1 16 0Z" />
        <path d="M7.5 11.5c1-1.2 2.8-1.2 3.8 0 1.2-1.2 3-1.2 4.2 0" />
      </svg>
    ),
  },
  {
    id: 'pasta',
    title: 'Pasta',
    description: "Can't really go wrong.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 13h16a7 7 0 0 1-14 0" />
        <path d="M7 10c1.5-2 3.5-2 5 0s3.5 2 5 0" />
        <path d="M8 19h8" />
      </svg>
    ),
  },
  {
    id: 'steak',
    title: 'Steak',
    description: 'Dressing up a little.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M8 5h8l-1 7a5 5 0 0 1-6 0L8 5Z" />
        <path d="M12 13v6" />
        <path d="M9 19h6" />
      </svg>
    ),
  },
  {
    id: 'healthy',
    title: 'Something healthy',
    description: 'Fresh, light, and feel-good.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    id: 'surprise',
    title: 'You choose',
    description: 'Surprise me with your favorite spot.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

export const FoodSelection: React.FC<FoodSelectionProps> = ({
  selectedFood,
  onSelectFood,
  onContinue,
  reducedMotion = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Heading & Subheading */}
      <div className="text-center mb-7 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#1D1D1F] mb-2"
          style={{ textWrap: 'balance' }}
        >
          Now the important question...
        </h1>
        <p className="text-[15px] sm:text-base text-[#1D1D1F]/60 font-normal">
          What should we eat?
        </p>
      </div>

      {/* Food Options Grid */}
      <div
        role="radiogroup"
        aria-label="Food choices"
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5"
      >
        {FOOD_OPTIONS.map((item) => {
          const isSelected = selectedFood === item.title;

          return (
            <motion.button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectFood(item.title)}
              whileHover={reducedMotion ? undefined : { scale: 1.012, y: -1 }}
              whileTap={reducedMotion ? undefined : { scale: 0.988 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative w-full text-left rounded-2xl p-4 sm:p-4.5 flex items-center gap-3.5 transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#1D1D1F] text-white shadow-[0_14px_30px_-8px_rgba(29,29,31,0.28)]'
                  : 'bg-white/80 hover:bg-white text-[#1D1D1F] shadow-[0_4px_14px_-4px_rgba(29,29,31,0.04),inset_0_0_0_1px_rgba(29,29,31,0.07)]'
              }`}
              style={{
                willChange: 'transform',
              }}
            >
              {/* Subtle Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-white/15 text-white'
                    : 'bg-[#1D1D1F]/[0.045] text-[#1D1D1F]/75 group-hover:bg-[#1D1D1F]/[0.07] group-hover:text-[#1D1D1F]'
                }`}
              >
                {item.icon}
              </div>

              {/* Title & Short Description */}
              <div className="flex-1 min-w-0 pr-2">
                <div
                  className={`text-[15px] font-semibold tracking-[-0.01em] truncate ${
                    isSelected ? 'text-white' : 'text-[#1D1D1F]'
                  }`}
                >
                  {item.title}
                </div>
                <div
                  className={`text-[13px] leading-snug mt-0.5 truncate ${
                    isSelected ? 'text-white/75' : 'text-[#1D1D1F]/55'
                  }`}
                >
                  {item.description}
                </div>
              </div>

              {/* Selection Checkmark Indicator */}
              <div
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-white text-[#1D1D1F] scale-100 opacity-100'
                    : 'border border-[#1D1D1F]/15 scale-95 opacity-45 group-hover:opacity-75'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="w-full mt-7 sm:mt-8 flex justify-center">
        <button
          type="button"
          disabled={!selectedFood}
          onClick={onContinue}
          className={`w-full sm:w-auto min-w-[180px] min-h-[52px] px-9 py-3.5 rounded-2xl text-[15px] font-semibold transition-all whitespace-nowrap ${
            selectedFood
              ? 'bg-[#1D1D1F] text-white shadow-[0_12px_28px_-6px_rgba(29,29,31,0.28)] hover:bg-[#2C2C2E] active:scale-[0.98] cursor-pointer'
              : 'bg-[#1D1D1F]/[0.07] text-[#1D1D1F]/35 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
