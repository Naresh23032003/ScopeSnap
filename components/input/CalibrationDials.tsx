'use client';

import React from 'react';
import { Sliders, ShieldAlert, CreditCard } from 'lucide-react';
import { Currency, PaymentSchedule } from '@/lib/types';
import { CURRENCY_CONFIGS, RISK_BUFFERS } from '@/lib/constants';

export interface CalibrationDialsProps {
  currency: Currency;
  hourlyRate: number;
  riskBuffer: number;
  paymentSchedule: PaymentSchedule;
  onHourlyRateChange: (rate: number) => void;
  onRiskBufferChange: (buffer: number) => void;
  onPaymentScheduleChange: (schedule: PaymentSchedule) => void;
  className?: string;
}

export const CalibrationDials: React.FC<CalibrationDialsProps> = ({
  currency,
  hourlyRate,
  riskBuffer,
  paymentSchedule,
  onHourlyRateChange,
  onRiskBufferChange,
  onPaymentScheduleChange,
  className = '',
}) => {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;

  const bufferOptions = [
    { key: 'STANDARD', label: '1.0x', val: RISK_BUFFERS.STANDARD.multiplier, title: RISK_BUFFERS.STANDARD.label },
    { key: 'GUARDED', label: '+15%', val: RISK_BUFFERS.GUARDED.multiplier, title: RISK_BUFFERS.GUARDED.label },
    { key: 'IRONCLAD', label: '+35%', val: RISK_BUFFERS.IRONCLAD.multiplier, title: RISK_BUFFERS.IRONCLAD.label },
  ];

  const scheduleOptions: { id: PaymentSchedule; label: string; desc: string }[] = [
    { id: '50/50', label: '50/50', desc: '50% Deposit / 50% Delivery' },
    { id: '40/30/30', label: '40/30/30', desc: '40% Kickoff / 30% Beta / 30% Final' },
    { id: 'retainer', label: 'Retainer', desc: 'Monthly Installments' },
  ];

  return (
    <div
      className={`rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] p-3.5 flex flex-col gap-3.5 ${className}`}
    >
      {/* Dial 1: Base Hourly Rate Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Base Hourly Rate</span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold text-xs tabular-nums">
            {config.symbol}
            {hourlyRate.toLocaleString()}
            /hr
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={config.minRate}
            max={config.maxRate}
            step={config.step}
            value={hourlyRate}
            onChange={(e) => onHourlyRateChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Adjust base hourly rate"
          />
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] w-24 text-right">
            <span>
              {config.symbol}
              {config.minRate}
            </span>
            <span>-</span>
            <span>
              {config.symbol}
              {config.maxRate}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-[var(--border-subtle)]" />

      {/* Dial 2: Risk Buffer Multiplier */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <span className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Risk Buffer Multiplier</span>
        </span>

        <div className="flex items-center gap-1 font-mono text-[11px] w-full sm:w-auto">
          {bufferOptions.map((opt) => {
            const isSelected = Math.abs(riskBuffer - opt.val) < 0.01;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onRiskBufferChange(opt.val)}
                title={opt.title}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-black/30 hover:bg-white/5 border-white/5 text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-[var(--border-subtle)]" />

      {/* Dial 3: Payment Schedule Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <span className="font-mono text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Payment Schedule</span>
        </span>

        <div className="flex items-center gap-1 font-mono text-[11px] w-full sm:w-auto">
          {scheduleOptions.map((s) => {
            const isSelected = paymentSchedule === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onPaymentScheduleChange(s.id)}
                title={s.desc}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-black/30 hover:bg-white/5 border-white/5 text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalibrationDials;
