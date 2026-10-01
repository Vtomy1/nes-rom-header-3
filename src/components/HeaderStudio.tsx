import React, { useState } from 'react';
import { NesHeaderConfig } from '../types/nes';
import { FAMOUS_MAPPERS } from '../constants/nesPalette';
import { buildInesHeader } from '../utils/nesRom';
import { Info, Check, Copy } from 'lucide-react';

interface HeaderStudioProps {
  headerConfig: NesHeaderConfig;
  setHeaderConfig: React.Dispatch<React.SetStateAction<NesHeaderConfig>>;
  activeTileCount: number;
}

export const HeaderStudio: React.FC<HeaderStudioProps> = ({
  headerConfig,
  setHeaderConfig,
  activeTileCount
}) => {
  const [selectedByteIndex, setSelectedByteIndex] = useState<number>(4);
  const [copied, setCopied] = useState<boolean>(false);

  const headerBytes = buildInesHeader(headerConfig);

  const byteLabels = [
    { index: 0, label: 'Magic 0', name: "'N' (0x4E)", desc: 'NES ROM signature identifier byte 1' },
    { index: 1, label: 'Magic 1', name: "'E' (0x45)", desc: 'NES ROM signature identifier byte 2' },
    { index: 2, label: 'Magic 2', name: "'S' (0x53)", desc: 'NES ROM signature identifier byte 3' },
    { index: 3, label: 'Magic 3', name: 'EOF (0x1A)', desc: 'MS-DOS End-Of-File marker' },
    { index: 4, label: 'PRG ROM', name: `${headerConfig.prgRomUnits} x 16KB`, desc: 'Size of PRG-ROM code in 16 KiB units' },
    { index: 5, label: 'CHR ROM', name: `${headerConfig.chrRomUnits} x 8KB`, desc: 'Size of CHR-ROM graphics in 8 KiB units (0 = CHR-RAM)' },
    { index: 6, label: 'Flags 6', name: 'Mapper Low & Flags', desc: 'Mirroring, Battery, Trainer, 4-Screen, Mapper D0..D3' },
    { index: 7, label: 'Flags 7', name: 'Mapper High & Mode', desc: 'VS Unisystem, PlayChoice, NES 2.0 identifier, Mapper D4..D7' },
    { index: 8, label: 'Flags 8', name: 'PRG-RAM / Submapper', desc: 'PRG RAM size in 8KB units (iNES) or Submapper (NES 2.0)' },
    { index: 9, label: 'Flags 9', name: 'TV System', desc: '0 = NTSC, 1 = PAL' },
    { index: 10, label: 'Flags 10', name: 'Flags 10 (Unofficial)', desc: 'TV system & PRG-RAM flags' },
    { index: 11, label: 'Pad 11', name: 'Reserved', desc: 'Zero padding byte' },
    { index: 12, label: 'Pad 12', name: 'Reserved', desc: 'Zero padding byte' },
    { index: 13, label: 'Pad 13', name: 'Reserved', desc: 'Zero padding byte' },
    { index: 14, label: 'Pad 14', name: 'Reserved', desc: 'Zero padding byte' },
    { index: 15, label: 'Pad 15', name: 'Reserved', desc: 'Zero padding byte' },
  ];

  const handleCopyHex = () => {
    const hex = Array.from(headerBytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentByteVal = headerBytes[selectedByteIndex];
  const bitsArray = [7, 6, 5, 4, 3, 2, 1, 0].map(bit => ((currentByteVal >> bit) & 1));

  const applyMapperPreset = (mapperId: number) => {
    if (mapperId === 0) {
      setHeaderConfig(prev => ({
        ...prev,
        mapper: 0,
        prgRomUnits: 2, // 32KB
        chrRomUnits: 1, // 8KB
        battery: false
      }));
    } else if (mapperId === 1) {
      setHeaderConfig(prev => ({
        ...prev,
        mapper: 1,
        prgRomUnits: 8, // 128KB
        chrRomUnits: 1, // 8KB
        battery: true
      }));
    } else if (mapperId === 2) {
      setHeaderConfig(prev => ({
        ...prev,
        mapper: 2,
        prgRomUnits: 8, // 128KB
        chrRomUnits: 0, // CHR-RAM
        battery: false
      }));
    } else if (mapperId === 4) {
      setHeaderConfig(prev => ({
        ...prev,
        mapper: 4,
        prgRomUnits: 16, // 256KB
        chrRomUnits: 16, // 128KB
        battery: true
      }));
    } else {
      setHeaderConfig(prev => ({
        ...prev,
        mapper: mapperId
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full overflow-y-auto">
      {/* Top Banner / Explanation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white font-sans">
            iNES &amp; NES 2.0 Header Architect
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <span>Standard 16-Byte Binary Precursor</span>
            <span aria-hidden="true">·</span>
            <span>Offset 0x0000 - 0x000F</span>
            <span aria-hidden="true">·</span>
            <span>Controls CPU &amp; PPU Mapping</span>
          </div>
        </div>

        <button
          onClick={handleCopyHex}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Hex' : 'Copy 16-Byte Hex'}</span>
        </button>
      </div>

      {/* 16-Byte Visual Hex Inspector Strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-neutral-300">Header Byte Ribbon (Click byte to inspect bitfields):</span>
          <span className="font-mono text-neutral-500">
            Selected: Byte {selectedByteIndex} (0x{selectedByteIndex.toString(16).toUpperCase()}) = 0x{currentByteVal.toString(16).padStart(2, '0').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5 p-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          {Array.from({ length: 16 }).map((_, i) => {
            const byteVal = headerBytes[i];
            const isSelected = selectedByteIndex === i;
            const isMagic = i < 4;
            const isPrg = i === 4;
            const isChr = i === 5;
            const isFlags = i === 6 || i === 7;

            return (
              <button
                key={i}
                onClick={() => setSelectedByteIndex(i)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500/50'
                    : 'bg-neutral-950/80 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300'
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-500">+{i.toString(16).toUpperCase()}</span>
                <span
                  className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                    isMagic
                      ? 'text-cyan-400'
                      : isPrg
                      ? 'text-emerald-400'
                      : isChr
                      ? 'text-amber-400'
                      : isFlags
                      ? 'text-purple-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {byteVal.toString(16).padStart(2, '0').toUpperCase()}
                </span>
                <span className="text-[9px] text-neutral-500 truncate max-w-full mt-1">
                  {i === 0 ? 'N' : i === 1 ? 'E' : i === 2 ? 'S' : i === 3 ? 'EOF' : i === 4 ? 'PRG' : i === 5 ? 'CHR' : i === 6 ? 'F6' : i === 7 ? 'F7' : `B${i}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Byte Detail & Bitfield Breakdown */}
      <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-800 text-white rounded">
              Byte {selectedByteIndex}
            </span>
            <span className="text-sm font-semibold text-white">
              {byteLabels[selectedByteIndex].name}
            </span>
          </div>
          <span className="text-xs text-neutral-400">
            {byteLabels[selectedByteIndex].desc}
          </span>
        </div>

        {/* 8 Bits visual representation */}
        <div className="grid grid-cols-8 gap-2">
          {bitsArray.map((bitVal, idx) => {
            const bitNum = 7 - idx;
            return (
              <div
                key={bitNum}
                className="flex flex-col items-center p-2 rounded-lg bg-neutral-950 border border-neutral-800"
              >
                <span className="text-[10px] font-mono text-neutral-500">Bit {bitNum}</span>
                <span
                  className={`text-base font-mono font-bold my-0.5 tabular-nums ${
                    bitVal === 1 ? 'text-red-400' : 'text-neutral-600'
                  }`}
                >
                  {bitVal}
                </span>
                <span className="text-[9px] text-neutral-400 text-center truncate w-full">
                  {selectedByteIndex === 6
                    ? bitNum === 0
                      ? 'Mirr'
                      : bitNum === 1
                      ? 'Batt'
                      : bitNum === 2
                      ? 'Train'
                      : bitNum === 3
                      ? '4Scr'
                      : `Map ${bitNum - 4}`
                    : selectedByteIndex === 7
                    ? bitNum === 0
                      ? 'VS'
                      : bitNum === 1
                      ? 'PC10'
                      : bitNum === 2 || bitNum === 3
                      ? 'NES2'
                      : `Map ${bitNum}`
                    : selectedByteIndex === 4
                    ? `16K ${bitNum}`
                    : selectedByteIndex === 5
                    ? `8K ${bitNum}`
                    : `b${bitNum}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Core ROM Sizing & Header Specs */}
        <div className="flex flex-col gap-5 p-5 bg-neutral-900/30 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <span className="text-sm font-semibold text-white">ROM Memory Geometry</span>
            <span className="text-xs font-mono text-neutral-400">Byte 4 &amp; Byte 5</span>
          </div>

          {/* PRG ROM Size */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-200">PRG-ROM Size (Program Code)</label>
              <span className="font-mono text-emerald-400 font-semibold">
                {headerConfig.prgRomUnits * 16} KiB ({headerConfig.prgRomUnits} bank{headerConfig.prgRomUnits > 1 ? 's' : ''})
              </span>
            </div>
            <select
              value={headerConfig.prgRomUnits}
              onChange={e => setHeaderConfig(p => ({ ...p, prgRomUnits: Number(e.target.value) }))}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-red-500 focus:outline-hidden"
            >
              <option value={1}>1 × 16 KiB = 16 KiB (NROM-128)</option>
              <option value={2}>2 × 16 KiB = 32 KiB (NROM-256 / Default)</option>
              <option value={4}>4 × 16 KiB = 64 KiB</option>
              <option value={8}>8 × 16 KiB = 128 KiB (MMC1 / UNROM)</option>
              <option value={16}>16 × 16 KiB = 256 KiB (MMC3)</option>
              <option value={32}>32 × 16 KiB = 512 KiB (Large MMC3 / MMC1)</option>
            </select>
            <p className="text-[11px] text-neutral-500">
              Allocated at CPU address $8000-$FFFF. The micro-engine runs from here.
            </p>
          </div>

          {/* CHR ROM Size */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-neutral-200">CHR-ROM Size (Tile Graphics)</label>
              <span className="font-mono text-amber-400 font-semibold">
                {headerConfig.chrRomUnits === 0 ? '0 KiB (CHR-RAM)' : `${headerConfig.chrRomUnits * 8} KiB (${headerConfig.chrRomUnits * 512} tiles)`}
              </span>
            </div>
            <select
              value={headerConfig.chrRomUnits}
              onChange={e => setHeaderConfig(p => ({ ...p, chrRomUnits: Number(e.target.value) }))}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-red-500 focus:outline-hidden"
            >
              <option value={0}>0 × 8 KiB = CHR-RAM (Board supplies 8KB RAM)</option>
              <option value={1}>1 × 8 KiB = 8 KiB (Standard 512 tiles / Default)</option>
              <option value={2}>2 × 8 KiB = 16 KiB (1024 tiles, CNROM/MMC1)</option>
              <option value={4}>4 × 8 KiB = 32 KiB (2048 tiles)</option>
              <option value={16}>16 × 8 KiB = 128 KiB (MMC3 bankswitched)</option>
            </select>
            <p className="text-[11px] text-neutral-500">
              Mapped into PPU address $0000-$1FFF (Pattern Tables 0 and 1). Current drawer holds {activeTileCount} tiles.
            </p>
          </div>

          {/* Format Spec */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
            <label className="text-xs font-medium text-neutral-200">Header Format Standard</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHeaderConfig(p => ({ ...p, format: 'iNES' }))}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  headerConfig.format === 'iNES'
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                iNES 1.0 (Classic)
              </button>
              <button
                type="button"
                onClick={() => setHeaderConfig(p => ({ ...p, format: 'NES2.0' }))}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  headerConfig.format === 'NES2.0'
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                NES 2.0 (Modern)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Flags, Mirroring & Hardware */}
        <div className="flex flex-col gap-5 p-5 bg-neutral-900/30 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <span className="text-sm font-semibold text-white">PPU &amp; Cartridge Flags</span>
            <span className="text-xs font-mono text-neutral-400">Byte 6 &amp; Byte 7</span>
          </div>

          {/* Mirroring */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-200">Nametable Mirroring</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHeaderConfig(p => ({ ...p, mirroring: 'horizontal' }))}
                className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  headerConfig.mirroring === 'horizontal'
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                Horizontal (Vertical Scroll)
              </button>
              <button
                type="button"
                onClick={() => setHeaderConfig(p => ({ ...p, mirroring: 'vertical' }))}
                className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  headerConfig.mirroring === 'vertical'
                    ? 'bg-neutral-800 text-white border-neutral-700'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                Vertical (Horizontal Scroll)
              </button>
            </div>
          </div>

          {/* Hardware Feature Checkboxes */}
          <div className="flex flex-col gap-2.5 pt-1">
            <label className="text-xs font-medium text-neutral-200">Hardware Features</label>

            <label className="flex items-center gap-3 p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-900/60 transition-colors">
              <input
                type="checkbox"
                checked={headerConfig.battery}
                onChange={e => setHeaderConfig(p => ({ ...p, battery: e.target.checked }))}
                className="w-4 h-4 rounded text-red-600 accent-red-600 bg-neutral-900 border-neutral-700"
              />
              <div className="flex flex-col text-xs">
                <span className="font-medium text-neutral-200">Battery-Backed PRG-RAM</span>
                <span className="text-neutral-500 text-[11px]">Saves game state to $6000-$7FFF (Zelda style)</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-900/60 transition-colors">
              <input
                type="checkbox"
                checked={headerConfig.trainer}
                onChange={e => setHeaderConfig(p => ({ ...p, trainer: e.target.checked }))}
                className="w-4 h-4 rounded text-red-600 accent-red-600 bg-neutral-900 border-neutral-700"
              />
              <div className="flex flex-col text-xs">
                <span className="font-medium text-neutral-200">512-Byte Trainer</span>
                <span className="text-neutral-500 text-[11px]">Prepends 512 bytes before PRG-ROM (copier hack header)</span>
              </div>
            </label>

            <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
              <span className="text-neutral-300">TV System Target</span>
              <div className="flex items-center gap-1">
                {(['ntsc', 'pal'] as const).map(sys => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setHeaderConfig(p => ({ ...p, tvSystem: sys }))}
                    className={`px-2.5 py-1 text-xs font-mono rounded uppercase transition-colors cursor-pointer ${
                      headerConfig.tvSystem === sys
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapper Selection & Presets */}
      <div className="p-5 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Memory Management Controller (Mapper #{headerConfig.mapper})</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select an authentic NES mapper ASIC or discrete logic configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Custom ID:</span>
            <input
              type="number"
              min={0}
              max={255}
              value={headerConfig.mapper}
              onChange={e => setHeaderConfig(p => ({ ...p, mapper: Math.max(0, Math.min(255, Number(e.target.value))) }))}
              className="w-16 px-2 py-1 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded text-white text-center focus:border-red-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Mapper Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FAMOUS_MAPPERS.map(m => {
            const isCurrent = headerConfig.mapper === m.id;
            return (
              <button
                key={m.id}
                onClick={() => applyMapperPreset(m.id)}
                className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-neutral-800/90 border-red-500/70 ring-1 ring-red-500/40'
                    : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white font-mono">
                    Mapper #{m.id} : {m.name}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">{m.chip}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                  {m.description}
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-2.5 text-[10px] text-neutral-500 font-mono">
                  <span>{m.notableGames.slice(0, 3).join(' · ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
