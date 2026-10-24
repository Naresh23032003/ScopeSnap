'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, Lock } from 'lucide-react';
import { KeycapButton } from '@/components/spatial';
import { ProSettings } from '@/lib/types';

export interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  proSettings: ProSettings;
  onSaveProSettings: (updated: ProSettings) => void;
}

const ACCENT_PRESETS = [
  { label: 'Signal Emerald', hex: '#10B981' },
  { label: 'Cyan Pulse', hex: '#06B6D4' },
  { label: 'Laser Amber', hex: '#F59E0B' },
  { label: 'Crimson Rose', hex: '#F43F5E' },
];

export function ProModal({
  isOpen,
  onClose,
  proSettings,
  onSaveProSettings,
}: ProModalProps) {
  const [draft, setDraft] = useState<ProSettings>(proSettings);

  useEffect(() => {
    setDraft(proSettings);
  }, [proSettings, isOpen]);

  if (!isOpen) return null;

  const checkoutUrl =
    process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL || 'https://polar.sh/scopesnap/pro';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md no-print"
    >
      <div className="w-full max-w-md rounded-2xl bg-[rgba(13,15,20,0.96)] border border-[rgba(245,158,11,0.4)] p-6 flex flex-col gap-4 shadow-2xl text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 stroke-[1.5]" />
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Unlock White-Label Agency Mode ($9 Pro)
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Custom letterhead, brand accent, and zero watermark exports
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs font-mono">
          {/* Agency Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[var(--text-secondary)]">Agency / Studio Name</label>
            <input
              type="text"
              value={draft.agencyName}
              onChange={(e) => setDraft((prev) => ({ ...prev, agencyName: e.target.value }))}
              placeholder="Apex Engineering Studio"
              className="rounded-lg bg-[var(--bg-control)] border border-[var(--border-default)] px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Agency Logo URL */}
          <div className="flex flex-col gap-1">
            <label className="text-[var(--text-secondary)]">Agency Logo URL</label>
            <input
              type="text"
              value={draft.logoUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="https://agency.com/logo.svg"
              className="rounded-lg bg-[var(--bg-control)] border border-[var(--border-default)] px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Brand Accent Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--text-secondary)]">Contract Brand Accent Color</label>
            <div className="flex items-center gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, brandColor: preset.hex }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                    draft.brandColor === preset.hex
                      ? 'border-white bg-white/10 text-white font-semibold'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-control)] text-[var(--text-muted)]'
                  }`}
                >
                  <span
                    style={{ backgroundColor: preset.hex }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                  <span>{preset.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Legal Terms */}
          <div className="flex flex-col gap-1">
            <label className="text-[var(--text-secondary)]">Custom Legal Terms (Optional)</label>
            <textarea
              rows={2}
              value={draft.customLegalTerms}
              onChange={(e) => setDraft((prev) => ({ ...prev, customLegalTerms: e.target.value }))}
              placeholder="Additional payment terms, governing jurisdiction, late fee clause..."
              className="rounded-lg bg-[var(--bg-control)] border border-[var(--border-default)] p-2 text-white text-xs font-sans focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Watermark Toggle */}
          <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={draft.hideWatermark}
              onChange={(e) => setDraft((prev) => ({ ...prev, hideWatermark: e.target.checked }))}
              className="rounded bg-black border-white/20 text-emerald-500 accent-emerald-500"
            />
            <span>Remove &quot;Generated via ScopeSnap&quot; watermark on Paper SOW</span>
          </label>

          {/* Checkout Gateways Placeholder */}
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3 flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400 stroke-[1.5]" />
                <span>Instant License Checkout ($9 One-Time)</span>
              </span>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
              >
                <span>Polar.sh / Lemon Squeezy / Dodo</span>
                <ExternalLink className="w-3 h-3 stroke-[1.5]" />
              </a>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-sans leading-relaxed">
              All white-label settings are unlocked immediately in local preview mode and persisted in browser storage.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-muted)] hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <KeycapButton
            variant="warning"
            size="sm"
            onClick={() => onSaveProSettings({ ...draft, isPro: true })}
            className="font-semibold"
          >
            Save White-Label Settings
          </KeycapButton>
        </div>
      </div>
    </div>
  );
}

