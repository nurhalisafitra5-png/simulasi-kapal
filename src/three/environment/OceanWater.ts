/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class OceanWater {
  public mesh: THREE.Mesh;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshStandardMaterial;
  private originalPositions: Float32Array;

  constructor(size: number = 80, segments: number = 64) {
    this.geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    this.geometry.rotateX(-Math.PI / 2);

    // Save initial planar vertex positions for wave calculations
    const posAttr = this.geometry.attributes.position;
    this.originalPositions = new Float32Array(posAttr.array);

    this.material = new THREE.MeshStandardMaterial({
      color: 0x081e3a,
      roughness: 0.12,
      metalness: 0.65,
      flatShading: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.position.y = 0;
  }

  /**
   * Calculates wave height at any world (x, z) coordinate given an elapsed time
   */
  public static getWaveHeight(x: number, z: number, time: number): number {
    const wave1 = Math.sin(x * 0.28 + time * 1.8) * Math.cos(z * 0.28 + time * 1.4) * 0.22;
    const wave2 = Math.sin(x * 0.65 - time * 2.2 + z * 0.45) * 0.1;
    const wave3 = Math.cos(Math.sqrt(x * x + z * z) * 0.4 - time * 2.5) * 0.08;
    return wave1 + wave2 + wave3;
  }

  /**
   * Updates wave mesh vertices per frame
   */
  public update(time: number, isSoftwareGl: boolean = false) {
    if (isSoftwareGl) return; // Skip heavy per-vertex animation on software WebGL

    const posAttr = this.geometry.attributes.position;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const x = this.originalPositions[i * 3];
      const z = this.originalPositions[i * 3 + 2];
      const waveH = OceanWater.getWaveHeight(x, z, time);
      posAttr.setY(i, waveH);
    }

    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  public setTimeOfDay(timeOfDay: 'day' | 'sunset' | 'night') {
    if (timeOfDay === 'day') {
      this.material.color.setHex(0x0a3258);
      this.material.roughness = 0.15;
    } else if (timeOfDay === 'sunset') {
      this.material.color.setHex(0x192138);
      this.material.roughness = 0.1;
    } else {
      this.material.color.setHex(0x040d1a);
      this.material.roughness = 0.08;
    }
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
