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
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: {
            htmlLabels: true,
            useMaxWidth: false,  // 🌟 CRITICAL: Prevents Mermaid from forcing width
            padding: 40,         // 🌟 CRITICAL: Extra breathing room for nodes
            curve: 'basis'
          },
          themeVariables: {
            fontFamily: 'inherit',
            primaryColor: '#fef3c7',
            primaryTextColor: '#334155',
            primaryBorderColor: '#fbbf24',
            lineColor: '#b45309',
          }
        });

        const decodedChart = chart
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .trim();

        containerRef.current.innerHTML = '';

        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, decodedChart);

        if (isMounted) {
          containerRef.current.innerHTML = svg;

          // 🌟 FINAL FIX: Manual SVG Surgery
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = "none";
            svgElement.style.height = "auto";
            // This prevents the "cutting" effect by showing labels even if they exceed the SVG box
            svgElement.style.overflow = "visible";

            // Fixes potential "half-visible" text on some browsers
            const foreignObjects = svgElement.querySelectorAll('foreignObject');
            foreignObjects.forEach((obj: any) => {
              obj.style.overflow = "visible";
            });
          }
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
    <div className="my-8 w-full min-h-[450px] group relative bg-[#fdfcf0] rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden flex flex-col">
      {hasError ? (
        <div className="p-6 text-red-500 font-mono text-sm">Syntax Error: Check your Mermaid code.</div>
      ) : (
        <TransformWrapper
          initialScale={0.9} // Start slightly zoomed out to ensure visibility
          minScale={0.1}
          maxScale={4}
          centerOnInit={true}
          limitToBounds={false} // Allows panning outside the initial box
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Grand Line Themed Toolbar */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-amber-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => zoomIn()} className="p-2 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button onClick={() => zoomOut()} className="p-2 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <div className="w-px bg-amber-200 mx-1 my-1"></div>
                <button onClick={() => resetTransform()} className="p-2 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
              </div>

              {/* Pan/Zoom Canvas */}
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%", flexGrow: 1, minHeight: "450px" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <div
                  ref={containerRef}
                  className="w-full h-full flex justify-center items-center p-20 cursor-grab active:cursor-grabbing [&>svg]:overflow-visible"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}