export const lemonJsScriptSrc = 'https://assets.lemonsqueezy.com/lemon.js';

export const lemonSqueezyButtonClassName = 'lemonsqueezy-button';

const defaultProPurchaseLinks = {
  solo: 'https://cursorjs-pro.lemonsqueezy.com/checkout/buy/a7c6580c-aa89-4e48-b754-66456e6f2624?embed=1',
  team: 'https://cursorjs-pro.lemonsqueezy.com/checkout/buy/179a2386-b2f1-4fb0-8ccd-cb22c255c3d0?embed=1',
} as const;

function withCheckoutOverlay(url: string): string {
  try {
    const normalizedUrl = new URL(url);
    normalizedUrl.searchParams.set('embed', '1');
    return normalizedUrl.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}embed=1`;
  }
}

export const proPurchaseLinks = {
  solo: withCheckoutOverlay(
    process.env.NEXT_PUBLIC_CURSOR_PRO_SOLO_URL?.trim() || defaultProPurchaseLinks.solo,
  ),
  team: withCheckoutOverlay(
    process.env.NEXT_PUBLIC_CURSOR_PRO_TEAM_URL?.trim() || defaultProPurchaseLinks.team,
  ),
} as const;

export function getProPurchaseHref(plan: keyof typeof proPurchaseLinks): string {
  return proPurchaseLinks[plan] ?? '/pro#pricing';
}

export const proRegistrationChecklist = [
  'Secure checkout for Solo or Team.',
  'Instant email receipt with your order reference.',
  'License key delivery for premium features like Gemini TTS credits.',
  'A lightweight onboarding path so you can start shipping immediately.',
] as const;
