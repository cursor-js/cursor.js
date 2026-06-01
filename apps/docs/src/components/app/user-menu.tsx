'use client';

import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session) {
    return null;
  }

  const label = session.user.name || session.user.email || 'Account';
  const initials = label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border bg-background text-sm font-semibold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Open user menu"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="size-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{initials || <User className="h-4 w-4" />}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3 p-3">
        <div className="border-b pb-3">
          <div className="truncate text-sm font-medium text-foreground">{label}</div>
          {session.user.email && (
            <div className="truncate text-xs text-muted-foreground">{session.user.email}</div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            Dashboard
          </Link>
          <Button
            variant="ghost"
            className="justify-start px-2"
            onClick={() => {
              void authClient.signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
