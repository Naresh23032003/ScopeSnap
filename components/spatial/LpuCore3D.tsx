'use client';

import React, { useRef, useEffect } from 'react';

export interface LpuCore3DProps {
  state?: 'idle' | 'typing' | 'streaming';
  size?: number;
  className?: string;
}

// Golden ratio and unit-sphere normalization constant
const PHI = (1 + Math.sqrt(5)) / 2;
const NORM = Math.sqrt(1 + PHI * PHI);

// 12 regular icosahedron vertices normalized to unit sphere
export const ICOSAHEDRON_VERTICES: [number, number, number][] = [
  [-1,  PHI, 0], // 0
  [ 1,  PHI, 0], // 1
  [-1, -PHI, 0], // 2
  [ 1, -PHI, 0], // 3
  [0, -1,  PHI], // 4
  [0,  1,  PHI], // 5
  [0, -1, -PHI], // 6
  [0,  1, -PHI], // 7
  [ PHI, 0, -1], // 8
  [ PHI, 0,  1], // 9
  [-PHI, 0, -1], // 10
  [-PHI, 0,  1], // 11
].map(([x, y, z]) => [x / NORM, y / NORM, z / NORM]);

// 30 regular icosahedron edges
export const ICOSAHEDRON_EDGES: [number, number][] = [
  [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
  [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
  [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
  [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
  [4, 5], [5, 9], [8, 1], [1, 9], [7, 8],
  [6, 7], [10, 6], [2, 10], [11, 2], [4, 11],
];

// Helper: Rotate a 3D point by Euler angles (rotX, rotY, rotZ) in radians
function rotatePoint(
  p: [number, number, number],
  rotX: number,
  rotY: number,
  rotZ: number
): [number, number, number] {
  const [x, y, z] = p;

  // Rotate around X
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  // Rotate around Y
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  // Rotate around Z
  const cosZ = Math.cos(rotZ);
  const sinZ = Math.sin(rotZ);
  const x3 = x2 * cosZ - y1 * sinZ;
  const y3 = x2 * sinZ + y1 * cosZ;

  return [x3, y3, z2];
}

interface Particle {
  angle: number;
  speed: number;
  radiusFactor: number;
  inclination: number;
  size: number;
  color: string;
}

export const LpuCore3D: React.FC<LpuCore3DProps> = ({
  state = 'idle',
  size = 180,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.35;
    let angleY = 0.55;
    let angleZ = 0.15;
    let shockwaveTime = 0;

    // Check media query for prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // Initialize 16 orbital particles
    const particles: Particle[] = Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * Math.PI * 2,
      speed: 0.015 + (i % 4) * 0.005,
      radiusFactor: 1.25 + (i % 3) * 0.15,
      inclination: ((i % 5) - 2) * 0.28,
      size: (i % 2 === 0) ? 1.5 : 2.0,
      color: i % 3 === 0 ? '#06B6D4' : '#10B981',
    }));

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - lastTimestamp, 100);
      lastTimestamp = now;

      // Handle DPI and canvas sizing safely
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const targetWidth = Math.max(1, Math.round(size * dpr));
      const targetHeight = Math.max(1, Math.round(size * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.35;
      const cameraDistance = size * 1.8;

      const currentState = stateRef.current;

      // Determine rotation velocity & visuals based on state machine
      let rotSpeedY = 0.015;
      let rotSpeedX = 0.005;
      let rotSpeedZ = 0.002;
      let primaryColor = '#10B981';
      let rgbPrefix = '16, 185, 129';
      let glowRadius = 8 + 4 * Math.sin(now * 0.003);

      if (currentState === 'typing') {
        rotSpeedY = 0.033;
        rotSpeedX = 0.012 + 0.004 * Math.sin(now * 0.01);
        rotSpeedZ = 0.005;
        primaryColor = '#F59E0B';
        rgbPrefix = '245, 158, 11';
        glowRadius = 14 + 10 * Math.sin(now * 0.015);
      } else if (currentState === 'streaming') {
        rotSpeedY = 0.12;
        rotSpeedX = 0.04;
        rotSpeedZ = 0.02;
        primaryColor = '#06B6D4';
        rgbPrefix = '6, 182, 212';
        glowRadius = 18 + 12 * Math.sin(now * 0.02);
      }

      // Update rotation angles if motion is enabled
      if (!prefersReducedMotion) {
        const frameMultiplier = dt / 16.666;
        angleX += rotSpeedX * frameMultiplier;
        angleY += rotSpeedY * frameMultiplier;
        angleZ += rotSpeedZ * frameMultiplier;
      }

      // 1. Draw Central Core Glow Aura
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.4);
      coreGradient.addColorStop(0, `rgba(${rgbPrefix}, ${currentState === 'streaming' ? 0.35 : 0.2})`);
      coreGradient.addColorStop(0.5, `rgba(${rgbPrefix}, 0.08)`);
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rotate & Project 12 Vertices
      const projected = ICOSAHEDRON_VERTICES.map(v => {
        // Scale to radius
        const scaled: [number, number, number] = [
          v[0] * baseRadius,
          v[1] * baseRadius,
          v[2] * baseRadius,
        ];
        const rotated = rotatePoint(scaled, angleX, angleY, angleZ);
        const [rx, ry, rz] = rotated;

        const denom = Math.max(0.001, cameraDistance + rz);
        const factor = cameraDistance / denom;
        const screenX = cx + rx * factor;
        const screenY = cy - ry * factor;

        // Depth factor delta in [0, 1]
        const delta = Math.max(0, Math.min(1, (rz + baseRadius) / (2 * baseRadius)));

        return { screenX, screenY, rz, delta, factor };
      });

      // 3. Draw 30 Edges with Depth Shading
      // Sort edges by average depth so rear edges render first
      const edgeRenderList = ICOSAHEDRON_EDGES.map(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        const avgZ = (p1.rz + p2.rz) / 2;
        const avgDelta = (p1.delta + p2.delta) / 2;
        return { p1, p2, avgZ, avgDelta };
      }).sort((a, b) => a.avgZ - b.avgZ);

      edgeRenderList.forEach(({ p1, p2, avgDelta }) => {
        const alpha = Math.max(0.15, Math.min(0.95, 0.20 + 0.65 * avgDelta));
        const lineWidth = Math.max(0.75, Math.min(2.5, 0.75 + 1.25 * avgDelta));

        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);

        if (currentState === 'streaming') {
          // Dual cyan-emerald stroke
          ctx.strokeStyle = avgDelta > 0.5 ? `rgba(6, 182, 212, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(${rgbPrefix}, ${alpha})`;
        }

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // 4. Draw Vertex Nodes
      projected.forEach(({ screenX, screenY, delta }) => {
        const nodeRadius = 1.0 + 1.8 * delta;
        const nodeAlpha = 0.35 + 0.65 * delta;

        ctx.beginPath();
        ctx.arc(screenX, screenY, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbPrefix}, ${nodeAlpha})`;
        ctx.fill();
      });

      // 5. Draw Orbital Particles (if size >= 40)
      if (size >= 40) {
        particles.forEach(pt => {
          if (!prefersReducedMotion) {
            const particleSpeed = currentState === 'typing' ? pt.speed * 1.8 : currentState === 'streaming' ? pt.speed * 4 : pt.speed;
            pt.angle += particleSpeed * (dt / 16.666);
          }

          const r = baseRadius * pt.radiusFactor;
          const px = r * Math.cos(pt.angle);
          const py = r * Math.sin(pt.angle) * Math.cos(pt.inclination);
          const pz = r * Math.sin(pt.angle) * Math.sin(pt.inclination);

          const rotatedPt = rotatePoint([px, py, pz], angleX * 0.5, angleY * 0.7, 0);
          const denom = Math.max(0.001, cameraDistance + rotatedPt[2]);
          const factor = cameraDistance / denom;
          const screenX = cx + rotatedPt[0] * factor;
          const screenY = cy - rotatedPt[1] * factor;
          const delta = Math.max(0, Math.min(1, (rotatedPt[2] + r) / (2 * r)));

          ctx.beginPath();
          ctx.arc(screenX, screenY, pt.size * (0.8 + 0.5 * delta), 0, Math.PI * 2);
          ctx.fillStyle = currentState === 'typing'
            ? `rgba(245, 158, 11, ${0.3 + 0.7 * delta})`
            : currentState === 'streaming'
            ? `rgba(6, 182, 212, ${0.4 + 0.6 * delta})`
            : `rgba(16, 185, 129, ${0.25 + 0.65 * delta})`;
          ctx.fill();
        });
      }

      // 6. Draw Expanding 3D Shockwave Ring during streaming
      if (currentState === 'streaming' && !prefersReducedMotion) {
        shockwaveTime = (shockwaveTime + dt) % 400;
        const tau = shockwaveTime / 400; // 0 to 1
        const waveRadius = baseRadius * (1 + 2.4 * tau);
        const waveAlpha = Math.max(0, 0.85 * (1 - tau));

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${waveAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06B6D4';
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
      }}
      className={`block select-none pointer-events-none ${className}`}
    />
  );
};

export default LpuCore3D;
