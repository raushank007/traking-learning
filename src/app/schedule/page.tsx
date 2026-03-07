import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Voyage Itinerary | The Grand Line Logbook",
  description: 'The 6-month study schedule for SDE 3 preparation.',
};

export default function SchedulePage() {
  const weeklyHours = (5 * 3) + (2 * 6); // 15 + 12 = 27 hours/week
  const totalMonths = 6;
  const totalHours = weeklyHours * 4 * totalMonths; // Roughly 648 hours

  const phases = [
    {
      title: "Phase 1: The Foundations (Java Core & Basic Patterns)",
      weeks: "Weeks 1 - 4",
      icon: "☕",
      color: "border-sky-300 bg-sky-50/50",
      focus: [
        "Internal workings of HashMaps & Concurrent Data Structures",
        "Java 8+ Streams and Functional Interfaces",
        "Daily Coding: Arrays, Strings, and Two Pointers"
      ]
    },
    {
      title: "Phase 2: The Sniper's Precision (JVM & Sliding Windows)",
      weeks: "Weeks 5 - 8",
      icon: "🔫",
      color: "border-indigo-300 bg-indigo-50/50",
      focus: [
        "Garbage Collection Algorithms & Memory Leaks",
        "Java Memory Model & Happens-Before",
        "Daily Coding: Sliding Window, Fast-Slow, & Binary Search"
      ]
    },
    {
      title: "Phase 3: The Shipwright (Spring Boot & Trees/Graphs)",
      weeks: "Weeks 9 - 12",
      icon: "🚢",
      color: "border-orange-300 bg-orange-50/50",
      focus: [
        "IoC, Bean Lifecycle, and Custom Starters",
        "Hibernate N+1, L1/L2 Caching, and Transactional Proxies",
        "Daily Coding: Tree/Graph BFS & DFS, and HashMaps"
      ]
    },
    {
      title: "Phase 4: Building Fortresses (HLD & Dynamic Programming)",
      weeks: "Weeks 13 - 16",
      icon: "🏰",
      color: "border-amber-300 bg-amber-50/50",
      focus: [
        "API Gateways, Load Balancers, and Rate Limiters",
        "Database Sharding, Replication, and CAP Theorem",
        "Daily Coding: Dynamic Programming & Monotonic Stacks"
      ]
    },
    {
      title: "Phase 5: The Swordsman (LLD & Advanced Tracking)",
      weeks: "Weeks 17 - 20",
      icon: "⚔️",
      color: "border-emerald-300 bg-emerald-50/50",
      focus: [
        "SOLID Principles and OOP Abstraction",
        "Creational, Structural, and Behavioral Design Patterns",
        "Daily Coding: Backtracking, Tries, & Advanced Graphs"
      ]
    },
    {
      title: "Phase 6: Entering the New World (Mock Interviews)",
      weeks: "Weeks 21 - 24",
      icon: "👑",
      color: "border-red-300 bg-red-50/50",
      focus: [
        "System Design real-world scaling scenarios",
        "Behavioral questions and Leadership Principles",
        "Daily Coding: Hard problems & Timed Mock Assessments"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">

      <header className="mb-12">
        <h1 className="font-pirate text-5xl md:text-6xl tracking-widest text-slate-900 mb-6 drop-shadow-sm">
          Voyage Itinerary
        </h1>
        <p className="text-lg text-amber-700/80 font-medium">
          The 6-month battle plan to conquer the SDE 3 interview loop.
        </p>
      </header>

      {/* ⏱️ WEEKLY ROUTINE BLOCK */}
      <section className="bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] bg-[#fef3c7]/80 backdrop-blur-sm rounded-2xl border-2 border-amber-300 p-6 md:p-8 mb-12 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>⏳</span> Weekly Training Routine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 border border-amber-200 p-5 rounded-xl">
            <div className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Weekdays (Mon-Fri)</div>
            <div className="text-3xl font-black text-slate-800 mb-1">3 <span className="text-lg font-bold text-slate-500">hrs / day</span></div>
            <p className="text-sm text-slate-600 font-medium">
              <span className="font-bold text-red-600">1hr:</span> LeetCode Pattern Practice.<br/>
              <span className="font-bold text-amber-600">2hrs:</span> Deep-dive reading & system design notes.
            </p>
          </div>

          <div className="bg-white/60 border border-amber-200 p-5 rounded-xl">
            <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">Weekends (Sat-Sun)</div>
            <div className="text-3xl font-black text-slate-800 mb-1">6 <span className="text-lg font-bold text-slate-500">hrs / day</span></div>
            <p className="text-sm text-slate-600 font-medium">
              <span className="font-bold text-red-600">2hrs:</span> Weekly coding revision.<br/>
              <span className="font-bold text-amber-600">4hrs:</span> Heavy architecture sessions & mock implementations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-orange-500 border border-red-700 p-5 rounded-xl text-white shadow-md transform hover:scale-105 transition-transform">
            <div className="text-xs font-black uppercase tracking-widest text-red-100 mb-2">Total Commitment</div>
            <div className="text-4xl font-black mb-1 drop-shadow-sm">{weeklyHours} <span className="text-lg font-bold text-red-100">hrs / week</span></div>
            <p className="text-sm text-red-50 font-medium">Projected <b>{totalHours} hours</b> over the 6-month voyage.</p>
          </div>
        </div>
      </section>

      {/* 🗺️ THE 6-MONTH CALENDAR ROADMAP */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
          <span>📅</span> The 6-Month Timeline
        </h2>

        {/* Container for the timeline line */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-red-500 before:via-amber-400 before:to-amber-200">

          {phases.map((phase, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className={`relative flex items-center md:justify-center ${isEven ? 'md:flex-row-reverse' : ''}`}>

                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-amber-50 bg-white shadow z-10">
                  <span className="text-xl">{phase.icon}</span>
                </div>

                {/* Content Card */}
                <div className={`w-[calc(100%-4rem)] ml-auto md:w-[calc(50%-3rem)] md:ml-0 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-red-300 ${isEven ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-2 bg-red-50 inline-block px-2 py-1 rounded">
                    {phase.weeks}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 leading-tight">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.focus.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                        <span className="text-amber-500 mt-0.5">▪</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}