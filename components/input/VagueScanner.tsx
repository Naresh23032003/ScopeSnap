'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { scanVaguePhrases } from '@/lib/calculations';
import { VAGUE_PHRASE_PATTERNS } from '@/lib/constants';
import { VagueScanResult } from '@/lib/types';

export interface VagueScannerProps {
  rawNotes: string;
  onScanResult?: (result: VagueScanResult) => void;
  className?: string;
}

export const VagueScanner: React.FC<VagueScannerProps> = ({
  rawNotes,
  onScanResult,
  className = '',
}) => {
  const scanResult = useMemo(() => {
    const result = scanVaguePhrases(rawNotes, VAGUE_PHRASE_PATTERNS);
    if (onScanResult) {
      onScanResult(result);
    }
    return result;
  }, [rawNotes, onScanResult]);

  const { matches, totalTrapCount } = scanResult;

  // Determine if a trap is critical (crimson) or moderate (amber)
  const isCriticalTrap = (id: string, category: string): boolean => {
    return (
      category === 'Fatal Creep' ||
      category === 'Liability' ||
      category === 'Anchoring' ||
      id === 'unlimited_revisions' ||
      id === 'unlimited' ||
      id === 'similar_to_uber'
    );
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Scanner Status Header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
          {totalTrapCount > 0 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {totalTrapCount > 0
              ? `${totalTrapCount} Scope ${totalTrapCount === 1 ? 'Trap' : 'Traps'} Detected`
              : '0 Traps Detected - Clean Scope'}
          </span>
        </div>

        {totalTrapCount > 0 && (
          <span className="text-[10px] text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Risk Buffering Recommended
          </span>
        )}
      </div>

      {/* Floating 3D Warning Chips */}
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1" style={{ perspective: 800 }}>
          {matches.map((match) => {
            const critical = isCriticalTrap(match.id, match.category);
            return (
              <div
                key={match.id}
                title={match.riskExplanation}
                style={{
                  transform: 'translateZ(12px)',
                }}
                className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 cursor-help ${
                  critical
                    ? 'bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.3)] text-rose-300'
                    : 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)] text-amber-300'
                }`}
              >
                <AlertTriangle
                  className={`w-3 h-3 shrink-0 ${
                    critical ? 'text-rose-400' : 'text-amber-400'
                  }`}
                />
                <span className="font-semibold">
                  Trap: {match.phrase} {match.count > 1 ? `(x${match.count})` : ''}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30 w-64 p-2.5 rounded-xl bg-[rgba(13,15,20,0.96)] border border-[var(--border-default)] shadow-2xl text-[10px] font-sans text-white leading-relaxed pointer-events-none">
                  <div className="font-mono text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
                    {match.category} Risk
                  </div>
                  {match.riskExplanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VagueScanner;
