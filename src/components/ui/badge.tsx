import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Tone =
  | 'neutral'
  | 'brand'
  | 'gold'
  | 'success'
  | 'info'
  | 'inverse'
  | 'warning'
  | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  gold: 'bg-gold-50 text-gold-800 ring-gold-200',
  success: 'bg-success-50 text-success-700 ring-success-500/20',
  info: 'bg-info-50 text-info-700 ring-info-500/20',
  // The light tones all disappear on the maroon heroes, which is why call
  // sites there were reaching past `tone` and writing the classes by hand.
  inverse: 'bg-white/10 text-white/90 ring-white/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-500/20',
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

/** Small status/label chip — approvals, rankings, "Trending", and so on. */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-2xs font-semibold',
        // A ring rather than a border, so the chip's box size does not shift
        // when tones change.
        'ring-1 ring-inset',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
