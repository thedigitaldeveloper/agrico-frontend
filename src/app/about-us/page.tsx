import type { Metadata } from 'next';

import { DynamicZone } from '@/components/cms/dynamic-zone';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { getAboutPage } from '@/lib/cms/repositories/page';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'About us', path: '/about-us' },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();
  return buildMetadata({
    seo: page?.seo,
    title: page?.name ?? 'About Agrico — On-Campus Agriculture Education & Admissions Platform',
    description:
      'Learn how Agrico researches 62+ Indian agricultural universities, 18 ICAR-aligned degree programmes, entrance exams, and scholarships to help students make informed campus decisions.',
    path: '/about-us',
  });
}

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <div className="container-page py-10 lg:py-16">
      <JsonLdGraph items={[breadcrumbSchema(TRAIL)]} />

      <PageHeader
        title={page?.name ?? 'About Agrico'}
        description="Source-verified academic discovery for on-campus agriculture, horticulture, agricultural engineering, and allied sciences in India."
        crumbs={TRAIL}
      />

      <div className="mt-12">
        {page?.content?.length ? (
          <DynamicZone blocks={page.content} />
        ) : (
          <div className="space-y-12">
            <div className="rs-about-grid">
              <h2>
                Clarity for every
                <br />
                agriculture aspirant.
              </h2>
              <div className="space-y-4">
                <p>
                  Agrico was built to solve a critical information gap in Indian higher education: students and parents comparing on-campus agriculture degrees often face scattered PDF notifications, unclear ICAR accreditation claims, and incomplete fee breakdowns.
                </p>
                <p>
                  We compile and cross-verify official prospectuses, ICAR NAEAB public registers, State Agricultural University (SAU) counselling bulletins, and 6th Deans’ Committee curriculum frameworks so you can evaluate programmes on real academic merit—instructional farm acreage, laboratory depth, RAWE field training, and verified admission pathways.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
                <p className="font-display text-3xl font-extrabold text-[#10281E]">62+</p>
                <p className="mt-1 text-sm font-bold text-ink-900">Profiled Institutions</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                  State Agricultural Universities (SAUs), ICAR Deemed Universities, Central Universities, and audited private agriculture colleges.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
                <p className="font-display text-3xl font-extrabold text-[#10281E]">18</p>
                <p className="mt-1 text-sm font-bold text-ink-900">ICAR-Aligned Degree Guides</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                  Covering B.Sc. (Hons.) Agriculture, Horticulture, Forestry, B.Tech. Agricultural Engineering, B.V.Sc. &amp; A.H., M.Sc. Agronomy, and MBA Agribusiness.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
                <p className="font-display text-3xl font-extrabold text-[#10281E]">12+</p>
                <p className="mt-1 text-sm font-bold text-ink-900">Entrance Exam Roadmaps</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                  Detailed syllabus, subject-combination rules, and counselling calendars for CUET (ICAR-UG), ICAR AIEEA (PG), UPCATET, JET, MHT-CET, and KCET.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
                <p className="font-display text-3xl font-extrabold text-[#10281E]">100%</p>
                <p className="mt-1 text-sm font-bold text-ink-900">Source-Cited Editorial Policy</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                  Every university profile links directly to official university domains and public statutory records—never synthetic fee promises.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="surface-inverse mt-16 rounded-card bg-[#10281E] px-6 py-12 text-center text-white lg:px-16">
        <h2 className="font-display text-2xl font-extrabold text-balance text-white lg:text-3xl">
          Have a question about your agriculture degree options?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">
          Speak with an Agrico admission mentor to compare State Agricultural Universities, verify ICAR accreditation scope, and plan your entrance counselling.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact-us" variant="accent" size="lg">
            Contact our admissions desk
          </ButtonLink>
          <ButtonLink href="/mentors" variant="inverse" size="lg">
            Meet academic mentors
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
