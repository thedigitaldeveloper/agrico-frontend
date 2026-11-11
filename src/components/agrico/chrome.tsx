'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Globe, Menu, Search, X } from 'lucide-react';
import { useOptionalEnquiryModal } from '@/components/university/university-enquiry-modal';
import './agrico.css';

export function AgricoBrand({ inverse = false }: { inverse?: boolean }) {
  return <span className={'ag-brand' + (inverse ? ' ag-brand--inverse' : '')}>
    <svg viewBox="0 0 42 42" fill="none" aria-hidden="true"><path d="M21 36c-5-5-11-7-18-6V9c7-1 13 1 18 6m0 21c5-5 11-7 18-6V9c-7-1-13 1-18 6v21Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round"/><path d="M7 13v13c5 0 9 2 11 4M35 13v13c-5 0-9 2-11 4" stroke="currentColor" strokeWidth="1.5"/><path d="M21 14V6m0 3c-5 0-7-3-7-7 5 0 7 3 7 7Zm1-3c0-4 3-6 7-6 0 4-3 7-7 7" fill="currentColor"/></svg>
    <span><strong>agrico</strong><small>Agriculture Education &amp; Admissions</small></span>
  </span>;
}

const navigation = [
  { label: 'Programmes', href: '/#programmes', items: [['B.Sc. Agriculture', '/bsc-agriculture'], ['Agricultural Engineering', '/btech-agricultural-engineering'], ['Horticulture & Agribusiness', '/bsc-horticulture'], ['All programmes', '/programs']] },
  { label: 'Universities', href: '/#universities', items: [['Explore agriculture universities', '/#universities'], ['University directory', '/agriculture-colleges']] },
  { label: 'Compare', href: '/#compare' },
  { label: 'Admissions', href: '/#admissions', items: [['Your admission journey', '/#admissions'], ['Entrance exams', '/exams'], ['Scholarships', '/scholarships'], ['Talk to a counsellor', '/#guidance']] },
  { label: 'Guides', href: '/articles' },
];

function AgricoHeader() {
  const pathname = usePathname();
  const enquiryModal = useOptionalEnquiryModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = menuRef.current;
    if (menuOpen && dialog && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog?.open) dialog.close();
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);
  const closeMenu = () => { setMenuOpen(false); triggerRef.current?.focus(); };
  return <header className="ag-header" onKeyDown={event => { if (event.key === 'Escape') setOpenNav(null); }}>
    <div className="ag-container ag-header__inner">
      <Link href="/" aria-label="Agrico home" className="ag-brand-link"><AgricoBrand /></Link>
      <nav className="ag-desktop-nav" aria-label="Main navigation" onMouseLeave={() => setOpenNav(null)}>
        {navigation.map(item => <div className="ag-nav-item" key={item.label}>
          <Link href={item.href} onMouseEnter={() => setOpenNav(item.items ? item.label : null)} onFocus={() => setOpenNav(item.items ? item.label : null)} onClick={() => setOpenNav(null)}>{item.label}</Link>
          {item.items && <button className="ag-nav-toggle" aria-label={'Show ' + item.label + ' links'} aria-expanded={openNav === item.label} onClick={() => setOpenNav(openNav === item.label ? null : item.label)}><ChevronDown size={12} /></button>}
          {item.items && openNav === item.label && <div className="ag-nav-dropdown" onKeyDown={event => { if (event.key === 'Escape') setOpenNav(null); }}>{item.items.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpenNav(null)}>{label}<ArrowRight size={14} /></Link>)}</div>}
        </div>)}
      </nav>
      <form action="/search" className="ag-header-search" role="search"><Search size={15} /><input name="q" aria-label="Search programmes and universities" placeholder="Search programmes, universities…" /></form>
      <Link href="/login" className="ag-sign-in">Sign in</Link>
      <button
        type="button"
        className="ag-button ag-header-cta"
        onClick={() => {
          if (enquiryModal) {
            enquiryModal.openModal({
              universitySlug: '',
              universityName: 'Agrico Admission Desk',
              programName: 'Agriculture & AgriTech Degree Guidance',
              source: 'counselling',
              title: 'Talk to an Agriculture Counsellor',
              subtitle: 'Compare ICAR-aligned universities, fee structures, scholarships and eligibility with a personal counsellor.',
            });
          } else if (pathname === '/') {
            window.dispatchEvent(new CustomEvent('agrico:open-enquiry', { detail: { sourceTitle: 'Header Counselling' } }));
          } else {
            window.location.href = '/#guidance';
          }
        }}
      >
        Talk to a counsellor
      </button>
      <button ref={triggerRef} className="ag-mobile-trigger ag-icon-button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="ag-mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
    </div>
    <dialog ref={menuRef} id="ag-mobile-menu" className="ag-mobile-menu" aria-label="Navigation" onCancel={closeMenu} onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="ag-mobile-menu__top"><Link href="/" onClick={closeMenu}><AgricoBrand /></Link><button className="ag-icon-button" aria-label="Close navigation" onClick={closeMenu}><X size={22} /></button></div>
      <form action="/search" role="search" className="ag-mobile-search" onSubmit={closeMenu}><input name="q" placeholder="Search programmes or universities" aria-label="Mobile search" /><button className="ag-icon-button" aria-label="Search"><Search size={19} /></button></form>
      <nav aria-label="Mobile navigation">{navigation.map(item => <div key={item.label}><Link href={item.href} onClick={closeMenu}>{item.label}<ArrowRight size={17} /></Link>{item.items && <div className="ag-mobile-sublinks">{item.items.map(([label, href]) => <Link key={label} href={href} onClick={closeMenu}>{label}</Link>)}</div>}</div>)}</nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
        <button
          type="button"
          className="ag-button"
          onClick={() => {
            closeMenu();
            if (enquiryModal) {
              enquiryModal.openModal({
                universitySlug: '',
                universityName: 'Agrico Admission Desk',
                programName: 'Agriculture & AgriTech Degree Guidance',
                source: 'counselling',
                title: 'Talk to an Agriculture Counsellor',
                subtitle: 'Compare ICAR-aligned universities, fee structures, scholarships and eligibility with a personal counsellor.',
              });
            } else if (pathname === '/') {
              window.dispatchEvent(new CustomEvent('agrico:open-enquiry', { detail: { sourceTitle: 'Mobile Nav Counselling' } }));
            } else {
              window.location.href = '/#guidance';
            }
          }}
        >
          Talk to a counsellor <ArrowRight size={16} />
        </button>
        <Link className="ag-button ag-button--outline" href="/login" onClick={closeMenu}>Student sign in <ArrowRight size={16} /></Link>
      </div>
    </dialog>
  </header>;
}

