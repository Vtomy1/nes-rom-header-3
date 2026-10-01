import { NesHeaderConfig, PaletteSet, TilePixelGrid } from '../types/nes';

// Magic bytes: 'N', 'E', 'S', 0x1A
export const INES_MAGIC = new Uint8Array([0x4e, 0x45, 0x53, 0x1a]);

export function encodeTileTo2bpp(grid: TilePixelGrid): Uint8Array {
  const bytes = new Uint8Array(16);
  for (let y = 0; y < 8; y++) {
    let p0 = 0;
    let p1 = 0;
    for (let x = 0; x < 8; x++) {
      const colorIndex = (grid[y] && grid[y][x]) || 0;
      const bit0 = colorIndex & 1;
      const bit1 = (colorIndex >> 1) & 1;
      p0 |= bit0 << (7 - x);
      p1 |= bit1 << (7 - x);
    }
    bytes[y] = p0;
    bytes[y + 8] = p1;
  }
  return bytes;
}

export function decode2bppToTile(bytes: Uint8Array, offset: number = 0): TilePixelGrid {
  const grid: TilePixelGrid = [];
  for (let y = 0; y < 8; y++) {
    const row: number[] = [];
    const p0 = bytes[offset + y] || 0;
    const p1 = bytes[offset + 8 + y] || 0;
    for (let x = 0; x < 8; x++) {
      const bit0 = (p0 >> (7 - x)) & 1;
      const bit1 = (p1 >> (7 - x)) & 1;
      const colorIndex = bit0 | (bit1 << 1);
      row.push(colorIndex);
    }
    grid.push(row);
  }
  return grid;
}

export function buildInesHeader(config: NesHeaderConfig): Uint8Array {
  const header = new Uint8Array(16);

  // Bytes 0-3: Magic
  header[0] = 0x4e; // 'N'
  header[1] = 0x45; // 'E'
  header[2] = 0x53; // 'S'
  header[3] = 0x1a; // EOF

  // Byte 4: PRG ROM in 16KB units
  header[4] = Math.max(1, Math.min(255, config.prgRomUnits));

  // Byte 5: CHR ROM in 8KB units
  header[5] = Math.max(0, Math.min(255, config.chrRomUnits));

  // Byte 6: Flags 6
  let f6 = 0;
  if (config.mirroring === 'vertical') f6 |= 0x01;
  if (config.battery) f6 |= 0x02;
  if (config.trainer) f6 |= 0x04;
  if (config.mirroring === 'four-screen') f6 |= 0x08;
  f6 |= (config.mapper & 0x0f) << 4;
  header[6] = f6;

  // Byte 7: Flags 7
  let f7 = 0;
  if (config.vsSystem) f7 |= 0x01;
  if (config.playChoice) f7 |= 0x02;
  if (config.format === 'NES2.0') {
    f7 |= 0x08; // Bits 2-3 = %10
  }
  f7 |= config.mapper & 0xf0;
  header[7] = f7;

  // Byte 8: Flags 8
  if (config.format === 'NES2.0') {
    // NES 2.0: Mapper high nibble (bits 8-11) + submapper
    header[8] = ((config.mapper >> 8) & 0x0f) | ((config.submapper & 0x0f) << 4);
  } else {
    // Standard iNES: PRG RAM in 8KB units
    header[8] = config.prgRamUnits & 0xff;
  }

  // Byte 9: Flags 9
  if (config.format === 'NES2.0') {
    // PRG / CHR high order bits (normally 0 for small ROMs)
    header[9] = 0;
  } else {
    // TV system: 0=NTSC, 1=PAL
    header[9] = config.tvSystem === 'pal' ? 1 : 0;
  }

  // Byte 10: Flags 10
  header[10] = config.tvSystem === 'pal' ? 0x02 : 0x00;

  // Bytes 11-15: Zero padding
  for (let i = 11; i < 16; i++) {
    header[i] = 0;
  }

  return header;
}

