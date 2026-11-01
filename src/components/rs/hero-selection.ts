import type { HomeSlide, Offering } from './home-types';

export function heroChoiceKey(offering: Offering) {
  return offering.courseSlug ? `course:${offering.courseSlug}` : `program:${offering.programSlug}`;
}

/** Choices retain the first authored university pair for each programme. */
export function heroSelection({ offerings, catalogue, slide, choice }: {
  offerings: Offering[];
  catalogue: Offering[];
  slide?: HomeSlide;
  choice: string;
}) {
  const choices: Array<{ key: string; label: string; offering: Offering }> = [];
  const seen = new Set<string>();
  for (const offering of offerings) {
    const key = heroChoiceKey(offering);
    if (seen.has(key)) continue;
    seen.add(key);
    const label = offering.degree.replace(/^(online|distance|regular|on-campus)\s+/i, '').trim() || offering.degree;
    choices.push({ key, label, offering });
  }
  const selectedChoice = choices.find(option => option.key === choice);
  const featured = selectedChoice?.offering ?? (slide?.offeringId
    ? catalogue.find(offering => offering.id === slide.offeringId)
      ?? offerings.find(offering => offering.id === slide.offeringId)
    : offerings[0]);
  const activeChoiceKey = featured ? heroChoiceKey(featured) : undefined;
  return { choices, selectedChoice, featured, activeChoiceKey };
}
