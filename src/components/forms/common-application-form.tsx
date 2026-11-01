'use client';

import { useState, useMemo, useActionState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  GraduationCap,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User,
  MapPin,
  Briefcase,
  Wallet,
  Clock,
  BookOpen,
  Check,
  } from 'lucide-react';

import { FormMessage } from '@/components/forms/field';
import { Button } from '@/components/ui/button';
import { submitEnquiry } from '@/lib/actions';
import { IDLE, type FormState } from '@/lib/form-state';
import { cn } from '@/lib/cn';

export interface AvailableProgram {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  stream: string;
  level: string;
  duration: string;
  specializations: string[];
  popular?: boolean;
}

export interface AvailableUniversity {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  naac: string;
  nirf?: string;
  ugcApproved: boolean;
  popular?: boolean;
}

const QUALIFICATIONS = ['Graduation completed', 'Graduation final year', '12th pass', 'Diploma', 'Post graduation'];
const WORK_EXPERIENCES = ['Student / Fresher', '1–3 years', '3–5 years', '5+ years'];
// These are student preferences, not promises of university fees or intakes.
const BUDGET_PREFERENCES = ['Not decided', 'Under ₹50,000', '₹50,000–₹1,00,000', '₹1,00,000–₹2,00,000', 'Above ₹2,00,000'];
const INTAKE_PREFERENCES = ['As soon as available', 'Next academic session', 'Still exploring'];

interface CommonAppFormProps {
  initialUniversitySlug?: string;
  initialProgramSlug?: string;
  programsList?: AvailableProgram[];
  universitiesList?: AvailableUniversity[];
}

