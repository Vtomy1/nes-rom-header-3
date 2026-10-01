import { PaletteSet, TilePixelGrid } from '../types/nes';

export const DEFAULT_PALETTES: PaletteSet = {
  backdrop: 0x21, // Mario Sky Blue ($21)
  bgPalettes: [
    [0x21, 0x16, 0x27, 0x0F], // Pal 0: Sky, Brick Red, Gold/Yellow, Black
    [0x21, 0x1A, 0x2A, 0x0F], // Pal 1: Sky, Forest Green, Lime, Black
    [0x21, 0x00, 0x10, 0x30], // Pal 2: Sky, Dark Gray, Light Gray, White
    [0x21, 0x12, 0x22, 0x0F]  // Pal 3: Sky, Blue/Cyan, Periwinkle, Black
  ],
  spritePalettes: [
    [0x21, 0x16, 0x27, 0x0F], // Sprite 0: Red, Peach/Gold, Black
    [0x21, 0x1A, 0x2A, 0x0F], // Sprite 1: Green, Lime, Black
    [0x21, 0x05, 0x26, 0x30], // Sprite 2: Crimson, Peach, White
    [0x21, 0x11, 0x2C, 0x30]  // Sprite 3: Blue, Aqua, White
  ]
};

// Helper to create empty 8x8 tile
export function createEmptyTile(): TilePixelGrid {
  return Array.from({ length: 8 }, () => Array(8).fill(0));
}

// 8x8 Brick Tile
export const TILE_BRICK: TilePixelGrid = [
  [3, 3, 3, 3, 3, 3, 3, 3],
  [1, 1, 1, 3, 1, 1, 1, 3],
  [1, 2, 1, 3, 1, 2, 1, 3],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [1, 3, 1, 1, 1, 3, 1, 1],
  [1, 3, 1, 2, 1, 3, 1, 2],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

// 8x8 Question Mark '?' Block Tile
export const TILE_QUESTION_BLOCK: TilePixelGrid = [
  [3, 3, 3, 3, 3, 3, 3, 3],
  [3, 2, 2, 2, 2, 2, 2, 3],
  [3, 2, 1, 1, 1, 2, 2, 3],
  [3, 2, 2, 2, 1, 2, 2, 3],
  [3, 2, 2, 1, 1, 2, 2, 3],
  [3, 2, 2, 2, 2, 2, 2, 3],
  [3, 2, 2, 1, 1, 2, 2, 3],
  [3, 3, 3, 3, 3, 3, 3, 3]
];

// 8x8 Coin Tile
export const TILE_COIN: TilePixelGrid = [
  [0, 0, 3, 3, 3, 3, 0, 0],
  [0, 3, 2, 2, 2, 2, 3, 0],
  [3, 2, 2, 1, 1, 2, 2, 3],
  [3, 2, 1, 2, 2, 1, 2, 3],
  [3, 2, 1, 2, 2, 1, 2, 3],
  [3, 2, 2, 1, 1, 2, 2, 3],
  [0, 3, 2, 2, 2, 2, 3, 0],
  [0, 0, 3, 3, 3, 3, 0, 0]
];

// 8x8 Bush / Cloud Corner
export const TILE_CLOUD_LEFT: TilePixelGrid = [
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 3, 3, 2, 2, 2, 2],
  [0, 3, 2, 2, 2, 2, 2, 2],
  [3, 2, 2, 2, 2, 2, 2, 2],
  [3, 2, 2, 2, 2, 2, 2, 2],
  [3, 2, 2, 2, 2, 2, 2, 2],
  [0, 3, 2, 2, 2, 2, 2, 2],
  [0, 0, 3, 3, 3, 3, 3, 3]
];

// 8x8 Bush / Cloud Right
export const TILE_CLOUD_RIGHT: TilePixelGrid = [
  [3, 3, 3, 3, 0, 0, 0, 0],
  [2, 2, 2, 2, 3, 3, 0, 0],
  [2, 2, 2, 2, 2, 2, 3, 0],
  [2, 2, 2, 2, 2, 2, 2, 3],
  [2, 2, 2, 2, 2, 2, 2, 3],
  [2, 2, 2, 2, 2, 2, 2, 3],
  [2, 2, 2, 2, 2, 2, 3, 0],
  [3, 3, 3, 3, 3, 3, 0, 0]
];

// 8x8 Ground Soil Tile
export const TILE_GROUND: TilePixelGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 1, 1, 1, 3, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 3, 1, 1, 1, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 1, 1, 1, 3, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [3, 3, 3, 3, 3, 3, 3, 3]
];

