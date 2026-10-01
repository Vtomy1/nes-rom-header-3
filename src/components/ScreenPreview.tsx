import React, { useRef, useEffect, useState } from 'react';
import { TilePixelGrid, PaletteSet, NesHeaderConfig } from '../types/nes';
import { NES_MASTER_PALETTE } from '../constants/nesPalette';
import { Tv, Sparkles, Sliders, Maximize2 } from 'lucide-react';

interface ScreenPreviewProps {
  tiles: TilePixelGrid[];
  screenTiles: number[][]; // 30 rows x 32 cols
  setScreenTiles: React.Dispatch<React.SetStateAction<number[][]>>;
  screenAttributes: number[][]; // 8 rows x 8 cols
  palettes: PaletteSet;
  headerConfig: NesHeaderConfig;
  selectedTileIndex: number;
}

export const ScreenPreview: React.FC<ScreenPreviewProps> = ({
  tiles,
  screenTiles,
  setScreenTiles,
  screenAttributes,
  palettes,
  headerConfig,
  selectedTileIndex
}) => {
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [stampMode, setStampMode] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(2); // 1x or 2x
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render 256x240 NES screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(256, 240);
    const data = imgData.data;

    // Build RGBA lookup for all 4 background palettes
    const bgRgba = palettes.bgPalettes.map(pal =>
      pal.map(nesIdx => {
        const hex = NES_MASTER_PALETTE[nesIdx].hex;
        return [
          parseInt(hex.slice(1, 3), 16),
          parseInt(hex.slice(3, 5), 16),
          parseInt(hex.slice(5, 7), 16),
          255
        ];
      })
    );

    // Render 30 rows of 32 tiles
    for (let r = 0; r < 30; r++) {
      for (let c = 0; c < 32; c++) {
        const tileIdx = (screenTiles[r] && screenTiles[r][c]) || 0;
        const tile = tiles[tileIdx] || Array.from({ length: 8 }, () => Array(8).fill(0));

        // Determine palette for this 2x2 tile group from attribute table
        // Attribute table covers 4x4 tile blocks (32x32 pixels), each byte has 4 2-bit values for 2x2 tile sub-blocks
        const attrRow = Math.floor(r / 4);
        const attrCol = Math.floor(c / 4);
        const attrByte = (screenAttributes[attrRow] && screenAttributes[attrRow][attrCol]) || 0;

        // Sub-block inside 4x4:
        const subRow = Math.floor((r % 4) / 2); // 0 or 1
        const subCol = Math.floor((c % 4) / 2); // 0 or 1
        const shift = (subRow * 2 + subCol) * 2;
        const palIndex = (attrByte >> shift) & 0x03;

        const tileRgba = bgRgba[palIndex] || bgRgba[0];

        const baseX = c * 8;
        const baseY = r * 8;

        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const colorIdx = (tile[y] && tile[y][x]) || 0;
            const [red, green, blue, alpha] = tileRgba[colorIdx];
            const px = baseX + x;
            const py = baseY + y;
            const offset = (py * 256 + px) * 4;
            data[offset] = red;
            data[offset + 1] = green;
            data[offset + 2] = blue;
            data[offset + 3] = alpha;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [tiles, screenTiles, screenAttributes, palettes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!stampMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 32));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 30));

    if (x >= 0 && x < 32 && y >= 0 && y < 30) {
      setScreenTiles(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = selectedTileIndex;
        return next;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start gap-4 p-6 w-full max-w-6xl mx-auto overflow-y-auto">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white font-sans">
            NES PPU Screen &amp; CRT Simulator
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <span>256 × 240 Native Resolution</span>
            <span aria-hidden="true">·</span>
            <span>32 × 30 Tiles Nametable ($2000)</span>
            <span aria-hidden="true">·</span>
            <span>60 Hz NTSC Video Timing</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStampMode(!stampMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              stampMode
                ? 'bg-red-600 text-white border-red-500 shadow-xs'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
          >
            {stampMode ? `Stamping Tile #${selectedTileIndex}` : 'Click to Stamp Tiles'}
          </button>

          <button
            onClick={() => setCrtFilter(!crtFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              crtFilter
                ? 'bg-neutral-800 text-cyan-400 border-neutral-700'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CRT Scanlines</span>
          </button>

          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setScale(1)}
              className={`px-2 py-1 rounded cursor-pointer ${
                scale === 1 ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              1×
            </button>
            <button
              onClick={() => setScale(2)}
              className={`px-2 py-1 rounded cursor-pointer ${
                scale === 2 ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              2×
            </button>
          </div>
        </div>
      </div>

      {/* Screen Frame with CRT Chassis */}
      <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-900 border-4 border-neutral-800 rounded-2xl shadow-2xl">
        <div
          style={{
            width: `${256 * scale}px`,
            height: `${240 * scale}px`,
            maxWidth: '100%'
          }}
          className="relative bg-black rounded-lg overflow-hidden border border-neutral-700 shadow-inner"
        >
          <canvas
            ref={canvasRef}
            width={256}
            height={240}
            onClick={handleCanvasClick}
            className={`w-full h-full pixelated ${stampMode ? 'cursor-cell' : 'cursor-default'}`}
          />

          {/* CRT scanline and bloom overlay */}
          {crtFilter && <div className="absolute inset-0 crt-overlay pointer-events-none" />}
        </div>

        {/* Retro hardware badges below screen */}
        <div className="flex items-center justify-between w-full mt-3 px-2 text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="text-neutral-400">PPU STATUS: ACTIVE</span>
          </div>
          <div>
            <span>MAPPER #{headerConfig.mapper} · {headerConfig.mirroring.toUpperCase()} MIRRORING</span>
          </div>
          <div>
            <span>PRG: {headerConfig.prgRomUnits * 16}KB · CHR: {headerConfig.chrRomUnits * 8}KB</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl max-w-xl text-center text-xs text-neutral-400">
        <p>
          This screen reflects the exact VRAM Nametable ($2000) that our synthesized 6502 assembly PRG-ROM writes during boot.
          When exported to <span className="font-mono text-neutral-300">.nes</span>, this exact scene will render on hardware or any NES emulator!
        </p>
      </div>
    </div>
  );
};
