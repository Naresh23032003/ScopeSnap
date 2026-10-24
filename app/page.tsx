'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Header, ByokModal, ReelStudioModal } from '@/components/header';
import { ChaosInputPane } from '@/components/input';
import { ProposalWorkspace, ProModal } from '@/components/proposal';
import {
  Currency,
  PaymentSchedule,
  ScopeProposal,
  ClientChaosPreset,
  ProSettings,
} from '@/lib/types';
import {
  CURRENCY_CONFIGS,
  CLIENT_CHAOS_PRESETS,
  DEFAULT_PROPOSAL,
  PROPOSAL_PRESET_1,
  PROPOSAL_PRESET_2,
  PROPOSAL_PRESET_3,
  PROPOSAL_PRESET_4,
} from '@/lib/constants';
import { recalculateProposal, scanVaguePhrases } from '@/lib/calculations';

const PRO_STORAGE_KEY = 'scopesnap_pro_settings';
const BYOK_STORAGE_KEY = 'scopesnap_groq_key';
const CALIBRATION_STORAGE_KEY = 'scopesnap_calibration';

export default function Home() {
  // Spatial 3D & Inference States
  const [lpuState, setLpuState] = useState<'idle' | 'typing' | 'streaming'>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(320);
  const [isInFlight, setIsInFlight] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  // Stage Views
  const [isPaperView, setIsPaperView] = useState(false);
  const [isStackOverview, setIsStackOverview] = useState(false);

  // Modals
  const [isByokOpen, setIsByokOpen] = useState(false);
  const [isReelStudioOpen, setIsReelStudioOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // BYOK Key
  const [customApiKey, setCustomApiKey] = useState('');

  // Pro Branding Settings
  const [proSettings, setProSettings] = useState<ProSettings>({
    isPro: false,
    agencyName: 'ScopeSnap Engineering Services',
    logoUrl: '',
    brandColor: '#10B981',
    customLegalTerms: '',
    hideWatermark: false,
  });

  // Chaos Input Engine States
  const [activePresetId, setActivePresetId] = useState<string | null>('preset-1');
  const [rawNotes, setRawNotes] = useState(CLIENT_CHAOS_PRESETS[0].rawText);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calibration Dials
  const [currency, setCurrency] = useState<Currency>('USD');
  const [hourlyRate, setHourlyRate] = useState(100);
  const [riskBuffer, setRiskBuffer] = useState(1.15); // 1.0, 1.15, 1.35
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule>('50/50');

  // Proposal State
  const [proposal, setProposal] = useState<ScopeProposal>(DEFAULT_PROPOSAL);
  const [newGuardrailText, setNewGuardrailText] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Load persisted keys and settings on mount
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(BYOK_STORAGE_KEY);
      if (storedKey && storedKey.trim()) {
        setCustomApiKey(storedKey.trim());
        setDemoMode(false);
      }

      const storedPro = localStorage.getItem(PRO_STORAGE_KEY);
      if (storedPro) {
        const parsed = JSON.parse(storedPro);
        if (parsed && typeof parsed === 'object') {
          setProSettings((prev) => ({ ...prev, ...parsed }));
        }
      }

      const storedCalibration = localStorage.getItem(CALIBRATION_STORAGE_KEY);
      if (storedCalibration) {
        const parsedCal = JSON.parse(storedCalibration);
        if (parsedCal && typeof parsedCal === 'object') {
          if (parsedCal.currency && CURRENCY_CONFIGS[parsedCal.currency as Currency]) {
            setCurrency(parsedCal.currency as Currency);
          }
          if (typeof parsedCal.hourlyRate === 'number' && parsedCal.hourlyRate > 0) {
            setHourlyRate(parsedCal.hourlyRate);
          }
        }
      }
    } catch {
      // Graceful fallback if localStorage is disabled
    }
  }, []);

  // Persist currency & rate changes
  useEffect(() => {
    try {
      localStorage.setItem(
        CALIBRATION_STORAGE_KEY,
        JSON.stringify({ currency, hourlyRate })
      );
    } catch {
      // Ignore storage error
    }
  }, [currency, hourlyRate]);

  // Update hourly rate when currency switches
  const handleCurrencyChange = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
    const config = CURRENCY_CONFIGS[newCurrency];
    setHourlyRate(config.defaultRate);
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = useCallback((preset: ClientChaosPreset) => {
    setActivePresetId(preset.id);
    setRawNotes(preset.rawText);

    if (preset.id === 'preset-1') setProposal(PROPOSAL_PRESET_1);
    else if (preset.id === 'preset-2') setProposal(PROPOSAL_PRESET_2);
    else if (preset.id === 'preset-3') setProposal(PROPOSAL_PRESET_3);
    else if (preset.id === 'preset-4') setProposal(PROPOSAL_PRESET_4);
  }, []);

  // Handle Typing Pulse for LPU Core 3D
  const handleTypingPulse = useCallback(() => {
    setLpuState('typing');
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      setLpuState('idle');
    }, 700);
  }, []);

  // Simulate Live Typing for Reel Studio Mode
  const handleSimulateTyping = useCallback(() => {
    if (isSimulatingTyping) return;
    setIsSimulatingTyping(true);

    const targetPreset = CLIENT_CHAOS_PRESETS[0];
    const fullText = targetPreset.rawText;
    setRawNotes('');
    setActivePresetId(targetPreset.id);
    setLpuState('typing');

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setRawNotes(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsSimulatingTyping(false);
        setLpuState('idle');
      }
    }, 26);
  }, [isSimulatingTyping]);

  // Handle Snap Scope Inference Action
  const handleSnapScope = useCallback(async () => {
    if (isInFlight || !rawNotes.trim()) return;

    setIsInFlight(true);
    setLpuState('streaming');
    const startTime = performance.now();

    try {
      const response = await fetch('/api/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes,
          projectType: 'Web Application',
          currency,
          hourlyRate,
          customApiKey: customApiKey || undefined,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (!response.ok) {
        throw new Error(`API error HTTP ${response.status}`);
      }

      const data = await response.json();
      setProposal(data);
      setDemoMode(Boolean(data.demoMode));
    } catch {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed || 320);
      setDemoMode(true);

      if (activePresetId === 'preset-2') setProposal(PROPOSAL_PRESET_2);
      else if (activePresetId === 'preset-3') setProposal(PROPOSAL_PRESET_3);
      else if (activePresetId === 'preset-4') setProposal(PROPOSAL_PRESET_4);
      else setProposal(PROPOSAL_PRESET_1);
    } finally {
      setIsInFlight(false);
      setLpuState('idle');
    }
  }, [isInFlight, rawNotes, currency, hourlyRate, customApiKey, activePresetId]);

  // Keyboard shortcut listener (Cmd+Enter to Snap Scope)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaOrCtrl = e.metaKey || e.ctrlKey;
      if (isMetaOrCtrl && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        handleSnapScope();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSnapScope]);

  // Real-Time Math Recalculation Engine
  const scanResult = useMemo(() => {
    return scanVaguePhrases(rawNotes);
  }, [rawNotes]);

  const calculations = useMemo(() => {
    return recalculateProposal(
      proposal.milestones,
      {
        currency,
        hourlyRate,
        riskBuffer,
        paymentSchedule,
      },
      scanResult.totalTrapCount
    );
  }, [proposal.milestones, currency, hourlyRate, riskBuffer, paymentSchedule, scanResult.totalTrapCount]);

  // Milestone Deliverable State Updaters
  const toggleDeliverableInclusion = useCallback((phaseId: string, deliverableId: string) => {
    setProposal((prev) => {
      const updatedMilestones = prev.milestones.map((phase) => {
        if (phase.id !== phaseId) return phase;
        const updatedDeliverables = phase.deliverables.map((d) => {
          if (d.id !== deliverableId) return d;
          return { ...d, included: !d.included };
        });
        const phaseTotalHours = updatedDeliverables
          .filter((d) => d.included)
          .reduce((acc, d) => acc + d.hours, 0);
        return { ...phase, deliverables: updatedDeliverables, phaseTotalHours };
      });
      return { ...prev, milestones: updatedMilestones };
    });
  }, []);

  const adjustDeliverableHours = useCallback((phaseId: string, deliverableId: string, delta: number) => {
    setProposal((prev) => {
      const updatedMilestones = prev.milestones.map((phase) => {
        if (phase.id !== phaseId) return phase;
        const updatedDeliverables = phase.deliverables.map((d) => {
          if (d.id !== deliverableId) return d;
          const newHours = Math.max(1, d.hours + delta);
          return { ...d, hours: newHours };
        });
        const phaseTotalHours = updatedDeliverables
          .filter((d) => d.included)
          .reduce((acc, d) => acc + d.hours, 0);
        return { ...phase, deliverables: updatedDeliverables, phaseTotalHours };
      });
      return { ...prev, milestones: updatedMilestones };
    });
  }, []);

  // Out-of-Scope Guardrails Actions
  const handleAddGuardrail = useCallback(() => {
    const trimmed = newGuardrailText.trim();
    if (!trimmed) return;
    setProposal((prev) => ({
      ...prev,
      outOfScope: [...prev.outOfScope, trimmed],
    }));
    setNewGuardrailText('');
  }, [newGuardrailText]);

  const handleRemoveGuardrail = useCallback((index: number) => {
    setProposal((prev) => ({
      ...prev,
      outOfScope: prev.outOfScope.filter((_, idx) => idx !== index),
    }));
  }, []);

  // 1-Click Copy Client Reply Email
  const handleCopyEmail = useCallback(() => {
    const email = proposal.recommendedReplyEmail;
    const emailText = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(emailText);
    setCopyStatus('Email copied to clipboard!');
    setTimeout(() => setCopyStatus(null), 2500);
  }, [proposal.recommendedReplyEmail]);

  // Copy Markdown SOW
  const handleCopyMarkdown = useCallback(() => {
    const currencyConfig = CURRENCY_CONFIGS[currency];
    const mdLines = [
      `# Statement of Work: ${proposal.projectTitle}`,
      `**Status**: Approved for Kickoff | **Date**: October 24, 2026`,
      `**Total Investment**: ${currencyConfig.symbol}${calculations.totalInvestment.toLocaleString()} ${currency} | **Timeline**: ${calculations.formattedTimeline}`,
      ``,
      `## 1. Executive Summary`,
      proposal.clientSummary,
      ``,
      `## 2. Milestone Deliverables`,
      ...proposal.milestones.flatMap((phase) => [
        `### ${phase.phase}: ${phase.title} (${phase.deliverables.reduce((a, d) => a + (d.included ? d.hours : 0), 0)} hrs)`,
        ...phase.deliverables.map(
          (d) => `- [${d.included ? 'x' : ' '}] **${d.name}** (${d.hours} hrs, Complexity: ${d.complexity})`
        ),
        ``,
      ]),
      `## 3. Ironclad Out-of-Scope Exclusions`,
      ...proposal.outOfScope.map((item) => `- ${item}`),
      ``,
      `## 4. Payment Terms (${calculations.paymentSplit.schedule})`,
      ...calculations.paymentSplit.items.map(
        (it) => `- ${it.phase}: ${currencyConfig.symbol}${it.amount.toLocaleString()}`
      ),
      ``,
      `## 5. Mutual Acceptance Signatures`,
      `- Service Provider: _________________________  Date: _______________`,
      `- Client Authorized: _________________________  Date: _______________`,
    ];

    navigator.clipboard.writeText(mdLines.join('\n'));
    setCopyStatus('Markdown SOW copied!');
    setTimeout(() => setCopyStatus(null), 2500);
  }, [proposal, currency, calculations]);

  // Copy JSON Proposal
  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
    setCopyStatus('JSON copied!');
    setTimeout(() => setCopyStatus(null), 2500);
  }, [proposal]);

  // Save Pro Agency Settings
  const handleSaveProSettings = useCallback((updated: ProSettings) => {
    setProSettings(updated);
    try {
      localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setIsProModalOpen(false);
  }, []);

  const activeCurrencyConfig = CURRENCY_CONFIGS[currency];

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased flex flex-col">
      {/* Module A: Top Telemetry Header */}
      <Header
        lpuState={lpuState}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        latencyMs={latencyMs}
        isInFlight={isInFlight}
        demoMode={demoMode}
        hasCustomKey={Boolean(customApiKey)}
        onOpenByok={() => setIsByokOpen(true)}
        onToggleReelStudio={() => setIsReelStudioOpen((prev) => !prev)}
      />

      {/* Primary Command Studio Workspace */}
      <div className="flex-1 w-full max-w-[1720px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module B: Client Chaos Input & Calibration Engine (Left Column) */}
        <section className="left-chaos-input lg:col-span-5 flex flex-col gap-4 no-print">
          <ChaosInputPane
            rawNotes={rawNotes}
            onNotesChange={setRawNotes}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            currency={currency}
            hourlyRate={hourlyRate}
            riskBuffer={riskBuffer}
            paymentSchedule={paymentSchedule}
            onHourlyRateChange={setHourlyRate}
            onRiskBufferChange={setRiskBuffer}
            onPaymentScheduleChange={setPaymentSchedule}
            onSnapScope={handleSnapScope}
            isGenerating={isInFlight}
            lpuState={lpuState}
            onTypingPulse={handleTypingPulse}
          />
        </section>

        {/* Module C: Interactive 3D Bento Proposal Workspace (Right Column) */}
        <section className="right-bento-workspace lg:col-span-7 flex flex-col gap-4">
          <ProposalWorkspace
            proposal={proposal}
            calculations={calculations}
            currencyConfig={activeCurrencyConfig}
            hourlyRate={hourlyRate}
            riskBuffer={riskBuffer}
            paymentSchedule={paymentSchedule}
            trapCount={scanResult.totalTrapCount}
            lpuState={lpuState}
            onSetLpuState={setLpuState}
            isPaperView={isPaperView}
            onSetPaperView={setIsPaperView}
            isStackOverview={isStackOverview}
            onToggleStackOverview={() => setIsStackOverview((prev) => !prev)}
            proSettings={proSettings}
            onOpenProModal={() => setIsProModalOpen(true)}
            onCopyMarkdown={handleCopyMarkdown}
            onCopyJson={handleCopyJson}
            onCopyEmail={handleCopyEmail}
            copyStatus={copyStatus}
            onToggleDeliverable={toggleDeliverableInclusion}
            onAdjustHours={adjustDeliverableHours}
            newGuardrailText={newGuardrailText}
            onNewGuardrailChange={setNewGuardrailText}
            onAddGuardrail={handleAddGuardrail}
            onRemoveGuardrail={handleRemoveGuardrail}
          />
        </section>
      </div>

      {/* BYOK Vault Glass Modal */}
      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
        apiKey={customApiKey}
        onKeySaved={(newKey) => {
          setCustomApiKey(newKey);
          setDemoMode(false);
        }}
        onKeyCleared={() => {
          setCustomApiKey('');
          setDemoMode(true);
        }}
      />

      {/* 9:16 Reel Studio Mode Modal */}
      <ReelStudioModal
        isOpen={isReelStudioOpen}
        onClose={() => setIsReelStudioOpen(false)}
        onSimulateTyping={handleSimulateTyping}
        isSimulatingTyping={isSimulatingTyping}
      >
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] space-y-2">
            <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase">
              Live Input Capture
            </span>
            <div className="font-mono text-xs text-white max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {rawNotes || 'Waiting for notes stream...'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--text-muted)]">Detected Traps:</span>
              <span className="text-rose-400 font-bold tabular-nums">{scanResult.totalTrapCount}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--text-muted)]">Calculated SOW:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {activeCurrencyConfig.symbol}
                {calculations.totalInvestment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </ReelStudioModal>

      {/* $9 Pro Custom Agency Branding Glass Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        proSettings={proSettings}
        onSaveProSettings={handleSaveProSettings}
      />
    </main>
  );
}
