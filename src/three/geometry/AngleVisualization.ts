/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createRadarDialTexture, DynamicTextBadge } from '../proceduralTextures.ts';
import { CalculatedAngles } from '../../types/maritime.ts';

export class AngleVisualization {
  public group: THREE.Group;

  // 1. Ray Lines
  private lineOA: THREE.Line;
  private lineOB: THREE.Line;
  private linePA: THREE.Line;
  private linePB: THREE.Line;

  // 2. Animated Pulse Particles along rays
  private pulseMeshOA: THREE.InstancedMesh;
  private pulseMeshOB: THREE.InstancedMesh;
  private pulseMeshPA: THREE.InstancedMesh;
  private pulseMeshPB: THREE.InstancedMesh;

  // 3. Intercepted Arc AB
  private arcABMesh: THREE.Line;
  private arcABGeometry: THREE.BufferGeometry;

  // 4. Center Angle Arc (∠AOB) & Ship Angle Arc (∠APB)
  private angleArcO: THREE.Line;
  private angleArcOGeometry: THREE.BufferGeometry;
  private angleArcP: THREE.Line;
  private angleArcPGeometry: THREE.BufferGeometry;

  // 5. Angle Fan Sector Meshes (Fill transparent wedges)
  private sectorGeomO: THREE.BufferGeometry;
  private sectorMeshO: THREE.Mesh;
  private sectorGeomP: THREE.BufferGeometry;
  private sectorMeshP: THREE.Mesh;

  // 6. Dynamic Degree Badges
  private badgeAOB: DynamicTextBadge;
  private badgeAPB: DynamicTextBadge;

  // 7. Tactical Dial Plane
  private dialMesh: THREE.Mesh;

  private radius: number = 14;

