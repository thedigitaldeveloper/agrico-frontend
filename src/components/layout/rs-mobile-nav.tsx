'use client';
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export interface RsNavLink { label: string; href: string }
export interface RsNavigationData {
  counsellingHref: '/#guidance' | '/contact-us';
  programmes: RsNavLink[];
  universities: RsNavLink[];
  resources: RsNavLink[];
  student: RsNavLink[];
}
const directLinks = [
  { label: 'Compare', href: '/compare' },
  { label: 'News', href: '/news' },
  { label: 'Blogs', href: '/blogs' },
];
function closeDisclosures(container: HTMLElement) {
  container.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(detail => { detail.open = false; });
}
function onEscape(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Escape') return;
  const disclosure = (event.target as HTMLElement).closest<HTMLDetailsElement>('details[open]');
  if (!disclosure) return;
  event.preventDefault();
  event.stopPropagation();
  disclosure.open = false;
  disclosure.querySelector<HTMLElement>('summary')?.focus();
}
function NavLinks({ links }: { links: RsNavLink[] }) {
  const pathname = usePathname();
  return <ul className="rs-menu-links">{links.map(link => <li key={link.href}>
    <Link href={link.href} prefetch={false} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>
  </li>)}</ul>;
}
function Group({ title, links }: { title: string; links: RsNavLink[] }) {
  return <div className="rs-menu-group"><p>{title}</p><NavLinks links={links} /></div>;
}

export function RsDesktopNav({ navigation }: { navigation: RsNavigationData }) {
  const nav = useRef<HTMLElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (nav.current && !nav.current.contains(event.target as Node)) closeDisclosures(nav.current);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  function disclosure(title: string, children: ReactNode, wide = false) {
    return <details className="rs-nav-disclosure" onToggle={event => {
      const current = event.currentTarget;
      if (current.open) nav.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(other => { if (other !== current) other.open = false; });
    }}>
      <summary>{title}<ChevronDown size={13} aria-hidden="true" /></summary>
      <div className={'rs-nav-panel' + (wide ? ' rs-nav-panel-wide' : '')}>{children}</div>
    </details>;
  }
  return <nav ref={nav} key={pathname} className="rs-nav" aria-label="Main navigation" onKeyDown={onEscape}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeDisclosures(event.currentTarget); }}
    onClick={event => { if ((event.target as HTMLElement).closest('a')) closeDisclosures(event.currentTarget); }}>
    {disclosure('Programmes', <>
      <div className="rs-nav-panel-columns">
        <Group title="Find your programme" links={[{ label: 'Explore all programmes', href: '/programs' }, ...navigation.programmes]} />
        <Group title="Resources" links={navigation.resources} />
      </div>
      <div className="rs-nav-panel-bottom"><NavLinks links={[...navigation.student, { label: 'Search', href: '/search' }]} /></div>
    </>, true)}
    {disclosure('Universities', <Group title="Explore universities" links={[{ label: 'View all universities', href: '/universities' }, ...navigation.universities]} />)}
    {directLinks.map(link => <Link href={link.href} key={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
  </nav>;
}

export function RsMobileNav({ navigation }: { navigation: RsNavigationData }) {
  const pathname = usePathname();
  const outer = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (outer.current?.open && !outer.current.contains(event.target as Node)) {
        closeDisclosures(outer.current);
        outer.current.open = false;
      }
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  function mobileGroup(label: string, links: RsNavLink[]) {
    return <details className="rs-mobile-group"><summary>{label}<ChevronDown size={16} aria-hidden="true" /></summary><NavLinks links={links} /></details>;
  }
  return (
    <details
      ref={outer}
      className="rs-mobile-menu"
      key={pathname}
      onKeyDown={onEscape}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeDisclosures(event.currentTarget);
          event.currentTarget.open = false;
        }
      }}
    >
      <summary>Menu</summary>
      <nav
        aria-label="Mobile navigation"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a') && outer.current) {
            closeDisclosures(outer.current);
            outer.current.open = false;
          }
        }}
      >
        {mobileGroup('Programmes', [{ label: 'Explore all programmes', href: '/programs' }, ...navigation.programmes])}
        {mobileGroup('Universities', [{ label: 'View all universities', href: '/universities' }, ...navigation.universities])}
        <NavLinks links={directLinks} />
        {mobileGroup('Resources', navigation.resources)}
        {mobileGroup('Your admission', navigation.student)}
        <NavLinks links={[{ label: 'Search', href: '/search' }, { label: 'Student login', href: '/login' }, { label: 'Talk to a counsellor', href: navigation.counsellingHref }]} />
      </nav>
    </details>
  );
}
