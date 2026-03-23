'use server';

import * as fs from 'fs';
import * as path from 'path';

export interface SaveCalendarResult {
  success: boolean;
  message: string;
}

export async function saveCalendarYear(
  year: number,
  data: { year: number; days: unknown[] }
): Promise<SaveCalendarResult> {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'bs-calendar');
    const filePath = path.join(dataDir, `${year}.json`);

    if (!fs.existsSync(dataDir)) {
      return { success: false, message: 'Data directory not found' };
    }

    const exists = fs.existsSync(filePath);

    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json);

    return {
      success: true,
      message: exists
        ? `Updated ${year}.json successfully! Commit and push to GitHub to see changes.`
        : `Saved ${year}.json successfully! Commit and push to GitHub to see changes.`,
    };
  } catch (error) {
    console.error('Error saving calendar year:', error);
    return { success: false, message: 'Failed to save calendar year' };
  }
}

export async function checkCalendarYearExists(year: number): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'bs-calendar', `${year}.json`);
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}
