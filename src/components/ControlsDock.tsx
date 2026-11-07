/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Sliders,
  Camera,
  Sun,
  Sunset,
  Moon,
  ChevronDown,
  ChevronUp,
  Ship,
  Navigation2,
  Waves,
} from 'lucide-react';
import { CameraViewMode, SimulationState, TimeOfDay } from '../types/maritime.ts';

interface ControlsDockProps {
  state: SimulationState;
  onSetAngleP: (deg: number) => void;
  onSetAngleA: (deg: number) => void;
  onSetAngleB: (deg: number) => void;
  onSetPulseSpeed: (speed: number) => void;
  onSetCameraMode: (mode: CameraViewMode) => void;
  onSetTimeOfDay: (tod: TimeOfDay) => void;
  onToggleWaves: () => void;
  onResetPositions: () => void;
}

type ActiveTab = 'sliders' | 'camera' | 'environment';

export const ControlsDock: React.FC<ControlsDockProps> = ({
  state,
  onSetAngleP,
  onSetAngleA,
  onSetAngleB,
  onSetPulseSpeed,
  onSetCameraMode,
  onSetTimeOfDay,
  onToggleWaves,
  onResetPositions,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sliders');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const radToDeg = (rad: number) => {
    let d = Math.round((rad * 180) / Math.PI) % 360;
    return d < 0 ? d + 360 : d;
  };

  const degP = radToDeg(state.angleP);
  const degA = radToDeg(state.angleA);
  const degB = radToDeg(state.angleB);

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[96vw] max-w-3xl flex flex-col items-center">
      {/* Collapse/Expand Toggle Pill */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1.5 px-3 py-1 bg-[#070e1c]/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 rounded-full flex items-center gap-1.5 shadow-xl transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
        <span>{isCollapsed ? 'Tampilkan Dok Kontrol' : 'Sembunyikan Kontrol'}</span>
      </button>

      {/* Main Control Surface */}
      {!isCollapsed && (
        <div className="w-full bg-[#070e1c]/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3">
          {/* Top Bar Tabs & Quick Reset */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('sliders')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'sliders'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Posisi Objek</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera 3D</span>
              </button>

              <button
                onClick={() => setActiveTab('environment')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'environment'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Waktu & Laut</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onResetPositions}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Kembalikan ke posisi awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SLIDERS & POSITION CONTROLS */}
          {activeTab === 'sliders' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Ship P Slider */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5 text-cyan-400" /> Kapal Patroli P:
                  </span>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums">{degP}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={degP}
                  onChange={(e) => onSetAngleP(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Buoy A Slider */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Navigation2 className="w-3.5 h-3.5 text-amber-400" /> Pelampung A:
                  </span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">{degA}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={degA}
                  onChange={(e) => onSetAngleA(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Buoy B Slider */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-400" /> Pelampung B:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">{degB}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={degB}
                  onChange={(e) => onSetAngleB(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA VIEW MODES */}
          {activeTab === 'camera' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => onSetCameraMode('orbit')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  state.cameraMode === 'orbit'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Orbit 3D Bebas</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rotasi dan zoom 360°</div>
              </button>

              <button
                onClick={() => onSetCameraMode('ship')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  state.cameraMode === 'ship'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Dek Kapal P</div>
                <div className="text-[10px] text-slate-400 mt-0.5">POV pandang dari anjungan</div>
              </button>

              <button
                onClick={() => onSetCameraMode('tower')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  state.cameraMode === 'tower'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Menara Radar O</div>
                <div className="text-[10px] text-slate-400 mt-0.5">POV observasi mercusuar</div>
              </button>

              <button
                onClick={() => onSetCameraMode('tactical')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  state.cameraMode === 'tactical'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Taktis 2D/2.5D</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tampilan atas tegak lurus</div>
              </button>
            </div>
          )}

          {/* TAB 3: ENVIRONMENT & ATMOSPHERE */}
          {activeTab === 'environment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Lighting Time of Day Selector */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Waktu & Langit:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSetTimeOfDay('day')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      state.timeOfDay === 'day' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" /> Siang
                  </button>
                  <button
                    onClick={() => onSetTimeOfDay('sunset')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      state.timeOfDay === 'sunset' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sunset className="w-3 h-3" /> Senja
                  </button>
                  <button
                    onClick={() => onSetTimeOfDay('night')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      state.timeOfDay === 'night' ? 'bg-indigo-900 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" /> Malam
                  </button>
                </div>
              </div>

              {/* Dynamic Ocean Wave Toggle & Speed */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <button
                  onClick={onToggleWaves}
                  className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <Waves className={`w-4 h-4 ${state.showWaves ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <span>Ombak Laut 3D:</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${state.showWaves ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {state.showWaves ? 'AKTIF' : 'TENANG'}
                  </span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-[11px]">Denyut:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={state.pulseSpeed}
                    onChange={(e) => onSetPulseSpeed(Number(e.target.value))}
                    className="w-18 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-400 text-[11px] tabular-nums">{state.pulseSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guidance Hint */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>
              💡 <strong>Interaksi 3D Langsung:</strong> Klik dan seret <strong>Kapal P</strong> atau <strong>Pelampung A & B</strong> langsung di air laut 3D.
            </span>
            <span className="text-slate-500 font-mono hidden md:inline">Drag • Orbit • Scroll Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};
