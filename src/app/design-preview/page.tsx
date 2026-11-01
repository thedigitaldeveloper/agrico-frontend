import { notFound } from 'next/navigation';
import { RsHome } from '@/components/rs/home';
import { previewData } from '@/components/rs/preview-data';
export const metadata = {
  title: 'Agrico design preview',
  robots: { index: false, follow: false },
};
export default async function DesignPreview({
  searchParams,
}: {
  searchParams: Promise<{ slider?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { slider } = await searchParams;
  const data =
    slider === '1'
      ? {
          ...previewData,
          slides: [
            {
              id: 'preview-one',
              offeringId: previewData.offerings[0].id,
              heading: 'Your degree. Your next big move.',
              description:
                'Explore university programmes and get help planning your next step.',
              image: '/images/rs/student-life.png',
              alt: 'Students exploring their next step',
            },
            {
              id: 'preview-two',
              offeringId: previewData.offerings[1].id,
              heading: 'Make room for your ambition.',
              description:
                'Understand your programme options, one university at a time.',
              image: '/images/rs/campus-life.png',
              alt: 'Illustrative campus, not a specific university',
            },
          ],
        }
      : previewData;
  return <RsHome data={data} preview />;
}
