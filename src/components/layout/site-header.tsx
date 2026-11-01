import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { RsDesktopNav, RsMobileNav, type RsNavigationData } from './rs-mobile-nav';
import { BRAND } from '@/lib/brand';
import { getDynamicMegaMenuData } from '@/lib/cms/repositories/navigation';
import { getHomePageData } from '@/lib/cms/repositories/home';

export const getRsNavigation = cache(async (): Promise<RsNavigationData> => {
  const [data, home] = await Promise.all([getDynamicMegaMenuData(), getHomePageData()]);
  const degrees = new Map(data.programStreams.flatMap(stream => stream.degrees)
    .filter(degree => degree.specializations.length > 0)
    .map(degree => [degree.degreeName, { label: degree.degreeName, href: '/programs?q=' + encodeURIComponent(degree.degreeName) }]));
  const universities = new Map(data.universityCategories.flatMap(category => category.universities)
    .map(university => [university.slug, { label: university.name, href: '/university/' + university.slug }]));
  return {
    counsellingHref: home.sectionVisibility.callback === false ? '/contact-us' : '/#guidance',
    programmes: [...degrees.values()].slice(0, 6),
    universities: [...universities.values()].slice(0, 6),
    resources: [
      { label: 'Entrance exams', href: '/exams' },
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'Admission mentors', href: '/mentors' },
      { label: 'Questions & answers', href: '/qna' },
    ],
    student: [
      { label: 'Application form', href: '/common-application-form' },
      { label: 'Student dashboard', href: '/dashboard' },
    ],
  };
});

export async function SiteHeader() {
  const navigation = await getRsNavigation();
  return (
    <header className="rs-header">
      <div className="rs-container rs-header-inner">
        <Link href="/" aria-label="Agrico home">
          <Image
            className="rs-header-logo"
            src={BRAND.logo}
            alt="Agrico"
            width={204}
            height={40}
            priority
          />
        </Link>
        <RsDesktopNav navigation={navigation} />
        <div className="rs-header-actions">
          <Link
            href="/search"
            className="rs-header-search"
            aria-label="Search programmes and universities"
          >
            <Search size={20} />
          </Link>
          <Link href="/login" className="rs-header-login">
            Sign in
          </Link>
          <Link href={navigation.counsellingHref} className="rs-button">
            Talk to a counsellor <ArrowRight size={16} />
          </Link>
        </div>
        <RsMobileNav navigation={navigation} />
      </div>
    </header>
  );
}
