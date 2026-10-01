import React, { useState } from 'react';
import { PaletteSet } from '../types/nes';
import { NES_MASTER_PALETTE } from '../constants/nesPalette';

interface PalettePickerProps {
  palettes: PaletteSet;
  setPalettes: React.Dispatch<React.SetStateAction<PaletteSet>>;
  activeSubpaletteType: 'bg' | 'sprite';
  setActiveSubpaletteType: (t: 'bg' | 'sprite') => void;
  activeSubpaletteIndex: number;
  setActiveSubpaletteIndex: (idx: number) => void;
  selectedColorIndex: number; // 0, 1, 2, or 3
  setSelectedColorIndex: (idx: number) => void;
}

export const PalettePicker: React.FC<PalettePickerProps> = ({
  palettes,
  setPalettes,
  activeSubpaletteType,
  setActiveSubpaletteType,
  activeSubpaletteIndex,
  setActiveSubpaletteIndex,
  selectedColorIndex,
  setSelectedColorIndex
}) => {
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const currentSubpalette =
    activeSubpaletteType === 'bg'
      ? palettes.bgPalettes[activeSubpaletteIndex]
      : palettes.spritePalettes[activeSubpaletteIndex];

  const handleSelectMasterColor = (nesIndex: number) => {
    if (editingSlot === null) return;

    if (editingSlot === 0) {
      // Backdrop color is shared across all palettes in standard NES PPU
      setPalettes(prev => ({
        ...prev,
        backdrop: nesIndex,
        bgPalettes: prev.bgPalettes.map(pal => [nesIndex, pal[1], pal[2], pal[3]]) as any,
        spritePalettes: prev.spritePalettes.map(pal => [nesIndex, pal[1], pal[2], pal[3]]) as any
      }));
    } else {
      setPalettes(prev => {
        if (activeSubpaletteType === 'bg') {
          const nextBg = [...prev.bgPalettes] as any;
          const current = [...nextBg[activeSubpaletteIndex]];
          current[editingSlot] = nesIndex;
          nextBg[activeSubpaletteIndex] = current;
          return { ...prev, bgPalettes: nextBg };
        } else {
          const nextSp = [...prev.spritePalettes] as any;
          const current = [...nextSp[activeSubpaletteIndex]];
          current[editingSlot] = nesIndex;
          nextSp[activeSubpaletteIndex] = current;
          return { ...prev, spritePalettes: nextSp };
        }
      });
    }

    setEditingSlot(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl select-none">
      {/* Header and Subpalette Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            NES PPU Palettes
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            $3F00 - $3F1F (4 Colors / Tile)
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => {
              setActiveSubpaletteType('bg');
              setActiveSubpaletteIndex(0);
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubpaletteType === 'bg'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Background (BG 0-3)
          </button>
          <button
            onClick={() => {
              setActiveSubpaletteType('sprite');
              setActiveSubpaletteIndex(0);
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubpaletteType === 'sprite'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sprites (SP 0-3)
          </button>
        </div>
      </div>

      {/* Subpalettes Row (0, 1, 2, 3) */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map(palIdx => {
          const pal =
            activeSubpaletteType === 'bg'
              ? palettes.bgPalettes[palIdx]
              : palettes.spritePalettes[palIdx];
          const isSelected = activeSubpaletteIndex === palIdx;

          return (
            <button
              key={palIdx}
              onClick={() => setActiveSubpaletteIndex(palIdx)}
              className={`flex flex-col items-start p-2 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 border-red-500/80 ring-1 ring-red-500/40'
                  : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <span className="text-[10px] font-mono text-neutral-400 mb-1">
                {activeSubpaletteType.toUpperCase()} {palIdx}
              </span>
              <div className="flex w-full h-5 rounded overflow-hidden border border-neutral-900">
                {pal.map((cIdx, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: NES_MASTER_PALETTE[cIdx].hex }}
                    className="flex-1 h-full"
                    title={`Slot ${i}: $${cIdx.toString(16).padStart(2, '0').toUpperCase()} ${NES_MASTER_PALETTE[cIdx].name}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subpalette 4 Slots (0, 1, 2, 3) with Drawing Selection */}
      <div className="flex flex-col gap-2 p-3 bg-neutral-950/80 border border-neutral-800/90 rounded-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300 font-medium">
            Active Drawing Pen Color:
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            Click swatch to draw · Double-click or click edit to reassign NES hardware color
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {currentSubpalette.map((nesIdx, slotIdx) => {
            const isPenSelected = selectedColorIndex === slotIdx;
            const isEditing = editingSlot === slotIdx;
            const colorDef = NES_MASTER_PALETTE[nesIdx];

            return (
              <div
                key={slotIdx}
                className={`flex flex-col p-2 rounded-lg border transition-all ${
                  isPenSelected
                    ? 'bg-neutral-800 border-red-500 ring-1 ring-red-500/50'
                    : 'bg-neutral-900/60 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => setSelectedColorIndex(slotIdx)}
                    className="flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span className="text-[10px] font-mono font-bold text-neutral-300">
                      Color #{slotIdx}
                    </span>
                    {slotIdx === 0 && (
                      <span className="text-[9px] text-neutral-500 font-mono">
                        (Backdrop)
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setEditingSlot(isEditing ? null : slotIdx)}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer"
                  >
                    {isEditing ? 'Close' : 'Change'}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedColorIndex(slotIdx)}
                  style={{ backgroundColor: colorDef.hex }}
                  className="w-full h-8 rounded border border-black/30 shadow-inner flex items-center justify-center font-mono text-xs font-bold text-white drop-shadow cursor-pointer"
                >
                  ${nesIdx.toString(16).padStart(2, '0').toUpperCase()}
                </button>

                <span className="text-[10px] text-neutral-400 truncate mt-1">
                  {colorDef.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 64-Color Master Palette Modal / Popover if editing a slot */}
      {editingSlot !== null && (
        <div className="p-3 bg-neutral-950 border border-red-500/50 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Pick Color for Color Slot #{editingSlot} (Current: ${currentSubpalette[editingSlot].toString(16).padStart(2, '0').toUpperCase()})
            </span>
            <button
              onClick={() => setEditingSlot(null)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-16 gap-1 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            {NES_MASTER_PALETTE.map(col => (
              <button
                key={col.index}
                onClick={() => handleSelectMasterColor(col.index)}
                style={{ backgroundColor: col.hex }}
                title={`$${col.index.toString(16).padStart(2, '0').toUpperCase()}: ${col.name}`}
                className="w-full aspect-square rounded-xs hover:scale-125 hover:z-10 transition-transform cursor-pointer border border-black/30 focus:outline-hidden"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
