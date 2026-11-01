/**
 * Multi-Level Header Navigation Data & Taxonomy Mapper
 *
 * Provides high-information density, 3-tier drilldown structures for:
 * 1. All Programs (Stream -> Degree / Level -> Specializations -> Top Offering Colleges)
 * 2. Universities (Accreditation / Type -> Featured Institutions -> Statutory Gazette)
 * 3. Admissions & Exams (Entrance Exams -> Financial Aid -> Semester Instalments)
 * 4. Mentors & Community (1-on-1 Sessions -> Verified Q&A -> Guides)
 */

export interface NavTerm {
  name: string;
  slug: string;
}

export interface SpecializationItem {
  name: string;
  slug: string;
  startingEmi?: string;
  isHot?: boolean;
  isNew?: boolean;
}

export interface DegreeGroup {
  level: string;
  degreeName: string;
  degreeSlug: string;
  specializations: SpecializationItem[];
}

export interface OfferingUniversityRef {
  name: string;
  slug: string;
  naacGrade?: string;
  startingFee?: string;
  monthlyEmi?: string;
}

export interface StreamMenuTier {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  degrees: DegreeGroup[];
  topUniversities: OfferingUniversityRef[];
  quickTools: {
    compareLabel: string;
    compareHref: string;
    emiLabel: string;
    emiHref: string;
  };
}

export interface UniversityCategoryTier {
  id: string;
  name: string;
  badge?: string;
  description: string;
  universities: OfferingUniversityRef[];
}

export interface AdmissionsMenuData {
  scholarships: Array<{ name: string; slug: string; benefit: string; badge?: string }>;
  financing: Array<{ name: string; slug: string; note: string }>;
  directAdmission: Array<{ title: string; subtitle: string; href: string }>;
}

export interface MentorsMenuData {
  counseling: Array<{ title: string; subtitle: string; href: string }>;
  qna: Array<{ title: string; subtitle: string; href: string }>;
  guides: Array<{ title: string; subtitle: string; href: string }>;
}

export interface NavigationTaxonomy {
  streams: NavTerm[];
  courses: NavTerm[];
  modes: NavTerm[];
  ownership: NavTerm[];
}

export interface MultiLevelNavigationData {
  programStreams: StreamMenuTier[];
  universityCategories: UniversityCategoryTier[];
  admissions: AdmissionsMenuData;
  community: MentorsMenuData;
}


/** Empty CMS data stays empty. */
export function buildMultiLevelNavData(customData?: Partial<MultiLevelNavigationData>): MultiLevelNavigationData {
 return {
 programStreams: (customData?.programStreams ?? []).filter((stream) => stream.degrees.length > 0),
 universityCategories: customData?.universityCategories ?? [],
 admissions: customData?.admissions ?? { scholarships: [], financing: [], directAdmission: [] },
 community: customData?.community ?? { counseling: [], qna: [], guides: [] },
 };
}
