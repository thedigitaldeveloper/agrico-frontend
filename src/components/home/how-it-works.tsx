'use client';

import { useState, useEffect, useRef } from 'react';

import {
  Search,
  Scale,
  Send,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  Headphones,
  GraduationCap,
  PhoneCall,
  GitCompare,
  BookOpen,
  FileCheck,
  Award,
  Users,
  LucideIcon,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { StepCard, HowItWorksSectionConfig } from '@/lib/cms/repositories/home';

const ICONS: Record<string, LucideIcon> = {
  Search,
  Scale,
  Send,
  ShieldCheck,
  Headphones,
  Sparkles,
  Layers,
  GraduationCap,
  PhoneCall,
  GitCompare,
  BookOpen,
  FileCheck,
  Award,
  Users,
};

const STEP_ACCENTS = [
  'from-brand-700 to-brand-900',
  'from-gold-600 to-amber-700',
  'from-emerald-700 to-teal-900',
  'from-indigo-700 to-violet-900',
  'from-sky-700 to-cyan-900',
];

export function HowItWorks({
  steps,
  config,
}: {
  steps?: StepCard[];
  config?: HowItWorksSectionConfig | null;
}) {
  const stepItems = steps ?? [];
  const defaultIcons = [Search, Scale, Send, GraduationCap];

  const sliderRef = useRef<HTMLOListElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide on mobile for Process Cards
  useEffect(() => {
    if (stepItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      if (el.scrollWidth > el.clientWidth) {
        setActiveStepIndex((prev) => {
          const nextIndex = (prev + 1) % stepItems.length;
          const card = el.children[nextIndex] as HTMLElement;
          if (card) {
            el.scrollTo({
              left: card.offsetLeft - el.offsetLeft,
              behavior: 'smooth',
            });
          }
          return nextIndex;
        });
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [stepItems.length, isPaused]);

  // Sync activeStepIndex on manual scroll
  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el || el.children.length === 0) return;
    const scrollLeft = el.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    Array.from(el.children).forEach((child, idx) => {
      const card = child as HTMLElement;
      const diff = Math.abs(card.offsetLeft - el.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveStepIndex(closestIndex);
  };

  if (stepItems.length === 0 && !config) {
    return null;
  }

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description = config?.description;
  const ctaLabel = config?.ctaLabel ?? '';
  const ctaLink = config?.ctaLink ?? '';

  return (
    <section className="relative overflow-hidden border-y border-ink-200/60 bg-gradient-to-b from-ink-50/40 via-white to-ink-50/40 py-6 sm:py-8 lg:py-12">
      {/* Decorative ambient background blur */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-brand-50/60 blur-3xl"
      />

      <div className="container-page relative z-10">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <Sparkles className="size-2.5 text-gold-500 sm:size-3" />
              {eyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-brand-300 to-brand-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>

        {/* Dynamic Process Cards with Desktop Flow Connector */}
        <div
          className="relative mt-4 sm:mt-6 lg:mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Connecting Flow Line on Desktop (runs between cards) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-10 right-10 hidden h-1 -translate-y-4 rounded-full bg-gradient-to-r from-brand-300 via-gold-400 to-emerald-400 opacity-70 md:block"
          />

          <ol
            ref={sliderRef}
            onScroll={handleScroll}
            className={cn(
              'scrollbar-none -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-6',
              stepItems.length === 3
                ? 'md:grid-cols-3'
                : stepItems.length === 2
                  ? 'md:grid-cols-2'
                  : 'sm:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {stepItems.map((item, index) => {
              const Icon = (item.iconName && ICONS[item.iconName]) || defaultIcons[index % defaultIcons.length];
              const accent = STEP_ACCENTS[index % STEP_ACCENTS.length];
              return (
                <li
                  key={item.title}
                  className="group relative flex w-[85vw] max-w-[340px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-4.5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-card-hover md:w-auto md:max-w-none md:p-6"
                >
                  {/* Step Watermark Number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-3 right-4 font-display text-4xl font-black text-ink-100/90 transition-colors duration-300 group-hover:text-brand-100"
                  >
                    {item.step}
                  </span>

                  <div>
                    {/* Top Row: Icon + Step Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex size-11 sm:size-13 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                      >
                        <Icon className="size-5 sm:size-6" />
                      </div>

                      {item.badge ? (
                        <span className="rounded-full bg-ink-50 px-2.5 py-0.5 text-2xs font-bold text-ink-700 ring-1 ring-ink-200/60 ring-inset">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="mt-4 sm:mt-5 font-display text-base sm:text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-800">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                      {item.description}
                    </p>

                    {/* Feature Checkpoints */}
                    {item.highlights && item.highlights.length > 0 ? (
                      <ul className="mt-3.5 sm:mt-4 space-y-1.5 border-t border-ink-100 pt-2.5 sm:pt-3.5">
                        {item.highlights.map((point) => (
                          <li key={point} className="flex items-center gap-2 text-2xs font-medium text-ink-700 sm:text-xs">
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {/* Micro action hint */}
                  <div className="mt-4 sm:mt-6 flex items-center justify-between border-t border-ink-100 pt-2.5 sm:pt-3 text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
                    <span>Explore Step Details</span>
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Mobile Auto-Slide Dots Indicator */}
          {stepItems.length > 1 ? (
            <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:hidden">
              {stepItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to step ${idx + 1}`}
                  onClick={() => {
                    const el = sliderRef.current;
                    if (!el) return;
                    const card = el.children[idx] as HTMLElement;
                    if (card) {
                      el.scrollTo({
                        left: card.offsetLeft - el.offsetLeft,
                        behavior: 'smooth',
                      });
                    }
                    setActiveStepIndex(idx);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    activeStepIndex === idx
                      ? 'w-6 bg-brand-700'
                      : 'w-1.5 bg-ink-200 hover:bg-ink-400'
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom CTA & Trust Strip */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 text-center sm:flex-row sm:gap-5 sm:mt-10 lg:mt-12">
          {ctaLink && ctaLabel ? <ButtonLink
            href={ctaLink}
            variant="accent"
            size="md"
            className="w-full sm:w-auto rounded-pill px-7 shadow-md"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="size-4" />
          </ButtonLink> : null}
          <ButtonLink
            href="/mentors"
            variant="outline"
            size="md"
            className="w-full sm:w-auto rounded-pill px-7"
          >
            <Headphones className="size-4 text-brand-700" />
            <span>Book 1-on-1 Guidance</span>
          </ButtonLink>
        </div>

        <p className="mt-4 text-center text-xs text-ink-500">
          🔒 100% Free Guidance for Students • Zero Application Fees on Select Universities • No Spam Policy
        </p>
      </div>
    </section>
  );
}
