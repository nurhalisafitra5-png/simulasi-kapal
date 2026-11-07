/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OceanWater } from './environment/OceanWater.ts';
import { RadarStation } from './models/RadarStation.ts';
import { PatrolShip } from './models/PatrolShip.ts';
import { Buoy } from './models/Buoy.ts';
import { AngleVisualization } from './geometry/AngleVisualization.ts';
import { ARManager } from './ar/ARManager.ts';
import { CalculatedAngles, CameraViewMode, SimulationState, TimeOfDay } from '../types/maritime.ts';
import { soundFx } from '../utils/audioSynthesizer.ts';

export interface SceneCallbacks {
  onAnglesUpdate: (angles: CalculatedAngles) => void;
  onAngleChangeByUser: (key: 'A' | 'B' | 'P', rad: number) => void;
  onARModeChange: (mode: SimulationState['arMode']) => void;
  onToast: (msg: string) => void;
}

export class MaritimeScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private pmremGenerator: THREE.PMREMGenerator;

  // Environment & Lights
  private ocean: OceanWater;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // 3D Objects
  private radarStation: RadarStation;
  private shipP: PatrolShip;
  private buoyA: Buoy;
  private buoyB: Buoy;
  private angleVis: AngleVisualization;

  // AR Manager
  public arManager: ARManager;

  // Raycasting & Dragging
  private raycaster: THREE.Raycaster;
  private mousePos: THREE.Vector2;
  private dragPlane: THREE.Plane;
  private activeDragTarget: 'A' | 'B' | 'P' | null = null;

  // Performance & Loop
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;
  private callbacks: SceneCallbacks;

  // Camera transition targets
  private cameraMode: CameraViewMode = 'orbit';
  private targetCamPos: THREE.Vector3 = new THREE.Vector3(0, 18, 28);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 2, 0);

  // State
  private state: SimulationState;

  constructor(container: HTMLElement, initialState: SimulationState, callbacks: SceneCallbacks) {
    this.container = container;
    this.state = { ...initialState };
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mousePos = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup WebGL Canvas & Renderer
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block select-none';
    this.container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // 3. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040d1a, 0.015);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 300);
    this.camera.position.set(0, 18, 28);
    this.camera.lookAt(0, 2, 0);

    // 4. Studio Environment Reflection
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 5. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below sea level
    this.controls.minDistance = 6;
    this.controls.maxDistance = 65;
    this.controls.target.set(0, 2, 0);

    // 6. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.7);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    this.dirLight.position.set(22, 28, 18);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 70;
    this.dirLight.shadow.camera.left = -22;
    this.dirLight.shadow.camera.right = 22;
    this.dirLight.shadow.camera.top = 22;
    this.dirLight.shadow.camera.bottom = -22;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // 7. Instantiate 3D Objects
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.ocean = new OceanWater(85, 64);
    this.scene.add(this.ocean.mesh);

    this.radarStation = new RadarStation();
    this.scene.add(this.radarStation.group);

    this.buoyA = new Buoy('A', this.state.angleA, this.state.radius);
    this.scene.add(this.buoyA.group);

    this.buoyB = new Buoy('B', this.state.angleB, this.state.radius);
    this.scene.add(this.buoyB.group);

    this.shipP = new PatrolShip(this.state.radius);
    this.shipP.setAngle(this.state.angleP);
    this.scene.add(this.shipP.group);

    this.angleVis = new AngleVisualization(this.state.radius, maxAnisotropy);
    this.scene.add(this.angleVis.group);

    // 8. AR Manager Setup
    this.arManager = new ARManager(this.renderer, this.scene, this.camera, {
      onModeChange: (mode) => {
        this.state.arMode = mode;
        this.callbacks.onARModeChange(mode);
        if (mode === 'inactive') {
          this.applyTimeOfDay(this.state.timeOfDay);
        } else {
          this.renderer.setClearColor(0x000000, 0);
        }
      },
      onError: (msg) => {
        this.callbacks.onToast(msg);
      },
    });

    // 9. Input & Drag Listeners
    this.bindEvents();

    // 10. Initial geometry calculation & render
    this.applyTimeOfDay(this.state.timeOfDay);
    this.calculateAndUpdateAngles();
    this.startLoop();
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private updateMousePos(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown = (e: PointerEvent) => {
    this.updateMousePos(e);
    this.raycaster.setFromCamera(this.mousePos, this.camera);

    // Raycast hit check against Ship P, Buoy A, and Buoy B
    const hitP = this.raycaster.intersectObject(this.shipP.group, true);
    if (hitP.length > 0) {
      this.activeDragTarget = 'P';
      this.controls.enabled = false;
      this.canvas.style.cursor = 'grabbing';
      soundFx.playBeaconChime();
      return;
    }

    const hitA = this.raycaster.intersectObject(this.buoyA.group, true);
    if (hitA.length > 0) {
      this.activeDragTarget = 'A';
      this.controls.enabled = false;
      this.canvas.style.cursor = 'grabbing';
      soundFx.playBeaconChime();
      return;
    }

    const hitB = this.raycaster.intersectObject(this.buoyB.group, true);
    if (hitB.length > 0) {
      this.activeDragTarget = 'B';
      this.controls.enabled = false;
      this.canvas.style.cursor = 'grabbing';
      soundFx.playBeaconChime();
      return;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.activeDragTarget) return;

    this.updateMousePos(e);
    this.raycaster.setFromCamera(this.mousePos, this.camera);

    const hitPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, hitPoint)) {
      let rad = Math.atan2(hitPoint.z, hitPoint.x);
      if (rad < 0) rad += Math.PI * 2;

      if (this.activeDragTarget === 'P') {
        this.state.angleP = rad;
        this.shipP.setAngle(rad);
        this.callbacks.onAngleChangeByUser('P', rad);
      } else if (this.activeDragTarget === 'A') {
        this.state.angleA = rad;
        this.buoyA.setAngle(rad);
        this.callbacks.onAngleChangeByUser('A', rad);
      } else if (this.activeDragTarget === 'B') {
        this.state.angleB = rad;
        this.buoyB.setAngle(rad);
        this.callbacks.onAngleChangeByUser('B', rad);
      }

      this.calculateAndUpdateAngles();
    }
  };

  private onPointerUp = () => {
    if (this.activeDragTarget) {
      this.activeDragTarget = null;
      this.controls.enabled = true;
      this.canvas.style.cursor = 'default';
    }
  };

  public calculateAngles(): CalculatedAngles {
    let a1 = this.state.angleA % (Math.PI * 2);
    let a2 = this.state.angleB % (Math.PI * 2);
    let p = this.state.angleP % (Math.PI * 2);

    if (a1 < 0) a1 += Math.PI * 2;
    if (a2 < 0) a2 += Math.PI * 2;
    if (p < 0) p += Math.PI * 2;

    // Direct angle difference for central angle (∠AOB)
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) {
      diff = Math.PI * 2 - diff;
    }

    const aobDeg = (diff * 180) / Math.PI;

    // Vector calculation for exact angle formed at P by optical sightlines PA and PB
    const ax = Math.cos(a1);
    const az = Math.sin(a1);
    const bx = Math.cos(a2);
    const bz = Math.sin(a2);
    const px = Math.cos(p);
    const pz = Math.sin(p);

    const vPAx = ax - px;
    const vPAz = az - pz;
    const vPBx = bx - px;
    const vPBz = bz - pz;
    const lenPA = Math.hypot(vPAx, vPAz);
    const lenPB = Math.hypot(vPBx, vPBz);

    let apbDeg = aobDeg / 2;
    let isOppositeArc = false;
    if (lenPA > 0.001 && lenPB > 0.001) {
      const dot = Math.max(-1, Math.min(1, (vPAx * vPBx + vPAz * vPBz) / (lenPA * lenPB)));
      const actualAngleDeg = (Math.acos(dot) * 180) / Math.PI;
      apbDeg = actualAngleDeg;
      isOppositeArc = Math.abs(actualAngleDeg - aobDeg / 2) > 0.5;
    }

    return {
      aobDeg,
      apbDeg,
      arcDeg: aobDeg,
      isOppositeArc,
    };
  }

  public calculateAndUpdateAngles() {
    const angles = this.calculateAngles();
    this.callbacks.onAnglesUpdate(angles);

    const posO = new THREE.Vector3(0, 0, 0);
    const posA = this.buoyA.getWorldPosition();
    const posB = this.buoyB.getWorldPosition();
    const posP = this.shipP.getDeckWorldPosition();

    this.angleVis.updateGeometry(
      posO,
      posA,
      posB,
      posP,
      this.state.angleA,
      this.state.angleB,
      this.state.angleP,
      angles,
      this.clock.getElapsedTime(),
      this.state.pulseSpeed
    );
  }

  public setAngleP(deg: number) {
    const rad = THREE.MathUtils.degToRad(deg);
    this.state.angleP = rad;
    this.shipP.setAngle(rad);
    this.calculateAndUpdateAngles();
  }

  public setAngleA(deg: number) {
    const rad = THREE.MathUtils.degToRad(deg);
    this.state.angleA = rad;
    this.buoyA.setAngle(rad);
    this.calculateAndUpdateAngles();
  }

  public setAngleB(deg: number) {
    const rad = THREE.MathUtils.degToRad(deg);
    this.state.angleB = rad;
    this.buoyB.setAngle(rad);
    this.calculateAndUpdateAngles();
  }

  public setCameraMode(mode: CameraViewMode) {
    this.cameraMode = mode;
    this.state.cameraMode = mode;

    if (mode === 'orbit') {
      this.controls.enabled = true;
      this.targetCamPos.set(0, 18, 28);
      this.targetLookAt.set(0, 2, 0);
    } else if (mode === 'ship') {
      this.controls.enabled = false;
      const shipPos = this.shipP.group.position;
      this.targetCamPos.set(shipPos.x * 0.95, shipPos.y + 3.2, shipPos.z * 0.95);
      this.targetLookAt.set(0, 2, 0); // Look towards radar center and buoys
    } else if (mode === 'tower') {
      this.controls.enabled = false;
      this.targetCamPos.set(0, 7.8, 0);
      const shipPos = this.shipP.group.position;
      this.targetLookAt.set(shipPos.x, 1.5, shipPos.z);
    } else if (mode === 'tactical') {
      this.controls.enabled = false;
      this.targetCamPos.set(0, 36, 0.001);
      this.targetLookAt.set(0, 0, 0);
    }
  }

  public applyTimeOfDay(tod: TimeOfDay) {
    this.state.timeOfDay = tod;
    this.ocean.setTimeOfDay(tod);

    if (tod === 'day') {
      this.scene.background = new THREE.Color(0x0a1e38);
      this.scene.fog = new THREE.FogExp2(0x0a1e38, 0.012);
      this.hemiLight.color.setHex(0x38bdf8);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.hemiLight.intensity = 0.85;
      this.dirLight.color.setHex(0xfffaed);
      this.dirLight.intensity = 2.0;
    } else if (tod === 'sunset') {
      this.scene.background = new THREE.Color(0x1a1226);
      this.scene.fog = new THREE.FogExp2(0x1a1226, 0.015);
      this.hemiLight.color.setHex(0xfb923c);
      this.hemiLight.groundColor.setHex(0x1e1b4b);
      this.hemiLight.intensity = 0.65;
      this.dirLight.color.setHex(0xf97316);
      this.dirLight.intensity = 1.4;
    } else {
      // Night
      this.scene.background = new THREE.Color(0x020712);
      this.scene.fog = new THREE.FogExp2(0x020712, 0.018);
      this.hemiLight.color.setHex(0x0284c7);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.35;
      this.dirLight.color.setHex(0x38bdf8);
      this.dirLight.intensity = 0.6;
    }
  }

  public setPulseSpeed(speed: number) {
    this.state.pulseSpeed = speed;
  }

  public toggleAR(): Promise<boolean> {
    if (this.state.arMode !== 'inactive') {
      this.arManager.stopAR();
      return Promise.resolve(false);
    } else {
      return this.arManager.startAR();
    }
  }

  private startLoop() {
    const tick = () => {
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // 1. Update ocean waves and floating objects
      if (this.state.showWaves) {
        this.ocean.update(elapsed, this.isSoftwareGl);
      }
      this.radarStation.update(elapsed, this.state.pulseSpeed, this.state.radius);
      this.buoyA.update(elapsed, this.isSoftwareGl);
      this.buoyB.update(elapsed, this.isSoftwareGl);
      this.shipP.update(elapsed, this.isSoftwareGl);

      // 2. Geometry pulses & lines
      const posO = new THREE.Vector3(0, 0, 0);
      const posA = this.buoyA.getWorldPosition();
      const posB = this.buoyB.getWorldPosition();
      const posP = this.shipP.getDeckWorldPosition();
      this.angleVis.updateGeometry(
        posO,
        posA,
        posB,
        posP,
        this.state.angleA,
        this.state.angleB,
        this.state.angleP,
        this.calculateAngles(),
        elapsed,
        this.state.pulseSpeed
      );

      // 3. Smooth Camera Damping Transition if in scripted mode
      if (this.cameraMode !== 'orbit' && this.state.arMode === 'inactive') {
        const k = 4.5;
        this.camera.position.lerp(this.targetCamPos, 1 - Math.exp(-k * delta));
        this.controls.target.lerp(this.targetLookAt, 1 - Math.exp(-k * delta));
        this.camera.lookAt(this.controls.target);
      } else if (this.controls.enabled) {
        this.controls.update();
      }

      // 4. Update AR Camera Orientation if in fallback camera mode
      if (this.state.arMode === 'camera_fallback') {
        this.arManager.updateOrientationCamera();
      }

      // 5. Render Scene
      this.renderer.render(this.scene, this.camera);

      // 6. Loop Pacing
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    this.arManager.stopAR();
    this.controls.dispose();
    this.pmremGenerator.dispose();
    this.ocean.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
