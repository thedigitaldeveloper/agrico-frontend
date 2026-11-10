import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, BookOpen, Building2, Calendar, Check, ChevronDown, ChevronRight, Clock3, ExternalLink, FileText, FlaskConical, GraduationCap, Layers3, Leaf, MapPin, ShieldCheck, Sprout, UsersRound } from 'lucide-react';
import { SectionBody } from '@/components/cms/section-body';
import { RichText } from '@/components/cms/rich-text';
import { mediaUrl } from '@/lib/cms/media';
import { toCleanSectionSuffix } from '@/lib/cms/paths';
import { AcademicArt } from './academic-art';
import { GuideArt } from './guide-art';
import { DetailAskButton, DetailExplorer, DetailLeadForm, DetailNavigation, DetailProvider } from './detail-client';
import { feeText, type ProgrammeModel, type UniversityModel } from './detail-models';
import { PROGRAMME_CONTENT_LINKS, ProgrammeContentSections } from './programme-content-sections';
import './detail.css';
import './publication.css';
import './agrico-programme-content.css';

const heading = (eyebrow: string, title: string) => <div className="ag-detail-section-heading"><p className="ag-eyebrow">{eyebrow}</p><h2>{title}</h2></div>;
const admissionSteps = [
  { title: 'Explore your programme', description: 'Read the curriculum, study format and practical learning opportunities.' },
  { title: 'Check the requirements', description: 'Confirm eligibility, the admission route, documents and current fees.' },
  { title: 'Plan your application', description: 'Follow the university’s application process and published dates.' },
];

