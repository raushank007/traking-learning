// src/components/RoadmapProgress.tsx
import React from 'react';

interface RoadmapProgressProps {
  content: string;
  isRoadmap?: boolean;
}

export default function RoadmapProgress({ content, isRoadmap }: RoadmapProgressProps) {
  // If this post isn't a roadmap, don't show the progress bar
  if (!isRoadmap) return null;

  let total = 0;
  let completed = 0;

  // 1. Parse the Markdown tables safely
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('|') && !line.includes('---')) {
      const cols = line.split('|').map(c => c.trim());

      // Check if it's a valid data row and has the Status column (Index 3)
      if (cols.length >= 4) {
        const statusCol = cols[3];

        if (statusCol.includes('[x]') || statusCol.includes('[X]')) {
          completed++;
          total++;
        } else if (statusCol.includes('[ ]')) {
          total++;
        }
      }
    }
  }

  // If no roadmap items were found, don't render the bar
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-amber-50/90 border-2 border-amber-400 p-6 rounded-2xl shadow-sm mb-10 mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            Island Completion Status
          </h3>
          <p className="text-sm font-bold text-amber-800/80 mt-1 uppercase tracking-widest">
            {completed} of {total} Topics Conquered
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-1">
            {total - completed} Remaining
          </span>
          <span className="text-4xl md:text-5xl font-pirate text-red-600 drop-shadow-sm">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Thematic Progress Bar */}
      <div className="w-full h-4 bg-amber-200/50 rounded-full overflow-hidden border border-amber-300/80 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Small shine effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
        </div>
      </div>
    </div>
  );
}