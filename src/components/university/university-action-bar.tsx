'use client';

import { useSiteSettings } from '@/components/providers/site-settings-provider';
import { useEnquiryModal } from '@/components/university/university-enquiry-modal';
import type { UniversityDetail } from '@/lib/cms/repositories/university';

export function UniversityActionBar({ university }: { university: UniversityDetail }) {
  const settings = useSiteSettings();
  const whatsappNumber = university.whatsapp_number || settings.whatsappNumber;
  const { openModal } = useEnquiryModal();

  const handleApplyClick = () => {
    openModal({
      universitySlug: university.slug,
      universityName: university.name,
      source: 'application-form',
      title: `Apply to ${university.name}`,
      subtitle: `Admission enquiry for ${university.name}.`,
    });
  };

  const handleCounsellingClick = () => {
    openModal({
      universitySlug: university.slug,
      universityName: university.name,
      source: 'counselling',
      title: `Admission guidance — ${university.name}`,
      subtitle: 'Discuss programme options, eligibility and the next admission steps.',
    });
  };

  const waMessage = encodeURIComponent(
    `Hi Agrico, I want information regarding admission at ${university.name}.`
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="border-t border-ink-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgb(43_12_19/0.12)] backdrop-blur-md">
        <div className="container-page flex items-center gap-2 py-2 sm:py-2.5">
          {/* WhatsApp Quick Icon Button */}
          {whatsappNumber ? <a
            href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C7E] transition-all hover:bg-[#25D366]/25 active:scale-95"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon />
          </a> : null}

          <button
            type="button"
            onClick={handleCounsellingClick}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink-300 bg-white px-3 py-2.5 text-center text-xs font-medium text-ink-800 shadow-sm transition-all hover:bg-ink-50 active:scale-95"
          >
            Talk to Us
          </button>

          {university.show_apply_button ? <button
            type="button"
            onClick={handleApplyClick}
            className="min-h-11 min-w-0 flex-1 rounded-xl bg-brand-800 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900"
          >
            {university.apply_button_text || 'Apply Now'}
          </button> : null}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.201.301-.78 1.002-.956 1.203-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.636-.93-2.246-.244-.593-.493-.512-.678-.521l-.578-.01c-.201 0-.527.075-.803.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.911 1.231 3.112.15.201 2.124 3.244 5.146 4.549.719.311 1.28.497 1.718.636.722.229 1.378.197 1.898.119.58-.088 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.352z" />
      <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.765.46 3.425 1.264 4.881L2 22l5.244-1.229a9.96 9.96 0 004.76 1.237c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 18.007c-1.547 0-3.048-.415-4.356-1.198l-.312-.186-3.235.759.773-3.153-.205-.327a7.973 7.973 0 01-1.226-4.298c0-4.414 3.59-8.003 8.004-8.003 4.414 0 8.004 3.59 8.004 8.003 0 4.414-3.59 8.004-8.004 8.004z" />
    </svg>
  );
}