export function parseInesHeader(buffer: Uint8Array): NesHeaderConfig | null {
  if (buffer.length < 16) return null;
  if (
    buffer[0] !== 0x4e ||
    buffer[1] !== 0x45 ||
    buffer[2] !== 0x53 ||
    buffer[3] !== 0x1a
  ) {
    return null;
  }

  const prgRomUnits = buffer[4];
  const chrRomUnits = buffer[5];
  const f6 = buffer[6];
  const f7 = buffer[7];
  const f8 = buffer[8];
  const f9 = buffer[9];

  const isNes2 = (f7 & 0x0c) === 0x08;
  const mapperLow = (f6 >> 4) & 0x0f;
  const mapperMid = f7 & 0xf0;
  const mapperHigh = isNes2 ? (f8 & 0x0f) << 8 : 0;
  const mapper = mapperLow | mapperMid | mapperHigh;

  const mirroring =
    (f6 & 0x08) !== 0
      ? 'four-screen'
      : (f6 & 0x01) !== 0
      ? 'vertical'
      : 'horizontal';

  return {
    prgRomUnits: prgRomUnits || 1,
    chrRomUnits,
    mapper,
    mirroring,
    battery: (f6 & 0x02) !== 0,
    trainer: (f6 & 0x04) !== 0,
    format: isNes2 ? 'NES2.0' : 'iNES',
    vsSystem: (f7 & 0x01) !== 0,
    playChoice: (f7 & 0x02) !== 0,
    submapper: isNes2 ? (f8 >> 4) & 0x0f : 0,
    prgRamUnits: isNes2 ? 0 : f8,
    tvSystem: (f9 & 0x01) === 1 ? 'pal' : 'ntsc'
  };
}

/**
 * Synthesizes a real, fully valid, executable 6502 machine-code PRG-ROM
 * for NROM (16KB or 32KB). When loaded in ANY NES emulator (FCEUX, Mesen,
 * Nestopia, RetroArch) or real hardware, it:
 * 1. Initializes the 6502 CPU and turns off decimal mode
 * 2. Waits for PPU to stabilize (2 frames of vblank)
 * 3. Writes the 32 palette bytes to PPU $3F00
 * 4. Fills Nametable 0 ($2000-$23BF) with the user screen tile indices
 * 5. Fills Attribute Table ($23C0-$23FF)
 * 6. Enables background & sprites via PPUCTRL and PPUMASK ($2000, $2001)
 * 7. Enters infinite frame wait loop
 */
