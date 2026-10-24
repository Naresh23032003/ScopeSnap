'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export interface FlipStageProps {
  isFlipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export const FlipStage: React.FC<FlipStageProps> = ({
  isFlipped,
  front,
  back,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeSide, setActiveSide] = useState<'front' | 'back'>(isFlipped ? 'back' : 'front');

  // Spring physics for smooth 180deg rotation: stiffness 180, damping 20
  const rotateYMotion = useSpring(isFlipped ? 180 : 0, { stiffness: 180, damping: 20 });

  useEffect(() => {
    rotateYMotion.set(isFlipped ? 180 : 0);
    // Switch active layout side after half transition to maintain proper natural document flow
    const timer = setTimeout(() => {
      setActiveSide(isFlipped ? 'back' : 'front');
    }, 200);
    return () => clearTimeout(timer);
  }, [isFlipped, rotateYMotion]);

  // Mid-transition arc: scale dips to 0.94 and translateZ dips to -80px at 90deg
  const scaleMotion = useTransform(rotateYMotion, (r) => {
    if (prefersReducedMotion) return 1;
    const clamped = Math.max(0, Math.min(180, r));
    const rad = (clamped / 180) * Math.PI;
    return 1.0 - 0.06 * Math.sin(rad);
  });

  const zMotion = useTransform(rotateYMotion, (r) => {
    if (prefersReducedMotion) return 0;
    const clamped = Math.max(0, Math.min(180, r));
    const rad = (clamped / 180) * Math.PI;
    return -80 * Math.sin(rad);
  });

  const MotionDiv = motion.div as any;

  return (
    <div
      style={{
        perspective: '1600px',
        perspectiveOrigin: 'center center',
      }}
      className={`flip-stage-container relative w-full ${className}`}
    >
      <MotionDiv
        style={{
          rotateY: prefersReducedMotion ? (isFlipped ? 180 : 0) : rotateYMotion,
          scale: scaleMotion,
          z: zMotion,
          transformStyle: 'preserve-3d',
        }}
        className="flip-card-body relative w-full"
      >
        {/* Front Face: Studio Dark View */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
          className={`studio-dark-view w-full ${
            activeSide === 'back' ? 'absolute inset-0 pointer-events-none' : 'relative'
          }`}
        >
          {front}
        </div>

        {/* Back Face: Client Paper SOW Preview */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
          }}
          className={`paper-sow-view w-full ${
            activeSide === 'front' ? 'absolute inset-0 pointer-events-none' : 'relative'
          }`}
        >
          {back}
        </div>
      </MotionDiv>
    </div>
  );
};

export default FlipStage;
