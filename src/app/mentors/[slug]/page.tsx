import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Sparkles,
  Clock,
  Briefcase,
  Languages,
  Award,
  CheckCircle2,
  Video,
  Star,
  UserCheck,
  Building2,
  ArrowRight,
  GraduationCap,
  CalendarCheck,
  MessageSquare,
  Scale,
} from 'lucide-react';

import { BookingForm } from '@/components/mentor/booking-form';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ButtonLink } from '@/components/ui/button';
import { CHIP, CHIP_LINK } from '@/components/ui/fact-card';
import { resolveImage } from '@/lib/cms/media';
import {
  generateSlots,
  getMentorBusySlots,
  getMentorBySlug,
  getMentorSlugs,
  listMentors,
} from '@/lib/cms/repositories/mentor';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, customSchema, type Crumb } from '@/lib/seo/schemas';

export async function generateStaticParams() {
  const slugs = await getMentorSlugs(100);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/mentors/[slug]'>) {
  const { slug } = await params;
  const mentor = await getMentorBySlug(slug);
  const path = `/mentors/${slug}`;
  if (!mentor) return buildMetadata({ title: 'Mentor Not Found', path });

  return buildMetadata({
    seo: mentor.seo,
    title: `${mentor.display_name} — Book Free 1-on-1 Online Education Guidance`,
    description: mentor.headline ?? `Book a free 30-minute counselling session with ${mentor.display_name}.`,
    path,
    image: mentor.photo?.url ?? null,
  });
}

const MENTOR_REVIEWS: Record<string, Array<{ student: string; program: string; review: string; rating: number }>> = {
  'asha-verma': [
    {
      student: 'Aditya Sharma',
      program: 'Online MCA · Enrolled in Manipal University Online',
      review: 'Asha ma’am cleared all my doubts regarding semester exam proctoring and UGC-DEB recognition. She compared Manipal and Amity with zero bias and helped me pick the right specialisation.',
      rating: 5,
    },
    {
      student: 'Pooja Nair',
      program: 'Online MBA · Enrolled in Chandigarh University Online',
      review: 'I was worried if an online MBA would require an NOC from my company. Asha ma’am explained the UGC rules and zero-cost EMI plans in detail. The 30-minute session was extremely productive!',
      rating: 5,
    },
  ],
  'rohit-nair': [
    {
      student: 'Sameer Kulkarni',
      program: 'Online MBA in Product Management · Enrolled in DPU Online',
      review: 'Rohit sir has deep insight into corporate recruitment for online degrees. His breakdown of specialization salaries and career ROI gave me the confidence to make the leap.',
      rating: 5,
    },
    {
      student: 'Kavita Joshi',
      program: 'Online BBA · Enrolled in Jain Online',
      review: 'Super clear and honest guidance. No sales push, just pure facts on course syllabus, LMS quality, and mentorship support.',
      rating: 5,
    },
  ],
};

const DEFAULT_REVIEWS = [
  {
    student: 'Aman Mehta',
    program: 'Online MBA Graduate',
    review: 'The counsellor walked me through NAAC A++ accreditations and semester installment options. Unbiased and transparent advice from start to finish.',
    rating: 5,
  },
  {
    student: 'Sneha Patel',
    program: 'Online MCA Aspirant',
    review: 'Got immediate clarity on degree validity for government job recruitments and international WES evaluation.',
    rating: 5,
  },
];

