import type { Metadata } from 'next';
import { GeminiTTSDashboard } from '@/components/app/gemini-tts-dashboard';
import { getDashboardGeneratedVoices, getDashboardLicenses } from '@/lib/dashboard-licenses';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage Cursor.js Pro products and Gemini TTS licensing.',
};

interface DashboardPageProps {
  searchParams?: Promise<{
    checkout?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  return (
    <GeminiTTSDashboard
      checkoutSucceeded={params?.checkout === 'success'}
      generatedVoices={await getDashboardGeneratedVoices()}
      licenses={await getDashboardLicenses()}
      view="overview"
    />
  );
}
