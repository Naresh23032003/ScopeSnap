'use client';

import React from 'react';
import { Coins, Clock, Shield, FileText } from 'lucide-react';
import { SpatialCard3D } from '@/components/spatial';
import { CalculationResult, CurrencyConfig, PaymentSchedule } from '@/lib/types';

export interface KpiRibbonProps {
  calculations: CalculationResult;
  currencyConfig: CurrencyConfig;
  hourlyRate: number;
  riskBuffer: number;
  paymentSchedule: PaymentSchedule;
  trapCount: number;
}

export function KpiRibbon({
  calculations,
  currencyConfig,
  hourlyRate,
  riskBuffer,
  paymentSchedule,
  trapCount,
}: KpiRibbonProps) {
  const depositAmount =
    calculations.paymentSplit.items[0]?.amount ??
    Math.round(calculations.totalInvestment * 0.5);

  const bufferLabel =
    riskBuffer >= 1.35 ? '+35% Buffer' : riskBuffer >= 1.15 ? '+15% Buffer' : '1.0x Lean';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
      {/* Card 1: Total Project Investment */}
      <SpatialCard3D className="p-3.5 flex flex-col gap-1 shadow-lg" maxTilt={5} elevateZ={20}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate uppercase tracking-wider">
            Total Investment
          </span>
          <Coins className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
        </div>
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="font-mono font-bold text-lg text-[var(--accent-primary)] tabular-nums mt-1 truncate"
        >
          {currencyConfig.symbol}
          {calculations.totalInvestment.toLocaleString()}
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate">
          {calculations.billableHours}h @ {currencyConfig.symbol}
          {hourlyRate}/hr ({bufferLabel})
        </span>
      </SpatialCard3D>

      {/* Card 2: Estimated Timeline */}
      <SpatialCard3D className="p-3.5 flex flex-col gap-1 shadow-lg" maxTilt={5} elevateZ={20}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate uppercase tracking-wider">
            Est. Timeline
          </span>
          <Clock className="w-3.5 h-3.5 text-cyan-400 stroke-[1.5]" />
        </div>
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="font-mono font-bold text-lg text-[var(--text-primary)] tabular-nums mt-1 truncate"
        >
          {calculations.timelineWeeks} {calculations.timelineWeeks === 1 ? 'Week' : 'Weeks'} /{' '}
          {calculations.billableHours}h
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate">
          {calculations.timelineDays} Business Days ({calculations.baseHours}h base)
        </span>
      </SpatialCard3D>

      {/* Card 3: Scope Confidence Score */}
      <SpatialCard3D className="p-3.5 flex flex-col gap-1 shadow-lg" maxTilt={5} elevateZ={20}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate uppercase tracking-wider">
            Confidence Score
          </span>
          <Shield
            className={`w-3.5 h-3.5 stroke-[1.5] ${
              calculations.confidenceScore >= 85
                ? 'text-emerald-400'
                : calculations.confidenceScore >= 70
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          />
        </div>
        <div
          style={{ transform: 'translateZ(20px)' }}
          className={`font-mono font-bold text-lg tabular-nums mt-1 ${
            calculations.confidenceScore >= 85
              ? 'text-emerald-400'
              : calculations.confidenceScore >= 70
              ? 'text-amber-400'
              : 'text-rose-400'
          }`}
        >
          {calculations.confidenceScore}/100
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate">
          {trapCount} {trapCount === 1 ? 'Risk' : 'Risks'} Mitigated
        </span>
      </SpatialCard3D>

      {/* Card 4: Payment Split Breakdown */}
      <SpatialCard3D className="p-3.5 flex flex-col gap-1 shadow-lg" maxTilt={5} elevateZ={20}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate uppercase tracking-wider">
            Payment Split
          </span>
          <FileText className="w-3.5 h-3.5 text-amber-400 stroke-[1.5]" />
        </div>
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="font-mono font-bold text-base text-[var(--text-primary)] tabular-nums mt-1 truncate"
        >
          {currencyConfig.symbol}
          {depositAmount.toLocaleString()} Deposit
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate uppercase">
          {paymentSchedule === 'retainer' ? 'Monthly Retainer' : `${paymentSchedule} Tranches`}
        </span>
      </SpatialCard3D>
    </div>
  );
}

