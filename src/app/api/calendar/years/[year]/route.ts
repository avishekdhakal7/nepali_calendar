import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params;
    const filePath = path.join(process.cwd(), 'src', 'data', 'bs-calendar', `${year}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Year not found' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading calendar year:', error);
    return NextResponse.json({ error: 'Failed to read calendar data' }, { status: 500 });
  }
}
