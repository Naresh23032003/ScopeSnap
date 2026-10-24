'use client';

import React, { useState } from 'react';
import { ShieldOff, Trash2, CheckSquare, Square } from 'lucide-react';
import { SpatialCard3D } from '@/components/spatial';

export interface OutOfScopeShieldProps {
  outOfScope: string[];
  newGuardrailText: string;
  onNewGuardrailChange: (value: string) => void;
  onAddGuardrail: () => void;
  onRemoveGuardrail: (index: number) => void;
}

export function OutOfScopeShield({
  outOfScope,
  newGuardrailText,
  onNewGuardrailChange,
  onAddGuardrail,
  onRemoveGuardrail,
}: OutOfScopeShieldProps) {
  const [disabledIndices, setDisabledIndices] = useState<Record<number, boolean>>({});

  const toggleGuardrailActive = (idx: number) => {
    setDisabledIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <SpatialCard3D
      maxTilt={4}
      elevateZ={18}
      glareColor="rgba(244, 63, 94, 0.14)"
      className="rounded-xl bg-[rgba(244,63,94,0.04)] border border-[rgba(244,63,94,0.25)] p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-rose-400 stroke-[1.5]" />
          <div>
            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-rose-300">
              Ironclad Out-of-Scope Shield
            </h4>
            <span className="text-[10px] text-[var(--text-muted)]">
              Explicit contract exclusions protecting against unbilled scope creep.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full tabular-nums">
          {outOfScope.length} Guardrails
        </span>
      </div>

      {/* Guardrails List */}
      <div className="flex flex-col gap-1.5 pt-1">
        {outOfScope.map((item, idx) => {
          const isMuted = Boolean(disabledIndices[idx]);
          return (
            <div
              key={idx}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-black/30 border transition-all text-xs ${
                isMuted
                  ? 'border-white/5 text-[var(--text-muted)] line-through opacity-45'
                  : 'border-rose-900/30 text-[var(--text-secondary)]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleGuardrailActive(idx)}
                className="flex items-center gap-2 truncate text-left flex-1 cursor-pointer"
                title="Toggle guardrail clause active state"
              >
                {isMuted ? (
                  <Square className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 stroke-[1.5]" />
                ) : (
                  <CheckSquare className="w-3.5 h-3.5 text-rose-400 shrink-0 stroke-[1.5]" />
                )}
                <span className="truncate">{item}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemoveGuardrail(idx)}
                className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                title="Remove exclusion"
              >
                <Trash2 className="w-3 h-3 stroke-[1.5]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Dynamic Guardrail Addition */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newGuardrailText}
          onChange={(e) => onNewGuardrailChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddGuardrail();
            }
          }}
          placeholder="Add custom excluded item (e.g., Native iOS/Android app)..."
          className="flex-1 rounded-lg bg-[var(--bg-control)] border border-[var(--border-default)] focus:border-rose-500 focus:outline-none px-3 py-1.5 text-xs text-white placeholder-[var(--text-muted)] font-mono"
        />
        <button
          type="button"
          onClick={onAddGuardrail}
          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-rose-300 text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0"
        >
          + Add Guardrail
        </button>
      </div>
    </SpatialCard3D>
  );
}

