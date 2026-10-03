import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onContinue: () => void;
  reducedMotion?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatFriendlyDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
  onContinue,
  reducedMotion = false,
}) => {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const initial = selectedDate || today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const [monthDirection, setMonthDirection] = useState<number>(1);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const isCurrentOrPastMonth =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month <= today.getMonth());

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    // Pad to complete rows of 7
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [year, month]);

  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setMonthDirection(-1);
    setViewMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setMonthDirection(1);
    setViewMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Heading & Subheading */}
      <div className="text-center mb-7 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#1D1D1F] mb-2"
          style={{ textWrap: 'balance' }}
        >
          Okay, then let&apos;s pick a day.
        </h1>
        <p className="text-[15px] sm:text-base text-[#1D1D1F]/60 font-normal">
          When are you free?
        </p>
      </div>

      {/* Custom Interactive Calendar Card */}
      <div className="w-full apple-card rounded-3xl p-5 sm:p-6">
        {/* Month Header & Navigation */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[#1D1D1F] tabular-nums">
            {MONTH_NAMES[month]} {year}
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isCurrentOrPastMonth}
              aria-label="Previous month"
              className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-colors ${
                isCurrentOrPastMonth
                  ? 'text-[#1D1D1F]/20 cursor-not-allowed'
                  : 'text-[#1D1D1F]/75 hover:bg-[#1D1D1F]/5 active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-[#1D1D1F]/75 hover:bg-[#1D1D1F]/5 active:scale-95 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-[12px] font-medium text-[#1D1D1F]/45 py-1 select-none"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid with Smooth Month Transition */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-${month}`}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: monthDirection * 18 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, x: 0 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: monthDirection * -18 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
              }
              className="grid grid-cols-7 gap-1 sm:gap-1.5"
            >
              {calendarCells.map((cellDate, idx) => {
                if (!cellDate) {
                  return <div key={`empty-${idx}`} className="h-11 sm:h-11" />;
                }

                const isPast = cellDate.getTime() < today.getTime();
                const isSelected = isSameCalendarDay(cellDate, selectedDate);
                const isToday = isSameCalendarDay(cellDate, today);

                return (
                  <button
                    key={cellDate.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => onSelectDate(cellDate)}
                    aria-label={cellDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    aria-pressed={isSelected}
                    className={`relative h-11 sm:h-11 w-full rounded-2xl flex items-center justify-center text-[14px] font-medium tabular-nums transition-all select-none ${
                      isPast
                        ? 'text-[#1D1D1F]/22 cursor-not-allowed'
                        : isSelected
                          ? 'text-white font-semibold cursor-pointer'
                          : 'text-[#1D1D1F] hover:bg-[#1D1D1F]/[0.06] active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={reducedMotion ? undefined : 'selectedDateHighlight'}
                        initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={
                          reducedMotion
                            ? { duration: 0.1 }
                            : { type: 'spring', stiffness: 420, damping: 28 }
                        }
                        className="absolute inset-0.5 rounded-xl bg-[#1D1D1F] shadow-[0_6px_16px_-4px_rgba(29,29,31,0.35)]"
                      />
                    )}

                    <span className="relative z-10">{cellDate.getDate()}</span>

                    {/* Subtle dot indicator for today if not selected */}
                    {isToday && !isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#1D1D1F]/45"
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Date Feedback Message */}
      <div className="min-h-[44px] flex items-center justify-center mt-5 text-center px-2">
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.p
              key={selectedDate.toISOString()}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] font-medium text-[#1D1D1F]"
            >
              Perfect.{' '}
              <span className="font-semibold">
                {formatFriendlyDate(selectedDate)}
              </span>{' '}
              it is.
            </motion.p>
          ) : (
            <motion.p
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13px] text-[#1D1D1F]/40"
            >
              Tap a day above to lock it in
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Continue Button */}
      <div className="w-full mt-4 flex justify-center">
        <button
          type="button"
          disabled={!selectedDate}
          onClick={onContinue}
          className={`w-full sm:w-auto min-w-[180px] min-h-[52px] px-9 py-3.5 rounded-2xl text-[15px] font-semibold transition-all whitespace-nowrap ${
            selectedDate
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
