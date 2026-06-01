'use client';

import type { ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

interface ProPurchaseButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function ProPurchaseButton({ href, children, variant = 'primary' }: ProPurchaseButtonProps) {
  const { data: session, isPending } = authClient.useSession();

  const baseClassName =
    'inline-flex h-9 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
  const variantClassName =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';

  if (!session) {
    return (
      <button
        type="button"
        className={`${baseClassName} ${variantClassName}`}
        aria-label={`${children}. Sign in with Google before checkout.`}
        disabled={isPending}
        onClick={() => {
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set('next', href);
          window.location.href = loginUrl.toString();
        }}
      >
        {isPending ? 'Checking session...' : children}
      </button>
    );
  }

  return (
    <a href={href} className={`${baseClassName} ${variantClassName}`}>
      {children}
    </a>
  );
}
