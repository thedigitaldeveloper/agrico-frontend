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
    title: page?.name ?? 'About Us',
    description: 'Explore programmes and plan your next step with Agrico.',
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
        description="Learning has boundless possibilities — but only if you can see your options clearly."
        crumbs={TRAIL}
      />

      <div className="mt-12">
        {page?.content?.length ? <DynamicZone blocks={page.content} /> : <div className="rs-about-grid"><h2>Your ambition.<br/>A clearer direction.</h2><div><p>Agrico helps you explore university programmes, understand the details and take the next step with confidence.</p><p>Start with what you want to study. Compare your options, check the study mode and ask for current eligibility and fees before you decide.</p></div></div>}
      </div>

      <section className="surface-inverse mt-16 rounded-card bg-brand-900 px-6 py-12 text-center text-white lg:px-16">
        <h2 className="font-display text-2xl font-extrabold text-balance text-white lg:text-3xl">
          Have a question about your options?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/75">
          Talk through your programme choices and admission questions.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact-us" variant="accent" size="lg">
            Contact us
          </ButtonLink>
          <ButtonLink href="/blogs" variant="inverse" size="lg">
            Explore our blogs
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
