'use client';

import { useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

function getSafeNextUrl(value: string | null): string {
  if (!value) {
    return '/pro#pricing';
  }

  if (value.startsWith('/')) {
    return value;
  }

  return '/pro#pricing';
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = getSafeNextUrl(searchParams.get('next'));

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full border bg-muted p-3">
        <LogIn className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Sign in to continue</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Sign in with Google before checkout. After sign-in, you will continue to the selected
        purchase.
      </p>
      <Button
        className="mt-6"
        onClick={() => {
          void authClient.signIn.social({
            provider: 'google',
            callbackURL: nextUrl,
          });
        }}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
