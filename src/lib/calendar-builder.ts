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

export interface PreviewDay {
  bsDate: string;
  dayName: string;
  adDate: string;
  adDayName: string;
  bsDay: number;
  bsMonth: number;
  bsMonthName: string;
}

export interface PreviewMonth {
  month: number;
  monthName: string;
  monthNameNp: string;
  totalDays: number;
  days: PreviewDay[];
}

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

export const BS_MONTHS_DATA = BS_MONTHS;

export function getMonthInfo(month: number) {
  return BS_MONTHS.find(m => m.num === month) || { num: month, name: `M${month}`, nameNp: '' };
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDayName(date: Date): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[date.getDay()];
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function validateMonthDays(days: number[]): { valid: boolean; total: number } {
  if (days.length !== 12) return { valid: false, total: 0 };
  const total = days.reduce((a, b) => a + b, 0);
  return { valid: total === 365 || total === 366, total };
}

export function computeDateDiff(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export interface LeapYearResult {
  febYear: number;
  febDays: number;
  isLeap: boolean;
}

export function detectFebruary(start: Date, end: Date): LeapYearResult | null {
  const current = new Date(start);
  let febYear: number | null = null;
  let febDays = 0;
  let prevFebDays = 0;

  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();

    if (month === 1) {
      const day = current.getDate();
      if (day === 1) {
        prevFebDays = 0;
      }
      prevFebDays++;

      if (day === 28 || day === 29) {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (day === 29 || isLeap) {
          febYear = year;
          febDays = day;
        }
      }
    }

    current.setDate(current.getDate() + 1);
    if (month === 1 && current.getMonth() === 2) break;
  }

  if (febYear === null) {
    febYear = start.getFullYear();
    febDays = (febYear % 4 === 0 && febYear % 100 !== 0) || (febYear % 400 === 0) ? 29 : 28;
    return { febYear, febDays, isLeap: febDays === 29 };
  }

  return { febYear, febDays, isLeap: febDays === 29 };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function generatePreview(
  bsYear: number,
  monthDays: number[],
  baisakh1Ad: Date,
  chaitraLastAd: Date
): { months: PreviewMonth[]; totalDays: number } {
  const months: PreviewMonth[] = [];
  const currentAd = new Date(baisakh1Ad);

  for (let m = 0; m < 12; m++) {
    const monthInfo = BS_MONTHS[m];
    const days: PreviewDay[] = [];

    for (let d = 0; d < monthDays[m]; d++) {
      const adDateStr = formatDate(currentAd);
      const dayName = getDayName(currentAd);
      const dayOfWeek = getDayOfWeek(currentAd);

      days.push({
        bsDate: `${bsYear}-${String(monthInfo.num).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`,
        dayName,
        adDate: formatDisplayDate(currentAd),
        adDayName: dayName,
        bsDay: d + 1,
        bsMonth: monthInfo.num,
        bsMonthName: monthInfo.nameNp,
      });

      currentAd.setDate(currentAd.getDate() + 1);
    }

    months.push({
      month: monthInfo.num,
      monthName: monthInfo.name,
      monthNameNp: monthInfo.nameNp,
      totalDays: monthDays[m],
      days,
    });
  }

  const totalDays = computeDateDiff(baisakh1Ad, chaitraLastAd);

  return { months, totalDays };
}

export function generateYearJson(
  bsYear: number,
  monthDays: number[],
  baisakh1Ad: Date
): BsYearData {
  const days: BsDay[] = [];
  const currentAd = new Date(baisakh1Ad);

  for (let m = 0; m < 12; m++) {
    const monthInfo = BS_MONTHS[m];

    for (let d = 0; d < monthDays[m]; d++) {
      const adStr = formatDate(currentAd);
      const bsStr = `${bsYear}-${String(monthInfo.num).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`;
      const dayName = getDayName(currentAd);
      const dayOfWeek = getDayOfWeek(currentAd);

      days.push({
        ad: adStr,
        bs: bsStr,
        bsYear,
        bsMonth: monthInfo.num,
        bsDay: d + 1,
        monthName: monthInfo.name,
        monthNameNp: monthInfo.nameNp,
        dayName,
        dayOfWeek,
      });

      currentAd.setDate(currentAd.getDate() + 1);
    }
  }

  return { year: bsYear, days };
}

export function downloadJson(year: number, data: BsYearData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${year}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const TYPICAL_MONTH_DAYS: number[] = [30, 31, 32, 31, 32, 31, 31, 30, 30, 30, 29, 30];
