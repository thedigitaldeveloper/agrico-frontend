import type { CourseCard } from '@/lib/cms/repositories/course';
import type { CourseFinderConfig } from '@/lib/cms/repositories/home';
import { resolveThumbnail } from '@/lib/cms/media';
import type { ProgramCard } from '@/lib/cms/repositories/program';
import type { ResolvedImage } from '@/lib/cms/media';

import { INTENTS, intentsFor, type Intent } from './course-finder-intents';

/** One program, reduced to what the finder filters and counts on. */
export interface FinderProgram {
  id: string;
  fee: number | null;
  duration: number | null;
  durationUnit: string;
  modeSlug: string | null;
  modeName: string | null;
  intents: string[];
  universityName?: string | null;
  levelName?: string | null;
  streamName?: string | null;
}

/** One course family — the thing a card represents. */
export interface FinderCourse {
  slug: string;
  name: string;
  levelName: string | null;
  streamName: string | null;
  icon: ResolvedImage | null;
  tag: string | null;
  universityCount: number;
  programs: FinderProgram[];
}

export interface CourseFinderData {
  intents: Intent[];
  courses: FinderCourse[];
  config?: CourseFinderConfig | null;
}

/** The value that occurs most often, ties broken by first appearance. */
function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let winner: string | null = null;
  let best = 0;
  for (const [value, count] of counts) {
    if (count > best) {
      winner = value;
      best = count;
    }
  }
  return winner;
}

export function buildCourseFinderData(
  programs: ProgramCard[],
  config?: CourseFinderConfig | null,
  masterCourses?: CourseCard[]
): CourseFinderData {
  const grouped = new Map<string, { source: ProgramCard[]; name: string }>();

  for (const program of programs) {
    const slug = program.course?.slug;
    if (!slug) continue;

    const entry = grouped.get(slug);
    if (entry) entry.source.push(program);
    else grouped.set(slug, { source: [program], name: program.course?.name ?? slug });
  }

  const courses: FinderCourse[] = [];

  for (const [slug, { source, name }] of grouped) {
    const rows: FinderProgram[] = source.map((program) => ({
      id: program.documentId,
      fee: program.fee,
      duration: program.duration,
      durationUnit: program.duration_type?.name ?? '',
      modeSlug: program.course_mode?.slug ?? null,
      modeName: program.course_mode?.name ?? null,
      levelName: program.course?.level?.name ?? null,
      streamName: program.stream?.name ?? null,
      intents: intentsFor({
        name: program.name,
        courseName: name,
        levelName: program.course?.level?.name ?? '',
        streamName: program.stream?.name ?? '',
        modeName: program.course_mode?.name ?? '',
        typeName: program.course_type?.name ?? '',
      }),
    }));

    if (rows.every((row) => row.intents.length === 0)) continue;

    const masterCourse = masterCourses?.find((c) => c.slug === slug);
    const withCourseIcon = source.find((program) => program.course?.icon);
    const withProgIcon = source.find((program) => program.program_icon);

    const rawIcon =
      masterCourse?.icon ??
      withCourseIcon?.course?.icon ??
      withProgIcon?.program_icon ??
      null;

    courses.push({
      slug,
      name: masterCourse?.name ?? name,
      levelName: masterCourse?.level?.name ?? mostCommon(source.map((p) => p.course?.level?.name ?? null)),
      streamName: masterCourse?.stream?.name ?? mostCommon(source.map((program) => program.stream?.name ?? null)),
      icon: rawIcon ? resolveThumbnail(rawIcon, 96, name) : null,
      tag: mostCommon(source.map((program) => program.tag?.name ?? null)),
      universityCount: new Set(source.flatMap(program => (program.universities ?? []).map(university => university.slug))).size,
      programs: rows,
    });
  }

  const populated = new Set(
    courses.flatMap((course) => course.programs.flatMap((program) => program.intents))
  );

  // If custom tabs are provided in CMS, apply them and their custom order/labels
  let availableIntents: Intent[] = INTENTS;
  if (config?.tabs && config.tabs.length > 0) {
    availableIntents = config.tabs.map((tab) => {
      const defaultIntent = INTENTS.find((i) => i.id === tab.key);
      return {
        id: tab.key,
        label: tab.label || defaultIntent?.label || tab.key,
        note: tab.note || defaultIntent?.note || '',
      };
    });
  }

  return {
    intents: availableIntents.filter((intent) => populated.has(intent.id)),
    courses,
    config,
  };
}


