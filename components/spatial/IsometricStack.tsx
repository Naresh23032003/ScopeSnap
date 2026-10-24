'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Layers } from 'lucide-react';

export interface IsometricStackProps {
  items: React.ReactNode[];
  isOverview?: boolean;
  onToggleOverview?: () => void;
  className?: string;
  showToggle?: boolean;
}

export const IsometricStack: React.FC<IsometricStackProps> = ({
  items,
  isOverview: controlledOverview,
  onToggleOverview,
  className = '',
  showToggle = true,
}) => {
  const [internalOverview, setInternalOverview] = useState(false);
  const isOverview = controlledOverview !== undefined ? controlledOverview : internalOverview;
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = () => {
    if (onToggleOverview) {
      onToggleOverview();
    } else {
      setInternalOverview(prev => !prev);
    }
  };

  const MotionDiv = motion.div as any;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showToggle && (
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
              isOverview
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-[var(--bg-control)] hover:bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Stack Overview</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded ${
                isOverview ? 'bg-emerald-800 text-emerald-100' : 'bg-black/30 text-[var(--text-muted)]'
              }`}
            >
              {isOverview ? 'ACTIVE' : 'OFF'}
            </span>
          </button>

          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {items.length} Phases Cascaded
          </span>
        </div>
      )}

      {/* 3D Perspective Stack Container */}
      <div
        style={{
          perspective: '1200px',
          perspectiveOrigin: 'center 40%',
        }}
        className="relative w-full"
      >
        <MotionDiv
          animate={
            prefersReducedMotion || !isOverview
              ? { rotateX: 0, rotateY: 0, rotateZ: 0 }
              : { rotateX: 12, rotateY: -4, rotateZ: 1 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="flex flex-col gap-3 w-full"
        >
          {items.map((item, index) => {
            const zOffset = isOverview && !prefersReducedMotion ? index * 36 : 0;
            const yOffset = isOverview && !prefersReducedMotion ? index * -14 : 0;
            const shadowBlur = isOverview ? 24 + index * 12 : 12;
            const shadowSpread = isOverview ? 12 + index * 8 : 4;
            const shadowAlpha = isOverview ? 0.45 + index * 0.08 : 0.25;

            return (
              <MotionDiv
                key={index}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, rotateX: -18, z: -90, y: 24 }
                }
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  z: zOffset,
                  y: yOffset,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 20,
                  delay: index * 0.07,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: `0 ${shadowSpread}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`,
                  zIndex: isOverview ? items.length - index : 1,
                }}
                className="relative rounded-xl transition-shadow duration-300"
              >
                {item}
              </MotionDiv>
            );
          })}
        </MotionDiv>
      </div>
    </div>
  );
};

export default IsometricStack;
