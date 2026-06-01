import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/lemonsqueezy';
import { getSessionUserId, hasExistingBaseProLicense, type ProPlan } from '@/lib/pro-license';

interface RouteContext {
  params: Promise<{
    plan: string;
  }>;
}

function isProPlan(value: string): value is ProPlan {
  return value === 'solo' || value === 'team';
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToPricing(request: NextRequest, reason: string): NextResponse {
  const url = new URL('/pro', request.url);
  url.searchParams.set('checkout', 'pro');
  url.searchParams.set('reason', reason);
  url.hash = 'pricing';
  return NextResponse.redirect(url);
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

  if (await hasExistingBaseProLicense(request)) {
    return redirectToPricing(request, 'base-license-already-owned');
  }

  const licensePlan = plan === 'team' ? 'pro_team' : 'pro_solo';
  const customData = {
    user_id: userId,
    plan: licensePlan,
    source: 'cursorjs_docs',
  };
  const checkoutUrl = await createCheckoutUrl({
    customData,
    plan: licensePlan,
  });

  return NextResponse.redirect(checkoutUrl);
}
