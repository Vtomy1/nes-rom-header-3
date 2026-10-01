import React, { useState } from 'react';
import {
  NesHeaderConfig,
  PaletteSet,
  TilePixelGrid
} from '../types/nes';
import {
  compileFullNesRom,
  buildChrRom,
  buildInesHeader,
  generateCHeader,
  generateAsmHeader,
  parseInesHeader,
  decode2bppToTile
} from '../utils/nesRom';
import { X, Download, FileCode, Check, Copy, Upload, AlertCircle } from 'lucide-react';

interface RomExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  headerConfig: NesHeaderConfig;
  setHeaderConfig: React.Dispatch<React.SetStateAction<NesHeaderConfig>>;
  palettes: PaletteSet;
  tiles: TilePixelGrid[];
  setTiles: React.Dispatch<React.SetStateAction<TilePixelGrid[]>>;
  screenTiles: number[][];
  screenAttributes: number[][];
}

export const RomExportModal: React.FC<RomExportModalProps> = ({
  isOpen,
  onClose,
  mode,
  headerConfig,
  setHeaderConfig,
  palettes,
  tiles,
  setTiles,
  screenTiles,
  screenAttributes
}) => {
  const [activeExportFormat, setActiveExportFormat] = useState<'nes' | 'chr' | 'c' | 'asm'>('nes');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const inesBytes = buildInesHeader(headerConfig);

  // Trigger download of .nes ROM
  const handleDownloadNesRom = () => {
    const romBytes = compileFullNesRom(
      headerConfig,
      palettes,
      tiles,
      screenTiles,
      screenAttributes
    );
    const blob = new Blob([romBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nes_game_mapper${headerConfig.mapper}.nes`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger download of raw .chr
  const handleDownloadChrRom = () => {
    const chrBytes = buildChrRom(tiles);
    const blob = new Blob([chrBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphics.chr';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Copy of code formats
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = new Uint8Array(evt.target?.result as ArrayBuffer);
        const parsedHeader = parseInesHeader(buffer);
        if (!parsedHeader) {
          setImportError('Invalid NES ROM: Missing standard "NES\\x1A" 16-byte header signature.');
          return;
        }

        setHeaderConfig(parsedHeader);

        // Check if CHR-ROM is present
        const hasTrainer = parsedHeader.trainer;
        const prgBytes = parsedHeader.prgRomUnits * 16384;
        const chrOffset = 16 + (hasTrainer ? 512 : 0) + prgBytes;
        const chrBytes = parsedHeader.chrRomUnits * 8192;

        if (parsedHeader.chrRomUnits > 0 && buffer.length >= chrOffset + 16) {
          const newTiles: TilePixelGrid[] = [];
          const tilesCount = Math.min(512, Math.floor(chrBytes / 16));

          for (let i = 0; i < tilesCount; i++) {
            const tile = decode2bppToTile(buffer, chrOffset + i * 16);
            newTiles.push(tile);
          }

          while (newTiles.length < 512) {
            newTiles.push(Array.from({ length: 8 }, () => Array(8).fill(0)));
          }

          setTiles(newTiles);
          setImportSuccess(
            `Successfully imported ROM! Header: Mapper #${parsedHeader.mapper} (${parsedHeader.format}), PRG: ${parsedHeader.prgRomUnits * 16}KB, CHR: ${parsedHeader.chrRomUnits * 8}KB (${tilesCount} tiles extracted into drawer).`
          );
        } else {
          setImportSuccess(
            `Parsed Header: Mapper #${parsedHeader.mapper} (${parsedHeader.format}), PRG: ${parsedHeader.prgRomUnits * 16}KB. (No CHR-ROM bank in file, uses CHR-RAM).`
          );
        }
      } catch (err: any) {
        setImportError(`Failed to parse ROM: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <h3 className="text-base font-semibold text-white font-sans">
              {mode === 'export' ? 'Export NES ROM & Header' : 'Import & Inspect NES ROM'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {mode === 'export' ? (
            <>
              {/* Export format tabs */}
              <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setActiveExportFormat('nes')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeExportFormat === 'nes'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Playable .nes ROM
                </button>
                <button
                  onClick={() => setActiveExportFormat('chr')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeExportFormat === 'chr'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Raw 8KB CHR-ROM (.chr)
                </button>
                <button
                  onClick={() => setActiveExportFormat('c')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeExportFormat === 'c'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  C Header Array
                </button>
                <button
                  onClick={() => setActiveExportFormat('asm')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeExportFormat === 'asm'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  6502 ASM Header
                </button>
              </div>

              {/* Format description and action */}
              {activeExportFormat === 'nes' && (
                <div className="flex flex-col gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">Full Playable NES Cartridge ROM</span>
                    <p className="text-xs text-neutral-400">
                      Packages the 16-byte iNES header, the complete 6502 assembly boot engine (NROM), and your drawn CHR-ROM tiles into a binary ready to play in Mesen, FCEUX, Nestopia, or EverDrive flash carts.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-900/60 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-neutral-500">Header:</span>
                      <div className="text-white font-bold">16 Bytes</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">PRG-ROM:</span>
                      <div className="text-emerald-400 font-bold">{headerConfig.prgRomUnits * 16} KiB</div>
                    </div>
                    <div>
                      <span className="text-neutral-500">CHR-ROM:</span>
                      <div className="text-amber-400 font-bold">{headerConfig.chrRomUnits * 8} KiB</div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadNesRom}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .nes File</span>
                  </button>
                </div>
              )}

              {activeExportFormat === 'chr' && (
                <div className="flex flex-col gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">Raw 8KB Pattern Table CHR Binary</span>
                    <p className="text-xs text-neutral-400">
                      Extracts exactly 8192 bytes representing all 512 8x8 tiles in 2bpp planar format for use in NES homebrew toolchains (cc65, ASM6, NESLib, NESicide).
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadChrRom}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl text-sm border border-neutral-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download graphics.chr (8,192 bytes)</span>
                  </button>
                </div>
              )}

              {activeExportFormat === 'c' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-400">C / C++ Array Declaration:</span>
                    <button
                      onClick={() => handleCopyCode(generateCHeader(inesBytes))}
                      className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                    {generateCHeader(inesBytes)}
                  </pre>
                </div>
              )}

              {activeExportFormat === 'asm' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-400">ca65 / NESASM Assembly Directive:</span>
                    <button
                      onClick={() => handleCopyCode(generateAsmHeader(inesBytes))}
                      className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-800 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-cyan-400 overflow-x-auto">
                    {generateAsmHeader(inesBytes)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            /* Import mode */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-2xl bg-neutral-950 text-center transition-colors">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm font-medium text-white mb-1">
                  Select or Drag &amp; Drop an NES ROM (.nes)
                </span>
                <span className="text-xs text-neutral-500 mb-4">
                  Parses the 16-byte header and extracts all CHR graphics tiles directly into the drawer
                </span>
                <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors border border-neutral-700">
                  <span>Browse .nes File</span>
                  <input
                    type="file"
                    accept=".nes"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
