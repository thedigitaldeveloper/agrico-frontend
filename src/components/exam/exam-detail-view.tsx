import Image from 'next/image';
import Link from 'next/link';

import { SectionBody } from '@/components/cms/section-body';
import { formatDate } from '@/components/exam/exam-card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ButtonLink } from '@/components/ui/button';
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
  'text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-700';

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

  const links = exam.important_links.flatMap((link) => {
    const resolved = resolveLink(link.link);
    return resolved ? [{ id: link.id, name: link.name, ...resolved }] : [];
  });

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Exams', path: '/exams' },
    { name: exam.name, path: `/exams/${exam.slug}` },
  ];

  const hasSidebar = Boolean(exam.eligibility) || links.length > 0 || exam.courses.length > 0;

  return (
    <>
      <JsonLdGraph
        items={[
          examSchema(exam),
          breadcrumbSchema(trail),
          customSchema(section?.seo ?? exam.seo),
        ]}
      />
      <section className="surface-inverse bg-[#10281E] text-white">
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
                <span className="font-display text-3xl font-extrabold text-emerald-900">
                  {exam.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="font-display text-2xl leading-tight font-extrabold text-balance lg:text-4xl">
                {exam.name}
              </h1>
              {exam.full_name && exam.full_name !== exam.name ? (
                <p className="mt-1.5 text-white/75">{exam.full_name}</p>
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
          hasSidebar && 'lg:grid-cols-[1fr_20rem]'
        )}
      >
        <article className="min-w-0 space-y-8">
          {exam.description && !section ? (
            <>
              <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                <h2 className="font-display text-xl font-bold text-ink-950">
                  Examination Overview &amp; Admission Scope
                </h2>
                <p className="text-base leading-relaxed text-ink-700">{exam.description}</p>
                {exam.eligibility ? (
                  <div className="pt-4 border-t border-ink-150">
                    <h3 className="font-display text-base font-bold text-ink-900 mb-2">
                      Academic Eligibility &amp; Subject Combination
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-700">{exam.eligibility}</p>
                  </div>
                ) : null}
                <div className="pt-4 border-t border-ink-150 flex flex-wrap gap-3">
                  <ButtonLink href="/common-application-form" variant="primary" size="sm">
                    Get Exam &amp; Counselling Guidance
                  </ButtonLink>
                  <ButtonLink href="/agriculture-colleges" variant="outline" size="sm">
                    Explore Participating Universities
                  </ButtonLink>
                </div>
              </div>

              {exam.exam_pattern && exam.exam_pattern.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Exam Pattern, Marking Scheme &amp; Seat Quotas
                  </h2>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {exam.exam_pattern.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-ink-150 bg-ink-50/50 p-4"
                      >
                        <dt className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                          {item.label}
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-ink-800">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {exam.syllabus_highlights && exam.syllabus_highlights.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Core Syllabus &amp; Subject Modules
                  </h2>
                  <div className="space-y-4">
                    {exam.syllabus_highlights.map((mod) => (
                      <div
                        key={mod.subject}
                        className="rounded-xl border border-ink-150 p-4 space-y-1.5"
                      >
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {mod.subject}
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-700">{mod.topics}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {exam.counselling_steps && exam.counselling_steps.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Step-by-Step Application &amp; Counselling Process
                  </h2>
                  <ol className="space-y-4">
                    {exam.counselling_steps.map((step) => (
                      <li
                        key={step.title}
                        className="rounded-xl border border-ink-150 bg-ink-50/40 p-4 space-y-1"
                      >
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-700">{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {exam.faqs && exam.faqs.length > 0 ? (
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="font-display text-xl font-bold text-ink-950">
                    Frequently Asked Questions — {exam.name}
                  </h2>
                  <div className="space-y-4">
                    {exam.faqs.map((faq) => (
                      <div key={faq.question} className="border-b border-ink-150 pb-4 last:border-b-0 last:pb-0">
                        <h3 className="font-display text-base font-bold text-ink-900">
                          {faq.question}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {section ? <SectionBody section={section} heading={heading} /> : null}
        </article>

        {hasSidebar ? (
          <aside aria-label="Exam details" className="space-y-6 lg:sticky lg:top-[3.75rem] lg:self-start">
            {exam.eligibility ? (
              <FactCard title="Eligibility Criteria">
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{exam.eligibility}</p>
              </FactCard>
            ) : null}

            {exam.courses.length > 0 ? (
              <FactCard title="Degrees Accepting This Exam">
                <ul className="mt-3 space-y-2">
                  {exam.courses.map((course) => (
                    <li key={course.documentId}>
                      <Link href={`/${course.slug}`} className={LINK}>
                        {course.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FactCard>
            ) : null}

            {links.length > 0 ? (
              <FactCard title="Official Portals & Notices">
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
