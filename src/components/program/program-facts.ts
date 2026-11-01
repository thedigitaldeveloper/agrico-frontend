import type {
  ProgramCard,
  ProgramDetail,
  ProgramOffering,
} from '@/lib/cms/repositories/program';
import type { Taxonomy, UniversityCard } from '@/lib/cms/repositories/university';
import { formatFee } from '@/lib/format';

/**
 * "2 Years" — the strip label, where the unit is read as a column header.
 *
 * Takes the two fields it reads rather than a whole ProgramDetail, the way
 * listRelatedPrograms and getRelatedUniversities take a Pick of theirs: the
 * university fee table holds ProgramCard rows, and a ProgramDetail parameter
 * would send it off to write a third copy of this line.
 */
export function durationLabel(program: Pick<ProgramCard, 'duration' | 'duration_type'> & { duration_text?: string | null }): string {
  if (program.duration_text?.trim()) return program.duration_text.trim();
  if (program.duration === null || program.duration === undefined) return '';
  return [String(program.duration), program.duration_type?.name].filter(Boolean).join(' ');
}

// --- per-university fees ----------------------------------------------------

/**
 * What a university actually charges, after any waiver recorded on the
 * offering.
 *
 * Null when no fee is published; zero is left alone, because "no tuition" is a
 * real answer and a scholarship that cancels the fee should read as free rather
 * than as missing.
 */
export function offeringFee(offering: ProgramOffering | undefined): number | null {
  if (!offering || offering.fee === null || offering.fee === undefined) return null;
  const fee = Number(offering.fee);
  const subsidy = Number(offering.subsidy_amount ?? 0);
  if (!Number.isFinite(fee) || fee < 0 || !Number.isFinite(subsidy) || subsidy < 0) return null;
  return Math.max(0, fee - subsidy);
}

/**
 * Offerings keyed by university slug.
 *
 * The list of universities still comes from the relation, not from the
 * offerings — an editor who has linked a university but not yet priced it must
 * still appear, without a fee, rather than vanish from the page. So the rows
 * are joined to their price here instead of being built out of it.
 *
 * Defensive about a missing array: this is a CMS boundary, and a preset that
 * has not been deployed yet returns a program with no `program_offerings` key
 * at all rather than an empty one.
 */
export function offeringsByUniversity(
  offerings: ProgramOffering[] | null | undefined
): Map<string, ProgramOffering> {
  const byUniversity = new Map<string, ProgramOffering>();

  for (const offering of offerings ?? []) {
    const slug = offering.university?.slug;
    if (!slug) continue;

    // Two offerings for one pair is an editing mistake, not a data model —
    // keep the cheaper one rather than whichever the query happened to sort
    // first, so the page never quotes a price the visitor cannot get.
    const existing = byUniversity.get(slug);
    const fee = offeringFee(offering);
    const existingFee = offeringFee(existing);
    if (!existing || existingFee === null || (fee !== null && fee < existingFee)) {
      byUniversity.set(slug, offering);
    }
  }

  return byUniversity;
}

export interface FeeSpread {
  /** "₹1.6 L" when every university agrees, "₹1.6 L – ₹2.2 L" when they do not. */
  label: string;
  low: number;
  high: number;
  /** How many universities published a fee — not how many offer the program. */
  count: number;
}

/**
 * The fee band across every university that publishes one.
 *
 * This is the number the hero should lead with once offerings exist: a single
 * "total programme fee" is a fiction the moment four universities charge four
 * different amounts, and quoting the program's own flat fee next to a list that
 * contradicts it is worse than quoting nothing.
 */
export function offeringFeeSpread(
  offerings: ProgramOffering[] | null | undefined
): FeeSpread | null {
  const fees = [...offeringsByUniversity(offerings).values()]
    .map(offeringFee)
    .filter((fee): fee is number => fee !== null);

  if (fees.length === 0) return null;

  const low = Math.min(...fees);
  const high = Math.max(...fees);
  const lowLabel = formatFee(low);
  const highLabel = formatFee(high);
  if (!lowLabel || !highLabel) return null;

  return {
    label: lowLabel === highLabel ? lowLabel : `${lowLabel} – ${highLabel}`,
    low,
    high,
    count: fees.length,
  };
}

/**
 * The answer-first paragraph under the H1.
 *
 * Every clause is built from a field that may be absent, so this composes from
 * whatever exists rather than filling a fixed template — a program with only a
 * name and a stream still gets a readable sentence instead of "MBA Finance is a
 * null degree in Management".
 *
 * Written as prose on purpose: the same three facts already sit in the spec
 * band as a table, and a visitor who arrived from a search for "how long is an
 * MBA" wants the sentence, not the table.
 */
export function programSummary(program: ProgramDetail): string | null {
  if (program.seo?.metaDescription && program.seo.metaDescription.length > 40) {
    return program.seo.metaDescription;
  }

  return null;
}

/**
 * The approvals held by the universities offering this program, most common
 * first.
 *
 * Accreditation is the trust currency on an Indian admissions site, and it is
 * recorded per university — so the program page has to roll it up rather than
 * leaving a visitor to open four university pages and intersect the lists
 * themselves.
 */
export function aggregateApprovals(universities: UniversityCard[], limit = 8): Taxonomy[] {
  const counts = new Map<string, { approval: Taxonomy; count: number }>();

  for (const university of universities) {
    for (const approval of university.approvals ?? []) {
      const entry = counts.get(approval.name);
      if (entry) entry.count += 1;
      else counts.set(approval.name, { approval, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.approval.name.localeCompare(b.approval.name))
    .slice(0, limit)
    .map((entry) => entry.approval);
}
