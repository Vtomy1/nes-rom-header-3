import { NesPaletteColor, MapperInfo } from '../types/nes';

// Standard authentic NES 2C02 NTSC Color Palette (64 entries: $00 to $3F)
export const NES_MASTER_PALETTE: NesPaletteColor[] = [
  // Row 0 ($00 - $0F)
  { index: 0x00, hex: '#626262', name: 'Dark Gray' },
  { index: 0x01, hex: '#001fb2', name: 'Deep Cobalt' },
  { index: 0x02, hex: '#2404c8', name: 'Indigo Violet' },
  { index: 0x03, hex: '#5200b2', name: 'Dark Purple' },
  { index: 0x04, hex: '#730076', name: 'Crimson Wine' },
  { index: 0x05, hex: '#800024', name: 'Brick Red' },
  { index: 0x06, hex: '#730b00', name: 'Dark Brown' },
  { index: 0x07, hex: '#522800', name: 'Umber Gold' },
  { index: 0x08, hex: '#244400', name: 'Olive Green' },
  { index: 0x09, hex: '#005100', name: 'Forest Green' },
  { index: 0x0A, hex: '#005400', name: 'Pine Green' },
  { index: 0x0B, hex: '#004c24', name: 'Jade' },
  { index: 0x0C, hex: '#003873', name: 'Navy Cyan' },
  { index: 0x0D, hex: '#000000', name: 'Black' },
  { index: 0x0E, hex: '#000000', name: 'Black Mirror' },
  { index: 0x0F, hex: '#000000', name: 'Pure Black' },

  // Row 1 ($10 - $1F)
  { index: 0x10, hex: '#ababab', name: 'Medium Gray' },
  { index: 0x11, hex: '#0d57ff', name: 'Sky Cobalt' },
  { index: 0x12, hex: '#4b30ff', name: 'Royal Violet' },
  { index: 0x13, hex: '#8a13ff', name: 'Purple Orchid' },
  { index: 0x14, hex: '#bc08d6', name: 'Magenta' },
  { index: 0x15, hex: '#d21269', name: 'Ruby Pink' },
  { index: 0x16, hex: '#c72e00', name: 'NES Orange-Red' },
  { index: 0x17, hex: '#9d5400', name: 'Amber Sienna' },
  { index: 0x18, hex: '#607b00', name: 'Fern Olive' },
  { index: 0x19, hex: '#208e00', name: 'Lime Foliage' },
  { index: 0x1A, hex: '#009200', name: 'Spring Green' },
  { index: 0x1B, hex: '#00894b', name: 'Teal Meadow' },
  { index: 0x1C, hex: '#0073be', name: 'Cyan Sea' },
  { index: 0x1D, hex: '#000000', name: 'Black (1D)' },
  { index: 0x1E, hex: '#000000', name: 'Black (1E)' },
  { index: 0x1F, hex: '#000000', name: 'Black (1F)' },

  // Row 2 ($20 - $2F)
  { index: 0x20, hex: '#ffffff', name: 'Pure White' },
  { index: 0x21, hex: '#53aeff', name: 'Mario Sky Blue' },
  { index: 0x22, hex: '#9085ff', name: 'Periwinkle' },
  { index: 0x23, hex: '#d365ff', name: 'Lilac' },
  { index: 0x24, hex: '#ff57ff', name: 'Bubblegum' },
  { index: 0x25, hex: '#ff5dcf', name: 'Coral Rose' },
  { index: 0x26, hex: '#ff7757', name: 'Peach Salmon' },
  { index: 0x27, hex: '#fa9e00', name: 'Sunburst Gold' },
  { index: 0x28, hex: '#bdc700', name: 'Chartreuse' },
  { index: 0x29, hex: '#7ae700', name: 'Bright Grass' },
  { index: 0x2A, hex: '#43eb41', name: 'Vibrant Green' },
  { index: 0x2B, hex: '#2fe599', name: 'Mint Emerald' },
  { index: 0x2C, hex: '#22cefa', name: 'Glacier Aqua' },
  { index: 0x2D, hex: '#4f4f4f', name: 'Slate Gray' },
  { index: 0x2E, hex: '#000000', name: 'Black (2E)' },
  { index: 0x2F, hex: '#000000', name: 'Black (2F)' },

  // Row 3 ($30 - $3F)
  { index: 0x30, hex: '#ffffff', name: 'Bright White' },
  { index: 0x31, hex: '#b6e1ff', name: 'Pale Frost Blue' },
  { index: 0x32, hex: '#ced1ff', name: 'Lavender Mist' },
  { index: 0x33, hex: '#e6c3ff', name: 'Thistle' },
  { index: 0x34, hex: '#ffbcff', name: 'Pale Pink' },
  { index: 0x35, hex: '#ffbeec', name: 'Baby Rose' },
  { index: 0x36, hex: '#ffc8be', name: 'Soft Cream' },
  { index: 0x37, hex: '#ffdba2', name: 'Warm Bisque' },
  { index: 0x38, hex: '#e8ec9b', name: 'Pale Banana' },
  { index: 0x39, hex: '#ccf89b', name: 'Pale Lime' },
  { index: 0x3A, hex: '#b5f9b5', name: 'Pale Mint' },
  { index: 0x3B, hex: '#a9fad6', name: 'Seafoam Pastel' },
  { index: 0x3C, hex: '#a4f0ff', name: 'Light Cyan' },
  { index: 0x3D, hex: '#b8b8b8', name: 'Ash Gray' },
  { index: 0x3E, hex: '#000000', name: 'Black (3E)' },
  { index: 0x3F, hex: '#000000', name: 'Black (3F)' }
];

