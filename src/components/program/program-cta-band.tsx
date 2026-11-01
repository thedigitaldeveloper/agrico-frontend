import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProgramDetail } from '@/lib/cms/repositories/program';

/**
 * The closing call to action.
 *
 * One band, at the end, rather than the three floating widgets and the coupon
 * popup the aggregator pages stack on top of the content. A visitor who has
 * read to the bottom of a program page has already shown intent; the job here
 * is to be present, not to interrupt.
 */
export function ProgramCtaBand({ program }: { program: ProgramDetail }) {
  return (
    <section className="rs-pd-closing">
      <div className="container-page rs-pd-closing-inner">
        <div>
          <p className="rs-pd-eyebrow">From exploring to deciding</p>
          <h2>
            Plan your next step in {program.name}.
          </h2>
          <p>
            Talk through the programme, university options and admission requirements with Agrico.
          </p>

        </div>
          <div className="rs-pd-closing-actions">
            {program.show_apply_button ? <Link
              href={`/common-application-form?program=${program.slug}`}
              className="rs-pd-button rs-pd-button-primary"
            >
              {program.apply_button_text || 'Start your application'}
              <ArrowRight size={17} aria-hidden="true" />
            </Link> : null}
            <Link href="/contact-us" className="rs-pd-button rs-pd-button-outline">
              Talk to a counsellor<ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
      </div>
    </section>
  );
}
