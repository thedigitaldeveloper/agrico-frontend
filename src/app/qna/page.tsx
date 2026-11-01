import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, CheckCircle2, ArrowRight, Eye, UserCheck, TrendingUp } from 'lucide-react';

import { formatDate } from '@/components/exam/exam-card';
import { AskQuestionForm } from '@/components/qna/question-form';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSearch } from '@/components/ui/list-search';
import {
  Pagination,
  buildListHref,
  one,
  type SearchParams,
} from '@/components/ui/pagination';
import { listQuestions } from '@/lib/cms/repositories/qna';
import { listTaxonomy } from '@/lib/cms/repositories/taxonomy';
import { cn } from '@/lib/cn';
import { buildMetadata } from '@/lib/metadata';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { breadcrumbSchema } from '@/lib/seo/schemas';

const BASE = '/qna';

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Q&A Forum', path: BASE },
];

export const metadata: Metadata = buildMetadata({
  title: 'Education Q&A — Programmes, Universities & Admissions',
  description:
    'Explore published questions and answers about programmes, universities, study modes, fees and admissions. Share a question with the Agrico community.',
  path: BASE,
});

const QUICK_TOPICS = [
  { label: 'Govt Job Validity', query: 'valid' },
  { label: 'Online MBA vs Regular', query: 'MBA' },
  { label: 'WES & Foreign PR', query: 'WES' },
  { label: 'Exam Proctoring', query: 'exam' },
  { label: 'Dual Degree UGC Rule', query: 'degree' },
  { label: 'Fees & Payment Options', query: 'EMI' },
  { label: 'Work Without NOC', query: 'NOC' },
];

