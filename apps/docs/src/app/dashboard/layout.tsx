import { DashboardNav } from '@/components/app/dashboard-nav';
import { UserMenu } from '@/components/app/user-menu';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardNav />
        <UserMenu />
      </div>
      {children}
    </div>
  );
}
