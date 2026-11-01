'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Monitor, Pause, Play, X } from 'lucide-react';
import { SlideMedia, usePrefersReducedMotion, type HeroMedia } from '@/components/home/hero-carousel';
import { EnquireLink } from './home-interactions';
import { UniversityIdentity } from './offering-card';
import type { HomeSlide, Offering } from './home-types';
import { heroSelection } from './hero-selection';
import './hero-compact.css';

export function RsHero({ slides, offerings, catalogue = offerings, preview = false }: {
  slides: HomeSlide[];
  offerings: Offering[];
  catalogue?: Offering[];
  preview?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const engaged = hovered || focused;
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoSource, setVideoSource] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  // The hero is a curated shelf: its choices come from CMS-selected offerings,
  // while the full catalogue remains available on the listing page.
  const slide = slides[index % Math.max(slides.length, 1)];
  const { choices, selectedChoice, featured, activeChoiceKey } = heroSelection({ offerings, catalogue, slide, choice });

  useEffect(() => {
    if (slides.length < 2 || paused || engaged || reducedMotion || videoOpen) return;
    const timer = window.setInterval(() => setIndex((n) => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, engaged, reducedMotion, videoOpen]);

  useEffect(() => {
    const element = dialog.current;
    if (videoOpen) element?.showModal();
    else element?.close();
  }, [videoOpen]);

  if (!slide) return null;
  const media: HeroMedia = slide.media || (slide.image ? {
    kind: 'image',
    picture: { desktop: { src: slide.image, alt: slide.alt, width: null, height: null }, mobile: null },
  } : { kind: 'none' });
  const video = media.kind === 'video' || media.kind === 'youtube';
  const hasActions = Boolean((slide.href && slide.ctaLabel) || video);
  const hasControls = slides.length > 1 || media.kind === 'video';
  const go = (step: number) => setIndex((n) => (n + step + slides.length) % slides.length);
  const linkProps = { target: slide.newTab ? '_blank' : undefined, rel: slide.newTab ? 'noopener noreferrer' : undefined };
  function openVideo() {
    if (media.kind === 'video') {
      // Match the inherited background media breakpoint when choosing the
      // authored mobile video; keep playback stable if the viewport changes.
      setVideoSource(!window.matchMedia('(min-width: 1024px)').matches && media.mobileSrc ? media.mobileSrc : media.src);
    }
    setVideoOpen(true);
  }

  return (
    <section className="rs-hero rs-hero-compact" aria-label="Explore your next step" aria-roledescription={slides.length > 1 ? 'carousel' : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onPointerDown={(event) => {
        swipeStart.current = null;
        const control = event.target instanceof Element ? event.target.closest('a, button, form, input, select, textarea, video, iframe, dialog') : null;
        if (event.pointerType !== 'touch' || videoOpen || (control && !control.classList.contains('rs-hero-surface-link'))) return;
        swipeStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      }}
      onPointerUp={(event) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (!start || start.pointerId !== event.pointerId || slides.length < 2) return;
        const delta = event.clientX - start.x;
        if (Math.abs(delta) > 48 && Math.abs(delta) > Math.abs(event.clientY - start.y)) go(delta < 0 ? 1 : -1);
      }}
      onPointerCancel={() => { swipeStart.current = null; }}>
      <div className="rs-hero-media" key={slide.id}>
        {media.kind !== 'none' ? <SlideMedia media={media} active={!paused && !videoOpen} priority={index === 0} playing={false} reducedMotion={reducedMotion} label={slide.heading} /> : null}
        {slide.href ? <Link href={slide.href} {...linkProps} className="rs-hero-surface-link" aria-label={slide.ctaLabel || slide.heading || 'Explore this programme'} /> : null}
      </div>
      <div className="rs-container rs-hero-grid">
        <div className="rs-hero-copy">
          {slide.eyebrow ? <p className="rs-eyebrow">{slide.eyebrow}</p> : null}
          <h1 className={slide.heading ? undefined : 'sr-only'}>
            {slide.heading === 'Your degree. Your next big move.' ? <>Your degree.<br /><em>Your next big move.</em></> : slide.heading || 'Explore university programmes'}
          </h1>
          {slide.description ? <p className="rs-hero-description">{slide.description}</p> : null}
          {choices.length ? <div className="rs-hero-finder" aria-describedby="rs-finder-hint">
            <p id="rs-finder-label">Choose your programme</p>
            <div className="rs-hero-tabs" role="group" aria-labelledby="rs-finder-label">
              {choices.map(option => <button key={option.key} type="button" aria-pressed={activeChoiceKey === option.key} onClick={() => setChoice(option.key)}>{option.label}</button>)}
            </div>
            <p id="rs-finder-hint" className="rs-finder-hint">Select a programme to see its featured university.</p>
          </div> : <Link href="/programs" className="rs-button">Explore programmes <ArrowRight size={18} /></Link>}
          {hasActions || hasControls ? <div className="rs-hero-footer">
          {hasActions ? <div className="rs-hero-actions">
            {slide.href && slide.ctaLabel ? <Link href={slide.href} {...linkProps} className="rs-text-link">{slide.ctaLabel} <ArrowRight size={16} /></Link> : null}
            {video ? <button type="button" className="rs-text-link" onClick={openVideo}><Play size={16} /> Watch video</button> : null}
          </div> : null}
          {hasControls ? <div className="rs-hero-controls">
            {slides.length > 1 ? <><button type="button" onClick={() => go(-1)} aria-label="Previous slide"><ChevronLeft size={18} /></button><span aria-live={paused || engaged ? 'polite' : 'off'}>{index % slides.length + 1} / {slides.length}</span><button type="button" onClick={() => go(1)} aria-label="Next slide"><ChevronRight size={18} /></button></> : null}
            {!reducedMotion ? <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume slideshow and background video' : 'Pause slideshow and background video'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button> : null}
          </div> : null}
          </div> : null}
        </div>
        {featured ? <div className="rs-hero-offer">
          <span className="rs-eyebrow">{selectedChoice ? 'Your selection' : 'Featured programme'}</span>
          <UniversityIdentity offering={featured} preview={preview} className="rs-hero-offer-university" />
          <h2>{featured.degree}</h2>
          <div className="rs-inline-facts"><span><Monitor size={15} />{featured.mode}</span><span><Clock3 size={15} />{featured.duration}</span></div>
          {preview ? <EnquireLink offering={featured} className="rs-button">View fees &amp; eligibility <ArrowRight size={16} /></EnquireLink> : <Link href={featured.href} className="rs-button">View fees &amp; eligibility <ArrowRight size={16} /></Link>}
          {!preview ? <Link href={'/university/' + featured.universitySlug} className="rs-text-link rs-hero-university-link">Explore this university <ArrowRight size={15} /></Link> : null}
        </div> : null}
      </div>
      {video ? <dialog ref={dialog} className="rs-hero-video-dialog" onCancel={() => setVideoOpen(false)} onClose={() => setVideoOpen(false)} aria-label={slide.heading || 'Programme video'}>
        <button type="button" className="rs-button" onClick={() => setVideoOpen(false)} aria-label="Close video"><X size={18} /> Close</button>
        {videoOpen && media.kind === 'video' ? <video src={videoSource || media.src} controls autoPlay playsInline /> : null}
        {videoOpen && media.kind === 'youtube' ? <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(media.videoId)}?autoplay=1&rel=0`} title={slide.heading || 'Programme video'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : null}
      </dialog> : null}
    </section>
  );
}
