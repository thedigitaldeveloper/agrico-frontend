import { BRAND } from './brand';

/**
 * Every external origin the app talks to is resolved here, once, from the
 * environment. The previous build hard-coded CMS and site domains in ~70 places
 * across pages, components and next.config, which made it impossible to point
 * the app at a different environment without a find-and-replace.
 */

/**
 * A declared-but-blank variable (`CMS_INTERNAL_URL=` in a .env file) arrives as
 * an empty string, not undefined, so `??` would happily accept it and skip the
 * fallback. Treat blank as absent.
 */
function read(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function origin(name: string, raw: string): string {
  try {
    // Normalise away any trailing slash and path, so callers can always
    // template `${origin}${path}` without producing a double slash.
    return new URL(raw).origin;
  } catch {
    throw new Error(`Environment variable ${name} is not a valid URL: "${raw}"`);
  }
}

/**
 * A variable whose fallback is safe in development and dangerous in production.
 *
 * These used to fall back silently, which is the worst behaviour possible for
 * values that end up in public output. A build with no NEXT_PUBLIC_SITE_URL
 * resolved to localhost, and src/app/robots.ts only allows indexing on the
 * canonical host — so the deploy emitted `Disallow: /` and the whole site
 * dropped out of Google. A build with no NEXT_PUBLIC_WHATSAPP_NUMBER shipped a
 * placeholder number on every call-to-action. Both look like a clean, green,
 * entirely successful deploy.
 *
 * So production fails the build instead. NEXT_PUBLIC_* values are inlined while
 * `next build` runs, which means this throws during prerendering and no broken
 * output is ever produced, let alone served. Development keeps the fallbacks so
 * a fresh clone still runs with no .env file at all.
 */
function required(name: string, value: string | undefined, devFallback: string): string {
  const provided = read(value);
  if (provided) return provided;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `${name} is not set. A production build without it would silently ship a ` +
        `placeholder to real users, so the build is failing instead. Set it in ` +
        `the environment that runs \`next build\` — see .env.example.`
    );
  }

  return devFallback;
}

/** Public site origin — canonical URLs, sitemap, JSON-LD, OG tags. */
export const SITE_URL = origin(
  'NEXT_PUBLIC_SITE_URL',
  required('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3003')
);

/** CMS origin the *browser* must reach, for media URLs. */
export const CMS_PUBLIC_URL = origin(
  'NEXT_PUBLIC_CMS_URL',
  required('NEXT_PUBLIC_CMS_URL', process.env.NEXT_PUBLIC_CMS_URL, 'http://localhost:1340')
);

/**
 * CMS origin the *server* fetches data from. Defaults to the public one, but can
 * point at a private address so server rendering skips the public proxy hop.
 */
export const CMS_INTERNAL_URL = origin(
  'CMS_INTERNAL_URL',
  // Genuinely optional: falling back to the public origin is the documented
  // behaviour, not an accident, so this one stays silent.
  read(process.env.CMS_INTERNAL_URL) ?? CMS_PUBLIC_URL
);

/**
 * Read-only Strapi API token. Server-only — never expose this to the client.
 *
 * Used for exactly one read: the lead list behind /dashboard/leads, which the
 * public role must never be able to fetch. Public content is read without it —
 * Strapi authorises against the token's permissions instead of the public
 * role's, and a read-only token does not cover the custom findBySlug routes or
 * any create, so attaching it to public traffic breaks detail pages and silently
 * drops every form submission. See lib/cms/client.ts.
 */
export const CMS_API_TOKEN = read(process.env.CMS_API_TOKEN) ?? '';

/** Shared secret the CMS presents when it calls our revalidation webhook. */
export const REVALIDATE_SECRET = read(process.env.REVALIDATE_SECRET) ?? '';

export const SITE_NAME = BRAND.name;

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Addresses allowed into the admissions desk at /dashboard/leads, comma
 * separated. Server-only and deliberately not NEXT_PUBLIC_: this decides who
 * reads every lead the business has, so it must not be inlined into a bundle
 * the public can read.
 *
 * Empty means nobody. See lib/auth/admin.ts for why that is the right default.
 */
export const ADMIN_EMAILS = new Set(
  (read(process.env.ADMIN_EMAILS) ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
);

/**
 * Contact details are edited in the CMS — Site Setting, read through
 * lib/cms/repositories/settings.ts — so that changing the number a campaign
 * points at does not need a rebuild.
 *
 * These two stay only as an optional backstop for the seconds when the CMS is
 * unreachable, and they default to empty rather than to a plausible-looking
 * number. A wrong number here is worse than no number: `wa.me/<digits>` resolves
 * to whoever actually owns those digits, so a placeholder would quietly hand
 * real enquiries to a stranger. Empty renders a dead link instead, which is
 * visible and harmless.
 */
export const WHATSAPP_NUMBER = read(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? '';

/** Official contact email. */
export const CONTACT_EMAIL = read(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ?? '';
