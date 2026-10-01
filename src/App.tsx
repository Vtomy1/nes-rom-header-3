import React, { useState, useEffect, useCallback } from 'react';
import {
  NesHeaderConfig,
  PaletteSet,
  TilePixelGrid,
  DrawTool
} from './types/nes';
import {
  DEFAULT_PALETTES,
  buildInitialTileBank,
  buildDefaultScreenTiles,
  buildDefaultAttributes,
  createEmptyTile
} from './constants/presets';
import { FAMOUS_MAPPERS } from './constants/nesPalette';
import { HeaderBar } from './components/HeaderBar';
import { HeaderStudio } from './components/HeaderStudio';
import { PixelCanvas } from './components/PixelCanvas';
import { ToolBar } from './components/ToolBar';
import { PalettePicker } from './components/PalettePicker';
import { TileBank } from './components/TileBank';
import { BitplaneInspector } from './components/BitplaneInspector';
import { ScreenPreview } from './components/ScreenPreview';
import { HexViewer } from './components/HexViewer';
import { RomExportModal } from './components/RomExportModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'drawer' | 'header' | 'preview' | 'hex'>('drawer');

  // NES Cartridge Header State
  const [headerConfig, setHeaderConfig] = useState<NesHeaderConfig>({
    prgRomUnits: 2, // 32KB PRG-ROM (NROM-256)
    chrRomUnits: 1, // 8KB CHR-ROM (512 tiles)
    mapper: 0,      // NROM
    mirroring: 'horizontal',
    battery: false,
    trainer: false,
    format: 'iNES',
    vsSystem: false,
    playChoice: false,
    submapper: 0,
    prgRamUnits: 0,
    tvSystem: 'ntsc'
  });

  // Palette State
  const [palettes, setPalettes] = useState<PaletteSet>(DEFAULT_PALETTES);
  const [activeSubpaletteType, setActiveSubpaletteType] = useState<'bg' | 'sprite'>('bg');
  const [activeSubpaletteIndex, setActiveSubpaletteIndex] = useState<number>(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(1);

  // CHR Tiles State (512 tiles for 8KB CHR-ROM)
  const [tiles, setTiles] = useState<TilePixelGrid[]>(() => buildInitialTileBank());
  const [selectedTileIndex, setSelectedTileIndex] = useState<number>(1); // Brick tile default

  // Nametable Screen State (30 rows x 32 columns)
  const [screenTiles, setScreenTiles] = useState<number[][]>(() => buildDefaultScreenTiles());
  const [screenAttributes, setScreenAttributes] = useState<number[][]>(() => buildDefaultAttributes());

  // Drawing Tools State
  const [currentTool, setCurrentTool] = useState<DrawTool>('pencil');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(28);

  // Undo / Redo history for current tile
  const [undoStack, setUndoStack] = useState<TilePixelGrid[]>([]);
  const [redoStack, setRedoStack] = useState<TilePixelGrid[]>([]);
  const [copiedTile, setCopiedTile] = useState<TilePixelGrid | null>(null);

  // Export / Import Modal
  const [modalMode, setModalMode] = useState<'export' | 'import' | null>(null);

  const currentTile = tiles[selectedTileIndex] || createEmptyTile();

  const activeSubpalette =
    activeSubpaletteType === 'bg'
      ? palettes.bgPalettes[activeSubpaletteIndex]
      : palettes.spritePalettes[activeSubpaletteIndex];

  // Tile Modification with Undo tracking
  const handleTileChange = useCallback((newGrid: TilePixelGrid) => {
    setUndoStack(prev => [...prev.slice(-30), currentTile]);
    setRedoStack([]);
    setTiles(prev => {
      const next = [...prev];
      next[selectedTileIndex] = newGrid;
      return next;
    });
  }, [currentTile, selectedTileIndex]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentTile]);
    setTiles(prev => {
      const next = [...prev];
      next[selectedTileIndex] = previous;
      return next;
    });
  }, [undoStack, currentTile, selectedTileIndex]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentTile]);
    setTiles(prev => {
      const updated = [...prev];
      updated[selectedTileIndex] = next;
      return updated;
    });
  }, [redoStack, currentTile, selectedTileIndex]);

  // Flip Horizontal
  const handleFlipH = () => {
    const flipped = currentTile.map(row => [...row].reverse());
    handleTileChange(flipped);
  };

  // Flip Vertical
  const handleFlipV = () => {
    const flipped = [...currentTile].reverse().map(row => [...row]);
    handleTileChange(flipped);
  };

  // Shift Tile
  const handleShift = (dx: number, dy: number) => {
    const shifted = Array.from({ length: 8 }, () => Array(8).fill(0));
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const ny = (y + dy + 8) % 8;
        const nx = (x + dx + 8) % 8;
        shifted[ny][nx] = currentTile[y][x];
      }
    }
    handleTileChange(shifted);
  };

  // Clear Tile
  const handleClear = () => {
    handleTileChange(createEmptyTile());
  };

  // Copy / Paste Tile
  const handleCopyTile = () => {
    setCopiedTile(currentTile.map(r => [...r]));
  };

  const handlePasteTile = () => {
    if (!copiedTile) return;
    handleTileChange(copiedTile.map(r => [...r]));
  };

  // Reset undo stack when switching tiles
  useEffect(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, [selectedTileIndex]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === '1') {
        setSelectedColorIndex(0);
      } else if (e.key === '2') {
        setSelectedColorIndex(1);
      } else if (e.key === '3') {
        setSelectedColorIndex(2);
      } else if (e.key === '4') {
        setSelectedColorIndex(3);
      } else if (e.key.toLowerCase() === 'p') {
        setCurrentTool('pencil');
      } else if (e.key.toLowerCase() === 'b') {
        setCurrentTool('brush');
      } else if (e.key.toLowerCase() === 'g') {
        setCurrentTool('bucket');
      } else if (e.key.toLowerCase() === 'e') {
        setCurrentTool('eraser');
      } else if (e.key.toLowerCase() === 'i') {
        setCurrentTool('picker');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const currentMapper = FAMOUS_MAPPERS.find(m => m.id === headerConfig.mapper);
  const mapperDisplay = `Mapper #${headerConfig.mapper} (${currentMapper?.name || 'Custom'})`;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <HeaderBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportClick={() => setModalMode('export')}
        onImportClick={() => setModalMode('import')}
        mapperName={mapperDisplay}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'drawer' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 max-w-(--breakpoint-2xl) mx-auto w-full overflow-y-auto">
            {/* Left Column: Pixel Canvas & Drawing Controls (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <ToolBar
                currentTool={currentTool}
                setCurrentTool={setCurrentTool}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                zoom={zoom}
                setZoom={setZoom}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                onClear={handleClear}
                onFlipH={handleFlipH}
                onFlipV={handleFlipV}
                onShift={handleShift}
              />

              <div className="flex-1 flex items-center justify-center p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl min-h-[340px]">
                <PixelCanvas
                  currentTile={currentTile}
                  onTileChange={handleTileChange}
                  activeSubpalette={activeSubpalette}
                  currentTool={currentTool}
                  selectedColorIndex={selectedColorIndex}
                  setSelectedColorIndex={setSelectedColorIndex}
                  showGrid={showGrid}
                  zoom={zoom}
                />
              </div>

              {/* Quick Navigation to other views */}
              <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-400">
                <span>Active Target: iNES 16B Header + CHR-ROM</span>
                <button
                  onClick={() => setActiveTab('header')}
                  className="text-red-400 hover:text-red-300 font-mono font-medium hover:underline cursor-pointer"
                >
                  Configure Header →
                </button>
              </div>
            </div>

            {/* Center Column: Tile Bank & 2BPP Bitplane Visualizer (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <TileBank
                tiles={tiles}
                selectedTileIndex={selectedTileIndex}
                setSelectedTileIndex={setSelectedTileIndex}
                activeSubpalette={activeSubpalette}
                onCopyTile={handleCopyTile}
                onPasteTile={handlePasteTile}
                hasCopiedTile={copiedTile !== null}
              />

              <BitplaneInspector
                currentTile={currentTile}
                setCurrentTile={handleTileChange}
                activeSubpalette={activeSubpalette}
                tileIndex={selectedTileIndex}
              />
            </div>

            {/* Right Column: NES Palettes (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <PalettePicker
                palettes={palettes}
                setPalettes={setPalettes}
                activeSubpaletteType={activeSubpaletteType}
                setActiveSubpaletteType={setActiveSubpaletteType}
                activeSubpaletteIndex={activeSubpaletteIndex}
                setActiveSubpaletteIndex={setActiveSubpaletteIndex}
                selectedColorIndex={selectedColorIndex}
                setSelectedColorIndex={setSelectedColorIndex}
              />

              {/* Quick Summary Card */}
              <div className="p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col gap-2.5 text-xs">
                <span className="font-semibold text-white">NES Graphics Architecture</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Every 8×8 tile is encoded as two 8-byte bitplanes (Plane 0 and Plane 1) totalling 16 bytes.
                  The 2-bit value selects one of 4 colors in the tile's active subpalette, mapped through the NES master 64-color palette generator.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500">
                  <span>8KB CHR: 512 TILES</span>
                  <span>16B / TILE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'header' && (
          <HeaderStudio
            headerConfig={headerConfig}
            setHeaderConfig={setHeaderConfig}
            activeTileCount={tiles.length}
          />
        )}

        {activeTab === 'preview' && (
          <ScreenPreview
            tiles={tiles}
            screenTiles={screenTiles}
            setScreenTiles={setScreenTiles}
            screenAttributes={screenAttributes}
            palettes={palettes}
            headerConfig={headerConfig}
            selectedTileIndex={selectedTileIndex}
          />
        )}

        {activeTab === 'hex' && (
          <HexViewer
            headerConfig={headerConfig}
            currentTile={currentTile}
            tileIndex={selectedTileIndex}
          />
        )}
      </main>

      {/* Export / Import Modal */}
      <RomExportModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        mode={modalMode || 'export'}
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfig}
        palettes={palettes}
        tiles={tiles}
        setTiles={setTiles}
        screenTiles={screenTiles}
        screenAttributes={screenAttributes}
      />
    </div>
  );
}
