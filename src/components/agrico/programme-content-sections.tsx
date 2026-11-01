import { BookOpen, Briefcase, Check, ChevronDown, ClipboardCheck, ExternalLink, FileText, FlaskConical, GraduationCap, IndianRupee, Landmark, Lightbulb, Route, Sparkles, UserCheck } from 'lucide-react';
import { AcademicArt } from './academic-art';
import { DetailAskButton, DetailExplorer } from './detail-client';
import type { ProgrammeModel } from './detail-models';

const heading = (eyebrow: string, title: string) => <div className="ag-detail-section-heading"><p className="ag-eyebrow">{eyebrow}</p><h2>{title}</h2></div>;

export const PROGRAMME_CONTENT_LINKS = [
  ['overview', 'Overview'], ['curriculum', 'Curriculum'], ['eligibility', 'Eligibility & admission'],
  ['fees', 'Fees'], ['universities', 'Universities'], ['careers', 'Careers'], ['faqs', 'FAQs'],
] as const;

/** Programme page sections rendered from researched content; layout is specific to programme pages. */
export function ProgrammeContentSections({ model }: { model: ProgrammeModel }) {
  const c = model.content!;
  const overview = c.overview;
  const curriculum = c.curriculum;
  const admission = c.admission;
  const careers = c.careers;
  return <>
    <section id="overview" className="ag-detail-section">
      {heading('Know your programme', overview?.heading || 'What this degree is about.')}
      {(overview?.paragraphs || [model.description]).map(text => <p className="ag-pc-paragraph" key={text.slice(0, 40)}>{text}</p>)}
      {!!model.highlights?.length && <dl className="ag-pc-highlights">{model.highlights.map(item => <div key={item.key}><dt>{item.key}</dt><dd>{item.value}</dd></div>)}</dl>}
      {!!c.who_should_apply?.length && <div className="ag-pc-fit">
        <div className="ag-pc-fit__head"><UserCheck size={22} /><h3>Is this programme a good fit for you?</h3></div>
        <ul className="ag-detail-checklist">{c.who_should_apply.map(text => <li key={text}><Check size={17} /><span>{text}</span></li>)}</ul>
      </div>}
    </section>

    <section id="curriculum" className="ag-detail-section">
      {heading('Subjects & practical learning', curriculum?.heading || 'How the curriculum is built.')}
      {curriculum?.intro && <p className="ag-pc-paragraph">{curriculum.intro}</p>}
      {!!curriculum?.structure?.length && <ol className="ag-pc-timeline">{curriculum.structure.map((stage, index) => <li key={stage.stage}>
        <span className="ag-pc-timeline__dot">{index + 1}</span>
        <div>
          <h3>{stage.stage}</h3>
          {stage.focus && <p>{stage.focus}</p>}
          {!!stage.courses?.length && <div className="ag-pc-chips">{stage.courses.map(course => <span key={course}>{course}</span>)}</div>}
        </div>
      </li>)}</ol>}
      {!!curriculum?.specialisations?.length && <div className="ag-pc-block">
        <h3><Sparkles size={18} />Electives & specialisations</h3>
        <div className="ag-pc-chips ag-pc-chips--soft">{curriculum.specialisations.map(item => <span key={item}>{item}</span>)}</div>
      </div>}
      {!!curriculum?.practical_learning?.length && <div className="ag-pc-practical">{curriculum.practical_learning.map((item, index) => <article key={item.name}>
        <AcademicArt cell={[3, 4, 6, 7][index % 4]} />
        <div><h3><FlaskConical size={16} />{item.name}</h3><p>{item.description}</p></div>
      </article>)}</div>}
      <p className="ag-pc-note"><BookOpen size={15} />Course names, credits and electives differ between universities — read the syllabus of the university you choose.</p>
    </section>

    <section id="eligibility" className="ag-detail-section ag-detail-admission-section">
      {heading('Before you apply', 'Eligibility and admission routes.')}
      <div className="ag-pc-admission">
        <div>
          <h3><ClipboardCheck size={18} />Who can apply</h3>
          <ul className="ag-detail-checklist">{(model.eligibility.length ? model.eligibility : ['Check the current qualifying examination and academic criteria with your chosen university.']).map(text => <li key={text}><Check size={17} /><span>{text}</span></li>)}</ul>
          {!!admission?.documents?.length && <>
            <h3 className="ag-pc-subhead"><FileText size={18} />Documents usually requested</h3>
            <ul className="ag-pc-docs">{admission.documents.map(doc => <li key={doc}>{doc}</li>)}</ul>
          </>}
        </div>
        <div>
          <h3><Route size={18} />Admission routes</h3>
          <div className="ag-pc-routes">{(admission?.routes || []).map(route => <article key={route.name}><h4>{route.name}</h4><p>{route.description}</p></article>)}</div>
          {!!admission?.exams?.length && <div className="ag-pc-exams">{admission.exams.map(exam => exam.url
            ? <a key={exam.name} href={exam.url} target="_blank" rel="noopener noreferrer" title={exam.note || undefined}>{exam.name}{exam.conducting_body && <small>{exam.conducting_body}</small>}<ExternalLink size={13} /></a>
            : <span key={exam.name} title={exam.note || undefined}>{exam.name}{exam.conducting_body && <small>{exam.conducting_body}</small>}</span>)}</div>}
        </div>
      </div>
      {!!admission?.steps?.length && <ol className="ag-detail-journey ag-pc-steps">{admission.steps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>}
    </section>

    <section id="fees" className="ag-detail-section">
      {heading('Fees & costs', 'What you can expect to pay.')}
      <div className="ag-pc-fees">
        <IndianRupee size={28} />
        <div>
          <p>{c.fees?.summary || 'Programme fees depend on the university, the type of institution and the admission quota. Use the latest official fee schedule of the university you choose.'}</p>
          <p className="ag-pc-fees__hint">Ask for the fee per semester or year, what it includes (tuition, hostel, examination, practical charges) and the academic year it applies to.</p>
        </div>
        <DetailAskButton variant="ag-button--outline">Get current fee guidance</DetailAskButton>
      </div>
    </section>

    <section id="universities" className="ag-detail-section">
      {heading('Where you can study', 'Universities and colleges offering this programme.')}
      <p>{model.universities.length ? `Agrico has researched ${model.universities.length} institution${model.universities.length === 1 ? '' : 's'} that list this programme. Confirm the current intake, eligibility and fees with each institution.` : 'Talk to a counsellor to find institutions that offer this programme in your preferred states.'}</p>
      {model.universities.length ? <DetailExplorer items={model.universities} kind="universities" /> : <div className="ag-detail-question-box"><GraduationCap size={27} /><div><h3>Build your shortlist.</h3><p>Share your preferred locations and academic background to discuss suitable options.</p></div><DetailAskButton>Explore your options</DetailAskButton></div>}
    </section>

    <section id="careers" className="ag-detail-section ag-pc-careers">
      {heading('From degree to career', careers?.heading || 'Where this programme can lead.')}
      {careers?.intro && <p className="ag-pc-paragraph">{careers.intro}</p>}
      {!!careers?.roles?.length && <div className="ag-pc-roles">{careers.roles.map(role => <article key={role.title}><Briefcase size={18} /><h3>{role.title}</h3><p>{role.description}</p></article>)}</div>}
      <div className="ag-pc-career-grid">
        {!!careers?.sectors?.length && <div><h3><Landmark size={17} />Sectors</h3><div className="ag-pc-chips ag-pc-chips--soft">{careers.sectors.map(s => <span key={s}>{s}</span>)}</div></div>}
        {!!careers?.public_sector_routes?.length && <div><h3><ClipboardCheck size={17} />Public-sector routes</h3><ul className="ag-pc-docs">{careers.public_sector_routes.map(r => <li key={r}>{r}</li>)}</ul></div>}
        {!!careers?.higher_study?.length && <div><h3><GraduationCap size={17} />Higher study</h3><ul className="ag-pc-docs">{careers.higher_study.map(h => <li key={h}>{h}</li>)}</ul></div>}
        {!!c.skills?.length && <div><h3><Lightbulb size={17} />Skills you build</h3><ul className="ag-pc-docs">{c.skills.map(s => <li key={s}>{s}</li>)}</ul></div>}
      </div>
      <div className="ag-pc-career-cta"><p>Career outcomes depend on the institution, your specialisation and further study. Discuss a realistic pathway with a counsellor.</p><DetailAskButton>Discuss your study pathway</DetailAskButton></div>
    </section>

    <section id="faqs" className="ag-detail-section">
      {heading('Common questions', 'What students usually ask.')}
      <div className="ag-detail-faqs">{(c.faqs || []).map((faq, index) => <details key={faq.question} open={index === 0}><summary><span>{faq.question}</span><ChevronDown size={17} /></summary><p>{faq.answer}</p></details>)}</div>
    </section>
  </>;
}
