/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ARMode } from '../../types/maritime.ts';

export interface ARCallbacks {
  onModeChange: (mode: ARMode) => void;
  onError: (msg: string) => void;
}

export class ARManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private currentMode: ARMode = 'inactive';
  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private callbacks: ARCallbacks;
  private orientationListener: ((e: DeviceOrientationEvent) => void) | null = null;
  private deviceAlpha: number = 0;
  private deviceBeta: number = 0;
  private deviceGamma: number = 0;
  private baseCameraPos: THREE.Vector3 = new THREE.Vector3(0, 8, 20);

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    callbacks: ARCallbacks
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.callbacks = callbacks;
  }

  public async startAR(): Promise<boolean> {
    // 1. Try WebXR immersive-ar if available
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (supported) {
          const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay', 'light-estimation'],
            domOverlay: { root: document.body },
          });

          await this.renderer.xr.setSession(session);
          this.currentMode = 'webxr';
          this.callbacks.onModeChange('webxr');

          session.addEventListener('end', () => {
            this.stopAR();
          });
          return true;
        }
      } catch (err) {
        console.warn('WebXR AR initialization fell back to Camera Pass-through:', err);
      }
    }

    // 2. Universal Camera & Gyroscope Fallback
    return this.startCameraFallback();
  }

  private async startCameraFallback(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.callbacks.onError('Kamera tidak didukung pada browser ini.');
        return false;
      }

      // Request rear environment camera if on mobile, else standard webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.mediaStream = stream;

      // Create video element
      let video = document.getElementById('ar-passthrough-video') as HTMLVideoElement;
      if (!video) {
        video = document.createElement('video');
        video.id = 'ar-passthrough-video';
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';
        video.style.pointerEvents = 'none';
        document.body.prepend(video);
      }

      video.srcObject = stream;
      await video.play();
      this.videoElement = video;

      // Set WebGL canvas background transparent
      this.renderer.setClearColor(0x000000, 0);

      // Listen to Device Orientation / Gyroscope if available
      this.setupDeviceOrientation();

      this.currentMode = 'camera_fallback';
      this.callbacks.onModeChange('camera_fallback');
      return true;
    } catch (err) {
      console.error('Camera fallback error:', err);
      this.callbacks.onError('Izin kamera ditolak atau tidak tersedia.');
      this.stopAR();
      return false;
    }
  }

  private async setupDeviceOrientation() {
    if (typeof window === 'undefined') return;

    // Check if permission required (iOS 13+)
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const state = await DeviceOrientation.requestPermission();
        if (state !== 'granted') {
          console.warn('Device orientation permission denied on iOS');
          return;
        }
      } catch {
        // Safe ignore
      }
    }

    this.orientationListener = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) this.deviceAlpha = e.alpha;
      if (e.beta !== null) this.deviceBeta = e.beta;
      if (e.gamma !== null) this.deviceGamma = e.gamma;
    };

    window.addEventListener('deviceorientation', this.orientationListener, true);
  }

  public updateOrientationCamera() {
    if (this.currentMode !== 'camera_fallback') return;

    if (this.deviceBeta !== 0 || this.deviceGamma !== 0) {
      // Convert device orientation to smooth camera tilt
      const pitch = THREE.MathUtils.degToRad(this.deviceBeta - 45) * 0.4;
      const yaw = THREE.MathUtils.degToRad(this.deviceGamma) * 0.4;

      const r = 22;
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, Math.sin(yaw) * r, 3, 0.016);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 8 + Math.sin(pitch) * 12, 3, 0.016);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, Math.cos(yaw) * r, 3, 0.016);
      this.camera.lookAt(0, 1.5, 0);
    }
  }

  public stopAR() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.remove();
      this.videoElement = null;
    }

    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
    }

    if (this.renderer.xr.isPresenting) {
      this.renderer.xr.getSession()?.end();
    }

    this.currentMode = 'inactive';
    this.callbacks.onModeChange('inactive');
  }

  public getMode(): ARMode {
    return this.currentMode;
  }
}
