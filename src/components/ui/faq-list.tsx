import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface FaqListItem {
  key: string;
  question: string;
  answer: ReactNode;
}

/**
 * Modern FAQ Disclosure list rendered as card items.
 */
export function FaqList({ items, className }: { items: FaqListItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <details
          key={item.key}
          className="group rounded-card border border-ink-200/80 bg-white transition-all hover:border-brand-300 shadow-xs open:border-brand-400 open:shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4.5 sm:p-5 select-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800 group-open:bg-brand-800 group-open:text-white transition-colors">
                Q
              </span>
              <h3 className="font-display text-sm sm:text-base font-bold text-ink-900 leading-snug">
                {item.question}
              </h3>
            </div>
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-all duration-200 group-open:rotate-180 group-open:bg-brand-100 group-open:text-brand-800"
            >
              <svg
                viewBox="0 0 12 12"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </summary>
          <div className="border-t border-ink-100 bg-ink-50/30 px-5 pt-4 pb-5 text-ink-700 leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
