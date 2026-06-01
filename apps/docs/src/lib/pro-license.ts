import type { NextRequest } from 'next/server';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { licenses } from '@/lib/db/schema';

export type ProPlan = 'solo' | 'team';

const baseProPlans = {
  solo: ['pro_solo', 'pro_team'],
  team: ['pro_team'],
} as const;

export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user.id ?? null;
}

export async function hasActiveBaseProLicense(
  request: NextRequest,
  requiredPlan: ProPlan,
): Promise<boolean> {
  const userId = await getSessionUserId(request);

  if (!userId) return false;

  const [license] = await db
    .select({ id: licenses.id })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId, userId),
        eq(licenses.status, 'active'),
        inArray(licenses.plan, [...baseProPlans[requiredPlan]]),
      ),
    )
    .limit(1);

  return Boolean(license);
}

export async function hasExistingBaseProLicense(request: NextRequest): Promise<boolean> {
  return hasExistingLicenseForPlans(request, ['pro_solo', 'pro_team']);
}

export async function hasExistingGeminiTtsLicense(request: NextRequest): Promise<boolean> {
  return hasExistingLicenseForPlans(request, ['gemini_tts_solo', 'gemini_tts_team']);
}

async function hasExistingLicenseForPlans(
  request: NextRequest,
  plans: string[],
): Promise<boolean> {
  const userId = await getSessionUserId(request);

  if (!userId) return false;

  const [license] = await db
    .select({ id: licenses.id })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId, userId),
        ne(licenses.status, 'refunded'),
        inArray(licenses.plan, plans),
      ),
    )
    .limit(1);

  return Boolean(license);
}

export function getRequiredPlanLabel(requiredPlan: ProPlan): string {
  return requiredPlan === 'team' ? 'Pro Team' : 'Pro Solo';
}