function AgricoFooter() {
  return <footer className="ag-footer"><div className="ag-container ag-footer__grid">
    <Link href="/" aria-label="Agrico home"><AgricoBrand inverse /></Link>
    <div><h2>Programmes</h2><Link href="/bsc-agriculture">B.Sc. Agriculture</Link><Link href="/btech-agricultural-engineering">Agricultural Engineering</Link><Link href="/bsc-horticulture">Horticulture</Link><Link href="/mba-agribusiness">Agribusiness</Link></div>
    <div><h2>Universities</h2><Link href="/#universities">Explore universities</Link><Link href="/compare">Compare universities</Link><Link href="/#learning">Campus life &amp; learning</Link><Link href="/agriculture-colleges">Campus details</Link></div>
    <div><h2>Admission guides</h2><Link href="/articles/bsc-agriculture-vs-agricultural-engineering">Choosing a degree</Link><Link href="/blogs/compare-agriculture-campuses">Comparing universities</Link><Link href="/blogs/prepare-for-agriculture-counselling">Preparing for counselling</Link><Link href="/articles">All guides</Link></div>
    <div><h2>Contact</h2><Link href="/#guidance">Talk to a counsellor</Link><Link href="/contact-us">Get in touch</Link><Link href="/about-us">About Agrico</Link><Link href="/#faqs">FAQs</Link></div>
    <div className="ag-footer__end"><a href="https://icar.gov.in/en" target="_blank" rel="noopener noreferrer" className="ag-footer-resource" aria-label="Official ICAR education resources"><Globe size={20} /></a><p>© {new Date().getFullYear()} Agrico.<br />All rights reserved.</p><div className="ag-footer__legal"><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms-and-conditions">Terms of use</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/sitemap">Sitemap</Link></div></div>
  </div></footer>;
}

export function AgricoSiteChrome({ children, legacyHeader, legacyFooter }: { children: ReactNode; legacyHeader: ReactNode; legacyFooter: ReactNode }) {
  const pathname = usePathname();
  const accountPage = /^\/(?:dashboard|login|register|forgot-password|reset-password)(?:\/|$)/.test(pathname);
  return <>{accountPage ? legacyHeader : <AgricoHeader />}<main id="main" className="flex-1">{children}</main>{accountPage ? legacyFooter : <AgricoFooter />}</>;
}
