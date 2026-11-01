'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  FileText,
} from 'lucide-react';

import { EnquiryForm } from '@/components/forms/enquiry-form';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import { cn } from '@/lib/cn';

type Source = 'application-form' | 'counselling' | 'brochure' | 'contact' | 'sidebar';

export interface ModalOpenOptions {
  universitySlug: string;
  universityName: string;
  programSlug?: string;
  programName?: string;
  source?: Source;
  title?: string;
  subtitle?: string;
}

interface EnquiryModalContextValue {
  openModal: (options: ModalOpenOptions) => void;
  closeModal: () => void;
  isOpen: boolean;
  options: ModalOpenOptions | null;
}

const EnquiryModalContext = createContext<EnquiryModalContextValue | null>(null);

export function useEnquiryModal() {
  const context = useContext(EnquiryModalContext);
  if (!context) {
    throw new Error('useEnquiryModal must be used within an EnquiryModalProvider');
  }
  return context;
}

export function EnquiryModalProvider({ children }: { children: ReactNode }) {
  const { whatsappNumber } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<ModalOpenOptions | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'whatsapp'>('form');

  const openModal = useCallback((opts: ModalOpenOptions) => {
    setOptions(opts);
    setActiveTab('form');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
      const visible = Array.from(controls ?? []).filter(element => element.getClientRects().length > 0);
      const first = visible[0];
      const last = visible[visible.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    dialogRef.current?.querySelector<HTMLElement>('button, input')?.focus();

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  const defaultTitle =
    options?.source === 'brochure'
      ? `Request a brochure`
      : options?.source === 'application-form'
        ? `Enquire about admission`
        : `Admission & fee guidance`;

  const defaultSubtitle =
    options?.source === 'brochure'
      ? `Ask about the syllabus, fees and admission requirements for ${options?.universityName || 'University'}.`
      : `Discuss programme fees, eligibility and application steps for ${options?.universityName || 'University'}.`;

  const waMessage = encodeURIComponent(
    `Hi Agrico, I want official admission details, fee installment options and scholarship eligibility for ${options?.universityName || 'University'}${
      options?.programName ? ` (${options.programName})` : ''
    }.`
  );

  return (
    <EnquiryModalContext.Provider value={{ openModal, closeModal, isOpen, options }}>
      {children}

      {isOpen && options ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
          className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto overscroll-contain"
        >
          {/* Backdrop with clean blur */}
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Modal Card with strict max-height and inner flex scroll */}
          <div
            className={cn(
              'relative z-10 w-full flex flex-col',
              'max-h-[min(90vh,calc(100dvh-2rem))]',
              'rounded-2xl sm:rounded-3xl border border-brand-200/80 bg-white shadow-2xl',
              'sm:max-w-lg md:max-w-xl my-auto',
              'animate-in fade-in zoom-in-95 duration-200 overflow-hidden'
            )}
          >
            {/* Top Brand Banner in Theme Maroon (Shrink-0: Never cut off) */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 px-5 pt-4 pb-3 sm:px-6 sm:pt-4.5 sm:pb-3.5 text-white border-b border-white/10">
              {/* Subtle ambient light */}
              <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-gold-400/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 size-36 rounded-full bg-brand-600/30 blur-2xl" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 border border-gold-300/40 px-2.5 py-0.5 text-xs font-semibold text-gold-200">
                      <Sparkles className="size-3 text-gold-300" />
                      <span>{options.source === 'brochure' ? 'Brochure enquiry' : 'Agrico guidance'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="size-3 text-white" />
                      <span>Programme support</span>
                    </span>
                  </div>

                  <h2
                    id="enquiry-modal-title"
                    className="font-display text-xl sm:text-2xl font-medium text-white tracking-tight leading-snug"
                  >
                    {options.title || defaultTitle}
                  </h2>

                  <p className="mt-1 text-sm text-white/90 leading-relaxed">
                    {options.subtitle || defaultSubtitle}
                  </p>
                </div>

                {/* Close Button - Always visible, highly accessible */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              {/* Interactive Mode Switch Tabs */}
              <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-brand-900/50 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                    activeTab === 'form'
                      ? 'bg-white text-brand-900 shadow-sm font-bold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <FileText className="size-3.5 sm:size-4" />
                  <span>Enquiry form</span>
                </button>
                {whatsappNumber ? <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 min-h-11 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
                    activeTab === 'whatsapp'
                      ? 'bg-white text-brand-800 shadow-sm font-bold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <MessageCircle className="size-3.5 sm:size-4" />
                  <span>WhatsApp</span>
                </button> : null}
              </div>
            </div>

            {/* Modal Form / WhatsApp Body (Inner Scrollable Area) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
              {activeTab === 'form' ? (
                <EnquiryForm
                  source={options.source ?? 'counselling'}
                  universitySlug={options.universitySlug}
                  programSlug={options.programSlug}
                  compact={true}
                  submitLabel={
                    options.source === 'brochure'
                      ? 'Request a brochure'
                      : options.source === 'application-form'
                        ? 'Submit admission enquiry'
                        : 'Request admission guidance'
                  }
                />
              ) : (
                /* WhatsApp View */
                <div className="py-2 text-center space-y-3.5">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#128C7E] shadow-inner">
                    <MessageCircle className="size-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="font-display text-sm sm:text-base font-bold text-ink-950">
                      Chat with Agrico
                    </h3>
                    <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                      Ask a counsellor about programme fees, eligibility and the application process.
                    </p>
                  </div>

                  <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-700 border border-ink-200/80 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-brand-800 font-bold text-3xs uppercase tracking-wider">
                      <CheckCircle2 className="size-3.5 text-brand-800" />
                      <span>Your selected programme</span>
                    </div>
                    <p className="text-xs text-ink-600">
                      Target University: <strong className="text-ink-900">{options.universityName}</strong>
                      {options.programName ? ` · ${options.programName}` : ''}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-brand-900 hover:shadow-lg"
                  >
                    <MessageCircle className="size-4" />
                    <span>Open WhatsApp &amp; Start Chat</span>
                  </a>

                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('form')}
                      className="text-xs font-semibold text-brand-800 hover:text-brand-900 underline cursor-pointer"
                    >
                      &larr; Or fill the quick online form instead
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Trust Line (Shrink-0) */}
            <div className="shrink-0 bg-brand-50/70 px-5 py-2.5 sm:px-6 sm:py-3 border-t border-brand-100 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-600">
              <span className="flex items-center gap-1.5 font-semibold text-brand-900">
                <ShieldCheck className="size-3.5 sm:size-4 text-brand-700" />
                <span>Agrico admission guidance</span>
              </span>
              <span className="text-ink-500 font-medium">
                Your next step, with clarity
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </EnquiryModalContext.Provider>
  );
}