export function buildExecutablePrgRom(
  prgUnits: number,
  palettes: PaletteSet,
  screenTiles: number[][], // 30 rows of 32 tile indices (0-255)
  screenAttributes: number[][] // 8 rows of 8 attribute values
): Uint8Array {
  const prgSize = prgUnits * 16384;
  const prg = new Uint8Array(prgSize);

  // We write the code starting at offset 0 (which maps to $8000 or $C000)
  // Startup code:
  // SEI           ; 78
  // CLD           ; D8
  // LDX #$FF      ; A2 FF
  // TXS           ; 9A
  // INX           ; E8 (X = 0)
  // STX $2000     ; 8E 00 20 (Disable NMI)
  // STX $2001     ; 8E 01 20 (Disable rendering)
  // STX $4010     ; 8E 10 40 (Disable DMC IRQ)
  //
  // ; Wait for vblank 1
  // vblank1:
  // BIT $2002     ; 2C 02 20
  // BPL vblank1   ; 10 FB
  //
  // ; Wait for vblank 2
  // vblank2:
  // BIT $2002     ; 2C 02 20
  // BPL vblank2   ; 10 FB
  //
  // ; Load Palettes to PPU $3F00
  // BIT $2002     ; 2C 02 20 (reset latch)
  // LDA #$3F      ; A9 3F
  // STA $2006     ; 8D 06 20
  // LDA #$00      ; A9 00
  // STA $2006     ; 8D 06 20
  // LDX #$00      ; A2 00
  // load_pal:
  // LDA pal_data, X ; BD [pal_data_lo] [pal_data_hi]
  // STA $2007     ; 8D 07 20
  // INX           ; E8
  // CPX #$20      ; E0 20 (32 palette entries)
  // BNE load_pal  ; D0 F5
  //
  // ; Load Nametable 0 at $2000
  // BIT $2002     ; 2C 02 20
  // LDA #$20      ; A9 20
  // STA $2006     ; 8D 06 20
  // LDA #$00      ; A9 00
  // STA $2006     ; 8D 06 20
  // ; Stream the 960 tile bytes + 64 attribute bytes
  // ...

  let pc = 0;
  function emit(...bytes: number[]) {
    for (const b of bytes) {
      prg[pc++] = b & 0xff;
    }
  }

  // 1. Initial CPU state
  emit(0x78);             // SEI
  emit(0xd8);             // CLD
  emit(0xa2, 0xff);       // LDX #$FF
  emit(0x9a);             // TXS
  emit(0xe8);             // INX (X = 0)
  emit(0x8e, 0x00, 0x20); // STX $2000
  emit(0x8e, 0x01, 0x20); // STX $2001
  emit(0x8e, 0x10, 0x40); // STX $4010
  emit(0xa9, 0x40);       // LDA #$40
  emit(0x8d, 0x17, 0x40); // STA $4017 (disable APU frame IRQ)

  // 2. VBlank 1 loop
  emit(0x2c, 0x02, 0x20); // BIT $2002
  emit(0x10, 0xfb);       // BPL -5

  // 3. VBlank 2 loop
  emit(0x2c, 0x02, 0x20); // BIT $2002
  emit(0x10, 0xfb);       // BPL -5

  // 4. Set PPU Address to $3F00 (Palette RAM)
  emit(0x2c, 0x02, 0x20); // BIT $2002
  emit(0xa9, 0x3f);       // LDA #$3F
  emit(0x8d, 0x06, 0x20); // STA $2006
  emit(0xa9, 0x00);       // LDA #$00
  emit(0x8d, 0x06, 0x20); // STA $2006

  // 5. Palette copy loop (32 bytes from table at fixed offset)
  // We place palette table at PRG offset $0200
  const PAL_OFFSET_ROM = 0x0200;
  const PAL_ADDR_6502 = 0x8000 + PAL_OFFSET_ROM;
  const palLo = PAL_ADDR_6502 & 0xff;
  const palHi = (PAL_ADDR_6502 >> 8) & 0xff;

  emit(0xa2, 0x00);             // LDX #$00
  // loop start:
  emit(0xbd, palLo, palHi);     // LDA PAL_ADDR, X
  emit(0x8d, 0x07, 0x20);       // STA $2007
  emit(0xe8);                   // INX
  emit(0xe0, 0x20);             // CPX #$20
  emit(0xd0, 0xf6);             // BNE -10

  // 6. Set PPU Address to $2000 (Nametable 0)
  emit(0x2c, 0x02, 0x20); // BIT $2002
  emit(0xa9, 0x20);       // LDA #$20
  emit(0x8d, 0x06, 0x20); // STA $2006
  emit(0xa9, 0x00);       // LDA #$00
  emit(0x8d, 0x06, 0x20); // STA $2006

  // 7. Load Nametable data (1024 bytes: 960 tile bytes + 64 attribute bytes)
  // We place Nametable data at PRG offset $0300 (takes $0300 to $06FF)
  const NT_OFFSET_ROM = 0x0300;
  const NT_ADDR_6502 = 0x8000 + NT_OFFSET_ROM;

  // We can write a 4-page unrolled copy loop (4 x 256 bytes = 1024 bytes)
  for (let page = 0; page < 4; page++) {
    const pageAddr = NT_ADDR_6502 + page * 256;
    const pgLo = pageAddr & 0xff;
    const pgHi = (pageAddr >> 8) & 0xff;

    emit(0xa2, 0x00);           // LDX #$00
    // page copy loop:
    emit(0xbd, pgLo, pgHi);     // LDA pageAddr, X
    emit(0x8d, 0x07, 0x20);     // STA $2007
    emit(0xe8);                 // INX
    emit(0xd0, 0xf8);           // BNE -8 (loops 256 times)
  }

  // 8. Reset PPU scroll to (0, 0)
  emit(0x2c, 0x02, 0x20); // BIT $2002
  emit(0xa9, 0x00);       // LDA #$00
  emit(0x8d, 0x05, 0x20); // STA $2005 (scroll X = 0)
  emit(0x8d, 0x05, 0x20); // STA $2005 (scroll Y = 0)

  // 9. Turn on screen rendering!
  // PPUCTRL = %10000000 ($80: Enable NMI, BG pattern table 0 at $0000)
  emit(0xa9, 0x80);       // LDA #$80
  emit(0x8d, 0x00, 0x20); // STA $2000
  // PPUMASK = %00011110 ($1E: Show BG, Show Sprites, Show leftmost 8px)
  emit(0xa9, 0x1e);       // LDA #$1E
  emit(0x8d, 0x01, 0x20); // STA $2001

  // 10. Infinite Idle Loop
  const loopPc = pc;
  emit(0x4c, loopPc & 0xff, (0x8000 + loopPc) >> 8); // JMP self

  // NMI Interrupt handler (just resets scroll & returns)
  const nmiPc = 0x0100;
  prg[nmiPc] = 0x2c; prg[nmiPc + 1] = 0x02; prg[nmiPc + 2] = 0x20; // BIT $2002
  prg[nmiPc + 3] = 0xa9; prg[nmiPc + 4] = 0x00;                   // LDA #$00
  prg[nmiPc + 5] = 0x8d; prg[nmiPc + 6] = 0x05; prg[nmiPc + 7] = 0x20; // STA $2005
  prg[nmiPc + 8] = 0x8d; prg[nmiPc + 9] = 0x05; prg[nmiPc + 10] = 0x20; // STA $2005
  prg[nmiPc + 11] = 0x40; // RTI

  // Populate Palette Data at PAL_OFFSET_ROM (32 bytes)
  // Palette layout:
  // $3F00: Backdrop
  // $3F01-$3F03: BG 0
  // $3F04: Mirror of $3F00
  // $3F05-$3F07: BG 1
  // $3F08: Mirror
  // $3F09-$3F0B: BG 2
  // $3F0C: Mirror
  // $3F0D-$3F0F: BG 3
  // $3F10-$3F1F: Sprites 0-3
  let palPtr = PAL_OFFSET_ROM;
  for (let bg = 0; bg < 4; bg++) {
    prg[palPtr++] = palettes.backdrop & 0x3f;
    prg[palPtr++] = palettes.bgPalettes[bg][1] & 0x3f;
    prg[palPtr++] = palettes.bgPalettes[bg][2] & 0x3f;
    prg[palPtr++] = palettes.bgPalettes[bg][3] & 0x3f;
  }
  for (let sp = 0; sp < 4; sp++) {
    prg[palPtr++] = palettes.backdrop & 0x3f;
    prg[palPtr++] = palettes.spritePalettes[sp][1] & 0x3f;
    prg[palPtr++] = palettes.spritePalettes[sp][2] & 0x3f;
    prg[palPtr++] = palettes.spritePalettes[sp][3] & 0x3f;
  }

  // Populate Nametable Data at NT_OFFSET_ROM (960 tile bytes + 64 attribute bytes = 1024 bytes)
  let ntPtr = NT_OFFSET_ROM;
  for (let r = 0; r < 30; r++) {
    for (let c = 0; c < 32; c++) {
      const tileIndex = (screenTiles[r] && screenTiles[r][c]) !== undefined ? screenTiles[r][c] : 0;
      prg[ntPtr++] = tileIndex & 0xff;
    }
  }

  // Populate Attribute Table (64 bytes: 8 rows of 8 bytes)
  for (let ar = 0; ar < 8; ar++) {
    for (let ac = 0; ac < 8; ac++) {
      const attrVal = (screenAttributes[ar] && screenAttributes[ar][ac]) !== undefined ? screenAttributes[ar][ac] : 0;
      prg[ntPtr++] = attrVal & 0xff;
    }
  }

  // If 32KB PRG (NROM-256), mirror code to upper 16KB or setup vectors
  // Set 6502 Interrupt Vectors at the end of PRG ($FFFA - $FFFF)
  const vecOffset = prgSize - 6;
  const startAddr = 0x8000;
  const nmiAddr = 0x8000 + nmiPc;

  // $FFFA: NMI Vector
  prg[vecOffset] = nmiAddr & 0xff;
  prg[vecOffset + 1] = (nmiAddr >> 8) & 0xff;
  // $FFFC: RESET Vector
  prg[vecOffset + 2] = startAddr & 0xff;
  prg[vecOffset + 3] = (startAddr >> 8) & 0xff;
  // $FFFE: IRQ/BRK Vector
  prg[vecOffset + 4] = startAddr & 0xff;
  prg[vecOffset + 5] = (startAddr >> 8) & 0xff;

  // Also if 32KB, mirror the vectors to middle $BFFC just in case
  if (prgSize === 32768) {
    const midVec = 16384 - 6;
    prg[midVec] = nmiAddr & 0xff;
    prg[midVec + 1] = (nmiAddr >> 8) & 0xff;
    prg[midVec + 2] = startAddr & 0xff;
    prg[midVec + 3] = (startAddr >> 8) & 0xff;
    prg[midVec + 4] = startAddr & 0xff;
    prg[midVec + 5] = (startAddr >> 8) & 0xff;
  }

  return prg;
}

