export const proPurchaseLinks = {
  solo: '/api/checkout/pro/solo',
  team: '/api/checkout/pro/team',
  geminiTtsSolo: '/api/checkout/gemini-tts/solo',
  geminiTtsTeam: '/api/checkout/gemini-tts/team',
} as const;

export type LicensePlan = 'pro_solo' | 'pro_team' | 'gemini_tts_solo' | 'gemini_tts_team';

export function getProPurchaseHref(plan: keyof typeof proPurchaseLinks): string {
  return proPurchaseLinks[plan] ?? '/pro#pricing';
}

export const proRegistrationChecklist = [
  'Secure checkout for Solo or Team.',
  'Instant email receipt with your order reference.',
  'License key delivery for premium features like Gemini TTS.',
  'A lightweight onboarding path so you can start shipping immediately.',
] as const;
