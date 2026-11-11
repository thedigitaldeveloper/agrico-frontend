'use client';

import { Fragment, useActionState, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowLeftRight, ArrowRight, BookOpen, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Compass, Drone, Factory, FlaskConical, Layers3, Leaf, LoaderCircle, MapPin, MessageCircle, Minus, Plus, Search, Sprout, UsersRound, Waves, X } from 'lucide-react';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import { useOptionalEnquiryModal } from '@/components/university/university-enquiry-modal';
import { submitEnquiry } from '@/lib/actions';
import type { FormState } from '@/lib/form-state';
import type { Offering, RsHomeData } from '@/components/rs/home-types';
import { ADMISSION_RESOURCES, DEFAULT_AGRICO_SLIDES, FAQS, GUIDES, PROGRAMMES, UNIVERSITIES, type AgricultureProgramme, type AgricoHeroSlide, type StudyLevel } from './home-data';
import { GuideArt } from './guide-art';
import { AcademicArt } from './academic-art';
import { programmeGuidePath, UNIVERSITY_GUIDES } from './detail-catalogue';

type DialogContent =
  | { type: 'programme'; id: string }
  | { type: 'guide'; id: string }
  | { type: 'comparison' }
  | { type: 'universities' }
  | { type: 'enquiry'; programmeId?: string; sourceTitle?: string };
const levels: StudyLevel[] = ['Undergraduate', 'Postgraduate', 'Diploma'];
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const SERVICE_ICONS: Record<string, typeof BookOpen> = {
  BookOpen,
  Building2,
  UsersRound,
  Compass,
  Sprout,
  FlaskConical,
};

interface OfficialUniversityItem {
  id: string;
  mark: string;
  name: string;
  state: string;
  location: string;
  source: string;
  href: string;
  external: boolean;
  match: string[];
  logo?: string | null;
  cardLogo?: string | null;
  image?: string | null;
  degrees?: string[];
  ownership?: string;
  approvals?: string[];
  rankings?: string[];
  establishedYear?: string;
  rating?: number | null;
  programmeCount?: number;
}
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
const courseMatches = (course: AgricultureProgramme, value: string) => {
  const text = normalise(value);
  if (course.id === 'engineering') return /agricultur.*engineer|agri engineer/.test(text);
  if (course.id === 'horticulture') return text.includes('horticultur');
  if (course.id === 'agribusiness') return /agri business|agribusiness/.test(text);
  if (course.id === 'agronomy') return text.includes('agronom');
  if (course.id === 'diploma') return text.includes('diploma') && text.includes('agricultur');
  return text.includes('agricultur') && !/engineer|business|diploma|agronom|m sc/.test(text);
};

function getUniversityMark(name: string): string {
  if (/Lovely Professional/i.test(name)) return 'LPU';
  if (/Chandigarh/i.test(name)) return 'CU';
  if (/Vellore/i.test(name)) return 'VIT';
  if (/SRM/i.test(name)) return 'SRM';
  if (/SGT/i.test(name)) return 'SGT';
  if (/GD Goenka/i.test(name)) return 'GDG';
  if (/GLA/i.test(name)) return 'GLA';
  if (/Centurion/i.test(name)) return 'CUTM';
  if (/Amrita/i.test(name)) return 'AVV';
  if (/Suresh Gyan Vihar/i.test(name)) return 'SGVU';
  if (/Vivekananda Global/i.test(name)) return 'VGU';
  if (/Adhiparasakthi/i.test(name)) return 'AAC';
  if (/Adhiyamaan/i.test(name)) return 'ACAR';
  if (/Khalsa/i.test(name)) return 'KCA';
  if (/Shri Guru Ram Rai/i.test(name)) return 'SGRRU';
  if (/Siksha/i.test(name)) return 'SOA';
  if (/RKDF/i.test(name)) return 'RKDF';
  if (/RNB/i.test(name)) return 'RNB';
  if (/ITM/i.test(name)) return 'ITM';
  if (/Malla Reddy/i.test(name)) return 'MRU';
  if (/Sri Sri/i.test(name)) return 'SSU';
  if (/Punjab Agricultural/i.test(name)) return 'PAU';
  if (/Tamil Nadu Agricultural/i.test(name)) return 'TNAU';
  if (/Indian Agricultural Research/i.test(name)) return 'IARI';

  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => !/^(of|and|the|in|for|deemed|to|be|college|university|institute|sciences|technology|research)$/i.test(w));
  if (words.length >= 2) {
    return words.slice(0, 4).map(w => w[0].toUpperCase()).join('');
  }
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={'ag-eyebrow' + (light ? ' ag-eyebrow--light' : '')}>{children}</p>;
}

