/**
 * Site-wide contact details, read from the CMS `Site Setting` single type.
 *
 * Editors change the WhatsApp number and contact address here rather than in a
 * deployment's environment, so redirecting a campaign does not need a rebuild.
 * Cached for an hour and tagged `site-settings`, so a publish drops the tag and
 * the new number is live immediately while costing one request per hour
 * otherwise.
 *
 * The fallbacks below are deliberately empty rather than plausible-looking
 * values. `wa.me/<digits>` resolves to whoever actually owns those digits, so a
 * stand-in number would quietly route real enquiries to a stranger; an empty
 * one renders a dead link, which is visible and harmless. Both fields are
 * required in the CMS, so the only way to reach these is a CMS outage or an
 * entry nobody has filled in yet.
 */

import { cmsFetch } from '../client';
import { GLOBAL_TAG, collectionTag } from '../tags';

export interface SiteSettings {
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  footerTagline: string;
}

const DEFAULTS: SiteSettings = {
  whatsappNumber: '',
  contactEmail: '',
  contactPhone: '',
  footerTagline: '',
};

/**
 * Fetch site settings from Strapi.
 * Missing settings remain empty, including during CMS outages.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const json = await cmsFetch<{ data: Record<string, string> | null }>('/site-setting', {
      fields: ['whatsapp_number', 'contact_email', 'contact_phone', 'footer_tagline'],
    }, { revalidate: 3600, tags: [collectionTag('site-setting'), GLOBAL_TAG] });
    const d = json?.data;

    if (!d) return DEFAULTS;

    return {
      whatsappNumber: d.whatsapp_number || DEFAULTS.whatsappNumber,
      contactEmail: d.contact_email || DEFAULTS.contactEmail,
      contactPhone: d.contact_phone || DEFAULTS.contactPhone,
      footerTagline: d.footer_tagline || DEFAULTS.footerTagline,
    };
  } catch {
    // CMS unreachable during build / dev – use defaults
    return DEFAULTS;
  }
}
