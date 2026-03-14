"use client";

import { Tldraw, createShapeId, Editor, toRichText, exportAs } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useState } from 'react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface LibraryItem {
  label: string;
  color: 'black' | 'blue' | 'green' | 'grey' | 'light-blue' | 'light-green' | 'light-violet' | 'orange' | 'red' | 'violet' | 'yellow';
  icon: string;
  canCluster: boolean;
  textAlign?: 'start' | 'middle' | 'end';
}

export interface LibraryCategory {
  category: string;
  items: LibraryItem[];
}

// ==========================================
// 2. CONSTANTS & DATA
// ==========================================

const ARCHITECTURE_LIBRARY: LibraryCategory[] = [
  {
    category: "Users & Entry",
    items: [
      { label: "Mobile App", color: "violet", icon: "📱", canCluster: false },
      { label: "Web Client", color: "violet", icon: "💻", canCluster: false },
      { label: "CDN", color: "light-violet", icon: "🌍", canCluster: true },
      { label: "DNS", color: "grey", icon: "🌐", canCluster: false },
    ]
  },
  {
    category: "Network & Security",
    items: [
      { label: "Firewall", color: "red", icon: "🧱", canCluster: false },
      { label: "API Gateway", color: "green", icon: "🚦", canCluster: true },
      { label: "Load Balancer", color: "light-green", icon: "⚖️", canCluster: true },
      { label: "Auth Service", color: "black", icon: "🔐", canCluster: true },
    ]
  },
  {
    category: "Compute & Logic",
    items: [
      { label: "Microservice", color: "blue", icon: "⚙️", canCluster: true },
      { label: "Worker Node", color: "light-blue", icon: "🔨", canCluster: true },
      { label: "Lambda", color: "orange", icon: "λ", canCluster: true },
    ]
  },
  {
    category: "Databases & Storage",
    items: [
      { label: "SQL Database", color: "orange", icon: "🗄️", canCluster: true },
      { label: "NoSQL DB", color: "light-green", icon: "📚", canCluster: true },
      { label: "Cache", color: "yellow", icon: "⚡", canCluster: true },
      { label: "Object Storage", color: "grey", icon: "☁️", canCluster: true },
    ]
  },
  {
    category: "Async & Messaging",
    items: [
      { label: "Message Queue", color: "light-blue", icon: "📬", canCluster: true },
      { label: "Event Stream", color: "blue", icon: "🌊", canCluster: true },
      { label: "Notifications", color: "yellow", icon: "🔔", canCluster: true },
    ]
  },
  {
    category: "LLD & OOD",
    items: [
      { label: "Actor", color: "red", icon: "👤", canCluster: false },
      { label: "<<Interface>>\nName", color: "black", icon: "📄", canCluster: false },
      { label: "ClassName\n---\n+ attribute: type\n---\n+ method()", color: "black", textAlign: "start", icon: "📦", canCluster: false },
    ]
  }
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function WhiteboardPage() {
  // --- State ---
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isClusterMode, setIsClusterMode] = useState<boolean>(false);

  // --- Handlers: Native Tldraw Export ---
  const handleExportToPNG = async () => {
    if (!editor) return;

    const shapeIds = Array.from(editor.getCurrentPageShapeIds());

    if (shapeIds.length === 0) {
      alert("The canvas is empty! Add some shapes before downloading.");
      return;
    }

    try {
      await exportAs(editor, shapeIds, {
        format: 'png',
        background: true,
        padding: 32
      });
    } catch (error) {
      console.error('Failed to export canvas:', error);
      alert('Failed to export diagram. Check console for details.');
    }
  };

  // --- Handlers: Spawn Engine ---
  const spawnShape = (item: LibraryItem, dropX?: number, dropY?: number) => {
    if (!editor) return;

    let startX = dropX;
    let startY = dropY;

    if (startX === undefined || startY === undefined) {
      const bounds = editor.getViewportPageBounds();
      startX = bounds.center.x - 50;
      startY = bounds.center.y - 50;
    }

    const clusterCount = (isClusterMode && item.canCluster) ? 3 : 1;
    const nodeGroupIds: import('@tldraw/tldraw').TLShapeId[] = [];

    for (let i = 0; i < clusterCount; i++) {
      const currentX = startX + (i * 20);
      const currentY = startY - (i * 20);

      const iconId = createShapeId();
      const shapeIdsToGroup = [iconId];
      const shapesToCreate: any[] = [
        {
          id: iconId,
          type: 'text',
          x: currentX,
          y: currentY,
          props: {
            richText: toRichText(item.icon),
            size: 'xl',
            textAlign: 'middle',
            font: 'sans'
          }
        }
      ];

      if (i === 0) {
        const labelId = createShapeId();
        shapesToCreate.push({
          id: labelId,
          type: 'text',
          x: currentX,
          y: currentY + 55,
          props: {
            richText: toRichText(item.label),
            size: 's',
            color: item.color,
            textAlign: item.textAlign || 'middle',
            font: 'sans'
          }
        });
        shapeIdsToGroup.push(labelId);
      }

      editor.createShapes(shapesToCreate);

      const singleNodeGroupId = createShapeId();
      editor.groupShapes(shapeIdsToGroup, { groupId: singleNodeGroupId });
      nodeGroupIds.push(singleNodeGroupId);
    }

    if (clusterCount > 1) {
      const clusterGroupId = createShapeId();
      editor.groupShapes(nodeGroupIds, { groupId: clusterGroupId });
      editor.select(clusterGroupId);
    } else {
      editor.select(nodeGroupIds[0]);
    }
  };

  // --- Handlers: Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData("application/tldraw-component", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editor) return;

    const dragData = e.dataTransfer.getData("application/tldraw-component");
    if (!dragData) return;

    try {
      const item: LibraryItem = JSON.parse(dragData);
      const point = editor.screenToPage({ x: e.clientX, y: e.clientY });
      spawnShape(item, point.x - 50, point.y - 50);
    } catch (err) {
      console.error("Failed to parse dropped item:", err);
    }
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-[#fef3c7]">

      {/* HEADER */}
      <header className="px-6 py-3 bg-white/80 backdrop-blur-sm border-b-2 border-amber-200 shadow-sm flex justify-between items-center z-10 shrink-0">
        <h1 className="font-pirate text-2xl tracking-widest text-slate-900 drop-shadow-sm flex items-center gap-2">
          <span>📐</span> Architect's Canvas
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExportToPNG}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded-lg shadow-sm transition-colors"
          >
            Download PNG
          </button>

          {/* SCALING TOGGLE */}
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-1.5 rounded-full border-2 border-slate-200">
            <span className={`text-sm font-bold ${!isClusterMode ? 'text-blue-600' : 'text-slate-400'}`}>
              Single Node
            </span>
            <button
              onClick={() => setIsClusterMode(!isClusterMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${isClusterMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'}`}
              aria-label="Toggle cluster mode"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
            </button>
            <span className={`text-sm font-bold ${isClusterMode ? 'text-amber-600' : 'text-slate-400'}`}>
              Cluster (Scaled)
            </span>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-grow w-full relative z-0 overflow-hidden">

        {/* LEFT SIDEBAR: Architecture Library */}
        <aside className="w-72 bg-white/90 backdrop-blur-md border-r-2 border-amber-200 flex flex-col shrink-0 overflow-y-auto shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 border-b border-amber-100">
            <h2 className="text-sm font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
              <span>🏗️</span> Custom Library
            </h2>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
              Drag & Drop OR Click to Spawn
            </p>
          </div>

          <div className="p-3 space-y-6">
            {ARCHITECTURE_LIBRARY.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => spawnShape(item)}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 hover:shadow-md transition-all text-center group cursor-grab active:cursor-grabbing"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-[10px] font-bold text-slate-600 leading-tight whitespace-pre-line">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* TLDRAW CANVAS */}
        <div
          className="flex-grow relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Tldraw onMount={setEditor} />
        </div>

      </div>
    </div>
  );
}