  constructor(radius: number = 14, maxAnisotropy: number = 4) {
    this.radius = radius;
    this.group = new THREE.Group();
    this.group.name = 'AngleVisualization';

    // Tactical Radar Dial Floor Plane
    const dialGeom = new THREE.PlaneGeometry(radius * 2.3, radius * 2.3);
    dialGeom.rotateX(-Math.PI / 2);
    const dialMat = new THREE.MeshBasicMaterial({
      map: createRadarDialTexture(maxAnisotropy),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.dialMesh = new THREE.Mesh(dialGeom, dialMat);
    this.dialMesh.position.y = 0.06;
    this.group.add(this.dialMesh);

    // Common Line Material for OA & OB (Warm Amber / Orange)
    const lineMatCentral = new THREE.LineBasicMaterial({
      color: 0xf97316,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
    });

    const geomOA = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const geomOB = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    this.lineOA = new THREE.Line(geomOA, lineMatCentral);
    this.lineOB = new THREE.Line(geomOB, lineMatCentral);
    this.group.add(this.lineOA, this.lineOB);

    // Common Line Material for PA & PB (Cyan / Teal)
    const lineMatInscribed = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
    });

    const geomPA = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const geomPB = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    this.linePA = new THREE.Line(geomPA, lineMatInscribed);
    this.linePB = new THREE.Line(geomPB, lineMatInscribed);
    this.group.add(this.linePA, this.linePB);

    // Laser Pulse Particles (Instanced Mesh for high performance)
    const particleGeom = new THREE.SphereGeometry(0.18, 8, 8);
    const particleMatAmber = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const particleMatCyan = new THREE.MeshBasicMaterial({ color: 0xa5f3fc });

    this.pulseMeshOA = new THREE.InstancedMesh(particleGeom, particleMatAmber, 4);
    this.pulseMeshOB = new THREE.InstancedMesh(particleGeom, particleMatAmber, 4);
    this.pulseMeshPA = new THREE.InstancedMesh(particleGeom, particleMatCyan, 4);
    this.pulseMeshPB = new THREE.InstancedMesh(particleGeom, particleMatCyan, 4);

    this.group.add(this.pulseMeshOA, this.pulseMeshOB, this.pulseMeshPA, this.pulseMeshPB);

    // Intercepted Arc AB Mesh (Glowing Emerald / Cyan)
    this.arcABGeometry = new THREE.BufferGeometry();
    const arcABMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 6,
      transparent: true,
      opacity: 0.95,
    });
    this.arcABMesh = new THREE.Line(this.arcABGeometry, arcABMat);
    this.group.add(this.arcABMesh);

    // Center Angle Sector Wedge (Fan)
    this.sectorGeomO = new THREE.BufferGeometry();
    const sectorMatO = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.sectorMeshO = new THREE.Mesh(this.sectorGeomO, sectorMatO);
    this.group.add(this.sectorMeshO);

    // Ship Angle Sector Wedge (Fan)
    this.sectorGeomP = new THREE.BufferGeometry();
    const sectorMatP = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.sectorMeshP = new THREE.Mesh(this.sectorGeomP, sectorMatP);
    this.group.add(this.sectorMeshP);

    // Angle Arcs
    this.angleArcOGeometry = new THREE.BufferGeometry();
    const arcMatO = new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 4 });
    this.angleArcO = new THREE.Line(this.angleArcOGeometry, arcMatO);

    this.angleArcPGeometry = new THREE.BufferGeometry();
    const arcMatP = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 4 });
    this.angleArcP = new THREE.Line(this.angleArcPGeometry, arcMatP);

    this.group.add(this.angleArcO, this.angleArcP);

    // Dynamic Degree Badges (update dynamically with angle)
    this.badgeAOB = new DynamicTextBadge('∠AOB = 80.0°', 'rgba(249, 115, 22, 0.92)', '#FFFFFF', 4.4, 1.1);
    this.badgeAPB = new DynamicTextBadge('∠APB = 40.0°', 'rgba(6, 182, 212, 0.92)', '#FFFFFF', 4.4, 1.1);
    this.group.add(this.badgeAOB.sprite, this.badgeAPB.sprite);
  }

  /**
   * Updates lines, arcs, fans, and dynamic 3D degree badges based on current angles
   */
  public updateGeometry(
    posO: THREE.Vector3,
    posA: THREE.Vector3,
    posB: THREE.Vector3,
    posP: THREE.Vector3,
    angleA: number,
    angleB: number,
    angleP: number,
    angles: CalculatedAngles,
    time: number,
    pulseSpeed: number = 1.0
  ) {
    // 1. Update OA and OB Line Endpoints
    const elevate = 0.5; // elevate rays slightly above water surface
    const pO = posO.clone().setY(posO.y + elevate);
    const pA = posA.clone().setY(posA.y + elevate);
    const pB = posB.clone().setY(posB.y + elevate);
    const pP = posP.clone().setY(posP.y + elevate);

    this.lineOA.geometry.setFromPoints([pO, pA]);
    this.lineOB.geometry.setFromPoints([pO, pB]);
    this.linePA.geometry.setFromPoints([pP, pA]);
    this.linePB.geometry.setFromPoints([pP, pB]);

    // 2. Animate Pulses along rays
    this.updatePulseMesh(this.pulseMeshOA, pO, pA, time * pulseSpeed, 0);
    this.updatePulseMesh(this.pulseMeshOB, pO, pB, time * pulseSpeed, 0.25);
    this.updatePulseMesh(this.pulseMeshPA, pP, pA, time * pulseSpeed, 0.5);
    this.updatePulseMesh(this.pulseMeshPB, pP, pB, time * pulseSpeed, 0.75);

    // 3. Update Intercepted Arc AB
    let a1 = angleA % (Math.PI * 2);
    let a2 = angleB % (Math.PI * 2);
    if (a1 < 0) a1 += Math.PI * 2;
    if (a2 < 0) a2 += Math.PI * 2;

    let diff = a2 - a1;
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;

    const arcPoints: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const theta = a1 + (diff * i) / segments;
      arcPoints.push(new THREE.Vector3(this.radius * Math.cos(theta), elevate + 0.1, this.radius * Math.sin(theta)));
    }
    this.arcABGeometry.setFromPoints(arcPoints);

    // 4. Update Central Angle Arc ∠AOB and Fan Wedge
    const arcRadiusO = 3.6;
    const arcPointsO: THREE.Vector3[] = [];
    const fanVerticesO: number[] = [];

    for (let i = 0; i <= 32; i++) {
      const theta = a1 + (diff * i) / 32;
      const pt = new THREE.Vector3(posO.x + arcRadiusO * Math.cos(theta), elevate + 0.2, posO.z + arcRadiusO * Math.sin(theta));
      arcPointsO.push(pt);

      if (i > 0) {
        // Triangle: Center O, previous point, current point
        const prevTheta = a1 + (diff * (i - 1)) / 32;
        const prevPt = new THREE.Vector3(posO.x + arcRadiusO * Math.cos(prevTheta), elevate + 0.15, posO.z + arcRadiusO * Math.sin(prevTheta));
        fanVerticesO.push(posO.x, elevate + 0.15, posO.z);
        fanVerticesO.push(prevPt.x, prevPt.y, prevPt.z);
        fanVerticesO.push(pt.x, pt.y, pt.z);
      }
    }
    this.angleArcOGeometry.setFromPoints(arcPointsO);
    this.sectorGeomO.setAttribute('position', new THREE.Float32BufferAttribute(fanVerticesO, 3));
    this.sectorGeomO.computeVertexNormals();

    // DYNAMIC 3D DEGREE TEXT FOR ∠AOB
    this.badgeAOB.updateText(`∠AOB = ${angles.aobDeg.toFixed(1)}°`);

    // Position ∠AOB Badge at midpoint of arc
    const midAngleO = a1 + diff / 2;
    this.badgeAOB.sprite.position.set(
      posO.x + (arcRadiusO + 2.0) * Math.cos(midAngleO),
      posO.y + 2.2,
      posO.z + (arcRadiusO + 2.0) * Math.sin(midAngleO)
    );

    // 5. Update Inscribed Angle Arc ∠APB and Fan Wedge
    const arcRadiusP = 3.0;
    const vPA = new THREE.Vector3().subVectors(pA, pP).normalize();
    const vPB = new THREE.Vector3().subVectors(pB, pP).normalize();

    const angPA = Math.atan2(vPA.z, vPA.x);
    const angPB = Math.atan2(vPB.z, vPB.x);

    let diffP = angPB - angPA;
    if (diffP < -Math.PI) diffP += Math.PI * 2;
    if (diffP > Math.PI) diffP -= Math.PI * 2;

    const arcPointsP: THREE.Vector3[] = [];
    const fanVerticesP: number[] = [];

    for (let i = 0; i <= 24; i++) {
      const theta = angPA + (diffP * i) / 24;
      const pt = new THREE.Vector3(pP.x + arcRadiusP * Math.cos(theta), pP.y + 0.3, pP.z + arcRadiusP * Math.sin(theta));
      arcPointsP.push(pt);

      if (i > 0) {
        const prevTheta = angPA + (diffP * (i - 1)) / 24;
        const prevPt = new THREE.Vector3(pP.x + arcRadiusP * Math.cos(prevTheta), pP.y + 0.25, pP.z + arcRadiusP * Math.sin(prevTheta));
        fanVerticesP.push(pP.x, pP.y + 0.25, pP.z);
        fanVerticesP.push(prevPt.x, prevPt.y, prevPt.z);
        fanVerticesP.push(pt.x, pt.y, pt.z);
      }
    }
    this.angleArcPGeometry.setFromPoints(arcPointsP);
    this.sectorGeomP.setAttribute('position', new THREE.Float32BufferAttribute(fanVerticesP, 3));
    this.sectorGeomP.computeVertexNormals();

    // DYNAMIC 3D DEGREE TEXT FOR ∠APB
    this.badgeAPB.updateText(`∠APB = ${angles.apbDeg.toFixed(1)}°`);

    // Position ∠APB Badge
    const midAngleP = angPA + diffP / 2;
    this.badgeAPB.sprite.position.set(
      pP.x + (arcRadiusP + 2.0) * Math.cos(midAngleP),
      pP.y + 2.4,
      pP.z + (arcRadiusP + 2.0) * Math.sin(midAngleP)
    );
  }

  private updatePulseMesh(
    mesh: THREE.InstancedMesh,
    start: THREE.Vector3,
    end: THREE.Vector3,
    timeOffset: number,
    phase: number
  ) {
    const count = 4;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const progress = ((timeOffset * 0.45 + phase + i / count) % 1.0);
      const px = THREE.MathUtils.lerp(start.x, end.x, progress);
      const py = THREE.MathUtils.lerp(start.y, end.y, progress);
      const pz = THREE.MathUtils.lerp(start.z, end.z, progress);

      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(1.0 - Math.abs(progress - 0.5) * 0.7);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  public setRadius(radius: number) {
    this.radius = radius;
    this.dialMesh.scale.set(radius / 14, radius / 14, 1);
  }

  public dispose() {
    this.badgeAOB.dispose();
    this.badgeAPB.dispose();
  }
}