function Crumbs({ name, university = false, tabLabel, parentPath }: { name: string; university?: boolean; tabLabel?: string; parentPath?: string }) {
  return (
    <nav className="ag-detail-crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <ChevronRight size={12} />
      <Link href={university ? '/#universities' : '/#programmes'}>{university ? 'Universities' : 'Programmes'}</Link>
      <ChevronRight size={12} />
      {tabLabel && parentPath ? (
        <>
          <Link href={parentPath}>{name}</Link>
          <ChevronRight size={12} />
          <span aria-current="page">{tabLabel}</span>
        </>
      ) : (
        <span aria-current="page">{name}</span>
      )}
    </nav>
  );
}
function Journey() {
  return <ol className="ag-detail-journey">{admissionSteps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>)}</ol>;
}
function Faqs({ university = false }: { university?: boolean }) {
  const items = university ? [
    ['How do I choose a programme at this university?', 'Start with the subject areas you enjoy, then compare the curriculum, practical learning and entry requirements for the exact programme and campus.'],
    ['Where can I check the current fees and admission dates?', 'Use the university’s latest admission notice and fee schedule. Check what is included in tuition and whether accommodation, examinations or other charges are separate.'],
    ['Does an accreditation cover every course and campus?', 'Accreditation may apply to a particular college, school or programme for a defined period. Check the exact scope and validity for the course and campus you choose.'],
    ['Can Agrico help me prepare my shortlist?', 'Yes. Share your academic background and programme interests with a counsellor to discuss your options and prepare questions for the university.'],
  ] : [
    ['How do I know whether this programme fits me?', 'Compare the subjects, learning experience and practical work with your interests. Explore the actual university curriculum before choosing a degree.'],
    ['Are fees and eligibility the same at every university?', 'No. Fees, required subjects, academic criteria and admission routes can differ. Use the current information for the university and campus you are considering.'],
    ['Where can I find the exact syllabus?', 'Read the programme syllabus or curriculum published by your chosen university. Subject names and specialisations can vary between institutions.'],
    ['Can I discuss my options with a counsellor?', 'Yes. Request a callback to discuss programme choices, university options and the questions to check before applying.'],
  ];
  return <div className="ag-detail-faqs">{items.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div>;
}
function LeadSidebar({ name, fee, feeNote, feeLabel, resources }: { name: string; fee?: number | null; feeNote?: string | null; feeLabel?: string; resources: { name: string; href: string }[] }) {
  return <aside className="ag-detail-sidebar" aria-label="Admission guidance">
    {fee !== undefined && <div className="ag-detail-fee-card"><p className="ag-eyebrow ag-eyebrow--light">Fees &amp; admission</p><small>Programme fee</small><strong>{feeLabel || feeText(fee)}</strong><p>{feeNote || (fee == null ? 'Discuss university-specific fees, eligibility and application steps.' : 'Check the fee period and included charges with the university before applying.')}</p><DetailAskButton variant="ag-button--lime">Discuss your options</DetailAskButton></div>}
    <div id="detail-enquiry" className="ag-detail-enquiry-card"><p className="ag-eyebrow">Personal guidance</p><h2>Let’s find your next step.</h2><p className="ag-detail-enquiry-context">{name}</p><DetailLeadForm /></div>
    {resources.length > 0 && <div className="ag-detail-resource-card"><h3>Useful resources</h3>{resources.map(resource => <a key={resource.href + resource.name} href={resource.href} target="_blank" rel="noopener noreferrer"><FileText size={18} /><span>{resource.name}</span><ExternalLink size={15} /></a>)}</div>}
    <div className="ag-detail-shortlist-tip"><GuideArt variant="degree-choice" /><h3>Choose with a clearer picture.</h3><p>Look at what you’ll study, how you’ll learn and where you want to go.</p><Link href="/#compare">Compare study pathways<ArrowRight size={15} /></Link></div>
  </aside>;
}
function Closing() {
  return <section className="ag-detail-closing"><div className="ag-container"><div><p className="ag-eyebrow ag-eyebrow--light">Your next step</p><h2>A clearer choice starts<br />with a conversation.</h2><p>Talk through your interests, university options and admission questions.</p></div><DetailAskButton variant="ag-button--lime">Talk to a counsellor</DetailAskButton></div></section>;
}

export function AgricoProgrammeDetail({ model }: { model: ProgrammeModel }) {
  const hasAuthored = Boolean(model.section?.content?.length);
  const activeSection = model.sections.find(s => (s.secondary_slug || s.slug) === model.activeSlug);
  const isSubTab = Boolean(model.activeSlug && model.activeSlug !== 'overview');
  const activeTabLabel = isSubTab ? (activeSection?.display_name || activeSection?.name || model.section?.display_name) : undefined;
  const heroTitle = isSubTab && model.section?.heading ? model.section.heading : model.name;
  const heroDescription = isSubTab && model.section?.seo?.metaDescription ? model.section.seo.metaDescription : model.description;
  const heroEyebrow = isSubTab && activeTabLabel ? `Agriculture education · ${activeTabLabel}` : (model.content?.hero?.eyebrow || 'Agriculture education · Programme guide');

  const links = model.sections.length > 1 ? model.sections.map((s, index) => ({
    id: s.secondary_slug || s.slug,
    label: s.display_name || s.name || s.slug,
    href: index === 0 || toCleanSectionSuffix(s.secondary_slug || s.slug) === 'overview' ? model.path : `${model.path}-${toCleanSectionSuffix(s.secondary_slug || s.slug)}`
  })) : (model.content ? PROGRAMME_CONTENT_LINKS : hasAuthored ? [
    ['overview', 'Overview'],
    ['curriculum', 'Curriculum & Syllabus'],
    ['eligibility', 'Eligibility & Admission'],
    ['fees', 'Fees & Costs'],
    ['universities', 'Colleges & Universities'],
    ['careers', 'Careers & Placements'],
    ['faqs', 'FAQs'],
  ] as const : [
    ['overview', 'Overview'], ['curriculum', 'Curriculum'], ['eligibility', 'Eligibility'], ['universities', 'Universities'], ['careers', 'Career pathways'], ['faqs', 'FAQs'],
  ] as const).map(([id, label]) => ({ id, label, href: '#' + id }));
  const facts = [{ icon: GraduationCap, label: 'Study level', value: model.level }, { icon: Clock3, label: 'Duration', value: model.duration }, { icon: Building2, label: 'Learning format', value: model.mode }, { icon: Sprout, label: 'Study focus', value: model.focus }].filter(item => item.value);
  return <DetailProvider context={model.context} kind="programme">
    <section className="ag-detail-hero"><div className="ag-container"><Crumbs name={model.name} tabLabel={activeTabLabel ?? undefined} parentPath={model.path} /><div className="ag-detail-hero__grid"><div>
      <p className="ag-eyebrow">{heroEyebrow}</p><h1>{heroTitle}</h1>
      {model.offeredAt && <Link className="ag-detail-offered-at" href={model.universityPath!}><Building2 size={17} />At {model.offeredAt}<ArrowRight size={15} /></Link>}
      <p className="ag-detail-hero__description">{heroDescription}</p><div className="ag-detail-hero__actions"><DetailAskButton>Get programme guidance</DetailAskButton>{model.sections.length > 1 ? <Link href={isSubTab ? model.path : `${model.path}-curriculum`} className="ag-text-link">{isSubTab ? 'Back to full overview' : 'Explore the curriculum'}<ArrowRight size={16} /></Link> : <a href="#curriculum-syllabus" className="ag-text-link">Explore the curriculum<ArrowRight size={16} /></a>}</div>
      <p className="ag-detail-hero__note"><BookOpen size={15} />Understand your degree. Plan your next step.</p>
    </div><div className="ag-detail-hero__visual"><Image src="/images/agrico/agritech-workshop.png" alt="Illustrative agriculture technology learning scene with students examining a teaching drone" fill preload sizes="(max-width: 760px) 100vw, 43vw" /><span><FlaskConical size={18} />Learning through science &amp; technology</span></div></div></div></section>
    <div className="ag-detail-fact-strip"><div className="ag-container">{facts.map(fact => <div key={fact.label}><fact.icon size={25} strokeWidth={1.5} /><span><small>{fact.label}</small><strong>{fact.value}</strong></span></div>)}</div></div>
    <DetailNavigation links={links} current={model.activeSlug} label="Programme sections" />
    <div className="ag-container ag-detail-layout"><article className="ag-detail-main">
      {hasAuthored ? (
        <div className="ag-detail-authored ag-publication-body">
          <SectionBody section={model.section} />
        </div>
      ) : model.content ? <ProgrammeContentSections model={model} /> : <>
      <section id="overview" className="ag-detail-section">{heading('Know your programme', 'A degree built around your interests.')}
        <>{model.richDescription?.length ? <div className="ag-detail-lead"><RichText content={model.richDescription} /></div> : <p className="ag-detail-lead">{model.description}</p>}<div className="ag-detail-overview-grid"><div><BookOpen size={24} /><h3>What you’ll study</h3><p>{model.subjects}</p></div><div><FlaskConical size={24} /><h3>How you’ll learn</h3><p>Explore the balance of classroom study, practical work and projects in your university’s curriculum.</p></div><div><Leaf size={24} /><h3>Where it could lead</h3><p>{model.careers}</p></div></div></>{!!model.highlights?.length && <dl className="ag-detail-university-facts">{model.highlights.map(item => <div key={item.key}><dt>{item.key}</dt><dd>{item.value}</dd></div>)}</dl>}
      </section>
      <section id="curriculum" className="ag-detail-section">{heading('Subjects & practical learning', 'Explore what’s behind the degree.')}<p>Use these study areas as a starting point, then read the curriculum from your chosen university.</p><div className="ag-detail-topic-grid">{model.topics.map(topic => <article key={topic.title}><AcademicArt cell={topic.art} /><h3>{topic.title}</h3><p>{topic.description}</p></article>)}</div>{model.resources.some(r => /syllabus/i.test(r.name)) && <a className="ag-text-link" href={model.resources.find(r => /syllabus/i.test(r.name))!.href} target="_blank" rel="noopener noreferrer">View programme syllabus<ArrowRight size={15} /></a>}</section>
      <section id="eligibility" className="ag-detail-section ag-detail-admission-section">{heading('Before you apply', 'Find your route into the programme.')}<div className="ag-detail-admission-grid"><div><h3>Eligibility &amp; entry requirements</h3><ul className="ag-detail-checklist">{(model.eligibility.length ? model.eligibility : ['Check the university’s current qualifying examination and academic criteria.', 'Confirm the accepted admission route and documents for your programme.']).map(text => <li key={text}><Check size={17} /><span>{text}</span></li>)}</ul>{model.exams.length > 0 && <div className="ag-detail-exam-tags">{model.exams.map(exam => <Link key={exam.href} href={exam.href}>{exam.name}<ArrowRight size={14} /></Link>)}</div>}</div><div><h3>Your application, step by step</h3><Journey /></div></div></section>
      <section id="universities" className="ag-detail-section">{heading('Explore university options', model.offeredAt ? 'Explore the university behind your programme.' : 'Find a campus that fits your course.')}<p>Compare the exact programme, curriculum, campus and current admission requirements.</p>{model.universities.length ? <DetailExplorer items={model.universities} kind="universities" /> : <div className="ag-detail-question-box"><Building2 size={27} /><div><h3>Build your university shortlist.</h3><p>Talk through your preferred locations, study interests and programme requirements.</p></div><DetailAskButton>Explore your options</DetailAskButton></div>}</section>
      <section id="careers" className="ag-detail-section ag-detail-careers">{heading('From degree to next step', 'Connect your studies with your ambitions.')}<div><AcademicArt cell={8} /><div><h3>{model.careers}</h3>{model.averagePackage && <p className="ag-detail-published-package"><strong>Published average package: {model.averagePackage}</strong></p>}<p>Explore roles that match your subjects and practical skills. Career requirements and further study options depend on the role, qualification and institution.</p><DetailAskButton variant="ag-button--outline">Discuss your study pathway</DetailAskButton></div></div></section>
      <section id="faqs" className="ag-detail-section">{heading('Common questions', 'A few things you might be wondering.')}<Faqs /></section>
      </>}
    </article><LeadSidebar name={model.name} fee={model.fee} feeNote={model.feeNote} feeLabel={model.feeLabel} resources={model.resources} /></div>
    {model.related.length > 0 && <section className="ag-detail-related"><div className="ag-container">{heading('Keep exploring', 'More ways to study agriculture.')}<div>{model.related.map(item => <Link key={item.href} href={item.href}><span><GraduationCap size={25} /></span><h3>{item.name}</h3><p>{[item.level, item.duration].filter(Boolean).join(' · ')}</p><strong>Explore programme<ArrowRight size={16} /></strong></Link>)}</div></div></section>}
    <Closing /><div className="ag-detail-mobile-bar"><span>{model.name}</span><DetailAskButton>Get guidance</DetailAskButton></div>
  </DetailProvider>;
}

export function AgricoUniversityDetail({ model }: { model: UniversityModel }) {
  const path = '/university/' + model.slug;
  const links = model.sections.length > 1 ? model.sections.map((s, i) => ({ id: s.secondary_slug || s.slug, label: s.display_name || s.name || s.slug, href: i === 0 ? path : path + '/' + (s.secondary_slug || s.slug) })) : [
    ['overview', 'Overview'], ['programmes', 'Programmes & fees'], ['admissions', 'Admissions'], ['campus', 'Campus learning'], ['recognition', 'Recognition'], ['faqs', 'FAQs'],
  ].map(([id, label]) => ({ id, label, href: '#' + id }));
  return <DetailProvider context={model.context} kind="university">
    <section className="ag-detail-hero ag-detail-hero--university"><div className="ag-container"><Crumbs name={model.name} university /><div className="ag-detail-university-hero-grid"><div><p className="ag-eyebrow">{model.ownership ? `${model.ownership} · ICAR Accredited` : 'Explore your university'}</p><div className="ag-detail-university-identity"><span>{model.logo ? <Image src={model.logo} width={84} height={84} alt={model.name + ' logo'} /> : model.mark}</span><h1>{model.name}</h1></div><div className="ag-uni-hero-meta"><div className="ag-uni-hero-facts"><span className="ag-uni-hero-fact"><MapPin size={14} /> {[model.city, model.state].filter(Boolean).join(', ') || 'India'}</span>{model.established && <span className="ag-uni-hero-fact"><Calendar size={14} /> Est. {model.established}</span>}{model.ownership && <span className="ag-uni-hero-fact"><Building2 size={14} /> {model.ownership}</span>}</div><div className="ag-uni-hero-badges" aria-label="Accreditations, affiliations and rankings">{(model.approvals?.length ? model.approvals : ['ICAR Accredited', 'UGC Recognised']).map(badge => <span key={badge} className="ag-uni-badge ag-uni-badge--accreditation"><ShieldCheck size={13} /> {badge}</span>)}{model.affiliations?.map(aff => <span key={aff} className="ag-uni-badge ag-uni-badge--affiliation"><Award size={13} /> {aff}</span>)}{model.rankings?.map(rank => <span key={rank} className="ag-uni-badge ag-uni-badge--ranking"><Award size={13} /> {rank}</span>)}</div></div><div className="ag-detail-hero__actions"><DetailAskButton>Get admission guidance</DetailAskButton><a className="ag-text-link" href="#programmes">Explore programmes<ArrowRight size={16} /></a></div></div><div className="ag-detail-university-visual">{model.image ? <Image src={model.image.src} alt={model.image.alt} fill preload sizes="(max-width: 760px) 100vw, 38vw" /> : <><AcademicArt cell={4} eager /><div><span>Curriculum</span><span>Campus learning</span><span>Your next step</span></div></>}</div></div></div></section>
    <DetailNavigation links={links} current={model.activeSlug} label="University sections" />
    <div className="ag-container ag-detail-university-main">
      <section id="overview" className="ag-detail-section ag-detail-university-intro"><div>{heading('Look beyond the name', 'Get to know your university.')}{model.section?.content?.length ? <div className="ag-detail-authored"><SectionBody section={model.section} heading={model.section.heading || model.section.display_name || model.section.name} /></div> : <><p className="ag-detail-lead">{model.description}</p><div className="ag-detail-overview-grid"><div><BookOpen size={24} /><h3>Academic pathways</h3><p>Explore subjects, degrees and specialisations that match your interests.</p></div><div><FlaskConical size={24} /><h3>Learning experience</h3><p>Look at practical study, projects and the facilities used in your programme.</p></div><div><UsersRound size={24} /><h3>Your university fit</h3><p>Consider location, campus life and the support you need while studying.</p></div></div></>}{model.highlights.length > 0 && <dl className="ag-detail-university-facts">{model.highlights.map(f => <div key={f.key}><dt>{f.key}</dt><dd>{f.value}</dd></div>)}</dl>}</div>
        <aside className="ag-detail-university-summary"><h3>University at a glance</h3><dl>{[{ key: 'Location', value: [model.city, model.state].filter(Boolean).join(', ') }, { key: 'Institution', value: model.ownership }, { key: 'Established', value: model.established }, { key: model.editorial ? 'Explore study areas' : 'Published programmes', value: String(model.programmes.length) }, { key: 'Address', value: model.address }].filter(item => item.value).map(item => <div key={item.key}><dt>{item.key}</dt><dd>{item.value}</dd></div>)}</dl>{model.resources.map(resource => <a href={resource.href} target="_blank" rel="noopener noreferrer" key={resource.name}><FileText size={17} />{resource.name}<ExternalLink size={14} /></a>)}</aside>
      </section>
      <section id="programmes" className="ag-detail-section">{heading('Find your academic pathway', model.editorial ? 'Explore the programme areas.' : 'Programmes & fees, in one place.')}<p>{model.editorial ? 'Explore these degree guides, then confirm the exact programme and current requirements on the university’s official website.' : 'Explore the university’s published programmes and programme-specific fees.'}</p>{model.programmes.length ? <DetailExplorer items={model.programmes} kind="programmes" /> : <div className="ag-detail-question-box"><BookOpen size={28} /><div><h3>Find your programme options.</h3><p>Ask about the current courses, curriculum and entry requirements.</p></div><DetailAskButton>Get programme guidance</DetailAskButton></div>}</section>
      <section id="admissions" className="ag-detail-section ag-detail-university-admissions"><div>{heading('Your admission journey', 'Plan your application, step by step.')}<Journey /><div className="ag-detail-admission-note"><ShieldCheck size={23} /><p>Confirm the current requirements and dates for your chosen programme and campus.</p></div></div><aside><h3>Prepare your questions.</h3><p>A few useful things to ask before making your choice.</p><ul>{[['Curriculum', 'What subjects are covered? How much practical learning is included?'], ['Eligibility & fees', 'What are the academic requirements, admission route and total charges?'], ['Campus experience', 'What learning facilities, accommodation and student support are available?']].map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ul>{model.admissions ? <a className="ag-button" href={model.admissions} target="_blank" rel="noopener noreferrer">Official admission information<ExternalLink size={15} /></a> : <DetailAskButton>Discuss your questions</DetailAskButton>}</aside></section>
      <section id="campus" className="ag-detail-section ag-detail-campus">{heading('Campus & practical learning', 'Look at how you’ll learn.')}<div><ul className="ag-detail-checklist">{['What laboratories and practical facilities are used by your programme?', 'Are field visits, design projects or research opportunities part of the curriculum?', 'What accommodation and student support options are available?'].map(text => <li key={text}><Check size={17} /><span>{text}</span></li>)}</ul><AcademicArt cell={7} /></div></section>
      {!!model.faculties?.length && <section className="ag-detail-section">{heading('People behind your learning', 'Meet the academic community.')}<div className="ag-detail-people">{model.faculties.map(person => <article key={person.documentId}>{person.photo && <Image src={mediaUrl(person.photo.url)!} alt={person.name} width={64} height={64} />}<h3>{person.name}</h3><p>{person.designation}</p>{person.qualification && <small>{person.qualification}</small>}</article>)}</div></section>}
      {!!model.recruiters?.length && <section className="ag-detail-section">{heading('University-published connections', 'Recruiter information.')}<div className="ag-detail-recruiters">{model.recruiters.map(recruiter => <div key={recruiter.documentId}>{recruiter.logo ? <Image src={mediaUrl(recruiter.logo.url)!} alt={recruiter.name} width={100} height={48} /> : recruiter.name}</div>)}</div></section>}
      <div className="ag-detail-university-bottom-grid"><section id="recognition" className="ag-detail-section">{heading('Recognition & accreditation', 'Check the details that matter.')}<div className="ag-detail-recognition"><ShieldCheck size={31} /><div>{[['Approvals', model.approvals], ['Affiliations', model.affiliations], ['Rankings', model.rankings]].map(([label, values]) => Array.isArray(values) && values.length > 0 ? <div className="ag-detail-recognition-group" key={String(label)}><h4>{String(label)}</h4><div className="ag-detail-approval-tags">{values.map(name => <span key={name}>{name}</span>)}</div></div> : null)}<h3>Check your exact course and campus.</h3><p>Read the scope and validity of the relevant recognition or accreditation. Check the programme you plan to join.</p>{model.source && <a className="ag-text-link" href={model.source} target="_blank" rel="noopener noreferrer">Official university information<ExternalLink size={15} /></a>}</div></div></section>
      <section id="faqs" className="ag-detail-section">{heading('Common questions', 'Before you choose.')}<Faqs university /></section></div>
    </div>
    <section className="ag-detail-university-guidance"><div className="ag-container"><div><p className="ag-eyebrow">Personal admission guidance</p><h2>Let’s talk through<br />your next step.</h2><p>Share your interests and get help preparing your university shortlist.</p></div><DetailLeadForm /><AcademicArt cell={5} /></div></section>
    {model.related.length > 0 && <section className="ag-detail-related"><div className="ag-container">{heading('Build a thoughtful shortlist', 'Explore other universities.')}<div>{model.related.map(item => <Link href={item.href} key={item.href}><span>{item.mark || <Building2 size={24} />}</span><h3>{item.name}</h3><p>{item.description}</p><strong>Explore university<ArrowRight size={16} /></strong></Link>)}</div></div></section>}
    <div className="ag-detail-mobile-bar"><span>{model.name}</span><DetailAskButton>Get guidance</DetailAskButton></div>
  </DetailProvider>;
}
