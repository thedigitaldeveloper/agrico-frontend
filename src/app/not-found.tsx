import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  GraduationCap,
  Home,
  Search,
  Sparkles,
} from 'lucide-react';

const POPULAR_SHORTCUTS = [
  { label: 'B.Sc. (Hons.) Agriculture', href: '/bsc-agriculture' },
  { label: 'B.Tech. Agricultural Engg.', href: '/btech-agricultural-engineering' },
  { label: 'B.Sc. (Hons.) Horticulture', href: '/bsc-horticulture' },
  { label: 'MBA Agribusiness', href: '/mba-agribusiness' },
  { label: 'B.V.Sc. & Animal Husbandry', href: '/bvsc-animal-husbandry' },
  { label: 'M.Sc. Agronomy', href: '/msc-agronomy' },
  { label: 'B.Sc. (Hons.) Forestry', href: '/bsc-forestry' },
  { label: 'Diploma in Agriculture', href: '/diploma-agriculture' },
];

const QUICK_DESTINATIONS = [
  {
    title: 'Agriculture Universities',
    description: 'Browse 62+ ICAR-aligned SAUs, Deemed & private agricultural campuses.',
    href: '/agriculture-colleges',
    icon: Building2,
  },
  {
    title: 'All Agriculture Programmes',
    description: 'Compare UG, PG & Diploma degrees across Agronomy, Horticulture, Dairy & Forestry.',
    href: '/programs',
    icon: GraduationCap,
  },
  {
    title: 'Compare Campuses',
    description: 'Side-by-side comparison of fees, ICAR accreditation, farm labs & placements.',
    href: '/compare',
    icon: Compass,
  },
  {
    title: 'Common Application Form',
    description: 'Apply or request a free counselling call from our agriculture admissions desk.',
    href: '/common-application-form',
    icon: BookOpen,
  },
];

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F7EF] via-[#FCFAF5] to-[#F4F7EF] py-14 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl"
      />

      <div className="container-page relative z-10 max-w-4xl">
        <div className="rounded-3xl border border-ink-200/90 bg-white p-6 shadow-card sm:p-10 lg:p-12">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-extrabold tracking-[0.12em] text-emerald-900 uppercase">
              <Sparkles className="size-3.5 text-emerald-700" aria-hidden="true" />
              Error 404 &middot; Page Not Found
            </span>

            <p
              aria-hidden="true"
              className="mt-4 font-display text-6xl leading-none font-extrabold tracking-tight text-emerald-900/15 sm:text-7xl"
            >
              404
            </p>

            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl lg:text-4xl text-balance">
              We couldn&apos;t find the page you were looking for
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
              The link may have moved, been renamed in our catalogue, or never existed. Search for
              any on-campus agriculture university, degree or entrance exam below — or jump straight
              to a popular programme.
            </p>

            {/* Instant Global Search Form */}
            <form
              action="/search"
              method="get"
              role="search"
              className="mt-7 flex w-full max-w-xl flex-col gap-2.5 sm:flex-row"
            >
              <label htmlFor="not-found-search" className="sr-only">
                Search universities, agriculture degrees or entrance exams
              </label>
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  id="not-found-search"
                  type="search"
                  name="q"
                  placeholder="Search B.Sc. Agriculture, PAU Ludhiana, ICAR CUET, Horti…"
                  className="h-12 w-full rounded-xl border border-ink-300 bg-ink-50/60 pr-4 pl-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-emerald-800 focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
              >
                <span>Search Catalogue</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </form>

            {/* Primary CTA Row */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-pill border border-ink-200 bg-white px-4 py-2 text-xs font-bold text-ink-800 shadow-2xs transition-colors hover:border-emerald-300 hover:text-emerald-900"
              >
                <Home className="size-3.5 text-emerald-800" aria-hidden="true" />
                <span>Back to Homepage</span>
              </Link>
              <Link
                href="/agriculture-colleges"
                className="inline-flex items-center gap-2 rounded-pill border border-ink-200 bg-white px-4 py-2 text-xs font-bold text-ink-800 shadow-2xs transition-colors hover:border-emerald-300 hover:text-emerald-900"
              >
                <Building2 className="size-3.5 text-emerald-800" aria-hidden="true" />
                <span>Explore Agriculture Colleges</span>
              </Link>
            </div>
          </div>

          {/* Popular Degree Pills */}
          <div className="mt-9 border-t border-ink-150 pt-7">
            <p className="text-center text-2xs font-extrabold tracking-[0.14em] text-ink-500 uppercase">
              Popular On-Campus Agriculture Degrees
            </p>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {POPULAR_SHORTCUTS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-ink-200 bg-ink-50/70 px-3.5 py-1.5 text-xs font-semibold text-ink-800 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="size-3 text-ink-400" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* 4-Card Destination Grid */}
          <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
            {QUICK_DESTINATIONS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex items-start gap-3.5 rounded-2xl border border-ink-200/80 bg-ink-50/40 p-4 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-xs"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 transition-colors group-hover:bg-emerald-900 group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 font-display text-sm font-bold text-ink-950 group-hover:text-emerald-900">
                      <span>{card.title}</span>
                      <ArrowRight
                        className="size-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-800"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-600">
                      {card.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
