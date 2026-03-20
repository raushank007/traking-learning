// src/lib/revision.ts
import fs from 'fs';
import path from 'path';

export interface RevisionCard {
  category: string;
  topic: string;
  link: string;
  difficulty?: string;
}

export interface CategoryDeck {
  category: string;
  cards: RevisionCard[];
}

// 🌟 UPGRADED: Added requireCompleted parameter (defaults to true)
function parseRoadmapFile(fileName: string, categoryName: string, requireCompleted: boolean = true): RevisionCard[] {
  const filePath = path.join(process.cwd(), 'content', fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`Revision Warning: Could not find file at ${filePath}`);
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const topics: RevisionCard[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      const columns = line.split('|').map(col => col.trim());

      if (columns.length >= 5 && !columns[1].includes('---')) {

        // 🌟 FIXED: The text before the first pipe is empty, so columns[1] holds the difficulty
        const diffStr = columns[1].replace(/\*/g, '');
        const difficulty = ['E', 'M', 'H'].includes(diffStr) ? diffStr : undefined;

        const topicName = columns[2];
        const status = columns[3];

        const isMarkedDone = status.includes('[x]') || status.includes('[X]');

        // Push the card IF it doesn't require completion, OR if it's marked done
        if (!requireCompleted || isMarkedDone) {
          let link = '#';
          // Find the column containing the markdown link syntax [text](url)
          const linkCol = columns.find(col => col.includes(']('));
          if (linkCol) {
            const match = linkCol.match(/\(([^)]+)\)/);
            if (match) link = match[1];
          }

          topics.push({
            category: categoryName,
            topic: topicName,
            link: link,
            difficulty: difficulty
          });
        }
      }
    }
  }

  return topics;
}

export function getAllCompletedCards(): CategoryDeck[] {
  // 🌟 CONFIGURATION: Notice 'requireCompleted' is false ONLY for Algorithms
  const sources = [
    { file: '2026-03-07-java.md', title: 'Java Mastery', requireCompleted: true },
    { file: '2026-02-07-springboot.md', title: 'Spring Boot', requireCompleted: true },
    { file: '2026-02-26-HLD.md', title: 'HLD', requireCompleted: true },
    { file: '2026-02-26-LLD-topics.md', title: 'LLD', requireCompleted: true },
    { file: '2026-02-26-All-Patterns-Questions.md', title: 'Algorithms', requireCompleted: false }
  ];

  return sources.map(source => ({
    category: source.title,
    cards: parseRoadmapFile(source.file, source.title, source.requireCompleted)
  }));
}