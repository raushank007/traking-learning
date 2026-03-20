// src/components/Flashcard.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { RevisionCard } from '../lib/revision';

export default function Flashcard({ card }: { card: RevisionCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isPlaceholder = card.link === '#';

  // 🌟 NEW: Difficulty Colors
  const diffColors: Record<string, string> = {
    'E': 'bg-green-100 text-green-700 border-green-200',
    'M': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'H': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div
      className="group h-64 [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

        {/* FRONT: The Topic to Revise */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 hover:border-amber-400 transition-colors rounded-2xl backface-hidden text-center">

          {/* 🌟 NEW: Difficulty Badge */}
          {card.difficulty && (
            <span className={`absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded border shadow-sm ${diffColors[card.difficulty]}`}>
              {card.difficulty === 'E' ? 'EASY' : card.difficulty === 'M' ? 'MED' : 'HARD'}
            </span>
          )}

          <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">
            {card.category}
          </span>

          <h3 className="text-lg font-bold text-slate-800 leading-snug mb-4">
            {card.topic}
          </h3>

          {!isPlaceholder && (
            <p className="text-[10px] font-bold text-slate-50 mt-auto bg-slate-800 px-3 py-1.5 rounded uppercase tracking-wider">
              Tap to Flip
            </p>
          )}
        </div>

        {/* BACK: Action / Link */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-amber-400 shadow-lg flex flex-col items-center justify-center text-center">

          <span className="text-4xl mb-4">🧠</span>

          <h4 className="text-sm font-bold text-slate-700 mb-6">
            {isPlaceholder
              ? "Mark topics as [x] in your roadmap to see them here!"
              : "Did you recall the details correctly?"}
          </h4>

          {!isPlaceholder && (
            <Link
              href={card.link}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 py-2.5 px-4 rounded-md transition-colors shadow-sm"
              onClick={(e) => e.stopPropagation()}
              target={card.link.startsWith('http') ? '_blank' : '_self'}
            >
              {card.link.startsWith('http') ? 'Solve on LeetCode ↗' : 'Review Logbook →'}
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}