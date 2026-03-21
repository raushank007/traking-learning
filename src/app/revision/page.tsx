// src/app/revision/page.tsx
import React from 'react';
import { getAllCompletedCards, getTodayRevisedTopics } from '../../lib/revision';
import DailyRevisionClient from '@/components/DailyRevisionClient';

export default function DailyRevisionPage() {
  const allDecks = getAllCompletedCards();

  // 🌟 Fetch the topics you've already completed today from the Markdown DB
  const todayRevised = getTodayRevisedTopics();

  return <DailyRevisionClient decks={allDecks} todayRevised={todayRevised} />;
}