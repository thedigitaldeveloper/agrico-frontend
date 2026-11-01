import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/recovery-forms';
import { AuthShell } from '@/components/rs/auth-shell';
import { one, type SearchParams } from '@/components/ui/pagination';
import { resetPassword } from '@/lib/auth/recovery-actions';
import { isPasswordResetCode } from '@/lib/auth/recovery';
import { buildMetadata } from '@/lib/metadata';

export const metadata = {
  ...buildMetadata({ title: 'Choose a new password', description: 'Update your Agrico student account password.', path: '/reset-password' }),
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const code = one(params.code);
  return <AuthShell label="Agrico · Account recovery" heading="Choose a new password."
    description="Set a password you can use the next time you sign in.">
    {isPasswordResetCode(code) ? <ResetPasswordForm action={resetPassword.bind(null, code)} />
      : <div className="rs-auth-form"><p className="rs-form-error" role="alert">This reset link is missing or invalid. Request a new link to continue.</p>
        <Link href="/forgot-password" className="rs-button">Request a reset link</Link></div>}
  </AuthShell>;
}