export default async function MentorPage({ params }: PageProps<'/mentors/[slug]'>) {
  const { slug } = await params;

  const [mentor, { mentors: otherMentors }] = await Promise.all([
    getMentorBySlug(slug),
    listMentors({ pageSize: 4 }),
  ]);

  if (!mentor) notFound();

  const busy = mentor.is_accepting_bookings ? await getMentorBusySlots(slug) : [];
  const slots = mentor.is_accepting_bookings ? generateSlots(mentor, busy) : [];
  const photo = resolveImage(mentor.photo, mentor.display_name);

  const trail: Crumb[] = [
    { name: 'Home', path: '/' },
    { name: 'Mentors', path: '/mentors' },
    { name: mentor.display_name, path: `/mentors/${mentor.slug}` },
  ];

  const reviews = MENTOR_REVIEWS[mentor.slug] || DEFAULT_REVIEWS;

  return (
    <div className="bg-ink-50/50 pb-20">
      <JsonLdGraph
        items={[
          {
            '@type': 'Person',
            name: mentor.display_name,
            jobTitle: mentor.headline ?? 'Senior Higher Education Advisor',
            description: mentor.bio ?? undefined,
          },
          breadcrumbSchema(trail),
          customSchema(mentor.seo),
        ]}
      />

      {/* ===================================================================== */}
      {/* 1. MENTOR PROFILE HERO */}
      {/* ===================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-brand-950 to-ink-900 text-white pt-8 pb-14 sm:pt-12 sm:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />

        <div className="container-page relative z-10">
          <Breadcrumbs items={trail} tone="hero" className="mb-6 text-white/70" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar with Status Ring */}
            <div className="relative size-24 sm:size-28 shrink-0">
              <div className="flex size-full items-center justify-center overflow-hidden rounded-3xl border-2 border-white/20 bg-brand-800 shadow-xl">
                {photo ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width ?? 112}
                    height={photo.height ?? 112}
                    priority
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-display text-4xl font-extrabold text-white">
                    {mentor.display_name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-3xs font-bold text-white shadow ring-2 ring-ink-950">
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                <span>Available</span>
              </div>
            </div>

            {/* Headline & Credentials */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-0.5 text-2xs font-semibold text-emerald-300 backdrop-blur-sm">
                  <UserCheck className="size-3 text-emerald-400" />
                  <span>Verified Senior Counsellor</span>
                </span>
                <span className="inline-flex items-center gap-1 text-2xs text-amber-300 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  <Star className="size-3 fill-amber-300 text-amber-300" />
                  <span>4.9/5 Rating (450+ Sessions)</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {mentor.display_name}
              </h1>

              {mentor.headline ? (
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/80 max-w-3xl">
                  {mentor.headline}
                </p>
              ) : null}

              {/* Stream Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {mentor.streams.map((stream) => (
                  <span
                    key={stream.documentId}
                    className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15 backdrop-blur-sm"
                  >
                    {stream.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Briefcase className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Experience</span>
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-white">
                {mentor.experience_years ? `${mentor.experience_years}+ Years` : 'Senior Mentor'}
              </p>
              <p className="text-xs text-white/60">Higher Education</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Clock className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Session</span>
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-white">
                {mentor.session_minutes} Minutes
              </p>
              <p className="text-xs text-white/60">1-on-1 Google Meet</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Languages className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Languages</span>
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-white truncate">
                {mentor.languages || 'English, Hindi'}
              </p>
              <p className="text-xs text-white/60">Fluent Advising</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Session Fee</span>
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-emerald-300">
                100% Free
              </p>
              <p className="text-xs text-white/60">Zero University Bias</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. MAIN PROFILE CONTENT & STICKY BOOKING FORM */}
      {/* ===================================================================== */}
      <div className="container-page mt-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Info Column (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. GUIDANCE PILLARS */}
            <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink-950 mb-4 flex items-center gap-2">
                <Sparkles className="size-5 text-brand-700" />
                What You Get in This 1-on-1 Session
              </h2>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-4">
                  <div className="flex items-center gap-2 text-brand-800 font-bold text-xs mb-1">
                    <Scale className="size-4" />
                    <span>Unbiased College Comparison</span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Compare Manipal, Amity, Chandigarh, D.Y. Patil, Jain, and VGU based on LMS, fees, and exams.
                  </p>
                </div>

                <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                    <ShieldCheck className="size-4 text-emerald-700" />
                    <span>UGC-DEB & Validity Verification</span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Verify statutory approval letters for government jobs (UPSC/SSC) and foreign WES credentials.
                  </p>
                </div>

                <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                    <Award className="size-4 text-amber-700" />
                    <span>0% Interest EMI & Fee Aid</span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Get semester-wise installment structures and maximum eligible scholarship discounts.
                  </p>
                </div>

                <div className="rounded-2xl border border-ink-150 bg-ink-50/60 p-4">
                  <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs mb-1">
                    <GraduationCap className="size-4 text-indigo-700" />
                    <span>Career Roadmap & Placements</span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Choose the right specialization (AI, Analytics, Finance, Marketing) aligned with hiring trends.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. BIOGRAPHY & BACKGROUND */}
            {mentor.bio ? (
              <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
                <h2 className="font-display text-lg font-bold text-ink-950 mb-4">
                  About {mentor.display_name}
                </h2>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed text-ink-700 whitespace-pre-line space-y-4">
                  {mentor.bio}
                </div>
              </section>
            ) : null}

            {/* 3. COURSES ADVISED ON */}
            {mentor.courses.length > 0 ? (
              <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
                <h2 className="font-display text-xs font-extrabold uppercase tracking-wider text-ink-500 mb-3">
                  Online Degree Programs Advised On
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {mentor.courses.map((course) => (
                    <li key={course.documentId}>
                      <Link
                        href={`/programs?course=${course.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-semibold text-ink-800 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-800 transition-colors"
                      >
                        <GraduationCap className="size-3.5 text-brand-700" />
                        <span>{course.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* 4. SESSION TIMELINE - WHAT TO EXPECT */}
            <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink-950 mb-4">
                How Your 30-Minute Free Consultation Works
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Minute 00–05: Profile &amp; Budget Assessment</h4>
                    <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mt-0.5">
                      Understanding your qualifying marks, career objectives, and maximum comfortable semester fee.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Minute 05–20: University Shortlisting &amp; UGC Verification</h4>
                    <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mt-0.5">
                      Comparing NAAC A++ rated universities, curriculum depth, LMS interface, and examination modes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Minute 20–25: Fee EMI &amp; Scholarship Setup</h4>
                    <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mt-0.5">
                      Checking your eligibility for early bird, defense, women in leadership, or merit fee concessions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Minute 25–30: Open Q&amp;A &amp; Next Action Steps</h4>
                    <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mt-0.5">
                      Answering any remaining doubts with direct links to the official online application forms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. VERIFIED REVIEWS */}
            <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-ink-950">
                  Verified Student Feedback
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0 / 5.0 Rating</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((rev, i) => (
                  <div key={i} className="rounded-2xl border border-ink-150 bg-ink-50/50 p-4.5">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-700 leading-relaxed italic">
                      &ldquo;{rev.review}&rdquo;
                    </p>
                    <div className="mt-3.5 pt-2.5 border-t border-ink-150/70">
                      <p className="text-sm font-bold text-ink-900">{rev.student}</p>
                      <p className="text-xs text-ink-500">{rev.program}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sticky Sidebar Booking Form (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <aside aria-label="Book counselling session" className="lg:sticky lg:top-24 lg:self-start">
              <BookingForm
                mentorSlug={mentor.slug}
                mentorName={mentor.display_name}
                sessionMinutes={mentor.session_minutes}
                slots={slots}
              />

              {/* Other Mentors Recommendation */}
              {otherMentors.length > 0 ? (
                <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-card">
                  <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-ink-900 mb-3">
                    Other Verified Academic Advisors
                  </h4>
                  <div className="space-y-3">
                    {otherMentors
                      .filter((m) => m.slug !== mentor.slug)
                      .slice(0, 3)
                      .map((m) => (
                        <Link
                          key={m.documentId}
                          href={`/mentors/${m.slug}`}
                          className="group flex items-center gap-3 rounded-2xl p-2 hover:bg-ink-50 transition-colors"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-bold text-xs">
                            {m.display_name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-ink-900 group-hover:text-brand-800 truncate">
                              {m.display_name}
                            </p>
                            <p className="text-3xs text-ink-500 truncate">
                              {m.headline || 'Education Advisor'}
                            </p>
                          </div>
                          <ArrowRight className="size-3 text-ink-400 group-hover:text-brand-800 shrink-0" />
                        </Link>
                      ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

        </div>
      </div>
    </div>
  );
}
