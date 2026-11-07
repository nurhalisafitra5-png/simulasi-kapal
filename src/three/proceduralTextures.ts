/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Creates a procedural radar tactical compass dial texture
 */
export function createRadarDialTexture(maxAnisotropy: number = 4): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  ctx.clearRect(0, 0, size, size);

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Secondary inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Concentric radar distance rings
  [0.25, 0.5, 0.75].forEach((frac) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Degree ticks and labels
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const isMedium = deg % 10 === 0;

    const tickLen = isMajor ? 18 : isMedium ? 10 : 5;
    const x1 = cx + Math.cos(rad) * (r - tickLen);
    const y1 = cy + Math.sin(rad) * (r - tickLen);
    const x2 = cx + Math.cos(rad) * r;
    const y2 = cy + Math.sin(rad) * r;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.9)' : isMedium ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.stroke();

    // Text labels for major angles
    if (isMajor) {
      const textR = r - 32;
      const tx = cx + Math.cos(rad) * textR;
      const ty = cy + Math.sin(rad) * textR;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(rad + Math.PI / 2);
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${deg}°`, 0, 0);
      ctx.restore();
    }
  }

  // Cardinal Bearings (N, E, S, W)
  const bearings = [
    { label: 'E (90°)', angle: 0 },
    { label: 'S (180°)', angle: Math.PI / 2 },
    { label: 'W (270°)', angle: Math.PI },
    { label: 'N (0°)', angle: -Math.PI / 2 },
  ];

  bearings.forEach((b) => {
    const bx = cx + Math.cos(b.angle) * (r + 26);
    const by = cy + Math.sin(b.angle) * (r + 26);
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, bx, by);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Creates soft radial contact shadow texture for ships and island grounding
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');
  grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates corrugated metal texture for cargo containers
 */
export function createContainerTexture(baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);

  // Corrugation ridges
  for (let x = 0; x < 128; x += 12) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(x, 0, 4, 128);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + 4, 0, 4, 128);
  }

  // Border frame
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a procedural sprite text badge for 3D markers (Pelampung A, Kapal P, Stasiun O)
 */
export function createTextSprite(text: string, bgColor: string, textColor: string = '#FFFFFF'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;

  // Rounded pill background
  const r = 24;
  const x = 10;
  const y = 10;
  const w = 300;
  const h = 60;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

  ctx.fillStyle = bgColor;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Text
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 160, 40);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.6, 0.9, 1);
  return sprite;
}

/**
 * Dynamic 3D Text Badge Sprite with high-performance canvas buffer updates
 */
export class DynamicTextBadge {
  public sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private lastText: string = '';

  constructor(
    initialText: string,
    private defaultBgColor: string,
    private textColor: string = '#FFFFFF',
    scaleX: number = 4.2,
    scaleY: number = 1.05
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 384;
    this.canvas.height = 96;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      depthTest: false,
    });

    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.set(scaleX, scaleY, 1);
    this.updateText(initialText);
  }

  public updateText(text: string, customBgColor?: string) {
    if (this.lastText === text && !customBgColor) return;
    this.lastText = text;

    const bg = customBgColor || this.defaultBgColor;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Rounded container
    const r = 24;
    const pad = 6;
    ctx.beginPath();
    ctx.moveTo(pad + r, pad);
    ctx.arcTo(w - pad, pad, w - pad, h - pad, r);
    ctx.arcTo(w - pad, h - pad, pad, h - pad, r);
    ctx.arcTo(pad, h - pad, pad, pad, r);
    ctx.arcTo(pad, pad, w - pad, pad, r);
    ctx.closePath();

    ctx.fillStyle = bg;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text with crisp font
    ctx.font = 'bold 28px "JetBrains Mono", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = this.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, w / 2, h / 2);

    this.texture.needsUpdate = true;
  }

  public dispose() {
    this.texture.dispose();
    (this.sprite.material as THREE.SpriteMaterial).dispose();
  }
}
