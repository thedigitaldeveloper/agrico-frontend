import 'server-only';
import qs from 'qs';
import { CMS_INTERNAL_URL, CMS_API_TOKEN } from '@/lib/env';
import { leadFilters, parseLeadsQuery, type LeadsQuery } from '@/lib/leads-query';

export interface LeadEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  source: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  program: string | null;
  university: string | null;
}

export interface LeadsResult {
  data: LeadEnquiry[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * Intelligent helper to extract Program and University from lead messages and raw payloads.
 */
interface RawLead extends Partial<Omit<LeadEnquiry, 'program' | 'university'>> { createdAt?: string; program?: string | { name?: string }; course?: string; university?: string | { name?: string }; universityName?: string; }
const relationName = (value: string | { name?: string } | undefined) => typeof value === 'string' ? value : value?.name;
export function extractLeadDetails(message: string | null, rawItem?: RawLead): {
  program: string | null;
  university: string | null;
} {
  let program: string | null = relationName(rawItem?.program) || rawItem?.course || null;
  let university: string | null = relationName(rawItem?.university) || rawItem?.universityName || null;

  if (message) {
    // 1. Extract Program
    if (!program) {
      const progMatch =
        message.match(/Applied Program:\s*([^\n|]+)/i) ||
        message.match(/Interested Program:\s*([^\n|]+)/i) ||
        message.match(/Program(?:me)?:\s*([^\n|;\]]+)/i) ||
        message.match(/Course:\s*([^\n|;\]]+)/i);

      if (progMatch && progMatch[1]) {
        program = progMatch[1].trim();
      }
    }

    // 2. Extract Specialization if available and not already in program name
    const specMatch =
      message.match(/Selected Specialization:\s*([^\n|]+)/i) ||
      message.match(/Specialization:\s*([^\n|;\]]+)/i);

    if (specMatch && specMatch[1] && program && !program.toLowerCase().includes(specMatch[1].toLowerCase().trim())) {
      const spec = specMatch[1].trim();
      if (spec && !['General', 'Core Track', 'Not Specified'].includes(spec)) {
        program = `${program} (${spec})`;
      }
    }

    // 3. Extract University
    if (!university) {
      const uniMatch =
        message.match(/Target University:\s*([^\n|]+)/i) ||
        message.match(/University Choice:\s*([^\n|]+)/i) ||
        message.match(/University:\s*([^\n|;\]]+)/i) ||
        message.match(/College:\s*([^\n|;\]]+)/i);

      if (uniMatch && uniMatch[1]) {
        university = uniMatch[1].trim();
      }
    }
  }

  // Clean up program slug formats like "online-mba" to "Online MBA"
  if (program && program.includes('-') && !program.includes(' ')) {
    const slugParts = program.split('-').map((p) => {
      if (['mba', 'mca', 'bba', 'bca', 'bcom', 'mcom', 'ma', 'msc', 'ba', 'bsc', 'emba'].includes(p.toLowerCase())) {
        return p.toUpperCase();
      }
      return p.charAt(0).toUpperCase() + p.slice(1);
    });
    program = slugParts.join(' ');
  }

  return {
    program: program || null,
    university: university || null,
  };
}

export async function getAdminLeads(params: Partial<LeadsQuery> & { status?: 'new'; until?: string } = {}): Promise<LeadsResult> {
  if (!CMS_API_TOKEN) throw new Error('Lead access needs a CMS API token configured on the website server.');
  const query = parseLeadsQuery(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])));
  const sort = { 'date-desc': 'createdAt:desc', 'date-asc': 'createdAt:asc', 'name-asc': 'name:asc', 'name-desc': 'name:desc' }[query.sort];
  const search = qs.stringify({
    sort: [sort, 'id:desc'],
    filters: { ...leadFilters(query, params.until ? new Date(params.until) : new Date(), params.until), ...(params.status ? { status: { $eq: params.status } } : {}) },
    populate: { program: { fields: ['name'] }, university: { fields: ['name'] } },
    pagination: { page: query.page, pageSize: query.pageSize, withCount: true },
  }, { encodeValuesOnly: true });
  let res: Response;
  try {
    res = await fetch(`${CMS_INTERNAL_URL}/api/enquiries?${search}`, {
      headers: { Authorization: `Bearer ${CMS_API_TOKEN}` }, cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error('The CMS could not be reached. Please try again.');
  }
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403
    ? 'The CMS token does not have access to enquiries. Check its read permissions.'
    : 'The lead list could not be loaded. Please try again.');
  const json = await res.json();
  const data: RawLead[] = Array.isArray(json.data) ? json.data : [];
  const meta = json.meta?.pagination;
  const formatted = data.map((item): LeadEnquiry => {
    const msg = item.message || '';
    const { program, university } = extractLeadDetails(msg, item);
    return {
      id: item.id ?? 0, name: item.name || 'Anonymous applicant', email: item.email || '', phone: item.phone || '',
      city: item.city || null, state: item.state || null, source: item.source || null, message: msg,
      status: item.status || 'new', created_at: item.createdAt || '', program, university,
    };
  });
  return {
    data: formatted, total: meta?.total ?? data.length, page: meta?.page ?? query.page,
    pageSize: meta?.pageSize ?? query.pageSize, pageCount: Math.max(1, meta?.pageCount ?? 1),
  };
}

/** Counts cover the full collection, independently of the table's current page/filter. */
export async function getAdminLeadSummary() {
  const [all, applications, registration, fresh] = await Promise.all([
    getAdminLeads({ pageSize: 10 }),
    getAdminLeads({ pageSize: 10, source: 'application-form' }),
    getAdminLeads({ pageSize: 10, source: 'registration' }),
    getAdminLeads({ pageSize: 10, status: 'new' }),
  ]);
  return { total: all.total, applications: applications.total, registration: registration.total, new: fresh.total };
}