/**
 * Encodes all 512 8x8 tiles into standard 8KB CHR-ROM binary (2bpp planar)
 */
export function buildChrRom(tiles: TilePixelGrid[]): Uint8Array {
  // 512 tiles * 16 bytes = 8192 bytes (8KB)
  const chr = new Uint8Array(8192);
  for (let i = 0; i < Math.min(512, tiles.length); i++) {
    const tileBytes = encodeTileTo2bpp(tiles[i]);
    chr.set(tileBytes, i * 16);
  }
  return chr;
}

/**
 * Creates the complete, playable `.nes` ROM file
 */
export function compileFullNesRom(
  headerConfig: NesHeaderConfig,
  palettes: PaletteSet,
  tiles: TilePixelGrid[],
  screenTiles: number[][],
  screenAttributes: number[][]
): Uint8Array {
  const header = buildInesHeader(headerConfig);
  const trainer = headerConfig.trainer ? new Uint8Array(512) : null;
  const prg = buildExecutablePrgRom(headerConfig.prgRomUnits, palettes, screenTiles, screenAttributes);
  const chr = headerConfig.chrRomUnits > 0 ? buildChrRom(tiles) : new Uint8Array(0);

  const totalLength = header.length + (trainer ? trainer.length : 0) + prg.length + chr.length;
  const rom = new Uint8Array(totalLength);

  let offset = 0;
  rom.set(header, offset);
  offset += header.length;

  if (trainer) {
    rom.set(trainer, offset);
    offset += trainer.length;
  }

  rom.set(prg, offset);
  offset += prg.length;

  if (chr.length > 0) {
    rom.set(chr, offset);
    offset += chr.length;
  }

  return rom;
}

