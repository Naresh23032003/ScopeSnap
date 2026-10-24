'use client';

import React from 'react';
import { AlertTriangle, Mail, CheckCircle2 } from 'lucide-react';
import { SpatialCard3D } from '@/components/spatial';

export interface RedFlagsCardProps {
  detectedTraps: string[];
  discoveryQuestions: string[];
  assumptions: string[];
  onCopyEmail: () => void;
}

export function RedFlagsCard({
  detectedTraps,
  discoveryQuestions,
  assumptions,
  onCopyEmail,
}: RedFlagsCardProps) {
  return (
    <SpatialCard3D
      maxTilt={4}
      elevateZ={18}
      glareColor="rgba(245, 158, 11, 0.14)"
      className="rounded-xl bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.25)] p-4 flex flex-col gap-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 stroke-[1.5]" />
          <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-amber-300">
            Client Red Flags & Discovery Questions
          </h4>
        </div>

        <button
          type="button"
          onClick={onCopyEmail}
          className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/50 text-amber-300 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Copy Client Reply Email</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Detected Traps */}
        <div className="rounded-lg bg-black/30 border border-amber-900/20 p-3 flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
            Detected Traps & Ambiguities
          </span>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            {detectedTraps.map((trap, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{trap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* High-Leverage Discovery Questions */}
        <div className="rounded-lg bg-black/30 border border-cyan-900/20 p-3 flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">
            Pre-Kickoff Discovery Questions
          </span>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            {discoveryQuestions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delivery Assumptions */}
      {assumptions && assumptions.length > 0 && (
        <div className="rounded-lg bg-black/30 border border-emerald-900/20 p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              Operating & Delivery Assumptions
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)] pt-0.5">
            {assumptions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SpatialCard3D>
  );
}

