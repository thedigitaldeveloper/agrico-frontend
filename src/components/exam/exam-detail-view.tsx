import Image from 'next/image';
import Link from 'next/link';

import { SectionBody } from '@/components/cms/section-body';
import { formatDate } from '@/components/exam/exam-card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CardGrid } from '@/components/ui/card-grid';
import { FactCard } from '@/components/ui/fact-card';
import { KeyFacts } from '@/components/ui/key-facts';
import { Section } from '@/components/ui/section';
import { SectionNav } from '@/components/university/section-nav';
import { UniversityCard } from '@/components/university/university-card';
import { resolveThumbnail } from '@/lib/cms/media';
import type { ContentSection } from '@/lib/cms/repositories/content';
import type { ExamDetail } from '@/lib/cms/repositories/exam';
import { cn } from '@/lib/cn';
import { resolveLink } from '@/lib/links';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, examSchema } from '@/lib/seo/schemas';

const LINK =
  'text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600';

export function ExamDetailView({
  exam,
  section,
  activeSlug,
}: {
  exam: ExamDetail;
  section: ContentSection | null;
  activeSlug: string | null;
}) {
  const heading = section?.heading || section?.display_name || section?.name;
  const logo = resolveThumbnail(exam.logo, 128, exam.name);

  const schedule = [
    { label: 'Form opens', value: formatDate(exam.form_start_date) },
    { label: 'Last date to apply', value: formatDate(exam.form_closing_date) },
    { label: 'Admit card', value: formatDate(exam.admit_card_date) },
    { label: 'Exam date', value: formatDate(exam.examination_date) },
    { label: 'Registration fee', value: exam.registration_fee },
  ];

  // Editors type "nta.ac.in" as often as they type a full URL, and a bare host
  // in an href resolves against this page — /exams/jee-main/nta.ac.in.
  const links = exam.important_links.flatMap((link) => {
    const resolved = resolveLink(link.link);
    return resolved ? [{ id: link.id, name: link.name, ...resolved }] : [];
  });

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Exams', path: '/exams' },
    { name: exam.name, path: `/exams/${exam.slug}` },
  ];

  const hasSidebar = Boolean(exam.eligibility) || links.length > 0;

  return (
    <>
      <JsonLdGraph
        items={[
          examSchema(exam),
          breadcrumbSchema(trail),
          customSchema(section?.seo ?? exam.seo),
        ]}
      />
      <section className="surface-inverse bg-brand-900 text-white">
        <div className="container-page py-8 lg:py-12">
          <Breadcrumbs items={trail} tone="hero" className="mb-6" />

          <div className="flex gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-card bg-white p-2">
              {logo ? (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width ?? 80}
                  height={logo.height ?? 80}
                  className="size-full object-contain"
                  priority
                />
              ) : (
                <span className="font-display text-3xl font-extrabold text-brand-800">
                  {exam.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="font-display text-2xl leading-tight font-extrabold text-balance lg:text-4xl">
                {exam.name}
              </h1>
              {exam.full_name && exam.full_name !== exam.name ? (
                <p className="mt-1.5 text-white/70">{exam.full_name}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-1.5">
                {exam.exam_mode ? <Badge tone="inverse">{exam.exam_mode} mode</Badge> : null}
                {exam.streams.map((stream) => (
                  <Badge key={stream.documentId} tone="inverse">
                    {stream.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <KeyFacts items={schedule} className="mt-8" />
        </div>
      </section>

      <SectionNav
        basePath={`/exams/${exam.slug}`}
        sections={exam.university_contents}
        activeSlug={activeSlug}
      />

      <div
        className={cn(
          'container-page grid gap-10 py-10 lg:items-start lg:py-14',
          hasSidebar && 'lg:grid-cols-[1fr_18rem]'
        )}
      >
        <article className="min-w-0">
          {exam.description && !section ? (
            <p className="mb-6 text-base leading-relaxed text-ink-700">{exam.description}</p>
          ) : null}

          <SectionBody section={section} heading={heading} />
        </article>

        {hasSidebar ? (
          <aside aria-label="Exam details" className="space-y-6 lg:sticky lg:top-[3.75rem] lg:self-start">
            {exam.eligibility ? (
              <FactCard title="Eligibility">
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{exam.eligibility}</p>
              </FactCard>
            ) : null}

            {links.length > 0 ? (
              <FactCard title="Important links">
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link.id}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={LINK}
                        >
                          {link.name || 'Open link'}
                        </a>
                      ) : (
                        <Link href={link.href} className={LINK}>
                          {link.name || 'Open link'}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </FactCard>
            ) : null}
          </aside>
        ) : null}
      </div>

      {exam.universities.length > 0 ? (
        <Section title={`Universities accepting ${exam.name}`} tone="raised">
          <CardGrid
            items={exam.universities}
            getKey={(university) => university.documentId}
            cols="wide"
            label={`Universities accepting ${exam.name}`}
          >
            {(university) => <UniversityCard university={university} />}
          </CardGrid>
        </Section>
      ) : null}
    </>
  );
}
