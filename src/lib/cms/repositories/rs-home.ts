import 'server-only';
import { cmsCollection, cmsFetchOptional } from '../client';
import { collectionTag } from '../tags';
import { resolveImage } from '../media';
import { getHomePageData, type HomeOfferingSelection } from './home';
import { BLOG_SECTIONS, listBlogs, type BlogCard } from './blog';
import { listMentors, type MentorCard } from './mentor';
import { listTestimonials, type TestimonialCard } from './testimonial';
import { getRsCatalogue } from './rs-catalogue';
import { publicationUniversities } from '@/lib/agrico/publication';
import type { Offering, RsHomeData } from '@/components/rs/home-types';

function resolveSelection(selection: HomeOfferingSelection | null | undefined, catalogue: Offering[]) {
  return selection
    ? catalogue.find(item => item.programSlug === selection.programSlug && item.universitySlug === selection.universitySlug) ?? null
    : null;
}
function selectedOfferings(selections: HomeOfferingSelection[], catalogue: Offering[]) {
  const seen = new Set<string>();
  return selections.flatMap(selection => {
    const item = resolveSelection(selection, catalogue);
    if (!item || seen.has(item.id)) return [];
    seen.add(item.id);
    return [item];
  });
}
const post = (p: BlogCard, section: 'news' | 'blogs' | 'articles') => {
  const image = resolveImage(p.thumbnail || p.image);
  return {
    id: p.documentId, title: p.name, summary: p.description || '', date: p.dateTime,
    image: image?.src || null, imageAlt: image?.alt || '',
    category: p.tags?.[0]?.name || (section === 'blogs' ? 'RS blog' : section === 'articles' ? 'Article' : 'Education update'),
    href: '/' + section + '/' + p.slug,
  };
};

async function curatedRecords<T extends { documentId: string }>(path: string, ids: string[], tag: Parameters<typeof collectionTag>[0]): Promise<T[]> {
  if (!ids.length) return [];
  return cmsFetchOptional(async () => {
    const records: T[] = [];
    for (let page = 1; ; page++) {
      const { data, meta } = await cmsCollection<T>(path, { status: 'published', filters: { documentId: { $in: ids } }, pagination: { page, pageSize: 100 } }, { tags: [collectionTag(tag)] });
      records.push(...data);
      if (!data.length || page >= (meta.pagination?.pageCount ?? 1)) break;
    }
    const byId = new Map(records.map(record => [record.documentId, record]));
    return ids.flatMap(id => byId.has(id) ? [byId.get(id)!] : []);
  }, []);
}

