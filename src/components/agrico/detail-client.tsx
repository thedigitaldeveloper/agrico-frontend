'use client';

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight, LoaderCircle, Search, Sprout, X } from 'lucide-react';
import { submitEnquiry } from '@/lib/actions';
import { EnquiryForm } from '@/components/forms/enquiry-form';
import { useOptionalEnquiryModal } from '@/components/university/university-enquiry-modal';
import { IDLE, type FormState } from '@/lib/form-state';
import type { DetailContext, DetailListing } from './detail-models';

function feeText(value?: number | null) {
  return value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value))
    : 'Request current fees';
}

const EnquiryContext = createContext<{ open: () => void; context: DetailContext } | null>(null);

export function DetailProvider({ children, context, kind }: { children: ReactNode; context: DetailContext; kind: string }) {
  const globalModal = useOptionalEnquiryModal();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerOpen = () => {
    if (globalModal) {
      globalModal.openModal({
        universitySlug: context.universitySlug || '',
        universityName: context.universityName || 'Agrico Partner Universities',
        programSlug: context.programSlug,
        programName: context.programName,
        source: 'counselling',
        title: context.programName ? `Apply / Enquire for ${context.programName}` : `Admission Guidance — ${context.universityName || 'Agrico'}`,
        subtitle: [context.programName, context.universityName].filter(Boolean).join(' at ') || 'Discuss course options, fees, eligibility and admission steps.',
      });
      return;
    }
    setOpen(true);
  };
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <div className="ag-detail" data-detail-kind={kind}><EnquiryContext.Provider value={{ open: triggerOpen, context }}>
    {children}
    <dialog className="ag-detail-dialog" ref={dialogRef} aria-labelledby="ag-detail-dialog-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="ag-detail-dialog__intro"><span className="ag-eyebrow">Admission guidance</span><button className="ag-icon-button" type="button" aria-label="Close enquiry" onClick={() => setOpen(false)}><X size={22} /></button><h2 id="ag-detail-dialog-title">Let’s plan your next step.</h2><p>{[context.programName, context.universityName].filter(Boolean).join(' · ')}</p></div>
      <DetailLeadForm />
    </dialog>
  </EnquiryContext.Provider></div>;
}

export function DetailAskButton({ children = 'Talk to a counsellor', variant = '', className = '' }: { children?: ReactNode; variant?: string; className?: string }) {
  const enquiry = useContext(EnquiryContext);
  return <button type="button" className={'ag-button ' + variant + ' ' + className} onClick={() => enquiry?.open()}>{children}<ArrowRight size={16} /></button>;
}

export function DetailLeadForm({ compact = true }: { compact?: boolean }) {
  const enquiry = useContext(EnquiryContext);
  const context = enquiry?.context || {};
  return (
    <EnquiryForm
      source="counselling"
      universitySlug={context.universitySlug}
      programSlug={context.programSlug}
      courseName={context.programName}
      submitLabel="Request a callback"
      compact={compact}
    />
  );
}

export function DetailExplorer({ items, kind }: { items: DetailListing[]; kind: 'programmes' | 'universities' }) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const levels = [...new Set(items.map(item => item.level).filter(Boolean))] as string[];
  const visible = items.filter(item => (level === 'All' || item.level === level) && (item.name + ' ' + item.description).toLowerCase().includes(query.toLowerCase()));
  return <div className="ag-detail-explorer">
    <div className="ag-detail-explorer__tools"><div className="ag-detail-filter-tabs" aria-label="Filter by study level">{['All', ...levels].map(item => <button type="button" key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>{item === 'All' ? 'All ' + kind : item}</button>)}</div><label className="ag-detail-search"><Search size={17} /><input aria-label={'Search ' + kind} placeholder={'Search ' + kind + '…'} value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    <p className="ag-detail-result-count" role="status">{visible.length} {visible.length === 1 ? kind === 'programmes' ? 'programme' : 'university' : kind}</p>
    <div className="ag-detail-directory">{visible.map(item => <article className="ag-detail-directory__row" key={item.href}>
      <span className={'ag-detail-directory__mark' + (item.logo ? ' has-logo' : '')} aria-hidden="true">{item.logo ? <img src={item.logo} alt="" loading="lazy" /> : item.mark || <Sprout size={25} strokeWidth={1.5} />}</span>
      <div className="ag-detail-directory__identity"><h3><Link href={item.href}>{item.name}</Link></h3><p>{item.description}</p><div>{[item.level, item.duration].filter(Boolean).map(text => <span key={text}>{text}</span>)}</div></div>
      {item.fee !== undefined && <div className="ag-detail-directory__fee"><small>Programme fees</small><strong>{feeText(item.fee)}</strong>{item.feeNote && <span>{item.feeNote}</span>}</div>}
      <Link className="ag-detail-row-link" href={item.href}>View {kind === 'programmes' ? 'programme' : 'university'}<ChevronRight size={17} /></Link>
    </article>)}</div>
    {!visible.length && <div className="ag-detail-no-results"><Search size={24} /><h3>No matching {kind}.</h3><p>Try another name or clear your filters.</p><button type="button" className="ag-text-link" onClick={() => { setQuery(''); setLevel('All'); }}>Clear filters<X size={15} /></button></div>}
  </div>;
}

export function DetailNavigation({ links, current, label }: { links: { id: string; label: string; href: string }[]; current?: string | null; label: string }) {
  const [active, setActive] = useState(current || links[0]?.id);
  useEffect(() => { setActive(current || links[0]?.id); }, [current, links]);
  useEffect(() => {
    const anchors = links.filter(link => link.href.startsWith('#'));
    if (!anchors.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = document.querySelector('.ag-detail-nav');
      const threshold = (nav?.getBoundingClientRect().bottom || 115) + 35;
      const passed = anchors.filter(link => {
        const node = document.getElementById(link.id);
        return node && node.getBoundingClientRect().top <= threshold;
      });
      setActive(passed.at(-1)?.id || anchors[0].id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [links]);
  return <nav className="ag-detail-nav" aria-label={label}><div className="ag-container"><div>{links.map(link => <Link key={link.id} href={link.href} aria-current={active === link.id ? link.href.startsWith('#') ? 'location' : 'page' : undefined} onClick={() => setActive(link.id)}>{link.label}</Link>)}</div><DetailAskButton>Get guidance</DetailAskButton></div></nav>;
}
