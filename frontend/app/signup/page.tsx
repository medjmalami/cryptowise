import { AuthPage } from '@/components/auth/auth-page';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Create Account | AI Chat',
  description: 'Create a new AI Chat account',
};

export default function SignupPage() {
  return (
    <AuthPage
      title="Get started"
      description="Create an account to start chatting with AI"
    >
      <SignupForm />
    </AuthPage>
  );
}
