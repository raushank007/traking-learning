"use client";

import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        setHasError(false);
        // Dynamically import Mermaid on the client side only
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          themeVariables: {
            fontFamily: 'inherit',
          }
        });

        // Clean up markdown HTML entities that break arrows
        const decodedChart = chart
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .trim();

        // Clear previous diagram
        containerRef.current.innerHTML = '';

        // Generate unique ID and render
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, decodedChart);

        if (isMounted) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering failed:', error);
        if (isMounted) setHasError(true);
      }
    };

    if (chart) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="my-8 w-full min-h-[400px] group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {hasError ? (
        <div className="p-6 text-red-500 font-mono text-sm">Syntax Error: Failed to render diagram.</div>
      ) : (
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Floating Toolbar */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => zoomIn()}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => resetTransform()}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                  title="Reset Diagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
              </div>

              {/* Pan/Zoom Canvas */}
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%", flexGrow: 1, minHeight: "400px" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                {/* SVG scaling override applied here via [&>svg] */}
                <div
                  ref={containerRef}
                  className="w-full h-full flex justify-center items-center p-8 [&>svg]:max-w-full [&>svg]:h-auto cursor-grab active:cursor-grabbing"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}