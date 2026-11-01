import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle2, Award, Star, ArrowRight, Building2 } from 'lucide-react';

import { resolveThumbnail } from '@/lib/cms/media';
import type { UniversityCard as University } from '@/lib/cms/repositories/university';

export function UniversityTile({ university }: { university: University }) {
  const href = `/university/${university.slug}`;
  const logo = resolveThumbnail(university.logo, 96, university.name);
  const location = [university.city, university.state].filter(Boolean).join(', ');
  const established = university.establish?.slice(0, 4);
  const ranking = university.rankings?.[0]?.name;
  const approvals = university.approvals?.slice(0, 2) ?? [];

  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover sm:p-5">
      <div>
        {/* Top Header: Logo + Verified & Ranking Badges */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-100 bg-white p-1.5 shadow-2xs transition-transform duration-300 group-hover:scale-105 sm:size-14">
            {logo ? (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width ?? 56}
                height={logo.height ?? 56}
                className="size-full object-contain"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 font-display text-base font-bold text-white shadow-inner sm:text-lg"
              >
                {university.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-2xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 ring-inset">
              <CheckCircle2 className="size-2.5 sm:size-3 text-emerald-600" />
              <span>UGC-DEB</span>
            </span>

            {ranking ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] sm:text-2xs font-semibold text-gold-800 ring-1 ring-gold-200/60 ring-inset">
                <Award className="size-2.5 sm:size-3 text-gold-600" />
                <span className="max-w-[85px] sm:max-w-[100px] truncate">{ranking}</span>
              </span>
            ) : established ? (
              <span className="text-[10px] sm:text-2xs font-medium text-ink-400">
                Estd. {established}
              </span>
            ) : null}
          </div>
        </div>

        {/* Institution Title & Location - Fixed Heights for Strict Uniformity */}
        <div className="mt-3 sm:mt-3.5">
          <h3 className="line-clamp-2 h-9 sm:h-10 font-display text-xs sm:text-sm font-bold text-ink-900 leading-snug transition-colors group-hover:text-brand-800">
            <Link href={href} className="before:absolute before:inset-0">
              {university.name}
            </Link>
          </h3>

          {location ? (
            <p className="mt-1 flex h-4 items-center gap-1 text-[11px] sm:text-xs text-ink-500">
              <MapPin className="size-2.5 sm:size-3 shrink-0 text-ink-400" />
              <span className="truncate">{location}</span>
            </p>
          ) : (
            <div className="mt-1 h-4" />
          )}
        </div>

        {/* Approvals & Ownership Tags - Fixed Height */}
        <div className="mt-2.5 flex h-6 items-center gap-1 overflow-hidden sm:mt-3 sm:gap-1.5">
          {university.ownership_type ? (
            <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] sm:text-2xs font-medium text-brand-800">
              {university.ownership_type.name}
            </span>
          ) : null}
          {approvals.map((appr) => (
            <span
              key={appr.documentId}
              className="shrink-0 rounded-md bg-ink-100/80 px-1.5 py-0.5 text-[10px] sm:text-2xs font-medium text-ink-700"
            >
              {appr.name}
            </span>
          ))}
          {university.rating ? (
            <span className="ml-auto shrink-0 inline-flex items-center gap-0.5 text-[10px] sm:text-2xs font-bold text-amber-600">
              <Star className="size-2.5 sm:size-3 fill-amber-400 text-amber-400" />
              {university.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Bar Footer */}
      <div className="mt-4 border-t border-ink-100 pt-2.5 sm:mt-5 sm:pt-3">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
          <span>View Programs & Fees</span>
          <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-800 group-hover:text-white">
            <ArrowRight className="size-2.5 sm:size-3" />
          </span>
        </div>
      </div>
    </article>
  );
}

