import * as raw2000 from '@/data/bs-calendar/2000.json';
import * as raw2001 from '@/data/bs-calendar/2001.json';
import * as raw2002 from '@/data/bs-calendar/2002.json';
import * as raw2003 from '@/data/bs-calendar/2003.json';
import * as raw2004 from '@/data/bs-calendar/2004.json';
import * as raw2005 from '@/data/bs-calendar/2005.json';
import * as raw2006 from '@/data/bs-calendar/2006.json';
import * as raw2007 from '@/data/bs-calendar/2007.json';
import * as raw2008 from '@/data/bs-calendar/2008.json';
import * as raw2009 from '@/data/bs-calendar/2009.json';
import * as raw2010 from '@/data/bs-calendar/2010.json';
import * as raw2011 from '@/data/bs-calendar/2011.json';
import * as raw2012 from '@/data/bs-calendar/2012.json';
import * as raw2013 from '@/data/bs-calendar/2013.json';
import * as raw2014 from '@/data/bs-calendar/2014.json';
import * as raw2015 from '@/data/bs-calendar/2015.json';
import * as raw2016 from '@/data/bs-calendar/2016.json';
import * as raw2017 from '@/data/bs-calendar/2017.json';
import * as raw2018 from '@/data/bs-calendar/2018.json';
import * as raw2019 from '@/data/bs-calendar/2019.json';
import * as raw2020 from '@/data/bs-calendar/2020.json';
import * as raw2021 from '@/data/bs-calendar/2021.json';
import * as raw2022 from '@/data/bs-calendar/2022.json';
import * as raw2023 from '@/data/bs-calendar/2023.json';
import * as raw2024 from '@/data/bs-calendar/2024.json';
import * as raw2025 from '@/data/bs-calendar/2025.json';
import * as raw2026 from '@/data/bs-calendar/2026.json';
import * as raw2027 from '@/data/bs-calendar/2027.json';
import * as raw2028 from '@/data/bs-calendar/2028.json';
import * as raw2029 from '@/data/bs-calendar/2029.json';
import * as raw2030 from '@/data/bs-calendar/2030.json';
import * as raw2031 from '@/data/bs-calendar/2031.json';
import * as raw2032 from '@/data/bs-calendar/2032.json';
import * as raw2033 from '@/data/bs-calendar/2033.json';
import * as raw2034 from '@/data/bs-calendar/2034.json';
import * as raw2035 from '@/data/bs-calendar/2035.json';
import * as raw2036 from '@/data/bs-calendar/2036.json';
import * as raw2037 from '@/data/bs-calendar/2037.json';
import * as raw2038 from '@/data/bs-calendar/2038.json';
import * as raw2039 from '@/data/bs-calendar/2039.json';
import * as raw2040 from '@/data/bs-calendar/2040.json';
import * as raw2041 from '@/data/bs-calendar/2041.json';
import * as raw2042 from '@/data/bs-calendar/2042.json';
import * as raw2043 from '@/data/bs-calendar/2043.json';
import * as raw2044 from '@/data/bs-calendar/2044.json';
import * as raw2045 from '@/data/bs-calendar/2045.json';
import * as raw2046 from '@/data/bs-calendar/2046.json';
import * as raw2047 from '@/data/bs-calendar/2047.json';
import * as raw2048 from '@/data/bs-calendar/2048.json';
import * as raw2049 from '@/data/bs-calendar/2049.json';
import * as raw2050 from '@/data/bs-calendar/2050.json';
import * as raw2051 from '@/data/bs-calendar/2051.json';
import * as raw2052 from '@/data/bs-calendar/2052.json';
import * as raw2053 from '@/data/bs-calendar/2053.json';
import * as raw2054 from '@/data/bs-calendar/2054.json';
import * as raw2055 from '@/data/bs-calendar/2055.json';
import * as raw2056 from '@/data/bs-calendar/2056.json';
import * as raw2057 from '@/data/bs-calendar/2057.json';
import * as raw2058 from '@/data/bs-calendar/2058.json';
import * as raw2059 from '@/data/bs-calendar/2059.json';
import * as raw2060 from '@/data/bs-calendar/2060.json';
import * as raw2061 from '@/data/bs-calendar/2061.json';
import * as raw2062 from '@/data/bs-calendar/2062.json';
import * as raw2063 from '@/data/bs-calendar/2063.json';
import * as raw2064 from '@/data/bs-calendar/2064.json';
import * as raw2065 from '@/data/bs-calendar/2065.json';
import * as raw2066 from '@/data/bs-calendar/2066.json';
import * as raw2067 from '@/data/bs-calendar/2067.json';
import * as raw2068 from '@/data/bs-calendar/2068.json';
import * as raw2069 from '@/data/bs-calendar/2069.json';
import * as raw2070 from '@/data/bs-calendar/2070.json';
import * as raw2071 from '@/data/bs-calendar/2071.json';
import * as raw2072 from '@/data/bs-calendar/2072.json';
import * as raw2073 from '@/data/bs-calendar/2073.json';
import * as raw2074 from '@/data/bs-calendar/2074.json';
import * as raw2075 from '@/data/bs-calendar/2075.json';
import * as raw2076 from '@/data/bs-calendar/2076.json';
import * as raw2077 from '@/data/bs-calendar/2077.json';
import * as raw2078 from '@/data/bs-calendar/2078.json';
import * as raw2079 from '@/data/bs-calendar/2079.json';
import * as raw2080 from '@/data/bs-calendar/2080.json';
import * as raw2081 from '@/data/bs-calendar/2081.json';
import * as raw2082 from '@/data/bs-calendar/2082.json';
import * as raw2083 from '@/data/bs-calendar/2083.json';

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

