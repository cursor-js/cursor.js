'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const dashboardLinks = [
  {
    href: '/dashboard',
    label: 'Overview',
  },
  {
    href: '/dashboard/gemini-tts',
    label: 'Gemini TTS Voices',
  },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Dashboard">
      {dashboardLinks.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground'
                : 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
