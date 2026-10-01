import React, { useRef, useEffect, useState } from 'react';
import { TilePixelGrid, Subpalette } from '../types/nes';
import { NES_MASTER_PALETTE } from '../constants/nesPalette';

interface TileBankProps {
  tiles: TilePixelGrid[];
  selectedTileIndex: number;
  setSelectedTileIndex: (idx: number) => void;
  activeSubpalette: Subpalette;
  onCopyTile: () => void;
  onPasteTile: () => void;
  hasCopiedTile: boolean;
}

export const TileBank: React.FC<TileBankProps> = ({
  tiles,
  selectedTileIndex,
  setSelectedTileIndex,
  activeSubpalette,
  onCopyTile,
  onPasteTile,
  hasCopiedTile
}) => {
  const [activeTable, setActiveTable] = useState<0 | 1>(0); // Table 0: 0..255, Table 1: 256..511
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render the entire 16x16 tiles (128x128 pixels) of the active pattern table to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 16 tiles wide * 8 = 128 px
    // 16 tiles high * 8 = 128 px
    const startTile = activeTable === 0 ? 0 : 256;
    const imgData = ctx.createImageData(128, 128);
    const data = imgData.data;

    // Precalculate RGBA for active subpalette
    const palRgba = activeSubpalette.map(nesIdx => {
      const hex = NES_MASTER_PALETTE[nesIdx].hex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b, 255];
    });

    for (let t = 0; t < 256; t++) {
      const tileIndex = startTile + t;
      const tileGrid = tiles[tileIndex] || Array.from({ length: 8 }, () => Array(8).fill(0));
      const tileX = (t % 16) * 8;
      const tileY = Math.floor(t / 16) * 8;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const colorIdx = (tileGrid[y] && tileGrid[y][x]) || 0;
          const [r, g, b, a] = palRgba[colorIdx];
          const px = tileX + x;
          const py = tileY + y;
          const offset = (py * 128 + px) * 4;
          data[offset] = r;
          data[offset + 1] = g;
          data[offset + 2] = b;
          data[offset + 3] = a;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [tiles, activeTable, activeSubpalette]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 16));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 16));

    if (x >= 0 && x < 16 && y >= 0 && y < 16) {
      const localTile = y * 16 + x;
      const finalIndex = (activeTable === 0 ? 0 : 256) + localTile;
      setSelectedTileIndex(finalIndex);
    }
  };

  const currentLocal = selectedTileIndex % 256;
  const currentTileInActiveTable =
    (activeTable === 0 && selectedTileIndex < 256) ||
    (activeTable === 1 && selectedTileIndex >= 256);

  const selX = (currentLocal % 16) * 16;
  const selY = Math.floor(currentLocal / 16) * 16;

  return (
    <div className="flex flex-col gap-3 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl select-none">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            CHR-ROM Pattern Tables
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            512 Tiles Total (8 KiB)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onCopyTile}
            className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer"
          >
            Copy
          </button>
          <button
            onClick={onPasteTile}
            disabled={!hasCopiedTile}
            className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Paste
          </button>
        </div>
      </div>

      {/* Pattern Table Switcher */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTable(0)}
          className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            activeTable === 0
              ? 'bg-neutral-800 text-white border-neutral-700'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
        >
          Table 0 ($0000-$0FFF)
        </button>
        <button
          onClick={() => setActiveTable(1)}
          className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            activeTable === 1
              ? 'bg-neutral-800 text-white border-neutral-700'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
        >
          Table 1 ($1000-$1FFF)
        </button>
      </div>

      {/* 256 Tiles Visual Grid */}
      <div className="relative w-full aspect-square bg-neutral-950 rounded-lg border border-neutral-800 p-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={128}
          height={128}
          onClick={handleCanvasClick}
          className="w-full h-full pixelated rounded cursor-crosshair"
          title="Click to select tile to edit"
        />

        {/* Selected Tile Highlight Box */}
        {currentTileInActiveTable && (
          <div
            style={{
              left: `${(selX / 256) * 100}%`,
              top: `${(selY / 256) * 100}%`,
              width: '6.25%',
              height: '6.25%'
            }}
            className="absolute border-2 border-red-500 pointer-events-none ring-1 ring-white/50"
          />
        )}
      </div>

      {/* Selected Tile Info Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
        <span>Selected Tile: #{selectedTileIndex}</span>
        <span className="text-neutral-500">
          Hex: ${selectedTileIndex.toString(16).padStart(2, '0').toUpperCase()} · CHR: ${(selectedTileIndex * 16).toString(16).padStart(4, '0').toUpperCase()}
        </span>
      </div>
    </div>
  );
};
