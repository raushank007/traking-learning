"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function LivePreviewPage() {
  const [markdown, setMarkdown] = useState<string>('# Hello World\n\nStart typing here...');

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)]">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Raw Markdown</h2>
        <textarea
          className="flex-1 w-full p-4 border border-gray-300 rounded-lg shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Live Preview</h2>
        <div className="flex-1 w-full p-4 border border-gray-200 bg-gray-50 rounded-lg overflow-y-auto">
          <article className="prose max-w-none">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}