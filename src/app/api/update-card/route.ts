// src/app/api/update-card/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: true, message: "Skipped in Production." });
  }

  try {
    const { fileName, topic, isCoding } = await request.json();

    // 1. Update the Main Roadmap File
    const filePath = path.join(process.cwd(), 'content', fileName);
    if (!fs.existsSync(filePath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    let updated = false;

    const newLines = lines.map(line => {
      if (line.trim().startsWith('|')) {
        const columns = line.split('|');
        if (columns.length >= 5 && columns[2].trim() === topic.trim()) {
          if (isCoding) columns[3] = '  [X]   ';
          else {
            const currentRevs = parseInt(columns[4].trim(), 10) || 0;
            columns[4] = ` ${currentRevs + 1} `;
          }
          updated = true;
          return columns.join('|');
        }
      }
      return line;
    });

    if (updated) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    }

    // 🌟 2. NEW: Append to the Central Ledger (revision-log.md)
    const logPath = path.join(process.cwd(), 'content', 'revision-log.md');
    const todayStr = new Date().toLocaleDateString('en-CA');
    const logEntry = `- [${todayStr}] ${topic}\n`;

    if (!fs.existsSync(logPath)) {
      // Create it with a nice frontmatter header if it doesn't exist yet
      const header = `---\ntitle: "Daily Revision Ledger"\nsummary: "Automated tracking of spaced repetition sessions."\n---\n\n`;
      fs.writeFileSync(logPath, header + logEntry, 'utf-8');
    } else {
      // Append to the end of the file
      fs.appendFileSync(logPath, logEntry, 'utf-8');
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}