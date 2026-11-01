import { cn } from '@/lib/cn';

interface KeyFact {
  label: string | null | undefined;
  value: string | null | undefined;
}

interface KeyFactsProps {
  items: KeyFact[];
  tone?: 'inverse' | 'surface';
  className?: string;
}

/**
 * The fact strip under a detail hero — a handful of label/value pairs read as a
 * scannable row rather than a sentence.
 *
 * Filtering and the column count are decided here, not by the caller: every
 * caller was writing the same `.filter(f => f.value)`, its own conditional
 * wrapper and its own hard-coded `lg:grid-cols-*`, which is how the three copies
 * drifted apart in the first place.
 */
/**
 * Column counts that leave the fewest orphans.
 *
 * Picking the widest grid that fits — the obvious rule, and what this did
 * before — puts six facts on a five-column row and strands the sixth alone
 * beside four empty cells. Preferring an exact divisor turns that into two
 * rows of three.
 */
const GRID = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-3 lg:grid-cols-5',
} as const;

function columnsFor(count: number): keyof typeof GRID {
  if (count <= 2) return 2;
  if (count === 3) return 3;
  const candidates = [5, 4, 3] as const;
  const exact = candidates.find((c) => count % c === 0);
  if (exact) return exact;
  // Nothing divides evenly, so take whichever leaves the fullest last row.
  return candidates.reduce((best, c) => (count % c > count % best ? c : best));
}

export function KeyFacts({ items, tone = 'inverse', className }: KeyFactsProps) {
  const facts = items.filter(
    (item): item is { label: string; value: string } => Boolean(item.label) && Boolean(item.value)
  );

  if (facts.length === 0) return null;

  const inverse = tone === 'inverse';

  return (
    // The dividers are borders on the cells, pulled a pixel out of a clipping
    // wrapper that carries the cell colour. Drawing them as a gap over a tinted
    // parent — the obvious way, and what this did before — turns every unfilled
    // cell in the last row into a solid block of divider colour, so seven facts
    // on a five-column grid end in what reads as a rendering fault.
    <div
      className={cn(
        'overflow-hidden rounded-card',
        inverse ? 'bg-brand-900/60' : 'bg-white',
        className
      )}
    >
      <dl className={cn('-mt-px -ml-px grid grid-cols-2', GRID[columnsFor(facts.length)])}>
        {facts.map((fact, index) => (
          // Indexed, because the labels come from an editor's highlights and
          // two cells called "Fees" is a content mistake, not a crash.
          <div
            key={`${fact.label}-${index}`}
            className={cn(
              'border-t border-l px-4 py-4',
              inverse ? 'border-white/10' : 'border-ink-200'
            )}
          >
            <dt className={cn('text-xs', inverse ? 'text-white/60' : 'text-ink-500')}>
              {fact.label}
            </dt>
            <dd
              className={cn(
                'mt-1 font-display font-bold text-pretty',
                (fact.value?.length ?? 0) > 40 ? 'text-sm leading-snug' : 'text-lg',
                inverse ? 'text-white' : 'text-ink-900'
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
