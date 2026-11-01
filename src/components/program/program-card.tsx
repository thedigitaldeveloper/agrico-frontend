import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { resolveThumbnail } from '@/lib/cms/media';
import type { ProgramCard as Program } from '@/lib/cms/repositories/program';
import { durationLabel } from './program-facts';
/** University-specific cards keep the institution visible before the programme details. */
export function ProgramCard({ program }: { program: Program }) {
  const university =
    program.universities?.length === 1 ? program.universities[0] : null;
  const href = university
    ? '/offering/' + university.slug + '/' + program.slug
    : '/' + program.slug;
  const icon = resolveThumbnail(program.program_icon, 64, program.name);
  const level = program.course?.level?.name;
  const rating = typeof program.rating === 'number' && Number.isFinite(program.rating)
    && program.rating >= 0 && program.rating <= 5 ? program.rating : null;
  return (
    <article className="rs-catalogue-card">
      <div className="rs-catalogue-brand">
        {icon ? (
          <Image src={icon.src} width={40} height={40} alt="" />
        ) : (
          <GraduationCap size={32} strokeWidth={1.3} />
        )}
        <span>{university?.name || 'Explore university options'}</span>
      </div>
      {level || program.tag ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-700">
          {level ? <span>{level}</span> : null}
          {program.tag ? <span className="max-w-full rounded-md bg-brand-50 px-2.5 py-1 font-semibold break-words text-brand-800">{program.tag.name}</span> : null}
        </div>
      ) : null}
      <h3>
        <Link href={href}>{program.course?.name || program.name}</Link>
      </h3>
      <p>{program.full_name || program.name}</p>
      {rating !== null ? <RatingStars value={rating} /> : null}
      <dl>
        <div>
          <dt>Duration</dt>
          <dd>{durationLabel(program) || 'To be confirmed'}</dd>
        </div>
        <div>
          <dt>Study mode</dt>
          <dd>{program.course_mode?.name || 'To be confirmed'}</dd>
        </div>
      </dl>
      <p className="rs-small">Check university fees and eligibility.</p>
      <Link href={href} className="rs-button">
        {program.view_button_text || 'View programme details'} <ArrowRight size={16} />
      </Link>
    </article>
  );
}
