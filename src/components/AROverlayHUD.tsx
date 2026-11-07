/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, X, Compass, Smartphone } from 'lucide-react';
import { ARMode } from '../types/maritime.ts';

interface AROverlayHUDProps {
  arMode: ARMode;
  onExitAR: () => void;
}

export const AROverlayHUD: React.FC<AROverlayHUDProps> = ({ arMode, onExitAR }) => {
  if (arMode === 'inactive') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Banner Status */}
      <div className="flex items-center justify-between w-full">
        <div className="pointer-events-auto flex items-center gap-2.5 bg-black/80 border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-300 font-display flex items-center gap-1.5">
              <span>{arMode === 'webxr' ? 'WebXR Augmented Reality' : 'Kamera & Gyroscope AR'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[11px] text-slate-300">
              {arMode === 'webxr' ? 'Penempatan bidang permukaan fisik' : 'Video Passthrough & Pelacakan Kompas'}
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitAR}
          className="pointer-events-auto p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <X className="w-4 h-4" />
          <span>Keluar AR</span>
        </button>
      </div>

      {/* Center Reticle Crosshairs */}
      <div className="self-center flex flex-col items-center gap-2 text-center text-xs text-white/90">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/60 border-dashed animate-spin-slow flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-400/80 shadow-[0_0_12px_#22d3ee]"></div>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-[11px]">
          Gerakkan perangkat untuk mengamati miniatur radar dari berbagai sudut
        </div>
      </div>

      {/* Bottom AR Controls Help */}
      <div className="self-center pointer-events-auto bg-black/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-slate-300 flex items-center gap-3 backdrop-blur-md">
        <div className="flex items-center gap-1 text-cyan-300">
          <Smartphone className="w-4 h-4" />
          <span>Orientasi Sensor Aktif</span>
        </div>
        <div className="h-3 w-px bg-slate-700"></div>
        <div className="flex items-center gap-1 text-amber-300">
          <Compass className="w-4 h-4" />
          <span>Gunakan slider dok untuk memindahkan kapal & pelampung</span>
        </div>
      </div>
    </div>
  );
};
