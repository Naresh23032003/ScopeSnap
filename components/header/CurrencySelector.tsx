'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown, Check } from 'lucide-react';
import { Currency } from '@/lib/types';
import { CURRENCY_CONFIGS } from '@/lib/constants';

export interface CurrencySelectorProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currency,
  onCurrencyChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-control)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] text-xs font-mono text-[var(--text-primary)] transition-colors cursor-pointer select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-semibold text-emerald-300">{activeConfig.symbol}</span>
        <span>{currency}</span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[rgba(13,15,20,0.96)] border border-[var(--border-default)] backdrop-blur-xl shadow-2xl py-1 z-50 overflow-hidden"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            Select Currency
          </div>
          {CURRENCIES.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onCurrencyChange(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold w-4 text-center">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-sans">({c.name})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