const allRaw = {
  2000: raw2000, 2001: raw2001, 2002: raw2002, 2003: raw2003, 2004: raw2004,
  2005: raw2005, 2006: raw2006, 2007: raw2007, 2008: raw2008, 2009: raw2009,
  2010: raw2010, 2011: raw2011, 2012: raw2012, 2013: raw2013, 2014: raw2014,
  2015: raw2015, 2016: raw2016, 2017: raw2017, 2018: raw2018, 2019: raw2019,
  2020: raw2020, 2021: raw2021, 2022: raw2022, 2023: raw2023, 2024: raw2024,
  2025: raw2025, 2026: raw2026, 2027: raw2027, 2028: raw2028, 2029: raw2029,
  2030: raw2030, 2031: raw2031, 2032: raw2032, 2033: raw2033, 2034: raw2034,
  2035: raw2035, 2036: raw2036, 2037: raw2037, 2038: raw2038, 2039: raw2039,
  2040: raw2040, 2041: raw2041, 2042: raw2042, 2043: raw2043, 2044: raw2044,
  2045: raw2045, 2046: raw2046, 2047: raw2047, 2048: raw2048, 2049: raw2049,
  2050: raw2050, 2051: raw2051, 2052: raw2052, 2053: raw2053, 2054: raw2054,
  2055: raw2055, 2056: raw2056, 2057: raw2057, 2058: raw2058, 2059: raw2059,
  2060: raw2060, 2061: raw2061, 2062: raw2062, 2063: raw2063, 2064: raw2064,
  2065: raw2065, 2066: raw2066, 2067: raw2067, 2068: raw2068, 2069: raw2069,
  2070: raw2070, 2071: raw2071, 2072: raw2072, 2073: raw2073, 2074: raw2074,
  2075: raw2075, 2076: raw2076, 2077: raw2077, 2078: raw2078, 2079: raw2079,
  2080: raw2080, 2081: raw2081, 2082: raw2082, 2083: raw2083,
};

const yearRegistry: Record<number, BsYearData> = {};
for (const [key, mod] of Object.entries(allRaw)) {
  const year = parseInt(key);
  const data = (mod as unknown as { default: BsYearData }).default;
  if (data && data.days && data.days.length > 0) {
    yearRegistry[year] = data;
  }
}

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
