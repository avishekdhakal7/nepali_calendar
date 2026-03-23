import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data', 'bs-calendar');
    
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ years: [], error: 'Data directory not found' });
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    const years = files
      .map(f => parseInt(f.replace('.json', '')))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);

    return NextResponse.json({ years });
  } catch (error) {
    console.error('Error reading calendar years:', error);
    return NextResponse.json({ years: [], error: 'Failed to read calendar data' });
  }
}
