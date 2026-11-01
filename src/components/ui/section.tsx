import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

interface SectionProps {
  title: string;
  description?: string;
  /** Renders a "view all" link beside the heading. */
  href?: string;
  linkLabel?: string;
  /** Small line above the title — names the section's job, not its content. */
  eyebrow?: string;
  tone?: 'page' | 'raised' | 'sunken';
  screen?: boolean;
  className?: string;
  children: ReactNode;
}

const TONES = {
  page: '',
  raised: 'bg-white border-y border-ink-100',
  sunken: 'bg-ink-100/70 border-y border-ink-200/60',
} as const;

/**
 * Standard section wrapper — heading, optional link, consistent fluid rhythm.
 */
export function Section({
  title,
  description,
  href,
  linkLabel = 'View all',
  eyebrow,
  tone = 'page',
  className,
  children,
}: SectionProps) {
  return (
    <section className={cn('py-12 lg:py-16', TONES[tone], className)}>
      <div className="container-page w-full">
        {/* Enhanced Centered Section Header with Flanking Accents */}
        <div className="relative mx-auto mb-8 max-w-3xl text-center lg:mb-10">
          {/* Subtle Ambient Radial Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-52 rounded-full bg-brand-50/70 blur-2xl -z-10"
          />

          {eyebrow ? (
            <div className="mb-3 flex items-center justify-center gap-2.5 sm:gap-3.5">
              <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-2xs font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs">
                <span className="size-1.5 rounded-full bg-brand-600 animate-pulse" />
                {eyebrow}
              </div>
              <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent via-brand-300 to-brand-400" />
            </div>
          ) : null}

          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 text-balance sm:text-3xl lg:text-4xl">
            {title}
          </h2>

          {description ? (
            <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {/* Centered Bottom Action Link */}
        {href ? (
          <div className="mt-8 flex justify-center lg:mt-10">
            <Link
              href={href}
              className="group inline-flex items-center gap-1.5 rounded-pill border border-ink-200/90 bg-white px-6 py-2.5 text-xs font-semibold text-ink-800 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 hover:shadow-sm"
            >
              <span>{linkLabel}</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

