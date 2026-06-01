import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { licenses, ttsCache, ttsRequests } from '@/lib/db/schema';
import type {
  DashboardLicense,
  GeneratedVoice,
  PendingVoiceRequest,
} from '@/components/app/gemini-tts-dashboard';

async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
}

export async function getDashboardLicenses(): Promise<DashboardLicense[]> {
  const userId = await getSessionUserId();

  if (!userId) return [];

  const userLicenses = await db
    .select({
      id: licenses.id,
      key: licenses.key,
      status: licenses.status,
      plan: licenses.plan,
      lemonSqueezyCustomerId: licenses.lemonSqueezyCustomerId,
      lemonSqueezyOrderId: licenses.lemonSqueezyOrderId,
      lemonSqueezySubscriptionId: licenses.lemonSqueezySubscriptionId,
      lemonSqueezyVariantId: licenses.lemonSqueezyVariantId,
      customerEmail: licenses.customerEmail,
      createdAt: licenses.createdAt,
      updatedAt: licenses.updatedAt,
    })
    .from(licenses)
    .where(eq(licenses.userId, userId));

  return userLicenses.map((license) => ({
    ...license,
    createdAt: license.createdAt?.toISOString() ?? null,
    updatedAt: license.updatedAt?.toISOString() ?? null,
  }));
}

export async function getDashboardGeneratedVoices(): Promise<GeneratedVoice[]> {
  const userId = await getSessionUserId();

  if (!userId) return [];

  const voices = await db
    .select({
      id: ttsCache.hash,
      text: ttsCache.text,
      speaker: ttsCache.speaker,
      language: ttsCache.language,
      generatedAt: ttsCache.createdAt,
      audioUrl: ttsCache.audioUrl,
    })
    .from(ttsCache)
    .where(eq(ttsCache.userId, userId));

  return voices.map((voice) => ({
    ...voice,
    generatedAt: voice.generatedAt?.toISOString() ?? null,
  }));
}

export async function getDashboardPendingVoiceRequests(): Promise<PendingVoiceRequest[]> {
  const userId = await getSessionUserId();

  if (!userId) return [];

  const requests = await db
    .select({
      id: ttsRequests.id,
      text: ttsRequests.text,
      speaker: ttsRequests.speaker,
      language: ttsRequests.language,
      requestedAt: ttsRequests.requestedAt,
      status: ttsRequests.status,
    })
    .from(ttsRequests)
    .where(eq(ttsRequests.userId, userId))
    .orderBy(desc(ttsRequests.requestedAt));

  return requests.map((request) => ({
    ...request,
    requestedAt: request.requestedAt.toISOString(),
    status:
      request.status === 'generated' || request.status === 'deleted' ? request.status : 'pending',
  }));
}

export async function getDashboardInternalDemoAccess(): Promise<boolean> {
  const userId = await getSessionUserId();

  return Boolean(userId && userId === process.env.CURSORJS_INTERNAL_DEMO_USER_ID?.trim());
}
