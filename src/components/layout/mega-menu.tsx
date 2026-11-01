'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  Scale,
  CheckCircle2,
  } from 'lucide-react';

import { cn } from '@/lib/cn';
import type {
  MultiLevelNavigationData,
} from './nav-menus';

export function MegaNav({ data }: { data: MultiLevelNavigationData }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<string>(data.programStreams[0]?.id ?? 'management');
  const [activeUnivCatId, setActiveUnivCatId] = useState<string>(data.universityCategories[0]?.id ?? 'naac-top');

  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const openMenu = (menuId: string) => {
    cancelClose();
    setActiveMenu(menuId);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveMenu(null);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleScroll = () => {
      setActiveMenu(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      cancelClose();
    };
  }, []);

  const currentStream = data.programStreams.find((s) => s.id === activeStreamId) ?? data.programStreams[0];
  const currentUnivCat = data.universityCategories.find((c) => c.id === activeUnivCatId) ?? data.universityCategories[0];

  return (
    <div
      ref={containerRef}
      className="relative flex shrink-0 items-center gap-1 xl:gap-2"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      {/* 1. Trigger: All Programs */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => (activeMenu === 'programs' ? setActiveMenu(null) : openMenu('programs'))}
          onMouseEnter={() => openMenu('programs')}
          aria-expanded={activeMenu === 'programs'}
          className={cn(
            'group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-bold tracking-tight transition-all duration-150 xl:h-10 xl:gap-2 xl:px-3 xl:text-sm',
            activeMenu === 'programs'
              ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200'
              : 'text-ink-700 hover:bg-ink-100/70 hover:text-ink-950'
          )}
        >
          <GraduationCap className="size-4 shrink-0 text-brand-700" />
          <span className="shrink-0 whitespace-nowrap">All Programs</span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-ink-400 transition-transform duration-200',
              activeMenu === 'programs' && 'rotate-180 text-brand-700'
            )}
          />
        </button>
      </div>

      {/* 2. Trigger: Top Universities */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => (activeMenu === 'universities' ? setActiveMenu(null) : openMenu('universities'))}
          onMouseEnter={() => openMenu('universities')}
          aria-expanded={activeMenu === 'universities'}
          className={cn(
            'group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-bold tracking-tight transition-all duration-150 xl:h-10 xl:gap-2 xl:px-3 xl:text-sm',
            activeMenu === 'universities'
              ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200'
              : 'text-ink-700 hover:bg-ink-100/70 hover:text-ink-950'
          )}
        >
          <Building2 className="size-4 shrink-0 text-brand-700" />
          <span className="shrink-0 whitespace-nowrap">Top Universities</span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-ink-400 transition-transform duration-200',
              activeMenu === 'universities' && 'rotate-180 text-brand-700'
            )}
          />
        </button>
      </div>

      {/* 3. Direct Link: Compare Universities */}
      <Link
        href="/compare"
        className="group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-bold tracking-tight text-ink-700 transition-all duration-150 hover:bg-ink-100/70 hover:text-ink-950 xl:h-10 xl:gap-2 xl:px-3 xl:text-sm"
      >
        <Scale className="size-4 shrink-0 text-brand-700" />
        <span className="shrink-0 whitespace-nowrap">Compare</span>
      </Link>

      {/* 4. Direct Link: Mentors & Advice */}
      <Link
        href="/mentors"
        className="group inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-bold tracking-tight text-ink-700 transition-all duration-150 hover:bg-ink-100/70 hover:text-ink-950 xl:h-10 xl:gap-2 xl:px-3 xl:text-sm"
      >
        <Sparkles className="size-4 shrink-0 text-amber-600" />
        <span className="shrink-0 whitespace-nowrap">Mentors</span>
      </Link>

      {/* ========================================================================= */}
      {/* MEGA PANELS CONTAINER & BACKDROP */}
      {/* ========================================================================= */}
      {activeMenu && (
        <>
          {/* Subtle Dark Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-ink-950/40 backdrop-blur-xs transition-opacity duration-200 lg:top-[4.5rem]"
            onClick={() => setActiveMenu(null)}
          />

          {/* Solid Pure White Mega Menu */}
          <div
            className="fixed inset-x-0 top-16 z-50 border-b border-ink-200/90 bg-white shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-1.5 lg:top-[4.5rem]"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-4 lg:px-6 lg:py-4.5">
              {/* ------------------------------------------------------------- */}
              {/* PANEL 1: ALL PROGRAMS */}
              {/* ------------------------------------------------------------- */}
              {activeMenu === 'programs' && currentStream && (
                <div className="flex gap-6 items-stretch">
                  {/* Left Stream Navigation Sidebar */}
                  <div className="w-60 shrink-0 flex flex-col justify-between rounded-xl bg-ink-50/70 p-2 border border-ink-100">
                    <div className="space-y-0.5">
                      <p className="mb-1.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                        Career Streams
                      </p>
                      {data.programStreams.map((stream) => {
                        const isSelected = stream.id === activeStreamId;
                        return (
                          <button
                            key={stream.id}
                            type="button"
                            onMouseEnter={() => setActiveStreamId(stream.id)}
                            onClick={() => setActiveStreamId(stream.id)}
                            className={cn(
                              'group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-150',
                              isSelected
                                ? 'bg-white font-bold text-brand-900 shadow-xs ring-1 ring-ink-200/70 border-l-2 border-brand-800'
                                : 'font-medium text-ink-700 hover:bg-white/80 hover:text-ink-950'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <GraduationCap
                                className={cn(
                                  'size-3.5 shrink-0 transition-colors',
                                  isSelected ? 'text-brand-800' : 'text-ink-400 group-hover:text-brand-700'
                                )}
                              />
                              <span className="leading-snug text-[11px] font-medium">{stream.name}</span>
                            </span>
                            <ArrowRight
                              className={cn(
                                'size-3 shrink-0 transition-transform duration-150',
                                isSelected ? 'text-brand-800 opacity-100' : 'text-ink-300 opacity-0 group-hover:opacity-100'
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-ink-200/60 mt-1.5">
                      <Link
                        href="/programs"
                        onClick={() => setActiveMenu(null)}
                        className="group flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-ink-800 shadow-2xs ring-1 ring-ink-200/60 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        <span>Explore All Programs</span>
                        <ArrowRight className="size-3 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-800" />
                      </Link>
                    </div>
                  </div>

                  {/* Center Master Area: 2 Generous Content Columns for Degrees */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Stream Header */}
                      <div className="mb-2.5 flex items-center justify-between border-b border-ink-100 pb-2">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display text-sm font-bold text-ink-900">
                            {currentStream.name}
                          </h3>
                        </div>
                        <Link
                          href={`/programs?stream=${currentStream.slug}`}
                          onClick={() => setActiveMenu(null)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-800 hover:text-brand-950 hover:underline"
                        >
                          <span>View all in stream</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>

                      {/* Scrollable Degree Groups Grid */}
                      <div className="max-h-[17.5rem] overflow-y-auto pr-3 menu-scrollbar">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {currentStream.degrees.map((degGroup) => (
                            <div key={degGroup.degreeName} className="space-y-1">
                              <div className="border-b border-ink-100 pb-1 flex items-baseline justify-between">
                                <Link
                                  href={`/${degGroup.degreeSlug}`}
                                  onClick={() => setActiveMenu(null)}
                                  className="group/title flex items-center gap-1 text-xs font-bold text-ink-900 hover:text-brand-800 transition-colors truncate pr-2"
                                  title={`View all ${degGroup.degreeName} specialisations & fees`}
                                >
                                  <span className="truncate">{degGroup.degreeName}</span>
                                  <ArrowRight className="size-2.5 opacity-0 transition-opacity group-hover/title:opacity-100 shrink-0 text-brand-700" />
                                </Link>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-800 shrink-0">
                                  {degGroup.level}
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                {degGroup.specializations.map((spec) => (
                                  <Link
                                    key={spec.slug}
                                    href={`/${spec.slug}`}
                                    onClick={() => setActiveMenu(null)}
                                    className="group flex items-center justify-between rounded-md px-2 py-1 text-[11px] text-ink-700 transition-colors hover:bg-brand-50/80 hover:text-brand-950"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                      <span className="font-medium group-hover:font-semibold group-hover:translate-x-0.5 transition-transform duration-150 truncate">
                                        {spec.name}
                                      </span>
                                      {spec.isHot ? (
                                        <span className="rounded px-1 py-0.2 text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 leading-none shrink-0">
                                          HOT
                                        </span>
                                      ) : null}
                                      {spec.isNew ? (
                                        <span className="rounded px-1 py-0.2 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 leading-none shrink-0">
                                          NEW
                                        </span>
                                      ) : null}
                                    </div>
                                    {spec.startingEmi ? (
                                      <span className="text-[10px] font-medium text-ink-400 group-hover:text-emerald-700 shrink-0">
                                        {spec.startingEmi}
                                      </span>
                                    ) : null}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compact Footer Bar (Single Line) */}
                    <div className="pt-2 border-t border-ink-100 mt-2 flex items-center justify-between text-[11px] text-ink-500">
                      <Link
                        href="/programs"
                        onClick={() => setActiveMenu(null)}
                        className="shrink-0 font-semibold text-brand-800 hover:underline"
                      >
                        Explore all degrees →
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Top Offering Colleges & Actions Card */}
                  <div className="w-68 shrink-0 flex flex-col justify-between rounded-xl border border-ink-200/90 bg-gradient-to-b from-brand-50/40 via-ink-50/30 to-white p-3.5">
                    <div>
                      <div className="flex items-center justify-between border-b border-ink-200/70 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                          <Building2 className="size-3.5 text-brand-700" />
                          <span>Top Offering Colleges</span>
                        </div>
                      </div>

                      <div className="mt-2 divide-y divide-ink-100">
                        {currentStream.topUniversities.map((univ) => (
                          <Link
                            key={univ.slug}
                            href={`/university/${univ.slug}`}
                            onClick={() => setActiveMenu(null)}
                            className="group flex items-center justify-between py-1.5 transition-colors hover:bg-white px-1.5 rounded-lg"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-[11px] font-bold text-ink-900 group-hover:text-brand-800 truncate">
                                {univ.name}
                              </p>
                              <p className="text-[10px] text-ink-500">
                                {univ.monthlyEmi ? `Starting: ${univ.monthlyEmi}` : `Fee: ${univ.startingFee}`}
                              </p>
                            </div>
                            {univ.naacGrade ? (
                              <span className="shrink-0 rounded bg-gold-50 px-1.5 py-0.2 text-[9px] font-bold text-gold-800 border border-gold-200/80">
                                NAAC {univ.naacGrade}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-ink-200/70 pt-2.5">
                      <Link
                        href={currentStream.quickTools.compareHref}
                        onClick={() => setActiveMenu(null)}
                        className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-900 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-950"
                      >
                        <Scale className="size-3 text-gold-300" />
                        <span>Compare Top Universities</span>
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>

                      <Link
                        href="/common-application-form"
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white py-1.5 text-[10px] font-bold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
                      >
                        <CreditCard className="size-3 text-brand-700" />
                        <span>Check Fee Waiver & Instalment Plans</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PANEL 2: TOP UNIVERSITIES */}
              {/* ------------------------------------------------------------- */}
              {activeMenu === 'universities' && currentUnivCat && (
                <div className="flex gap-6 items-stretch">
                  {/* Left Categories Sidebar */}
                  <div className="w-60 shrink-0 flex flex-col justify-between rounded-xl bg-ink-50/70 p-2 border border-ink-100">
                    <div className="space-y-0.5">
                      <p className="mb-1.5 px-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
                        Accreditations
                      </p>
                      {data.universityCategories.map((cat) => {
                        const isSelected = cat.id === activeUnivCatId;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onMouseEnter={() => setActiveUnivCatId(cat.id)}
                            onClick={() => setActiveUnivCatId(cat.id)}
                            className={cn(
                              'group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-150',
                              isSelected
                                ? 'bg-white font-bold text-brand-900 shadow-xs ring-1 ring-ink-200/70 border-l-2 border-brand-800'
                                : 'font-medium text-ink-700 hover:bg-white/80 hover:text-ink-950'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <Building2
                                className={cn(
                                  'size-3.5 shrink-0 transition-colors',
                                  isSelected ? 'text-brand-800' : 'text-ink-400 group-hover:text-brand-700'
                                )}
                              />
                              <span className="leading-snug text-[11px] font-medium">{cat.name}</span>
                            </span>
                            <ArrowRight
                              className={cn(
                                'size-3 shrink-0 transition-transform duration-150',
                                isSelected ? 'text-brand-800 opacity-100' : 'text-ink-300 opacity-0 group-hover:opacity-100'
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-ink-200/60 mt-1.5">
                      <Link
                        href="/universities"
                        onClick={() => setActiveMenu(null)}
                        className="group flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-ink-800 shadow-2xs ring-1 ring-ink-200/60 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        <span>All Universities</span>
                        <ArrowRight className="size-3 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-800" />
                      </Link>
                    </div>
                  </div>

                  {/* Center Master Area: University Cards Grid */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="mb-2.5 flex items-center justify-between border-b border-ink-100 pb-2">
                        <div>
                          <h3 className="font-display text-sm font-bold text-ink-900">{currentUnivCat.name}</h3>
                          <p className="text-[11px] text-ink-500">{currentUnivCat.description}</p>
                        </div>
                        <Link
                          href="/universities"
                          onClick={() => setActiveMenu(null)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-800 hover:underline"
                        >
                          <span>View all institutions</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>

                      {/* Scrollable University Cards Grid */}
                      <div className="max-h-[17.5rem] overflow-y-auto pr-3 menu-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                          {currentUnivCat.universities.map((univ) => (
                            <Link
                              key={univ.slug}
                              href={`/university/${univ.slug}`}
                              onClick={() => setActiveMenu(null)}
                              className="group flex flex-col justify-between rounded-xl border border-ink-200/80 bg-white p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-xs"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-display text-xs font-bold text-ink-900 group-hover:text-brand-800 truncate">
                                    {univ.name}
                                  </span>
                                  {univ.naacGrade ? (
                                    <span className="shrink-0 rounded bg-gold-50 px-1.5 py-0.2 text-[9px] font-extrabold text-gold-800 border border-gold-200">
                                      NAAC {univ.naacGrade}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[10px] text-ink-500">
                                  Starting fee: <strong className="text-ink-800">{univ.startingFee}</strong>
                                </p>
                              </div>

                              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-1.5 text-[10px] font-semibold text-brand-800">
                                <span>{univ.monthlyEmi ? `Starting: ${univ.monthlyEmi}` : 'View Approvals & Degrees'}</span>
                                <ArrowRight className="size-2.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compact Footer Bar (Single Line) */}
                    <div className="pt-2 border-t border-ink-100 mt-2 flex items-center justify-between text-[11px] text-ink-500">
                      <span className="truncate pr-3">✓ Direct University Admissions • No Middlemen Fees</span>
                      <Link
                        href="/compare"
                        onClick={() => setActiveMenu(null)}
                        className="shrink-0 font-semibold text-brand-800 hover:underline"
                      >
                        Compare universities →
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Statutory Proof Card */}
                  <div className="w-68 shrink-0 flex flex-col justify-between rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 p-3.5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        <ShieldCheck className="size-3 text-emerald-600" />
                        University details
                      </div>
                      <h4 className="mt-2 font-display text-xs font-bold text-ink-900">
                        Compare published information
                      </h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-600">
                        Review each university’s published approvals and course details.
                      </p>

                      <div className="mt-2.5 space-y-1.5 text-[11px] font-medium text-ink-700">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          <span>Approvals</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          <span>Affiliations</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                          <span>Course details</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-emerald-100 pt-2.5">
                      <Link
                        href="/compare"
                        onClick={() => setActiveMenu(null)}
                        className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-900 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-950"
                      >
                        <Scale className="size-3 text-gold-300" />
                        <span>Compare Universities</span>
                      </Link>
                      <Link
                        href="/about-us"
                        onClick={() => setActiveMenu(null)}
                        className="block text-center text-[10px] font-semibold text-brand-800 hover:underline"
                      >
                        How We Verify Accreditations →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
