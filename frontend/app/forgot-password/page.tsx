import { AuthPage } from '@/components/auth/auth-page';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Reset Password | AI Chat',
  description: 'Reset your AI Chat account password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPage title="Reset password">
      <ForgotPasswordForm />
    </AuthPage>
  );
}
