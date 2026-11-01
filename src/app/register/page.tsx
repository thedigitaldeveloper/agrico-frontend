import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/auth-forms';
import { AuthShell } from '@/components/rs/auth-shell';
import { one, type SearchParams } from '@/components/ui/pagination';
import { getCurrentUser } from '@/lib/auth/session';
import { buildMetadata } from '@/lib/metadata';
export const metadata = {
  ...buildMetadata({
    title: 'Create your student account',
    description: 'Register for your Agrico student account.',
    path: '/register',
  }),
  robots: { index: false, follow: false },
};
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (await getCurrentUser()) redirect('/dashboard');
  const params = await searchParams;
  return (
    <AuthShell register>
      <RegisterForm next={one(params.next)} />
    </AuthShell>
  );
}
