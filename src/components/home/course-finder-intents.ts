/**
 * The rail's rows: who the visitor is, not what the qualification is called.
 *
 * An online-education catalogue is not browsed by "Undergraduate" and
 * "Postgraduate". Someone arrives already knowing they hold down a job, or that
 * they want out of the field they are in — so a row here is an intent, and an
 * intent is a predicate over the facets a program already carries.
 *
 * Kept free of any CMS import, like nav-menus.ts, so the same definitions can
 * bucket programs on the server and label tabs on the client.
 *
 * Rules match names rather than slugs. A slug is generated from whatever an
 * editor typed — `level.slug` is "postgraduate" on one install and "pg-courses"
 * on the next — while the name stays readable in both. Rules within an intent
 * are ORed, and an intent nothing matches is dropped from the rail rather than
 * rendering a row that opens an empty grid.
 */

/** What the tab strip renders. No predicates: the client never re-matches. */
export interface Intent {
  id: string;
  label: string;
  /** The second line, translating the label into a situation. */
  note: string;
}

/** One program's text, as the rules see it. Lowercased by `intentsFor`. */
export interface ProgramFacets {
  name: string;
  courseName: string;
  levelName: string;
  streamName: string;
  modeName: string;
  typeName: string;
}

type Facet = keyof ProgramFacets;

interface Rule {
  facets: Facet[];
  pattern: RegExp;
}

interface IntentDefinition extends Intent {
  rules: Rule[];
  /** Matched last, and vetoes the intent. Keeps a PhD out of "Fresh graduate". */
  unless?: Rule;
}

/**
 * Doctoral study, in the several spellings a CMS ends up holding.
 *
 * Shared rather than repeated because it is used twice in opposite directions:
 * it defines the doctorate row, and it excludes those programs from the two
 * rows that would otherwise sweep them up on the strength of "Master".
 */
const DOCTORAL = /doctor|ph\.?\s?d|d\.?\s?phil|\bdba\b|m\.?\s?phil/;

/**
 * A degree abbreviation at the head of a course name — "M.Tech", "MBA", "MA".
 *
 * The length cap is what keeps it from eating whole words: "Management" and
 * "Mechanical" both start with M, and neither has a word boundary within three
 * letters of it.
 */
const MASTERS = /^m[.\s]|^m[a-z]{1,3}\b|master|pgdm/;
const BACHELORS = /^b[.\s]|^b[a-z]{1,3}\b|bachelor/;

const DEFINITIONS: IntentDefinition[] = [
  {
    id: 'working-professional',
    label: 'Working professional',
    note: 'Weekends & self-paced',
    rules: [
      {
        facets: ['modeName'],
        pattern: /online|distance|part.?time|weekend|hybrid|self.?paced|evening|flexi/,
      },
      // A certificate or diploma is the shape of qualification someone fits
      // around a job, whatever mode the CMS records against it.
      { facets: ['typeName'], pattern: /certificate|diploma/ },
      { facets: ['name', 'courseName'], pattern: /executive|working professional/ },
    ],
  },
  {
    id: 'fresh-graduate',
    label: 'Fresh graduate',
    note: 'Start right after your degree',
    rules: [
      { facets: ['levelName'], pattern: /post.?grad|master|\bpg\b/ },
      { facets: ['courseName'], pattern: MASTERS },
    ],
    unless: { facets: ['name', 'courseName', 'levelName'], pattern: DOCTORAL },
  },
  {
    id: 'after-12th',
    label: 'After 12th',
    note: 'Your first online degree',
    rules: [
      { facets: ['levelName'], pattern: /under.?grad|\bug\b|bachelor/ },
      { facets: ['courseName'], pattern: BACHELORS },
    ],
    unless: { facets: ['name', 'courseName', 'levelName'], pattern: DOCTORAL },
  },
  {
    id: 'career-switcher',
    label: 'Career switcher',
    note: 'Move into AI, data or tech',
    rules: [
      {
        facets: ['name', 'courseName', 'streamName'],
        pattern:
          /\b(ai|ml|it)\b|artificial intelligence|machine learning|data|analytic|comput|software|cyber|cloud|information technolog|engineer|technolog|develop|full.?stack/,
      },
    ],
  },
  {
    id: 'managers-leaders',
    label: 'Managers & leaders',
    note: 'Executive MBA and beyond',
    rules: [
      {
        facets: ['name', 'courseName', 'streamName'],
        pattern:
          /\bmba\b|pgdm|management|business|marketing|finance|human resource|\bhr\b|executive|leadership|entrepreneur/,
      },
    ],
    unless: { facets: ['name', 'courseName', 'levelName'], pattern: DOCTORAL },
  },
  {
    id: 'doctorate',
    label: 'Doctorate',
    note: 'PhD & DBA with work experience',
    rules: [{ facets: ['name', 'courseName', 'levelName'], pattern: DOCTORAL }],
  },
];

/** The rail's order, before empty rows are dropped. */
export const INTENTS: Intent[] = DEFINITIONS.map(({ id, label, note }) => ({
  id,
  label,
  note,
}));

function test(facets: ProgramFacets, rule: Rule): boolean {
  return rule.pattern.test(rule.facets.map((facet) => facets[facet]).join(' '));
}

/**
 * Every intent one program belongs to.
 *
 * Deliberately not exclusive: an Online MBA is honestly both something a
 * working professional studies and something a manager takes, and forcing it
 * into one row would empty the other. A program that matches nothing simply
 * never appears in the finder — its course still does, through its siblings.
 */
export function intentsFor(facets: Partial<ProgramFacets>): string[] {
  const lowered: ProgramFacets = {
    name: (facets.name ?? '').toLowerCase(),
    courseName: (facets.courseName ?? '').toLowerCase(),
    levelName: (facets.levelName ?? '').toLowerCase(),
    streamName: (facets.streamName ?? '').toLowerCase(),
    modeName: (facets.modeName ?? '').toLowerCase(),
    typeName: (facets.typeName ?? '').toLowerCase(),
  };

  return DEFINITIONS.filter(
    (intent) =>
      intent.rules.some((rule) => test(lowered, rule)) &&
      !(intent.unless && test(lowered, intent.unless))
  ).map((intent) => intent.id);
}
