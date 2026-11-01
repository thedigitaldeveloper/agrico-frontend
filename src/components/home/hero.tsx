import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroCarousel, type HeroSlide } from '@/components/home/hero-carousel';
import type { TrendingItem } from '@/lib/cms/repositories/home';

/**
 * The top of the homepage: the CMS-authored carousel + quick-trending discovery bar.
 */
export function Hero({
  slides,
  trendingPrograms,
}: {
  slides: HeroSlide[];
  trendingPrograms?: TrendingItem[];
}) {
  if (!slides || slides.length === 0) return null;

  const trending = trendingPrograms || [];

  // Repeat items for a seamless, continuous infinite loop
  const marqueeItems = [...trending, ...trending, ...trending, ...trending];

  return (
    <section className="surface-inverse relative">
      <HeroCarousel slides={slides} />

      {/* Quick Trending Programs Continuous Sliding Marquee */}
      {trending.length > 0 ? (
        <div className="relative z-20 border-b border-brand-800/60 bg-brand-950/95 py-2.5 backdrop-blur-md">
          <div className="container-page flex items-center gap-3 text-xs text-white">
            {/* Pinned "Trending Now" Label (Hidden on mobile) */}
            <div className="hidden sm:flex shrink-0 items-center gap-1.5 font-bold text-amber-300 pr-2 border-r border-white/10">
              <Sparkles className="size-3.5 shrink-0 text-amber-400 animate-pulse" />
              <span className="tracking-wider uppercase text-3xs sm:text-2xs font-extrabold whitespace-nowrap">
                Trending Now:
              </span>
            </div>

            {/* Continuous Infinite Auto-Scrolling Track with Left/Right Fades */}
            <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
              <div className="animate-marquee-infinite flex items-center gap-2 py-0.5">
                {marqueeItems.map((item, index) => (
                  <Link
                    key={`${item.label}-${index}`}
                    href={item.href}
                    className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-3xs font-semibold text-white/90 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-amber-400/60 hover:bg-amber-400/15 hover:text-amber-200 active:scale-[0.98] sm:px-3 sm:py-1 sm:text-2xs"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-2.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


