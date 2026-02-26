"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import Mermaid from '@/components/Mermaid';

export default function LivePreviewPage() {
  const [markdown, setMarkdown] = useState<string>('# Hello World\n\n```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```');

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Raw Markdown</h2>
        <textarea
          className="flex-1 w-full p-4 border border-gray-300 rounded-lg shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Live Preview</h2>
        <div className="flex-1 w-full p-6 border border-gray-200 bg-white rounded-lg overflow-y-auto shadow-sm">
          <article className="prose prose-slate max-w-none">

            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              // Overriding the default code block behavior
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isMermaid = match && match[1] === 'mermaid';

                  // If it's a mermaid block, render our new component
                  if (isMermaid) {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                  }

                  // Otherwise, render a normal code block (Java, Rust, etc.)
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {markdown}
            </ReactMarkdown>

          </article>
        </div>
      </div>
    </div>
  );
}