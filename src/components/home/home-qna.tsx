import Link from 'next/link';
import { ArrowRight, MessageSquarePlus, UserCheck, Eye, MessageSquareQuote } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import type { QuestionCard } from '@/lib/cms/repositories/qna';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';

export function HomeQna({
  questions,
  config,
}: {
  questions: QuestionCard[];
  config?: SectionHeaderConfig | null;
}) {
  const displayQuestions = questions ?? [];

  if (displayQuestions.length === 0) {
    return null;
  }

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description =
    config?.description ?? '';
  const badges = config?.badges && config.badges.length > 0 ? config.badges : null;
  const ctaLabel = config?.ctaLabel ?? '';
  const ctaLink = config?.ctaLink ?? '';

  return (
    <section className="relative border-y border-ink-200/60 bg-gradient-to-b from-ink-50/40 via-white to-ink-50/40 py-6 sm:py-8 lg:py-12">
      <div className="container-page">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          {/* Subtle Ambient Radial Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-brand-50/70 blur-2xl -z-10"
          />

          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-brand-300 to-brand-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-800 uppercase ring-1 ring-brand-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <MessageSquareQuote className="size-2.5 text-brand-700 sm:size-3" />
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

          {/* Micro-Topic Badges (Horizontal Compact) */}
          {badges && badges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-ink-600 sm:mt-3 sm:gap-2 sm:text-2xs">
              {badges.map((b: string, idx: number) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white px-2 py-0.5 text-ink-700 shadow-2xs sm:px-2.5 sm:py-1"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      idx % 3 === 0 ? 'bg-brand-600' : idx % 3 === 1 ? 'bg-emerald-600' : 'bg-gold-600'
                    }`}
                  />
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Q&A Cards 2-Column Grid */}
        <ul className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {displayQuestions.slice(0, 4).map((question) => (
            <li key={question.documentId} className="h-full">
              <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover sm:p-6">
                <div>
                  {/* Top Bar: Question Badge + Answered Status & Views */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-bold text-emerald-800 ring-1 ring-emerald-200/80 ring-inset">
                      <UserCheck className="size-3 text-emerald-600" />
                      <span>Answered by Mentor</span>
                    </div>

                    {question.views ? (
                      <span className="flex items-center gap-1 text-2xs font-medium text-ink-400">
                        <Eye className="size-3" />
                        <span>{question.views} views</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Question Heading */}
                  <h3 className="mt-4 font-display text-base font-bold text-ink-900 transition-colors group-hover:text-brand-800 sm:text-lg">
                    <Link
                      href={`/qna/${question.slug}`}
                      className="before:absolute before:inset-0"
                    >
                      {question.title}
                    </Link>
                  </h3>

                  {/* Verified Answer Excerpt Callout */}
                  {question.body ? (
                    <div className="mt-3.5 rounded-xl border border-ink-100 bg-ink-50/70 p-3.5 text-xs leading-relaxed text-ink-700 sm:text-sm">
                      <p className="line-clamp-3">
                        <span className="mr-1.5 inline-block font-display font-bold text-emerald-700">Answer:</span>
                        {question.body}
                      </p>
                    </div>
                  ) : null}

                  {/* Topic & Stream Tags */}
                  {question.streams.length > 0 ? (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {question.streams.map((stream) => (
                        <span
                          key={stream.slug}
                          className="rounded-md bg-ink-100/80 px-2 py-0.5 text-2xs font-medium text-ink-700"
                        >
                          {stream.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3.5 text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
                  <span>View Full Verified Discussion</span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-800 group-hover:text-white">
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* Bottom CTA Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-ink-200/80 bg-white p-5 shadow-xs sm:p-6 lg:mt-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
              <MessageSquarePlus className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-ink-900 sm:text-base">
                Have a Specific Admission Query?
              </p>
              <p className="text-xs text-ink-600">
                Post your question and get a verified response from academic counselors within 2 hours.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {ctaLink && ctaLabel ? <Link
              href={ctaLink}
              className="group inline-flex items-center justify-center gap-1.5 rounded-pill border border-ink-200/90 bg-white px-5 py-2 text-xs font-semibold text-ink-800 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link> : null}
            <ButtonLink href="/qna#ask" variant="accent" size="sm" className="w-full sm:w-auto rounded-pill px-5 shadow-xs">
              <MessageSquarePlus className="size-3.5" />
              <span>Ask Your Question (Free)</span>
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