export default async function QnaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(one(params.page) ?? 1) || 1);
  const stream = one(params.stream);

  const typed = one(params.q)?.trim() ?? '';
  const query = typed.length >= 2 ? typed : undefined;

  const [{ questions, pagination }, streams] = await Promise.all([
    listQuestions({ page, stream, search: query, pageSize: 12 }),
    listTaxonomy('streams', 20),
  ]);

  const activeStream = stream
    ? (streams.find((item) => item.slug === stream)?.name ?? stream)
    : null;

  return (
    <div className="bg-ink-50/50 pb-20">
      <JsonLdGraph items={[breadcrumbSchema(CRUMBS)]} />

      {/* ===================================================================== */}
      {/* 1. COMMUNITY HERO & TRUST HEADER */}
      {/* ===================================================================== */}
      <section className="rs-resource-hero">
        <div className="container-page">
          <nav aria-label="Breadcrumbs" className="rs-resource-crumbs"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Questions &amp; answers</span></nav>
          <div className="rs-resource-heading"><p className="rs-eyebrow">Questions &amp; answers</p><h1>A question today.<br />A clearer next step.</h1><p>Explore questions about programmes, universities and admissions. Read the published answers or share a question of your own.</p></div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SEARCH & STREAM FILTER TABS */}
      {/* ===================================================================== */}
      <div className="container-page -mt-7 relative z-20">
        <div className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <ListSearch
                basePath={BASE}
                current={params}
                label="Search Community Q&A"
                placeholder="Search queries by keywords (e.g. 'Govt job', 'WES', 'proctoring', 'online MBA')..."
                className="my-0"
              />
            </div>
            <div className="shrink-0">
              <ButtonLink
                href="#ask-advisor"
                variant="accent"
                size="md"
                className="w-full md:w-auto rounded-xl shadow-md font-bold px-5"
              >
                <MessageSquare className="size-4" />
                <span>Ask an Advisor</span>
              </ButtonLink>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-ink-150">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400 mr-1 flex items-center gap-1">
              <TrendingUp className="size-3 text-brand-700" />
              Popular Topics:
            </span>
            {QUICK_TOPICS.map((topic) => (
              <Link
                key={topic.query}
                href={buildListHref(BASE, params, { q: topic.query, page: null })}
                className="inline-flex items-center rounded-lg bg-ink-100 hover:bg-brand-50 hover:text-brand-800 px-2.5 py-1 text-2xs font-semibold text-ink-700 transition-colors"
              >
                {topic.label}
              </Link>
            ))}
          </div>

          {/* Stream Filter Pills */}
          {streams.length > 0 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
              <Link
                href={buildListHref(BASE, params, { stream: null, page: null })}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                  !stream
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                )}
              >
                All Subjects
              </Link>
              {streams.map((s) => {
                const isActive = stream === s.slug;
                return (
                  <Link
                    key={s.slug}
                    href={buildListHref(BASE, params, { stream: s.slug, page: null })}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    )}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT GRID: QUESTIONS FEED & INTERACTIVE SIDEBAR */}
      {/* ===================================================================== */}
      <div className="container-page mt-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Main Feed (8 Columns) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">
                {query ? `Search results for "${query}"` : activeStream ? `${activeStream} Discussions` : 'Latest Questions'}
              </h2>
              {query || stream || page > 1 ? <span className="text-xs font-semibold text-ink-500">Showing {questions.length} of {pagination.total} questions</span> : null}
            </div>

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-card">
                <EmptyState
                  title={query ? `No discussions found for “${query}”` : 'No questions in this stream yet'}
                  description="Try a different search or submit your question using the form below."
                  action={
                    <ButtonLink href={buildListHref(BASE, params, { q: null, stream: null })} variant="outline">
                      Reset Filters
                    </ButtonLink>
                  }
                  secondaryAction={<ButtonLink href="#ask-advisor">Ask This Question</ButtonLink>}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => {
                  const acceptedAns = question.answers?.find((a) => a.is_accepted);
                  const firstAns = acceptedAns || question.answers?.[0];
                  const answersCount = question.answers?.length ?? 0;

                  return (
                    <article
                      key={question.documentId}
                      className="group relative rounded-2xl border border-ink-200 bg-white p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {question.streams.length > 0 ? (
                              <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-2xs font-bold text-brand-800 border border-brand-200">
                                {question.streams[0].name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-ink-100 px-2.5 py-0.5 text-2xs font-bold text-ink-700">
                                Programme Question
                              </span>
                            )}

                            {acceptedAns ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-800 border border-brand-200">
                                <CheckCircle2 className="size-3 text-brand-600" />
                                Accepted Answer
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-3 text-3xs text-ink-500">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {question.views} views
                            </span>
                            <span>·</span>
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>

                        {/* Question Title */}
                        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 leading-snug group-hover:text-brand-800 transition-colors">
                          <Link href={`/qna/${question.slug}`} className="hover:underline">
                            {question.title}
                          </Link>
                        </h3>

                        {/* Question Excerpt */}
                        {question.body ? (
                          <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-2">
                            {question.body}
                          </p>
                        ) : null}

                        {/* Expert Answer Teaser (If Present) */}
                        {firstAns ? (
                          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 text-xs text-ink-700">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="flex items-center gap-1.5 font-bold text-brand-950 text-3xs uppercase tracking-wider">
                                <UserCheck className="size-3.5 text-brand-700" />
                                {firstAns.is_expert ? 'Advisor Answer' : 'Community Response'}
                              </span>
                              <span className="text-3xs text-brand-800/80 font-medium">
                                {firstAns.author_name || 'Community member'}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-brand-950/90 font-sans">
                              {firstAns.body}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-3xs">
                            {(question.author_name || 'S')[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-ink-700">
                            {question.author_name || 'Anonymous Student'}
                          </span>
                        </div>

                        <Link
                          href={`/qna/${question.slug}`}
                          className="inline-flex items-center gap-1 font-bold text-brand-800 hover:text-brand-900 transition-colors"
                        >
                          <span>{answersCount > 0 ? `Read ${answersCount} Answers` : 'Answer Question'}</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <Pagination
              basePath={BASE}
              page={pagination.page}
              pageCount={pagination.pageCount}
              current={params}
            />
          </div>

          {/* Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Ask an Advisor Form Box */}
            <div id="ask-advisor" className="rounded-2xl border border-brand-200 bg-white p-5 sm:p-6 shadow-md scroll-mt-24">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">
                    Ask a Question
                  </h3>
                  <p className="text-3xs text-ink-500">Share your programme or admission question</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-ink-600 mb-4">
                Ask about programme choices, eligibility, fees or the application process. Add the details that will help others understand your question.
              </p>

              <AskQuestionForm streams={streams} />
            </div>

            <div className="rounded-2xl border border-brand-200 bg-white p-5 sm:p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold text-brand-800">Prefer a conversation?</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">Explore mentor profiles for guidance on your next step, or begin your application.</p>
              <div className="mt-4 flex flex-wrap gap-3"><ButtonLink href="/mentors" variant="outline" size="sm">Explore mentors</ButtonLink><ButtonLink href="/common-application-form" size="sm">Start an application</ButtonLink></div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
