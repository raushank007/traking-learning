// src/app/api/update-card/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  // 🌟 ENVIRONMENT CHECK: If not local dev, return success immediately without touching files
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: true, message: "Skipped in Production environment." });
  }

  try {
    const { fileName, topic, isCoding } = await request.json();
    const filePath = path.join(process.cwd(), 'content', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    let updated = false;

    const newLines = lines.map(line => {
      // Only process table rows
      if (line.trim().startsWith('|')) {
        const columns = line.split('|');

        // Find the exact topic in column index 2
        if (columns.length >= 5 && columns[2].trim() === topic.trim()) {

          if (isCoding) {
            // RULE 1: For Coding, update Status column (Index 3) to [X]
            columns[3] = '  [X]   ';
          } else {
            // RULE 2: For Theory, increment Revisions column (Index 4)
            const currentRevs = parseInt(columns[4].trim(), 10) || 0;
            columns[4] = ` ${currentRevs + 1} `;
          }

          updated = true;
          return columns.join('|'); // Reconstruct the markdown line
        }
      }
      return line;
    });

    // Write back to the markdown file
    if (updated) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
      console.log(`✅ Updated ${topic} in ${fileName}`);
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}