export async function getRsHomeData(): Promise<RsHomeData> {
  const home = await getHomePageData();
  const feed = async (section: 'news' | 'blogs', ids: string[]) => home.sectionVisibility[section] === false ? [] : home.sectionDisplay[section] === 'curated'
    ? (await curatedRecords<BlogCard>('/blogs', ids, 'blog')).filter(item => item.type && (BLOG_SECTIONS[section] as readonly string[]).includes(item.type))
    : cmsFetchOptional(async () => (await listBlogs({ section, pageSize: 6 })).posts, []);
  const [catalogueData, news, blogs, mentors, testimonials, articles] = await Promise.all([
    getRsCatalogue(),
    feed('news', home.selectedNews),
    feed('blogs', home.selectedBlogs),
    home.sectionVisibility.mentors !== true ? [] : home.sectionDisplay.mentors === 'curated' ? curatedRecords<MentorCard>('/mentor-profiles', home.selectedMentors, 'mentor-profile') : cmsFetchOptional(async () => (await listMentors({ pageSize: 6 })).mentors, []),
    home.sectionVisibility.testimonials !== true ? [] : home.sectionDisplay.testimonials === 'curated' ? curatedRecords<TestimonialCard>('/testimonials', home.selectedTestimonials, 'testimonial') : listTestimonials(9),
    cmsFetchOptional(async () => (await listBlogs({ section: 'articles', pageSize: 6 })).posts, []),
  ]);
  const { programs: validPrograms, universities: validUniversities, offerings: catalogue } = catalogueData;
  const universityMap = new Map(validUniversities.map(university => [university.slug, university]));
  const spotlight = resolveSelection(home.spotlightOffering, catalogue);
  const spotlightImage = resolveImage(home.spotlightOffering?.image);

  const targetUniversities = (home.featuredUniversities.length > 0
    ? home.featuredUniversities.flatMap(selection => {
        const university = universityMap.get(selection.slug);
        return university ? [university] : [];
      })
    : validUniversities).slice(0, 5);

  return {
    home,
    catalogue,
    programmeChoices: [...new Set(validPrograms.map(program => program.course?.name?.trim() || program.name.trim()))],
    offerings: selectedOfferings(home.featuredOfferings, catalogue),
    universities: targetUniversities.map(university => {
      const pubDoc = publicationUniversities.find(p => p.slug === university.slug);
      const pubLogo = pubDoc?.hero_media?.find(m => m.role === 'logo')?.src || null;
      const pubCampus = pubDoc?.hero_media?.find(m => m.role === 'campus_primary')?.src || null;
      const image = resolveImage(university.image);
      const universityOfferings = catalogue.filter(item => item.universitySlug === university.slug);
      const rating = university.rating == null ? NaN : Number(university.rating);
      const cmsLogo = resolveImage(university.logo)?.src;
      const cmsCardLogo = resolveImage(university.card_logo)?.src;
      const finalLogo = cmsLogo || cmsCardLogo || pubLogo || null;
      const finalImage = image?.src || pubCampus || null;
      const location = [university.city || pubDoc?.identity?.city, university.state || pubDoc?.identity?.state].filter(Boolean).join(', ');
      const ownership = university.ownership_type?.name || pubDoc?.identity?.ownership || '';
      const pubEst = (pubDoc?.identity as { established?: number | string | null } | undefined)?.established;
      const establishedYear = university.established_year ? String(university.established_year) : university.establish?.slice(0, 4) || (pubEst ? String(pubEst) : '');

      return {
        id: university.documentId,
        name: university.name,
        slug: university.slug,
        location,
        logo: finalLogo,
        cardLogo: cmsCardLogo || finalLogo,
        image: finalImage,
        imageAlt: image?.alt || pubDoc?.title || university.name,
        degrees: [...new Set(universityOfferings.map(item => item.degree))],
        ownership,
        approvals: (university.approvals ?? []).map(item => item.name).filter(Boolean),
        rankings: (university.rankings ?? []).map(item => item.name).filter(Boolean),
        modes: [...new Set([...(university.course_modes ?? []).map(item => item.name), ...universityOfferings.map(item => item.mode)].filter(value => value && value !== 'Mode to be confirmed'))],
        establishedYear,
        rating: Number.isFinite(rating) && rating > 0 && rating <= 5 ? rating : null,
        programmeCount: universityOfferings.length,
      };
    }),
    universityOptions: validUniversities.map(({ documentId, name, slug }) => ({ documentId, name, slug })),
    spotlight: spotlight ? {
      ...spotlight,
      eyebrow: home.spotlightOffering?.eyebrow, heading: home.spotlightOffering?.heading,
      description: home.spotlightOffering?.description,
      image: spotlightImage?.src || spotlight.image, imageAlt: spotlightImage ? spotlightImage.alt || '' : spotlight.imageAlt || '',
    } : null,
    comparisonOfferings: selectedOfferings(home.comparisonOfferings, catalogue),
    mentors, testimonials,
    news: news.map(p => post(p, 'news')),
    blogs: blogs.map(p => post(p, 'blogs')),
    articles: articles.map(p => post(p, 'articles')),
    slides: home.slides.map(slide => {
      const picture = slide.media.kind === 'image' ? slide.media.picture
        : slide.media.kind === 'video' || slide.media.kind === 'youtube' ? slide.media.poster : null;
      return {
        id: slide.id, heading: slide.heading || '', description: slide.description || '',
        image: picture?.desktop.src || '/images/rs/student-life.png', alt: picture?.desktop.alt || '',
        media: slide.media, eyebrow: slide.eyebrow, href: slide.href, external: slide.external,
        newTab: slide.newTab, ctaLabel: slide.ctaLabel,
        offeringId: resolveSelection(slide.offering, catalogue)?.id || null,
      };
    }),
    faqs: home.faqs,
    steps: home.howItWorksSteps,
  };
}
