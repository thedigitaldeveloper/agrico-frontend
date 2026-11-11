import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AgricoSiteChrome } from '@/components/agrico/chrome';
import { SiteSettingsProvider } from '@/components/providers/site-settings-provider';
import { EnquiryModalProvider } from '@/components/university/university-enquiry-modal';
import { getSiteSettings } from '@/lib/cms/repositories/settings';
import { SITE_NAME, SITE_URL } from '@/lib/env';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { organizationSchema, websiteSchema } from '@/lib/seo/schemas';
import './globals.css';
import './rs.css';

// One self-hosted font across the site, with no render-blocking Google request.
const dmSans = localFont({
  src: './fonts/dm-sans-latin.woff2',
  weight: '100 1000',
  style: 'normal',
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Compare Agriculture Universities, Degrees & Entrance Exams`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Compare ICAR-aligned agriculture degrees, State Agricultural Universities, private farm campuses, entrance exams and fees in India.',
  formatDetection: { telephone: false },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="en" className={`${dmSans.variable} overflow-x-clip`}>
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-[#FCFAF5] text-ink-900 antialiased selection:bg-brand-100 selection:text-brand-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteSettingsProvider settings={siteSettings}>
          <EnquiryModalProvider autoOpenFirstVisit>
            <AgricoSiteChrome legacyHeader={<SiteHeader />} legacyFooter={<SiteFooter />}>
              {children}
            </AgricoSiteChrome>
          </EnquiryModalProvider>
        </SiteSettingsProvider>
        {/* Site-wide identity and the sitelinks search box, emitted once. */}
        <JsonLdGraph items={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}

