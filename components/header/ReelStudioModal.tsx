'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Video, X, Sparkles, Play, Edit3, Check, RotateCcw } from 'lucide-react';
import { KeycapButton } from '@/components/spatial';

export interface ReelStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateTyping: () => void;
  isSimulatingTyping?: boolean;
  children?: React.ReactNode;
}

const DEFAULT_HOOK = 'Turning 3 messy client voice notes into an $8,500 SOW in 0.3s';

export const ReelStudioModal: React.FC<ReelStudioModalProps> = ({
  isOpen,
  onClose,
  onSimulateTyping,
  isSimulatingTyping = false,
  children,
}) => {
  const [hookText, setHookText] = useState(DEFAULT_HOOK);
  const [isEditingHook, setIsEditingHook] = useState(false);
  const [isTiltSweepActive, setIsTiltSweepActive] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Listen for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaOrCtrl = e.metaKey || e.ctrlKey;
      if (isMetaOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const MotionDiv = motion.div as any;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reel Studio Mode"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto"
    >
      {/* Top Floating Control Bar */}
      <div className="fixed top-4 z-50 flex items-center gap-3 bg-[rgba(13,15,20,0.92)] border border-[var(--border-default)] px-4 py-2 rounded-full shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-display font-semibold text-xs text-white">Reel Studio (9:16)</span>
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
            Cmd+K
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Tilt Sweep Toggle */}
        <button
          type="button"
          onClick={() => setIsTiltSweepActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
            isTiltSweepActive
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/50'
              : 'bg-black/30 text-[var(--text-muted)] border border-white/5 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>3D Tilt {isTiltSweepActive ? 'ON' : 'OFF'}</span>
        </button>

        {/* Simulate Typing Button */}
        <KeycapButton
          variant="telemetry"
          size="sm"
          onClick={onSimulateTyping}
          disabled={isSimulatingTyping}
          className="text-xs"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isSimulatingTyping ? 'Streaming...' : 'Simulate Typing'}</span>
        </KeycapButton>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Exit Reel Studio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 9:16 Vertical Smartphone Viewport Container */}
      <div
        className="w-full flex items-center justify-center my-auto pt-14 pb-6"
        style={{ perspective: 1400 }}
      >
        <MotionDiv
          animate={
            isTiltSweepActive && !prefersReducedMotion
              ? {
                  rotateX: [0, 3, -2, 0],
                  rotateY: [-2, 2, -1, 0],
                }
              : { rotateX: 0, rotateY: 0 }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-[420px] aspect-[9/16] max-h-[88vh] rounded-[28px] border-2 border-emerald-500/40 bg-[var(--bg-canvas)] shadow-[0_0_100px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        >
          {/* Top Dynamic Island / Bezel */}
          <div className="w-full pt-3 px-4 flex items-center justify-between shrink-0 select-none z-20">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">9:41</span>
            <div className="w-20 h-4 rounded-full bg-black/80 border border-white/10 mx-auto" />
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded-[2px] border border-[var(--text-muted)] inline-block" />
            </div>
          </div>

          {/* Customizable Top Hook Banner */}
          <div className="px-3 pt-2 pb-1.5 shrink-0 z-20">
            <div className="rounded-xl bg-[rgba(16,185,129,0.14)] border border-[rgba(16,185,129,0.35)] p-2.5 shadow-lg backdrop-blur-md">
              {isEditingHook ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hookText}
                    onChange={(e) => setHookText(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg bg-black/60 border border-emerald-500/50 px-2 py-1 text-xs text-white font-display focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingHook(false)}
                    className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer"
                    title="Save hook"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingHook(true)}
                  className="flex items-start justify-between gap-2 cursor-pointer group"
                  title="Click to edit hook banner"
                >
                  <p className="font-display font-bold text-xs tracking-tight text-white leading-snug">
                    {hookText}
                  </p>
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0 mt-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Reel Content Scroll Container */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 font-sans text-xs">
            {children}
          </div>

          {/* Bottom Home Indicator */}
          <div className="py-2 flex items-center justify-center shrink-0 z-20 select-none">
            <div className="w-28 h-1 rounded-full bg-white/30" />
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default ReelStudioModal;
