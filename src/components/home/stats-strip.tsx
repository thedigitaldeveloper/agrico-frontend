import { ShieldCheck, Scale, CreditCard, Headphones, Sparkles, LucideIcon } from 'lucide-react';
import { CountUp } from '@/components/ui/count-up';
import type { StatItem } from '@/lib/cms/repositories/home';

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Scale,
  CreditCard,
  Headphones,
  Sparkles,
};

function parseStatValue(raw: string): { prefix: string; value: number; suffix: string } {
  const match = raw.match(/^([^0-9]*)(\d+)(.*)$/);
  if (!match) return { prefix: '', value: 0, suffix: raw };
  return {
    prefix: match[1] ?? '',
    value: parseInt(match[2], 10) || 0,
    suffix: match[3] ?? '',
  };
}

export function StatsStrip({ stats }: { stats?: StatItem[] }) {
  if (!stats || stats.length === 0) return null;
  const items = stats;

  const defaultIcons = [ShieldCheck, Scale, CreditCard, Headphones];

  return (
    <section className="relative border-b border-ink-200/80 bg-gradient-to-b from-white to-ink-50/50 py-5 sm:py-6 lg:py-8">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            const { prefix, value, suffix } = parseStatValue(item.value);

            return (
              <div
                key={item.label}
                className="group relative flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 rounded-2xl border border-ink-200/70 bg-white p-3 sm:p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/80 hover:shadow-card-hover"
              >
                <div className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-200 group-hover:bg-brand-700 group-hover:text-white">
                  <Icon className="size-4.5 sm:size-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1 font-display text-xl sm:text-2xl font-extrabold text-brand-900 tabular-nums">
                    {prefix ? <span>{prefix}</span> : null}
                    <CountUp value={value} suffix={suffix} />
                  </div>
                  <h3 className="text-[11px] sm:text-xs font-bold text-ink-900 leading-snug">{item.label}</h3>
                  {item.description ? (
                    <p className="mt-0.5 text-[10px] sm:text-2xs leading-relaxed text-ink-500 hidden sm:block">{item.description}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


