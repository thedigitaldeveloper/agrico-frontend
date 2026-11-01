'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * The dashboard tab strip.
 *
 * Split out of the layout purely because a Server Component cannot read the
 * pathname, and without it the strip has no way to say which tab you are on.
 * The layout keeps the labelled <nav> around it, so this ships only the list.
 */
export function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <ul className="-mb-px flex gap-1 overflow-x-auto scrollbar-none">
      {links.map((link) => {
        // Exact, not prefix: /dashboard is a sibling of /dashboard/profile, not
        // its parent tab, and a prefix match would light both.
        const isActive = pathname === link.href;

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                'inline-flex whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ' +
                (isActive
                  ? 'border-brand-800 text-brand-800'
                  : 'border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900')
              }
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
