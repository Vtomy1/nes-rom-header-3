import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TilePixelGrid, DrawTool, Subpalette } from '../types/nes';
import { NES_MASTER_PALETTE } from '../constants/nesPalette';

interface PixelCanvasProps {
  currentTile: TilePixelGrid;
  onTileChange: (tile: TilePixelGrid) => void;
  activeSubpalette: Subpalette;
  currentTool: DrawTool;
  selectedColorIndex: number;
  setSelectedColorIndex: (idx: number) => void;
  showGrid: boolean;
  zoom: number;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  currentTile,
  onTileChange,
  activeSubpalette,
  currentTool,
  selectedColorIndex,
  setSelectedColorIndex,
  showGrid,
  zoom
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [previewGrid, setPreviewGrid] = useState<TilePixelGrid | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to clone grid
  const cloneGrid = (g: TilePixelGrid): TilePixelGrid => g.map(row => [...row]);

  // Bresenham's line algorithm
  const getLinePixels = (x0: number, y0: number, x1: number, y1: number) => {
    const points: { x: number; y: number }[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let currX = x0;
    let currY = y0;

    while (true) {
      if (currX >= 0 && currX < 8 && currY >= 0 && currY < 8) {
        points.push({ x: currX, y: currY });
      }
      if (currX === x1 && currY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
    }
    return points;
  };

  // Flood fill algorithm
  const floodFill = (grid: TilePixelGrid, startX: number, startY: number, targetVal: number) => {
    const currentVal = grid[startY][startX];
    if (currentVal === targetVal) return grid;

    const newGrid = cloneGrid(grid);
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [cx, cy] = queue.pop()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (newGrid[cy][cx] === currentVal) {
        newGrid[cy][cx] = targetVal;

        if (cx > 0) queue.push([cx - 1, cy]);
        if (cx < 7) queue.push([cx + 1, cy]);
        if (cy > 0) queue.push([cx, cy - 1]);
        if (cy < 7) queue.push([cx, cy + 1]);
      }
    }
    return newGrid;
  };

  const applyPixelEdit = useCallback(
    (x: number, y: number, isInitialClick: boolean = false) => {
      if (x < 0 || x >= 8 || y < 0 || y >= 8) return;

      if (currentTool === 'picker') {
        const picked = currentTile[y][x];
        setSelectedColorIndex(picked);
        return;
      }

      if (currentTool === 'bucket' && isInitialClick) {
        const filled = floodFill(currentTile, x, y, selectedColorIndex);
        onTileChange(filled);
        return;
      }

      if (currentTool === 'line' || currentTool === 'rect') {
        // Line and rect are committed on mouse up
        return;
      }

      const newGrid = cloneGrid(currentTile);
      const colorToApply = currentTool === 'eraser' ? 0 : selectedColorIndex;

      if (currentTool === 'pencil' || currentTool === 'eraser') {
        newGrid[y][x] = colorToApply;
      } else if (currentTool === 'brush') {
        // 2x2 brush
        newGrid[y][x] = colorToApply;
        if (x + 1 < 8) newGrid[y][x + 1] = colorToApply;
        if (y + 1 < 8) newGrid[y + 1][x] = colorToApply;
        if (x + 1 < 8 && y + 1 < 8) newGrid[y + 1][x + 1] = colorToApply;
      }

      onTileChange(newGrid);
    },
    [currentTile, currentTool, onTileChange, selectedColorIndex, setSelectedColorIndex]
  );

  const getGridCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);
    if (x < 0 || x >= 8 || y < 0 || y >= 8) return null;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getGridCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    setDragStart(coords);

    if (currentTool === 'line' || currentTool === 'rect') {
      setPreviewGrid(cloneGrid(currentTile));
    } else {
      applyPixelEdit(coords.x, coords.y, true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const coords = getGridCoords(e);
    setHoverCoord(coords);

    if (!isDrawing || !coords) return;

    if (currentTool === 'line' && dragStart) {
      const tempGrid = cloneGrid(currentTile);
      const pts = getLinePixels(dragStart.x, dragStart.y, coords.x, coords.y);
      for (const p of pts) {
        tempGrid[p.y][p.x] = selectedColorIndex;
      }
      setPreviewGrid(tempGrid);
    } else if (currentTool === 'rect' && dragStart) {
      const tempGrid = cloneGrid(currentTile);
      const minX = Math.min(dragStart.x, coords.x);
      const maxX = Math.max(dragStart.x, coords.x);
      const minY = Math.min(dragStart.y, coords.y);
      const maxY = Math.max(dragStart.y, coords.y);

      for (let ry = minY; ry <= maxY; ry++) {
        for (let rx = minX; rx <= maxX; rx++) {
          tempGrid[ry][rx] = selectedColorIndex;
        }
      }
      setPreviewGrid(tempGrid);
    } else {
      applyPixelEdit(coords.x, coords.y, false);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && previewGrid && (currentTool === 'line' || currentTool === 'rect')) {
      onTileChange(previewGrid);
    }
    setIsDrawing(false);
    setDragStart(null);
    setPreviewGrid(null);
  };

  const activeDisplayGrid = previewGrid || currentTile;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Canvas Box */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoverCoord(null);
          if (isDrawing) handleMouseUp();
        }}
        style={{
          width: `${8 * zoom}px`,
          height: `${8 * zoom}px`
        }}
        className={`relative grid grid-cols-8 grid-rows-8 bg-neutral-950 border-2 border-neutral-800 rounded-xl overflow-hidden shadow-2xl select-none cursor-crosshair ${
          showGrid ? 'retro-grid' : ''
        }`}
      >
        {Array.from({ length: 8 }).map((_, y) =>
          Array.from({ length: 8 }).map((_, x) => {
            const colorIdx = (activeDisplayGrid[y] && activeDisplayGrid[y][x]) || 0;
            const nesColor = NES_MASTER_PALETTE[activeSubpalette[colorIdx]];
            const isHover = hoverCoord?.x === x && hoverCoord?.y === y;

            return (
              <div
                key={`${y}-${x}`}
                style={{
                  backgroundColor: nesColor.hex
                }}
                className={`relative transition-colors ${
                  showGrid ? 'border-[0.5px] border-black/20' : ''
                }`}
              >
                {/* Visual hover indicator */}
                {isHover && (
                  <div className="absolute inset-0 bg-white/30 border border-white/80 pointer-events-none" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Coordinate and Color Readout */}
      <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
        <span>
          X: {hoverCoord ? hoverCoord.x : '-'} · Y: {hoverCoord ? hoverCoord.y : '-'}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          Color: #{hoverCoord ? activeDisplayGrid[hoverCoord.y][hoverCoord.x] : selectedColorIndex}
        </span>
        <span aria-hidden="true">·</span>
        <span className="text-neutral-500">8×8 Tile Mode (16 Bytes)</span>
      </div>
    </div>
  );
};
