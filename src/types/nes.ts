export type MirroringType = 'horizontal' | 'vertical' | 'four-screen' | 'single';
export type TvSystemType = 'ntsc' | 'pal' | 'dual';
export type HeaderFormat = 'iNES' | 'NES2.0';

export interface NesHeaderConfig {
  prgRomUnits: number;      // in 16KB units (1 = 16KB, 2 = 32KB, etc.)
  chrRomUnits: number;      // in 8KB units (0 = CHR-RAM, 1 = 8KB, 2 = 16KB)
  mapper: number;           // 0 to 255 (or up to 4095 in NES 2.0)
  mirroring: MirroringType; // Bit 0 & Bit 3 of Byte 6
  battery: boolean;         // Bit 1 of Byte 6: battery-backed RAM at $6000-$7FFF
  trainer: boolean;         // Bit 2 of Byte 6: 512-byte trainer at $7000-$71FF
  format: HeaderFormat;     // iNES vs NES 2.0
  vsSystem: boolean;        // Bit 0 of Byte 7
  playChoice: boolean;      // Bit 1 of Byte 7
  submapper: number;        // Bits 4-7 of Byte 8 in NES 2.0
  prgRamUnits: number;      // Byte 8 in iNES (8KB units) or NES 2.0 PRG-RAM shift
  tvSystem: TvSystemType;   // Byte 9 in iNES (0=NTSC, 1=PAL)
}

export interface NesPaletteColor {
  index: number;            // 0x00 - 0x3F (0-63)
  hex: string;              // RGB hex string, e.g. "#545454"
  name: string;             // Descriptive retro name, e.g. "Medium Gray"
}

export type Subpalette = [number, number, number, number]; // 4 NES color indices (0-63)

export interface PaletteSet {
  backdrop: number;         // Master backdrop color at $3F00 (0-63)
  bgPalettes: [Subpalette, Subpalette, Subpalette, Subpalette];
  spritePalettes: [Subpalette, Subpalette, Subpalette, Subpalette];
}

export type TilePixelGrid = number[][]; // 8x8 array of color indices 0..3

export interface TileBankData {
  tiles: TilePixelGrid[];   // 512 tiles for 8KB CHR-ROM (256 per pattern table)
}

export type DrawTool = 'pencil' | 'brush' | 'line' | 'rect' | 'bucket' | 'picker' | 'eraser';

export type CanvasMode = 'tile' | 'sprite2x2' | 'screen'; // 8x8, 16x16, or 32x30 Nametable

export interface MapperInfo {
  id: number;
  name: string;
  chip: string;
  description: string;
  notableGames: string[];
}
