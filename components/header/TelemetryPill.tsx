'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface TelemetryPillProps {
  modelName?: string;
  latencyMs?: number | null;
  isInFlight?: boolean;
  demoMode?: boolean;
  lpuState?: 'idle' | 'typing' | 'streaming';
  className?: string;
}

export const TelemetryPill: React.FC<TelemetryPillProps> = ({
  modelName = 'llama-3.3-70b-versatile',
  latencyMs = 320,
  isInFlight = false,
  demoMode = false,
  lpuState = 'idle',
  className = '',
}) => {
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    if (isInFlight) {
      startTimeRef.current = performance.now();
      const tick = () => {
        if (startTimeRef.current !== null) {
          setStopwatchMs(performance.now() - startTimeRef.current);
          animId = requestAnimationFrame(tick);
        }
      };
      animId = requestAnimationFrame(tick);
    } else {
      startTimeRef.current = null;
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isInFlight]);

  // Format latency string cleanly in JetBrains Mono
  const formatLatency = (ms: number | null): string => {
    if (ms === null || ms === undefined) return '~320ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const displayTime = isInFlight ? `${(stopwatchMs / 1000).toFixed(2)}s` : formatLatency(latencyMs);

  // Status dot color mapping
  const getDotStyle = () => {
    if (lpuState === 'streaming' || isInFlight) {
      return 'bg-cyan-400 shadow-[0_0_8px_#06B6D4] animate-ping';
    }
    if (demoMode) {
      return 'bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse';
    }
    if (lpuState === 'typing') {
      return 'bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse';
    }
    return 'bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse';
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Primary Telemetry Capsule */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(19,22,30,0.85)] border border-[rgba(6,182,212,0.25)] text-xs font-mono shadow-sm">
        <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${getDotStyle()}`} />
        <span className="font-sans font-medium text-[var(--text-secondary)] text-[11px] sm:text-xs">
          Groq LPU
        </span>
        <span className="text-[var(--text-muted)] select-none">•</span>
        <span
          className={`font-mono text-[11px] sm:text-xs transition-colors ${
            isInFlight || lpuState === 'streaming'
              ? 'text-cyan-400 font-semibold'
              : demoMode
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        >
          {modelName}
        </span>
        <span className="text-[var(--text-muted)] select-none">•</span>
        <span className="font-mono tabular-nums text-cyan-400 text-[11px] sm:text-xs min-w-[42px] text-right">
          {displayTime}
        </span>
      </div>

      {/* Demo Warning Tag if demoMode is active */}
      {demoMode && (
        <div
          title="Running offline fallback dataset. Enter a free Groq API key in BYOK Vault for live cloud inference."
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-[10px] font-mono text-amber-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Demo LPU Mode - Add free Groq Key for live custom AI</span>
        </div>
      )}
    </div>
  );
};

export default TelemetryPill;
