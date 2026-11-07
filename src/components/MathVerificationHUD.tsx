/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculatedAngles } from '../types/maritime.ts';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MathVerificationHUDProps {
  angles: CalculatedAngles;
}

export const MathVerificationHUD: React.FC<MathVerificationHUDProps> = ({ angles }) => {
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div className="fixed top-16 right-3 sm:right-4 z-20 pointer-events-auto max-w-xs sm:max-w-sm w-full">
      <div className="bg-[#070e1c]/92 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md space-y-3">
        {/* Header with Title and Theory Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Kalkulasi Sudut Realtime</span>
          </div>
          <button
            onClick={() => setShowTheory(!showTheory)}
            className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Teorema</span>
            {showTheory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Real-time Angle Badges Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          {/* Central Angle AOB */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-inner">
            <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Sudut Pusat (∠AOB)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 tabular-nums">
              {angles.aobDeg.toFixed(1)}°
            </span>
            <span className="block text-[9px] text-slate-400 font-mono mt-0.5">2α Radar Stasiun</span>
          </div>

          {/* Inscribed Angle APB */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner">
            <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              Sudut Keliling (∠APB)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400 tabular-nums">
              {angles.apbDeg.toFixed(1)}°
            </span>
            <span className="block text-[9px] text-slate-400 font-mono mt-0.5">α Pandangan Kapal</span>
          </div>
        </div>

        {/* Proof Equation Box */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 text-center">
          <div className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider mb-0.5">
            {angles.isOppositeArc ? 'Posisi Kapal: Busur Minor AB' : 'Hubungan Teorema Sudut Lingkaran'}
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-400">
            {angles.isOppositeArc ? '∠APB = 180° - ½ × ∠AOB' : '∠APB = ½ × ∠AOB'}
          </div>
          <div className="text-[11px] font-mono text-slate-300 mt-1 bg-slate-950/70 py-0.5 px-2 rounded border border-slate-800 inline-block tabular-nums">
            {angles.isOppositeArc
              ? `${angles.apbDeg.toFixed(1)}° = 180° - ${(angles.aobDeg / 2).toFixed(1)}°`
              : `${angles.apbDeg.toFixed(1)}° = ½ × (${angles.aobDeg.toFixed(1)}°)`}
          </div>
        </div>

        {/* Expandable Theory Explanation */}
        {showTheory && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed text-[11px]">
            <p>
              <strong className="text-amber-400">1. Sudut Pusat:</strong> Sudut yang dibentuk oleh dua jari-jari lingkaran yang berpusat di titik $O$ dan menghadap busur $AB$.
            </p>
            <p>
              <strong className="text-cyan-400">2. Sudut Keliling:</strong> Sudut yang dibentuk oleh dua tali busur yang berpotongan pada tepi keliling lingkaran (posisi Kapal $P$) dan menghadap busur $AB$ yang sama.
            </p>
            <p className="text-emerald-400 font-medium pt-1 border-t border-slate-800">
              ✓ Nilai sudut pandang kapal akan selalu tetap tepat setengah dari sudut pusat stasiun radar, kemanapun kapal $P$ berlayar di sepanjang tepi lingkaran yang menghadap busur yang sama!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
