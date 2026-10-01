import React from 'react';
import { TilePixelGrid, Subpalette } from '../types/nes';
import { NES_MASTER_PALETTE } from '../constants/nesPalette';
import { encodeTileTo2bpp } from '../utils/nesRom';

interface BitplaneInspectorProps {
  currentTile: TilePixelGrid;
  setCurrentTile: (tile: TilePixelGrid) => void;
  activeSubpalette: Subpalette;
  tileIndex: number;
}

export const BitplaneInspector: React.FC<BitplaneInspectorProps> = ({
  currentTile,
  setCurrentTile,
  activeSubpalette,
  tileIndex
}) => {
  const bytes = encodeTileTo2bpp(currentTile);

  const toggleBit = (plane: 0 | 1, row: number, col: number) => {
    const newGrid = currentTile.map((r, y) => [...r]);
    const currentColor = newGrid[row][col];
    let bit0 = currentColor & 1;
    let bit1 = (currentColor >> 1) & 1;

    if (plane === 0) {
      bit0 = bit0 === 1 ? 0 : 1;
    } else {
      bit1 = bit1 === 1 ? 0 : 1;
    }

    newGrid[row][col] = bit0 | (bit1 << 1);
    setCurrentTile(newGrid);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            2BPP Planar Tile Memory Architecture
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Tile #{tileIndex} (CHR Offset: 0x{(tileIndex * 16).toString(16).padStart(4, '0').toUpperCase()} - 0x{(tileIndex * 16 + 15).toString(16).padStart(4, '0').toUpperCase()})
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          <span>Plane 0 (Low Bit)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block ml-2" />
          <span>Plane 1 (High Bit)</span>
        </div>
      </div>

      {/* Row-by-Row Bitplane Breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="text-neutral-500 border-b border-neutral-800 text-left">
              <th className="py-1 px-2 font-medium">Row</th>
              <th className="py-1 px-2 font-medium">Pixels</th>
              <th className="py-1 px-2 font-medium text-cyan-400">Bitplane 0 (b0..b7)</th>
              <th className="py-1 px-2 font-medium text-cyan-400">Hex 0</th>
              <th className="py-1 px-2 font-medium text-purple-400">Bitplane 1 (b0..b7)</th>
              <th className="py-1 px-2 font-medium text-purple-400">Hex 1</th>
              <th className="py-1 px-2 font-medium text-neutral-300">2-bit Indices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {Array.from({ length: 8 }).map((_, y) => {
              const p0 = bytes[y];
              const p1 = bytes[y + 8];

              return (
                <tr key={y} className="hover:bg-neutral-800/30">
                  <td className="py-1.5 px-2 text-neutral-500 font-bold">Y={y}</td>
                  
                  {/* 8-pixel preview */}
                  <td className="py-1.5 px-2">
                    <div className="flex items-center border border-neutral-800 rounded overflow-hidden w-24 h-4">
                      {Array.from({ length: 8 }).map((_, x) => {
                        const colorIdx = (currentTile[y] && currentTile[y][x]) || 0;
                        const nesColor = NES_MASTER_PALETTE[activeSubpalette[colorIdx]];
                        return (
                          <div
                            key={x}
                            style={{ backgroundColor: nesColor.hex }}
                            className="flex-1 h-full"
                            title={`Pixel (${x},${y}): Color #${colorIdx}`}
                          />
                        );
                      })}
                    </div>
                  </td>

                  {/* Bitplane 0 Bits */}
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }).map((_, x) => {
                        const bit = (p0 >> (7 - x)) & 1;
                        return (
                          <button
                            key={x}
                            onClick={() => toggleBit(0, y, x)}
                            className={`w-4 h-4 flex items-center justify-center rounded text-[10px] cursor-pointer transition-colors ${
                              bit === 1
                                ? 'bg-cyan-600/30 text-cyan-300 font-bold border border-cyan-500/50'
                                : 'bg-neutral-950 text-neutral-600 border border-neutral-800 hover:text-neutral-400'
                            }`}
                          >
                            {bit}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Hex 0 */}
                  <td className="py-1.5 px-2 font-bold text-cyan-400 tabular-nums">
                    0x{p0.toString(16).padStart(2, '0').toUpperCase()}
                  </td>

                  {/* Bitplane 1 Bits */}
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }).map((_, x) => {
                        const bit = (p1 >> (7 - x)) & 1;
                        return (
                          <button
                            key={x}
                            onClick={() => toggleBit(1, y, x)}
                            className={`w-4 h-4 flex items-center justify-center rounded text-[10px] cursor-pointer transition-colors ${
                              bit === 1
                                ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/50'
                                : 'bg-neutral-950 text-neutral-600 border border-neutral-800 hover:text-neutral-400'
                            }`}
                          >
                            {bit}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Hex 1 */}
                  <td className="py-1.5 px-2 font-bold text-purple-400 tabular-nums">
                    0x{p1.toString(16).padStart(2, '0').toUpperCase()}
                  </td>

                  {/* 2-bit values */}
                  <td className="py-1.5 px-2 text-[10px] text-neutral-400 font-mono tracking-widest">
                    {Array.from({ length: 8 })
                      .map((_, x) => ((currentTile[y] && currentTile[y][x]) || 0))
                      .join(' ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Raw 16 bytes strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
        <span className="font-mono text-neutral-400">16-Byte Tile Stream:</span>
        <div className="flex flex-wrap gap-1.5 font-mono">
          {Array.from(bytes).map((b, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                i < 8
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                  : 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
              }`}
            >
              {b.toString(16).padStart(2, '0').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
