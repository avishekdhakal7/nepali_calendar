'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAvailableBsYears, getBsYearDays, BsDay, BsYearData } from '@/lib/bsCalendar';

interface BsCalendarGridProps {
  selectedAdDate?: string;
  onDateSelect?: (bs: BsDay) => void;
  className?: string;
}

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BS_MONTHS = [
  { num: 1, name: 'Baisakh', nameNp: 'बैशाख' },
  { num: 2, name: 'Jestha', nameNp: 'जेठ' },
  { num: 3, name: 'Ashadh', nameNp: 'असार' },
  { num: 4, name: 'Shrawan', nameNp: 'श्रावण' },
  { num: 5, name: 'Bhadra', nameNp: 'भदौ' },
  { num: 6, name: 'Ashwin', nameNp: 'अश्विन' },
  { num: 7, name: 'Kartik', nameNp: 'कार्तिक' },
  { num: 8, name: 'Mangsir', nameNp: 'मंसिर' },
  { num: 9, name: 'Poush', nameNp: 'पौष' },
  { num: 10, name: 'Magh', nameNp: 'माघ' },
  { num: 11, name: 'Falgun', nameNp: 'फाल्गुन' },
  { num: 12, name: 'Chaitra', nameNp: 'चैत्र' },
];

function getLocalStorageYears(): Record<number, BsYearData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bs-calendar-data');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function getMonthEnglishYear(days: BsDay[], month: number): { primary: number; secondary?: number } | null {
  const monthDays = days.filter(d => d.bsMonth === month);
  if (!monthDays.length) return null;
  const adYears = [...new Set(monthDays.map(d => parseInt(d.ad.split('-')[0])))];
  if (adYears.length === 1) return { primary: adYears[0] };
  return { primary: adYears[0], secondary: adYears[1] };
}

function formatAdDate(ad: string): string {
  const d = new Date(ad);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const todayAd = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const todayBs = (() => {
    for (const y of availableYears) {
      const found = yearData[y]?.days.find(d => d.ad === todayAd);
      if (found) return found;
    }
    return null;
  })();

  const [bsYear, setBsYear] = useState(() => todayBs?.bsYear || availableYears.find(y => y >= 2083) || 2083);
  const [bsMonth, setBsMonth] = useState(() => todayBs?.bsMonth || 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const isOnToday = todayBs ? (bsYear === todayBs.bsYear && bsMonth === todayBs.bsMonth) : false;

  const goToToday = () => {
    if (todayBs) {
      setBsYear(todayBs.bsYear);
      setBsMonth(todayBs.bsMonth);
      setSelectedDay(null);
    }
  };

  const yearDays = yearData[bsYear]?.days || [];
  const monthEnglishYear = getMonthEnglishYear(yearDays, bsMonth);

  const monthDays = yearDays.filter(d => d.bsMonth === bsMonth);
  const firstDayOfMonth = monthDays.length > 0 ? monthDays[0].dayOfWeek : 0;

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
      if (highlightAd.bsYear !== bsYear) setBsYear(highlightAd.bsYear);
      setTimeout(() => setBsMonth(highlightAd.bsMonth), 0);
      setTimeout(() => setSelectedDay(highlightAd.bsDay), 10);
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

  const emptyCells = firstDayOfMonth;
  const cells: (BsDay | null)[] = [
    ...Array(emptyCells).fill(null),
    ...monthDays,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const currentMonthInfo = BS_MONTHS.find(m => m.num === bsMonth);

  return (
    <div className={`border border-zinc-700/50 rounded-lg p-4 bg-zinc-900/60 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={goToPrevMonth} className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <select
              value={bsYear}
              onChange={e => { setBsYear(parseInt(e.target.value)); setBsMonth(1); setSelectedDay(null); }}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white font-semibold focus:outline-none focus:border-blue-500"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bsMonth}
              onChange={e => { setBsMonth(parseInt(e.target.value)); setSelectedDay(null); }}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white font-semibold focus:outline-none focus:border-blue-500"
            >
              {BS_MONTHS.map(m => (
                <option key={m.num} value={m.num}>{m.nameNp} ({m.name})</option>
              ))}
            </select>
            <span className="text-zinc-400 text-sm font-medium">
              {monthEnglishYear?.secondary
                ? `${monthEnglishYear.primary}/${monthEnglishYear.secondary}`
                : `${monthEnglishYear?.primary || ''}`}
            </span>
          </div>
        </div>

        <button onClick={goToNextMonth} className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white ml-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES_SHORT.map((d, i) => (
          <div key={d} className="text-center text-xs font-medium text-zinc-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

          const isSelected = selectedDay === day.bsDay;
          const isToday = day.ad === todayAd;
          const adDisplay = formatAdDate(day.ad);

          return (
            <button
              key={day.bs}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded text-xs
                transition-colors cursor-pointer relative
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
                ${!isSelected && !isToday ? 'text-zinc-300 hover:bg-zinc-700' : ''}
              `}
            >
              {isToday && !isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
              <span className={`font-bold text-sm ${isToday && !isSelected ? 'text-blue-300' : ''}`}>{day.bsDay}</span>
              <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-zinc-500'}`}>{adDisplay}</span>
            </button>
          );
        })}
      </div>

      {selectedDay && highlightAd && (
        <div className="mt-3 pt-3 border-t border-zinc-700 text-center">
          <span className="font-bold text-white">{highlightAd.bsDay} {currentMonthInfo?.nameNp} {bsYear}</span>
          <span className="text-zinc-500 mx-1">—</span>
          <span className="text-blue-400">{highlightAd.ad}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
        <button
          onClick={goToToday}
          disabled={isOnToday}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isOnToday
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          आज
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
