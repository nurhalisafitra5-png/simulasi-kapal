/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createContactShadowTexture, createTextSprite } from '../proceduralTextures.ts';

export class RadarStation {
  public group: THREE.Group;
  public towerEyePoint: THREE.Group;
  private radarDishGroup: THREE.Group;
  private pulseRings: THREE.Mesh[] = [];
  private beaconLight: THREE.PointLight;
  private beaconLens: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'RadarStationO';

    // 1. Natural Rocky Island Base (Stratified stone atoll)
    const islandGeom = new THREE.CylinderGeometry(4.2, 5.8, 1.2, 16);
    islandGeom.translate(0, 0.5, 0);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const island = new THREE.Mesh(islandGeom, islandMat);
    island.receiveShadow = true;
    this.group.add(island);

    // Island Top Sand/Concrete Surface
    const surfaceGeom = new THREE.CylinderGeometry(3.8, 4.2, 0.3, 16);
    surfaceGeom.translate(0, 1.25, 0);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.2,
    });
    const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
    surface.receiveShadow = true;
    this.group.add(surface);

    // 2. Concrete Fortress Foundation Platform
    const platformGeom = new THREE.BoxGeometry(3.0, 0.6, 3.0);
    platformGeom.translate(0, 1.55, 0);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.3,
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.group.add(platform);

    // 3. Steel Lattice Radar Tower Pillars (4 Corner Pylons)
    const pylonGeom = new THREE.CylinderGeometry(0.08, 0.12, 4.5, 6);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85,
    });

    const pylonOffsets = [
      [-1.0, -1.0],
      [1.0, -1.0],
      [1.0, 1.0],
      [-1.0, 1.0],
    ];

    pylonOffsets.forEach(([ox, oz]) => {
      const pylon = new THREE.Mesh(pylonGeom, pylonMat);
      pylon.position.set(ox * 0.9, 3.9, oz * 0.9);
      pylon.castShadow = true;
      this.group.add(pylon);
    });

    // Horizontal Tower Strut Rings
    [2.8, 4.2, 5.6].forEach((yLevel) => {
      const strutGeom = new THREE.BoxGeometry(2.0, 0.1, 2.0);
      strutGeom.translate(0, yLevel, 0);
      const strut = new THREE.Mesh(strutGeom, pylonMat);
      this.group.add(strut);
    });

    // 4. Hexagonal Command & Operations Room Cabin
    const cabinGeom = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 6);
    cabinGeom.translate(0, 6.4, 0);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.6,
    });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Wrap-around Observation Windows
    const cabinWinGeom = new THREE.CylinderGeometry(1.65, 1.65, 0.45, 6);
    cabinWinGeom.translate(0, 6.5, 0);
    const cabinWinMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const cabinWin = new THREE.Mesh(cabinWinGeom, cabinWinMat);
    this.group.add(cabinWin);

    // 5. Upper Gantry & Parabolic Rotating Radar Array
    this.radarDishGroup = new THREE.Group();
    this.radarDishGroup.position.set(0, 7.3, 0);

    // Pedestal
    const pedGeom = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8);
    const ped = new THREE.Mesh(pedGeom, pylonMat);
    this.radarDishGroup.add(ped);

    // Curved parabolic reflector dish
    const dishCurve = new THREE.CylinderGeometry(1.5, 1.5, 0.7, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    dishCurve.rotateZ(Math.PI / 2);
    dishCurve.translate(0, 0.7, -0.2);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.2,
      metalness: 0.8,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishCurve, dishMat);
    this.radarDishGroup.add(dish);

    // Feed horn antenna boom
    const hornGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
    hornGeom.rotateX(Math.PI / 2);
    hornGeom.translate(0, 0.7, 0.4);
    const horn = new THREE.Mesh(hornGeom, dishMat);
    this.radarDishGroup.add(horn);

    this.group.add(this.radarDishGroup);

    // 6. Flashing Maritime Beacon Top Lantern
    const lensGeom = new THREE.SphereGeometry(0.2, 8, 8);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    this.beaconLens = new THREE.Mesh(lensGeom, lensMat);
    this.beaconLens.position.set(0, 8.4, 0);
    this.group.add(this.beaconLens);

    this.beaconLight = new THREE.PointLight(0xf59e0b, 1.5, 20);
    this.beaconLight.position.set(0, 8.4, 0);
    this.group.add(this.beaconLight);

    // 7. Tower Eye Point (for first-person observation camera mode)
    this.towerEyePoint = new THREE.Group();
    this.towerEyePoint.position.set(0, 6.7, 0);
    this.group.add(this.towerEyePoint);

    // 8. Contact Shadow Grounding
    const shadowGeom = new THREE.PlaneGeometry(12, 12);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.position.y = 0.04;
    this.group.add(shadow);

    // 9. Floating 3D Text Label
    const labelSprite = createTextSprite('Stasiun Radar O (Pusat)', 'rgba(245, 158, 11, 0.85)', '#FFFFFF');
    labelSprite.position.set(0, 9.8, 0);
    this.group.add(labelSprite);

    // 10. Concentric Radar Pulse Rings
    for (let i = 0; i < 3; i++) {
      const ringGeom = new THREE.RingGeometry(0.5, 0.7, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = 0.08;
      this.pulseRings.push(ring);
      this.group.add(ring);
    }
  }

  public getTowerEyeWorldPosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.towerEyePoint.getWorldPosition(pos);
    return pos;
  }

  public update(time: number, pulseSpeed: number = 1.0, maxRadius: number = 14) {
    // Spin radar dish
    this.radarDishGroup.rotation.y = time * 2.2 * pulseSpeed;

    // Beacon blink
    const blink = Math.sin(time * 6.0) > 0.4 ? 2.5 : 0.3;
    this.beaconLight.intensity = blink;

    // Expand radar wave rings
    const ringCount = this.pulseRings.length;
    this.pulseRings.forEach((ring, idx) => {
      const progress = ((time * 0.45 * pulseSpeed + idx / ringCount) % 1.0);
      const r = progress * maxRadius;
      ring.scale.set(r, r, 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1.0 - progress) * 0.45;
    });
  }
}
