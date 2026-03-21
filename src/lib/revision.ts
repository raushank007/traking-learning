// src/lib/revision.ts
import fs from 'fs';
import path from 'path';

export interface RevisionCard {
  category: string;
  topic: string;
  link: string;
  difficulty?: string;
  fileName: string; // 🌟 NEW: So the API knows which file to open
  isCoding: boolean; // 🌟 NEW: To apply the [x] vs +1 rule
}

export interface CategoryDeck {
  category: string;
  cards: RevisionCard[];
}

function parseRoadmapFile(fileName: string, categoryName: string, requireCompleted: boolean = true): RevisionCard[] {
  const filePath = path.join(process.cwd(), 'content', fileName);

  if (!fs.existsSync(filePath)) return [];

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const topics: RevisionCard[] = [];

  // If requireCompleted is false, it's our Algorithms category
  const isCoding = !requireCompleted;

  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      const columns = line.split('|').map(col => col.trim());

      if (columns.length >= 5 && !columns[1].includes('---')) {
        const diffStr = columns[1].replace(/\*/g, '');
        const difficulty = ['E', 'M', 'H'].includes(diffStr) ? diffStr : undefined;

        const topicName = columns[2];
        const status = columns[3];

        const isMarkedDone = status.includes('[x]') || status.includes('[X]');

        if (!requireCompleted || isMarkedDone) {
          let link = '#';
          const linkCol = columns.find(col => col.includes(']('));
          if (linkCol) {
            const match = linkCol.match(/\(([^)]+)\)/);
            if (match) link = match[1];
          }

          topics.push({
            category: categoryName,
            topic: topicName,
            link: link,
            difficulty: difficulty,
            fileName: fileName, // 🌟 Pass the filename down
            isCoding: isCoding  // 🌟 Pass the category type down
          });
        }
      }
    }
  }
  return topics;
}

export function getAllCompletedCards(): CategoryDeck[] {
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