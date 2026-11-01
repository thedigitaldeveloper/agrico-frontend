'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './content-carousel.css';

/** Server-rendered content, native scrolling and a small shared navigation controller. */
export function RsContentCarousel({ children, itemKeys, label, pages = false }: {
  children: ReactNode[];
  itemKeys: string[];
  label: string;
  pages?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const hintId = useId();
  const order = JSON.stringify(itemKeys);
  const [position, setPosition] = useState({ previous: false, next: false });
  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
        const left = Math.max(0, Math.min(track.scrollLeft, maximum));
        const next = { previous: left > 2, next: left < maximum - 2 };
        setPosition(current => current.previous === next.previous && current.next === next.next ? current : next);
      });
    };
    track.scrollTo({ left: 0, behavior: 'instant' });
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    Array.from(track.children).forEach(child => observer.observe(child));
    track.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); track.removeEventListener('scroll', measure); };
  }, [order]);
  function advance(direction: -1 | 1) {
    const track = ref.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const origin = cards[0]?.offsetLeft ?? 0;
    const starts = cards.map(card => card.offsetLeft - origin);
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = Math.max(0, Math.min(track.scrollLeft, max));
    const destination = direction === 1 ? starts.find(start => start > left + 2) ?? max : starts.reverse().find(start => start < left - 2) ?? 0;
    track.scrollTo({ left: Math.max(0, Math.min(destination, max)), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  if (!children.length) return null;
  return <div className={'rs-content-carousel' + (pages ? ' rs-content-pages' : '')} role="region" aria-roledescription="carousel" aria-label={label}>
    <p className="sr-only" id={hintId}>Swipe to browse {label.toLowerCase()}, or focus the row and use the arrow keys.</p>
    <div className="rs-content-track" ref={ref} id={id} tabIndex={0} aria-describedby={hintId} aria-label={label + ' cards'} onKeyDown={event => {
      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); advance(event.key === 'ArrowLeft' ? -1 : 1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'instant' }); }
    }}>{children.map((child, index) => <div className="rs-content-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${children.length}`} key={itemKeys[index]}>{child}</div>)}</div>
    <div className="rs-content-controls" hidden={!position.previous && !position.next}>
      <button type="button" aria-label={'Previous ' + label.toLowerCase()} aria-controls={id} disabled={!position.previous} onClick={() => advance(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
      <button type="button" aria-label={'Next ' + label.toLowerCase()} aria-controls={id} disabled={!position.next} onClick={() => advance(1)}><ChevronRight size={22} aria-hidden="true" /></button>
    </div>
  </div>;
}
