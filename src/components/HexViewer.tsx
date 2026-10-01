import React, { useState } from 'react';
import { NesHeaderConfig, TilePixelGrid } from '../types/nes';
import { buildInesHeader, encodeTileTo2bpp } from '../utils/nesRom';
import { FAMOUS_MAPPERS } from '../constants/nesPalette';
import { Copy, Check } from 'lucide-react';

interface HexViewerProps {
  headerConfig: NesHeaderConfig;
  currentTile: TilePixelGrid;
  tileIndex: number;
}

export const HexViewer: React.FC<HexViewerProps> = ({
  headerConfig,
  currentTile,
  tileIndex
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const headerBytes = buildInesHeader(headerConfig);
  const tileBytes = encodeTileTo2bpp(currentTile);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const headerHex = Array.from(headerBytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  const tileHex = Array.from(tileBytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  const mapperInfo = FAMOUS_MAPPERS.find(m => m.id === headerConfig.mapper);

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full overflow-y-auto select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white font-sans">
            ROM Binary Structure &amp; Memory Layout
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <span>Hardware Memory Map</span>
            <span aria-hidden="true">·</span>
            <span>Cartridge Bus Decoding</span>
            <span aria-hidden="true">·</span>
            <span>Planar 2BPP Encoding</span>
          </div>
        </div>
      </div>

      {/* NES ROM Memory Map Diagram */}
      <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl flex flex-col gap-4">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Binary File Layout (.nes Cartridge Image)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          {/* Header block */}
          <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between text-red-400 font-bold">
              <span>iNES Header</span>
              <span>16 Bytes</span>
            </div>
            <span className="text-neutral-400 text-[11px]">Offset: 0x0000 - 0x000F</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Defines PRG size ({headerConfig.prgRomUnits * 16}KB), CHR size ({headerConfig.chrRomUnits * 8}KB), Mapper #{headerConfig.mapper}.
            </p>
          </div>

          {/* Trainer block (if any) */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1 ${
              headerConfig.trainer
                ? 'bg-purple-950/30 border-purple-800/60 text-purple-300'
                : 'bg-neutral-950 border-neutral-800/80 text-neutral-500 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>Trainer</span>
              <span>{headerConfig.trainer ? '512 Bytes' : 'None'}</span>
            </div>
            <span className="text-[11px]">
              {headerConfig.trainer ? 'Offset: 0x0010 - 0x020F' : 'Flag 6 Bit 2 disabled'}
            </span>
            <p className="text-[11px] mt-1">
              Copier RAM patch loaded to CPU $7000-$71FF.
            </p>
          </div>

          {/* PRG-ROM block */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>PRG-ROM</span>
              <span>{headerConfig.prgRomUnits * 16} KiB</span>
            </div>
            <span className="text-neutral-400 text-[11px]">
              Offset: 0x{headerConfig.trainer ? '0210' : '0010'} - 0x
              {(
                (headerConfig.trainer ? 512 : 0) +
                16 +
                headerConfig.prgRomUnits * 16384 -
                1
              )
                .toString(16)
                .toUpperCase()}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">
              6502 Machine Code, PPU Palettes ($3F00), Nametable ($2000), CPU Vectors ($FFFA-$FFFF).
            </p>
          </div>

          {/* CHR-ROM block */}
          <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span>CHR-ROM</span>
              <span>{headerConfig.chrRomUnits * 8} KiB</span>
            </div>
            <span className="text-neutral-400 text-[11px]">
              {headerConfig.chrRomUnits === 0
                ? 'CHR-RAM Board'
                : 'Appended directly after PRG'}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Contains the 512 8x8 tiles drawn in the editor encoded in 2bpp planar format.
            </p>
          </div>
        </div>
      </div>

      {/* Hex Dump Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 16-Byte Header Hex */}
        <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold text-white uppercase">
              16-Byte Header Hex Dump
            </span>
            <button
              onClick={() => copyToClipboard(headerHex, 'header')}
              className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-neutral-800 cursor-pointer"
            >
              {copied === 'header' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied === 'header' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg text-xs leading-relaxed text-red-400 font-bold tracking-widest break-all">
            {headerHex}
          </div>

          {/* Byte by byte breakdown table */}
          <div className="flex flex-col gap-1 text-[11px] text-neutral-400">
            <div className="flex justify-between">
              <span className="text-cyan-400">Bytes 0-3:</span>
              <span className="text-neutral-300">4E 45 53 1A ("NES\x1A")</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400">Byte 4 (PRG Units):</span>
              <span className="text-neutral-300">0x{headerBytes[4].toString(16).padStart(2, '0').toUpperCase()} ({headerConfig.prgRomUnits} × 16KB)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400">Byte 5 (CHR Units):</span>
              <span className="text-neutral-300">0x{headerBytes[5].toString(16).padStart(2, '0').toUpperCase()} ({headerConfig.chrRomUnits} × 8KB)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Byte 6 (Flags 6):</span>
              <span className="text-neutral-300">0x{headerBytes[6].toString(16).padStart(2, '0').toUpperCase()} (Mapper Low: {headerConfig.mapper & 0x0F}, {headerConfig.mirroring})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Byte 7 (Flags 7):</span>
              <span className="text-neutral-300">0x{headerBytes[7].toString(16).padStart(2, '0').toUpperCase()} (Mapper High: {(headerConfig.mapper >> 4) & 0x0F}, {headerConfig.format})</span>
            </div>
          </div>
        </div>

        {/* Current Tile 2BPP Hex */}
        <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold text-white uppercase">
              Tile #{tileIndex} 2BPP Planar Hex (16 Bytes)
            </span>
            <button
              onClick={() => copyToClipboard(tileHex, 'tile')}
              className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2 py-0.5 rounded bg-neutral-800 cursor-pointer"
            >
              {copied === 'tile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied === 'tile' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg text-xs leading-relaxed text-amber-400 font-bold tracking-widest break-all">
            {tileHex}
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-neutral-400">
            <div className="flex justify-between">
              <span className="text-cyan-400">Plane 0 (Bytes 0-7):</span>
              <span className="text-neutral-300">
                {Array.from(tileBytes.slice(0, 8))
                  .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                  .join(' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Plane 1 (Bytes 8-15):</span>
              <span className="text-neutral-300">
                {Array.from(tileBytes.slice(8, 16))
                  .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                  .join(' ')}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              NES PPU retrieves both bitplanes per scanline to calculate the 2-bit color index ($00-$03) for the background attribute table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
