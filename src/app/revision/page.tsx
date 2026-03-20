// src/app/revision/page.tsx
import React from 'react';
import { getAllCompletedCards } from '../../lib/revision';
import DailyRevisionClient from '@/components/DailyRevisionClient';

// 🌟 Notice: No more `force-dynamic`! This is now a 100% static page.

export default function DailyRevisionPage() {
  // Fetch ALL cards statically at build time
  const allDecks = getAllCompletedCards();

  // Pass them to the client to sort out today's picks
  return <DailyRevisionClient decks={allDecks} />;
}