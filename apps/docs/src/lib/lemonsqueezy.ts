import type { LicensePlan } from '@/lib/pro-purchase';

interface CreateCheckoutInput {
  customData: Record<string, string>;
  plan: LicensePlan;
  redirectUrl?: string;
}

interface LemonSqueezyCheckoutResponse {
  data?: {
    attributes?: {
      url?: unknown;
    };
  };
}

const variantEnvByPlan = {
  pro_solo: 'LEMONSQUEEZY_PRO_SOLO_VARIANT_ID',
  pro_team: 'LEMONSQUEEZY_PRO_TEAM_VARIANT_ID',
  gemini_tts_solo: 'LEMONSQUEEZY_GEMINI_TTS_SOLO_VARIANT_ID',
  gemini_tts_team: 'LEMONSQUEEZY_GEMINI_TTS_TEAM_VARIANT_ID',
} as const satisfies Record<LicensePlan, string>;

function getLemonSqueezyConfig(plan: LicensePlan) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  const variantId = process.env[variantEnvByPlan[plan]]?.trim();

  if (!apiKey || !storeId || !variantId) {
    throw new Error(`Lemon Squeezy checkout is not configured for ${plan}`);
  }

  return {
    apiKey,
    storeId,
    variantId,
  };
}

export async function createCheckoutUrl({
  customData,
  plan,
  redirectUrl,
}: CreateCheckoutInput): Promise<string> {
  const config = getLemonSqueezyConfig(plan);

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: customData,
          },
          ...(redirectUrl
            ? {
                product_options: {
                  redirect_url: redirectUrl,
                },
              }
            : {}),
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: config.storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: config.variantId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();

    throw new Error(
      `Failed to create Lemon Squeezy checkout for ${plan}: ${response.status} ${response.statusText}. ${responseBody}`,
    );
  }

  const payload = (await response.json()) as LemonSqueezyCheckoutResponse;
  const checkoutUrl = payload.data?.attributes?.url;

  if (typeof checkoutUrl !== 'string' || checkoutUrl.length === 0) {
    throw new Error(`Lemon Squeezy checkout response is missing a URL for ${plan}`);
  }

  return checkoutUrl;
}
