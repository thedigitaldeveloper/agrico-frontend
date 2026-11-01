'use client';

import Image from 'next/image';
import { BRAND } from '@/lib/brand';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  GraduationCap,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import type { MultiLevelNavigationData, StreamMenuTier, UniversityCategoryTier } from './nav-menus';

interface MobileNavProps {
  data: MultiLevelNavigationData;
}

type MobileView =
  | { screen: 'root' }
  | { screen: 'programs' }
  | { screen: 'stream-detail'; stream: StreamMenuTier }
  | { screen: 'universities' }
  | { screen: 'univ-detail'; category: UniversityCategoryTier };

const emptySubscribe = () => () => {};

export function MobileNav({ data }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [view, setView] = useState<MobileView>({ screen: 'root' });
  const [searchQuery, setSearchQuery] = useState('');

  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeDrawer = () => {
    setIsOpen(false);
    setView({ screen: 'root' });
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Navigation Menu"
        className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-800 shadow-2xs transition-colors hover:bg-ink-100 hover:text-ink-950 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Portal drawer and backdrop directly to document.body */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            {isOpen && (
              <div
                className="fixed inset-0 z-[99] bg-ink-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={closeDrawer}
              />
            )}

            {/* Slide-In Mobile Drawer */}
            <div
              ref={drawerRef}
              aria-hidden={!isOpen}
              className={cn(
                'fixed inset-y-0 right-0 z-[100] flex h-dvh w-full max-w-[85vw] sm:max-w-sm flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out',
                isOpen
                  ? 'translate-x-0 opacity-100 visible pointer-events-auto'
                  : 'translate-x-full opacity-0 invisible pointer-events-none'
              )}
            >
              {/* Drawer Header with Official Logo & Close */}
              <div className="flex shrink-0 items-center justify-between border-b border-ink-100 px-4 py-3.5">
                <Link
                  href="/"
                  onClick={closeDrawer}
                  className="flex shrink-0 items-center"
                  aria-label="Agrico Home"
                >
                  <Image
                    src={BRAND.logo}
                    alt="Agrico"
                    width={178.5}
                    height={35}
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </Link>

                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close navigation"
                  className="flex size-8.5 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors hover:bg-ink-200 hover:text-ink-900"
                >
                  <X className="size-4.5" />
                </button>
              </div>

        {/* Search Bar on Top of Drawer */}
        <div className="border-b border-ink-100 bg-ink-50/70 p-3.5">
          <form
            action="/search"
            method="get"
            onSubmit={closeDrawer}
            className="relative flex items-center"
          >
            <Search className="pointer-events-none absolute left-3 size-4 text-ink-400" />
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search universities and programs..."
              className="h-10 w-full rounded-full border border-ink-200/90 bg-white pl-9 pr-3.5 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Scrollable Navigation Body (Multi-Level Screens) */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {/* ============================================================== */}
          {/* SCREEN 1: ROOT MENU */}
          {/* ============================================================== */}
          {view.screen === 'root' && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-3xs font-extrabold tracking-wider text-ink-400 uppercase">
                  Explore Higher Education
                </p>
                <div className="space-y-2">
                  {/* Card 1: All Programs */}
                  <button
                    type="button"
                    onClick={() => setView({ screen: 'programs' })}
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-150 bg-white p-3 text-left shadow-2xs transition-all hover:border-brand-300 hover:bg-brand-50/60 active:scale-[0.99]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <GraduationCap className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink-900 leading-snug">All Programs</p>
                      <p className="text-2xs text-ink-500 font-medium">Browse by streams & degrees</p>
                    </div>
                    <ChevronRight className="size-4 text-ink-400 shrink-0" />
                  </button>

                  {/* Card 2: Top Accredited Universities */}
                  <button
                    type="button"
                    onClick={() => setView({ screen: 'universities' })}
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-150 bg-white p-3 text-left shadow-2xs transition-all hover:border-brand-300 hover:bg-brand-50/60 active:scale-[0.99]"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Building2 className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink-900 leading-snug">Top Accredited Universities</p>
                      <p className="text-2xs text-ink-500 font-medium">Browse universities</p>
                    </div>
                    <ChevronRight className="size-4 text-ink-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Direct Decision Tools Box */}
              <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-b from-brand-50/70 to-brand-50/30 p-3.5 space-y-2.5">
                <p className="text-3xs font-extrabold tracking-wider text-brand-900 uppercase">
                  Instant Decision Tools
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/compare"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-ink-200/80 bg-white px-2 py-2.5 text-center text-xs font-bold text-ink-900 shadow-2xs transition-all hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98]"
                  >
                    <Scale className="size-3.5 text-brand-700 shrink-0" />
                    <span className="truncate">Compare Colleges</span>
                  </Link>

                  <Link
                    href="/common-application-form"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300/80 bg-white px-2 py-2.5 text-center text-xs font-bold text-ink-900 shadow-2xs transition-all hover:border-amber-400 hover:bg-amber-50/50 active:scale-[0.98]"
                  >
                    <Sparkles className="size-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Common Apply</span>
                  </Link>
                </div>
              </div>

              {/* General Links */}
              <div className="pt-2 border-t border-ink-100 space-y-1">
                <Link
                  href="/about-us"
                  onClick={closeDrawer}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-800"
                >
                  <span>How We Verify Accreditations</span>
                  <ArrowRight className="size-3 text-ink-400" />
                </Link>
                <Link
                  href="/contact-us"
                  onClick={closeDrawer}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-800"
                >
                  <span>Contact & Support Desk</span>
                  <ArrowRight className="size-3 text-ink-400" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 2: PROGRAMS (Stream List) */}
          {/* ============================================================== */}
          {view.screen === 'programs' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setView({ screen: 'root' })}
                className="flex items-center gap-1.5 text-2xs font-bold text-brand-800 hover:underline"
              >
                <ChevronLeft className="size-4" />
                <span>Back to Main Menu</span>
              </button>

              <h3 className="font-display text-sm font-bold text-ink-900">
                Choose a Career Stream
              </h3>

              <div className="space-y-2">
                {data.programStreams.map((stream) => (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => setView({ screen: 'stream-detail', stream })}
                    className="flex w-full items-center justify-between rounded-xl border border-ink-200/80 bg-white p-3 text-left text-xs font-bold text-ink-900 shadow-2xs hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-brand-700" />
                      <span>{stream.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      {stream.badge ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-3xs font-extrabold text-brand-800">
                          {stream.badge}
                        </span>
                      ) : null}
                      <ChevronRight className="size-4 text-ink-400" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 3: STREAM DETAIL (Degrees, Specializations & Universities) */}
          {/* ============================================================== */}
          {view.screen === 'stream-detail' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setView({ screen: 'programs' })}
                className="flex items-center gap-1.5 text-2xs font-bold text-brand-800 hover:underline"
              >
                <ChevronLeft className="size-4" />
                <span>Back to All Streams</span>
              </button>

              <div>
                <h3 className="font-display text-sm font-bold text-ink-900">
                  {view.stream.name} Programs
                </h3>
                <p className="text-2xs text-ink-500">Explore programs and specializations</p>
              </div>

              {/* Degrees Accordion Blocks */}
              <div className="space-y-4">
                {view.stream.degrees.map((degGroup) => (
                  <div key={degGroup.degreeName} className="rounded-2xl border border-ink-200/80 bg-ink-50/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Link
                        href={`/${degGroup.degreeSlug}`}
                        onClick={closeDrawer}
                        className="font-bold text-xs text-ink-900 hover:text-brand-800 flex items-center gap-1 group"
                      >
                        <span>{degGroup.degreeName.split('(')[0]}</span>
                        <ArrowRight className="size-3 text-brand-700 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <span className="text-3xs font-extrabold text-brand-800 uppercase">{degGroup.level}</span>
                    </div>

                    <ul className="space-y-1.5">
                      {degGroup.specializations.map((spec) => (
                        <li key={spec.slug}>
                          <Link
                            href={`/${spec.slug}`}
                            onClick={closeDrawer}
                            className="flex items-center justify-between rounded-xl bg-white p-2 text-2xs font-semibold text-ink-800 shadow-2xs hover:text-brand-800"
                          >
                            <span>{spec.name}</span>
                            {spec.startingEmi ? (
                              <span className="text-3xs font-bold text-emerald-700">{spec.startingEmi}</span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Top Offering Universities */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-3.5 space-y-2">
                <p className="text-3xs font-extrabold text-brand-900 uppercase">Top Universities Offering This</p>
                <ul className="space-y-1.5">
                  {view.stream.topUniversities.map((univ) => (
                    <li key={univ.slug}>
                      <Link
                        href={`/university/${univ.slug}`}
                        onClick={closeDrawer}
                        className="flex items-center justify-between rounded-xl bg-white p-2 text-2xs font-bold text-ink-900 shadow-2xs hover:text-brand-800"
                      >
                        <span className="truncate pr-1">{univ.name}</span>
                        {univ.naacGrade ? (
                          <span className="rounded bg-gold-50 px-1.5 py-0.5 text-3xs font-extrabold text-gold-800 ring-1 ring-gold-200 ring-inset">
                            NAAC {univ.naacGrade}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 4: UNIVERSITIES (Accreditations) */}
          {/* ============================================================== */}
          {view.screen === 'universities' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setView({ screen: 'root' })}
                className="flex items-center gap-1.5 text-2xs font-bold text-brand-800 hover:underline"
              >
                <ChevronLeft className="size-4" />
                <span>Back to Main Menu</span>
              </button>

              <h3 className="font-display text-sm font-bold text-ink-900">
                Browse Universities
              </h3>

              <div className="space-y-2">
                {data.universityCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setView({ screen: 'univ-detail', category: cat })}
                    className="flex w-full items-center justify-between rounded-xl border border-ink-200/80 bg-white p-3 text-left text-xs font-bold text-ink-900 shadow-2xs hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="size-4 text-brand-700" />
                      <span>{cat.name}</span>
                    </span>
                    <ChevronRight className="size-4 text-ink-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 5: UNIVERSITY CATEGORY DETAIL */}
          {/* ============================================================== */}
          {view.screen === 'univ-detail' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setView({ screen: 'universities' })}
                className="flex items-center gap-1.5 text-2xs font-bold text-brand-800 hover:underline"
              >
                <ChevronLeft className="size-4" />
                <span>Back to Categories</span>
              </button>

              <div>
                <h3 className="font-display text-sm font-bold text-ink-900">{view.category.name}</h3>
                <p className="text-2xs text-ink-500">{view.category.description}</p>
              </div>

              <ul className="space-y-2">
                {view.category.universities.map((univ) => (
                  <li key={univ.slug}>
                    <Link
                      href={`/university/${univ.slug}`}
                      onClick={closeDrawer}
                      className="flex flex-col rounded-xl border border-ink-200/80 bg-white p-3 shadow-2xs hover:border-brand-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-ink-900">{univ.name}</span>
                        {univ.naacGrade ? (
                          <span className="rounded bg-gold-50 px-1.5 py-0.5 text-3xs font-extrabold text-gold-800 ring-1 ring-gold-200 ring-inset">
                            NAAC {univ.naacGrade}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-2xs text-ink-500">
                        {univ.monthlyEmi ? `Starting: ${univ.monthlyEmi}` : `Starting: ${univ.startingFee}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions Bar (Mobile) */}
        <div className="border-t border-ink-100 bg-white p-3.5 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/common-application-form"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 py-2.5 text-xs font-black text-ink-950 shadow-sm transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <Sparkles className="size-3.5" />
              <span>Free Counseling</span>
            </Link>

            <Link
              href="/compare"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 bg-ink-50 py-2.5 text-xs font-extrabold text-ink-900 transition-all hover:bg-ink-100 active:scale-[0.98]"
            >
              <Scale className="size-3.5 text-brand-700" />
              <span>Compare</span>
            </Link>
          </div>
        </div>
      </div>
          </>,
          document.body
        )}
    </>
  );
}
