'use client';

import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';

/**
 * Homepage hero carousel.
 *
 * Slides are authored in the CMS and can be an image, an uploaded video or a
 * YouTube embed; each one can link anywhere, on or off the site. Everything the
 * component needs is resolved server-side (media URLs, YouTube ids, internal vs
 * external links) so this file stays presentational and ships no CMS logic to
 * the browser.
 */

export interface HeroImage {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
}

/** A desktop image plus the optional portrait crop that replaces it on phones. */
export interface HeroPicture {
  desktop: HeroImage;
  mobile: HeroImage | null;
}

export type HeroMedia =
  | { kind: 'image'; picture: HeroPicture }
  | { kind: 'video'; src: string; mobileSrc: string | null; poster: HeroPicture | null }
  | { kind: 'youtube'; videoId: string; poster: HeroPicture | null }
  /** No media — the slide renders on the brand gradient. */
  | { kind: 'none' };

export interface HeroSlide {
  id: string;
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  media: HeroMedia;
  /** Applies to the whole slide surface, not just the call to action. */
  href: string | null;
  external: boolean;
  newTab: boolean;
  ctaLabel: string | null;
}

const AUTOPLAY_MS = 6500;
/** Below this a drag reads as a tap, above it as a swipe. */
const SWIPE_THRESHOLD = 48;
/** Tailwind's `lg`. Kept in one place so CSS and matchMedia cannot drift. */
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Slide 0 carries the page's <h1>, and a slide is renderable on media alone —
 * so an editor who uploads an image and forgets the headline would otherwise
 * ship a homepage with no h1 at all. Only slide 0 falls back; a later slide
 * with no heading still renders none, as before.
 */
const DEFAULT_HEADING = 'Find the right university, without the guesswork';

