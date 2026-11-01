import { Section } from '@/components/ui/section';

const FACILITIES = [
  {
    icon: HostelIcon,
    title: 'Hostel & Residence',
    description: 'Separate AC & Non-AC accommodation for boys and girls with 24/7 security.',
  },
  {
    icon: LibraryIcon,
    title: 'Central Library',
    description: 'Extensive physical & digital collections, research journals, and quiet study zones.',
  },
  {
    icon: PlacementIcon,
    title: 'Placement Cell',
    description: 'Dedicated career guidance, soft skills training, and top recruiter drives.',
  },
  {
    icon: LabIcon,
    title: 'Advanced Labs',
    description: 'Modern high-tech computing labs, research equipment, and workshop bays.',
  },
  {
    icon: SportsIcon,
    title: 'Sports & Fitness',
    description: 'Outdoor sports grounds, indoor courts, athletics track, and fully-equipped gym.',
  },
  {
    icon: WifiIcon,
    title: 'Smart Campus & Wi-Fi',
    description: 'High-speed campus-wide wireless network and smart technology-enabled classrooms.',
  },
  {
    icon: FoodIcon,
    title: 'Cafeteria & Dining',
    description: 'Hygienic multi-cuisine food courts and cafeterias catering to varied food preferences.',
  },
  {
    icon: MedicalIcon,
    title: 'Healthcare Center',
    description: 'On-campus medical clinic with qualified nurses, doctor visits, and 24/7 ambulance.',
  },
];

export function UniversityFacilities({ universityName }: { universityName: string }) {
  return (
    <Section
      title="Campus & Infrastructure"
      description={`Essential facilities and amenities provided at ${universityName} for academic, extracurricular, and residential excellence.`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {FACILITIES.map((facility) => {
          const Icon = facility.icon;
          return (
            <div
              key={facility.title}
              className="flex flex-col rounded-card border border-ink-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-200/50 sm:size-12">
                <Icon />
              </div>
              <h3 className="mt-3.5 font-display text-sm font-bold text-ink-900 sm:text-base">
                {facility.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600 sm:text-sm">
                {facility.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function HostelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6v4H9z" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15zM6 6h10M6 10h10" />
    </svg>
  );
}

function PlacementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <path d="M10 2v7.31L4.31 19.3A2 2 0 0 0 6 22h12a2 2 0 0 0 1.69-2.7L14 9.31V2M8.5 2h7M14 9.3h-4" />
    </svg>
  );
}

function SportsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 sm:size-6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
