/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type CameraViewMode = 'orbit' | 'ship' | 'tower' | 'tactical';

export type ARMode = 'inactive' | 'webxr' | 'camera_fallback';

export interface SimulationState {
  angleA: number; // in radians [0, 2π)
  angleB: number; // in radians [0, 2π)
  angleP: number; // in radians [0, 2π)
  radius: number;
  timeOfDay: TimeOfDay;
  cameraMode: CameraViewMode;
  arMode: ARMode;
  showWaves: boolean;
  showRays: boolean;
  pulseSpeed: number;
  soundEnabled: boolean;
  isZenMode: boolean;
}

export interface CalculatedAngles {
  aobDeg: number; // Central angle (∠AOB) in degrees
  apbDeg: number; // Inscribed angle (∠APB) in degrees
  arcDeg: number; // Common intercepted arc length in degrees
  isOppositeArc: boolean; // When P is on the minor arc vs major arc
}

export interface QuizQuestion {
  id: number;
  title: string;
  question: string;
  givenAOB?: number;
  givenAPB?: number;
  targetProperty: 'find_apb' | 'find_aob' | 'position_ship';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  targetSetup?: {
    angleA: number;
    angleB: number;
    targetAngleP?: number;
  };
}