export function HeroCarousel({
  slides,
  label = 'Highlights',
}: {
  slides: HeroSlide[];
  label?: string;
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /**
   * Which slide is playing a video inline, if any. Held here rather than inside the
   * slide so that starting playback can stop the carousel: a video owns the
   * hero until the visitor moves on themselves.
   */
  const [playingSlide, setPlayingSlide] = useState<number | null>(null);
  
  /**
   * State for the Fullscreen Video Lightbox Modal.
   */
  const [fullscreenMedia, setFullscreenMedia] = useState<{
    media: HeroMedia;
    heading: string | null;
    eyebrow: string | null;
  } | null>(null);

  /**
   * Tied to the slide on screen, not just to "something is playing": if the two
   * ever disagree — a play landing in the same tick as an autoplay advance —
   * the carousel keeps moving instead of freezing on a video nobody can see.
   */
  const videoPlaying = playingSlide === index || fullscreenMedia !== null;
  /**
   * The explicit pause control, kept separate from the hover/focus pause.
   */
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const dragStart = useRef<number | null>(null);
  const halted = paused || manuallyPaused || fullscreenMedia !== null;

  const go = useCallback(
    (next: number) => {
      setPlayingSlide(null);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    // Autoplay is off while a video plays, so no slide can be left mid-playback
    // by the timer below — only `go` moves away from one, and it clears first.
    if (count < 2 || halted || videoPlaying || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, halted, videoPlaying, reducedMotion]);

  // Lock body scroll when fullscreen modal is open & listen for Escape
  useEffect(() => {
    if (!fullscreenMedia) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenMedia(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenMedia]);

  if (count === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative isolate overflow-hidden bg-brand-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (fullscreenMedia) return;
        if (event.key === 'ArrowLeft') go(index - 1);
        if (event.key === 'ArrowRight') go(index + 1);
      }}
      onPointerDown={(event) => {
        if (fullscreenMedia) return;
        dragStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (fullscreenMedia) return;
        const start = dragStart.current;
        dragStart.current = null;
        if (start === null) return;
        const delta = event.clientX - start;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        go(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div className="h-[32rem] sm:h-[34rem] lg:aspect-video lg:h-auto">
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          aria-live={halted ? 'polite' : 'off'}
        >
          {slides.map((slide, position) => (
            <Slide
              key={slide.id}
              slide={slide}
              active={position === index}
              position={position}
              total={count}
              playing={position === index && playingSlide === position}
              reducedMotion={reducedMotion}
              onVideoPlay={() => setPlayingSlide(position)}
              onFullscreenPlay={() =>
                setFullscreenMedia({
                  media: slide.media,
                  heading: slide.heading,
                  eyebrow: slide.eyebrow,
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Slide Navigation Capsule */}
      {count > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-6 lg:bottom-8 z-40">
          <div className="container-page flex justify-start lg:justify-end">
            <div className="pointer-events-auto flex items-center gap-1 rounded-pill border border-white/15 bg-brand-950/60 p-1 backdrop-blur-md">
              <Arrow
                direction="previous"
                onClick={() => go(index - 1)}
                className="hidden size-8 sm:size-9 border-0 bg-transparent backdrop-blur-none hover:bg-white/12 sm:flex"
              />

              <button
                type="button"
                onClick={() => setManuallyPaused((value) => !value)}
                aria-label={manuallyPaused ? 'Play slideshow' : 'Pause slideshow'}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/12"
              >
                {manuallyPaused ? <PlaySmallIcon /> : <PauseIcon />}
              </button>

              {slides.map((slide, position) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${position + 1}`}
                  aria-current={position === index}
                  onClick={() => go(position)}
                  className="group flex h-6 w-6 sm:w-8 items-center rounded-pill"
                >
                  <span
                    className={cn(
                      'h-1 w-full rounded-pill transition-colors',
                      position === index
                        ? 'bg-gold-400'
                        : 'bg-white/45 group-hover:bg-white/70'
                    )}
                  />
                </button>
              ))}

              <span
                aria-hidden="true"
                className="hidden px-2 text-2xs font-semibold text-white/55 tabular-nums sm:block"
              >
                {index + 1}/{count}
              </span>

              <Arrow
                direction="next"
                onClick={() => go(index + 1)}
                className="hidden size-8 sm:size-9 border-0 bg-transparent backdrop-blur-none hover:bg-white/12 sm:flex"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Fullscreen Video Modal / Lightbox */}
      {fullscreenMedia ? (
        <FullscreenVideoModal
          media={fullscreenMedia.media}
          heading={fullscreenMedia.heading}
          eyebrow={fullscreenMedia.eyebrow}
          onClose={() => setFullscreenMedia(null)}
        />
      ) : null}
    </section>
  );
}

function FullscreenVideoModal({
  media,
  heading,
  eyebrow,
  onClose,
}: {
  media: HeroMedia;
  heading: string | null;
  eyebrow: string | null;
  onClose: () => void;
}) {
  const isYouTube = media.kind === 'youtube';
  const isVideo = media.kind === 'video';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video Player Fullscreen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-3 backdrop-blur-xl sm:p-6 lg:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex w-full max-w-5xl items-center justify-between pb-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          {eyebrow ? (
            <p className="text-2xs font-bold tracking-wider text-gold-400 uppercase">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h3 className="truncate font-display text-sm font-semibold text-white sm:text-base">
              {heading}
            </h3>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close fullscreen video"
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/20"
        >
          <span className="hidden sm:inline">Close</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 stroke-current stroke-2 transition-transform group-hover:rotate-90"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Video Content Container */}
      <div
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isYouTube ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${media.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={heading ?? 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="size-full border-0"
          />
        ) : isVideo ? (
          <video
            src={media.src}
            controls
            autoPlay
            playsInline
            className="size-full object-contain"
          />
        ) : null}
      </div>

      {/* Footer Hint */}
      <p
        className="mt-3 text-center text-xs text-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        Press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-2xs text-white/80">ESC</kbd> or click outside to exit
      </p>
    </div>
  );
}

function Slide({
  slide,
  active,
  position,
  total,
  playing,
  reducedMotion,
  onVideoPlay,
  onFullscreenPlay,
}: {
  slide: HeroSlide;
  active: boolean;
  position: number;
  total: number;
  playing: boolean;
  reducedMotion: boolean;
  onVideoPlay: () => void;
  onFullscreenPlay: () => void;
}) {
  const isYouTube = slide.media.kind === 'youtube';
  const isDirectVideo = slide.media.kind === 'video';
  const isVideo = isYouTube || isDirectVideo;
  const showOverlay = !(isYouTube && playing);
  const surfaceLink = slide.href && !isYouTube ? slide.href : null;
  const Heading = position === 0 ? 'h1' : 'h2';
  const heading = slide.heading ?? null;
  const hasCopy = Boolean(slide.eyebrow || heading || slide.description || slide.ctaLabel);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${total}`}
      aria-hidden={!active}
      inert={!active}
      className="relative h-full w-full shrink-0"
    >
      {/* Screen-reader accessible H1 for SEO if Slide 0 has no visual copy overlay */}
      {position === 0 && !hasCopy ? (
        <h1 className="sr-only">{slide.heading || DEFAULT_HEADING}</h1>
      ) : null}

      <SlideMedia
        media={slide.media}
        active={active}
        priority={position === 0}
        playing={playing}
        reducedMotion={reducedMotion}
        label={slide.heading}
      />

      {/* Floating Fullscreen Trigger Button on Video Slides */}
      {isVideo && active ? (
        <button
          type="button"
          onClick={onFullscreenPlay}
          aria-label="Play video in fullscreen"
          title="Play Fullscreen"
          className="group pointer-events-auto absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-brand-950/75 px-3 py-1.5 text-2xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-gold-400/60 hover:bg-brand-900/90 hover:text-gold-200"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3.5 fill-none stroke-current stroke-2 transition-transform group-hover:scale-110"
          >
            <path
              d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      ) : null}

      {showOverlay && hasCopy && slide.media.kind !== 'none' ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(96deg,rgba(43,12,19,0.78)_0%,rgba(43,12,19,0.58)_28%,rgba(43,12,19,0.28)_48%,rgba(43,12,19,0.08)_62%,transparent_74%)] lg:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(43,12,19,0.85)_0%,rgba(43,12,19,0.6)_28%,rgba(43,12,19,0.25)_50%,transparent_72%)] lg:hidden"
          />
        </>
      ) : null}

      {surfaceLink && showOverlay ? (
        <SlideLink
          href={surfaceLink}
          external={slide.external}
          newTab={slide.newTab}
          label={slide.heading ?? `Slide ${position + 1}`}
        />
      ) : null}

      {showOverlay && hasCopy ? (
        <div className="pointer-events-none relative z-30 flex h-full items-end pb-24 sm:pb-28 lg:items-center lg:pb-20">
          <div className="container-page">
            <div className="max-w-xl text-white lg:max-w-2xl">
              {slide.eyebrow ? (
                <p className="flex items-center gap-2 font-display text-2xs font-bold tracking-[0.09em] text-gold-300 uppercase text-shadow-hero sm:text-xs">
                  <span
                    aria-hidden="true"
                    className="h-3 w-0.5 shrink-0 rounded-full bg-gold-400"
                  />
                  {slide.eyebrow}
                </p>
              ) : null}

              {heading ? (
                <Heading className="mt-3 sm:mt-5 font-display text-2xl leading-tight font-extrabold text-balance text-shadow-hero sm:text-4xl lg:text-[3.25rem] lg:leading-[1.08] lg:tracking-[-0.03em] xl:text-5xl">
                  {heading}
                </Heading>
              ) : null}

              {slide.description ? (
                <p className="mt-2.5 sm:mt-4 max-w-xl text-xs leading-relaxed text-white/85 text-shadow-hero sm:text-base lg:text-lg">
                  {slide.description}
                </p>
              ) : null}

              {slide.ctaLabel || isVideo ? (
                <div className="pointer-events-auto mt-5 sm:mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3 lg:mt-8">
                  {isYouTube ? (
                    <>
                      <button
                        type="button"
                        onClick={onFullscreenPlay}
                        className="inline-flex h-11 sm:h-12 items-center gap-2.5 sm:gap-3 rounded-pill bg-white/12 pr-5 sm:pr-6 pl-2 text-xs sm:text-base font-semibold text-white ring-1 ring-white/25 ring-inset backdrop-blur-md transition-colors hover:bg-white/20"
                      >
                        <span className="flex size-7 sm:size-9 items-center justify-center rounded-full bg-gold-400 text-brand-950">
                          <PlayIcon />
                        </span>
                        {slide.ctaLabel || 'Watch Fullscreen'}
                      </button>
                    </>
                  ) : isDirectVideo ? (
                    <button
                      type="button"
                      onClick={onFullscreenPlay}
                      className="inline-flex h-11 sm:h-12 items-center gap-2.5 sm:gap-3 rounded-pill bg-white/12 pr-5 sm:pr-6 pl-2 text-xs sm:text-base font-semibold text-white ring-1 ring-white/25 ring-inset backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      <span className="flex size-7 sm:size-9 items-center justify-center rounded-full bg-gold-400 text-brand-950">
                        <PlayIcon />
                      </span>
                      {slide.ctaLabel || 'Play Fullscreen Video'}
                    </button>
                  ) : slide.href && slide.ctaLabel ? (
                    <CtaLink
                      href={slide.href}
                      external={slide.external}
                      newTab={slide.newTab}
                      label={slide.ctaLabel}
                    />
                  ) : null}

                  {isVideo && slide.href ? (
                    <CtaLink
                      href={slide.href}
                      external={slide.external}
                      newTab={slide.newTab}
                      label="Learn more"
                      subdued
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SlideMedia({
  media,
  active,
  priority,
  playing,
  reducedMotion,
  label,
}: {
  media: HeroMedia;
  active: boolean;
  priority: boolean;
  playing: boolean;
  reducedMotion: boolean;
  label: string | null;
}) {
  switch (media.kind) {
    case 'image':
      return <Picture picture={media.picture} priority={priority} />;

    case 'video':
      return (
        <VideoMedia
          src={media.src}
          mobileSrc={media.mobileSrc}
          poster={media.poster}
          active={active}
          priority={priority}
          reducedMotion={reducedMotion}
        />
      );

    case 'youtube':
      return (
        <YouTubeMedia
          videoId={media.videoId}
          poster={media.poster}
          playing={playing}
          priority={priority}
          label={label}
        />
      );

    case 'none':
      // The fallback slide is a `none` slide, so this is what a fresh install
      // renders — it has to look designed, not like a missing image. Same panel
      // language as the compare band and the mega-menu feature card.
      return (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950"
        >
          <span className="pointer-events-none absolute -top-24 -right-16 size-96 rounded-full bg-gold-400/15 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-400/15 blur-3xl" />
          {/* Masked away from the copy side so the dots never sit behind text. */}
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[length:22px_22px] opacity-60 [mask-image:linear-gradient(to_left,black,transparent_65%)]" />
        </div>
      );
  }
}

/**
 * Full-bleed art direction.
 *
 * Two `<Image>`s toggled with `lg:hidden` would both be in the DOM, and a
 * display:none image is still downloaded — the phone would pay for the desktop
 * crop it never sees. `<picture>` makes the browser choose one, and
 * getImageProps keeps Next's optimiser and srcset behind it.
 */
function Picture({
  picture,
  priority,
}: {
  picture: HeroPicture;
  priority: boolean;
}) {
  const { desktop, mobile } = picture;

  if (!mobile) {
    return (
      <Image
        src={desktop.src}
        alt={desktop.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
    );
  }

  const common = { alt: desktop.alt, sizes: '100vw', priority };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: desktop.src,
    width: desktop.width ?? 1920,
    height: desktop.height ?? 900,
  });
  const {
    props: { srcSet: mobileSrcSet, ...fallback },
  } = getImageProps({
    ...common,
    src: mobile.src,
    width: mobile.width ?? 828,
    height: mobile.height ?? 1104,
  });

  return (
    <picture>
      <source media={DESKTOP_QUERY} srcSet={desktopSrcSet} />
      <source srcSet={mobileSrcSet} />
      {/* A plain <img>, because <Image> cannot render inside <picture> —
          getImageProps has already produced the optimised src and srcset. */}
      <img
        {...fallback}
        alt={desktop.alt}
        className="absolute inset-0 size-full object-cover"
      />
    </picture>
  );
}

function VideoMedia({
  src,
  mobileSrc,
  poster,
  active,
  priority,
  reducedMotion,
}: {
  src: string;
  mobileSrc: string | null;
  poster: HeroPicture | null;
  active: boolean;
  priority: boolean;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const viewport = useViewport();

  // Undefined until the viewport is known, so a phone never starts fetching the
  // desktop cut before the media query has been read.
  const source =
    viewport === null ? undefined : viewport === 'mobile' && mobileSrc ? mobileSrc : src;
  // Only the slide on screen loads its video, and reduced motion stops at the
  // poster: a looping background clip is exactly what that setting asks to skip.
  const shouldLoad = active && !reducedMotion && source !== undefined;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (shouldLoad) {
      // Autoplay is refused on some setups even when muted; the poster stays
      // up in that case, which is the right fallback rather than an error.
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [shouldLoad, source]);

  return (
    <>
      {poster ? <Picture picture={poster} priority={priority} /> : null}
      {shouldLoad ? (
        <video
          ref={ref}
          key={source}
          src={source}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setReady(true)}
          // Muted, controlless and looping: this is set dressing behind the
          // slide copy, and the copy is what carries the meaning.
          aria-hidden="true"
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0'
          )}
        />
      ) : null}
    </>
  );
}

function YouTubeMedia({
  videoId,
  poster,
  playing,
  priority,
  label,
}: {
  videoId: string;
  poster: HeroPicture | null;
  playing: boolean;
  priority: boolean;
  label: string | null;
}) {
  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title={label ?? 'Video'}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 z-20 size-full border-0"
      />
    );
  }

  // A facade rather than the iframe itself: the player is roughly half a
  // megabyte of script before anyone has asked to watch anything.
  return poster ? (
    <Picture picture={poster} priority={priority} />
  ) : (
    <div aria-hidden="true" className="absolute inset-0 bg-brand-900" />
  );
}

/**
 * Covers the slide so the whole surface is clickable. It sits under the copy,
 * which is pointer-transparent, so a click anywhere but the buttons follows it —
 * the alternative, wrapping the copy in an anchor, would nest the call to
 * action inside another link.
 */
function SlideLink({
  href,
  external,
  newTab,
  label,
}: {
  href: string;
  external: boolean;
  newTab: boolean;
  label: string;
}) {
  const className = 'absolute inset-0 z-20';

  if (external) {
    return (
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel="noopener noreferrer"
        className={className}
      >
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} target={newTab ? '_blank' : undefined} className={className}>
      <span className="sr-only">{label}</span>
    </Link>
  );
}

function CtaLink({
  href,
  external,
  newTab,
  label,
  subdued = false,
}: {
  href: string;
  external: boolean;
  newTab: boolean;
  label: string;
  subdued?: boolean;
}) {
  // gold-500, matching Button variant="accent" — not the mega-menu card's
  // lighter gold-400, which is tuned for a much smaller surface.
  const className = cn(
    'group inline-flex h-12 items-center justify-center gap-2 rounded-pill text-base font-semibold transition-colors',
    subdued
      ? 'border border-white/25 bg-white/10 px-6 text-white hover:bg-white/20'
      : 'bg-gold-500 px-7 text-ink-950 hover:bg-gold-400'
  );

  const content = (
    <>
      {label}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} target={newTab ? '_blank' : undefined} className={className}>
      {content}
    </Link>
  );
}

function Arrow({
  direction,
  onClick,
  className,
}: {
  direction: 'previous' | 'next';
  onClick: () => void;
  /** Lets the capsule strip the standalone chrome off these. */
  className?: string;
}) {
  const isNext = direction === 'next';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isNext ? 'Next slide' : 'Previous slide'}
      className={cn(
        'flex size-10 items-center justify-center rounded-full',
        'border border-white/25 bg-brand-950/40 text-white backdrop-blur-sm',
        'transition-colors hover:bg-brand-950/70',
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-5 fill-none stroke-current stroke-2"
      >
        <path
          d={isNext ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M8 5.14v13.72a.5.5 0 0 0 .77.42l10.29-6.86a.5.5 0 0 0 0-.84L8.77 4.72a.5.5 0 0 0-.77.42Z" />
    </svg>
  );
}

/** The capsule's own pair, sized for a 36px control rather than a CTA. */
function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 fill-current">
      <rect x="6" y="4.5" width="2.75" height="11" rx="1" />
      <rect x="11.25" y="4.5" width="2.75" height="11" rx="1" />
    </svg>
  );
}

function PlaySmallIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 fill-current">
      <path d="M7 4.6v10.8a.5.5 0 0 0 .77.42l8.1-5.4a.5.5 0 0 0 0-.84l-8.1-5.4A.5.5 0 0 0 7 4.6Z" />
    </svg>
  );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * Read as an external store rather than mirrored into state, so the server
 * snapshot and the first client render agree and nothing has to be corrected
 * in an effect afterwards.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * `null` on the server and through hydration — there is no honest answer before
 * the media query has been read, and guessing would have a phone download a
 * desktop video for one render.
 */
function useViewport(): 'desktop' | 'mobile' | null {
  return useSyncExternalStore(
    subscribeToViewport,
    () => (window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile'),
    () => null
  );
}
