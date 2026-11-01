import Link from 'next/link';
import { ArrowRight, BookOpen, Clock3, Monitor } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { RatingStars } from '@/components/ui/rating-stars';
import { ProgramAdmissionSidebar } from './program-admission-sidebar';
import { durationLabel, programSummary } from './program-facts';
import type { ProgramDetail } from '@/lib/cms/repositories/program';
import type { Crumb } from '@/lib/seo/schemas';
import { RichText } from '@/components/cms/rich-text';

export function ProgramHero({ program, trail }: { program: ProgramDetail; trail: Crumb[] }) {
  const name = program.full_name || program.name;
  const summary = programSummary(program);
  const duration = durationLabel(program);
  const tags = [program.course?.level, program.course_type, program.stream, program.tag].filter(Boolean);
  const rating = program.rating === null || program.rating === undefined ? null : Number(program.rating);
  return <section className="rs-pd-hero">
    <div className="container-page">
      <Breadcrumbs items={trail} className="rs-pd-breadcrumbs" />
      <div className="rs-pd-hero-grid">
        <div className="rs-pd-intro">
          <p className="rs-pd-eyebrow">Find your direction</p>
          <div className="rs-pd-tags">{tags.map((tag, index) => <span key={tag!.documentId + index}>{tag!.name}</span>)}</div>
          <h1>{name}</h1>
          <div className="rs-pd-hero-facts">
            {program.course_mode?.name ? <span><Monitor size={18} aria-hidden="true" />{program.course_mode.name}</span> : null}
            {duration ? <span><Clock3 size={18} aria-hidden="true" />{duration}</span> : null}
            {program.course?.name ? <span><BookOpen size={18} aria-hidden="true" />{program.course.name}</span> : null}
          </div>
          {program.short_description?.length ? <div className="rs-pd-summary"><RichText content={program.short_description} /></div> : summary ? <p className="rs-pd-summary">{summary}</p> : null}
          {rating !== null && Number.isFinite(rating) && rating >= 0 && rating <= 5 ? <div className="rs-pd-rating"><RatingStars value={rating} /></div> : null}
          <div className="rs-pd-hero-links">
            {program.universities.length ? <a href="#universities" className="rs-pd-button rs-pd-button-outline">Explore university options<ArrowRight size={17} aria-hidden="true" /></a> : null}
            <Link href="/programs" className="rs-pd-text-link">Browse programmes<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <ProgramAdmissionSidebar program={program} />
      </div>
    </div>
  </section>;
}
