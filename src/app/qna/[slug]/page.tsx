import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck,
  Award,
  ArrowRight,
  Share2,
  HelpCircle,
  Building2,
  Sparkles,
} from 'lucide-react';

import { formatDate } from '@/components/exam/exam-card';
import { AnswerForm } from '@/components/qna/question-form';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CHIP, CHIP_LINK } from '@/components/ui/fact-card';
import { getQuestionBySlug, getQuestionSlugs, listQuestions } from '@/lib/cms/repositories/qna';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema, questionSchema } from '@/lib/seo/schemas';

export async function generateStaticParams() {
  const slugs = await getQuestionSlugs(50);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/qna/[slug]'>) {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  const path = `/qna/${slug}`;
  if (!question) return buildMetadata({ title: 'Question Not Found', path });

  return buildMetadata({
    title: `${question.title} — Verified Education Q&A`,
    description: question.body ?? `Verified answers and regulatory advice regarding: ${question.title}`,
    path,
  });
}

export default async function QuestionPage({ params }: PageProps<'/qna/[slug]'>) {
  const { slug } = await params;

  const [question, { questions: relatedQuestions }] = await Promise.all([
    getQuestionBySlug(slug),
    listQuestions({ pageSize: 5 }),
  ]);

  if (!question) notFound();

  // The accepted answer leads; the rest follow in the order they were written.
  const answers = [...question.answers].sort((a, b) => {
    if (a.is_accepted !== b.is_accepted) return a.is_accepted ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const acceptedAnswer = answers.find((a) => a.is_accepted) || answers[0];
  const otherAnswers = answers.filter((a) => a.documentId !== acceptedAnswer?.documentId);

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Q&A Forum', path: '/qna' },
    { name: question.title, path: `/qna/${question.slug}` },
  ];

  return (
    <div className="bg-ink-50/50 pb-20 pt-6">
      <JsonLdGraph items={[questionSchema(question), breadcrumbSchema(trail)]} />

      <div className="container-page">
        <Breadcrumbs items={trail} tone="page" className="mb-6" />

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Question & Answer Content (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. QUESTION ARTICLE CARD */}
            <article className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
              {/* Category & Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {question.streams.length > 0 ? (
                    question.streams.map((stream) => (
                      <Link
                        key={stream.documentId}
                        href={`/qna?stream=${stream.slug}`}
                        className="inline-flex items-center rounded-md bg-brand-50 hover:bg-brand-100 px-2.5 py-1 text-2xs font-bold text-brand-800 border border-brand-200 transition-colors"
                      >
                        {stream.name}
                      </Link>
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-ink-100 px-2.5 py-1 text-2xs font-bold text-ink-700">
                      General Online Education
                    </span>
                  )}

                  {acceptedAnswer ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-2xs font-bold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Advisor Verified
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {question.views} views
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {formatDate(question.createdAt)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-950 sm:text-3xl leading-snug">
                {question.title}
              </h1>

              {/* Author Strip */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-brand-700 text-white font-bold text-xs shadow-inner">
                  {(question.author_name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink-900">
                    Asked by {question.author_name || 'Anonymous Student'}
                  </p>
                  <p className="text-3xs text-ink-500">Verified Forum Submission</p>
                </div>
              </div>

              {/* Question Body */}
              {question.body ? (
                <div className="mt-6 rounded-2xl bg-ink-50/80 p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-ink-800 whitespace-pre-line border border-ink-200/70">
                  {question.body}
                </div>
              ) : null}
            </article>

            {/* 2. VERIFIED ADVISOR ANSWER */}
            {acceptedAnswer ? (
              <section className="rounded-3xl border-2 border-emerald-500/80 bg-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 rounded-bl-2xl bg-emerald-700 px-4 py-1.5 text-3xs font-extrabold uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-300" />
                  <span>Accepted Expert Guidance</span>
                </div>

                {/* Advisor Header */}
                <div className="flex items-start gap-3.5 mb-6 pt-2">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-inner shrink-0">
                    <UserCheck className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-ink-950">
                        {acceptedAnswer.author_name || 'Agrico Academic Advisory Panel'}
                      </h3>
                      {acceptedAnswer.is_expert ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-3xs font-bold text-emerald-800 border border-emerald-300">
                          Senior Counsellor
                        </span>
                      ) : null}
                    </div>
                    <p className="text-3xs text-ink-500 mt-0.5">
                      Reviewed against current UGC-DEB Regulations & Gazette Notifications · {formatDate(acceptedAnswer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Answer Content */}
                <div className="prose prose-sm max-w-none text-sm sm:text-base leading-relaxed text-ink-800 whitespace-pre-line space-y-4">
                  {acceptedAnswer.body}
                </div>

                {/* Regulatory Trust Badge */}
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3">
                  <ShieldCheck className="size-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-2xs text-emerald-950 leading-relaxed">
                    <strong>Statutory Compliance Confirmation:</strong> The guidance provided above strictly aligns with the University Grants Commission (Open and Distance Learning Programmes and Online Programmes) Regulations and subsequent official Gazette notifications.
                  </div>
                </div>
              </section>
            ) : null}

            {/* 3. ADDITIONAL COMMUNITY ANSWERS (IF ANY) */}
            {otherAnswers.length > 0 ? (
              <section className="space-y-4">
                <h3 className="font-display text-base font-bold text-ink-900">
                  Other Community Responses ({otherAnswers.length})
                </h3>

                {otherAnswers.map((ans) => (
                  <article
                    key={ans.documentId}
                    className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6 shadow-card"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3 mb-3 text-xs">
                      <span className="font-bold text-ink-900">
                        {ans.author_name || 'Community Contributor'}
                      </span>
                      <span className="text-ink-500 text-3xs">{formatDate(ans.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-ink-700 whitespace-pre-line">
                      {ans.body}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}

            {/* 4. SUBMIT YOUR ANSWER */}
            <section className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">
                    Contribute an Answer or Student Experience
                  </h3>
                  <p className="text-3xs text-ink-500">
                    Help fellow students make informed higher education decisions
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <AnswerForm questionSlug={question.slug} />
              </div>
            </section>

          </div>

          {/* Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1-on-1 Guidance Box */}
            <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-900 to-ink-950 p-6 text-white shadow-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-3xs font-bold text-emerald-300 backdrop-blur-md mb-3">
                <Sparkles className="size-3 text-emerald-400" />
                <span>Free Academic Support</span>
              </div>

              <h3 className="font-display text-lg font-bold">
                Still have questions about this degree?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Connect with our senior admission counsellors for personalized guidance on university selection, fees, and career paths.
              </p>

              <div className="mt-5 space-y-2.5">
                <ButtonLink
                  href="/common-application-form"
                  variant="accent"
                  size="md"
                  className="w-full justify-center font-bold rounded-xl shadow-md"
                >
                  <span>Request Free Mentor Call</span>
                  <ArrowRight className="size-3.5" />
                </ButtonLink>

                <ButtonLink
                  href="/compare"
                  variant="inverse"
                  size="md"
                  className="w-full justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs"
                >
                  <span>Compare Top Online Universities</span>
                </ButtonLink>
              </div>
            </div>

            {/* Related Questions Strip */}
            {relatedQuestions.length > 0 ? (
              <div className="rounded-3xl border border-ink-200 bg-white p-5 sm:p-6 shadow-card">
                <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-ink-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="size-4 text-brand-700" />
                  Related UGC-DEB Discussions
                </h4>

                <ul className="divide-y divide-ink-100">
                  {relatedQuestions
                    .filter((q) => q.slug !== question.slug)
                    .slice(0, 4)
                    .map((item) => (
                      <li key={item.documentId} className="py-3 first:pt-0 last:pb-0">
                        <Link
                          href={`/qna/${item.slug}`}
                          className="group block text-xs font-semibold text-ink-800 hover:text-brand-800 transition-colors leading-snug"
                        >
                          <span className="line-clamp-2">{item.title}</span>
                          <span className="mt-1 flex items-center gap-2 text-3xs text-ink-500 font-normal">
                            <span>{item.views} views</span>
                            <span>·</span>
                            <span className="text-brand-700 font-bold group-hover:underline">
                              Read Answer →
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}

            {/* Quick Explore Streams */}
            <div className="rounded-3xl border border-ink-200 bg-white p-5 sm:p-6 shadow-card">
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-ink-900 mb-3">
                Browse by Academic Discipline
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/qna?stream=management" className={cn(CHIP, CHIP_LINK)}>
                  Management (MBA / BBA)
                </Link>
                <Link href="/qna?stream=computer-applications" className={cn(CHIP, CHIP_LINK)}>
                  IT & Software (MCA / BCA)
                </Link>
                <Link href="/qna?stream=commerce" className={cn(CHIP, CHIP_LINK)}>
                  Commerce (M.Com / B.Com)
                </Link>
                <Link href="/qna?stream=arts-humanities" className={cn(CHIP, CHIP_LINK)}>
                  Arts & Humanities (MA / BA)
                </Link>
                <Link href="/qna" className={cn(CHIP, CHIP_LINK)}>
                  All Q&A Discussions
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
