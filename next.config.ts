import type { NextConfig } from 'next';
import catalogueRedirects from './src/config/catalogue-programme-redirects.json';

/**
 * Origins are read from the environment and reused for both the image allow-list
 * and the CSP, so pointing the app at a different CMS or domain is a one-line
 * env change. The previous build hard-coded these in ~70 places.
 */
const CMS_URL = new URL(process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:1340');
const cms = CMS_URL.origin;
const isLoopbackCms = ['localhost', '127.0.0.1', '[::1]'].includes(CMS_URL.hostname);

const analytics = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
];

/**
 * YouTube's thumbnail host. A hero slide pointing at a YouTube video falls back
 * to the video's own still when the editor uploads no poster image, so the
 * carousel never shows a bare rectangle behind the play button.
 */
const youtubeThumbnails = 'https://i.ytimg.com';

const csp = [
  `default-src 'self'`,
  // 'unsafe-inline' stays only for scripts because Next's inline bootstrap needs
  // it; 'unsafe-eval' is dev-only, where React refresh requires it.
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'production' ? '' : "'unsafe-eval'"} ${analytics.join(' ')} https://maps.googleapis.com https://maps.gstatic.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: ${cms} ${youtubeThumbnails} ${analytics.join(' ')} https://maps.googleapis.com https://maps.gstatic.com`,
  `connect-src 'self' ${cms} ${analytics.join(' ')}`,
  `frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com`,
  `media-src 'self' ${cms}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Catalogue pages share a CMS. Bound build-time fan-out so static generation
  // does not overwhelm a small database with dozens of simultaneous renders.
  experimental: { cpus: 2, staticGenerationMaxConcurrency: 1 },
  devIndicators: false,
  poweredByHeader: false,
  compress: true,
  outputFileTracingIncludes: {
    '/*': ['./docs/content/universities-2026-10-30/publication-runtime.json', './docs/content/universities-2026-10-30/tab-pages/*.json'],
  },

  images: {
    // Media is served straight from the CMS. The old build rewrote /uploads/*
    // through the Next server, so every image cost an extra proxy hop.
    remotePatterns: [
      {
        protocol: CMS_URL.protocol.replace(':', '') as 'http' | 'https',
        hostname: CMS_URL.hostname,
        port: CMS_URL.port || undefined,
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: new URL(youtubeThumbnails).hostname,
        pathname: '/vi/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // A local production preview also serves CMS media from loopback. Allow
    // that explicitly configured CMS, not every development/private address.
    // The exact origin and /uploads path remain constrained above; redirects
    // cannot turn an allowed local image URL into another internal endpoint.
    dangerouslyAllowLocalIP: isLoopbackCms,
    ...(isLoopbackCms ? { maximumRedirects: 0 } : {}),
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      ...catalogueRedirects.flatMap(({ oldProgrammeSlug, newProgrammeSlug, universitySlug }) => [
        { source: '/' + oldProgrammeSlug, destination: '/' + newProgrammeSlug, permanent: true },
        { source: '/' + oldProgrammeSlug + '/:section', destination: '/' + newProgrammeSlug + '/:section', permanent: true },
        { source: '/program/' + oldProgrammeSlug, destination: '/' + newProgrammeSlug, permanent: true },
        { source: '/program/' + oldProgrammeSlug + '/:section', destination: '/' + newProgrammeSlug + '/:section', permanent: true },
        { source: '/offering/' + universitySlug + '/' + oldProgrammeSlug, destination: '/offering/' + universitySlug + '/' + newProgrammeSlug, permanent: true },
      ]),
      {
        source: '/course/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/program/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/program/:slug/:section',
        destination: '/:slug/:section',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
