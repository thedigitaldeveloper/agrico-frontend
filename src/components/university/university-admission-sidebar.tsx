'use client';

import { AdmissionPanel } from './admission-panel';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import type { UniversityDetail } from '@/lib/cms/repositories/university';

export function UniversityAdmissionSidebar({ university }: { university: UniversityDetail }) {
  const { whatsappNumber } = useSiteSettings();
  return <AdmissionPanel
    name={university.name} universitySlug={university.slug} universityName={university.name}
    courses={university.courses.map(course => course.name)}
    showApply={university.show_apply_button} applyLabel={university.apply_button_text}
    fees={(university.program_fees ?? []).filter(row => row.program).map(row => ({ name: row.program!.name, fee: row.fee, note: row.note }))}
    brochure={university.brochure}
    whatsapp={university.whatsapp_number || whatsappNumber} phone={university.toll_free_number}
  />;
}
