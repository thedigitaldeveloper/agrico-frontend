import type { NextConfig } from 'next';

const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:1340';
const cmsOrigin = new URL(cmsUrl);
const cmsHostOrigin = cmsOrigin.origin;
const isLoopbackCms = cmsOrigin.hostname === 'localhost' || cmsOrigin.hostname === '127.0.0.1';
const loopbackPort = cmsOrigin.port || '1340';
// Strapi media URLs may be stored with either localhost or 127.0.0.1; allow
// both in development so existing CMS uploads resolve regardless of which host
// was used when the file was uploaded.
const loopbackOrigins = isLoopbackCms
  ? `http://localhost:${loopbackPort} http://127.0.0.1:${loopbackPort}`
  : '';

/**
 * Content-Security-Policy.
 *
 * Next's App Router still emits small inline bootstrap scripts and style tags
 * unless a per-request nonce middleware is wired up (which defeats static
 * rendering), so `script-src` and `style-src` carry `'unsafe-inline'`. Every
 * other directive is locked to `self` plus the CMS origin that serves uploads.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  process.env.NODE_ENV === 'production'
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${cmsHostOrigin} ${loopbackOrigins} https:`,
  "font-src 'self' data:",
  `connect-src 'self' ${cmsHostOrigin} ${loopbackOrigins}`,
  `media-src 'self' ${cmsHostOrigin} ${loopbackOrigins}`,
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com',
  // Do not force HTTPS subresources when the configured CMS is local HTTP;
  // otherwise Chrome upgrades http://localhost:1340/uploads/... to https:// and
  // fails with ERR_SSL_PROTOCOL_ERROR.
  isLoopbackCms ? '' : 'upgrade-insecure-requests',
].filter(Boolean).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  ...(isLoopbackCms
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    dangerouslyAllowSVG: true,
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    // Local Strapi resolves to 127.0.0.1, which Next's image optimizer blocks
    // by default to prevent SSRF. Only relax this when the configured CMS is
    // actually on loopback — production builds against a public host keep the
    // protection on.
    dangerouslyAllowLocalIP: isLoopbackCms,
    remotePatterns: [
      {
        protocol: cmsOrigin.protocol.replace(':', '') as 'http' | 'https',
        hostname: cmsOrigin.hostname,
        port: cmsOrigin.port,
        pathname: '/uploads/**',
      },
      ...(isLoopbackCms
        ? [
            {
              protocol: 'http' as const,
              hostname: cmsOrigin.hostname === 'localhost' ? '127.0.0.1' : 'localhost',
              port: loopbackPort,
              pathname: '/uploads/**',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
