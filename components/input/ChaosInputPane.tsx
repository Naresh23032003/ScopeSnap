'use client';

import React, { useRef } from 'react';
import { Sliders, Zap, MessageSquare } from 'lucide-react';
import { SpatialCard3D, KeycapButton } from '@/components/spatial';
import { Currency, PaymentSchedule, ClientChaosPreset, VagueScanResult } from '@/lib/types';
import { PresetSelector } from './PresetSelector';
import { VagueScanner } from './VagueScanner';
import { CalibrationDials } from './CalibrationDials';

export interface ChaosInputPaneProps {
  rawNotes: string;
  onNotesChange: (notes: string) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: ClientChaosPreset) => void;
  currency: Currency;
  hourlyRate: number;
  riskBuffer: number;
  paymentSchedule: PaymentSchedule;
  onHourlyRateChange: (rate: number) => void;
  onRiskBufferChange: (buffer: number) => void;
  onPaymentScheduleChange: (schedule: PaymentSchedule) => void;
  onSnapScope: () => void;
  isGenerating?: boolean;
  lpuState?: 'idle' | 'typing' | 'streaming';
  onTypingPulse?: () => void;
  onScanResult?: (res: VagueScanResult) => void;
  className?: string;
}

export const ChaosInputPane: React.FC<ChaosInputPaneProps> = ({
  rawNotes,
  onNotesChange,
  activePresetId,
  onSelectPreset,
  currency,
  hourlyRate,
  riskBuffer,
  paymentSchedule,
  onHourlyRateChange,
  onRiskBufferChange,
  onPaymentScheduleChange,
  onSnapScope,
  isGenerating = false,
  lpuState = 'idle',
  onTypingPulse,
  onScanResult,
  className = '',
}) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(e.target.value);
    if (onTypingPulse) {
      onTypingPulse();
    }
  };

  return (
    <div className={`chaos-input-pane no-print flex flex-col gap-4 ${className}`}>
      <SpatialCard3D className="p-5 flex flex-col gap-4 shadow-xl" maxTilt={4} elevateZ={18}>
        {/* Header Title & Live Detection Indicator */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display font-semibold text-sm tracking-tight text-[var(--text-primary)]">
              Client Chaos Input
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Detection Active
            </span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                lpuState === 'typing'
                  ? 'bg-amber-400 animate-ping'
                  : lpuState === 'streaming'
                  ? 'bg-cyan-400 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
          </div>
        </div>

        {/* 1. Presets Selector */}
        <PresetSelector
          activePresetId={activePresetId}
          onSelectPreset={onSelectPreset}
        />

        {/* 2. Smart Input Textarea Canvas */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span>Smart Input Canvas</span>
            </label>
            <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
              {rawNotes.length} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={7}
              value={rawNotes}
              onChange={handleTextareaChange}
              placeholder="Paste raw client call notes, WhatsApp voice dump, or messy email requirements here..."
              className="w-full rounded-xl bg-[var(--bg-control)] border border-[var(--border-default)] focus:border-emerald-500 focus:outline-none p-3.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono resize-none transition-colors shadow-inner leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Real-Time Vague Phrase Scanner & Floating 3D Chips */}
        <VagueScanner rawNotes={rawNotes} onScanResult={onScanResult} />

        {/* 4. Tactile Calibration Dials */}
        <CalibrationDials
          currency={currency}
          hourlyRate={hourlyRate}
          riskBuffer={riskBuffer}
          paymentSchedule={paymentSchedule}
          onHourlyRateChange={onHourlyRateChange}
          onRiskBufferChange={onRiskBufferChange}
          onPaymentScheduleChange={onPaymentScheduleChange}
        />

        {/* 5. Primary Action: Snap Scope Keycap Button */}
        <div className="pt-1">
          <KeycapButton
            variant="primary"
            size="lg"
            shortcutKey="Cmd Enter"
            onClick={onSnapScope}
            disabled={isGenerating || rawNotes.trim().length < 5}
            className="w-full tracking-wide shadow-keycap-emerald font-semibold"
          >
            <Zap className={`w-4 h-4 fill-current ${isGenerating ? 'animate-bounce' : ''}`} />
            <span>{isGenerating ? 'Synthesizing with Groq LPU...' : 'Snap Scope'}</span>
          </KeycapButton>
        </div>
      </SpatialCard3D>
    </div>
  );
};

export default ChaosInputPane;
