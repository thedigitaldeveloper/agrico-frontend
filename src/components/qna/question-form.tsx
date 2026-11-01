'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  HelpCircle,
  Send,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquarePlus,
} from 'lucide-react';

import { FormMessage, TextAreaField, TextField } from '@/components/forms/field';
import { Button } from '@/components/ui/button';
import { submitAnswer, submitQuestion } from '@/lib/actions';
import { IDLE, type FormState } from '@/lib/form-state';

function SubmitButton({ label, icon: Icon = Send }: { label: string; icon?: typeof Send }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="md"
      disabled={pending}
      className="w-full sm:w-auto rounded-xl shadow-md font-bold px-6 py-3 transition-all duration-200"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Submitting for Review…
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span>{label}</span>
          <Icon className="size-4" />
        </span>
      )}
    </Button>
  );
}

export function AskQuestionForm({
  streams = [],
}: {
  streams?: { name: string; slug: string }[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(submitQuestion, IDLE);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center animate-fade-in">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-emerald-950">
          Question Submitted for Advisor Review!
        </h3>
        <p className="mt-2 max-w-lg mx-auto text-xs leading-relaxed text-emerald-800/90 sm:text-sm">
          {state.message}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-emerald-900 border border-emerald-200 shadow-2xs">
          <Clock className="size-3.5 text-emerald-600" />
          <span>Expected Review Time: 1 to 2 hours</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/qna"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800 transition-colors"
          >
            <span>Explore Community Questions</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage status={state.status} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        {streams.length > 0 ? (
          <div className="space-y-1.5">
            <label htmlFor="stream-select" className="text-xs font-bold text-ink-800">
              Select Discipline / Stream
            </label>
            <select
              id="stream-select"
              name="stream"
              className="w-full rounded-xl border border-ink-250 bg-white px-3.5 py-2.5 text-xs text-ink-900 shadow-2xs focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">General Online Education</option>
              {streams.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="author_name" className="text-xs font-bold text-ink-800">
            Your Name / Nickname
          </label>
          <input
            id="author_name"
            name="author_name"
            type="text"
            placeholder="e.g. Vikram Verma"
            className="w-full rounded-xl border border-ink-250 bg-white px-3.5 py-2.5 text-xs text-ink-900 shadow-2xs focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <TextField
        name="title"
        label="Your Question Title"
        required
        invalid={state.invalid?.includes('title')}
        placeholder="e.g. Is an Online MCA recognized for PSU / Government recruitment?"
        hint="Be concise and specific — clear questions receive faster advisor verification."
      />

      <TextAreaField
        name="body"
        label="Context & Specific Details (Optional)"
        rows={4}
        placeholder="Mention your graduation background, marks/GPA, target universities, or career goals so our advisors can give a tailored response."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="author_email"
          label="Email Address"
          type="email"
          autoComplete="email"
          hint="We will notify you immediately once an advisor posts a verified response."
        />
        <div className="flex items-center pt-2">
          <div className="rounded-xl border border-ink-200 bg-ink-50/70 p-3 text-3xs text-ink-600 leading-relaxed">
            <span className="font-bold text-ink-800 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="size-3.5 text-brand-700" />
              100% Privacy Guaranteed
            </span>
            Your email is kept confidential and never displayed publicly on the forum.
          </div>
        </div>
      </div>

      {/* Moderation Transparency Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-2xs text-amber-900 leading-relaxed">
        <Sparkles className="size-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Quality & Trust Guarantee:</strong> All questions undergo review by our academic panel before going live. This prevents spam and ensures every thread receives an authoritative, UGC-compliant response.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <SubmitButton label="Submit Question for Review" icon={MessageSquarePlus} />
      </div>
    </form>
  );
}

export function AnswerForm({ questionSlug }: { questionSlug: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(submitAnswer, IDLE);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center animate-fade-in">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="mt-3 font-display text-base font-bold text-emerald-950">
          Thank you! Answer Submitted for Moderation.
        </h3>
        <p className="mt-1.5 text-xs text-emerald-800/90">
          {state.message} Once verified by our editorial panel, it will be published to this thread.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="question" value={questionSlug} />

      <FormMessage status={state.status} message={state.message} />

      <TextAreaField
        name="body"
        label="Your Answer / Insight"
        required
        rows={5}
        invalid={state.invalid?.includes('body')}
        placeholder="Share your experience, statutory regulations, or facts to help this student..."
        hint="Answers with clear formatting, official references, and real student experiences are prioritized."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="author_name" label="Your Name / Designation" placeholder="e.g. Ankit (Online MBA Alum)" />
        <TextField name="author_email" label="Your Email" type="email" placeholder="For reply notifications" />
      </div>

      <div className="pt-2">
        <SubmitButton label="Post Answer for Review" />
      </div>
    </form>
  );
}
