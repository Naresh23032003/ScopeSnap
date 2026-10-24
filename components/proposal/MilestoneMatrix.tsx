'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { IsometricStack, SpatialCard3D } from '@/components/spatial';
import { MilestonePhase } from '@/lib/types';

export interface MilestoneMatrixProps {
  milestones: MilestonePhase[];
  isStackOverview: boolean;
  onToggleOverview: () => void;
  onToggleDeliverable: (phaseId: string, deliverableId: string) => void;
  onAdjustHours: (phaseId: string, deliverableId: string, delta: number) => void;
}

export function MilestoneMatrix({
  milestones,
  isStackOverview,
  onToggleOverview,
  onToggleDeliverable,
  onAdjustHours,
}: MilestoneMatrixProps) {
  return (
    <IsometricStack
      isOverview={isStackOverview}
      onToggleOverview={onToggleOverview}
      items={milestones.map((phase) => {
        const activeDeliverableHours = phase.deliverables
          .filter((d) => d.included)
          .reduce((sum, d) => sum + d.hours, 0);

        return (
          <SpatialCard3D
            key={phase.id}
            maxTilt={3}
            elevateZ={14}
            className="rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] p-4 flex flex-col gap-3 transition-colors shadow-md"
          >
            {/* Phase Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 tabular-nums">
                  {phase.phase}
                </span>
                <h4 className="font-display font-medium text-xs text-white">
                  {phase.title}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                  {activeDeliverableHours} hrs
                </span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1 font-mono">
                  subtotal
                </span>
              </div>
            </div>

            {/* Deliverables List with Checkboxes & Steppers */}
            <div className="flex flex-col gap-2">
              {phase.deliverables.map((del) => (
                <div
                  key={del.id}
                  className={`flex items-center justify-between gap-3 p-2 rounded-lg border transition-all text-xs ${
                    del.included
                      ? 'bg-black/20 border-white/5 text-[var(--text-primary)]'
                      : 'bg-black/40 border-transparent text-[var(--text-muted)] line-through opacity-40'
                  }`}
                >
                  {/* Checkbox and Deliverable Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={del.included}
                      onChange={() => onToggleDeliverable(phase.id, del.id)}
                      className="w-4 h-4 rounded bg-black border-white/20 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500 shrink-0"
                      title="Toggle deliverable inclusion"
                    />
                    <span className="truncate font-sans">{del.name}</span>
                  </div>

                  {/* Complexity Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                      del.complexity === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : del.complexity === 'Med'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {del.complexity}
                  </span>

                  {/* Tactile 3D Hour Steppers */}
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-lg border border-white/5 shrink-0">
                    <button
                      type="button"
                      disabled={!del.included}
                      onClick={() => onAdjustHours(phase.id, del.id, -1)}
                      className="keycap-stepper w-5 h-5 rounded flex items-center justify-center text-xs text-[var(--text-muted)] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Decrease 1 hour"
                    >
                      <Minus className="w-3 h-3 stroke-[1.5]" />
                    </button>

                    <span className="font-mono text-xs font-semibold text-emerald-400 w-9 text-center tabular-nums">
                      {del.hours}h
                    </span>

                    <button
                      type="button"
                      disabled={!del.included}
                      onClick={() => onAdjustHours(phase.id, del.id, 1)}
                      className="keycap-stepper w-5 h-5 rounded flex items-center justify-center text-xs text-[var(--text-muted)] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Increase 1 hour"
                    >
                      <Plus className="w-3 h-3 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SpatialCard3D>
        );
      })}
    />
  );
}

