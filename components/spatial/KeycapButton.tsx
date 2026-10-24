'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface KeycapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'neutral' | 'telemetry' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shortcutKey?: string;
  children: React.ReactNode;
  className?: string;
  isPressed?: boolean;
}

export const KeycapButton: React.FC<KeycapButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shortcutKey,
  children,
  className = '',
  isPressed: controlledPressed,
  onClick,
  disabled = false,
  ...rest
}) => {
  const [internalPressed, setInternalPressed] = useState(false);
  const isPressed = controlledPressed !== undefined ? controlledPressed : internalPressed;
  const prefersReducedMotion = useReducedMotion();

  // Listen for keyboard shortcut triggers (e.g., Cmd+Enter, Cmd+K)
  useEffect(() => {
    if (!shortcutKey || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMetaOrCtrl = e.metaKey || e.ctrlKey;
      const lowerKey = e.key.toLowerCase();
      const shortcutLower = shortcutKey.toLowerCase();

      let matched = false;
      if (shortcutLower.includes('enter') && isMetaOrCtrl && lowerKey === 'enter') {
        matched = true;
      } else if (shortcutLower.includes('k') && isMetaOrCtrl && lowerKey === 'k') {
        matched = true;
      }

      if (matched) {
        e.preventDefault();
        setInternalPressed(true);
        setTimeout(() => {
          setInternalPressed(false);
          if (onClick) {
            // Trigger synthetic click
            onClick({} as React.MouseEvent<HTMLButtonElement>);
          }
        }, 120);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, disabled, onClick]);

  // Variant styling map
  const variantStyles = {
    primary: {
      base: 'bg-[var(--accent-primary)] text-[#07080A] font-semibold border border-[rgba(16,185,129,0.5)]',
      normalShadow: '0 4px 0 #065F46, 0 8px 20px rgba(16, 185, 129, 0.25)',
      pressedShadow: '0 1px 0 #065F46, 0 2px 8px rgba(16, 185, 129, 0.15)',
      shortcutBadge: 'bg-black/20 text-[#07080A] border border-black/20',
      activeY: 3,
    },
    neutral: {
      base: 'bg-[var(--bg-control)] text-[var(--text-primary)] font-medium border border-[var(--border-default)] hover:border-[var(--border-strong)]',
      normalShadow: '0 3px 0 #07080A, 0 6px 12px rgba(0, 0, 0, 0.45)',
      pressedShadow: '0 1px 0 #07080A, 0 2px 4px rgba(0, 0, 0, 0.2)',
      shortcutBadge: 'bg-black/40 text-[var(--text-muted)] border border-white/10',
      activeY: 2,
    },
    telemetry: {
      base: 'bg-[var(--accent-telemetry)] text-[#07080A] font-semibold border border-[rgba(6,182,212,0.5)]',
      normalShadow: '0 4px 0 #0E7490, 0 8px 20px rgba(6, 182, 212, 0.25)',
      pressedShadow: '0 1px 0 #0E7490, 0 2px 8px rgba(6, 182, 212, 0.15)',
      shortcutBadge: 'bg-black/20 text-[#07080A] border border-black/20',
      activeY: 3,
    },
    warning: {
      base: 'bg-[var(--accent-warning)] text-[#07080A] font-semibold border border-[rgba(245,158,11,0.5)]',
      normalShadow: '0 4px 0 #B45309, 0 8px 20px rgba(245, 158, 11, 0.25)',
      pressedShadow: '0 1px 0 #B45309, 0 2px 8px rgba(245, 158, 11, 0.15)',
      shortcutBadge: 'bg-black/20 text-[#07080A] border border-black/20',
      activeY: 3,
    },
    danger: {
      base: 'bg-[var(--accent-danger)] text-white font-semibold border border-[rgba(244,63,94,0.5)]',
      normalShadow: '0 4px 0 #9F1239, 0 8px 20px rgba(244, 63, 94, 0.25)',
      pressedShadow: '0 1px 0 #9F1239, 0 2px 8px rgba(244, 63, 94, 0.15)',
      shortcutBadge: 'bg-black/30 text-white border border-white/20',
      activeY: 3,
    },
  }[variant];

  // Size styling map
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
  }[size];

  const currentY = prefersReducedMotion ? 0 : isPressed ? variantStyles.activeY : 0;
  const currentShadow = prefersReducedMotion ? 'none' : isPressed ? variantStyles.pressedShadow : variantStyles.normalShadow;

  const MotionButton = motion.button as any;

  return (
    <MotionButton
      type={rest.type || 'button'}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => !disabled && setInternalPressed(true)}
      onMouseUp={() => !disabled && setInternalPressed(false)}
      onMouseLeave={() => !disabled && setInternalPressed(false)}
      whileTap={prefersReducedMotion || disabled ? undefined : { y: variantStyles.activeY }}
      animate={{
        y: currentY,
      }}
      transition={{ duration: 0.06, ease: 'easeOut' }}
      style={{
        boxShadow: currentShadow,
      }}
      className={`relative inline-flex items-center justify-center select-none font-sans cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles.base} ${sizeStyles} ${className}`}
      {...rest}
    >
      <span className="flex items-center gap-2">{children}</span>

      {shortcutKey && (
        <kbd
          className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${variantStyles.shortcutBadge}`}
        >
          {shortcutKey}
        </kbd>
      )}
    </MotionButton>
  );
};

export default KeycapButton;
