import { AuthPage } from '@/components/auth/auth-page';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign In | AI Chat',
  description: 'Sign in to your AI Chat account',
};

export default function LoginPage() {
  return (
    <AuthPage
      title="Welcome back"
      description="Sign in to continue to your conversations"
    >
      <LoginForm />
    </AuthPage>
  );
}
