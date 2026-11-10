import Link from 'next/link';
import { Metadata } from 'next';
import { Globe, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { listUniversities } from '@/lib/cms/repositories/university';
import { buildMetadata } from '@/lib/metadata';
import { listProgrammeContent } from '@/lib/agrico/programme-content';
import { publicationUniversities } from '@/lib/agrico/publication';

export const metadata: Metadata = buildMetadata({
  title: 'Sitemap — Universities, Programmes & Resources',
  description:
    'Find university profiles, programmes, admission guidance, news and blogs on Agrico.',
  path: '/sitemap',
});

export default async function SitemapPage() {
  const { universities } = await listUniversities({ pageSize: 50 });
  const programmes = listProgrammeContent();
  const directoryUniversities = [
    ...new Map(
      [
        ...universities.map((u) => ({ slug: u.slug, name: u.name })),
        ...publicationUniversities.map((u) => ({ slug: u.slug, name: u.name || u.title })),
      ].map((u) => [u.slug, u])
    ).values(),
  ];

  return (
    <div className="bg-ink-50/50 py-12 lg:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-2xs font-extrabold text-brand-800 ring-1 ring-brand-200/60 mb-3">
            <Globe className="size-3.5" />
            <span>Site Directory</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Find your way around Agrico
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Find a university, explore a programme, compare your options or read practical admission guidance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Static / Core Pages */}
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-ink-150">
              <ShieldCheck className="size-5 text-brand-700" />
              <h2 className="font-display text-base font-bold text-ink-900">General & Admissions</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/agriculture-colleges" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Agriculture Colleges Directory
                </Link>
              </li>
              <li>
                <Link href="/articles" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Agriculture Study Guides
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  About Agrico
                </Link>
              </li>
              <li>
                <Link href="/common-application-form" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Common Application Form
                </Link>
              </li>
              <li>
                <Link href="/compare" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Compare Universities
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Book Mentor Session
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Blogs & Guidance
                </Link>
              </li>
              <li>
                <Link href="/news" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Education News
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors">
                  Disclaimer & Neutrality Charter
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Online Degrees */}
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-ink-150">
              <GraduationCap className="size-5 text-brand-700" />
              <h2 className="font-display text-base font-bold text-ink-900">Programmes</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/programs" className="font-semibold text-brand-800 hover:underline">
                  Explore all programmes &rarr;
                </Link>
              </li>
              {programmes.map((prog) => (
                <li key={prog.slug}>
                  <Link
                    href={`/${prog.slug}`}
                    className="inline-flex min-h-11 items-center text-ink-700 hover:text-brand-800 transition-colors"
                  >
                    {prog.name} ({prog.level})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Accredited Agriculture Universities */}
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-ink-150">
              <Building2 className="size-5 text-brand-700" />
              <h2 className="font-display text-base font-bold text-ink-900">Universities</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/agriculture-colleges" className="font-semibold text-brand-800 hover:underline">
                  Browse All Agriculture Colleges &rarr;
                </Link>
              </li>
              {directoryUniversities.slice(0, 24).map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/university/${u.slug}`}
                    className="text-ink-700 hover:text-brand-800 transition-colors block break-words"
                  >
                    {u.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
