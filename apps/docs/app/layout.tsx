import { NextProvider } from 'fumadocs-core/framework/next';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <NextProvider>{children}</NextProvider>
      </body>
    </html>
  );
}