function TextButton({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" className={'ag-text-link ' + className} onClick={onClick}>{children}<ArrowRight size={16} /></button>;
}

export function AgricoHome({ data, initialQuery = '' }: { data: RsHomeData | null; initialQuery?: string }) {
  const globalEnquiryModal = useOptionalEnquiryModal();
  const { whatsappNumber, contactPhone } = useSiteSettings();
  const rawWa = whatsappNumber || contactPhone || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) || '919876543210';
  const waDigits = rawWa.replace(/\D/g, '');
  const fullWa = waDigits.length === 10 ? '91' + waDigits : waDigits;
  const initialCourse = PROGRAMMES.find(course => initialQuery && normalise(course.name + ' ' + course.navName).includes(normalise(initialQuery))) ?? PROGRAMMES[1];
  const [level, setLevel] = useState<StudyLevel>(initialCourse.level);
  const [activeId, setActiveId] = useState(initialCourse.id);
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [interest, setInterest] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [dialog, setDialog] = useState<DialogContent | null>(null);
  const [previousDialog, setPreviousDialog] = useState<DialogContent | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const active = PROGRAMMES.find(course => course.id === activeId) ?? PROGRAMMES[1];
  const visibleCourses = PROGRAMMES.filter(course => course.level === level || (level === 'Undergraduate' && course.id === 'agribusiness'));
  const catalogue = data?.catalogue ?? [];
  const selectedCourses = compareIds.length === 2 ? PROGRAMMES.filter(course => compareIds.includes(course.id)) : PROGRAMMES.slice(0, 2);

  const officialUniversities = useMemo<OfficialUniversityItem[]>(() => {
    if (data?.universities && data.universities.length > 0) {
      return data.universities.slice(0, 5).map(u => {
        const parts = u.location ? u.location.split(',').map(s => s.trim()) : [];
        const state = parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'India';
        const mark = getUniversityMark(u.name);
        return {
          id: u.slug,
          mark,
          name: u.name,
          state,
          location: u.location,
          source: '/university/' + u.slug,
          href: '/university/' + u.slug,
          external: false,
          match: [normalise(u.name), normalise(mark), normalise(state)],
          logo: u.cardLogo || u.logo,
          cardLogo: u.cardLogo || u.logo,
          image: u.image,
          degrees: u.degrees,
          ownership: u.ownership,
          approvals: u.approvals,
          rankings: u.rankings,
          establishedYear: u.establishedYear,
          rating: u.rating,
          programmeCount: u.programmeCount,
        };
      });
    }
    return UNIVERSITIES.map(university => {
      const published = data?.universityOptions.find(option => university.match.some(term => normalise(option.name).includes(term)));
      const guide = UNIVERSITY_GUIDES.find(item => item.name === university.name);
      return {
        id: university.id,
        mark: university.mark,
        name: university.name,
        state: university.state,
        location: university.state,
        source: university.source,
        href: '/university/' + (published?.slug || guide?.slug || university.id),
        external: false,
        match: [...university.match],
      };
    });
  }, [data]);

  const allUniversityOptions = useMemo<OfficialUniversityItem[]>(() => {
    if (data?.universityOptions && data.universityOptions.length > 0) {
      return data.universityOptions.map(u => {
        const mark = getUniversityMark(u.name);
        return {
          id: u.slug,
          mark,
          name: u.name,
          state: '',
          location: '',
          source: '/university/' + u.slug,
          href: '/university/' + u.slug,
          external: false,
          match: [normalise(u.name), normalise(mark)],
        };
      });
    }
    return officialUniversities;
  }, [data, officialUniversities]);

  const courseOffering = (course: AgricultureProgramme) => catalogue.find(offering => courseMatches(course, offering.degree + ' ' + offering.fullName + ' ' + offering.program));
  const [leftCourse, rightCourse] = selectedCourses;

  const heroSlides = useMemo<AgricoHeroSlide[]>(() => {
    const rawSlides = data?.slides ?? [];
    const valid = rawSlides.filter(s => Boolean(s.image));
    if (valid.length === 0) return DEFAULT_AGRICO_SLIDES;

    return valid.map((s, index) => {
      const fallback = DEFAULT_AGRICO_SLIDES[index % DEFAULT_AGRICO_SLIDES.length];
      const hasRealImage = Boolean(s.image && !s.image.includes('student-life.png'));
      return {
        id: s.id || `cms-slide-${index}`,
        image: hasRealImage ? s.image : fallback.image,
        alt: s.alt || fallback.alt,
        href: s.href || fallback.href || null,
        eyebrow: s.eyebrow,
        heading: s.heading,
        description: s.description,
        tag: s.ctaLabel || fallback.tag,
      };
    });
  }, [data?.slides]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(current => (current + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length]);

  const nextSlide = useCallback(() => {
    setActiveSlide(current => (current + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide(current => (current - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[activeSlide] ?? heroSlides[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;

    if (dialog) {
      if (!node.open) node.showModal();
      node.scrollTop = 0;
      const content = node.querySelector<HTMLElement>('.ag-dialog__content');
      if (content) content.scrollTop = 0;
      requestAnimationFrame(() => {
        node.scrollTop = 0;
        if (content) content.scrollTop = 0;
      });
    } else if (node.open) {
      node.close();
    }

    if (!dialog) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [dialog]);

  const requestGuidance = useCallback((id?: string, sourceTitle?: string, uniSlug?: string) => {
    const matchedCourse = id ? PROGRAMMES.find(p => p.id === id) : undefined;
    if (globalEnquiryModal) {
      setDialog(null);
      globalEnquiryModal.openModal({
        universitySlug: uniSlug || '',
        universityName: sourceTitle && !matchedCourse ? sourceTitle : 'Agrico Admission Desk',
        programSlug: id,
        programName: matchedCourse?.name || sourceTitle || 'Agriculture & AgriTech Degree Guidance',
        source: 'application-form',
        title: sourceTitle ? `Apply / Enquire — ${sourceTitle}` : 'Get Free Admission Guidance',
        subtitle: 'Compare ICAR-aligned agriculture universities, fee structures, scholarships and eligibility with a personal counsellor.',
      });
      if (id) setInterest(id);
      return;
    }
    setDialog(current => {
      if (current && current.type !== 'enquiry') {
        setPreviousDialog(current);
      }
      return {
        type: 'enquiry',
        programmeId: id,
        sourceTitle: sourceTitle || matchedCourse?.name,
      };
    });
    if (id) setInterest(id);
  }, [globalEnquiryModal]);

  useEffect(() => {
    const handleOpenEnquiry = (event: Event) => {
      const customEvent = event as CustomEvent<{ programmeId?: string; sourceTitle?: string }>;
      requestGuidance(customEvent.detail?.programmeId, customEvent.detail?.sourceTitle || 'Header Counselling');
    };
    window.addEventListener('agrico:open-enquiry', handleOpenEnquiry);
    return () => window.removeEventListener('agrico:open-enquiry', handleOpenEnquiry);
  }, [requestGuidance]);

  const chooseCourse = (id: string, scroll = false) => {
    const course = PROGRAMMES.find(item => item.id === id);
    if (!course) return;
    setActiveId(id); setLevel(course.level);
    if (scroll) scrollToSection('programmes');
  };
  const chooseLevel = (next: StudyLevel) => {
    setLevel(next);
    const course = PROGRAMMES.find(item => item.level === next);
    if (course) setActiveId(course.id);
  };
  const findProgrammes = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
    if (!query.trim()) { chooseCourse(activeId, true); return; }
    const text = normalise(query);
    const course = PROGRAMMES.find(item => normalise(item.name + ' ' + item.navName + ' ' + item.subjects).includes(text));
    if (course) { chooseCourse(course.id, true); return; }
    const university = allUniversityOptions.find(item => normalise(item.name + ' ' + item.mark + ' ' + item.state).includes(text));
    scrollToSection(university ? 'universities' : 'programmes');
  };
  const toggleComparison = (id: string) => {
    if (compareIds.includes(id)) { setCompareIds(compareIds.filter(value => value !== id)); setAnnouncement('Programme removed from your comparison.'); }
    else if (compareIds.length < 2) { setCompareIds([...compareIds, id]); setAnnouncement('Programme added to your comparison.'); }
    else setAnnouncement('You can compare two programmes. Remove one before adding another.');
  };
  const openComparison = () => {
    if (compareIds.length === 1) { setAnnouncement('Select one more programme to compare your choices.'); scrollToSection('programmes'); }
    else setDialog({ type: 'comparison' });
  };
  const viewCourse = (course: AgricultureProgramme, className = 'ag-button') => {
    const offering = courseOffering(course);
    return <Link href={offering?.href || programmeGuidePath(course.id)} className={className}>View programme <ArrowRight size={15} /></Link>;
  };
  const toggleUniversity = (id: string) => setSelectedUniversities(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const searchMatches = useMemo(() => {
    if (!submittedQuery) return null;
    const text = normalise(submittedQuery);
    return {
      courses: PROGRAMMES.filter(course => normalise(course.name + ' ' + course.navName + ' ' + course.subjects).includes(text)),
      universities: allUniversityOptions.filter(university => normalise(university.name + ' ' + university.mark).includes(text)),
    };
  }, [submittedQuery, allUniversityOptions]);

  const displayUpdates = useMemo(() => {
    const cmsPosts = [...(data?.news ?? []), ...(data?.articles ?? []), ...(data?.blogs ?? [])];
    if (cmsPosts.length > 0) {
      const fallbackImages = ['/images/agrico/nursery-learning.png', '/images/agrico/agritech-workshop.png', '/images/agrico/hero-campus.png'];
      return cmsPosts.slice(0, 9).map((item, index) => ({
        title: item.title,
        category: item.category || 'Education update',
        text: item.summary || 'Read the full guide on admissions, practical learning and curriculum insights.',
        image: item.image || fallbackImages[index % fallbackImages.length],
        alt: item.imageAlt || item.title,
        href: item.href,
      }));
    }
    return [
      { category: 'Learning', title: 'Precision learning and student projects', text: 'How hands-on projects and real-world learning help students build practical skills in agriculture.', image: '/images/agrico/nursery-learning.png', alt: 'University students studying plants in a teaching greenhouse', href: '/articles' },
      { category: 'Campus insight', title: 'Exploring agricultural engineering', text: 'A closer look at how university labs and field projects help students understand real-world agricultural challenges.', image: '/images/agrico/agritech-workshop.png', alt: 'Engineering students learning with a teaching drone in a laboratory', href: '/articles' },
    ];
  }, [data]);

  // News & updates slider: native scroll-snap (swipe/trackpad) plus arrow and dot controls.
  const updatesRef = useRef<HTMLDivElement>(null);
  const [updatesPage, setUpdatesPage] = useState(0);
  const [updatesPageCount, setUpdatesPageCount] = useState(1);
  const measureUpdates = useCallback(() => {
    const track = updatesRef.current;
    if (!track) return;
    const pages = Math.max(1, Math.ceil((track.scrollWidth - 4) / track.clientWidth));
    setUpdatesPageCount(pages);
    setUpdatesPage(Math.min(pages - 1, Math.round(track.scrollLeft / track.clientWidth)));
  }, []);
  useEffect(() => {
    measureUpdates();
    window.addEventListener('resize', measureUpdates);
    return () => window.removeEventListener('resize', measureUpdates);
  }, [measureUpdates, displayUpdates.length]);
  const syncUpdatesPage = () => {
    const track = updatesRef.current;
    if (!track) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    setUpdatesPage(atEnd ? updatesPageCount - 1 : Math.round(track.scrollLeft / track.clientWidth));
  };
  const goToUpdatesPage = (page: number) => {
    const track = updatesRef.current;
    if (track) track.scrollTo({ left: page * track.clientWidth, behavior: 'smooth' });
  };
  const scrollUpdates = (direction: 1 | -1) => goToUpdatesPage(Math.max(0, Math.min(updatesPageCount - 1, updatesPage + direction)));

  const serviceItems = useMemo(() => {
    if (data?.home?.serviceLinks && data.home.serviceLinks.length > 0) {
      return data.home.serviceLinks.map(s => ({
        icon: (s.iconName && SERVICE_ICONS[s.iconName]) || BookOpen,
        title: s.title,
        text: s.description,
        href: s.href,
      }));
    }
    return [
      { icon: BookOpen, title: 'Explore programmes', text: 'Discover agriculture and agritech degrees that match your interests.', href: '#programmes' },
      { icon: Building2, title: 'Compare universities', text: 'Look at programmes, campus life and admission details side by side.', href: '#universities' },
      { icon: UsersRound, title: 'Admission guidance', text: 'Get expert support at every step of your application journey.', href: '#guidance' },
    ];
  }, [data]);

  const faqList = useMemo(() => {
    if (data?.faqs && data.faqs.length > 0) {
      return data.faqs;
    }
    return FAQS;
  }, [data]);

  const dialogCourse = dialog?.type === 'programme' ? PROGRAMMES.find(course => course.id === dialog.id) : null;
  const dialogGuide = dialog?.type === 'guide' ? GUIDES.find(guide => guide.id === dialog.id) : null;
  const comparisonRows: { label: string; key: 'focus' | 'subjects' | 'practical' | 'careers'; icon: typeof BookOpen }[] = [
    { label: 'Study focus', key: 'focus', icon: Compass },
    { label: 'Core subjects', key: 'subjects', icon: BookOpen },
    { label: 'Hands-on learning', key: 'practical', icon: UsersRound },
    { label: 'Career areas', key: 'careers', icon: Layers3 },
  ];

  return <div className="ag-home">
    {/* 01 — Agrico Hero Section with Interactive Photo Slider */}
    <section
      className="ag-hero"
      aria-labelledby="ag-hero-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Agrico homepage hero slider"
    >
      <div className="ag-container ag-hero__inner">
        <div className="ag-hero__copy">
          <Eyebrow>India’s agriculture education platform</Eyebrow>
          <h1 id="ag-hero-title">
            Study agriculture.<br />
            Engineer your next step.
          </h1>
          <p className="ag-hero__description">
            Explore verified agriculture programmes, compare university curricula and facilities, and get personalised admission guidance.
          </p>

          <form onSubmit={findProgrammes} className="ag-finder" role="search">
            <div className="ag-finder__control">
              <Search size={20} aria-hidden="true" className="ag-finder__icon" />
              <input
                aria-label="Search programmes, universities or interests"
                placeholder="Search B.Sc Agriculture, Agri Engineering, PAU, TNAU…"
                value={query}
                onChange={event => setQuery(event.target.value)}
                maxLength={120}
              />
              <button className="ag-button" type="submit">
                Find programmes <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="ag-hero__quick-links">
            <span className="ag-hero__quick-label">Popular:</span>
            <button type="button" onClick={() => chooseCourse('agriculture', true)}>B.Sc. Agriculture</button>
            <button type="button" onClick={() => chooseCourse('engineering', true)}>Agri Engineering</button>
            <button type="button" onClick={() => chooseCourse('horticulture', true)}>Horticulture</button>
            <button type="button" onClick={() => chooseCourse('agribusiness', true)}>Agribusiness</button>
            <button type="button" className="ag-hero__counsel-tag" onClick={() => requestGuidance(undefined, 'Hero Counselling')}>
              <Sprout size={13} /> Free Counselling
            </button>
          </div>
        </div>

        <div className="ag-hero__visual">
          <div className="ag-hero__slider-card">
            {/* Top progress indicator bars */}
            {heroSlides.length > 1 && (
              <div className="ag-hero__progress-bars" role="tablist" aria-label="Slide indicators">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeSlide}
                    aria-label={`Slide ${i + 1}: ${slide.tag || 'Highlight'}`}
                    className={`ag-hero__progress-bar ${i === activeSlide ? 'is-active' : ''}`}
                    onClick={() => setActiveSlide(i)}
                  />
                ))}
              </div>
            )}

            {/* Photo Slides */}
            <div className="ag-hero__slider-slides">
              {heroSlides.map((slide, i) => (
                <div
                  key={slide.id}
                  className={`ag-hero__slide ${i === activeSlide ? 'is-active' : ''}`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 900px) 100vw, 48vw"
                    className="ag-hero__slide-img"
                  />
                  <div className="ag-hero__slide-gradient" />
                </div>
              ))}
            </div>

            {/* Glassmorphic floating caption & controls bar */}
            <div className="ag-hero__slider-overlay">
              <div className="ag-hero__slide-info">
                {currentSlide.tag && (
                  <span className="ag-hero__slide-tag">{currentSlide.tag}</span>
                )}
                <div className="ag-hero__slide-headline">
                  {currentSlide.heading?.replace('\n', ' ') || 'Innovate with nature. Lead crop discoveries.'}
                </div>
              </div>

              {heroSlides.length > 1 && (
                <div className="ag-hero__slider-controls">
                  <div className="ag-hero__slide-counter" aria-live="polite">
                    <span>0{activeSlide + 1}</span>
                    <span className="ag-hero__slide-sep">/</span>
                    <span>0{heroSlides.length}</span>
                  </div>

                  <div className="ag-hero__slide-nav">
                    <button
                      type="button"
                      className="ag-hero__nav-btn"
                      onClick={prevSlide}
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="ag-hero__nav-btn"
                      onClick={nextSlide}
                      aria-label="Next slide"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="ag-help-strip" aria-label="How Agrico helps you"><div className="ag-container ag-help-strip__inner">
      <Eyebrow>How Agrico<br />helps you</Eyebrow>
      {serviceItems.map(item => (
        <a
          key={item.title}
          href={item.href}
          className="ag-service"
          onClick={item.href === '#guidance' ? (e) => {
            e.preventDefault();
            requestGuidance(undefined, 'Admission Guidance');
          } : undefined}
        >
          <span className="ag-service__icon"><item.icon size={29} strokeWidth={1.65} /></span>
          <span><strong>{item.title}</strong><small>{item.text}</small></span>
        </a>
      ))}
    </div></section>

    <section id="programmes" className="ag-section ag-programmes" aria-labelledby="ag-programme-title"><div className="ag-container">
      <div className="ag-section-heading"><div><Eyebrow>Programme explorer</Eyebrow><h2 id="ag-programme-title">Explore your agriculture degree.</h2></div><div className="ag-level-tabs" aria-label="Study level">{levels.map(item => <button type="button" key={item} aria-pressed={level === item} onClick={() => chooseLevel(item)}>{item}</button>)}</div></div>
      {searchMatches && <div className="ag-search-results" role="status"><span>{searchMatches.courses.length + searchMatches.universities.length ? <>Results for <strong>“{submittedQuery}”</strong></> : <>No exact matches for <strong>“{submittedQuery}”</strong>. Explore the programmes below or ask a counsellor.</>}</span><div>{searchMatches.courses.map(course => <button key={course.id} onClick={() => chooseCourse(course.id)}>{course.shortName}<ArrowDown size={13} /></button>)}{searchMatches.universities.map(university => <a key={university.id} href="#universities">{university.mark}<ArrowDown size={13} /></a>)}<button aria-label="Clear search results" onClick={() => { setSubmittedQuery(''); setQuery(''); }}><X size={15} /></button></div></div>}
      <div className="ag-programme-explorer">
        <div className="ag-degree-index" aria-label="Select a degree programme">{visibleCourses.map(course => <button type="button" key={course.id} className={active.id === course.id ? 'is-active' : ''} aria-pressed={active.id === course.id} title={course.level !== level ? 'Explore Agribusiness postgraduate programmes' : undefined} onClick={() => chooseCourse(course.id)}>{course.navName}<ChevronRight size={18} /></button>)}</div>
        <article className="ag-course-panel" aria-label={active.name}>
          <div className="ag-course-panel__heading"><h3>{active.name}</h3><p className="ag-meta"><span>{active.level}</span><span>{active.duration}</span><span>Campus learning</span></p><p>{active.description}</p></div>
          <div className="ag-subject-grid">{active.topics.map(topic => <div className="ag-subject" key={topic.title}><AcademicArt cell={topic.art} /><h4>{topic.title}</h4><p>{topic.description}</p></div>)}</div>
          <div className="ag-course-panel__actions">
            {viewCourse(active)}
            <button
              type="button"
              className="ag-button ag-button--sage"
              onClick={() => requestGuidance(active.id, active.name)}
            >
              Apply / Enquire <ArrowRight size={15} />
            </button>
            {fullWa ? (
              <a
                className="ag-button ag-button--outline"
                href={`https://wa.me/${fullWa}?text=${encodeURIComponent('Hi Agrico, I would like admission guidance & fee details for ' + active.name + '.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            ) : null}
            <label className="ag-check">
              <input
                type="checkbox"
                checked={compareIds.includes(active.id)}
                onChange={() => toggleComparison(active.id)}
              />
              <span>Add to compare</span>
            </label>
          </div>
        </article>
      </div>
      <p className="ag-live-message" role="status" aria-live="polite">{announcement}{compareIds.length > 0 && <> <button type="button" className="ag-inline-button" onClick={openComparison}>Compare {compareIds.length} selected <ArrowRight size={14} /></button> <button className="ag-inline-button" type="button" onClick={() => { setCompareIds([]); setAnnouncement('Comparison selection cleared.'); }}>Clear</button></>}</p>
    </div></section>

    <section id="universities" className="ag-section ag-universities" aria-labelledby="ag-universities-title"><div className="ag-container ag-university-layout">
      <div>
        <div className="ag-section-heading">
          <div>
            <Eyebrow>University directory</Eyebrow>
            <h2 id="ag-universities-title">Find the right campus for your course.</h2>
          </div>
        </div>

        <div className="ag-university-directory">
          {officialUniversities.map(university => (
            <article className="ag-university-row" key={university.id}>
              <label className="ag-university-select">
                <input
                  type="checkbox"
                  aria-label={'Compare ' + university.name}
                  checked={selectedUniversities.includes(university.id)}
                  onChange={() => toggleUniversity(university.id)}
                />
              </label>

              <div className="ag-university-brand">
                {university.logo ? (
                  <div className="ag-university-logo-box">
                    <Image
                      src={university.logo}
                      alt={university.name + ' logo'}
                      width={68}
                      height={48}
                      className="ag-university-logo-img"
                      unoptimized={university.logo.endsWith('.svg') || university.logo.endsWith('.webp')}
                    />
                  </div>
                ) : (
                  <span className="ag-university-mark" aria-hidden="true">{university.mark}</span>
                )}
              </div>

              <div className="ag-university-row__identity">
                <div className="ag-uni-title-line">
                  <h3>
                    <Link href={university.href}>{university.name}</Link>
                  </h3>
                </div>

                <div className="ag-uni-meta-line">
                  <span className="ag-uni-location">
                    <MapPin size={12} /> {university.location || university.state}
                  </span>
                  {university.establishedYear && (
                    <span className="ag-uni-pill">Est. {university.establishedYear}</span>
                  )}
                  {university.ownership && (
                    <span className="ag-uni-pill ag-uni-pill--ownership">{university.ownership}</span>
                  )}
                  {university.approvals && university.approvals.length > 0 ? (
                    <span className="ag-uni-pill ag-uni-pill--accent">
                      {university.approvals.slice(0, 2).join(' · ')}
                    </span>
                  ) : (
                    <span className="ag-uni-pill ag-uni-pill--accent">ICAR / UGC Approved</span>
                  )}
                  {university.degrees && university.degrees.length > 0 && (
                    <span className="ag-uni-pill ag-uni-pill--degrees">
                      {university.degrees.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="ag-university-links">
                <Link href={UNIVERSITY_GUIDES.some(g => `/university/${g.slug}` === university.href) ? `${university.href}#programmes` : `${university.href}/course-fee`}>Programmes</Link>
                <Link href={university.href}>Campus profile</Link>
                <Link href={UNIVERSITY_GUIDES.some(g => `/university/${g.slug}` === university.href) ? `${university.href}#admissions` : `${university.href}/admission-process`}>Admissions</Link>
              </div>

              <div className="ag-university-actions">
                <button
                  type="button"
                  className="ag-button ag-button--outline ag-uni-enquire-btn"
                  onClick={() => requestGuidance(undefined, university.name, university.id)}
                >
                  Apply / Enquire
                </button>
                {fullWa ? (
                  <a
                    className="ag-uni-wa-btn"
                    href={`https://wa.me/${fullWa}?text=${encodeURIComponent('Hi Agrico, I would like admission guidance for ' + university.name + '.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat on WhatsApp about ${university.name}`}
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={14} />
                  </a>
                ) : null}
                <Link href={university.href} className="ag-university-view">
                  View <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
          <div className="ag-directory-footer">
            <span>Featured agriculture universities · 58 accredited campuses available</span>
            <a href="#programmes" className="ag-inline-button">Explore degrees</a>
          </div>
        </div>
        {selectedUniversities.length > 0 && <div className="ag-university-selection" role="status"><span>{selectedUniversities.length} {selectedUniversities.length === 1 ? 'university' : 'universities'} selected</span><button className="ag-text-link" onClick={() => setDialog({ type: 'universities' })} disabled={selectedUniversities.length < 2}>Compare selected <ArrowRight size={15} /></button><button className="ag-inline-button" onClick={() => setSelectedUniversities([])}>Clear</button></div>}
      </div>
      <aside className="ag-campus-check"><h3>Look beyond the name.</h3><p>Choose a university that fits your learning style and goals. Here are some key things to explore:</p><button onClick={() => setDialog({ type: 'guide', id: 'university-learning' })}><BookOpen size={23} /><span>Curriculum</span><ArrowRight size={15} /></button><a href="#learning"><FlaskConical size={23} /><span>Practical learning</span><ArrowRight size={15} /></a><button onClick={() => setDialog({ type: 'guide', id: 'university-learning' })}><Building2 size={23} /><span>Facilities</span><ArrowRight size={15} /></button></aside>
    </div></section>

    <section id="agritech" className="ag-technology" aria-labelledby="ag-technology-title"><div className="ag-container ag-technology__grid">
      <div className="ag-technology__copy"><Eyebrow light>Study areas &amp; practical learning</Eyebrow><h2 id="ag-technology-title">Learn the technology behind modern agriculture.</h2>
        <div className="ag-tech-paths">{[
          { icon: Drone, title: 'Precision & drone systems', text: 'Learn about remote sensing, GIS and data-driven farming.', programme: 'engineering' },
          { icon: Sprout, title: 'Soil and water engineering', text: 'Study irrigation systems, water management and land development.', programme: 'engineering' },
          { icon: Factory, title: 'Food processing engineering', text: 'Understand post-harvest technology and food processing systems.', programme: 'engineering' },
        ].map(item => <button type="button" key={item.title} onClick={() => { chooseCourse(item.programme); setDialog({ type: 'programme', id: item.programme }); }}><span className="ag-tech-icon"><item.icon size={28} strokeWidth={1.35} /></span><span><strong>{item.title}</strong><small>{item.text}</small></span><ChevronRight size={18} /></button>)}</div>
        <div className="ag-tech-cta-row">
          <button className="ag-button ag-button--lime" onClick={() => chooseCourse('engineering', true)}>Explore study areas <ArrowRight size={16} /></button>
          <button
            type="button"
            className="ag-tech-enquire-btn"
            onClick={() => requestGuidance('engineering', 'Agricultural Engineering')}
          >
            <Sprout size={14} /> Enquire for AgriTech <ArrowRight size={15} />
          </button>
        </div>
      </div><div className="ag-technology__photo"><Image src="/images/agrico/agritech-workshop.png" alt="Students and an instructor examining a teaching drone in a university engineering workshop" fill sizes="(max-width: 760px) 100vw, 48vw" /></div>
    </div></section>

    <section id="compare" className="ag-section ag-comparison" aria-labelledby="ag-comparison-title"><div className="ag-container">
      <div className="ag-section-heading"><div><Eyebrow>Make an informed choice</Eyebrow><h2 id="ag-comparison-title">Which agriculture pathway fits you?</h2></div>{compareIds.length > 0 && <button className="ag-inline-button" onClick={() => { setCompareIds([]); setAnnouncement('Comparison selection cleared.'); }}>Clear selection</button>}</div>
      <div className="ag-comparison__pair">{[leftCourse, rightCourse].map((course, index) => <article className={'ag-comparison-card' + (index === 0 ? ' ag-comparison-card--science' : '')} key={course.id}>
        <div className="ag-comparison-card__header"><div><h3>{course.name}</h3><p>{course.id === 'agriculture' ? 'Focus on agricultural sciences and living systems.' : course.id === 'engineering' ? 'Apply engineering for a more productive and sustainable food system.' : 'Explore the knowledge and practical learning behind your degree.'}</p></div><AcademicArt cell={course.id === 'agriculture' ? 3 : course.id === 'engineering' ? 4 : course.topics[0].art} /></div>
        <dl className="ag-comparison-facts">{comparisonRows.map(row => <div key={row.key}><dt><row.icon size={17} />{row.label}</dt><dd>{course[row.key]}</dd></div>)}<div><dt><ClipboardCheck size={17} />Eligibility</dt><dd><button className="ag-inline-button" onClick={() => setDialog({ type: 'programme', id: course.id })}>View programme requirements</button></dd></div></dl>
        <div className="ag-comparison-card__action">{viewCourse(course)}</div>
      </article>)}<span className="ag-comparison-connector" aria-hidden="true"><ArrowLeftRight size={20} /></span></div>
      <div className="ag-comparison__footer"><button className="ag-button ag-button--sage" onClick={openComparison}>Compare these programmes <ArrowRight size={16} /></button></div>
    </div></section>

    <section id="admissions" className="ag-section ag-admissions" aria-labelledby="ag-admissions-title"><div className="ag-container ag-admissions__grid">
      <div><Eyebrow>Admission guidance</Eyebrow><h2 id="ag-admissions-title">Plan your admission, step by step.</h2><ol className="ag-admission-steps">{[
        { icon: BookOpen, title: 'Choose a programme', text: 'Explore degree options, understand subject areas and find the right fit for your interests.', action: () => chooseCourse('agriculture', true) },
        { icon: Building2, title: 'Compare universities', text: 'Look at curricula, campus life, facilities and admission details side by side.', action: () => scrollToSection('universities') },
        { icon: UsersRound, title: 'Get counselling', text: 'Talk to our counsellors about your options and clarify your next steps.', action: () => { scrollToSection('guidance'); document.getElementById('ag-full-name')?.focus(); } },
      ].map((step, index) => <li key={step.title}><span className="ag-step-number">{index + 1}</span><button className="ag-step-icon" onClick={step.action} aria-label={step.title}><step.icon size={30} strokeWidth={1.7} /></button><div><button className="ag-step-title" onClick={step.action}>{step.title}</button><p>{step.text}</p></div></li>)}</ol></div>
      <aside className="ag-question-sheet"><h3>Prepare your questions.</h3><p>Use this checklist to have a more informed conversation with universities and counsellors.</p>{[
        { icon: BookOpen, title: 'Curriculum', text: 'What subjects are covered? Can I choose electives? Is there practical learning?' },
        { icon: ClipboardCheck, title: 'Eligibility', text: 'What are the academic requirements? Are there subject prerequisites?' },
        { icon: Building2, title: 'Campus learning', text: 'What kind of practical facilities are available? Are there projects or field visits?' },
      ].map(item => <button type="button" key={item.title} onClick={() => setDialog({ type: 'guide', id: 'counselling' })}><item.icon size={27} strokeWidth={1.6} /><span><strong>{item.title}</strong><small>{item.text}</small></span><ChevronRight size={17} /></button>)}<TextButton className="ag-button" onClick={() => setDialog({ type: 'guide', id: 'counselling' })}>Explore admission guides</TextButton></aside>
    </div></section>

    <section id="learning" className="ag-section ag-learning" aria-labelledby="ag-learning-title"><div className="ag-container">
      <div className="ag-section-heading"><div><Eyebrow>From degree to career</Eyebrow><h2 id="ag-learning-title">See where your studies could lead.</h2></div><p className="ag-section-note">Explore programme-specific requirements and opportunities.</p></div>
      <div className="ag-pathway-table" role="table" aria-label="Degree study and career pathways"><div className="ag-pathway-table__head" role="row"><span role="columnheader">Degree programme</span><span role="columnheader">What you’ll study</span><span role="columnheader">Explore career areas</span><span role="columnheader">Actions</span></div>{[PROGRAMMES[0], PROGRAMMES[1], PROGRAMMES[3]].map((course, index) => <div className="ag-pathway-row" role="row" key={course.id}>
        <div className="ag-pathway-degree" role="cell"><AcademicArt cell={6 + index} /><div><h3>{course.shortName}</h3><p>{index === 0 ? 'Study agricultural sciences and living systems.' : index === 1 ? 'Apply engineering principles to real-world agricultural systems.' : 'Learn management and business for the agricultural sector.'}</p></div></div>
        <div className="ag-pathway-detail" role="cell">{index === 0 ? <Sprout size={27} /> : index === 1 ? <Layers3 size={27} /> : <Leaf size={27} />}<div><h4>{course.subjects}</h4><p>{index === 0 ? 'Crop science, soil health, plant biology, agronomy and more.' : index === 1 ? 'Farm machinery, irrigation, water management, renewable energy and more.' : 'Agricultural markets, value chains, management and enterprise.'}</p></div><ChevronRight size={15} /></div>
        <div className="ag-pathway-detail" role="cell">{index === 0 ? <Leaf size={25} /> : index === 1 ? <Waves size={25} /> : <UsersRound size={25} />}<div><h4>{course.careers}</h4><p>{index === 0 ? 'Explore research roles, extension services, sustainable farming and agribusiness.' : index === 1 ? 'Design, development and management across farm, water and food systems.' : 'Explore agribusiness, food value chains, consulting and rural enterprise.'}</p></div></div>
        <div className="ag-pathway-action" role="cell">
          <TextButton onClick={() => setDialog({ type: 'programme', id: course.id })}>Explore</TextButton>
          <button
            type="button"
            className="ag-pathway-enquire-btn"
            onClick={() => requestGuidance(course.id, course.name)}
          >
            Enquire <ArrowRight size={13} />
          </button>
        </div>
      </div>)}</div>
    </div></section>

    <section id="guides" className="ag-section ag-guides" aria-labelledby="ag-guides-title"><div className="ag-container"><Eyebrow>Student guides</Eyebrow><h2 id="ag-guides-title">Build a clearer shortlist.</h2><div className="ag-guide-grid">{GUIDES.map(guide => <article className="ag-guide-card" key={guide.id}><span className="ag-guide-number">{guide.number}</span><h3>{guide.title}</h3><p>{guide.description}</p><GuideArt variant={guide.id} /><TextButton onClick={() => setDialog({ type: 'guide', id: guide.id })}>Read guide</TextButton></article>)}</div></div></section>

    <section id="updates" className="ag-section ag-updates" aria-labelledby="ag-updates-title"><div className="ag-container">
      <div className="ag-section-heading">
        <div><Eyebrow>News &amp; updates</Eyebrow><h2 id="ag-updates-title">Agriculture education updates.</h2></div>
        <div className="ag-updates-controls">
          <Link href="/articles" className="ag-text-link">View all <ArrowRight size={16} /></Link>
          {displayUpdates.length > 1 && <>
            <button type="button" className="ag-updates-nav" aria-label="Previous updates" disabled={updatesPage === 0} onClick={() => scrollUpdates(-1)}><ChevronLeft size={18} /></button>
            <button type="button" className="ag-updates-nav" aria-label="Next updates" disabled={updatesPage >= updatesPageCount - 1} onClick={() => scrollUpdates(1)}><ChevronRight size={18} /></button>
          </>}
        </div>
      </div>
      <div className="ag-updates-track" ref={updatesRef} onScroll={syncUpdatesPage} role="region" aria-roledescription="carousel" aria-label="News and updates" tabIndex={0}>
        {displayUpdates.map((post, index) => <article className="ag-update-card" key={post.href + post.title} aria-roledescription="slide" aria-label={`${index + 1} of ${displayUpdates.length}`}>
          <div className="ag-update-image"><Image src={post.image} alt={post.alt} fill sizes="(max-width: 600px) 85vw, (max-width: 1000px) 45vw, 380px" /></div>
          <div className="ag-update-copy"><span className="ag-tag">{post.category}</span><h3>{post.title}</h3><p>{post.text}</p><Link className="ag-text-link" href={post.href}>Read update <ArrowRight size={15} /></Link></div>
        </article>)}
      </div>
      {updatesPageCount > 1 && <div className="ag-updates-dots" role="tablist" aria-label="Choose updates page">
        {Array.from({ length: updatesPageCount }, (_, i) => <button key={i} type="button" role="tab" aria-selected={i === updatesPage} aria-label={`Updates page ${i + 1}`} className={i === updatesPage ? 'is-active' : ''} onClick={() => goToUpdatesPage(i)} />)}
      </div>}
    </div></section>

    <section id="faqs" className="ag-section ag-faqs" aria-labelledby="ag-faqs-title"><div className="ag-container"><Eyebrow>Common questions</Eyebrow><h2 id="ag-faqs-title">Find quick answers.</h2><div className="ag-faq-list">{faqList.map((faq, index) => <details key={faq.question} open={index === 0}><summary><span className="ag-faq-symbol"><Plus className="ag-faq-plus" size={15} /><Minus className="ag-faq-minus" size={15} /></span>{faq.question}<ChevronDown size={17} className="ag-faq-chevron" /></summary><p>{faq.answer}</p></details>)}</div>
      <div className="ag-faq-cta">
        <div>
          <strong>Still have questions about agriculture admissions or universities?</strong>
          <p>Talk directly with our experienced education counsellors.</p>
        </div>
        <button type="button" className="ag-button ag-button--primary" onClick={() => requestGuidance(undefined, 'FAQ Admission Support')}>
          Request free counselling <ArrowRight size={15} />
        </button>
      </div>
    </div></section>

    <section id="guidance" className="ag-section ag-counselling" aria-labelledby="ag-guidance-title"><div className="ag-container"><Eyebrow>Admission counselling</Eyebrow><h2 id="ag-guidance-title">Talk through your next step.</h2><div className="ag-counselling__grid"><AgricoCallbackForm interest={interest} setInterest={setInterest} catalogue={catalogue} /><div className="ag-counselling__copy"><h3>Get personalised guidance on programmes, universities and your admission journey.</h3><p>Our counsellors can help you understand your options, answer your questions and plan your next steps with clarity.</p></div><div className="ag-counselling__art"><span className="ag-counselling-label">B.Sc. Agriculture <ArrowLeftRight size={15} /> Agricultural Engineering</span><AcademicArt cell={5} /></div></div></div></section>

    <dialog
      ref={dialogRef}
      className={`ag-dialog ${dialog?.type === 'enquiry' ? 'ag-dialog--enquiry' : ''}`}
      aria-labelledby="ag-dialog-title"
      onCancel={() => { setDialog(null); setPreviousDialog(null); }}
      onClose={() => { setDialog(null); setPreviousDialog(null); }}
      onClick={event => { if (event.target === event.currentTarget) { setDialog(null); setPreviousDialog(null); } }}
    >
      <button
        type="button"
        className="ag-dialog-close"
        aria-label="Close dialog"
        onClick={() => { setDialog(null); setPreviousDialog(null); }}
      >
        <X size={20} />
      </button>

      <div className="ag-dialog__content">
        {dialog?.type === 'enquiry' && (
          <AgricoModalEnquiryForm
            initialProgrammeId={dialog.programmeId || interest}
            sourceTitle={dialog.sourceTitle}
            catalogue={catalogue}
            hasBack={Boolean(previousDialog)}
            onBack={previousDialog ? () => {
              setDialog(previousDialog);
              setPreviousDialog(null);
            } : undefined}
            onClose={() => {
              setDialog(null);
              setPreviousDialog(null);
            }}
          />
        )}
        {dialogCourse && (
          <>
            <div className="ag-dialog-eyebrow-row">
              <Eyebrow>Programme guide</Eyebrow>
              <button
                type="button"
                className="ag-modal-quick-enquire-btn"
                onClick={() => requestGuidance(dialogCourse.id, dialogCourse.name)}
              >
                <Sprout size={13} /> Enquire Now
              </button>
            </div>
            <h2 id="ag-dialog-title">{dialogCourse.name}</h2>
            <p className="ag-dialog-lead">{dialogCourse.description}</p>
            <div className="ag-dialog-tags">
              <span className="ag-tag">{dialogCourse.level}</span>
              <span className="ag-tag">{dialogCourse.duration}</span>
              <span className="ag-tag ag-tag--accent">Campus Learning</span>
            </div>
            <dl className="ag-dialog-facts">
              {comparisonRows.map(row => (
                <div key={row.key}>
                  <dt>{row.label}</dt>
                  <dd>{dialogCourse[row.key]}</dd>
                </div>
              ))}
            </dl>
            <h3>What to check before applying</h3>
            <p>
              Review the detailed ICAR curriculum, practical facilities (RAWE/ELP), eligibility requirements, fees and participating universities on our dedicated programme guide.
            </p>
            <div className="ag-dialog-actions ag-dialog-actions--programme">
              <Link
                href={programmeGuidePath(dialogCourse.id)}
                className="ag-button ag-button--primary"
                onClick={() => setDialog(null)}
              >
                View full programme guide &amp; syllabus <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="ag-button ag-button--lime"
                onClick={() => requestGuidance(dialogCourse.id, dialogCourse.name)}
              >
                <Sprout size={15} /> Get admission guidance
              </button>
              <button
                type="button"
                className="ag-button ag-button--outline"
                onClick={() => {
                  toggleComparison(dialogCourse.id);
                  setDialog(null);
                }}
              >
                Add to comparison <Plus size={16} />
              </button>
            </div>
            <a className="ag-text-link ag-dialog-source-link" href={dialogCourse.source} target="_blank" rel="noopener noreferrer">
              Official university / regulatory portal <ArrowRight size={14} />
            </a>
          </>
        )}
        {dialogGuide && (
          <>
            <div className="ag-dialog-eyebrow-row">
              <Eyebrow>Student guide</Eyebrow>
              <button
                type="button"
                className="ag-modal-quick-enquire-btn"
                onClick={() => requestGuidance(undefined, dialogGuide.title)}
              >
                <Sprout size={13} /> Talk to a Counsellor
              </button>
            </div>
            <h2 id="ag-dialog-title">{dialogGuide.title}</h2>
            <p className="ag-dialog-lead">{dialogGuide.description}</p>
            {dialogGuide.sections.map(section => (
              <section className="ag-reading-section" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </section>
            ))}
            <a className="ag-text-link" href={dialogGuide.source} target="_blank" rel="noopener noreferrer">
              Explore official education information <ArrowRight size={16} />
            </a>
            <div className="ag-dialog-actions">
              <button
                type="button"
                className="ag-button ag-button--primary"
                onClick={() => requestGuidance(undefined, dialogGuide.title)}
              >
                Talk to a counsellor <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
        {dialogGuide?.id === 'counselling' && (
          <div className="ag-official-resources">
            <h3>Official admission resources</h3>
            {ADMISSION_RESOURCES.map(resource => (
              <a key={resource.title} href={resource.href} target="_blank" rel="noopener noreferrer">
                <span>
                  <strong>{resource.title}</strong>
                  <small>{resource.description}</small>
                </span>
                <ArrowRight size={17} />
              </a>
            ))}
          </div>
        )}
        {dialog?.type === 'comparison' && (
          <>
            <Eyebrow>Programme comparison</Eyebrow>
            <h2 id="ag-dialog-title">Compare your study pathways.</h2>
            <div className="ag-full-comparison">
              <table>
                <thead>
                  <tr>
                    <th>What to compare</th>
                    {selectedCourses.map(course => <th key={course.id}>{course.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Study level</th>
                    {selectedCourses.map(course => <td key={course.id}>{course.level}</td>)}
                  </tr>
                  {comparisonRows.map(row => (
                    <tr key={row.key}>
                      <th>{row.label}</th>
                      {selectedCourses.map(course => <td key={course.id}>{course[row.key]}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <th>Admission details</th>
                    {selectedCourses.map(course => (
                      <td key={course.id}>
                        <a href={course.source} target="_blank" rel="noopener noreferrer">Official requirements ↗</a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="ag-dialog-note">
              Use this as a starting point, then check programme-specific details with the university.
            </p>
            <button
              type="button"
              className="ag-button ag-button--primary"
              onClick={() => requestGuidance(undefined, 'Programme Comparison')}
            >
              Discuss your options <ArrowRight size={16} />
            </button>
          </>
        )}
        {dialog?.type === 'universities' && (
          <>
            <Eyebrow>Your university shortlist</Eyebrow>
            <h2 id="ag-dialog-title">Compare your university options.</h2>
            <div className="ag-university-modal-grid">
              {officialUniversities
                .filter(university => selectedUniversities.includes(university.id))
                .map(university => (
                  <article key={university.id}>
                    {university.logo ? (
                      <div className="ag-university-logo-box" style={{ width: '70px', height: '50px', margin: '0 auto 12px' }}>
                        <Image
                          src={university.logo}
                          alt={university.name}
                          width={60}
                          height={42}
                          className="ag-university-logo-img"
                          unoptimized={university.logo.endsWith('.svg') || university.logo.endsWith('.webp')}
                        />
                      </div>
                    ) : (
                      <span className="ag-university-mark">{university.mark}</span>
                    )}
                    <h3>{university.name}</h3>
                    <p><MapPin size={15} />{university.location || university.state}</p>
                    <ul>
                      <li>Review the programme curriculum</li>
                      <li>Explore laboratories and campus facilities</li>
                      <li>Check current fees and eligibility</li>
                      <li>Confirm the official admission process</li>
                    </ul>
                    <a
                      href={university.href}
                      target={university.external ? '_blank' : undefined}
                      rel={university.external ? 'noopener noreferrer' : undefined}
                      className="ag-text-link"
                    >
                      View university <ArrowRight size={15} />
                    </a>
                  </article>
                ))}
            </div>
            <button
              type="button"
              className="ag-button ag-button--primary"
              onClick={() => requestGuidance(undefined, 'University Shortlist')}
            >
              Get help with your shortlist <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </dialog>
  </div>;
}

function AgricoCallbackForm({ interest, setInterest, catalogue }: { interest: string; setInterest: (value: string) => void; catalogue: Offering[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, { status: 'idle', message: '' });
  const selected = PROGRAMMES.find(programme => programme.id === interest);
  const offering = selected ? catalogue.find(item => courseMatches(selected, item.degree + ' ' + item.fullName)) : null;
  const invalid = (field: string) => state.invalid?.includes(field);
  if (state.status === 'success') return <div className="ag-form-success" role="status"><CheckCircle2 size={36} /><h3>We have your request.</h3><p>{state.message}</p><p>Keep your programme questions and academic details handy for your conversation.</p></div>;
  return <form action={action} className="ag-callback-form" aria-busy={pending}>
    <input type="hidden" name="source" value="homepage-callback" /><input type="hidden" name="program" value={offering?.programSlug || ''} /><input type="hidden" name="university" value="" /><input type="hidden" name="message" value={selected ? 'Agrico programme interest: ' + selected.name : 'Agrico agriculture education and admission guidance enquiry.'} />
    <div className="ag-form-grid"><label htmlFor="ag-full-name">Full name<input id="ag-full-name" name="name" autoComplete="name" placeholder="Enter your full name" required minLength={2} maxLength={120} aria-invalid={invalid('name')} aria-describedby={invalid('name') ? 'ag-form-status' : undefined} /></label><label htmlFor="ag-mobile-number">Mobile number<input id="ag-mobile-number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter your mobile number" required minLength={8} maxLength={20} aria-invalid={invalid('phone')} aria-describedby={invalid('phone') ? 'ag-form-status' : undefined} /></label><label htmlFor="ag-programme-interest" className="ag-form-wide">Programme of interest<select id="ag-programme-interest" name="interest" value={interest} onChange={event => setInterest(event.target.value)}><option value="">Select a programme</option>{PROGRAMMES.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label></div>
    <label className="ag-form-consent"><input type="checkbox" name="consent" required aria-invalid={invalid('consent')} /><span>I agree to be contacted by the Agrico team for counselling and guidance. <Link href="/privacy-policy">Privacy policy</Link></span></label>
    {state.message && <p id="ag-form-status" className="ag-form-status" role="alert">{state.message}</p>}
    <button type="submit" className="ag-button" disabled={pending}>{pending ? <><LoaderCircle size={16} className="ag-spin" />Sending your request…</> : <>Request a callback <ArrowRight size={15} /></>}</button>
  </form>;
}

function AgricoModalEnquiryForm({
  initialProgrammeId,
  sourceTitle,
  catalogue,
  onClose,
  onBack,
  hasBack,
}: {
  initialProgrammeId?: string;
  sourceTitle?: string;
  catalogue: Offering[];
  onClose: () => void;
  onBack?: () => void;
  hasBack?: boolean;
}) {
  const [interest, setInterest] = useState(initialProgrammeId || '');
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, { status: 'idle', message: '' });
  const selected = PROGRAMMES.find(p => p.id === interest);
  const offering = selected ? catalogue.find(item => courseMatches(selected, item.degree + ' ' + item.fullName)) : null;
  const invalid = (field: string) => state.invalid?.includes(field);

  if (state.status === 'success') {
    return (
      <div className="ag-modal-success" role="status">
        <div className="ag-modal-success__icon">
          <CheckCircle2 size={44} />
        </div>
        <h3>Request Received!</h3>
        <p className="ag-modal-success__lead">
          {state.message || 'Thanks for reaching out!'}
        </p>
        <p className="ag-modal-success__desc">
          An Agrico agriculture education counsellor will contact you shortly on your provided mobile number to help with your admission questions.
        </p>
        <div className="ag-modal-success__details">
          {selected && <div><strong>Selected Programme:</strong> {selected.name} ({selected.level})</div>}
          <div><strong>Next step:</strong> Keep your academic qualifications and questions ready for your counselling session.</div>
        </div>
        <button type="button" className="ag-button ag-button--primary" onClick={onClose}>
          Done <CheckCircle2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="ag-modal-enquiry">
      {hasBack && onBack && (
        <button type="button" className="ag-modal-back-btn" onClick={onBack}>
          <ChevronLeft size={16} /> Back to details
        </button>
      )}

      <div className="ag-modal-enquiry__header">
        <span className="ag-modal-enquiry__badge">
          <Sprout size={14} /> Free Admission Guidance
        </span>
        <h2 id="ag-dialog-title">
          {sourceTitle ? `Enquire for ${sourceTitle}` : 'Speak with an Agriculture Counsellor'}
        </h2>
        <p className="ag-modal-enquiry__sub">
          Get personalised clarity on curriculum, ICAR recognition, university cut-offs, fee structures, and application timelines.
        </p>
      </div>

      <form action={action} className="ag-modal-form" aria-busy={pending}>
        <input type="hidden" name="source" value="homepage-modal-callback" />
        <input type="hidden" name="program" value={offering?.programSlug || interest || ''} />
        <input type="hidden" name="university" value="" />
        <input
          type="hidden"
          name="message"
          value={
            selected
              ? `Agrico modal enquiry: ${selected.name} (${sourceTitle || 'General'})`
              : `Agrico agriculture admission enquiry: ${sourceTitle || 'General'}`
          }
        />

        <div className="ag-modal-form__grid">
          <label className="ag-modal-field">
            <span className="ag-modal-label">Your full name <span className="ag-req">*</span></span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              required
              minLength={2}
              maxLength={120}
              aria-invalid={invalid('name')}
            />
            {invalid('name') && <span className="ag-field-err">Please enter your full name</span>}
          </label>

          <label className="ag-modal-field">
            <span className="ag-modal-label">Mobile number <span className="ag-req">*</span></span>
            <div className="ag-phone-input-wrap">
              <span className="ag-phone-prefix">+91</span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                required
                minLength={8}
                maxLength={15}
                aria-invalid={invalid('phone')}
              />
            </div>
            {invalid('phone') && <span className="ag-field-err">Please enter a valid mobile number</span>}
          </label>

          <label className="ag-modal-field ag-modal-field--full">
            <span className="ag-modal-label">Programme of interest</span>
            <select
              name="interest"
              value={interest}
              onChange={e => setInterest(e.target.value)}
              className="ag-modal-select"
            >
              <option value="">General Agriculture Guidance</option>
              {PROGRAMMES.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.level})
                </option>
              ))}
            </select>
          </label>

          <label className="ag-modal-field">
            <span className="ag-modal-label">Your city / state <small className="ag-opt">(Optional)</small></span>
            <input
              name="city"
              type="text"
              placeholder="e.g. Ludhiana, Punjab"
              maxLength={80}
            />
          </label>

          <label className="ag-modal-field">
            <span className="ag-modal-label">Email address <small className="ag-opt">(Optional)</small></span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. student@gmail.com"
              aria-invalid={invalid('email')}
            />
            {invalid('email') && <span className="ag-field-err">Please enter a valid email</span>}
          </label>
        </div>

        <label className="ag-modal-consent">
          <input type="checkbox" name="consent" defaultChecked required aria-invalid={invalid('consent')} />
          <span>
            I agree to receive counselling assistance &amp; admission updates from Agrico. <Link href="/privacy-policy" target="_blank">Privacy policy</Link>
          </span>
        </label>

        {state.message && (
          <p className="ag-form-status--modal" role="alert">
            {state.message}
          </p>
        )}

        <div className="ag-modal-actions">
          <button type="submit" className="ag-button ag-button--primary ag-modal-submit" disabled={pending}>
            {pending ? (
              <>
                <LoaderCircle size={16} className="ag-spin" /> Submitting request…
              </>
            ) : (
              <>
                Request Free Counselling <ArrowRight size={16} />
              </>
            )}
          </button>
          <button type="button" className="ag-button ag-button--outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
