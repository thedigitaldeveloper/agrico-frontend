import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/auth-forms';
import { AuthShell } from '@/components/rs/auth-shell';
import { one, type SearchParams } from '@/components/ui/pagination';
import { getCurrentUser } from '@/lib/auth/session';
import { buildMetadata } from '@/lib/metadata';
export const metadata = {
  ...buildMetadata({
    title: 'Student login',
    description: 'Sign in to your Agrico student account.',
    path: '/login',
  }),
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (await getCurrentUser()) redirect('/dashboard');
  const params = await searchParams;
  return (
    <AuthShell>
      <LoginForm next={one(params.next)} />
    </AuthShell>
  );
}