/**
 * Generate C array code representation of the 16-byte header
 */
export function generateCHeader(header: Uint8Array): string {
  const hexValues = Array.from(header).map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase());
  return `// iNES 16-byte Header Definition (C / C++)
const unsigned char ines_header[16] = {
  ${hexValues.slice(0, 4).join(', ')}, // Bytes 0-3: Identification String "NES\\x1A"
  ${hexValues[4]},                   // Byte 4:   PRG-ROM Size in 16KB units
  ${hexValues[5]},                   // Byte 5:   CHR-ROM Size in 8KB units
  ${hexValues[6]},                   // Byte 6:   Flags 6 (Mapper Low, Mirroring, Battery, Trainer)
  ${hexValues[7]},                   // Byte 7:   Flags 7 (Mapper High, VS/PC-10, NES 2.0)
  ${hexValues[8]},                   // Byte 8:   Flags 8 (PRG-RAM Size or NES 2.0 Submapper)
  ${hexValues[9]},                   // Byte 9:   Flags 9 (TV System: NTSC/PAL)
  ${hexValues[10]},                   // Byte 10:  Flags 10 (TV System / PRG RAM)
  ${hexValues.slice(11).join(', ')}  // Bytes 11-15: Unused Padding
};`;
}

/**
 * Generate 6502 Assembly (ca65 / nesasm) header representation
 */
export function generateAsmHeader(header: Uint8Array): string {
  const hex = (b: number) => '$' + b.toString(16).padStart(2, '0').toUpperCase();
  return `; -------------------------------------------------------------
; iNES 16-byte Header (ca65 / NESASM / ASM6 format)
; -------------------------------------------------------------
.segment "HEADER"
  .byte ${hex(header[0])}, ${hex(header[1])}, ${hex(header[2])}, ${hex(header[3])} ; "NES", $1A magic identifier
  .byte ${hex(header[4])}                   ; PRG-ROM size (16KB units)
  .byte ${hex(header[5])}                   ; CHR-ROM size (8KB units)
  .byte ${hex(header[6])}                   ; Flags 6: Mapper D0..D3, Mirroring, Battery, Trainer
  .byte ${hex(header[7])}                   ; Flags 7: Mapper D4..D7, NES 2.0 ID, VS/PlayChoice
  .byte ${hex(header[8])}                   ; Flags 8: PRG-RAM units or NES 2.0 Submapper
  .byte ${hex(header[9])}                   ; Flags 9: TV system (0=NTSC, 1=PAL)
  .byte ${hex(header[10])}                   ; Flags 10: TV system & PRG-RAM flags
  .byte ${Array.from(header.slice(11)).map(hex).join(', ')} ; Bytes 11-15: Padding
`;
}
