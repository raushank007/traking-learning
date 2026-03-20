// src/lib/revision.ts
import fs from 'fs';
import path from 'path';

export interface RevisionCard {
  category: string;
  topic: string;
  link: string;
}

export interface CategoryDeck {
  category: string;
  cards: RevisionCard[];
}

function parseRoadmapFile(fileName: string, categoryName: string): RevisionCard[] {
  // 🌟 Looking inside the 'content' directory based on your project structure
  const filePath = path.join(process.cwd(), 'content', fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`Revision Warning: Could not find file at ${filePath}`);
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const completedTopics: RevisionCard[] = [];

  for (const line of lines) {
    // Look for markdown table rows
    if (line.trim().startsWith('|')) {
      const columns = line.split('|').map(col => col.trim());

      // Ensure it's a valid data row (not a header or separator)
      if (columns.length >= 5 && !columns[1].includes('---')) {
        const topicName = columns[2];
        const status = columns[3];

        // Check if the topic is marked as completed
        if (status.includes('[x]') || status.includes('[X]')) {

          // Extract link (looking for standard markdown link format)
          let link = '#';
          const linkCol = columns.find(col => col.includes(']('));
          if (linkCol) {
            const match = linkCol.match(/\(([^)]+)\)/);
            if (match) link = match[1];
          }

          completedTopics.push({
            category: categoryName,
            topic: topicName,
            link: link
          });
        }
      }
    }
  }

  return completedTopics;
}

// 🌟 Returns ALL completed cards grouped by category, meant to be called at build time
export function getAllCompletedCards(): CategoryDeck[] {
  // These filenames must perfectly match the files in your 'content' folder
  const sources = [
    { file: '2026-03-07-java.md', title: 'Java Mastery' },
    { file: '2026-02-07-springboot.md', title: 'Spring Boot' },
    { file: '2026-02-26-HLD.md', title: 'HLD' },
    { file: '2026-02-26-LLD-topics.md', title: 'LLD' },
    { file: '2026-02-26-All-Patterns-Questions.md', title: 'Algorithms' }
  ];

  return sources.map(source => ({
    category: source.title,
    cards: parseRoadmapFile(source.file, source.title)
  }));
}