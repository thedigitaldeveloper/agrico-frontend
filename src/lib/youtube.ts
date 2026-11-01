/**
 * YouTube links from the CMS.
 *
 * Editors paste any of the forms YouTube's own share menu produces, so the id
 * is extracted rather than assumed. Playback uses the nocookie host, which is
 * the only YouTube origin allowed by the CSP frame-src in next.config.ts.
 */

const ID = /^[\w-]{11}$/;

export function youtubeId(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    return ID.test(id) ? id : null;
  }
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com' && host !== 'm.youtube.com') {
    return null;
  }

  const param = url.searchParams.get('v');
  if (param && ID.test(param)) return param;

  // /embed/ID, /shorts/ID, /live/ID
  const segment = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
  return ID.test(segment) ? segment : null;
}

/** Embed URL for a click-to-play player: the user has already asked for it. */
export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

/**
 * YouTube's own still, used when the editor supplies no poster image.
 *
 * `hqdefault` rather than `maxresdefault`: the high-resolution still only
 * exists for videos uploaded above 720p, and a missing one is a 404 that the
 * image optimiser surfaces as a broken slide.
 */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
