'use client';

import React from 'react';
import {
  Sparkles,
  Copy,
  Eye,
  RotateCw,
  Check,
  ArrowRight,
  Printer,
} from 'lucide-react';
import {
  FlipStage,
  LpuCore3D,
  KeycapButton,
  SpatialCard3D,
} from '@/components/spatial';
import {
  CalculationResult,
  CurrencyConfig,
  PaymentSchedule,
  ProSettings,
  ScopeProposal,
} from '@/lib/types';
import { KpiRibbon } from './KpiRibbon';
import { MilestoneMatrix } from './MilestoneMatrix';
import { OutOfScopeShield } from './OutOfScopeShield';
import { RedFlagsCard } from './RedFlagsCard';
import { PaperSowPreview } from './PaperSowPreview';

export interface ProposalWorkspaceProps {
  proposal: ScopeProposal;
  calculations: CalculationResult;
  currencyConfig: CurrencyConfig;
  hourlyRate: number;
  riskBuffer: number;
  paymentSchedule: PaymentSchedule;
  trapCount: number;
  lpuState: 'idle' | 'typing' | 'streaming';
  onSetLpuState: (state: 'idle' | 'typing' | 'streaming') => void;
  isPaperView: boolean;
  onSetPaperView: (isPaper: boolean) => void;
  isStackOverview: boolean;
  onToggleStackOverview: () => void;
  proSettings: ProSettings;
  onOpenProModal: () => void;
  onCopyMarkdown: () => void;
  onCopyJson: () => void;
  onCopyEmail: () => void;
  copyStatus: string | null;
  onToggleDeliverable: (phaseId: string, deliverableId: string) => void;
  onAdjustHours: (phaseId: string, deliverableId: string, delta: number) => void;
  newGuardrailText: string;
  onNewGuardrailChange: (value: string) => void;
  onAddGuardrail: () => void;
  onRemoveGuardrail: (index: number) => void;
}

export function ProposalWorkspace({
  proposal,
  calculations,
  currencyConfig,
  hourlyRate,
  riskBuffer,
  paymentSchedule,
  trapCount,
  lpuState,
  onSetLpuState,
  isPaperView,
  onSetPaperView,
  isStackOverview,
  onToggleStackOverview,
  proSettings,
  onOpenProModal,
  onCopyMarkdown,
  onCopyJson,
  onCopyEmail,
  copyStatus,
  onToggleDeliverable,
  onAdjustHours,
  newGuardrailText,
  onNewGuardrailChange,
  onAddGuardrail,
  onRemoveGuardrail,
}: ProposalWorkspaceProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Executive KPI Ribbon */}
      <KpiRibbon
        calculations={calculations}
        currencyConfig={currencyConfig}
        hourlyRate={hourlyRate}
        riskBuffer={riskBuffer}
        paymentSchedule={paymentSchedule}
        trapCount={trapCount}
      />

      {/* 2. 3D Architectural Flip Stage: Studio Dark View <-> Client Paper SOW Preview */}
      <FlipStage
        isFlipped={isPaperView}
        front={
          /* Side A: Studio 3D Dark View */
          <div className="rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-5 flex flex-col gap-5 shadow-2xl">
            {/* Proposal Title Header & Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Production Statement of Work
                </span>
                <h3 className="font-display font-bold text-base text-white mt-1">
                  {proposal.projectTitle}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 studio-controls">
                {/* $9 Pro Upgrade Pill */}
                <button
                  type="button"
                  onClick={onOpenProModal}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 text-xs font-mono font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 stroke-[1.5]" />
                  <span>{proSettings.isPro ? 'Pro Active' : '$9 Pro'}</span>
                </button>

                {/* Download / Print PDF */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print or save Client SOW as PDF"
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-control)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-white text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 stroke-[1.5]" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                {/* Copy Markdown */}
                <button
                  type="button"
                  onClick={onCopyMarkdown}
                  title="Copy proposal as Markdown"
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-control)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-white text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 stroke-[1.5]" />
                  <span className="hidden sm:inline">Markdown</span>
                </button>

                {/* Copy JSON */}
                <button
                  type="button"
                  onClick={onCopyJson}
                  title="Copy proposal as raw JSON"
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-control)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-white text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 stroke-[1.5]" />
                  <span className="hidden sm:inline">JSON</span>
                </button>

                {/* Flip to Paper SOW */}
                <KeycapButton
                  variant="telemetry"
                  size="sm"
                  onClick={() => onSetPaperView(true)}
                  className="border border-[rgba(6,182,212,0.4)] text-xs font-semibold"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Client Paper SOW Preview</span>
                  <RotateCw className="w-3 h-3 text-[var(--text-muted)] ml-1 stroke-[1.5]" />
                </KeycapButton>
              </div>
            </div>

            {/* Client Summary Spatial Bento Card */}
            <SpatialCard3D
              maxTilt={3}
              elevateZ={14}
              className="rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] p-3.5 text-xs text-[var(--text-secondary)] leading-relaxed"
            >
              <div className="font-mono text-[11px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
                Executive Scope Brief
              </div>
              {proposal.clientSummary}
            </SpatialCard3D>

            {/* Central LpuCore3D Simulation Engine Preview */}
            <div className="rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] p-3.5 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  <LpuCore3D size={64} state={lpuState} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-xs text-white">
                      Groq LPU Gyroscope Core
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                        lpuState === 'streaming'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : lpuState === 'typing'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {lpuState}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                    Zero-dependency HTML5 2D canvas icosahedron with 3D Euler rotations and shockwave harmonics.
                  </p>
                </div>
              </div>

              {/* Manual State Selector for Testing */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                {(['idle', 'typing', 'streaming'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onSetLpuState(st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                      lpuState === st
                        ? 'bg-[var(--accent-primary)] text-black font-semibold'
                        : 'text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Status Notification Toast */}
            {copyStatus && (
              <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/50 p-2.5 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.5]" />
                <span>{copyStatus}</span>
              </div>
            )}

            {/* 3D Isometric Cascading Milestone Matrix */}
            <MilestoneMatrix
              milestones={proposal.milestones}
              isStackOverview={isStackOverview}
              onToggleOverview={onToggleStackOverview}
              onToggleDeliverable={onToggleDeliverable}
              onAdjustHours={onAdjustHours}
            />

            {/* Ironclad Out-of-Scope Shield */}
            <OutOfScopeShield
              outOfScope={proposal.outOfScope}
              newGuardrailText={newGuardrailText}
              onNewGuardrailChange={onNewGuardrailChange}
              onAddGuardrail={onAddGuardrail}
              onRemoveGuardrail={onRemoveGuardrail}
            />

            {/* Client Red Flags, Discovery Questions & Assumptions Card */}
            <RedFlagsCard
              detectedTraps={proposal.detectedTraps}
              discoveryQuestions={proposal.discoveryQuestions}
              assumptions={proposal.assumptions}
              onCopyEmail={onCopyEmail}
            />

            {/* Footer Telemetry */}
            <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
              <span>Groq LPU Acceleration: 60fps Spatial Engine</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span>Tactile Obsidian Architecture</span>
                <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </span>
            </div>
          </div>
        }
        back={
          /* Side B: Swiss-Editorial Paper SOW Preview (#FAF9F6) */
          <PaperSowPreview
            proposal={proposal}
            calculations={calculations}
            currencyConfig={currencyConfig}
            hourlyRate={hourlyRate}
            proSettings={proSettings}
            onFlipBack={() => onSetPaperView(false)}
          />
        }
      />
    </div>
  );
}

