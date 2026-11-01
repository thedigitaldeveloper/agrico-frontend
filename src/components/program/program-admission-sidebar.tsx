'use client';

import { useState } from 'react';
import { ArrowRight, FileText, MessageCircle } from 'lucide-react';
import { useEnquiryModal } from '@/components/university/university-enquiry-modal';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import type { ProgramDetail } from '@/lib/cms/repositories/program';
import { mediaUrl } from '@/lib/cms/media';
import { formatFee } from '@/lib/format';
import { offeringFeeSpread } from './program-facts';

export function ProgramAdmissionSidebar({ program }: { program: ProgramDetail }) {
  const { whatsappNumber } = useSiteSettings();
  const { openModal } = useEnquiryModal();
  const [selectedSlug, setSelectedSlug] = useState('');
  const universities = program.universities ?? [];
  const university = universities.find(item => item.slug === selectedSlug) ?? (universities.length === 1 ? universities[0] : null);
  const name = program.full_name || program.name;
  const feeRows = (program.program_offerings ?? []).filter(row => !university || row.university?.slug === university.slug);
  const spread = offeringFeeSpread(feeRows);
  const genericFee = !university && !spread && program.fee !== null && program.fee !== undefined && Number.isFinite(Number(program.fee)) && Number(program.fee) >= 0 ? formatFee(program.fee) : null;
  const feeLabel = spread?.label || genericFee;
  const resources = [{ label: 'Programme brochure', href: mediaUrl(program.brochure?.url) }, { label: 'Syllabus', href: mediaUrl(program.syllabus?.url) }].filter(item => item.href);
  const open = (source: 'application-form' | 'counselling') => openModal({
    universitySlug: university?.slug ?? '', universityName: university?.name ?? '',
    programSlug: program.slug, programName: name, source,
    title: source === 'application-form' ? `Apply for ${program.name}` : `Ask about ${program.name}`,
    subtitle: university ? `${name} at ${university.name}` : `Discuss fees, eligibility and university options for ${name}.`,
  });
  return <aside className="rs-pd-admission" aria-label="Programme admission guidance">
    <p className="rs-pd-eyebrow">Your next step</p>
    <h2>Fees &amp; admission</h2>
    {universities.length > 1 ? <label className="rs-pd-university-select">University
      <select value={university?.slug ?? ''} onChange={event => setSelectedSlug(event.target.value)}>
        <option value="">Explore all university options</option>
        {universities.map(item => <option key={item.documentId} value={item.slug}>{item.name}</option>)}
      </select>
    </label> : university ? <p className="rs-pd-admission-university">{university.name}</p> : null}
    <div className="rs-pd-admission-fee"><span>{genericFee ? 'Programme base fee — university-specific fees may differ' : spread && spread.low !== spread.high ? 'Published university fee range' : 'Published programme fee'}</span><strong>{feeLabel || 'Request current fees'}</strong></div>
    <div className="rs-pd-admission-actions">
      {program.show_apply_button && (!university || university.show_apply_button) ? <button type="button" className="rs-pd-button rs-pd-button-ivory" onClick={() => open('application-form')}>{program.apply_button_text || 'Enquire about admission'}<ArrowRight size={17} aria-hidden="true" /></button> : null}
      <button type="button" className="rs-pd-button rs-pd-button-light-outline" onClick={() => open('counselling')}>Talk to a counsellor<MessageCircle size={17} aria-hidden="true" /></button>
    </div>
    {program.eligibilities?.length ? <details className="rs-pd-admission-eligibility"><summary>Check eligibility</summary><ul>{program.eligibilities.map(item => <li key={item.documentId}>{item.name}</li>)}</ul></details> : null}
    {resources.length ? <details className="rs-pd-admission-resource-details"><summary>Programme resources</summary><div className="rs-pd-admission-resources">{resources.map(resource => <a key={resource.label} href={resource.href!} target="_blank" rel="noopener noreferrer"><FileText size={16} aria-hidden="true" />{resource.label}<ArrowRight size={15} aria-hidden="true" /></a>)}</div></details> : null}
    {whatsappNumber ? <a className="rs-pd-admission-whatsapp" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I would like details about ${name}${university ? ' at ' + university.name : ''}.`)}`} target="_blank" rel="noopener noreferrer">Continue on WhatsApp<ArrowRight size={15} aria-hidden="true" /></a> : null}
  </aside>;
}
