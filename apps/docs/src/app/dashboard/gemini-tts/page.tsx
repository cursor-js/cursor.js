import type { Metadata } from 'next';
import { GeminiTTSDashboard } from '@/components/app/gemini-tts-dashboard';
import {
  getDashboardGeneratedVoices,
  getDashboardInternalDemoAccess,
  getDashboardLicenses,
  getDashboardPendingVoiceRequests,
} from '@/lib/dashboard-licenses';

export const metadata: Metadata = {
  title: 'Gemini TTS Dashboard',
  description: 'Review and approve Gemini TTS voice generation requests.',
};

interface GeminiTTSDashboardPageProps {
  searchParams?: Promise<{
    checkout?: string;
  }>;
}

export default async function GeminiTTSDashboardPage({
  searchParams,
}: GeminiTTSDashboardPageProps) {
  const params = await searchParams;

  return (
    <GeminiTTSDashboard
      checkoutSucceeded={params?.checkout === 'success'}
      generatedVoices={await getDashboardGeneratedVoices()}
      internalDemoAccess={await getDashboardInternalDemoAccess()}
      licenses={await getDashboardLicenses()}
      pendingVoiceRequests={await getDashboardPendingVoiceRequests()}
      view="voices"
    />
  );
}
