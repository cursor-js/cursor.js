import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/app/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in with Google before checkout.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
