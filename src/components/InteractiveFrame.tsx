// src/components/InteractiveFrame.tsx
"use client";

import React from 'react';

export default function InteractiveFrame({ htmlContent }: { htmlContent: string }) {
  return (
    <div className="my-8 w-full flex justify-center">
      <iframe
        srcDoc={htmlContent}
        // 🌟 Increased height to prevent buttons from being cut off
        className="w-full max-w-4xl h-[650px] bg-white border-2 border-amber-200 rounded-xl shadow-lg"
        sandbox="allow-scripts allow-same-origin"
        title="Interactive Canvas Animation"
        // 🌟 Ensure scrolling is allowed if content grows
        scrolling="auto"
      />
    </div>
  );
}