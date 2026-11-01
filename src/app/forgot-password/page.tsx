import { ForgotPasswordForm } from '@/components/auth/recovery-forms';
import { AuthShell } from '@/components/rs/auth-shell';
import { buildMetadata } from '@/lib/metadata';

export const metadata = {
  ...buildMetadata({ title: 'Reset your password', description: 'Request a password reset link for your student account.', path: '/forgot-password' }),
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <AuthShell label="Agrico · Account recovery" heading="Let’s get you back in."
    description="Enter the email address you used to create your student account.">
    <ForgotPasswordForm />
  </AuthShell>;
}
