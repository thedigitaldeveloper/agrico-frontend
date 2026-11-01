import { ButtonLink } from '@/components/ui/button';
import type { UniversityDetail } from '@/lib/cms/repositories/university';

/**
 * The closing call to action.
 *
 * One band, at the end, rather than the floating widgets, coupon popups and
 * chat bubbles the aggregator pages stack over the content. Someone who has
 * read this far has already shown intent; the job here is to be present when
 * they look up, not to interrupt them while they read.
 */
export function UniversityCtaBand({ university }: { university: UniversityDetail }) {
  const place = university.city || university.state;

  return (
    <section className="surface-inverse relative isolate overflow-hidden bg-brand-800 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-[26rem] rounded-full bg-brand-600/25 blur-3xl" />
      </div>

      <div className="container-page py-14 lg:py-18">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium text-balance lg:text-4xl">
            Thinking about {university.name}?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/90">
            {place
              ? `Tell us what matters — fees, eligibility, accreditation or placements — and a counsellor will walk you through admission at ${university.name} and the alternatives in ${place}.`
              : `Tell us what matters — fees, eligibility, accreditation or placements — and a counsellor will walk you through admission at ${university.name} and the alternatives worth a look.`}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {university.show_apply_button ? (
              <ButtonLink
                href={`/common-application-form?university=${university.slug}`}
                variant="outline"
                size="lg"
              >
                {university.apply_button_text || 'Start your application'}
              </ButtonLink>
            ) : null}
            <ButtonLink href="/contact-us" variant="inverse" size="lg">
              Talk to a counsellor
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
