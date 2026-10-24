'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export interface SpatialCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  glareColor?: string;
  elevateZ?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const SpatialCard3D: React.FC<SpatialCard3DProps> = ({
  children,
  className = '',
  maxTilt = 5,
  glareOpacity = 0.12,
  glareColor = 'rgba(16, 185, 129, 0.12)',
  elevateZ = 22,
  onClick,
  style = {},
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  const glareAlpha = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 22 };
  const smoothRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const smoothRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);
  const smoothGlareAlpha = useSpring(glareAlpha, { stiffness: 200, damping: 20 });

  const glareBackground = useTransform([glareX, glareY], ([gx, gy]) => {
    return `radial-gradient(400px circle at ${gx}px ${gy}px, ${glareColor}, transparent 70%)`;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = Math.max(-0.5, Math.min(0.5, x / rect.width - 0.5));
    const normalizedY = Math.max(-0.5, Math.min(0.5, y / rect.height - 0.5));

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
    glareX.set(x);
    glareY.set(y);
    glareAlpha.set(glareOpacity);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    glareAlpha.set(0);
  };

  const MotionDiv = motion.div as any;

  return (
    <div
      style={{
        perspective: '1000px',
        ...style,
      }}
      className="relative"
    >
      <MotionDiv
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX: prefersReducedMotion ? 0 : smoothRotateX,
          rotateY: prefersReducedMotion ? 0 : smoothRotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-hidden transition-colors hover:border-[var(--border-default)] ${className}`}
      >
        {/* Dynamic Specular Holographic Glare Overlay */}
        {!prefersReducedMotion && (
          <MotionDiv
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              opacity: smoothGlareAlpha,
              background: glareBackground,
            }}
          />
        )}

        {/* Parallax Elevated Content Layer */}
        <div
          style={{
            transform: prefersReducedMotion ? 'none' : `translateZ(${elevateZ}px)`,
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 w-full h-full"
        >
          {children}
        </div>
      </MotionDiv>
    </div>
  );
};

export default SpatialCard3D;
