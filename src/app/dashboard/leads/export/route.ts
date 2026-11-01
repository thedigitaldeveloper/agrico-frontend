import { requireAdmin } from '@/lib/auth/admin';
import { getAdminLeads, type LeadEnquiry } from '@/lib/cms/repositories/enquiry';
import { csvCell, parseLeadsQuery } from '@/lib/leads-query';

export const dynamic = 'force-dynamic';

function csvRow(lead: LeadEnquiry) {
  return [lead.id, lead.name, lead.phone, lead.email, lead.program, lead.university, lead.city, lead.state, lead.source, lead.status, lead.created_at, lead.message].map(csvCell).join(',') + '\r\n';
}

export async function GET(request: Request) {
  await requireAdmin('/dashboard/leads');
  const query = { ...parseLeadsQuery(Object.fromEntries(new URL(request.url).searchParams)), page: 1, pageSize: 100 };
  const until = new Date().toISOString();
  let first;
  try { first = await getAdminLeads({ ...query, until }); }
  catch { return new Response('The lead export could not be loaded. Check CMS access and try again.', { status: 503, headers: { 'Cache-Control': 'private, no-store' } }); }
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode('\uFEFF' + ['ID', 'Name', 'Phone', 'Email', 'Programme', 'University', 'City', 'State', 'Source', 'Status', 'Submitted', 'Details'].map(csvCell).join(',') + '\r\n'));
        for (const lead of first.data) controller.enqueue(encoder.encode(csvRow(lead)));
        for (let page = 2; page <= first.pageCount; page++) {
          if (request.signal.aborted) { controller.close(); return; }
          const batch = await getAdminLeads({ ...query, page, until });
          for (const lead of batch.data) controller.enqueue(encoder.encode(csvRow(lead)));
        }
        controller.close();
      } catch { controller.error(new Error('The lead export was interrupted. Please try again.')); }
    },
  });
  return new Response(stream, { headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="rs-education-leads-${until.slice(0, 10)}.csv"`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  } });
}
