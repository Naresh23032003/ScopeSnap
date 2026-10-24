'use client';

import React from 'react';
import { Printer, RotateCw } from 'lucide-react';
import { CalculationResult, CurrencyConfig, ProSettings, ScopeProposal } from '@/lib/types';

export interface PaperSowPreviewProps {
  proposal: ScopeProposal;
  calculations: CalculationResult;
  currencyConfig: CurrencyConfig;
  hourlyRate: number;
  proSettings: ProSettings;
  onFlipBack: () => void;
}

export function PaperSowPreview({
  proposal,
  calculations,
  currencyConfig,
  hourlyRate,
  proSettings,
  onFlipBack,
}: PaperSowPreviewProps) {
  const accentColor = proSettings.brandColor || '#059669';

  return (
    <div className="paper-sow-container rounded-xl bg-[#FAF9F6] text-[#111827] border border-[#E5E7EB] p-8 flex flex-col gap-6 shadow-2xl font-sans">
      {/* Header Controls for Paper Mode */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 no-print">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm tracking-tight text-[#111827]">
            Statement of Work (SOW) Proposal
          </span>
          <span
            style={{ borderColor: accentColor, color: accentColor }}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 border"
          >
            Client-Ready PDF Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-black text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Download / Print PDF</span>
          </button>

          <button
            type="button"
            onClick={onFlipBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F3F4F6] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Studio 3D Dark View</span>
          </button>
        </div>
      </div>

      {/* Letterhead & SOW Metadata */}
      <div
        style={{ borderBottomColor: accentColor }}
        className="flex justify-between items-start border-b-2 pb-6"
      >
        <div className="flex items-center gap-3">
          {proSettings.logoUrl && (
            <img
              src={proSettings.logoUrl}
              alt={proSettings.agencyName || 'Agency Logo'}
              className="w-10 h-10 object-contain rounded border border-[#E5E7EB] bg-white p-1"
            />
          )}
          <div>
            <h1 className="font-display font-bold text-2xl text-[#111827] tracking-tight">
              {proSettings.agencyName || 'ScopeSnap Engineering Services'}
            </h1>
            <p className="text-xs text-[#4B5563] mt-1">
              Independent Software Consultancy & Spatial Engineering Architecture
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-[#6B7280] tabular-nums">
          <div>REF ID: SOW-2026-X892</div>
          <div>DATE: October 24, 2026</div>
          <div style={{ color: accentColor }} className="font-semibold mt-1">
            STATUS: APPROVED FOR SIGNATURE
          </div>
        </div>
      </div>

      {/* Project Title Block */}
      <div className="bg-[#F3F4F6] p-4 rounded-lg border border-[#E5E7EB]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
          Project Title & Engagement Target
        </span>
        <div className="font-display font-bold text-base text-[#111827] mt-0.5">
          {proposal.projectTitle}
        </div>
      </div>

      {/* 1. Executive Summary & Objective */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-semibold text-xs text-[#111827] uppercase tracking-wider">
          1. Executive Summary & Objectives
        </h2>
        <p className="text-xs text-[#374151] leading-relaxed">{proposal.clientSummary}</p>
      </div>

      {/* 2. Milestone Deliverable Table */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-semibold text-xs text-[#111827] uppercase tracking-wider">
          2. Itemized Deliverable & Investment Table
        </h2>
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F3F4F6] text-[#374151] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3 border-b border-[#E5E7EB]">Phase</th>
                <th className="py-2.5 px-3 border-b border-[#E5E7EB]">Scope & Key Deliverables</th>
                <th className="py-2.5 px-3 border-b border-[#E5E7EB] text-center">Complexity</th>
                <th className="py-2.5 px-3 border-b border-[#E5E7EB] text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {proposal.milestones.map((phase) => {
                const includedItems = phase.deliverables.filter((d) => d.included);
                const phaseHours = includedItems.reduce((acc, d) => acc + d.hours, 0);

                return (
                  <tr key={phase.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#111827] whitespace-nowrap align-top tabular-nums">
                      {phase.phase}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#111827]">{phase.title}</div>
                      <ul className="list-disc list-inside text-[11px] text-[#6B7280] mt-1 space-y-0.5">
                        {includedItems.map((d) => (
                          <li key={d.id}>
                            {d.name} ({d.hours}h)
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono align-top">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px]">
                        {includedItems.some((d) => d.complexity === 'High') ? 'High' : 'Med'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#111827] align-top tabular-nums">
                      {phaseHours}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Ironclad Exclusions (Out-of-Scope) */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-semibold text-xs text-[#111827] uppercase tracking-wider">
          3. Ironclad Exclusions (Out-of-Scope)
        </h2>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 text-xs text-[#991B1B]">
          <ul className="list-disc list-inside space-y-1">
            {proposal.outOfScope.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Commercial Terms & Payment Schedule */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-semibold text-xs text-[#111827] uppercase tracking-wider">
          4. Payment Schedule & Milestone Terms
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#F3F4F6] p-4 rounded-lg border border-[#E5E7EB] text-xs">
          <div>
            <span className="text-[#6B7280] block text-[11px]">Billable Engineering Hours</span>
            <span className="font-display font-bold text-base text-[#111827] font-mono tabular-nums">
              {calculations.billableHours} hrs
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] block text-[11px]">Effective Rate</span>
            <span className="font-display font-bold text-base text-[#111827] font-mono tabular-nums">
              {currencyConfig.symbol}
              {hourlyRate}/hr
            </span>
          </div>
          <div>
            <span className="text-[#6B7280] block text-[11px]">Total Project Investment</span>
            <span
              style={{ color: accentColor }}
              className="font-display font-bold text-base font-mono tabular-nums"
            >
              {currencyConfig.symbol}
              {calculations.totalInvestment.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden mt-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F3F4F6] text-[#374151] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3 border-b border-[#E5E7EB]">Milestone Tranche</th>
                <th className="py-2 px-3 border-b border-[#E5E7EB] text-right">Tranche Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {calculations.paymentSplit.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-medium">{it.phase}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">
                    {currencyConfig.symbol}
                    {it.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Standard Terms & Conditions */}
      <div className="flex flex-col gap-2 text-xs text-[#4B5563] leading-relaxed">
        <h2 className="font-display font-semibold text-xs text-[#111827] uppercase tracking-wider">
          5. Standard Agency Terms & Conditions
        </h2>
        {proposal.assumptions && proposal.assumptions.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-[#374151]">
            {proposal.assumptions.map((assumption, idx) => (
              <li key={idx}>{assumption}</li>
            ))}
          </ul>
        )}
        <p>
          <strong>Revisions Clause:</strong> Exactly 2 rounds of consolidated revisions are included
          within the scope. Additional revision cycles are billed at the standard rate of{' '}
          {currencyConfig.symbol}
          {hourlyRate}/hr.
        </p>
        <p>
          <strong>Feedback Responsiveness:</strong> Project timeline pauses automatically if client
          review delays exceed 5 business days.
        </p>
        <p>
          <strong>Intellectual Property:</strong> Intellectual property ownership transfers to the
          client upon full settlement of all milestones.
        </p>
        {proSettings.customLegalTerms && (
          <p className="mt-1 p-2 bg-white rounded border border-[#E5E7EB] text-[11px]">
            {proSettings.customLegalTerms}
          </p>
        )}
      </div>

      {/* 6. Dual Mutual Acceptance Signatures */}
      <div className="signature-block pt-6 border-t border-[#E5E7EB] grid grid-cols-2 gap-8 text-xs">
        <div className="flex flex-col gap-6">
          <span className="font-semibold text-[#111827]">
            For {proSettings.agencyName || 'Service Provider'}:
          </span>
          <div className="border-b border-[#9CA3AF] w-48" />
          <div className="text-[11px] text-[#6B7280]">
            <div>Authorized Signature</div>
            <div>Date: _______________</div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <span className="font-semibold text-[#111827]">For Client Organization:</span>
          <div className="border-b border-[#9CA3AF] w-48" />
          <div className="text-[11px] text-[#6B7280]">
            <div>Client Authorized Signatory</div>
            <div>Date: _______________</div>
          </div>
        </div>
      </div>

      {/* Footer Watermark */}
      {!proSettings.hideWatermark && (
        <div className="pt-4 text-center text-[10px] font-mono text-[#9CA3AF] border-t border-[#F3F4F6]">
          Generated via ScopeSnap v1.0 SPATIAL - High-Speed Groq LPU Architecture
        </div>
      )}
    </div>
  );
}

