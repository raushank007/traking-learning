"use client";

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid globally
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'inherit',
  },
});

export default function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        // Generate a random ID for the diagram to prevent DOM conflicts
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (error) {
        console.error('Mermaid syntax error:', error);
        setSvg(`<div class="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200 text-sm">Failed to render Mermaid diagram. Check syntax.</div>`);
      }
    };

    if (chart) {
      renderMermaid();
    }
  }, [chart]);

  return (
    <div
      className="flex justify-center my-8 w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}