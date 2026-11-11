'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Building2, MessageCircle, Sprout, X } from 'lucide-react';
import { EnquiryForm } from '@/components/forms/enquiry-form';
import { useSiteSettings } from '@/components/providers/site-settings-provider';
import './university-enquiry-modal.css';

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
  if (!context) throw new Error('useEnquiryModal must be used within an EnquiryModalProvider');
  return context;
}

export function useOptionalEnquiryModal() {
  return useContext(EnquiryModalContext);
}

export function EnquiryModalProvider({
  children,
  autoOpenFirstVisit = false,
}: {
  children: ReactNode;
  autoOpenFirstVisit?: boolean;
}) {
  const { whatsappNumber, contactPhone } = useSiteSettings();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOpenOptions | null>(null);

  const openModal = useCallback((next: ModalOpenOptions) => {
    setOptions(next);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const node = dialog.current;
    if (!node) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!node.open) node.showModal();
    node.querySelector<HTMLInputElement>('input:not([type="hidden"])')?.focus();
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!autoOpenFirstVisit || typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      setOptions(current =>
        current ?? {
          universitySlug: '',
          universityName: 'Agrico Admission Desk',
          programName: 'Agriculture & AgriTech Degree Guidance',
          source: 'counselling',
          title: 'Get Free Admission Guidance',
          subtitle: 'Compare ICAR-aligned agriculture universities, fee structures, scholarships and eligibility with a personal counsellor.',
        }
      );
      setIsOpen(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [autoOpenFirstVisit]);

  const title =
    options?.title ||
    (options?.source === 'brochure'
      ? 'Request a brochure'
      : options?.source === 'application-form'
        ? 'Enquire about admission'
        : 'Talk about your options');
  const rawWa =
    whatsappNumber ||
    contactPhone ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
    '919876543210';
  const digits = rawWa.replace(/\D/g, '');
  const number = digits.length === 10 ? '91' + digits : digits;
  const message = encodeURIComponent(
    `I would like agriculture admission guidance for ${options?.universityName || 'Agrico'}${options?.programName ? ' — ' + options.programName : ''}.`
  );

  return (
    <EnquiryModalContext.Provider value={{ openModal, closeModal, isOpen, options }}>
      {children}
      <dialog
        ref={dialog}
        className="sm-enquiry-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={options?.programName ? `${id}-university ${id}-course` : `${id}-university`}
        onCancel={event => {
          event.preventDefault();
          closeModal();
        }}
        onClose={closeModal}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
            closeModal();
        }}
      >
        {isOpen && options ? (
          <div className="sm-enquiry-layout">
            <button className="sm-enquiry-close" type="button" aria-label="Close enquiry" onClick={closeModal}>
              <X size={20} aria-hidden="true" />
            </button>
            <aside className="sm-enquiry-context" aria-label="Your enquiry details">
              <div className="sm-enquiry-context-icon">
                <Sprout size={24} aria-hidden="true" />
              </div>
              <p className="sm-enquiry-kicker">Your study options</p>
              <div className="sm-enquiry-university" id={`${id}-university`}>
                <Building2 size={17} aria-hidden="true" />
                <h3>{options.universityName}</h3>
              </div>
              {options.programName ? (
                <div className="sm-enquiry-course" id={`${id}-course`}>
                  <span>Course of interest</span>
                  <strong>{options.programName}</strong>
                </div>
              ) : null}
              <p className="sm-enquiry-context-copy">
                {options.subtitle || 'Discuss ICAR-aligned course options, fees, eligibility and the admission process.'}
              </p>
              {number ? (
                <div className="sm-enquiry-alternative">
                  <span>Prefer a chat?</span>
                  <a href={`https://wa.me/${number}?text=${message}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} aria-hidden="true" />
                    Chat on WhatsApp
                    <ArrowUpRight size={15} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              ) : null}
            </aside>
            <div className="sm-enquiry-main">
              <header>
                <p className="sm-enquiry-kicker">Admission enquiry</p>
                <h2 id={`${id}-title`}>{title}</h2>
                <p>Share your details to discuss your next step.</p>
              </header>
              <EnquiryForm
                key={[options.universitySlug, options.programSlug, options.programName, options.source].join(':')}
                source={options.source || 'counselling'}
                universitySlug={options.universitySlug}
                programSlug={options.programSlug}
                courseName={options.programName}
                compact
                submitLabel={
                  options.source === 'brochure'
                    ? 'Request a brochure'
                    : options.source === 'application-form'
                      ? 'Send admission enquiry'
                      : 'Request guidance'
                }
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </EnquiryModalContext.Provider>
  );
}
