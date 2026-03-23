const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BS_MONTHS = {
  1: 'Baisakh', 2: 'Jestha', 3: 'Ashadh', 4: 'Shrawan',
  5: 'Bhadra', 6: 'Ashwin', 7: 'Kartik', 8: 'Mangsir',
  9: 'Poush', 10: 'Magh', 11: 'Falgun', 12: 'Chaitra',
};
const BS_MONTHS_NP = {
  1: 'बैशाख', 2: 'जेठ', 3: 'असार', 4: 'श्रावण',
  5: 'भदौ', 6: 'अश्विन', 7: 'कार्तिक', 8: 'मंसिर',
  9: 'पौष', 10: 'माघ', 11: 'फाल्गुन', 12: 'चैत्र',
};
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const START_DATE = new Date('2026-04-14');
const END_DATE = new Date('2036-04-13');
const OUTPUT_DIR = path.join(__dirname, 'bs-calendar-data');

function formatAd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseBsDate(bs) {
  const m = bs.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', reject);
  });
}

async function main() {
  const totalDays = Math.round((END_DATE - START_DATE) / 86400000) + 1;
  console.log(`Total days: ${totalDays}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const yearMap = {};
  let done = 0;
  const CONCURRENCY = 20;
  const queue = [];

  const startTime = Date.now();

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + i);
    const adDate = formatAd(d);
    const url = `https://raw.githubusercontent.com/AnmupOnline/nepalicalendar/main/convertToBS/${adDate}`;

    queue.push((async () => {
      try {
        const bs = await fetch(url);
        const parsed = parseBsDate(bs);
        if (parsed) {
          const day = {
            ad: adDate,
            bs,
            bsYear: parsed.year,
            bsMonth: parsed.month,
            bsDay: parsed.day,
            monthName: BS_MONTHS[parsed.month] || `M${parsed.month}`,
            monthNameNp: BS_MONTHS_NP[parsed.month] || '',
            dayName: DAY_NAMES[d.getDay()],
            dayOfWeek: d.getDay(),
          };
          if (!yearMap[parsed.year]) yearMap[parsed.year] = [];
          yearMap[parsed.year].push(day);
        }
      } catch (e) { /* skip */ }

      done++;
      if (done % 500 === 0 || done === totalDays) {
        const pct = ((done / totalDays) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`Progress: ${done}/${totalDays} (${pct}%) - ${elapsed}s elapsed`);
      }
    })());

    if (queue.length >= CONCURRENCY) {
      await Promise.all(queue.splice(0, CONCURRENCY));
    }
  }

  if (queue.length > 0) await Promise.all(queue);

  const years = Object.keys(yearMap).map(Number).sort();
  console.log(`\nWriting ${years.length} year files...`);

  for (const year of years) {
    const days = yearMap[year].sort((a, b) => a.ad.localeCompare(b.ad));
    const filePath = path.join(OUTPUT_DIR, `${year}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ year, days }, null, 2));
    console.log(`  Wrote ${year}.json (${days.length} days)`);
  }

  console.log(`\nDone! Files in: ${OUTPUT_DIR}`);
  console.log(`Total time: ${((Date.now() - startTime) / 1000).toFixed(0)}s`);
}

main().catch(console.error);
