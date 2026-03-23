'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAvailableBsYears, getBsYearDays, BS_MONTH_NAMES, BsDay, BsYearData } from '@/lib/bsCalendar';

interface BsCalendarGridProps {
  selectedAdDate?: string;
  onDateSelect?: (bs: BsDay) => void;
  className?: string;
}

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

const BS_MONTHS_NP: Record<number, string> = {
  1: 'बैशाख', 2: 'जेठ', 3: 'असार', 4: 'श्रावण',
  5: 'भदौ', 6: 'अश्विन', 7: 'कार्तिक', 8: 'मंसिर',
  9: 'पौष', 10: 'माघ', 11: 'फाल्गुन', 12: 'चैत्र',
};

function getLocalStorageYears(): Record<number, BsYearData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bs-calendar-data');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function BsCalendarGrid({ selectedAdDate, onDateSelect, className = '' }: BsCalendarGridProps) {
  const [yearData, setYearData] = useState<Record<number, BsYearData>>(() => {
    const local = getLocalStorageYears();
    if (local) return local;
    const staticYears: Record<number, BsYearData> = {};
    for (const y of getAvailableBsYears()) {
      staticYears[y] = { year: y, days: getBsYearDays(y) };
    }
    return staticYears;
  });

  const availableYears = Object.keys(yearData).map(Number).sort();
  const currentYear = new Date().getFullYear();
  const currentBsYear = (() => {
    for (const y of availableYears) {
      const days = yearData[y]?.days || [];
      if (days.some(d => d.ad.startsWith(String(currentYear)))) return y;
    }
    return availableYears.find(y => y >= 2083) || 2083;
  })();
  const defaultYear = currentBsYear || availableYears[0] || 2083;

  const [bsYear, setBsYear] = useState(defaultYear);

  const visibleYears = (() => {
    if (availableYears.length <= 15) return availableYears;
    const idx = availableYears.indexOf(bsYear);
    const start = Math.max(0, idx - 7);
    return availableYears.slice(start, start + 15);
  })();
  const [bsMonth, setBsMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const months = (() => {
    const data = yearData[bsYear];
    if (!data) return [];
    const monthMap: Record<number, BsDay[]> = {};
    for (const day of data.days) {
      if (!monthMap[day.bsMonth]) monthMap[day.bsMonth] = [];
      monthMap[day.bsMonth].push(day);
    }
    return Object.entries(monthMap)
      .map(([m, d]) => ({
        month: parseInt(m),
        name: BS_MONTH_NAMES[parseInt(m)]?.name || `M${m}`,
        nameNp: BS_MONTHS_NP[parseInt(m)] || '',
        dayCount: d.length,
      }))
      .sort((a, b) => a.month - b.month);
  })();

  const days = (() => {
    const data = yearData[bsYear];
    if (!data) return [];
    return data.days.filter(d => d.bsMonth === bsMonth);
  })();

  const highlightAd = selectedAdDate
    ? (() => {
        for (const y of availableYears) {
          const found = yearData[y]?.days.find(d => d.ad === selectedAdDate);
          if (found) return found;
        }
        return null;
      })()
    : null;

  useEffect(() => {
    const handler = () => {
      const local = getLocalStorageYears();
      if (local) setYearData(local);
    };
    window.addEventListener('bs-calendar-updated', handler);
    return () => window.removeEventListener('bs-calendar-updated', handler);
  }, []);

  useEffect(() => {
    if (highlightAd) {
      if (highlightAd.bsYear !== bsYear) {
        setBsYear(highlightAd.bsYear);
        setBsMonth(highlightAd.bsMonth);
        setSelectedDay(highlightAd.bsDay);
      } else if (highlightAd.bsMonth !== bsMonth) {
        setBsMonth(highlightAd.bsMonth);
        setSelectedDay(highlightAd.bsDay);
      } else {
        setSelectedDay(highlightAd.bsDay);
      }
    }
  }, [selectedAdDate]);

  const goToPrevMonth = useCallback(() => {
    if (bsMonth === 1) {
      if (bsYear > availableYears[0]) {
        setBsYear(bsYear - 1);
        setBsMonth(12);
        setSelectedDay(null);
      }
    } else {
      setBsMonth(bsMonth - 1);
      setSelectedDay(null);
    }
  }, [bsMonth, bsYear, availableYears]);

  const goToNextMonth = useCallback(() => {
    if (bsMonth === 12) {
      if (bsYear < availableYears[availableYears.length - 1]) {
        setBsYear(bsYear + 1);
        setBsMonth(1);
        setSelectedDay(null);
      }
    } else {
      setBsMonth(bsMonth + 1);
      setSelectedDay(null);
    }
  }, [bsMonth, bsYear, availableYears]);

  const handleDayClick = useCallback((day: BsDay) => {
    setSelectedDay(day.bsDay);
    onDateSelect?.(day);
  }, [onDateSelect]);

  const firstDayOfMonth = days.length > 0 ? days[0].dayOfWeek : 0;
  const monthInfo = BS_MONTH_NAMES[bsMonth];
  const emptyCells = firstDayOfMonth;
  const cells: (BsDay | null)[] = [
    ...Array(emptyCells).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={`border border-zinc-700/50 rounded-lg p-4 bg-zinc-900/60 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center">
          <div className="font-semibold text-lg text-white">{monthInfo?.nameNp || ''} {bsYear}</div>
          <div className="text-xs text-zinc-400">{monthInfo?.name || ''} {bsYear}</div>
        </div>

        <button onClick={goToNextMonth} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES_SHORT.map((d, i) => (
            <div key={d} className="text-center text-xs font-medium text-zinc-400 py-1">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{DAY_NAMES_NP[i]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

          const isSelected = selectedDay === day.bsDay;
          const isToday = highlightAd?.bs === day.bs;

          return (
            <button
              key={day.bs}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded text-sm
                transition-colors cursor-pointer
                ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                ${isToday && !isSelected ? 'bg-blue-900/50 text-blue-300 font-medium ring-2 ring-blue-400' : ''}
                ${!isSelected && !isToday ? 'text-zinc-300 hover:bg-zinc-700' : ''}
              `}
              title={`${day.bsDay} ${monthInfo?.nameNp} ${bsYear} (${day.dayName})`}
            >
              <span>{day.bsDay}</span>
              <span className="text-[10px] opacity-70 hidden sm:block">{DAY_NAMES_NP[day.dayOfWeek]}</span>
            </button>
          );
        })}
      </div>

      {selectedDay && highlightAd && (
        <div className="mt-3 pt-3 border-t border-zinc-700 text-center text-sm">
          <span className="font-medium text-white">{highlightAd.bsDay} {monthInfo?.nameNp} {bsYear}</span>
          <span className="text-zinc-500 mx-1">|</span>
          <span className="text-zinc-400">{highlightAd.dayName}</span>
          <span className="text-zinc-500 mx-1">|</span>
          <span className="text-blue-400">{highlightAd.ad}</span>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-3 flex-wrap">
        {visibleYears.map(y => (
          <button
            key={y}
            onClick={() => { setBsYear(y); setBsMonth(1); setSelectedDay(null); }}
            className={`text-xs px-2 py-1 rounded ${
              y === bsYear ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