export function CommonApplicationForm({
  initialUniversitySlug,
  initialProgramSlug,
  programsList = [],
  universitiesList = [],
}: CommonAppFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(submitEnquiry, IDLE);

  // Step state (1: Program, 2: University & Plan, 3: Student Details)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Program search & selection
  const [programSearch, setProgramSearch] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<AvailableProgram | null>(() => {
    if (initialProgramSlug) {
      return (
        programsList.find(
          (p) =>
            p.slug === initialProgramSlug ||
            p.slug === `online-${initialProgramSlug}` ||
            initialProgramSlug.includes(p.slug)
        ) || programsList[0] || null
      );
    }
    return programsList[0] ?? null;
  });

  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');

  // University selection
  const [universitySearch, setUniversitySearch] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>(() => {
    if (initialUniversitySlug) {
      const found = universitiesList.find((u) => u.slug === initialUniversitySlug);
      return found ? found.name : 'Top Recommended Universities (Let Advisor Match Best 3)';
    }
    return 'Top Recommended Universities (Let Advisor Match Best 3)';
  });

  // Profiler preferences
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [workExp, setWorkExp] = useState(WORK_EXPERIENCES[0]);
  const [budget, setBudget] = useState(BUDGET_PREFERENCES[0]);
  const [intake, setIntake] = useState(INTAKE_PREFERENCES[0]);

  // Form error highlighter
  const invalid = (field: string) => state.invalid?.includes(field);

  // Streams list for filter chips
  const allStreams = useMemo(() => {
    const s = new Set<string>();
    programsList.forEach((p) => s.add(p.stream));
    return ['All', ...Array.from(s)];
  }, [programsList]);

  // Filtered programs based on search query and stream filter
  const filteredPrograms = useMemo(() => {
    const q = programSearch.toLowerCase().trim();
    return programsList.filter((p) => {
      const matchStream = selectedStream === 'All' || p.stream === selectedStream;
      if (!matchStream) return false;
      if (!q) return true;

      const matchName =
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.stream.toLowerCase().includes(q);

      const matchSpec = p.specializations.some((spec) => spec.toLowerCase().includes(q));

      return matchName || matchSpec;
    });
  }, [programsList, programSearch, selectedStream]);

  // Filtered universities based on search
  const filteredUniversities = useMemo(() => {
    const q = universitySearch.toLowerCase().trim();
    if (!q) return universitiesList;
    return universitiesList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.naac.toLowerCase().includes(q)
    );
  }, [universitiesList, universitySearch]);

  // Handle program selection
  const handleSelectProgram = (p: AvailableProgram) => {
    setSelectedProgram(p);
    // Reset or auto-select first specialization
    if (p.specializations.length > 0) {
      setSelectedSpecialization(p.specializations[0]);
    } else {
      setSelectedSpecialization('');
    }
  };

  // Build the rich context message for CMS submission
  const formattedMessage = useMemo(() => {
    const parts = [
      `[COMMON APPLICATION FORM - ADMISSION REQUEST]`,
      `Applied Program: ${selectedProgram?.name || 'program'} (${selectedProgram?.shortName || ''})`,
      selectedSpecialization ? `Selected Specialization: ${selectedSpecialization}` : null,
      `Target University: ${selectedUniversity}`,
      `Highest Qualification: ${qualification}`,
      `Work Experience: ${workExp}`,
      `Fee Budget / Plan: ${budget}`,
      `Admission Intake: ${intake}`,
    ];
    return parts.filter(Boolean).join('\n');
  }, [
    selectedProgram,
    selectedSpecialization,
    selectedUniversity,
    qualification,
    workExp,
    budget,
    intake,
  ]);

  if (state.status === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-card text-center animate-fade-in">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-2xs font-extrabold text-emerald-800 ring-1 ring-emerald-200">
          <Sparkles className="size-3.5 text-emerald-600" />
          <span>Application Confirmed &amp; Queued</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">
          Common Application Form Received!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600 max-w-lg mx-auto">
          Your application for <strong>{selectedProgram?.shortName || 'program'}</strong> ({selectedSpecialization || 'Core Track'})
          has been securely routed to our senior academic counselor team.
        </p>

        {/* Application details card */}
        <div className="mt-6 mx-auto max-w-md rounded-2xl border border-ink-150 bg-ink-50/70 p-4.5 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-ink-200 pb-2">
            <span className="text-ink-500">Degree Program:</span>
            <span className="font-bold text-ink-900">{selectedProgram?.shortName}</span>
          </div>
          {selectedSpecialization ? (
            <div className="flex justify-between border-b border-ink-200 pb-2">
              <span className="text-ink-500">Specialization:</span>
              <span className="font-bold text-ink-900 text-right">{selectedSpecialization}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-b border-ink-200 pb-2">
            <span className="text-ink-500">University Choice:</span>
            <span className="font-bold text-ink-900 text-right">{selectedUniversity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Fee Plan:</span>
            <span className="font-bold text-emerald-800">{budget}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/universities"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-800 transition-colors"
          >
            <span>Explore Universities</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 rounded-pill border border-ink-300 bg-white px-5 py-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <span>Compare Colleges</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 sm:p-8 lg:p-10 shadow-card">
      {/* =================================================================== */}
      {/* STEPPER PROGRESS BAR */}
      {/* =================================================================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b border-ink-150 pb-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={cn(
              'flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors',
              currentStep === 1 ? 'text-brand-900' : 'text-ink-500 hover:text-ink-800'
            )}
          >
            <span
              className={cn(
                'flex size-6 sm:size-7 items-center justify-center rounded-full text-2xs font-extrabold transition-all',
                currentStep === 1
                  ? 'bg-brand-900 text-white shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-ink-100 text-ink-600'
              )}
            >
              {currentStep > 1 ? <Check className="size-3.5" /> : '1'}
            </span>
            <span className="hidden sm:inline">1. Choose Program</span>
            <span className="sm:hidden">Program</span>
          </button>

          <div className="h-0.5 w-6 sm:w-12 bg-ink-200" />

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={cn(
              'flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors',
              currentStep === 2 ? 'text-brand-900' : 'text-ink-500 hover:text-ink-800'
            )}
          >
            <span
              className={cn(
                'flex size-6 sm:size-7 items-center justify-center rounded-full text-2xs font-extrabold transition-all',
                currentStep === 2
                  ? 'bg-brand-900 text-white shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-ink-100 text-ink-600'
              )}
            >
              {currentStep > 2 ? <Check className="size-3.5" /> : '2'}
            </span>
            <span className="hidden sm:inline">2. University &amp; Plan</span>
            <span className="sm:hidden">University</span>
          </button>

          <div className="h-0.5 w-6 sm:w-12 bg-ink-200" />

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={cn(
              'flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors',
              currentStep === 3 ? 'text-brand-900' : 'text-ink-500 hover:text-ink-800'
            )}
          >
            <span
              className={cn(
                'flex size-6 sm:size-7 items-center justify-center rounded-full text-2xs font-extrabold transition-all',
                currentStep === 3
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'bg-ink-100 text-ink-600'
              )}
            >
              3
            </span>
            <span className="hidden sm:inline">3. Student Profile</span>
            <span className="sm:hidden">Profile</span>
          </button>
        </div>
      </div>

      <form action={formAction} noValidate className="space-y-6">
        <input type="hidden" name="source" value="application-form" />
        <input type="hidden" name="university" value={selectedUniversity} />
        <input type="hidden" name="program" value={selectedProgram?.slug || ''} />
        <input type="hidden" name="message" value={formattedMessage} />

        <FormMessage status={state.status} message={state.message} />

        {/* =================================================================== */}
        {/* STEP 1: PROGRAM & SPECIALIZATION SELECTION */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-ink-950">
                Step 1: Select Your Degree &amp; Specialization
              </h2>
              <p className="mt-1 text-xs text-ink-600">
                Search or select the UGC-DEB entitled degree you want to pursue.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                <Search className="size-4 text-brand-700" />
              </div>
              <input
                type="text"
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                placeholder="Search degree, specialization or domain (e.g. MBA, AI & ML, FinTech, MCA, BBA, Data Science)..."
                className="w-full rounded-2xl border border-ink-250 bg-white py-3 pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15"
              />
              {programSearch && (
                <button
                  type="button"
                  onClick={() => setProgramSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-ink-400 hover:text-ink-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Stream Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {allStreams.map((stream) => (
                <button
                  key={stream}
                  type="button"
                  onClick={() => setSelectedStream(stream)}
                  className={cn(
                    'rounded-pill px-3 py-1 text-2xs font-semibold transition-all',
                    selectedStream === stream
                      ? 'bg-brand-900 text-white shadow-2xs'
                      : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                  )}
                >
                  {stream}
                </button>
              ))}
            </div>

            {/* Programs Grid */}
            <div className="grid gap-3 sm:grid-cols-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((prog) => {
                  const isSelected = selectedProgram?.id === prog.id;
                  return (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => handleSelectProgram(prog)}
                      className={cn(
                        'flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all',
                        isSelected
                          ? 'border-brand-800 bg-brand-50/60 ring-2 ring-brand-800/20 shadow-2xs'
                          : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-ink-50/50'
                      )}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-sm font-bold text-ink-950">
                              {prog.shortName}
                            </span>
                            {prog.popular ? (
                              <span className="rounded-md bg-gold-100 px-1.5 py-0.2 text-[9px] font-extrabold text-gold-900 border border-gold-300">
                                Popular
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-2xs text-ink-500 line-clamp-1">
                            {prog.name}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-all',
                            isSelected
                              ? 'border-brand-800 bg-brand-800 text-white'
                              : 'border-ink-300 bg-white'
                          )}
                        >
                          {isSelected ? <Check className="size-3" /> : null}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-3xs text-ink-500">
                        <span className="rounded bg-ink-100 px-1.5 py-0.5 font-medium text-ink-700">
                          {prog.stream}
                        </span>
                        <span>•</span>
                        <span>{prog.duration}</span>
                        <span>•</span>
                        <span>{prog.level}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-ink-300 p-6 text-center text-xs text-ink-500">
                  No programs found matching &ldquo;{programSearch}&rdquo;. Try another term or choose from all streams.
                </div>
              )}
            </div>

            {/* Specializations Dropdown / Chips for selected program */}
            {selectedProgram && selectedProgram.specializations.length > 0 && (
              <div className="rounded-2xl border border-brand-200/80 bg-brand-50/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-brand-800" />
                    <span>Choose Specialization for {selectedProgram.shortName}:</span>
                  </label>
                  <span className="text-3xs text-ink-500">
                    {selectedProgram.specializations.length} tracks available
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedProgram.specializations.map((spec) => {
                    const isSpecSelected = selectedSpecialization === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSelectedSpecialization(spec)}
                        className={cn(
                          'rounded-xl px-3 py-1.5 text-2xs font-semibold transition-all',
                          isSpecSelected
                            ? 'bg-brand-900 text-white shadow-2xs'
                            : 'bg-white text-ink-700 border border-ink-200 hover:border-brand-400 hover:bg-brand-50/50'
                        )}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="accent"
                size="md"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl px-6 font-bold shadow-md"
              >
                <span>Next: Choose University</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: UNIVERSITY & PLAN PREFERENCE */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-ink-950">
                Step 2: University &amp; Budget Preference
              </h2>
              <p className="mt-1 text-xs text-ink-600">
                Pick a university or ask an advisor for help with your selection.
              </p>
            </div>

            {/* University Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-brand-800" />
                <span>Preferred University</span>
              </label>

              {/* Recommended Top Option */}
              <button
                type="button"
                onClick={() =>
                  setSelectedUniversity('Top Recommended Universities (Let Advisor Match Best 3)')
                }
                className={cn(
                  'w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all',
                  selectedUniversity ===
                    'Top Recommended Universities (Let Advisor Match Best 3)'
                    ? 'border-brand-800 bg-brand-50/70 ring-2 ring-brand-800/20 shadow-2xs'
                    : 'border-ink-200 bg-white hover:border-brand-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-900 border border-gold-200">
                    <Sparkles className="size-4 text-gold-700" />
                  </div>
                  <div>
                    <p className="font-display text-xs sm:text-sm font-bold text-ink-950">
                      Auto-Match Top 3 Universities (Recommended)
                    </p>
                    <p className="text-2xs text-ink-500">
                      Advisor compares UGC approval, lowest semester fees &amp; placement records
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border transition-all',
                    selectedUniversity ===
                      'Top Recommended Universities (Let Advisor Match Best 3)'
                      ? 'border-brand-800 bg-brand-800 text-white'
                      : 'border-ink-300 bg-white'
                  )}
                >
                  {selectedUniversity ===
                  'Top Recommended Universities (Let Advisor Match Best 3)' ? (
                    <Check className="size-3" />
                  ) : null}
                </div>
              </button>

              {/* University Search box */}
              <div className="relative pt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 pt-1 text-ink-400">
                  <Search className="size-3.5 text-brand-700" />
                </div>
                <input
                  type="text"
                  value={universitySearch}
                  onChange={(e) => setUniversitySearch(e.target.value)}
                  placeholder="Search specific university (e.g. VGU, Manipal, DPU, Amity, Chandigarh, LPU)..."
                  className="w-full rounded-xl border border-ink-250 bg-white py-2 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800"
                />
              </div>

              {/* University List Grid */}
              <div className="grid gap-2.5 sm:grid-cols-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredUniversities.map((uni) => {
                  const isSelected = selectedUniversity === uni.name;
                  return (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => setSelectedUniversity(uni.name)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-left transition-all',
                        isSelected
                          ? 'border-brand-800 bg-brand-50/60 ring-1 ring-brand-800/30'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      )}
                    >
                      <div className="pr-2">
                        <p className="text-xs font-bold text-ink-900 line-clamp-1">{uni.name}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-3xs">
                          <span className="rounded bg-ink-100 px-1.5 py-0.2 font-semibold text-ink-700">
                            {uni.naac}
                          </span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-semibold text-emerald-800 border border-emerald-200">
                            UGC-DEB
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-full border transition-all',
                          isSelected
                            ? 'border-brand-800 bg-brand-800 text-white'
                            : 'border-ink-300 bg-white'
                        )}
                      >
                        {isSelected ? <Check className="size-2.5" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fee Budget & Intake */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-brand-800" />
                  <span>Fee Plan / Budget Preference</span>
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-ink-250 bg-white py-2.5 px-3 text-xs text-ink-900 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800"
                >
                  {BUDGET_PREFERENCES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-brand-800" />
                  <span>Target Admission Intake</span>
                </label>
                <select
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="w-full rounded-xl border border-ink-250 bg-white py-2.5 px-3 text-xs text-ink-900 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800"
                >
                  {INTAKE_PREFERENCES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                variant="accent"
                size="md"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl px-6 font-bold shadow-md"
              >
                <span>Next: Student Details</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: STUDENT PROFILE & CONTACT DETAILS */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-ink-950">
                Step 3: Student Profile &amp; Contact Details
              </h2>
              <p className="mt-1 text-xs text-ink-600">
                Provide your contact details so our certified academic mentor can verify eligibility and share official university brochures.
              </p>
            </div>

            {/* Live Chosen Summary Badge */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-2xs font-extrabold uppercase tracking-wider text-brand-800">
                  Application Summary:
                </span>
                <p className="font-bold text-ink-950 mt-0.5">
                  {selectedProgram?.shortName} {selectedSpecialization ? `• ${selectedSpecialization}` : ''}
                </p>
                <p className="text-2xs text-ink-600">
                  University: <span className="font-medium text-ink-900">{selectedUniversity}</span> • {budget}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-2xs font-bold text-brand-800 underline hover:text-brand-900"
              >
                Change Program
              </button>
            </div>

            {/* Academic Profiler Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-800 flex items-center gap-1">
                  <GraduationCap className="size-3.5 text-brand-700" />
                  <span>Highest Qualification</span>
                </label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full rounded-xl border border-ink-250 bg-white py-2.5 px-3 text-xs text-ink-900 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800"
                >
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-800 flex items-center gap-1">
                  <Briefcase className="size-3.5 text-brand-700" />
                  <span>Work Experience</span>
                </label>
                <select
                  value={workExp}
                  onChange={(e) => setWorkExp(e.target.value)}
                  className="w-full rounded-xl border border-ink-250 bg-white py-2.5 px-3 text-xs text-ink-900 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-1 focus:ring-brand-800"
                >
                  {WORK_EXPERIENCES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information Fields */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="caf-name" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
                  <span>Student Full Name</span>
                  <span className="text-danger-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                    <User className="size-4" />
                  </div>
                  <input
                    id="caf-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="e.g. Vikram Verma"
                    aria-invalid={invalid('name')}
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                      'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                      invalid('name') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
                    )}
                  />
                </div>
                {invalid('name') ? (
                  <p className="text-xs font-medium text-danger-600">Please enter your full name.</p>
                ) : null}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label htmlFor="caf-phone" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
                  <span>Mobile (WhatsApp Enabled)</span>
                  <span className="text-danger-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                    <Phone className="size-4" />
                  </div>
                  <input
                    id="caf-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="98765 43210"
                    aria-invalid={invalid('phone')}
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                      'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                      invalid('phone') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
                    )}
                  />
                </div>
                {invalid('phone') ? (
                  <p className="text-xs font-medium text-danger-600">Please enter a valid 10-digit mobile number.</p>
                ) : null}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="caf-email" className="flex items-center gap-0.5 text-xs font-semibold text-ink-800">
                  <span>Email Address</span>
                  <span className="text-danger-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="caf-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="vikram@example.com"
                    aria-invalid={invalid('email')}
                    className={cn(
                      'w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all',
                      'focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15',
                      invalid('email') ? 'border-danger-500 bg-danger-50/50' : 'border-ink-250 hover:border-ink-300'
                    )}
                  />
                </div>
                {invalid('email') ? (
                  <p className="text-xs font-medium text-danger-600">Please enter a valid email address.</p>
                ) : null}
              </div>

              {/* City / State */}
              <div className="space-y-1.5">
                <label htmlFor="caf-city" className="text-xs font-semibold text-ink-800 block">
                  Current City / State
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                    <MapPin className="size-4" />
                  </div>
                  <input
                    id="caf-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="e.g. Jaipur, Rajasthan"
                    className="w-full rounded-xl border border-ink-250 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs focus:border-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800/15"
                  />
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 size-4 rounded border-ink-300 text-brand-800 focus:ring-brand-800/30"
                />
                <span className="text-xs leading-relaxed text-ink-600">
                  I agree to submit my Common Application details for university counseling and admission guidance. I agree that Agrico may contact me about my application in accordance with the{' '}
                  <Link
                    href="/privacy-policy"
                    className="font-bold text-brand-800 underline hover:text-brand-900"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {invalid('consent') ? (
                <p className="mt-1 text-xs font-medium text-danger-600">Please accept the consent to submit.</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="rounded-xl px-8 font-extrabold shadow-lg bg-brand-900 hover:bg-brand-800 text-white"
              >
                <span>Submit Common Application</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
