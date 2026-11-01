import 'server-only';

import { CMS_INTERNAL_URL } from '@/lib/env';

/**
 * Forwards a form submission to the CMS.
 *
 * The browser posts to a Next route handler rather than straight at Strapi, so
 * the CMS origin stays server-side and there is one place to add spam checks
 * later. The CMS still does its own validation and rate limiting — this is a
 * second layer, not the only one.
 *
 * Sent unauthenticated. These three creates are exactly what the CMS grants its
 * public role, and attaching CMS_API_TOKEN would have authorised the request
 * against the token instead — a read-only token has no create at all, so every
 * enquiry, question and answer would have come back 403. Silently, too: the
 * form shows a generic failure and the lead is simply gone.
 */

export interface SubmitResult {
  ok: boolean;
  status: number;
  message: string;
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

export async function submitToCms(
  path: '/enquiries' | '/questions' | '/answers',
  data: Record<string, unknown>,
  forwardedFor: string | null
): Promise<SubmitResult> {
  let response: Response;

  try {
    response = await fetch(`${CMS_INTERNAL_URL}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Without this the CMS would rate limit by the Next server's own
        // address and treat every visitor as the same client.
        ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
      },
      body: JSON.stringify({ data }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, status: 502, message: 'The service is unavailable right now.' };
  }

  if (response.ok) {
    return { ok: true, status: 201, message: 'Submitted' };
  }

  if (response.status === 429) {
    return {
      ok: false,
      status: 429,
      message: 'Too many submissions. Please wait a moment and try again.',
    };
  }

  // A 400 carries a message written for the user by the CMS controller; any
  // other status could leak internals, so it becomes a generic failure.
  if (response.status === 400) {
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      return { ok: false, status: 400, message: body.error?.message ?? GENERIC_ERROR };
    } catch {
      return { ok: false, status: 400, message: GENERIC_ERROR };
    }
  }

  return { ok: false, status: 502, message: GENERIC_ERROR };
}

/** Best-effort client address, for the CMS's per-IP rate limiting. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return headers.get('x-real-ip');
}
