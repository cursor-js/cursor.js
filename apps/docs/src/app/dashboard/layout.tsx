import { DashboardNav } from '@/components/app/dashboard-nav';
import { baseOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="border-b pb-4">
            <DashboardNav />
          </div>
          {children}
        </div>
      </main>
    </HomeLayout>
  );
}
