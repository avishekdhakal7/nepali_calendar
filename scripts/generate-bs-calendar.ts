import * as fs from 'fs';
import * as path from 'path';

const BS_MONTHS: Record<number, string> = {
  1: 'Baisakh',
  2: 'Jestha',
  3: 'Ashadh',
  4: 'Shrawan',
  5: 'Bhadra',
  6: 'Ashwin',
  7: 'Kartik',
  8: 'Mangsir',
  9: 'Poush',
  10: 'Magh',
  11: 'Falgun',
  12: 'Chaitra',
};

const BS_MONTHS_NP: Record<number, string> = {
  1: 'बैशाख',
  2: 'जेठ',
  3: 'असार',
  4: 'श्रावण',
  5: 'भदौ',
  6: 'अश्विन',
  7: 'कार्तिक',
  8: 'मंसिर',
  9: 'पौष',
  10: 'माघ',
  11: 'फाल्गुन',
  12: 'चैत्र',
};

const START_DATE = new Date('2026-04-14');
const END_DATE = new Date('2035-04-13');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'bs-calendar');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BsaDay {
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

interface YearData {
  year: number;
  days: BsaDay[];
}

const yearMap: Map<number, BsaDay[]> = new Map();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBsDate(adDate: Date): Promise<string | null> {
  const dateStr = `${adDate.getFullYear()}-${String(adDate.getMonth() + 1).padStart(2, '0')}-${String(adDate.getDate()).padStart(2, '0')}`;
  try {
    const res = await fetch(`https://raw.githubusercontent.com/AnmupOnline/nepalicalendar/main/convertToBS/${dateStr}`);
    if (!res.ok) return null;
    return (await res.text()).trim();
  } catch {
    return null;
  }
}

function formatAd(adDate: Date): string {
  return `${adDate.getFullYear()}-${String(adDate.getMonth() + 1).padStart(2, '0')}-${String(adDate.getDate()).padStart(2, '0')}`;
}

function parseBsDate(bsDateStr: string): { year: number; month: number; day: number } | null {
  const match = bsDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]),
    day: parseInt(match[3]),
  };
}

async function generate() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const totalDays = Math.round((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Scanning ${totalDays} days from ${formatAd(START_DATE)} to ${formatAd(END_DATE)}...`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const currentDate = new Date(START_DATE);
  let processed = 0;
  let failed = 0;
  const startTime = Date.now();

  while (currentDate <= END_DATE) {
    const adDateStr = formatAd(currentDate);
    const bsDateStr = await fetchBsDate(currentDate);

    if (bsDateStr) {
      const parsed = parseBsDate(bsDateStr);
      if (parsed) {
        const dayOfWeek = currentDate.getDay();
        const day: BsaDay = {
          ad: adDateStr,
          bs: bsDateStr,
          bsYear: parsed.year,
          bsMonth: parsed.month,
          bsDay: parsed.day,
          monthName: BS_MONTHS[parsed.month] || `Month${parsed.month}`,
          monthNameNp: BS_MONTHS_NP[parsed.month] || '',
          dayName: DAY_NAMES[dayOfWeek],
          dayOfWeek,
        };

        if (!yearMap.has(parsed.year)) {
          yearMap.set(parsed.year, []);
        }
        yearMap.get(parsed.year)!.push(day);
      }
    } else {
      failed++;
    }

    processed++;

    if (processed % 100 === 0) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = processed / ((Date.now() - startTime) / 1000);
      const remaining = ((totalDays - processed) / rate / 60).toFixed(1);
      console.log(`[${elapsedSec}s] Progress: ${processed}/${totalDays} (${((processed / totalDays) * 100).toFixed(1)}%) | Rate: ${rate.toFixed(1)} req/s | ETA: ${remaining} min | Failed: ${failed}`);
    }

    currentDate.setDate(currentDate.getDate() + 1);

    if (processed % 10 === 0) {
      await sleep(950);
    }
  }

  console.log(`\nDone! Processed: ${processed}, Failed: ${failed}`);
  console.log(`Writing JSON files...\n`);

  const years = Array.from(yearMap.keys()).sort();
  for (const year of years) {
    const days = yearMap.get(year)!;
    const yearFile: YearData = { year, days };
    const filePath = path.join(OUTPUT_DIR, `${year}.json`);
    fs.writeFileSync(filePath, JSON.stringify(yearFile, null, 2));
    console.log(`  Wrote ${filePath} (${days.length} days)`);
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nAll files written to ${OUTPUT_DIR}`);
  console.log(`Total time: ${totalElapsed} seconds`);
}

generate().catch(console.error);
