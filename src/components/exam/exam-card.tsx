import Image from 'next/image';
import Link from 'next/link';
import { CalendarClock, Calendar, BookOpen, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

import { resolveThumbnail } from '@/lib/cms/media';
import type { ExamCard as Exam } from '@/lib/cms/repositories/exam';

/** Formats an ISO date as "12 Mar 2026", or null when unset. */
export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ExamCard({ exam }: { exam: Exam }) {
  const href = `/exams/${exam.slug}`;
  const logo = resolveThumbnail(exam.logo, 96, exam.name);

  const closing = formatDate(exam.form_closing_date);
  const startDate = formatDate(exam.form_start_date);
  const examDate = formatDate(exam.examination_date);

  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-card-hover">
      <div>
        {/* Top Header: Logo + Exam Mode (Fixed height slot) */}
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
                className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 font-display text-lg font-bold text-white shadow-inner"
              >
                <BookOpen className="size-6" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {exam.exam_mode ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-2xs font-bold text-brand-800 ring-1 ring-brand-200/80 ring-inset">
                <FileText className="size-2.5 text-brand-600 sm:size-3" />
                <span>{exam.exam_mode}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-0.5 text-2xs font-semibold text-ink-600 ring-1 ring-ink-200/60 ring-inset">
                Entrance Exam
              </span>
            )}
          </div>
        </div>

        {/* Exam Title & Full Name - Fixed Slot Heights for Strict Uniformity */}
        <div className="mt-3.5 sm:mt-4">
          <h3 className="line-clamp-2 h-10 sm:h-11 font-display text-sm sm:text-base font-bold text-ink-900 leading-snug transition-colors group-hover:text-brand-800">
            <Link href={href} className="before:absolute before:inset-0">
              {exam.name}
            </Link>
          </h3>
          {exam.full_name && exam.full_name !== exam.name ? (
            <p className="mt-1 line-clamp-1 h-4 text-xs text-ink-500">{exam.full_name}</p>
          ) : (
            <div className="mt-1 h-4" />
          )}
        </div>

        {/* Stream Badges - Fixed Height */}
        <div className="mt-3 flex h-6 flex-wrap gap-1.5 overflow-hidden">
          {exam.streams.length > 0 ? (
            <>
              {exam.streams.slice(0, 3).map((stream) => (
                <span
                  key={stream.documentId}
                  className="rounded-md bg-ink-100/80 px-2 py-0.5 text-2xs font-medium text-ink-700"
                >
                  {stream.name}
                </span>
              ))}
              {exam.streams.length > 3 ? (
                <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-2xs font-medium text-ink-500">
                  +{exam.streams.length - 3}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-2xs text-ink-400">Multiple Disciplines</span>
          )}
        </div>

        {/* Important Closing Date Alert Box */}
        {closing ? (
          <div className="mt-3.5 flex h-8 items-center justify-between gap-2 rounded-xl bg-amber-50/90 px-3 py-1 text-xs ring-1 ring-amber-300/60 ring-inset">
            <span className="flex items-center gap-1.5 font-medium text-amber-800 text-[11px] sm:text-xs">
              <CalendarClock className="size-3.5 text-amber-600 shrink-0" />
              <span>Last Date:</span>
            </span>
            <span className="font-display font-bold text-amber-900 text-[11px] sm:text-xs">{closing}</span>
          </div>
        ) : (
          <div className="mt-3.5 flex h-8 items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-1 text-xs ring-1 ring-ink-200/50 ring-inset">
            <span className="flex items-center gap-1.5 font-medium text-ink-600 text-[11px] sm:text-xs">
              <Calendar className="size-3.5 text-ink-400 shrink-0" />
              <span>Dates:</span>
            </span>
            <span className="font-display font-semibold text-ink-700 text-[11px] sm:text-xs">Announced Soon</span>
          </div>
        )}
      </div>

      {/* Action Bar Footer */}
      <div className="mt-4 sm:mt-5 border-t border-ink-100 pt-3 sm:pt-3.5">
        <div className="flex items-center justify-between text-xs font-semibold text-brand-800 transition-colors group-hover:text-brand-900">
          <span>View Syllabus & Pattern</span>
          <span className="flex size-5.5 sm:size-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-800 group-hover:text-white">
            <ArrowRight className="size-2.5 sm:size-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
