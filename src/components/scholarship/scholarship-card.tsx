import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

import { resolveThumbnail } from '@/lib/cms/media';
import type { ScholarshipCard as Scholarship } from '@/lib/cms/repositories/scholarship';

export function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const href = `/scholarship/${scholarship.slug}`;
  const logo = resolveThumbnail(scholarship.logo, 96, scholarship.name);
  const location = [scholarship.city, scholarship.state].filter(Boolean).join(', ');
  const rating = typeof scholarship.rating === 'number' && Number.isFinite(scholarship.rating) && scholarship.rating >= 0 && scholarship.rating <= 5 ? scholarship.rating : null;

  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover">
      <div>
        {/* Top Header: Logo + State / Aid Type Badges (Fixed height slot) */}
        <div className="flex items-start justify-between gap-2.5 min-h-[56px]">
          <div className="flex size-13 sm:size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-100 bg-white p-1.5 shadow-2xs transition-transform duration-300 group-hover:scale-105">
            {logo ? (
              <Image
                src={logo.src}
                alt=""
                width={logo.width ?? 64}
                height={logo.height ?? 64}
                className="size-full object-contain"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 font-display text-lg font-bold text-white shadow-inner"
              >
                <GraduationCap className="size-6" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-2xs font-bold text-brand-800 ring-1 ring-brand-200/80 ring-inset">
              <Sparkles className="size-2.5 text-brand-600 sm:size-3" />
              <span>Financial Aid</span>
            </span>

            {scholarship.state ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-2xs font-medium text-ink-600 ring-1 ring-ink-200/60 ring-inset max-w-[120px] truncate">
                {scholarship.state}
              </span>
            ) : null}
          </div>
        </div>

        {/* Scholarship Name & Subtitle - Fixed Slot Heights for Strict Uniformity */}
        <div className="mt-3.5 sm:mt-4">
          <h3 className="line-clamp-2 h-10 sm:h-11 font-display text-sm sm:text-base font-bold text-ink-900 leading-snug transition-colors group-hover:text-brand-800">
            <Link href={href} className="before:absolute before:inset-0">
              {scholarship.name}
            </Link>
          </h3>
          {scholarship.full_name && scholarship.full_name !== scholarship.name ? (
            <p className="mt-1 line-clamp-1 h-4 text-xs text-ink-500">{scholarship.full_name}</p>
          ) : (
            <div className="mt-1 h-4" />
          )}
        </div>

        {/* Location & Rating Strip - Fixed Height */}
        <div className="mt-3 flex h-5 items-center justify-between gap-2 text-xs text-ink-600">
          {location ? (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0 text-ink-400" />
              <span className="truncate">{location}</span>
            </span>
          ) : null}

          {rating !== null ? (
            <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-2xs font-bold text-brand-600">
              <Star className="size-3 fill-brand-400 text-brand-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-ink-400">/ 5</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Bar Footer */}
      <div className="mt-4 sm:mt-5 border-t border-ink-100 pt-3 sm:pt-3.5">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
          <span>View Eligibility & Apply</span>
          <span className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-800 group-hover:text-white">
            <ArrowRight className="size-2.5 sm:size-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
