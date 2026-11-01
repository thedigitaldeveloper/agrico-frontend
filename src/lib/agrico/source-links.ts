import policy from '../../config/source-link-policy.json';

export function isPermittedSourceLink(href: string) {
  try {
    const url = new URL(href);
    if (!['https:', 'http:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return !policy.disabled_hosts.some(entry => host === entry.hostname || host.endsWith('.' + entry.hostname));
  } catch { return false; }
}