export const FAMOUS_MAPPERS: MapperInfo[] = [
  {
    id: 0,
    name: 'NROM',
    chip: 'Discrete Logic',
    description: 'No bank switching. Fixed 16KB or 32KB PRG, 8KB CHR. Used in early first-party titles.',
    notableGames: ['Super Mario Bros.', 'Donkey Kong', 'Pac-Man', 'Excitebike', 'Duck Hunt']
  },
  {
    id: 1,
    name: 'MMC1 / SxROM',
    chip: 'Nintendo MMC1',
    description: 'Serial shift register. Up to 512KB PRG, 128KB CHR, switchable mirroring, battery save support.',
    notableGames: ['The Legend of Zelda', 'Metroid', 'Mega Man 2', 'Kid Icarus', 'Final Fantasy']
  },
  {
    id: 2,
    name: 'UxROM',
    chip: '74HC161 / 74HC32',
    description: 'PRG bank switching (16KB switchable + 16KB fixed), 8KB CHR-RAM.',
    notableGames: ['Castlevania', 'Contra', 'Mega Man', 'DuckTales', 'Metal Gear']
  },
  {
    id: 3,
    name: 'CNROM',
    chip: '74HC161',
    description: 'Fixed 32KB PRG, 4 banks of 8KB CHR-ROM (up to 32KB CHR).',
    notableGames: ['Dragon Quest', 'Gradius', 'Adventure Island', 'Solomon\'s Key']
  },
  {
    id: 4,
    name: 'MMC3 / TxROM',
    chip: 'Nintendo MMC3',
    description: 'Scanline IRQ counter, fine 1KB/2KB CHR switching, 8KB PRG switching.',
    notableGames: ['Super Mario Bros. 3', 'Mega Man 3-6', 'Kirby\'s Adventure', 'Castlevania III']
  },
  {
    id: 7,
    name: 'AxROM',
    chip: '74HC161 / 74HC02',
    description: '32KB PRG bank switching, single-screen switchable mirroring, CHR-RAM.',
    notableGames: ['Battletoads', 'Marble Madness', 'Cobra Triangle']
  },
  {
    id: 9,
    name: 'MMC2 / PxROM',
    chip: 'Nintendo MMC2',
    description: 'Automatic tile-fetch CHR bank switching (punch-out style).',
    notableGames: ['Mike Tyson\'s Punch-Out!!']
  }
];
