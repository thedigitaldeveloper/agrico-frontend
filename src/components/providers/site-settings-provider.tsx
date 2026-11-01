'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteSettings } from '@/lib/cms/repositories/settings';

/**
 * Only reached by a component rendered outside the provider, which the root
 * layout makes impossible — but it is empty rather than a placeholder number on
 * purpose. `wa.me/<digits>` resolves to whoever owns those digits, so a
 * stand-in here would route real enquiries to a stranger instead of failing
 * visibly. Real values come from the CMS; see lib/cms/repositories/settings.ts.
 */
const SiteSettingsContext = createContext<SiteSettings>({
  whatsappNumber: '',
  contactEmail: '',
  contactPhone: '',
  footerTagline: '',
});

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext value={settings}>
      {children}
    </SiteSettingsContext>
  );
}

/** Access CMS-managed site settings from any client component. */
export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
