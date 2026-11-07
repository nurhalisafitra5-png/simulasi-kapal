/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createContainerTexture, createContactShadowTexture, DynamicTextBadge } from '../proceduralTextures.ts';
import { OceanWater } from '../environment/OceanWater.ts';

export class PatrolShip {
  public group: THREE.Group;
  public aimPointGroup: THREE.Group;
  private radarScanner: THREE.Mesh;
  private wakeRibbon: THREE.Mesh;
  private labelBadge: DynamicTextBadge;
  private currentAngle: number = 0;
  private radius: number = 14;

  constructor(radius: number = 14) {
    this.radius = radius;
    this.group = new THREE.Group();
    this.group.name = 'PatrolShipP';

    // 1. Primary Silhouette - Hull
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 3.2); // Bow tip
    hullShape.bezierCurveTo(1.2, 2.2, 1.4, 0.5, 1.3, -2.4); // Starboard curve
    hullShape.lineTo(0.9, -3.0); // Starboard stern corner
    hullShape.lineTo(-0.9, -3.0); // Port stern corner
    hullShape.bezierCurveTo(-1.4, -2.4, -1.2, 0.5, 0, 3.2); // Port curve back to bow

    const extrudeSettings = {
      depth: 1.1,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.2,
    };

    const hullGeom = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeom.rotateX(Math.PI / 2);
    hullGeom.rotateZ(Math.PI);
    hullGeom.translate(0, 0.6, 0);

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.75,
    });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.castShadow = true;
    hull.receiveShadow = true;
    this.group.add(hull);

    // 2. Secondary Silhouette - Superstructure Deckhouse & Bridge
    const bridgeGeom = new THREE.BoxGeometry(1.6, 1.0, 2.0);
    bridgeGeom.translate(0, 1.4, -0.6);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.2,
    });
    const bridge = new THREE.Mesh(bridgeGeom, bridgeMat);
    bridge.castShadow = true;
    this.group.add(bridge);

    // Bridge Windows (Wrap-around glass band)
    const windowGeom = new THREE.BoxGeometry(1.64, 0.32, 1.4);
    windowGeom.translate(0, 1.6, -0.4);
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9,
    });
    const windows = new THREE.Mesh(windowGeom, windowMat);
    this.group.add(windows);

    // 3. Accent - Radar Mast & Spinning Scanner Bar
    const mastGeom = new THREE.CylinderGeometry(0.04, 0.08, 1.2, 8);
    mastGeom.translate(0, 2.5, -0.6);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    this.group.add(mast);

    const scannerGeom = new THREE.BoxGeometry(0.8, 0.1, 0.15);
    scannerGeom.translate(0, 3.1, -0.6);
    const scannerMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.6 });
    this.radarScanner = new THREE.Mesh(scannerGeom, scannerMat);
    this.group.add(this.radarScanner);

    // 4. Accent - Twin Exhaust Funnels
    const funnelGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8);
    const funnelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const funnelLeft = new THREE.Mesh(funnelGeom, funnelMat);
    funnelLeft.position.set(-0.4, 2.1, -1.3);
    const funnelRight = new THREE.Mesh(funnelGeom, funnelMat);
    funnelRight.position.set(0.4, 2.1, -1.3);
    this.group.add(funnelLeft, funnelRight);

    // 5. Cargo Shipping Containers (Front Forward Deck)
    const cTexRed = createContainerTexture('#dc2626');
    const cTexBlue = createContainerTexture('#2563eb');
    const cTexAmber = createContainerTexture('#d97706');

    const containerGeom = new THREE.BoxGeometry(0.7, 0.6, 1.3);

    const c1 = new THREE.Mesh(containerGeom, new THREE.MeshStandardMaterial({ map: cTexRed, roughness: 0.6 }));
    c1.position.set(-0.4, 1.1, 1.0);
    c1.castShadow = true;

    const c2 = new THREE.Mesh(containerGeom, new THREE.MeshStandardMaterial({ map: cTexBlue, roughness: 0.6 }));
    c2.position.set(0.4, 1.1, 1.0);
    c2.castShadow = true;

    const c3 = new THREE.Mesh(containerGeom, new THREE.MeshStandardMaterial({ map: cTexAmber, roughness: 0.6 }));
    c3.position.set(0, 1.7, 0.9);
    c3.castShadow = true;

    this.group.add(c1, c2, c3);

    // 6. Navigation Lights (Port Red, Starboard Green)
    const portLightGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const portLight = new THREE.Mesh(portLightGeom, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    portLight.position.set(-0.85, 1.5, -0.6);

    const stbdLightGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const stbdLight = new THREE.Mesh(stbdLightGeom, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    stbdLight.position.set(0.85, 1.5, -0.6);
    this.group.add(portLight, stbdLight);

    // 7. Contact Shadow Decal Plane
    const shadowGeom = new THREE.PlaneGeometry(3.6, 6.8);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.position.y = 0.03;
    this.group.add(shadow);

    // 8. Dynamic Water Wake Ribbon Plane behind stern
    const wakeGeom = new THREE.PlaneGeometry(2.4, 6.0);
    wakeGeom.rotateX(-Math.PI / 2);
    wakeGeom.translate(0, 0.05, -5.0);
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.wakeRibbon = new THREE.Mesh(wakeGeom, wakeMat);
    this.group.add(this.wakeRibbon);

    // 9. Floating 3D Text Label
    this.labelBadge = new DynamicTextBadge('Kapal P (220°)', 'rgba(6, 182, 212, 0.9)', '#FFFFFF', 4.4, 1.1);
    this.labelBadge.sprite.position.set(0, 4.4, 0);
    this.group.add(this.labelBadge.sprite);

    // 10. Observation Deck Aim Point (Reference point for camera / sightlines)
    this.aimPointGroup = new THREE.Group();
    this.aimPointGroup.position.set(0, 1.9, 0);
    this.group.add(this.aimPointGroup);

    // Set initial position
    this.setAngle(this.currentAngle);
  }

  public setAngle(angleRad: number) {
    this.currentAngle = angleRad;
    const x = this.radius * Math.cos(angleRad);
    const z = this.radius * Math.sin(angleRad);
    this.group.position.x = x;
    this.group.position.z = z;

    // Orient ship tangent to circle plus forward heading
    this.group.rotation.y = -angleRad + Math.PI / 2;

    // Update 3D label with dynamic degree
    const deg = (Math.round((angleRad * 180) / Math.PI) % 360 + 360) % 360;
    this.labelBadge.updateText(`Kapal P (${deg}°)`);
  }

  public getAngle(): number {
    return this.currentAngle;
  }

  public getDeckWorldPosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.aimPointGroup.getWorldPosition(pos);
    return pos;
  }

  public update(time: number, isSoftwareGl: boolean = false) {
    // Spin radar scanner
    this.radarScanner.rotation.y = time * 3.5;

    // Buoyancy pitch, roll, and heave
    const x = this.group.position.x;
    const z = this.group.position.z;
    const waveY = OceanWater.getWaveHeight(x, z, time);
    this.group.position.y = waveY * 0.7;

    if (!isSoftwareGl) {
      this.group.rotation.z = Math.sin(time * 2.1) * 0.05;
      this.group.rotation.x = Math.cos(time * 1.7) * 0.03;
    }
  }

  public setRadius(radius: number) {
    this.radius = radius;
    this.setAngle(this.currentAngle);
  }
}
