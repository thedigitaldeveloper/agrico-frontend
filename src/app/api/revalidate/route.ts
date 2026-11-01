import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { REVALIDATE_SECRET } from '@/lib/env';
import {
  MEDIA_TAG,
  isModel,
  isUncachedModel,
  revalidationTags,
} from '@/lib/cms/tags';

/**
 * Strapi webhook target.
 *
 * The old site relied on time-based ISR: an editor's change took up to five
 * minutes to appear, and each expiry re-ran the full query whether or not
 * anything had changed. Here the CMS says exactly what changed and only the
 * matching tags are dropped, so publishes are visible immediately and untouched
 * pages keep serving from cache.
 *
 * Configure in Strapi: Settings -> Webhooks -> new webhook pointing at
 * {SITE_URL}/api/revalidate with header `x-revalidate-secret`, subscribed to
 * all entry events and media create/update/delete events.
 */

interface StrapiWebhookPayload {
  event?: string;
  model?: string;
  entry?: { slug?: string; documentId?: string };
}

/** Compares two secrets without leaking length or position through timing. */
function secretsMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  if (!REVALIDATE_SECRET) {
    // Failing closed: without a configured secret this endpoint would let
    // anyone flush the cache at will.
    return NextResponse.json({ error: 'Revalidation is not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-revalidate-secret') ?? '';
  if (!secretsMatch(provided, REVALIDATE_SECRET)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  let payload: StrapiWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
  }

  // Strapi upload events have { event, media }, with no model or entry.
  if (['media.create', 'media.update', 'media.delete'].includes(payload.event ?? '')) {
    revalidateTag(MEDIA_TAG, { expire: 0 });
    return NextResponse.json({ revalidated: [MEDIA_TAG], at: Date.now() });
  }

  const { model, entry } = payload;
  if (!model) {
    return NextResponse.json({ error: 'Payload has no model' }, { status: 400 });
  }

  // Acknowledged, not rejected: these fire webhooks but have nothing cached.
  // A 400 here would mark every incoming lead as a failed delivery in Strapi's
  // webhook log, burying any genuine failure in the noise.
  if (isUncachedModel(model)) {
    return NextResponse.json({ ignored: model, reason: 'not cached' });
  }

  if (!isModel(model)) {
    return NextResponse.json({ error: `Unknown model "${model}"` }, { status: 400 });
  }

  const tags = revalidationTags(model, entry?.slug);

  // "max" serves stale data on the next visit. CMS publishes must instead
  // expire immediately, including the parent response containing the tab list.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  // Logged because a webhook that silently drops the wrong tags looks exactly
  // like one that works — the page just stays stale.
  console.info(`[revalidate] ${payload.event ?? 'event'} ${model} -> ${tags.join(', ')}`);

  return NextResponse.json({ revalidated: tags, at: Date.now() });
}
