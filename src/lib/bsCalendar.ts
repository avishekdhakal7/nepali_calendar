import * as raw2083 from '@/data/bs-calendar/2083.json';
import * as raw2084 from '@/data/bs-calendar/2084.json';
import * as raw2085 from '@/data/bs-calendar/2085.json';
import * as raw2086 from '@/data/bs-calendar/2086.json';
import * as raw2087 from '@/data/bs-calendar/2087.json';
import * as raw2088 from '@/data/bs-calendar/2088.json';
import * as raw2089 from '@/data/bs-calendar/2089.json';
import * as raw2090 from '@/data/bs-calendar/2090.json';
import * as raw2091 from '@/data/bs-calendar/2091.json';
import * as raw2092 from '@/data/bs-calendar/2092.json';

export interface BsDay {
  ad: string;
  bs: string;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  monthName: string;
  monthNameNp: string;
  dayName: string;
  dayOfWeek: number;
}

export interface BsYearData {
  year: number;
  days: BsDay[];
}

const yearRegistry: Record<number, BsYearData> = {
  2083: raw2083 as BsYearData,
  2084: raw2084 as BsYearData,
  2085: raw2085 as BsYearData,
  2086: raw2086 as BsYearData,
  2087: raw2087 as BsYearData,
  2088: raw2088 as BsYearData,
  2089: raw2089 as BsYearData,
  2090: raw2090 as BsYearData,
  2091: raw2091 as BsYearData,
  2092: raw2092 as BsYearData,
};

const BS_MONTHS: Record<number, { name: string; nameNp: string }> = {
  1: { name: 'Baisakh', nameNp: 'बैशाख' },
  2: { name: 'Jestha', nameNp: 'जेठ' },
  3: { name: 'Ashadh', nameNp: 'असार' },
  4: { name: 'Shrawan', nameNp: 'श्रावण' },
  5: { name: 'Bhadra', nameNp: 'भदौ' },
  6: { name: 'Ashwin', nameNp: 'अश्विन' },
  7: { name: 'Kartik', nameNp: 'कार्तिक' },
  8: { name: 'Mangsir', nameNp: 'मंसिर' },
  9: { name: 'Poush', nameNp: 'पौष' },
  10: { name: 'Magh', nameNp: 'माघ' },
  11: { name: 'Falgun', nameNp: 'फाल्गुन' },
  12: { name: 'Chaitra', nameNp: 'चैत्र' },
};

export const BS_MONTH_NAMES = BS_MONTHS;

export function getBsYear(year: number): BsYearData | null {
  return yearRegistry[year] || null;
}

export function getBsYearDays(year: number): BsDay[] {
  const data = getBsYear(year);
  return data ? data.days : [];
}

export function getBsMonthDays(year: number, month: number): BsDay[] {
  const days = getBsYearDays(year);
  return days.filter(d => d.bsMonth === month);
}

export function getBsYearMonths(year: number): Array<{ month: number; name: string; nameNp: string; dayCount: number }> {
  const days = getBsYearDays(year);
  const monthMap: Record<number, BsDay[]> = {};
  for (const day of days) {
    if (!monthMap[day.bsMonth]) monthMap[day.bsMonth] = [];
    monthMap[day.bsMonth].push(day);
  }
  return Object.entries(monthMap)
    .map(([m, d]) => ({
      month: parseInt(m),
      name: BS_MONTHS[parseInt(m)]?.name || `Month${m}`,
      nameNp: BS_MONTHS[parseInt(m)]?.nameNp || '',
      dayCount: d.length,
    }))
    .sort((a, b) => a.month - b.month);
}

export function findBsByAd(adDate: string): BsDay | null {
  const [year, ...rest] = Object.keys(yearRegistry).map(Number).sort();
  for (const bsYear of Object.keys(yearRegistry).map(Number).sort()) {
    const data = yearRegistry[bsYear];
    if (data && data.days.length > 0) {
      const found = data.days.find(d => d.ad === adDate);
      if (found) return found;
    }
  }
  return null;
}

export function findAdByBs(bsYear: number, bsMonth: number, bsDay: number): BsDay | null {
  const days = getBsYearDays(bsYear);
  return days.find(d => d.bsMonth === bsMonth && d.bsDay === bsDay) || null;
}

export function formatBsDisplay(bs: BsDay): string {
  return `${bs.bsDay} ${bs.monthNameNp} ${bs.bsYear}`;
}

export function getAvailableBsYears(): number[] {
  return Object.keys(yearRegistry).map(Number).sort();
}

export const GIST_URL = 'YOUR_GIST_RAW_URL_HERE';
