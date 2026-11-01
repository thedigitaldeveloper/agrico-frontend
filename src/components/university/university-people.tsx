import Image from 'next/image';
import { resolveThumbnail } from '@/lib/cms/media';
import type { UniversityDetail } from '@/lib/cms/repositories/university';

/** Published faculty and recruiter relations; empty collections render nothing. */
export function UniversityPeople({ university }: { university: UniversityDetail }) {
  const faculties = university.faculties ?? [];
  const recruiters = university.recruiters ?? [];
  if (!faculties.length && !recruiters.length) return null;
  return <div className="container-page space-y-8 py-8">
    {faculties.length ? <section aria-label="Faculty">
      <h2 className="mb-4 font-display text-xl font-bold">Faculty</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{faculties.map(person => {
        const photo = resolveThumbnail(person.photo, 160, person.name);
        const profile = person.social_link && /^https?:\/\//i.test(person.social_link) ? person.social_link : null;
        return <article key={person.documentId} className="rounded-xl border border-ink-200 p-5">
          {photo ? <Image src={photo.src} alt={photo.alt} width={80} height={80} className="mb-3 size-20 rounded-full object-cover" /> : null}
          <h3 className="font-semibold">{person.name}</h3>
          {person.designation ? <p className="text-sm text-ink-600">{person.designation}</p> : null}
          {person.qualification ? <p className="mt-1 text-sm">{person.qualification}</p> : null}
          {person.bio ? <p className="mt-3 whitespace-pre-line text-sm text-ink-600">{person.bio}</p> : null}
          {profile ? <a href={profile} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-brand-700 underline">Profile</a> : null}
        </article>;
      })}</div>
    </section> : null}
    {recruiters.length ? <section aria-label="Recruiters">
      <h2 className="mb-4 font-display text-xl font-bold">Recruiters</h2>
      <ul className="flex flex-wrap gap-4">{recruiters.map(recruiter => {
        const logo = resolveThumbnail(recruiter.logo, 160, recruiter.name);
        return <li key={recruiter.documentId} className="flex items-center gap-3 rounded-xl border border-ink-200 p-4">
          {logo ? <Image src={logo.src} alt={logo.alt} width={64} height={64} className="size-16 object-contain" /> : null}
          <span>{recruiter.name}</span>
        </li>;
      })}</ul>
    </section> : null}
  </div>;
}
