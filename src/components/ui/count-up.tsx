'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts a number up when it scrolls into view.
 *
 * The final value is what the server renders and what the DOM holds until the
 * animation is ready to start, so a crawler — and anyone whose browser skips
 * the animation — reads the real figure rather than a zero.
 *
 * Takes the number and its decoration separately rather than parsing "1,000+":
 * the suffix would otherwise have to be split back off a formatted string on
 * every frame.
 */
export function CountUp({
  value,
  suffix = '',
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // Ease-out cubic: most of the distance is covered early, so the
          // number lands rather than crawling to a stop.
          const eased = 1 - (1 - progress) ** 3;
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        setShown(0);
        frame = requestAnimationFrame(step);
      },
      { rootMargin: '0px 0px -15% 0px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {shown.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
