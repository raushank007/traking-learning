// src/components/DailyRevisionClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard'; // Assuming you saved Flashcard here
import { CategoryDeck, RevisionCard } from '../lib/revision';

// Hash function moved to the client
function getDailyRandomItem<T>(items: T[], dateStr: string): T | null {
  if (items.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
  }
  const index = Math.abs(hash) % items.length;
  return items[index];
}

export default function DailyRevisionClient({ decks }: { decks: CategoryDeck[] }) {
  const [dailyCards, setDailyCards] = useState<RevisionCard[]>([]);
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    // Run only in the browser so it builds statically without hydration mismatches
    const todayStr = new Date().toLocaleDateString('en-CA');
    setDisplayDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    const pickedCards = decks.map(deck => {
      const dailyPick = getDailyRandomItem(deck.cards, todayStr);
      return dailyPick || {
        category: deck.category,
        topic: "No completed topics yet. Keep studying!",
        link: "#"
      };
    });

    setDailyCards(pickedCards);
  }, [decks]);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6">
      <header className="mb-12 text-center border-b-2 border-amber-200 pb-8">
        <h1 className="text-4xl md:text-5xl font-pirate tracking-widest text-slate-900 drop-shadow-sm mb-4">
          Daily Logbook Revision
        </h1>
        <p className="text-amber-700 font-bold uppercase tracking-wider text-sm min-h-[20px]">
          {displayDate ? `Active Recall Protocol • ${displayDate}` : 'Loading protocol...'}
        </p>
      </header>

      {dailyCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dailyCards.map((card, index) => (
            <Flashcard key={`${card.category}-${index}`} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}