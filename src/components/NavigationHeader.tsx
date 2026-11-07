/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Sparkles, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { ARMode } from '../types/maritime.ts';

interface NavigationHeaderProps {
  arMode: ARMode;
  onToggleAR: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenQuiz: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  arMode,
  onToggleAR,
  soundEnabled,
  onToggleSound,
  isZenMode,
  onToggleZenMode,
  onOpenQuiz,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-4 flex items-center justify-between gap-4">
      {/* Zone 1: Brand & Context Title */}
      <div className="pointer-events-auto flex items-center gap-3 bg-[#070e1c]/90 border border-slate-800 rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md">
        <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20 shrink-0">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap font-display">
              Radar Maritim 3D & AR
            </h1>
            <span className="text-slate-500 text-xs hidden sm:inline">·</span>
            <span className="text-xs text-amber-400 font-medium hidden sm:inline">Teorema Sudut Lingkaran</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            ∠AOB (Sudut Pusat) = 2 × ∠APB (Sudut Keliling)
          </p>
        </div>
      </div>

      {/* Zone 2: Action Buttons */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Quiz Button */}
        <button
          onClick={onOpenQuiz}
          className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Kuis Teorema</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Matikan Suara Sonar' : 'Aktifkan Suara Sonar'}
          className="p-2 bg-[#070e1c]/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer shadow-lg"
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          title={isZenMode ? 'Tampilkan Semua HUD' : 'Mode Zen (Layar Penuh Bersih)'}
          className="p-2 bg-[#070e1c]/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer shadow-lg hidden sm:flex items-center gap-1.5 text-xs"
        >
          {isZenMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="text-[11px] font-medium">{isZenMode ? 'Tampilkan HUD' : 'Mode Zen'}</span>
        </button>

        {/* Primary Action: AR Mode Button */}
        <button
          onClick={onToggleAR}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xl cursor-pointer whitespace-nowrap ${
            arMode !== 'inactive'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>{arMode !== 'inactive' ? 'Tutup AR' : 'Mode AR (Kamera)'}</span>
        </button>
      </div>
    </header>
  );
};
