'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Eye, Phone, Search, X } from 'lucide-react';
import type { LeadEnquiry } from '@/lib/cms/repositories/enquiry';
import { LEAD_SOURCES, leadsHref, leadWhatsApp, type LeadsQuery } from '@/lib/leads-query';

interface LeadsDataTableProps {
  initialLeads: LeadEnquiry[];
  totalCount: number;
  query: LeadsQuery;
  pageCount: number;
}
const fieldClass = 'min-h-11 rounded-lg border border-ink-250 bg-white px-3 text-sm text-ink-800 focus-visible:outline-2 focus-visible:outline-brand-800';
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not recorded';
}
function sourceLabel(lead: LeadEnquiry) {
  if (lead.source === 'counselling' && lead.message?.includes('[STUDENT REGISTRATION]')) return 'Registration enquiry';
  return LEAD_SOURCES.find(([key]) => key === lead.source)?.[1] || lead.source || 'Other';
}
export function LeadsDataTable({ initialLeads, totalCount, query, pageCount }: LeadsDataTableProps) {
  const [selectedLead, setSelectedLead] = useState<LeadEnquiry | null>(null);
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selectedLead && !dialog.current?.open) dialog.current?.showModal();
    if (!selectedLead && dialog.current?.open) dialog.current.close();
  }, [selectedLead]);
  async function copyLead(lead: LeadEnquiry) {
    const text = `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nProgramme: ${lead.program || 'Not specified'}\nUniversity: ${lead.university || 'Not specified'}\nDetails: ${lead.message || ''}`;
    try { await navigator.clipboard.writeText(text); setNotice('Lead details copied.'); }
    catch { setNotice('Could not copy. You can select the details in the lead dialog.'); }
  }
  function pageLink(label: string, page: number, disabled: boolean) {
    return disabled
      ? <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-lg border border-ink-200 px-3 text-ink-400">{label}</span>
      : <Link href={leadsHref(query, { page })} prefetch={false} className="inline-flex min-h-11 items-center rounded-lg border border-ink-250 bg-white px-3 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-800">{label}</Link>;
  }
  return <div className="space-y-4">
    <form action="/dashboard/leads" method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-white p-4">
      <input type="hidden" name="page" value="1" />
      <label className="grid min-w-0 flex-1 gap-1 text-sm font-medium text-ink-700">Search leads
        <input type="search" name="q" defaultValue={query.q} maxLength={120} placeholder="Name, phone, programme or university" className={`${fieldClass} w-full min-w-52`} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink-700">Source
        <select name="source" defaultValue={query.source} className={fieldClass}>{LEAD_SOURCES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink-700">Submitted
        <select name="date" defaultValue={query.date} className={fieldClass}><option value="all">All time</option><option value="today">Past 24 hours</option><option value="week">Past 7 days</option><option value="month">Past 30 days</option></select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink-700">Sort
        <select name="sort" defaultValue={query.sort} className={fieldClass}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink-700">Rows
        <select name="pageSize" defaultValue={query.pageSize} className={fieldClass}>{[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}</select>
      </label>
      <button type="submit" className="rs-button min-h-11"><Search size={16} aria-hidden="true" /> Search</button>
      <Link href="/dashboard/leads" prefetch={false} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-800 underline">Clear filters</Link>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-700"><p role="status">{totalCount} matching {totalCount === 1 ? 'lead' : 'leads'}</p>
      {totalCount ? <a href={leadsHref(query, {}, '/dashboard/leads/export')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 font-semibold text-brand-800"><Download size={16} aria-hidden="true" /> Export all matches</a> : null}
    </div>
    <p role="status" className={notice ? 'text-sm text-ink-700' : 'sr-only'}>{notice}</p>
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Student leads table">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Lead enquiries, page {query.page} of {pageCount}. Search and export include every matching record.</caption>
          <thead className="border-b border-ink-200 bg-ink-50 text-ink-700"><tr>{['Student', 'Phone', 'Programme / university', 'Email', 'Source', 'Submitted', 'Actions'].map(label => <th scope="col" key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-150 text-ink-800">
            {initialLeads.map(lead => <tr key={lead.id} className="hover:bg-brand-50/30">
              <td className="px-4 py-2"><button type="button" className="min-h-11 text-left font-semibold text-brand-800 hover:underline" onClick={() => setSelectedLead(lead)} aria-label={`View enquiry from ${lead.name}`}>{lead.name}</button><small className="block text-ink-600">{[lead.city, lead.state].filter(Boolean).join(', ')}</small></td>
              <td className="px-4 py-2 whitespace-nowrap">{lead.phone ? <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center hover:underline">{lead.phone}</a> : '—'}</td>
              <td className="min-w-48 px-4 py-3">{lead.program || 'Not specified'}{lead.university ? <small className="mt-1 block text-ink-600">{lead.university}</small> : null}</td>
              <td className="px-4 py-2">{lead.email ? <a href={`mailto:${lead.email}`} className="inline-flex min-h-11 items-center break-all hover:underline">{lead.email}</a> : '—'}</td>
              <td className="px-4 py-3">{sourceLabel(lead)}</td><td className="px-4 py-3 whitespace-nowrap">{dateLabel(lead.created_at)}</td>
              <td className="px-4 py-2"><div className="flex items-center gap-1">
                {leadWhatsApp(lead.phone) ? <a href={leadWhatsApp(lead.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-brand-800 hover:bg-brand-50" aria-label={`WhatsApp ${lead.name}`}><Phone size={17} aria-hidden="true" /></a> : null}
                <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-brand-50" aria-label={`Copy enquiry from ${lead.name}`} onClick={() => copyLead(lead)}><Copy size={17} aria-hidden="true" /></button>
                <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-brand-50" aria-label={`View details for ${lead.name}`} onClick={() => setSelectedLead(lead)}><Eye size={17} aria-hidden="true" /></button>
              </div></td>
            </tr>)}
            {!initialLeads.length ? <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-600">No matching leads. Try changing your filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-700">
        <p>Showing {initialLeads.length ? (query.page - 1) * query.pageSize + 1 : 0}–{Math.min((query.page - 1) * query.pageSize + initialLeads.length, totalCount)} of {totalCount}</p>
        <nav aria-label="Lead pages" className="flex flex-wrap items-center gap-2">{pageLink('First', 1, query.page <= 1)}{pageLink('Previous', query.page - 1, query.page <= 1)}<span>Page {query.page} of {pageCount}</span>{pageLink('Next', query.page + 1, query.page >= pageCount)}{pageLink('Last', pageCount, query.page >= pageCount)}</nav>
      </div>
    </div>
    <dialog ref={dialog} onClose={() => setSelectedLead(null)} aria-labelledby="lead-dialog-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-ink-200 bg-white p-6 text-ink-800 shadow-xl backdrop:bg-ink-950/50">
      {selectedLead ? <>
        <div className="flex items-center justify-between gap-3"><h2 id="lead-dialog-title" className="text-xl font-semibold">{selectedLead.name}</h2><button type="button" aria-label="Close enquiry details" className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-ink-100" onClick={() => dialog.current?.close()}><X size={20} /></button></div>
        <p className="mt-1 text-sm text-ink-600">{sourceLabel(selectedLead)} · {dateLabel(selectedLead.created_at)}</p>
        <dl className="mt-5 grid gap-4 text-sm">{([['Phone', selectedLead.phone], ['Email', selectedLead.email], ['Programme', selectedLead.program], ['University', selectedLead.university], ['Location', [selectedLead.city, selectedLead.state].filter(Boolean).join(', ')], ['Status', selectedLead.status]] as const).map(([label, value]) => <div key={label}><dt className="font-semibold text-ink-600">{label}</dt><dd className="mt-1 break-words">{value || 'Not specified'}</dd></div>)}</dl>
        <h3 className="mt-5 font-semibold">Enquiry details</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{selectedLead.message || 'No additional details.'}</p>
        <button type="button" className="rs-button mt-5" onClick={() => copyLead(selectedLead)}><Copy size={16} aria-hidden="true" /> Copy details</button>
      </> : null}
    </dialog>
  </div>;
}
