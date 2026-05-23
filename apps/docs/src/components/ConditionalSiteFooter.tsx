'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from '@/components/SiteFooter';

export function ConditionalSiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith('/demos')) {
    return null;
  }

  return <SiteFooter />;
}
