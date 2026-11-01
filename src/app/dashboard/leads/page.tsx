import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LeadsDataTable } from '@/components/dashboard/leads-datatable';
import { getAdminLeads, getAdminLeadSummary } from '@/lib/cms/repositories/enquiry';
import { requireAdmin } from '@/lib/auth/admin';
import { CMS_PUBLIC_URL } from '@/lib/env';
import { leadsHref, parseLeadsQuery } from '@/lib/leads-query';

export const metadata: Metadata = {
  title: 'Lead enquiries — Admissions desk', robots: { index: false, follow: false },
};

export default async function AdminLeadsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin('/dashboard/leads');
  const query = parseLeadsQuery(await searchParams);
  let loaded;
  try {
    loaded = await Promise.all([getAdminLeads(query), getAdminLeadSummary()]);
  } catch (error) {
    return <section className="rounded-xl border border-ink-200 bg-white p-6" aria-labelledby="leads-unavailable">
      <h1 id="leads-unavailable" className="text-xl font-semibold">Lead enquiries are unavailable</h1>
      <p className="mt-3 text-sm text-ink-700" role="alert">{error instanceof Error ? error.message : 'The lead list could not be loaded. Please try again.'}</p>
      <a href={`${CMS_PUBLIC_URL}/admin`} target="_blank" rel="noopener noreferrer" className="rs-button mt-5">Open the CMS</a>
    </section>;
  }
  const [result, summary] = loaded;
  if (query.page > result.pageCount) redirect(leadsHref(query, { page: result.pageCount }));
  const metrics = [
    ['Total enquiries', summary.total], ['CAF applications', summary.applications],
    ['Registration enquiries', summary.registration], ['New enquiries', summary.new],
  ] as const;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-200 pb-4">
      <div><p className="text-sm font-semibold text-brand-800">Admissions desk</p><h1 className="mt-1 text-2xl font-semibold text-ink-900">Lead enquiries</h1><p className="mt-2 text-sm text-ink-700">Search, review and export student enquiries across the full catalogue.</p></div>
      <a href={`${CMS_PUBLIC_URL}/admin`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-ink-250 bg-white px-4 text-sm font-semibold text-brand-800">Open the CMS</a>
    </div>
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-ink-200 bg-white p-4"><dt className="text-sm text-ink-700">{label}</dt><dd className="mt-2 text-2xl font-semibold text-brand-800">{value}</dd></div>)}</dl>
    <p className="text-sm text-ink-600">Counts cover all enquiries. Registration enquiries include students who separately requested counselling.</p>
    <LeadsDataTable key={leadsHref(query)} initialLeads={result.data} totalCount={result.total} query={query} pageCount={result.pageCount} />
  </div>;
}
