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
    title: page?.name ?? 'Contact Us',
    description: 'Contact Agrico for programme and admission guidance.',
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
        description="Ask about a course, a university or your application. An advisor will get back to you."
        crumbs={TRAIL}
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          {page?.content?.length ? <DynamicZone blocks={page.content} /> : <div className="rs-contact-intro"><span className="rs-eyebrow">Let’s take the next step</span><h2>Good decisions start<br/>with a conversation.</h2><p>Tell us which programme interests you, or ask for help making your shortlist. Include any questions about the study mode, eligibility or application.</p></div>}
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
