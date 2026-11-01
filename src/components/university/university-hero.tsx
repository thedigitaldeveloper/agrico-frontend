'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Download, MapPin, MessageCircle, Pause, Play, Scale, Share2, Star } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useEnquiryModal } from './university-enquiry-modal';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import { mediaUrl, resolveImage, resolveThumbnail } from '@/lib/cms/media';
import type { UniversityDetail } from '@/lib/cms/repositories/university';
import type { Crumb } from '@/lib/seo/schemas';

export function UniversityHero({ university, trail, title }: {
  university: UniversityDetail; trail: Crumb[]; title?: string;
}) {
  const { openModal } = useEnquiryModal();
  const { whatsappNumber } = useSiteSettings();
  const [shareMessage, setShareMessage] = useState('');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const logo = resolveThumbnail(university.card_logo || university.logo, 160, university.name);
  const location = [university.city, university.state].filter(Boolean).join(', ');
  const established = university.established_year ?? university.establish?.slice(0, 4);
  const brochure = mediaUrl(university.brochure?.url);
  const contact = (university.whatsapp_number || whatsappNumber || '').replace(/\D/g, '');
  const whatsappHref = contact ? 'https://wa.me/' + contact + '?text=' + encodeURIComponent('Hi Agrico, I would like admission and programme information for ' + university.name + '.') : null;
  const slides = useMemo(() => {
    const primary = resolveImage(university.image, university.name);
    const media = [
      ...(primary ? [{ ...primary, mobile: null as string | null, caption: university.image?.caption || '' }] : []),
      ...(university.banners ?? []).flatMap(banner => {
        const image = resolveImage(banner.desktop_image ?? banner.mobile_image, banner.heading || university.name);
        return image ? [{ ...image, mobile: resolveImage(banner.mobile_image)?.src ?? null, caption: banner.heading || '' }] : [];
      }),
    ];
    const seen = new Set<string>();
    return media.filter(item => !seen.has(item.src) && Boolean(seen.add(item.src)));
  }, [university.image, university.banners, university.name]);
  const visible = active % Math.max(1, slides.length);
  const slide = slides[visible];

  useEffect(() => {
    if (paused || hovered || focused || slides.length < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      if (timer) clearInterval(timer);
      if (!motion.matches) timer = setInterval(() => setActive(value => (value + 1) % slides.length), 5000);
    };
    sync();
    motion.addEventListener('change', sync);
    return () => { if (timer) clearInterval(timer); motion.removeEventListener('change', sync); };
  }, [paused, hovered, focused, slides.length]);

  function enquire(source: 'application-form' | 'counselling') {
    openModal({
      universitySlug: university.slug, universityName: university.name, source,
      title: source === 'application-form' ? 'Apply to ' + university.name : 'Admission guidance — ' + university.name,
      subtitle: 'Discuss your programme, eligibility and the next admission steps.',
    });
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: university.name, url: window.location.href }); return; }
      catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage('Link copied'); }
    catch { setShareMessage('Copy this page address to share it.'); }
  }

  return <header className="rs-ud-hero">
    <div className="container-page">
      <div className="rs-ud-topline">
        <Breadcrumbs items={trail} />
        <div className="rs-ud-utility">
          <Link href={'/compare?u=' + encodeURIComponent(university.slug)}><Scale size={16} aria-hidden="true" />Compare</Link>
          <button type="button" onClick={share}><Share2 size={16} aria-hidden="true" />Share</button>
          {shareMessage ? <span role="status">{shareMessage}</span> : null}
        </div>
      </div>
      <div className={'rs-ud-hero-grid' + (!slide ? ' rs-ud-without-gallery' : '')}>
        <div className="rs-ud-introduction">
          <p className="rs-ud-eyebrow">University guide</p>
          <div className="rs-ud-title-row">
            <div className="rs-ud-logo" data-wordmark={!university.card_logo} data-university={university.slug}>
              {logo ? <Image src={logo.src} alt="" fill sizes="80px" priority /> : <span aria-hidden="true">{university.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>}
            </div>
            <div>
              <h1>{title || university.heading || university.name}</h1>
              {(title || university.heading) && (title || university.heading) !== university.name ? <p className="rs-ud-official-name">{university.name}</p> : null}
              {university.full_name && university.full_name !== university.name && university.full_name !== title ? <p className="rs-ud-full-name">{university.full_name}</p> : null}
            </div>
          </div>
          <div className="rs-ud-meta">
            {location ? <span><MapPin size={16} aria-hidden="true" />{location}</span> : null}
            {established ? <span><CalendarDays size={16} aria-hidden="true" />Established {established}</span> : null}
            {university.ownership_type ? <span>{university.ownership_type.name}</span> : null}
            {university.rating !== null && Number.isFinite(Number(university.rating)) ? <span><Star size={15} aria-hidden="true" />Rating {Number(university.rating).toFixed(1)}</span> : null}
          </div>
          {university.course_modes.length || university.tag ? <div className="rs-ud-tags">
            {university.course_modes.map(mode => <span key={mode.documentId}>{mode.name}</span>)}
            {university.tag ? <span>{university.tag.name}</span> : null}
          </div> : null}
          {university.approvals.length ? <div className="rs-ud-recognitions">
            <p>Approvals &amp; recognition</p>
            <ul>{university.approvals.map(approval => {
              const mark = resolveThumbnail(approval.logo, 64, approval.name);
              return <li key={approval.documentId}>{mark ? <Image src={mark.src} width={25} height={25} alt="" /> : null}<span>{approval.name}</span></li>;
            })}</ul>
          </div> : null}
          <div className="rs-ud-hero-actions">
            {university.show_apply_button ? <button type="button" className="rs-ud-button" onClick={() => enquire('application-form')}>{university.apply_button_text || 'Apply to university'}<ArrowRight size={17} aria-hidden="true" /></button> : null}
            <button type="button" className="rs-ud-button rs-ud-button-outline" onClick={() => enquire('counselling')}>Talk to a counsellor</button>
          </div>
          <div className="rs-ud-downloads">
            {brochure ? <a href={brochure} target="_blank" rel="noopener noreferrer"><Download size={16} aria-hidden="true" />Download brochure</a> : null}
            {whatsappHref ? <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a> : null}
          </div>
        </div>
        {slide ? <figure className="rs-ud-gallery" aria-label={'University media for ' + university.name}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          <div className="rs-ud-gallery-image">
            <picture>
              {slide.mobile ? <source media="(max-width:640px)" srcSet={slide.mobile} /> : null}
              <Image key={slide.src} src={slide.src} alt={slide.alt} fill sizes="(max-width:900px) 100vw, 44vw" priority={visible === 0} />
            </picture>
          </div>
          {slide.caption || slides.length > 1 ? <figcaption>
            {slide.caption ? <p>{slide.caption}</p> : <span className="rs-ud-gallery-label">University gallery</span>}
            {slides.length > 1 ? <div className="rs-ud-gallery-controls">
              <button type="button" aria-label="Previous university image" onClick={() => setActive(value => (value - 1 + slides.length) % slides.length)}><ChevronLeft size={18} aria-hidden="true" /></button>
              <span aria-live={paused || hovered || focused ? 'polite' : 'off'}>{visible + 1} / {slides.length}</span>
              <button type="button" aria-label="Next university image" onClick={() => setActive(value => (value + 1) % slides.length)}><ChevronRight size={18} aria-hidden="true" /></button>
              <button type="button" aria-label={paused ? 'Play university gallery' : 'Pause university gallery'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
            </div> : null}
          </figcaption> : null}
        </figure> : null}
      </div>
    </div>
  </header>;
}
