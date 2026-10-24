'use client';

import React from 'react';
import { CLIENT_CHAOS_PRESETS } from '@/lib/constants';
import { ClientChaosPreset } from '@/lib/types';
import { Sparkles } from 'lucide-react';

export interface PresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: ClientChaosPreset) => void;
  className?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Client Chaos Presets</span>
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          1-Click Load
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {CLIENT_CHAOS_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-1.5 ${
                isActive
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-[var(--bg-control)] hover:bg-[rgba(255,255,255,0.04)] border-[var(--border-subtle)] hover:border-[var(--border-default)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
                  {preset.label}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                    isActive
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                      : 'bg-black/40 text-[var(--text-muted)] border-white/5'
                  }`}
                >
                  {preset.badge}
                </span>
              </div>

              <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                {preset.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
