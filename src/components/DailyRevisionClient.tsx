// src/components/DailyRevisionClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import { CategoryDeck, RevisionCard } from '../lib/revision';

function getDailyRandomItems<T>(items: T[], dateStr: string, count: number, salt: string): T[] {
  if (items.length === 0) return [];
  if (items.length <= count) return [...items];

  const selected: T[] = [];
  const available = [...items];

  for (let c = 0; c < count; c++) {
    let hash = 0;
    const hashStr = dateStr + salt + c.toString();
    for (let i = 0; i < hashStr.length; i++) {
      hash = Math.imul(31, hash) + hashStr.charCodeAt(i) | 0;
    }
    const index = Math.abs(hash) % available.length;
    selected.push(available[index]);
    available.splice(index, 1);
  }

  return selected;
}

// 🌟 ACCEPT THE NEW PROP: todayRevised
export default function DailyRevisionClient({ decks, todayRevised = [] }: { decks: CategoryDeck[], todayRevised?: string[] }) {
  const [dailyCards, setDailyCards] = useState<RevisionCard[]>([]);
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    setDisplayDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    const pickedCards: RevisionCard[] = [];

    decks.forEach(deck => {
      if (deck.category === 'Algorithms') {
        const easyCards = deck.cards.filter(c => c.difficulty === 'E');
        const medCards = deck.cards.filter(c => c.difficulty === 'M');
        const hardCards = deck.cards.filter(c => c.difficulty === 'H');

        const pickedEasy = getDailyRandomItems(easyCards, todayStr, 1, "algoE");
        const pickedMed = getDailyRandomItems(medCards, todayStr, 2, "algoM");
        const pickedHard = getDailyRandomItems(hardCards, todayStr, 1, "algoH");

        const algoPicks = [...pickedEasy, ...pickedMed, ...pickedHard];

        if (algoPicks.length > 0) {
          pickedCards.push(...algoPicks);
        } else {
          pickedCards.push({
            category: deck.category,
            topic: "No completed topics yet. Keep studying!",
            link: "#",
            fileName: "",
            isCoding: false
          });
        }
      }
      else {
        const standardPick = getDailyRandomItems(deck.cards, todayStr, 1, deck.category);
        if (standardPick.length > 0) {
          pickedCards.push(standardPick[0]);
        } else {
          pickedCards.push({
            category: deck.category,
            topic: "No completed topics yet. Keep studying!",
            link: "#",
            fileName: "",
            isCoding: false
          });
        }
      }
    });

    setDailyCards(pickedCards);
  }, [decks]);

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-6">
      <header className="mb-12 text-center border-b-2 border-amber-200 pb-8">
        <h1 className="text-4xl md:text-5xl font-pirate tracking-widest text-slate-900 drop-shadow-sm mb-4">
          Daily Logbook Revision
        </h1>
        <p className="text-amber-700 font-bold uppercase tracking-wider text-sm min-h-[20px]">
          {displayDate ? `Active Recall Protocol • ${displayDate}` : 'Loading protocol...'}
        </p>
      </header>

      {dailyCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dailyCards.map((card, index) => (
            <Flashcard
              key={`${card.category}-${index}`}
              card={card}
              // 🌟 PASS DOWN THE CHECK
              isAlreadyRevised={todayRevised.includes(card.topic)}
            />
          ))}
        </div>
      )}
    </div>
  );
}