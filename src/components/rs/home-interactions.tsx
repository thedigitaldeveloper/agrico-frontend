'use client';
import {
  createContext,
  useContext,
  useState,
  useActionState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  Monitor,
  Scale,
  Check,
} from 'lucide-react';
import { submitEnquiry } from '@/lib/actions';
import { IDLE } from '@/lib/form-state';
import type { CourseFinderConfig, SectionHeaderConfig } from '@/lib/cms/repositories/home';
import { displayFee, type Offering } from './home-types';
import { OfferingCard } from './offering-card';
import { ProgrammeCarousel } from './programme-carousel';
interface Selection {
  compared: string[];
  comparisonIds: string[];
  toggle: (id: string) => void;
  setComparison: (slot: number, id: string) => void;
  clearComparison: () => void;
  enquiry: string;
  setEnquiry: (id: string) => void;
  preview: boolean;
}
const Context = createContext<Selection | null>(null);
function useSelection() {
  const value = useContext(Context);
  if (!value) throw new Error('Missing homepage selection provider');
  return value;
}
export function HomeSelection({
  children,
  preview = false,
  initialCompared = [],
  availableIds,
}: {
  children: ReactNode;
  preview?: boolean;
  initialCompared?: string[];
  availableIds?: string[];
}) {
  const [storedCompared, setCompared] = useState<string[]>(() => {
    const distinct = [...new Set(initialCompared.filter(Boolean))].slice(0, 2);
    return [distinct[0] || '', distinct[1] || ''];
  }),
    [storedEnquiry, storeEnquiry] = useState('');
  const [hasChosenComparison, setHasChosenComparison] = useState(false);
  const allowed = availableIds ? new Set(availableIds) : null;
  const valid = (id: string) => !id || !allowed || allowed.has(id);
  const comparisonIds = storedCompared.map(id => valid(id) ? id : '');
  const compared = hasChosenComparison ? comparisonIds : ['', ''];
  const enquiry = valid(storedEnquiry) ? storedEnquiry : '';
  function setEnquiry(id: string) { storeEnquiry(valid(id) ? id : ''); }
  function toggle(id: string) {
    if (!id || !valid(id)) return;
    if (!hasChosenComparison) {
      setHasChosenComparison(true);
      setCompared([id, '']);
      return;
    }
    setCompared((current) => {
      const next = current.map(value => valid(value) ? value : '');
      const slot = next.includes(id) ? next.indexOf(id) : next.indexOf('');
      if (slot !== -1) next[slot] = next[slot] === id ? '' : id;
      return next;
    });
  }
  function setComparison(slot: number, id: string) {
    if ((slot !== 0 && slot !== 1) || !valid(id)) return;
    setHasChosenComparison(true);
    setCompared(current => {
      const next = current.map(value => valid(value) ? value : '');
      if (id && next.some((value, index) => index !== slot && value === id)) return next;
      next[slot] = id;
      return next;
    });
  }
  function clearComparison() {
    setHasChosenComparison(true);
    setCompared(['', '']);
  }
  return (
    <Context.Provider
      value={{ compared, comparisonIds, toggle, setComparison, clearComparison, enquiry, setEnquiry, preview }}
    >
      {children}
    </Context.Provider>
  );
}
export function EnquireLink({
  offering,
  children,
  className = 'rs-button',
}: {
  offering: Offering;
  children: ReactNode;
  className?: string;
}) {
  const { setEnquiry } = useSelection();
  return (
    <a
      href="#guidance"
      className={className}
      onClick={() => setEnquiry(offering.id)}
    >
      {children}
    </a>
  );
}
interface ProgrammeExplorerProps {
  offerings: Offering[];
  catalogue?: Offering[];
  config?: CourseFinderConfig | null;
  header?: SectionHeaderConfig | null;
  compareEnabled?: boolean;
}
export function ProgrammeExplorer({ offerings, config, header, compareEnabled = true }: ProgrammeExplorerProps) {
  const [degree, setDegree] = useState('All programmes');
  const [mode, setMode] = useState('');
  const { compared, toggle, clearComparison, preview } = useSelection();
  const programmeGridRef = useRef<HTMLDivElement>(null);
  const programmeSectionRef = useRef<HTMLElement>(null);
  const selectedCount = compareEnabled ? compared.filter(Boolean).length : 0;
  // Homepage filters only refine the editor-selected products, in CMS order.
  const modes = [...new Set(offerings.map(item => item.mode).filter(Boolean))];
  const selectedMode = modes.includes(mode) ? mode : modes[0];
  const degrees = [...new Set(offerings.filter(item => item.mode === selectedMode).map(item => item.degree))];
  const selectedDegree = degrees.includes(degree) ? degree : 'All programmes';
  const filtered = selectedDegree !== 'All programmes' || modes.length > 1;
  const matches = offerings.filter(item =>
    (selectedDegree === 'All programmes' || item.degree === selectedDegree) &&
    item.mode === selectedMode
  );
  const carouselResetKey = JSON.stringify([selectedDegree, selectedMode]);
  const section = header ?? config;
  const heading = section ? section.heading : 'Find the programme that fits you.';
  const eyebrow = section ? section.eyebrow : 'Your programme shortlist';
  const description = section ? section.description : 'Explore individual programmes from universities.';
  function reset() {
    setDegree('All programmes');
    window.requestAnimationFrame(() => {
      programmeSectionRef.current?.querySelector<HTMLElement>('[data-programme-results-heading]')?.focus({ preventScroll: true });
    });
  }
  function clearSelection() {
    clearComparison();
    // The Clear button disappears with the selection notice; return keyboard
    // users to a programme checkbox after React enables all choices again.
    window.requestAnimationFrame(() => {
      const grid = programmeGridRef.current;
      const target = grid?.querySelector<HTMLInputElement>('input[type="checkbox"]')
        ?? programmeSectionRef.current?.querySelector<HTMLButtonElement>('.rs-tabs button[aria-pressed="true"]');
      target?.focus();
    });
  }
  const catalogueAction = !header || (header.ctaLink && header.ctaLabel) ? (
    <div className="rs-programme-more">
      <Link className="rs-text-link" href="/programs">{header?.ctaLabel || 'View all programmes'} <ArrowRight size={16} /></Link>
    </div>
  ) : null;
  if (!offerings.length) return null;
  return (
    <section id="programmes" className="rs-section rs-container" ref={programmeSectionRef}>
      <div className="rs-section-heading">
        <div>
          {eyebrow ? <span className="rs-eyebrow">{eyebrow}</span> : null}
          {heading ? <h2 tabIndex={-1} data-programme-results-heading>{heading}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        <div className="rs-study-mode-switch" aria-label="Study mode">
          <span className="rs-study-mode-label">Study mode</span>
          <div className="rs-study-mode-options">
            {modes.map((item) => (
              <button key={item} type="button" aria-pressed={selectedMode === item}
                onClick={() => { setMode(item); setDegree('All programmes'); }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rs-programme-toolbar">
      <div className="rs-tabs" aria-label="Filter by programme">
        {['All programmes', ...degrees].map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={selectedDegree === d}
            onClick={() => { setDegree(d); }}
          >
            {d}
          </button>
        ))}
      </div>
      </div>
      {config?.featureBadges?.length ? <div className="rs-degree-tags">{config.featureBadges.map(badge => <span className="rs-chip" key={badge}>{badge}</span>)}</div> : null}
      <p className={filtered ? 'rs-result-count' : 'sr-only'} role="status">
        {matches.length} programme option{matches.length === 1 ? '' : 's'}
      </p>
      <ProgrammeCarousel items={matches} resetKey={carouselResetKey} containerRef={programmeGridRef} footer={catalogueAction} renderItem={offering => <OfferingCard
          key={offering.id}
          offering={offering}
          preview={preview}
          action={preview ? <EnquireLink offering={offering}>View fees &amp; eligibility <ArrowRight size={17} /></EnquireLink> : undefined}
          comparison={compareEnabled ? {
            selected: compared.includes(offering.id),
            disabled: selectedCount >= 2 && !compared.includes(offering.id),
            onChange: () => toggle(offering.id),
            label: selectedCount >= 2 && !compared.includes(offering.id) ? 'Deselect one programme to change' : 'Compare this programme',
          } : undefined}
        />} />
      {!matches.length ? (
        <div className="rs-empty">
          No programmes match this selection.{' '}
          <button
            type="button"
            onClick={reset}
          >
            Show programmes in {selectedMode}
          </button>
        </div>
      ) : null}
      {!matches.length ? catalogueAction : null}
      {selectedCount > 0 ? (
        <div className="rs-comparison-selection">
          <p className="rs-comparison-selection-status" role="status">
            <strong>{selectedCount} of 2 programmes selected.</strong>{' '}
            {selectedCount === 2 ? 'Ready to compare. Deselect one to change your choices.' : 'Choose one more programme.'}
          </p>
          <div className="rs-comparison-selection-actions">
            <button type="button" className="rs-text-link" onClick={clearSelection}>Clear selection</button>
            {selectedCount === 2 ? <a href="#programme-comparison" className="rs-text-link rs-comparison-jump">
              Compare selected programmes <ArrowRight size={17} />
            </a> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
export function OfferingComparison({ offerings, config, universityDefaults = [] }: {
  offerings: Offering[];
  config?: SectionHeaderConfig | null;
  universityDefaults?: string[];
}) {
  const { comparisonIds, setComparison, preview } = useSelection();
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<'all' | 'fees' | 'eligibility' | 'programme'>('all');
  const comparisonRef = useRef<HTMLDivElement>(null);
  const compareTriggerRef = useRef<HTMLButtonElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!expanded) return;
    comparisonRef.current?.focus({ preventScroll: true });
    comparisonRef.current?.scrollIntoView({ block: 'nearest' });
  }, [expanded, detail]);
  if (offerings.length < 2) return null;
  const slots = comparisonIds.map(id => offerings.find(offering => offering.id === id));
  const selected = slots.filter((offering): offering is Offering => Boolean(offering));
  const ready = selected.length === 2;
  const heading = config ? config.heading : 'Two good options. One clearer decision.';
  const description = config ? config.description : 'Compare programmes side by side and find the one that’s right for you.';
  const selectedUniversitySlugs = [...new Set(selected.map(item => item.universitySlug).filter(Boolean))];
  const universitySlugs = selectedUniversitySlugs.length ? selectedUniversitySlugs : universityDefaults;
  const universityQuery = new URLSearchParams();
  for (const slug of universitySlugs.slice(0, 3)) universityQuery.append('u', slug);
  const universityBase = config?.ctaLink || '/compare';
  const universityHref = universityBase === '/compare' && universityQuery.size ? universityBase + '?' + universityQuery.toString() : universityBase;
  function showDetail(next: typeof detail, trigger: HTMLButtonElement) {
    detailTriggerRef.current = trigger;
    setDetail(next);
    setExpanded(true);
    comparisonRef.current?.focus({ preventScroll: true });
    comparisonRef.current?.scrollIntoView({ block: 'nearest' });
  }
  function option(slot: number) {
    const offering = slots[slot];
    return (
      <div className="rs-comparison-option">
        <label className="rs-comparison-picker" htmlFor={'rs-compare-choice-' + slot}>
          <span>Programme {slot + 1}</span>
          <select id={'rs-compare-choice-' + slot} aria-label={'Comparison programme ' + (slot + 1)}
            value={offering?.id || ''} onChange={event => setComparison(slot, event.target.value)}>
            <option value="">Choose a university programme</option>
            {offerings.filter(item => !slots.some((value, index) => index !== slot && value?.id === item.id)).map(item => (
              <option key={item.id} value={item.id}>{item.university} — {item.fullName} ({item.mode})</option>
            ))}
          </select>
        </label>
        {offering ? <>
          <div className="rs-comparison-identity">
            {(offering.cardLogo || offering.logo) ? <Image src={offering.cardLogo || offering.logo!} width={44} height={44} alt="" /> : <span className="rs-initial" aria-hidden="true">{offering.university.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>}
            <div><h3>{offering.university}</h3><p>{offering.fullName}</p></div>
          </div>
          <dl className="rs-comparison-facts">
            <div><dt><Monitor size={16} /> Mode</dt><dd>{offering.mode}</dd></div>
            <div><dt><Clock3 size={16} /> Duration</dt><dd>{offering.duration}</dd></div>
          </dl>
        </> : <div className="rs-comparison-empty"><Scale size={26} /><p>Select a programme to see its details here.</p></div>}
      </div>
    );
  }
  const rows = [
    { key: 'programme', label: 'Study mode', values: selected.map(item => item.mode) },
    { key: 'programme', label: 'Duration', values: selected.map(item => item.duration) },
    { key: 'fees', label: 'Published fees', values: selected.map(item => displayFee(item) + (item.feeNote ? ' · ' + item.feeNote : '')) },
    { key: 'eligibility', label: 'Eligibility', values: selected.map(item => item.eligibility.join('; ') || 'Request current eligibility') },
  ];
  return (
    <section id="programme-comparison" className="rs-section rs-comparison">
      <div className="rs-container">
        <div className="rs-comparison-layout">
          <div className="rs-comparison-intro">
            {config?.eyebrow ? <span className="rs-eyebrow">{config.eyebrow}</span> : null}
            {heading ? <h2>{heading}</h2> : null}
            {description ? <p>{description}</p> : null}
            {config?.badges?.length ? <div className="rs-degree-tags">{config.badges.map(badge => <span key={badge} className="rs-chip">{badge}</span>)}</div> : null}
          </div>
          <div className="rs-comparison-card">
            <div className="rs-comparison-options">{option(0)}<span className="rs-comparison-vs" aria-hidden="true">vs</span>{option(1)}</div>
            <div className="rs-comparison-actions">
              <button className="rs-comparison-detail" type="button" disabled={!ready} onClick={(event) => showDetail('fees', event.currentTarget)} aria-controls="rs-comparison-details">Fees</button>
              <button className="rs-comparison-detail" type="button" disabled={!ready} onClick={(event) => showDetail('eligibility', event.currentTarget)} aria-controls="rs-comparison-details">Eligibility</button>
              <button className="rs-comparison-detail" type="button" disabled={!ready} onClick={(event) => showDetail('programme', event.currentTarget)} aria-controls="rs-comparison-details">Programme details</button>
              <button className="rs-button" type="button" disabled={!ready} ref={compareTriggerRef} onClick={(event) => showDetail('all', event.currentTarget)} aria-expanded={expanded && ready} aria-controls="rs-comparison-details">Compare programmes <ArrowRight size={16} /></button>
            </div>
            <Link className="rs-text-link rs-university-comparison-link" href={universityHref}>{config?.ctaLabel || 'Compare universities instead'} <ArrowRight size={15} /></Link>
          </div>
        </div>
        {expanded && ready ? (
          <div id="rs-comparison-details" className="rs-table-scroll rs-comparison-expanded" tabIndex={-1} ref={comparisonRef} role="region" aria-label="Programme comparison details">
            <div className="rs-comparison-table-heading"><h3>Your programme comparison</h3><button type="button" className="rs-text-link" onClick={() => { setExpanded(false); (detailTriggerRef.current ?? compareTriggerRef.current)?.focus(); }}>Close details</button></div>
            <table className="rs-compare-table">
              <caption className="sr-only">Your selected university programmes</caption>
              <thead><tr><th scope="col">Compare</th>{selected.map(item => <th scope="col" key={item.id}>{item.university}<span>{item.fullName}</span></th>)}</tr></thead>
              <tbody>
                {rows.filter(row => detail === 'all' || row.key === detail).map(row => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={selected[index].id}>{value}</td>)}</tr>)}
                <tr><th scope="row">Next step</th>{selected.map(item => <td key={item.id}>{preview
                  ? <EnquireLink offering={item} className="rs-text-link">Discuss this programme <ArrowRight size={15} /></EnquireLink>
                  : <Link href={item.href} className="rs-text-link">View programme <ArrowRight size={15} /></Link>}</td>)}</tr>
              </tbody>
            </table>
            <p className="rs-small">Confirm fee coverage and the current admission session with the university before applying.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
export function CallbackForm({ offerings, submitLabel = 'Request a callback' }: { offerings: Offering[]; submitLabel?: string }) {
  const { enquiry, setEnquiry, preview } = useSelection();
  const selected = offerings.find((o) => o.id === enquiry);
  const [fields, setFields] = useState({ name: '', phone: '' });
  const [state, action, pending] = useActionState(submitEnquiry, IDLE);
  const invalid = (name: string) => state.invalid?.includes(name);
  if (state.status === 'success')
    return (
      <div className="rs-form-success" role="status">
        <Check size={32} />
        <h3>Thank you. We have your request.</h3>
        <p>{state.message}</p>
      </div>
    );
  return (
    <form action={action} className="rs-callback-form" onSubmit={event => { if (preview) event.preventDefault(); }}>
      {preview ? (
        <p className="rs-small">
          Design preview — this form does not send enquiries.
        </p>
      ) : null}
      <input type="hidden" name="source" value="homepage-callback" />
      <input
        type="hidden"
        name="university"
        value={selected?.universitySlug || ''}
      />
      <input type="hidden" name="program" value={selected?.programSlug || ''} />
      <input
        type="hidden"
        name="message"
        value={
          selected
            ? 'Programme: ' +
              selected.fullName +
              '; University: ' +
              selected.university +
              '; Study mode: ' +
              selected.mode
            : ''
        }
      />
      <div className="rs-form-grid">
        {(
          [
            { name: 'name', label: 'Full name', type: 'text', auto: 'name' },
            { name: 'phone', label: 'Mobile number', type: 'tel', auto: 'tel' },
          ] as const
        ).map((f) => (
          <label key={f.name} htmlFor={'rs-' + f.name}>
            {f.label}
            <input
              id={'rs-' + f.name}
              name={f.name}
              value={fields[f.name]}
              onChange={(event) => {
                const value = event.target.value;
                setFields((current) => ({ ...current, [f.name]: value }));
              }}
              type={f.type}
              autoComplete={f.auto}
              required
              minLength={f.name === 'name' ? 2 : undefined}
              maxLength={
                f.name === 'phone' ? 20 : 120
              }
              aria-invalid={invalid(f.name)}
              aria-describedby={invalid(f.name) ? 'rs-form-status' : undefined}
            />
          </label>
        ))}
        <label htmlFor="rs-programme">
          Programme of interest
          <select
            id="rs-programme"
            value={enquiry}
            onChange={(e) => setEnquiry(e.target.value)}
          >
            <option value="">Help me choose</option>
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.university} — {o.fullName} ({o.mode})
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="rs-consent">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={invalid('consent')}
        />
        <span>
          I agree to be contacted by Agrico about my enquiry. Read our{' '}
          <Link href="/privacy-policy">privacy policy</Link>.
        </span>
      </label>
      {state.message ? (
        <p id="rs-form-status" role="alert" className="rs-form-error">
          {state.message}
        </p>
      ) : null}
      <button className="rs-button" type="submit" disabled={pending || preview}>
        {pending ? 'Sending your request…' : submitLabel}{' '}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
