'use client';

import React from 'react';
import { Key, Video, ShieldCheck } from 'lucide-react';
import { LpuCore3D, KeycapButton } from '@/components/spatial';
import { Currency } from '@/lib/types';
import { TelemetryPill } from './TelemetryPill';
import { CurrencySelector } from './CurrencySelector';

export interface HeaderProps {
  lpuState: 'idle' | 'typing' | 'streaming';
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  latencyMs?: number | null;
  isInFlight?: boolean;
  demoMode?: boolean;
  hasCustomKey: boolean;
  onOpenByok: () => void;
  onToggleReelStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lpuState,
  currency,
  onCurrencyChange,
  latencyMs,
  isInFlight = false,
  demoMode = false,
  hasCustomKey,
  onOpenByok,
  onToggleReelStudio,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(15,18,25,0.78)] backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between no-print">
      {/* Left Section: Brand & Spatial Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-control)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center overflow-hidden shadow-inner">
          <LpuCore3D size={28} state={lpuState} />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg tracking-tight text-[#F9FAFB]">
            ScopeSnap
          </span>

          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] text-[#34D399]">
            v1.0 SPATIAL
          </span>

          <span className="hidden sm:inline-block text-[10px] font-mono text-[#9CA3AF] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded-full">
            Part of SoloStack
          </span>
        </div>
      </div>

      {/* Center Section: Live Telemetry Pill */}
      <div className="hidden md:flex items-center">
        <TelemetryPill
          modelName="llama-3.3-70b-versatile"
          latencyMs={latencyMs}
          isInFlight={isInFlight}
          demoMode={demoMode}
          lpuState={lpuState}
        />
      </div>

      {/* Right Section: Controls & Modals */}
      <div className="flex items-center gap-2">
        {/* Currency Dropdown Selector */}
        <CurrencySelector
          currency={currency}
          onCurrencyChange={onCurrencyChange}
        />

        {/* BYOK API Key Vault Trigger */}
        <KeycapButton
          variant={hasCustomKey ? 'primary' : 'neutral'}
          size="sm"
          onClick={onOpenByok}
          title={hasCustomKey ? 'Custom Groq key active in vault' : 'Set custom Groq API key'}
        >
          {hasCustomKey ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Key className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">
            {hasCustomKey ? 'Key Active' : 'Groq Key'}
          </span>
        </KeycapButton>

        {/* Reel Studio Mode Toggle */}
        <KeycapButton
          variant="neutral"
          size="sm"
          shortcutKey="Cmd K"
          onClick={onToggleReelStudio}
          title="Toggle 9:16 Reel Studio Mode (Cmd+K)"
        >
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reel Studio</span>
        </KeycapButton>
      </div>
    </header>
  );
};

export default Header;
