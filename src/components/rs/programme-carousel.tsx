'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './programme-carousel.css';

interface ScrollPosition { previous: boolean; next: boolean; first: number; last: number }

/** Native scrolling keeps touch, trackpad and focus navigation usable without autoplay. */
export function ProgrammeCarousel<T extends { id: string }>({ items, renderItem, resetKey, containerRef, footer }: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  resetKey: string;
  containerRef?: Ref<HTMLDivElement>;
  footer?: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const hintId = useId();
  const itemIds = JSON.stringify(items.map(item => item.id));
  const [position, setPosition] = useState<ScrollPosition>({ previous: false, next: false, first: 1, last: 1 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      const cards = Array.from(track.children) as HTMLElement[];
      const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = Math.max(0, Math.min(track.scrollLeft, maximum));
      const origin = cards[0]?.offsetLeft ?? 0;
      const visible = cards.flatMap((card, index) => {
        const start = card.offsetLeft - origin;
        return start + card.offsetWidth > left + 2 && start < left + track.clientWidth - 2 ? [index + 1] : [];
      });
      const next = {
        previous: left > 2, next: left < maximum - 2,
        first: visible[0] ?? 1, last: visible[visible.length - 1] ?? cards.length,
      };
      setPosition(current => current.previous === next.previous && current.next === next.next &&
        current.first === next.first && current.last === next.last ? current : next);
    };
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    // Filter changes and CMS reordering start at the first selected product.
    track.scrollTo({ left: 0, behavior: 'instant' });
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(track);
    Array.from(track.children).forEach(card => observer.observe(card));
    track.addEventListener('scroll', scheduleMeasure, { passive: true });
    scheduleMeasure();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener('scroll', scheduleMeasure);
    };
  }, [itemIds, resetKey]);

  function advance(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const origin = cards[0]?.offsetLeft ?? 0;
    const starts = cards.map(card => card.offsetLeft - origin);
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = Math.max(0, Math.min(track.scrollLeft, maximum));
    const next = direction === 1
      ? starts.find(start => start > left + 2) ?? maximum
      : starts.reverse().find(start => start < left - 2) ?? 0;
    track.scrollTo({
      left: Math.max(0, Math.min(next, maximum)),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  if (!items.length) return null;
  return <div className="rs-programme-carousel" ref={containerRef} role="region" aria-roledescription="carousel" aria-label="Selected university programmes">
    <p className="sr-only" id={hintId}>Swipe to browse programmes, or focus this carousel and use the left and right arrow keys.</p>
    <div className="rs-programme-track" id={trackId} ref={trackRef} tabIndex={0} aria-label="Programme cards" aria-describedby={hintId}
      onKeyDown={event => {
        // Leave links, checkboxes and other card controls' keyboard behavior intact.
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          advance(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      {items.map((item, index) => <div className="rs-programme-slide" key={item.id} role="group" aria-roledescription="slide" aria-label={(index + 1) + ' of ' + items.length}>
        {renderItem(item)}
      </div>)}
    </div>
    <div className="rs-programme-carousel-footer" hidden={!footer && !position.previous && !position.next}>
      {footer}
      <div className="rs-programme-carousel-controls" hidden={!position.previous && !position.next}>
      <button type="button" className="rs-carousel-previous" aria-label="Previous programmes" aria-controls={trackId} disabled={!position.previous} onClick={() => advance(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
      <p className="sr-only" role="status" aria-live="polite">Showing programmes {position.first} to {position.last} of {items.length}.</p>
      <button type="button" className="rs-carousel-next" aria-label="Next programmes" aria-controls={trackId} disabled={!position.next} onClick={() => advance(1)}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}
