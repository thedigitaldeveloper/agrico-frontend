import Image from 'next/image';
import Link from 'next/link';
import { Clock, Briefcase, ArrowRight } from 'lucide-react';

import { resolveThumbnail } from '@/lib/cms/media';
import type { MentorCard as Mentor } from '@/lib/cms/repositories/mentor';

export function MentorCard({ mentor }: { mentor: Mentor }) {
  const href = `/mentors/${mentor.slug}`;
  const photo = resolveThumbnail(mentor.photo, 160, mentor.display_name);
  const hasExperience = typeof mentor.experience_years === 'number' && mentor.experience_years >= 0;
  const hasDuration = Number.isFinite(mentor.session_minutes) && mentor.session_minutes > 0;

  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover">
      <div>
        <div className="flex items-start gap-3">
          <div className="relative flex size-13 sm:size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-ink-100 bg-brand-50 shadow-2xs transition-transform duration-300 group-hover:scale-105">
            {photo ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width ?? 64}
                height={photo.height ?? 64}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-display text-xl font-bold text-brand-800">
                {mentor.display_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-sm sm:text-base font-bold text-ink-900 transition-colors group-hover:text-brand-800">
              <Link href={href} className="before:absolute before:inset-0">
                {mentor.display_name}
              </Link>
            </h3>
            {mentor.headline ? (
              <p className="mt-1 line-clamp-2 h-8 text-xs text-ink-600 leading-snug">{mentor.headline}</p>
            ) : (
              <div className="mt-1 h-8" />
            )}
          </div>
        </div>

        {/* Stream Badges - Fixed Height */}
        <div className="mt-3 flex min-h-6 items-center flex-wrap gap-1.5">
          {mentor.streams.slice(0, 3).map((stream) => (
            <span
              key={stream.documentId}
              className="rounded-md bg-brand-50 px-2 py-0.5 text-2xs font-medium text-brand-800"
            >
              {stream.name}
            </span>
          ))}
          {mentor.is_accepting_bookings ? (
            <span className="ml-auto inline-flex items-center gap-1 text-2xs font-semibold text-brand-800">
              <span className="size-1.5 rounded-full bg-brand-800" />
              Accepting requests
            </span>
          ) : (
            <span className="ml-auto text-2xs text-ink-600">Bookings paused</span>
          )}
        </div>

        {/* Experience & Session Details */}
        {hasExperience || hasDuration ? <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-ink-50/70 p-2 text-xs">
          {hasExperience ? <div className="flex items-center gap-1.5 text-ink-700 truncate">
            <Briefcase className="size-3.5 text-ink-400 shrink-0" />
            <span className="truncate">{mentor.experience_years} yrs experience</span>
          </div> : null}
          {hasDuration ? <div className="flex items-center gap-1.5 text-ink-700 truncate">
            <Clock className="size-3.5 text-ink-400 shrink-0" />
            <span className="truncate">{mentor.session_minutes} min 1-on-1</span>
          </div> : null}
        </div> : null}
      </div>

      {/* Action Bar Footer */}
      <div className="mt-4 sm:mt-5 border-t border-ink-100 pt-3 sm:pt-3.5">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
          <span>{mentor.is_accepting_bookings ? 'View profile & request a session' : 'View mentor profile'}</span>
          <span className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-800 group-hover:text-white">
            <ArrowRight className="size-2.5 sm:size-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
