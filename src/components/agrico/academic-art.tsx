import Image from 'next/image';

export interface AcademicArtItem {
  id: number;
  slug: string;
  title: string;
  src: string;
  svg: string;
  width: number;
  height: number;
}

export const ACADEMIC_ART_ITEMS: readonly AcademicArtItem[] = [
  { id: 0, slug: 'farm-machinery', title: 'Farm machinery', src: '/images/agrico/art/farm-machinery.png', svg: '/images/agrico/art/farm-machinery.svg', width: 408, height: 306 },
  { id: 1, slug: 'soil-water', title: 'Soil & water', src: '/images/agrico/art/soil-water.png', svg: '/images/agrico/art/soil-water.svg', width: 411, height: 284 },
  { id: 2, slug: 'food-processing', title: 'Food processing', src: '/images/agrico/art/food-processing.png', svg: '/images/agrico/art/food-processing.svg', width: 418, height: 319 },
  { id: 3, slug: 'plant-science', title: 'Plant science & practical study', src: '/images/agrico/art/plant-science.png', svg: '/images/agrico/art/plant-science.svg', width: 418, height: 396 },
  { id: 4, slug: 'engineering-greenhouse', title: 'Engineering & greenhouse', src: '/images/agrico/art/engineering-greenhouse.png', svg: '/images/agrico/art/engineering-greenhouse.svg', width: 416, height: 364 },
  { id: 5, slug: 'counselling', title: 'Admission guidance counselling', src: '/images/agrico/art/counselling.png', svg: '/images/agrico/art/counselling.svg', width: 418, height: 306 },
  { id: 6, slug: 'field-research', title: 'Field research & agronomy', src: '/images/agrico/art/field-research.png', svg: '/images/agrico/art/field-research.svg', width: 418, height: 394 },
  { id: 7, slug: 'engineering-student', title: 'Engineering practical learning', src: '/images/agrico/art/engineering-student.png', svg: '/images/agrico/art/engineering-student.svg', width: 418, height: 359 },
  { id: 8, slug: 'agribusiness', title: 'Agribusiness enterprise', src: '/images/agrico/art/agribusiness.png', svg: '/images/agrico/art/agribusiness.svg', width: 418, height: 353 },
] as const;

export function AcademicArt({
  cell,
  className = '',
  eager = false,
  format = 'png',
}: {
  cell: number;
  className?: string;
  eager?: boolean;
  format?: 'png' | 'svg';
}) {
  const item = ACADEMIC_ART_ITEMS[cell] ?? ACADEMIC_ART_ITEMS[0];
  const src = format === 'svg' ? item.svg : item.src;

  return (
    <span aria-hidden="true" className={'ag-art ' + className}>
      <Image
        src={src}
        alt=""
        width={item.width}
        height={item.height}
        loading={eager ? 'eager' : 'lazy'}
        className="ag-art__image"
        unoptimized={format === 'svg'}
      />
    </span>
  );
}
