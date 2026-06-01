import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import {
  getRequiredPlanLabel,
  getSessionUserId,
  hasActiveBaseProLicense,
  hasExistingGeminiTtsLicense,
  type ProPlan,
} from '@/lib/pro-license';

interface RouteContext {
  params: Promise<{
    plan: string;
  }>;
}

function isProPlan(value: string): value is ProPlan {
  return value === 'solo' || value === 'team';
}

function redirectToPricing(request: NextRequest, reason: string): NextResponse {
  const url = new URL('/pro', request.url);
  url.searchParams.set('checkout', 'gemini-tts');
  url.searchParams.set('reason', reason);
  url.hash = 'pricing';
  return NextResponse.redirect(url);
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { plan } = await context.params;

  if (!isProPlan(plan)) {
    return redirectToPricing(request, 'invalid-plan');
  }

  const userId = await getSessionUserId(request);

  if (!userId) {
    return redirectToLogin(request);
  }

  if (!(await hasActiveBaseProLicense(request, plan))) {
    const requiredPlan = getRequiredPlanLabel(plan);
    return redirectToPricing(request, `${requiredPlan.toLowerCase().replace(' ', '-')}-required`);
  }

  if (await hasExistingGeminiTtsLicense(request)) {
    return redirectToPricing(request, 'gemini-tts-license-already-owned');
  }

  const licensePlan = plan === 'team' ? 'gemini_tts_team' : 'gemini_tts_solo';
  const customData = {
    user_id: userId,
    plan: licensePlan,
    source: 'cursorjs_docs',
  };
  const checkoutUrl = await createCheckoutUrl({
    customData,
    plan: licensePlan,
    redirectUrl: new URL('/dashboard?checkout=success', request.nextUrl.origin).toString(),
  });

  return NextResponse.redirect(checkoutUrl);
}