// 8x8 Hero Top Left
export const TILE_HERO_TL: TilePixelGrid = [
  [0, 0, 0, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 3, 3, 3, 2, 2, 3],
  [0, 3, 2, 3, 2, 2, 2, 3],
  [0, 3, 2, 3, 3, 2, 2, 2],
  [0, 3, 3, 2, 2, 2, 2, 3],
  [0, 0, 0, 2, 2, 2, 2, 2],
  [0, 0, 1, 1, 3, 1, 1, 1]
];

// 8x8 Hero Top Right
export const TILE_HERO_TR: TilePixelGrid = [
  [1, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0],
  [2, 3, 2, 0, 0, 0, 0, 0],
  [2, 2, 3, 2, 2, 2, 0, 0],
  [3, 2, 2, 2, 2, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [3, 1, 1, 0, 0, 0, 0, 0]
];

// 8x8 Hero Bottom Left
export const TILE_HERO_BL: TilePixelGrid = [
  [0, 1, 1, 1, 3, 1, 1, 3],
  [1, 1, 1, 1, 3, 3, 3, 3],
  [2, 2, 1, 3, 2, 3, 3, 2],
  [2, 2, 2, 3, 3, 3, 3, 3],
  [2, 2, 3, 3, 3, 3, 3, 3],
  [0, 0, 3, 3, 3, 0, 0, 0],
  [0, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0]
];

// 8x8 Hero Bottom Right
export const TILE_HERO_BR: TilePixelGrid = [
  [1, 1, 1, 1, 1, 0, 0, 0],
  [3, 1, 1, 1, 1, 1, 0, 0],
  [3, 3, 3, 3, 2, 2, 0, 0],
  [3, 3, 3, 2, 2, 2, 0, 0],
  [3, 3, 0, 0, 0, 0, 0, 0],
  [0, 3, 3, 3, 0, 0, 0, 0],
  [0, 3, 3, 3, 3, 0, 0, 0],
  [0, 3, 3, 3, 3, 3, 0, 0]
];

// Generate full initial 512-tile CHR-ROM bank
export function buildInitialTileBank(): TilePixelGrid[] {
  const bank: TilePixelGrid[] = [];
  
  // Tile 0: Empty blank
  bank.push(createEmptyTile());
  // Tile 1: Brick
  bank.push(TILE_BRICK);
  // Tile 2: Question block
  bank.push(TILE_QUESTION_BLOCK);
  // Tile 3: Coin
  bank.push(TILE_COIN);
  // Tile 4: Cloud Left
  bank.push(TILE_CLOUD_LEFT);
  // Tile 5: Cloud Right
  bank.push(TILE_CLOUD_RIGHT);
  // Tile 6: Ground Soil
  bank.push(TILE_GROUND);
  // Tiles 7-10: Hero Sprite 2x2
  bank.push(TILE_HERO_TL);
  bank.push(TILE_HERO_TR);
  bank.push(TILE_HERO_BL);
  bank.push(TILE_HERO_BR);

  // Fill remaining tiles up to 512
  while (bank.length < 512) {
    bank.push(createEmptyTile());
  }

  return bank;
}

// Generate default 30x32 Nametable layout for instant visual showcase
export function buildDefaultScreenTiles(): number[][] {
  const grid: number[][] = Array.from({ length: 30 }, () => Array(32).fill(0));

  // Sky clouds at row 5-6
  grid[5][4] = 4; grid[5][5] = 5;
  grid[5][22] = 4; grid[5][23] = 5;

  // Floating Brick & Question Blocks at row 16
  grid[16][10] = 1; // Brick
  grid[16][11] = 2; // ? block
  grid[16][12] = 1; // Brick
  grid[16][13] = 2; // ? block
  grid[16][14] = 1; // Brick
  grid[15][11] = 3; // Coin floating above
  grid[15][13] = 3; // Coin floating above

  // Ground blocks at rows 27, 28, 29
  for (let c = 0; c < 32; c++) {
    grid[27][c] = 6;
    grid[28][c] = 6;
    grid[29][c] = 6;
  }

  // Hero standing at col 6, rows 25-26
  grid[25][6] = 7; grid[25][7] = 8;
  grid[26][6] = 9; grid[26][7] = 10;

  return grid;
}

// Default 8x8 Attribute table (selecting Palette 0 for everything)
export function buildDefaultAttributes(): number[][] {
  return Array.from({ length: 8 }, () => Array(8).fill(0));
}
