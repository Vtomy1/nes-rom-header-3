import React from 'react';
import { Download, Upload, Cpu, Play } from 'lucide-react';

interface HeaderBarProps {
  activeTab: 'drawer' | 'header' | 'preview' | 'hex';
  setActiveTab: (tab: 'drawer' | 'header' | 'preview' | 'hex') => void;
  onExportClick: () => void;
  onImportClick: () => void;
  mapperName: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  onExportClick,
  onImportClick,
  mapperName
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-950 text-neutral-100 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center font-mono font-bold text-xs text-white tracking-tighter">
            NES
          </div>
          <span className="text-base font-semibold tracking-tight text-white font-sans">
            NES ROM &amp; Header Studio
          </span>
        </div>
        <span className="hidden sm:inline-block text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-3">
          {mapperName}
        </span>
      </div>

      {/* Zone 2: Navigation Links / Interactive Segmented Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 border border-neutral-800 rounded-lg">
        <button
          onClick={() => setActiveTab('drawer')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'drawer'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Pixel &amp; CHR Drawer
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'header'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Header Architect (16B)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          CRT Screen Preview
        </button>
        <button
          onClick={() => setActiveTab('hex')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'hex'
              ? 'bg-neutral-800 text-white shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Hex &amp; Bitfields
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          title="Import and parse existing .nes ROM file"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Import ROM</span>
        </button>
        <button
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          title="Synthesize and download playable .nes ROM"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .nes</span>
        </button>
      </div>
    </header>
  );
};
