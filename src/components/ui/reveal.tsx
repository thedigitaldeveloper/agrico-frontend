'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Fades a section up as it enters the viewport.
 *
 * The element is only ever hidden once this component has decided it can
 * animate — the server renders it visible, and the hidden state is applied on
 * mount. That ordering matters: a reveal that starts hidden in the HTML stays
 * hidden forever if the observer never fires, and takes the section's content
 * with it.
 *
 * The hidden state is written to the node's own style rather than held in
 * React state. It is a visual detail with no bearing on what renders, so
 * putting it in state would cost a second render pass per section for nothing —
 * and this is what an effect is actually for: driving a browser API.
 *
 * Nothing here runs for someone who asked not to be moved: reduced motion, and
 * browsers without IntersectionObserver, are left with the section as rendered.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Milliseconds, for staggering siblings. Keep it under ~200 or it drags. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // Already on screen at mount — above the fold, or a deep link. Animating it
    // in would mean starting the page half-blank.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    const show = () => {
      element.style.opacity = '';
      element.style.transform = '';
    };

    element.style.opacity = '0';
    element.style.transform = 'translateY(12px)';
    if (delay) element.style.transitionDelay = `${delay}ms`;

    let delivered = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        delivered = true;
        if (!entry.isIntersecting) return;
        show();
        observer.disconnect();
      },
      // Fires a little before the edge, so the movement finishes as the section
      // arrives rather than starting once it is already being read.
      { rootMargin: '0px 0px -12% 0px' }
    );

    observer.observe(element);

    /**
     * The escape hatch, and the reason this is safe to use on whole sections.
     *
     * A live page always delivers a first callback — intersecting or not —
     * within a frame or two of observe(). Somewhere that never renders (a
     * background tab, a throttled embed, a headless capture) delivers nothing
     * at all, and without this the section would stay at opacity 0 for good.
     * Losing the animation is nothing; losing the content is the whole page.
     */
    const guard = setTimeout(() => {
      if (!delivered) show();
    }, 500);

    return () => {
      clearTimeout(guard);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out',
        className
      )}
    >
      {children}
    </div>
  );
}
