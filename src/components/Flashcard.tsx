// src/components/Flashcard.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RevisionCard } from '../lib/revision';

// 🌟 ACCEPT THE NEW PROP: isAlreadyRevised
export default function Flashcard({ card, isAlreadyRevised = false }: { card: RevisionCard, isAlreadyRevised?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state directly from the server prop
  const [isLogged, setIsLogged] = useState(isAlreadyRevised);

  const isPlaceholder = card.link === '#';

  const diffColors: Record<string, string> = {
    'E': 'bg-green-100 text-green-700 border-green-200',
    'M': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'H': 'bg-red-100 text-red-700 border-red-200'
  };

  // 🌟 Sync state if the server prop changes
  useEffect(() => {
    setIsLogged(isAlreadyRevised);
  }, [isAlreadyRevised]);

  const handleUpdateProgress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving || isLogged) return;

    // Vercel / Production Bypass
    // This ensures your UI feels fast on mobile without trying to write to Vercel's read-only disk
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      setIsLogged(true);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/update-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: card.fileName,
          topic: card.topic,
          isCoding: card.isCoding
        }),
      });

      if (response.ok) {
        setIsLogged(true); // Successfully wrote to markdown file!
      }
    } catch (error) {
      console.error("Failed to update progress", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group h-[300px] [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 hover:border-amber-400 transition-colors rounded-2xl backface-hidden text-center">
          {card.difficulty && (
            <span className={`absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded border shadow-sm ${diffColors[card.difficulty]}`}>
              {card.difficulty === 'E' ? 'EASY' : card.difficulty === 'M' ? 'MED' : 'HARD'}
            </span>
          )}

          {/* Show a green check on the front if completed during this session or earlier today */}
          {isLogged && <span className="absolute top-4 left-4 text-emerald-500 text-xl">✅</span>}

          <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">
            {card.category}
          </span>
          <h3 className="text-lg font-bold text-slate-800 leading-snug mb-4">
            {card.topic}
          </h3>
          {!isPlaceholder && (
            <p className="text-[10px] font-bold text-slate-50 mt-auto bg-slate-800 px-3 py-1.5 rounded uppercase tracking-wider">Tap to Flip</p>
          )}
        </div>

        {/* BACK */}
        <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-amber-400 shadow-lg flex flex-col items-center justify-center text-center">
          <span className="text-4xl mb-2">🧠</span>
          <h4 className="text-sm font-bold text-slate-700 mb-4 leading-tight">
            {isPlaceholder ? "Mark topics as [x] in your roadmap to see them here!" : "Did you recall the details correctly?"}
          </h4>

          {!isPlaceholder && (
            <div className="flex flex-col gap-2 w-full mt-2">
              <Link
                href={card.link}
                className="w-full justify-center inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-amber-100 py-2.5 px-4 rounded-md transition-colors shadow-sm"
                onClick={(e) => e.stopPropagation()}
                target={card.link.startsWith('http') ? '_blank' : '_self'}
              >
                {card.link.startsWith('http') ? 'View on LeetCode ↗' : 'Review Logbook →'}
              </Link>

              <button
                onClick={handleUpdateProgress}
                disabled={isSaving || isLogged}
                className={`w-full py-2.5 px-4 rounded-md text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isLogged
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSaving ? 'Updating File...' :
                 isLogged ? 'Progress Logged ✅' :
                 (card.isCoding ? 'Mark as Solved [X]' : 'Add +1 Revision')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}