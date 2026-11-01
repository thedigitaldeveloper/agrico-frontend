import { SITE_URL } from '@/lib/env';

/**
 * CMS link fields.
 *
 * Editors type whatever they have to hand: "/universities", "universities",
 * "https://geduconnect.in/exams", "https://partner.example.com/apply" or
 * "mailto:hello@…". The site has to decide between next/link — which prefetches
 * and navigates client-side — and a plain anchor, and only the latter is valid
 * for an origin we do not control.
 */

export interface ResolvedLink {
  href: string;
  /** True when the link leaves the site, so it needs `rel="noopener"`. */
  external: boolean;
}

const SITE_HOST = new URL(SITE_URL).host;

/** mailto:, tel:, sms: — never routed through the router. */
const NON_HTTP_SCHEME = /^(mailto:|tel:|sms:)/i;

/** "example.com", "www.example.com/apply" — a host typed without a scheme. */
const BARE_HOST = /^[\w-]+(\.[\w-]+)+([/?#].*)?$/;

export function resolveLink(raw: string | null | undefined): ResolvedLink | null {
  const value = raw?.trim();
  if (!value) return null;

  if (NON_HTTP_SCHEME.test(value)) return { href: value, external: true };
  if (value.startsWith('/') || value.startsWith('#')) return { href: value, external: false };

  if (/^https?:\/\//i.test(value)) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return null;
    }
    // An absolute URL pointing back at us is still an internal route. Keeping it
    // absolute would cost a full page load on every click.
    if (url.host === SITE_HOST) {
      return { href: `${url.pathname}${url.search}${url.hash}`, external: false };
    }
    return { href: url.href, external: true };
  }

  // A bare host is an external site the editor forgot to prefix; anything else
  // is a route slug missing its leading slash.
  if (BARE_HOST.test(value)) return { href: `https://${value}`, external: true };
  return { href: `/${value}`, external: false };
}
