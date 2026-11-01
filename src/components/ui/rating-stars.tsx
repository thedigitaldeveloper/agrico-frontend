import { cn } from '@/lib/cn';

/**
 * A 0–5 rating drawn as five stars.
 *
 * One filled row clipped to the score's width over one empty row, rather than
 * a per-star half/full decision: 4.3 renders as 4.3 rather than rounding to the
 * nearest half, and there is no arithmetic to get wrong per star.
 *
 * The stars are decoration — the accessible name carries the number, because
 * "four and a half stars" is not something a screen reader can infer from
 * shapes.
 */
export function RatingStars({
  value,
  tone = 'default',
  showValue = true,
  className,
}: {
  value: number;
  tone?: 'default' | 'inverse';
  showValue?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const inverse = tone === 'inverse';

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      role="img"
      aria-label={`Rated ${clamped} out of 5`}
    >
      <span className="relative inline-block" aria-hidden="true">
        <Stars className={inverse ? 'text-white/25' : 'text-ink-300'} />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          <Stars className={inverse ? 'text-gold-300' : 'text-gold-500'} />
        </span>
      </span>
      {showValue ? (
        <span
          className={cn(
            'text-xs font-semibold tabular-nums',
            inverse ? 'text-white/80' : 'text-ink-700'
          )}
        >
          {clamped.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}

/** Five stars in one row. Both layers are identical, so they align exactly. */
function Stars({ className }: { className: string }) {
  return (
    <span className={cn('flex gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <svg key={index} viewBox="0 0 20 20" fill="currentColor" className="size-3.5 shrink-0">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}
