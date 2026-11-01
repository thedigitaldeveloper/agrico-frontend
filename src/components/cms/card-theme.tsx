import type { ReactNode } from 'react';

export interface CardTheme {
  icon: ReactNode;
  badgeLabel: string;
  iconBg: string;
  badgeStyle: string;
  accentBorder: string;
  cardBg: string;
}

/**
 * Intelligent category classifier for University highlights, approvals, fees, admissions, and features.
 */
export function getCardTheme(rawKey: string): CardTheme {
  const k = (rawKey || '').toLowerCase();

  // 1. UGC / DEB / Statutory / Govt / Central / Ministry / Regulatory Approvals
  if (
    k.includes('ugc') ||
    k.includes('deb') ||
    k.includes('govt') ||
    k.includes('statutory') ||
    k.includes('regulat') ||
    k.includes('ministry') ||
    k.includes('entitle')
  ) {
    return {
      badgeLabel: 'STATUTORY APPROVAL',
      iconBg: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 border-emerald-200',
      badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-emerald-500/5',
      accentBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-950/5',
      cardBg: 'from-emerald-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18" />
        </svg>
      ),
    };
  }

  // 2. NAAC / Ranking / NBA / NIRF / Grade / QS / Times Higher / Excellence
  if (
    k.includes('naac') ||
    k.includes('nba') ||
    k.includes('nirf') ||
    k.includes('grade') ||
    k.includes('rank') ||
    k.includes('accredit') ||
    k.includes('qs') ||
    k.includes('award')
  ) {
    return {
      badgeLabel: 'ACCREDITATION & RANK',
      iconBg: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 border-amber-200',
      badgeStyle: 'bg-amber-50 text-amber-900 border-amber-300/80 shadow-amber-500/5',
      accentBorder: 'hover:border-amber-400 group-hover:shadow-amber-950/5',
      cardBg: 'from-amber-50/25 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0V8.25A2.25 2.25 0 0012.25 6h-1.5a2.25 2.25 0 00-2.25 2.25v6M12 2.25a2.25 2.25 0 00-2.25 2.25h4.5A2.25 2.25 0 0012 2.25z" />
        </svg>
      ),
    };
  }

  // 3. AICTE / Technical / LMS / Digital / Proctored / Portal / Degree / Engineering
  if (
    k.includes('aicte') ||
    k.includes('tech') ||
    k.includes('lms') ||
    k.includes('online') ||
    k.includes('mode') ||
    k.includes('proctor') ||
    k.includes('portal') ||
    k.includes('degree')
  ) {
    return {
      badgeLabel: 'TECHNICAL & LEARNING',
      iconBg: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 border-blue-200',
      badgeStyle: 'bg-blue-50 text-blue-900 border-blue-200/80 shadow-blue-500/5',
      accentBorder: 'hover:border-blue-400 group-hover:shadow-blue-950/5',
      cardBg: 'from-blue-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    };
  }

  // 4. AIU / WES / ECE / ACU / Commonwealth / Global / International / Worldwide / Equivalence
  if (
    k.includes('aiu') ||
    k.includes('wes') ||
    k.includes('ece') ||
    k.includes('acu') ||
    k.includes('global') ||
    k.includes('international') ||
    k.includes('world') ||
    k.includes('commonwealth') ||
    k.includes('recogni') ||
    k.includes('mobility') ||
    k.includes('foreign')
  ) {
    return {
      badgeLabel: 'GLOBAL EQUIVALENCE',
      iconBg: 'bg-teal-500/10 text-teal-700 ring-teal-500/20 border-teal-200',
      badgeStyle: 'bg-teal-50 text-teal-900 border-teal-200/80 shadow-teal-500/5',
      accentBorder: 'hover:border-teal-400 group-hover:shadow-teal-950/5',
      cardBg: 'from-teal-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    };
  }

  // 5. Fee / EMI / Money / Cost / Price / Scholarship / Loan / Installment
  if (
    k.includes('fee') ||
    k.includes('emi') ||
    k.includes('cost') ||
    k.includes('price') ||
    k.includes('scholarship') ||
    k.includes('installment') ||
    k.includes('financial') ||
    k.includes('aid') ||
    k.includes('loan')
  ) {
    return {
      badgeLabel: 'AFFORDABLE & EMI',
      iconBg: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 border-emerald-200',
      badgeStyle: 'bg-emerald-50 text-emerald-950 border-emerald-300/80 shadow-emerald-500/5',
      accentBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-950/5',
      cardBg: 'from-emerald-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
    };
  }

  // 6. Placement / Recruiters / Hiring / Salary / Package / Career / Alumni / Corporate
  if (
    k.includes('placement') ||
    k.includes('recruit') ||
    k.includes('hiring') ||
    k.includes('career') ||
    k.includes('package') ||
    k.includes('salary') ||
    k.includes('partner') ||
    k.includes('alumni') ||
    k.includes('corporate') ||
    k.includes('industry')
  ) {
    return {
      badgeLabel: 'CAREER & PLACEMENT',
      iconBg: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 border-rose-200',
      badgeStyle: 'bg-rose-50 text-rose-950 border-rose-300/80 shadow-rose-500/5',
      accentBorder: 'hover:border-rose-400 group-hover:shadow-rose-950/5',
      cardBg: 'from-rose-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      ),
    };
  }

  // 7. Time / Duration / Established / Year / Location / Eligibility / Exam Pattern
  if (
    k.includes('duration') ||
    k.includes('year') ||
    k.includes('est') ||
    k.includes('time') ||
    k.includes('locat') ||
    k.includes('city') ||
    k.includes('address') ||
    k.includes('eligib') ||
    k.includes('criteria')
  ) {
    return {
      badgeLabel: 'DETAILS & DURATION',
      iconBg: 'bg-purple-500/10 text-purple-700 ring-purple-500/20 border-purple-200',
      badgeStyle: 'bg-purple-50 text-purple-950 border-purple-300/80 shadow-purple-500/5',
      accentBorder: 'hover:border-purple-400 group-hover:shadow-purple-950/5',
      cardBg: 'from-purple-50/20 via-white to-white',
      icon: (
        <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  }

  // Default: Brand Burgundy Theme
  return {
    badgeLabel: 'HIGHLIGHT',
    iconBg: 'bg-brand-800/10 text-brand-800 ring-brand-800/20 border-brand-200',
    badgeStyle: 'bg-brand-50 text-brand-950 border-brand-200/80 shadow-brand-500/5',
    accentBorder: 'hover:border-brand-400 group-hover:shadow-brand-950/5',
    cardBg: 'from-brand-50/20 via-white to-white',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 sm:size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
}
