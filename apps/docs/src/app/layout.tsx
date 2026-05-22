import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import { SiteFooter } from '@/components/SiteFooter';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'cursor.js',
  description: 'Browser automation and UI demos for cursor.js.',
};

import { RootProvider } from 'fumadocs-ui/provider/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        geistMono.variable,
        jetbrainsMono.variable,
        'font-sans',
        geist.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <RootProvider>
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
