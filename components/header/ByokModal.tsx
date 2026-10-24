'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ShieldCheck, ExternalLink, X, Trash2, CheckCircle2 } from 'lucide-react';
import { KeycapButton } from '@/components/spatial';

export interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onKeySaved: (key: string) => void;
  onKeyCleared: () => void;
}

const STORAGE_KEY = 'scopesnap_groq_key';

export const ByokModal: React.FC<ByokModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onKeySaved,
  onKeyCleared,
}) => {
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(apiKey || '');
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [apiKey, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Groq API key.');
      setSuccessMessage(null);
      return;
    }

    if (!trimmed.startsWith('gsk_')) {
      setErrorMessage('Invalid key format. Groq API keys must begin with "gsk_".');
      setSuccessMessage(null);
      return;
    }

    if (trimmed.length < 12) {
      setErrorMessage('Key is too short. Please paste a valid Groq API key.');
      setSuccessMessage(null);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      onKeySaved(trimmed);
      setErrorMessage(null);
      setSuccessMessage('Groq API Key safely saved to local storage!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setErrorMessage('Failed to access browser localStorage.');
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setInputValue('');
      onKeyCleared();
      setErrorMessage(null);
      setSuccessMessage('API Key cleared from local storage.');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setErrorMessage('Failed to clear browser localStorage.');
    }
  };

  // Masked key display helper
  const getMaskedKey = (key: string): string => {
    if (!key || key.length < 8) return '••••••••';
    const start = key.slice(0, 4);
    const end = key.slice(-4);
    return `${start}${'•'.repeat(Math.max(4, key.length - 8))}${end}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="byok-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-[480px] rounded-2xl bg-[rgba(13,15,20,0.96)] border border-[rgba(16,185,129,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-6 flex flex-col gap-5 text-[var(--text-primary)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 id="byok-modal-title" className="font-display font-bold text-base tracking-tight text-white">
                Bring Your Own Groq Key
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Stored exclusively in your browser localStorage. Never sent to our servers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stored Status Banner */}
        {apiKey ? (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300">Active Custom Key</span>
                <div className="font-mono text-[11px] text-[var(--text-muted)]">
                  {getMaskedKey(apiKey)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--bg-control)] border border-[var(--border-subtle)] p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
            ScopeSnap includes an automated demo fallback engine. Add your free Groq API key to unlock unlimited, live high-speed generation with <span className="font-mono text-emerald-400 font-semibold">llama-3.3-70b-versatile</span>.
          </div>
        )}

        {/* Input Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            Groq API Key (starts with gsk_)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              placeholder="gsk_..."
              className="w-full rounded-xl bg-[var(--bg-control)] border border-[var(--border-default)] focus:border-emerald-500 focus:outline-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-[var(--text-muted)] pr-10 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error or Success notification */}
        {errorMessage && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg p-2.5 font-mono">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-2.5 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Free Groq Key Link */}
        <div className="flex items-center justify-between text-xs pt-1">
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 font-mono text-[11px]"
          >
            <span>Get a free Groq API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            No credit card required
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <KeycapButton
            variant="primary"
            size="md"
            onClick={handleSave}
            className="px-5 font-semibold"
          >
            Save Key
          </KeycapButton>
        </div>
      </div>
    </div>
  );
};

export default ByokModal;
