import React from 'react';
import { DrawTool } from '../types/nes';
import {
  Pencil,
  Paintbrush,
  Square,
  PaintBucket,
  Pipette,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Minus
} from 'lucide-react';

interface ToolBarProps {
  currentTool: DrawTool;
  setCurrentTool: (tool: DrawTool) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onShift: (dx: number, dy: number) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentTool,
  setCurrentTool,
  showGrid,
  setShowGrid,
  zoom,
  setZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  onFlipH,
  onFlipV,
  onShift
}) => {
  const tools: { id: DrawTool; label: string; icon: React.ReactNode }[] = [
    { id: 'pencil', label: 'Pencil (1px)', icon: <Pencil className="w-4 h-4" /> },
    { id: 'brush', label: 'Brush (2x2)', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
    { id: 'rect', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { id: 'bucket', label: 'Fill Bucket', icon: <PaintBucket className="w-4 h-4" /> },
    { id: 'picker', label: 'Eyedropper', icon: <Pipette className="w-4 h-4" /> },
    { id: 'eraser', label: 'Eraser (Index 0)', icon: <Eraser className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-900/90 border border-neutral-800 rounded-xl select-none text-neutral-300">
      {/* Primary Draw Tools */}
      <div className="flex items-center gap-1">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setCurrentTool(t.id)}
            title={t.label}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              currentTool === t.id
                ? 'bg-neutral-800 border-red-500/70 text-white shadow-xs'
                : 'bg-transparent border-transparent hover:bg-neutral-800/60 hover:text-white text-neutral-400'
            }`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

      {/* History & Manipulation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        <button
          onClick={onFlipH}
          title="Flip Horizontal"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>
        <button
          onClick={onFlipV}
          title="Flip Vertical"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <FlipVertical className="w-4 h-4" />
        </button>

        {/* Shift arrows */}
        <button
          onClick={() => onShift(-1, 0)}
          title="Shift Left"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onShift(1, 0)}
          title="Shift Right"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onShift(0, -1)}
          title="Shift Up"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onShift(0, 1)}
          title="Shift Down"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          title="Clear Tile"
          className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-neutral-800 hidden md:block" />

      {/* Grid and Zoom */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Pixel Grid"
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            showGrid
              ? 'bg-neutral-800 border-neutral-700 text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setZoom(z => Math.max(10, z - 4))}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="tabular-nums px-1 text-neutral-300">{zoom}px</span>
          <button
            onClick={() => setZoom(z => Math.min(48, z + 4))}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
