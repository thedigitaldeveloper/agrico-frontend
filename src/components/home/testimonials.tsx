'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, UserCheck, GraduationCap } from 'lucide-react';

import { resolveThumbnail } from '@/lib/cms/media';
import type { TestimonialCard } from '@/lib/cms/repositories/testimonial';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';

export function Testimonials({
  items,
  config,
}: {
  items: TestimonialCard[];
  config?: SectionHeaderConfig | null;
}) {
  const testimonials = items ?? [];
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const dragStartX = useRef<number | null>(null);


  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description =
    config?.description ?? '';
  const badges = config?.badges && config.badges.length > 0 ? config.badges : null;

  // Update visible card count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const visibleIndex = Math.min(index, maxIndex);

  const next = useCallback(() => {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1));
  }, [maxIndex]);

  // Automatic slide rotation in loop (every 4.5 seconds)
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = setInterval(() => {
      next();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex, next]);

  if (testimonials.length === 0) return null;
  return (
    <section
      className="relative overflow-hidden border-y border-ink-200/60 bg-gradient-to-b from-white via-ink-50/40 to-white py-6 sm:py-8 lg:py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="container-page">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          {/* Subtle Ambient Radial Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-emerald-50/80 blur-2xl -z-10"
          />

          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase ring-1 ring-emerald-200/80 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <CheckCircle2 className="size-2.5 text-emerald-600 sm:size-3" />
              {eyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-emerald-300 to-emerald-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-ink-900 text-balance sm:text-2xl lg:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-ink-600 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}

          {/* Micro-Badges (Horizontal Compact) */}
          {badges && badges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-ink-600 sm:mt-3 sm:gap-2 sm:text-2xs">
              {badges.map((b: string, idx: number) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white px-2 py-0.5 text-ink-700 shadow-2xs sm:px-2.5 sm:py-1"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      idx % 3 === 0 ? 'bg-gold-500' : idx % 3 === 1 ? 'bg-emerald-500' : 'bg-brand-600'
                    }`}
                  />
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Carousel Container with Floating Left & Right Arrows */}
        <div className="relative px-2 sm:px-6 lg:px-8">
          {/* Floating Left Arrow */}
          <button
            type="button"
            aria-label="Previous review"
            onClick={prev}
            className="absolute -left-2 sm:-left-3 lg:-left-5 top-1/2 z-20 flex size-10 sm:size-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200/90 bg-white/95 text-ink-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>

          {/* Floating Right Arrow */}
          <button
            type="button"
            aria-label="Next review"
            onClick={next}
            className="absolute -right-2 sm:-right-3 lg:-right-5 top-1/2 z-20 flex size-10 sm:size-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200/90 bg-white/95 text-ink-800 shadow-md backdrop-blur-xs transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="size-5 sm:size-6" />
          </button>

          {/* Sliding Track Viewport */}
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              dragStartX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (dragStartX.current === null) return;
              const delta = e.clientX - dragStartX.current;
              dragStartX.current = null;
              if (Math.abs(delta) > 40) {
                if (delta < 0) next();
                else prev();
              }
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${visibleIndex * (100 / visibleCount)}%)`,
              }}
            >
              {testimonials.map((item, idx) => (
                <div
                  key={item.documentId || idx}
                  className="w-full shrink-0 px-2 sm:w-1/2 sm:px-2.5 lg:w-1/3 lg:px-3"
                >
                  <TestimonialCardItem item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Dot Indicators */}
        {maxIndex > 0 ? (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, dot) => (
              <button
                key={dot}
                type="button"
                aria-label={`Go to slide ${dot + 1}`}
                aria-current={dot === visibleIndex}
                onClick={() => setIndex(dot)}
                className="h-2 rounded-full transition-all duration-300 aria-[current=true]:w-8 aria-[current=true]:bg-brand-800 aria-[current=false]:w-2 aria-[current=false]:bg-ink-200 hover:bg-ink-400"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TestimonialCardItem({ item }: { item: TestimonialCard }) {
  const photo = resolveThumbnail(item.photo, 96, item.name);

  return (
    <figure className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-card-hover">
      <div>
        {/* Top Badges: Quote Icon + Rating Stars */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gold-50 text-gold-600 ring-1 ring-gold-200/80 ring-inset">
            <Quote className="size-4 fill-current" />
          </div>

          {item.rating != null ? <div className="flex items-center gap-1 rounded-full bg-amber-50/80 px-2.5 py-1 text-2xs font-bold text-amber-900 ring-1 ring-amber-200/60 ring-inset">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  className={`size-3 ${
                    star < (item.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-ink-200 text-ink-200'
                  }`}
                />
              ))}
            </div>
            <span>{item.rating}</span>
          </div> : null}
        </div>

        {/* Student Quote */}
        <blockquote className="mt-4 text-xs leading-relaxed font-medium text-ink-700 sm:text-sm">
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      </div>

      {/* Student Author Information */}
      <figcaption className="mt-6 flex items-center gap-3.5 border-t border-ink-100 pt-4">
        <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-700 to-brand-900 font-display text-sm font-bold text-white shadow-xs">
          {photo ? (
            <Image
              src={photo.src}
              alt=""
              width={48}
              height={48}
              className="size-full object-cover"
            />
          ) : (
            item.name.charAt(0)
          )}
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-0.5 text-white ring-1 ring-white">
            <UserCheck className="size-2.5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-display text-sm font-bold text-ink-900">
              {item.name}
            </span>
          </div>

          {item.role ? (
            <span className="block truncate text-2xs font-medium text-ink-500">
              {item.role}
            </span>
          ) : null}

          {item.university ? (
            <Link
              href={`/university/${item.university.slug}`}
              className="mt-0.5 inline-flex items-center gap-1 truncate text-2xs font-semibold text-brand-700 hover:text-brand-900 hover:underline"
            >
              <GraduationCap className="size-3 shrink-0 text-brand-600" />
              <span className="truncate">{item.university.name}</span>
            </Link>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

