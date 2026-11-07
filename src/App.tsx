/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MaritimeScene } from './three/MaritimeScene.ts';
import { CalculatedAngles, CameraViewMode, SimulationState, TimeOfDay } from './types/maritime.ts';
import { NavigationHeader } from './components/NavigationHeader.tsx';
import { MathVerificationHUD } from './components/MathVerificationHUD.tsx';
import { ControlsDock } from './components/ControlsDock.tsx';
import { QuizModal } from './components/QuizModal.tsx';
import { AROverlayHUD } from './components/AROverlayHUD.tsx';
import { soundFx } from './utils/audioSynthesizer.ts';

const INITIAL_STATE: SimulationState = {
  angleA: (20 * Math.PI) / 180,
  angleB: (100 * Math.PI) / 180,
  angleP: (220 * Math.PI) / 180,
  radius: 14,
  timeOfDay: 'day',
  cameraMode: 'orbit',
  arMode: 'inactive',
  showWaves: true,
  showRays: true,
  pulseSpeed: 1.0,
  soundEnabled: true,
  isZenMode: false,
};

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MaritimeScene | null>(null);

  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [calculatedAngles, setCalculatedAngles] = useState<CalculatedAngles>({
    aobDeg: 80.0,
    apbDeg: 40.0,
    arcDeg: 80.0,
    isOppositeArc: false,
  });
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  }, []);

  // Initialize Three.js scene once in stable ref container
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new MaritimeScene(mountRef.current, INITIAL_STATE, {
      onAnglesUpdate: (angles) => {
        setCalculatedAngles(angles);
      },
      onAngleChangeByUser: (key, rad) => {
        setState((prev) => {
          if (key === 'P') return { ...prev, angleP: rad };
          if (key === 'A') return { ...prev, angleA: rad };
          return { ...prev, angleB: rad };
        });
      },
      onARModeChange: (mode) => {
        setState((prev) => ({ ...prev, arMode: mode }));
        if (mode !== 'inactive') {
          showToast(
            mode === 'webxr'
              ? 'Mode WebXR AR Aktif. Arahkan kamera ke permukaan bidang datar.'
              : 'Mode Kamera AR Passthrough Aktif. Menggunakan kamera dan sensor kompas.'
          );
        }
      },
      onToast: (msg) => {
        showToast(msg);
      },
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [showToast]);

  // Handler for setting Ship P angle
  const handleSetAngleP = useCallback((deg: number) => {
    setState((prev) => ({ ...prev, angleP: (deg * Math.PI) / 180 }));
    sceneRef.current?.setAngleP(deg);
  }, []);

  // Handler for setting Buoy A angle
  const handleSetAngleA = useCallback((deg: number) => {
    setState((prev) => ({ ...prev, angleA: (deg * Math.PI) / 180 }));
    sceneRef.current?.setAngleA(deg);
  }, []);

  // Handler for setting Buoy B angle
  const handleSetAngleB = useCallback((deg: number) => {
    setState((prev) => ({ ...prev, angleB: (deg * Math.PI) / 180 }));
    sceneRef.current?.setAngleB(deg);
  }, []);

  // Handler for setting radar pulse speed
  const handleSetPulseSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, pulseSpeed: speed }));
    sceneRef.current?.setPulseSpeed(speed);
  }, []);

  // Handler for setting camera view mode
  const handleSetCameraMode = useCallback((mode: CameraViewMode) => {
    setState((prev) => ({ ...prev, cameraMode: mode }));
    sceneRef.current?.setCameraMode(mode);
    soundFx.playBeaconChime();
  }, []);

  // Handler for setting time of day
  const handleSetTimeOfDay = useCallback((tod: TimeOfDay) => {
    setState((prev) => ({ ...prev, timeOfDay: tod }));
    sceneRef.current?.applyTimeOfDay(tod);
  }, []);

  // Handler for toggling dynamic ocean waves
  const handleToggleWaves = useCallback(() => {
    setState((prev) => {
      const nextVal = !prev.showWaves;
      return { ...prev, showWaves: nextVal };
    });
  }, []);

  // Handler for resetting position to defaults
  const handleResetPositions = useCallback(() => {
    handleSetAngleA(20);
    handleSetAngleB(100);
    handleSetAngleP(220);
    handleSetCameraMode('orbit');
    soundFx.playSonarPing();
    showToast('Posisi Kapal dan Pelampung telah direset ke posisi awal.');
  }, [handleSetAngleA, handleSetAngleB, handleSetAngleP, handleSetCameraMode, showToast]);

  // Handler for toggling sound effects
  const handleToggleSound = useCallback(() => {
    setState((prev) => {
      const nextSound = !prev.soundEnabled;
      soundFx.setMuted(!nextSound);
      if (nextSound) soundFx.playSonarPing();
      return { ...prev, soundEnabled: nextSound };
    });
  }, []);

  // Handler for toggling AR mode
  const handleToggleAR = useCallback(async () => {
    if (!sceneRef.current) return;
    try {
      await sceneRef.current.toggleAR();
    } catch (err) {
      console.error(err);
      showToast('Gagal memulai mode Augmented Reality.');
    }
  }, [showToast]);

  // Handler for applying quiz preset to 3D scene
  const handleApplyQuizPreset = useCallback(
    (aDeg: number, bDeg: number, pDeg: number) => {
      handleSetAngleA(aDeg);
      handleSetAngleB(bDeg);
      handleSetAngleP(pDeg);
      soundFx.playSuccessChime();
      showToast(`Posisi diterapkan: ∠AOB = ${Math.abs(bDeg - aDeg)}°, ∠APB = ${(Math.abs(bDeg - aDeg) / 2).toFixed(1)}°`);
    },
    [handleSetAngleA, handleSetAngleB, handleSetAngleP, showToast]
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#020712] select-none text-slate-100 font-sans">
      {/* 3D Canvas Mounting Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />

      {/* Navigation Header */}
      {!state.isZenMode && (
        <NavigationHeader
          arMode={state.arMode}
          onToggleAR={handleToggleAR}
          soundEnabled={state.soundEnabled}
          onToggleSound={handleToggleSound}
          isZenMode={state.isZenMode}
          onToggleZenMode={() => setState((prev) => ({ ...prev, isZenMode: !prev.isZenMode }))}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />
      )}

      {/* Floating Zen Mode Restore Button when in Zen Mode */}
      {state.isZenMode && (
        <button
          onClick={() => setState((prev) => ({ ...prev, isZenMode: false }))}
          className="fixed top-4 left-4 z-30 px-3.5 py-1.5 bg-[#070e1c]/90 hover:bg-slate-800 text-xs font-semibold text-cyan-400 border border-slate-800 rounded-xl shadow-2xl transition-all cursor-pointer backdrop-blur-md"
        >
          Keluar dari Mode Zen
        </button>
      )}

      {/* Real-time Math Verification HUD */}
      {!state.isZenMode && <MathVerificationHUD angles={calculatedAngles} />}

      {/* Collapsible Bottom Controls Dock */}
      {!state.isZenMode && (
        <ControlsDock
          state={state}
          onSetAngleP={handleSetAngleP}
          onSetAngleA={handleSetAngleA}
          onSetAngleB={handleSetAngleB}
          onSetPulseSpeed={handleSetPulseSpeed}
          onSetCameraMode={handleSetCameraMode}
          onSetTimeOfDay={handleSetTimeOfDay}
          onToggleWaves={handleToggleWaves}
          onResetPositions={handleResetPositions}
        />
      )}

      {/* AR Guidance Overlay */}
      {state.arMode !== 'inactive' && (
        <AROverlayHUD arMode={state.arMode} onExitAR={() => sceneRef.current?.arManager.stopAR()} />
      )}

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onApplyPreset={handleApplyQuizPreset}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
