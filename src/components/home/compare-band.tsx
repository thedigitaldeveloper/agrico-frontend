import { ArrowRightLeft, ArrowRight } from 'lucide-react';
import type { Taxonomy } from '@/lib/cms/repositories/university';
import type { SectionHeaderConfig } from '@/lib/cms/repositories/home';

/**
 * The comparison entry point: A floating command-style comparison tool.
 */
export function CompareBand({
  universities,
  config,
}: {
  universities: Taxonomy[];
  config?: SectionHeaderConfig | null;
}) {
  if (universities.length < 2) return null;

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description =
    config?.description ?? '';
  const ctaLabel = config?.ctaLabel ?? '';

  return (
    <section className="relative py-4 sm:py-6 lg:py-8">
      <div className="container-page">
        <div className="surface-inverse relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-950 to-ink-950 p-4 shadow-xl ring-1 ring-white/10 text-white sm:rounded-3xl sm:p-6 lg:p-8">
          {/* Subtle Ambient Glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-12 size-72 rounded-full bg-gold-400/15 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-12 size-72 rounded-full bg-brand-500/15 blur-3xl"
          />

          {/* Centered Header */}
          <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-gold-300 uppercase ring-1 ring-gold-400/30 ring-inset sm:text-2xs sm:px-3 sm:py-1 sm:gap-1.5">
              <ArrowRightLeft className="size-2.5 text-gold-300 sm:size-3" />
              {eyebrow}
            </div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-white text-balance sm:text-2xl lg:text-3xl">
              {heading}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-white/80 sm:mt-2 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>

          <form
            action="/compare"
            method="get"
            className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto] lg:items-end"
          >
            <Slot index={0} universities={universities} required label="Select 1st University" />
            <Versus />
            <Slot index={1} universities={universities} required label="Select 2nd University" />
            <Versus />
            <Slot index={2} universities={universities} label="Select 3rd (Optional)" />
            <button
              type="submit"
              className="group mt-1 sm:mt-0 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 text-xs sm:text-sm font-bold text-ink-950 shadow-md transition-all duration-200 hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98] sm:col-span-2 lg:col-span-1 lg:w-auto"
            >
              <span>{ctaLabel || 'Compare'}</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Slot({
  index,
  universities,
  required = false,
  label,
}: {
  index: number;
  universities: Taxonomy[];
  required?: boolean;
  label: string;
}) {
  const id = `compare-slot-${index}`;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-2xs font-semibold text-white/70">
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          name="u"
          required={required}
          defaultValue=""
          className="h-11 w-full appearance-none rounded-xl border border-white/15 bg-white/10 px-3.5 pr-8 text-xs font-medium text-white shadow-inner backdrop-blur-sm transition-colors focus:border-gold-400 focus:bg-brand-950 focus:ring-1 focus:ring-gold-400"
        >
          <option value="" className="bg-brand-950 text-white/60">
            Choose a university…
          </option>
          {universities.map((university) => (
            <option
              key={university.documentId}
              value={university.slug}
              className="bg-brand-950 text-white"
            >
              {university.name}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50"
        >
          ▼
        </span>
      </div>
    </div>
  );
}

function Versus() {
  return (
    <div
      aria-hidden="true"
      className="hidden h-11 items-center justify-center pb-0 font-display text-xs font-bold text-gold-300/80 lg:flex"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-2xs font-bold ring-1 ring-white/15">
        VS
      </span>
    </div>
  );
}

