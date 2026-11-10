import type { Metadata } from 'next';

import { DynamicZone } from '@/components/cms/dynamic-zone';
import { EnquiryForm } from '@/components/forms/enquiry-form';
import { PageHeader } from '@/components/ui/page-header';
import { getContactPage } from '@/lib/cms/repositories/page';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'Contact us', path: '/contact-us' },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return buildMetadata({
    seo: page?.seo,
    title: page?.name ?? 'Contact Us — Agriculture Admissions & Counselling Desk',
    description:
      'Contact Agrico for on-campus agriculture programme guidance, State Agricultural University vs. private campus comparisons, and ICAR / State CET counselling support.',
    path: '/contact-us',
  });
}

export default async function ContactPage() {
  const page = await getContactPage();

  return (
    <div className="container-page py-10 lg:py-16">
      <JsonLdGraph items={[breadcrumbSchema(TRAIL)]} />

      <PageHeader
        title={page?.name ?? 'Contact us'}
        description="Ask about an on-campus agriculture degree, ICAR accreditation, entrance exams, or university shortlisting. An academic advisor will get back to you."
        crumbs={TRAIL}
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-8">
          {page?.content?.length ? (
            <DynamicZone blocks={page.content} />
          ) : (
            <div className="rs-contact-intro">
              <span className="rs-eyebrow">Agriculture Admissions Desk</span>
              <h2>
                Good campus decisions start
                <br />
                with verified facts.
              </h2>
              <p>
                Tell us which agricultural programme interests you—such as B.Sc. (Hons.) Agriculture, B.Tech. Agricultural Engineering, Horticulture, or MBA Agribusiness—and whether you are applying through CUET (ICAR-UG), a State CET, or direct university merit.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <p className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800">
                Counselling Hours (IST)
              </p>
              <p className="mt-1 font-display text-base font-bold text-ink-950">
                Mon – Sat · 9:30 AM to 6:30 PM
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Dedicated callback support during active ICAR AIQ and State CET choice-filling windows.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <p className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800">
                What We Help Verify
              </p>
              <p className="mt-1 font-display text-base font-bold text-ink-950">
                ICAR Scope, Fees &amp; Farm Facilities
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Degree-specific accreditation checks, 4-year residential fee structures, and scholarship eligibility.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-ink-200 bg-white p-6 shadow-card lg:p-8">
          <h2 className="text-xl font-bold text-ink-900">Send us a message</h2>
          <div className="mt-6">
            <EnquiryForm source="contact" submitLabel="Send message" />
          </div>
        </div>
      </div>
    </div>
  );
}
