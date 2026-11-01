export const LEAD_SOURCES = [
  ['all', 'All sources'],
  ['application-form', 'Common application'],
  ['homepage-callback', 'Homepage callback'],
  ['registration', 'Registration enquiries'],
  ['counselling', 'Counselling'],
  ['contact', 'Contact'],
  ['brochure', 'Brochure'],
  ['sidebar', 'Sidebar'],
] as const;

export interface LeadsQuery {
  page: number;
  pageSize: number;
  q: string;
  source: string;
  date: string;
  sort: string;
}

export function parseLeadsQuery(values: Record<string, string | string[] | undefined>): LeadsQuery {
  const first = (key: string) => Array.isArray(values[key]) ? values[key][0] : values[key];
  const integer = (key: string, fallback: number) => {
    const value = Number(first(key));
    return Number.isSafeInteger(value) && value > 0 ? value : fallback;
  };
  const pageSize = integer('pageSize', 25);
  const source = first('source') || 'all';
  const date = first('date') || 'all';
  const sort = first('sort') || 'date-desc';
  return {
    page: Math.min(integer('page', 1), 100_000),
    pageSize: [10, 25, 50, 100].includes(pageSize) ? pageSize : 25,
    q: (first('q') || '').trim().slice(0, 120),
    source: LEAD_SOURCES.some(([value]) => value === source) ? source : 'all',
    date: ['all', 'today', 'week', 'month'].includes(date) ? date : 'all',
    sort: ['date-desc', 'date-asc', 'name-asc', 'name-desc'].includes(sort) ? sort : 'date-desc',
  };
}

export function leadFilters(query: LeadsQuery, now = new Date(), until?: string) {
  const filters: Record<string, unknown>[] = [];
  if (query.source === 'registration') {
    filters.push({ source: { $eq: 'counselling' }, message: { $contains: '[STUDENT REGISTRATION]' } });
  } else if (query.source !== 'all') filters.push({ source: { $eq: query.source } });
  if (query.q) filters.push({ $or: [
    ...['name', 'phone', 'email', 'city', 'state', 'message'].map(field => ({ [field]: { $containsi: query.q } })),
    { program: { name: { $containsi: query.q } } },
    { university: { name: { $containsi: query.q } } },
  ] });
  const days = ({ today: 1, week: 7, month: 30 } as Record<string, number>)[query.date];
  if (days) filters.push({ createdAt: { $gte: new Date(now.getTime() - days * 86_400_000).toISOString() } });
  if (until) filters.push({ createdAt: { $lte: until } });
  return filters.length ? { $and: filters } : undefined;
}

export function leadsHref(query: LeadsQuery, updates: Partial<LeadsQuery> = {}, path = '/dashboard/leads') {
  const next = { ...query, ...updates };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value !== '' && value !== 'all') params.set(key, String(value));
  }
  return `${path}?${params.toString()}`;
}

export function csvCell(value: unknown) {
  let text = String(value ?? '').replace(/[\r\n]+/g, ' ');
  // Quoting alone does not prevent spreadsheets from evaluating a formula.
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function leadWhatsApp(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10) digits = `91${digits}`;
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}` : undefined;
}
