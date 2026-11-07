/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createContactShadowTexture, DynamicTextBadge } from '../proceduralTextures.ts';
import { OceanWater } from '../environment/OceanWater.ts';

export class Buoy {
  public group: THREE.Group;
  public label: string;
  private lantern: THREE.Mesh;
  private lanternLight: THREE.PointLight;
  private rippleRing: THREE.Mesh;
  private labelBadge: DynamicTextBadge;
  private currentAngle: number = 0;
  private radius: number = 14;

  constructor(label: string = 'A', initialAngle: number = 0, radius: number = 14) {
    this.label = label;
    this.radius = radius;
    this.currentAngle = initialAngle;
    this.group = new THREE.Group();
    this.group.name = `Buoy_${label}`;

    // 1. Buoyant Lower Float Hull (Cone-Cylinder body)
    const hullGeom = new THREE.CylinderGeometry(0.85, 0.45, 1.2, 16);
    hullGeom.translate(0, 0.6, 0);
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.4,
    });
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.castShadow = true;
    this.group.add(hull);

    // Hazard reflective band
    const bandGeom = new THREE.CylinderGeometry(0.86, 0.75, 0.35, 16);
    bandGeom.translate(0, 0.75, 0);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const band = new THREE.Mesh(bandGeom, bandMat);
    this.group.add(band);

    // 2. Superstructure Steel Cage (4 struts)
    const strutGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
    const strutMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.2,
      metalness: 0.8,
    });

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const strut = new THREE.Mesh(strutGeom, strutMat);
      strut.position.set(Math.cos(a) * 0.45, 1.8, Math.sin(a) * 0.45);
      this.group.add(strut);
    }

    // Top ring
    const ringGeom = new THREE.TorusGeometry(0.45, 0.04, 8, 16);
    ringGeom.rotateX(Math.PI / 2);
    ringGeom.translate(0, 2.4, 0);
    const ring = new THREE.Mesh(ringGeom, strutMat);
    this.group.add(ring);

    // 3. Flashing Marine Beacon Lantern
    const lanternColor = label === 'A' ? 0xef4444 : 0x10b981; // Red for A, Green for B (marine standard)
    const lanternGeom = new THREE.SphereGeometry(0.2, 12, 12);
    lanternGeom.translate(0, 2.6, 0);
    const lanternMat = new THREE.MeshBasicMaterial({ color: lanternColor });
    this.lantern = new THREE.Mesh(lanternGeom, lanternMat);
    this.group.add(this.lantern);

    this.lanternLight = new THREE.PointLight(lanternColor, 1.2, 12);
    this.lanternLight.position.set(0, 2.6, 0);
    this.group.add(this.lanternLight);

    // 4. Contact Water Ripple Ring
    const rippleGeom = new THREE.RingGeometry(0.9, 1.3, 24);
    rippleGeom.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.rippleRing = new THREE.Mesh(rippleGeom, rippleMat);
    this.rippleRing.position.y = 0.05;
    this.group.add(this.rippleRing);

    // 5. Contact Shadow
    const shadowGeom = new THREE.PlaneGeometry(2.6, 2.6);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.position.y = 0.03;
    this.group.add(shadow);

    // 6. Floating 3D Text Label Sprite
    const initialDeg = (Math.round((initialAngle * 180) / Math.PI) % 360 + 360) % 360;
    const badgeColor = label === 'A' ? 'rgba(217, 119, 6, 0.92)' : 'rgba(16, 185, 129, 0.92)';
    this.labelBadge = new DynamicTextBadge(`Pelampung ${label} (${initialDeg}°)`, badgeColor, '#FFFFFF', 4.4, 1.1);
    this.labelBadge.sprite.position.set(0, 3.6, 0);
    this.group.add(this.labelBadge.sprite);

    this.setAngle(initialAngle);
  }

  public setAngle(angleRad: number) {
    this.currentAngle = angleRad;
    const x = this.radius * Math.cos(angleRad);
    const z = this.radius * Math.sin(angleRad);
    this.group.position.x = x;
    this.group.position.z = z;

    // Update 3D label degree
    const deg = (Math.round((angleRad * 180) / Math.PI) % 360 + 360) % 360;
    this.labelBadge.updateText(`Pelampung ${this.label} (${deg}°)`);
  }

  public getAngle(): number {
    return this.currentAngle;
  }

  public getWorldPosition(target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    return this.group.getWorldPosition(target);
  }

  public update(time: number, isSoftwareGl: boolean = false) {
    // Water ripple expansion
    const rippleScale = 1.0 + Math.sin(time * 3.5) * 0.25;
    this.rippleRing.scale.set(rippleScale, rippleScale, 1);

    // Lantern blink rhythm
    const blink = Math.sin(time * 5.0 + (this.label === 'A' ? 0 : 2.0)) > 0.1;
    this.lanternLight.intensity = blink ? 1.8 : 0.2;

    // Ocean water buoyancy
    const x = this.group.position.x;
    const z = this.group.position.z;
    const waveY = OceanWater.getWaveHeight(x, z, time);
    this.group.position.y = waveY * 0.8;

    if (!isSoftwareGl) {
      this.group.rotation.z = Math.sin(time * 2.8) * 0.06;
      this.group.rotation.x = Math.cos(time * 2.4) * 0.06;
    }
  }

  public setRadius(radius: number) {
    this.radius = radius;
    this.setAngle(this.currentAngle);
  }
}
