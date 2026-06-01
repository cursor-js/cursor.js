import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ne, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { licenses } from '@/lib/db/schema';
import type { LicensePlan } from '@/lib/pro-purchase';

export const runtime = 'nodejs';

const handledEvents = new Set([
  'order_created',
  'order_refunded',
  'license_key_created',
  'license_key_updated',
  'subscription_created',
  'subscription_updated',
  'subscription_resumed',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused',
]);

const activeSubscriptionStatuses = new Set(['active', 'on_trial']);

interface LemonSqueezyWebhookPayload {
  meta?: {
    event_name?: unknown;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: unknown;
    type?: unknown;
    attributes?: Record<string, unknown>;
  };
}

function getString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function isLicensePlan(value: unknown): value is LicensePlan {
  return (
    value === 'pro_solo' ||
    value === 'pro_team' ||
    value === 'gemini_tts_solo' ||
    value === 'gemini_tts_team'
  );
}

function getWebhookSecret(): string | null {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() || null;
}

function hasValidSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expectedSignature = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex',
  );
  const receivedSignature = Buffer.from(signatureHeader, 'hex');

  return (
    expectedSignature.length === receivedSignature.length &&
    crypto.timingSafeEqual(expectedSignature, receivedSignature)
  );
}

function getLicenseStatus(eventName: string, attributes: Record<string, unknown>): string {
  if (eventName === 'order_refunded') return 'refunded';
  if (eventName === 'order_created' && getString(attributes.status) === 'paid') return 'active';
  if (eventName.startsWith('license_key_')) return 'active';
  if (eventName === 'subscription_cancelled') return 'cancelled';
  if (eventName === 'subscription_expired') return 'expired';
  if (eventName === 'subscription_paused') return 'paused';

  const status = getString(attributes.status);

  if (!status) return 'active';
  if (activeSubscriptionStatuses.has(status)) return 'active';

  return status;
}

function getLicenseId(
  eventName: string,
  dataId: string,
  attributes: Record<string, unknown>,
  plan: LicensePlan,
): string {
  const orderId = getString(attributes.order_id);

  if (plan.startsWith('gemini_tts_') && orderId) {
    return `lemonsqueezy:gemini-order:${orderId}`;
  }

  const subscriptionId = getString(attributes.subscription_id);

  if (subscriptionId) {
    return `lemonsqueezy:subscription:${subscriptionId}`;
  }

  if (eventName.startsWith('subscription_')) {
    return `lemonsqueezy:subscription:${dataId}`;
  }

  if (plan.startsWith('pro_') && (orderId || eventName.startsWith('order_'))) {
    return `lemonsqueezy:order:${orderId || dataId}`;
  }

  return `lemonsqueezy:license:${dataId}`;
}

function getVariantId(attributes: Record<string, unknown>): string | undefined {
  const firstOrderItem = attributes.first_order_item;

  if (firstOrderItem && typeof firstOrderItem === 'object') {
    return getString((firstOrderItem as Record<string, unknown>).variant_id);
  }

  return getString(attributes.variant_id);
}

function getLicenseKey(attributes: Record<string, unknown>): string {
  return (
    getString(attributes.key) ||
    getString(attributes.license_key) ||
    `cursorjs_${crypto.randomUUID().replaceAll('-', '')}`
  );
}

function getReceivedLicenseKey(attributes: Record<string, unknown>): string | undefined {
  return getString(attributes.key) || getString(attributes.license_key);
}

export async function POST(request: NextRequest) {
  const secret = getWebhookSecret();

  if (!secret) {
    return NextResponse.json(
      { error: 'LEMONSQUEEZY_WEBHOOK_SECRET is not configured' },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!rawBody || !signature || !hasValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid Lemon Squeezy signature' }, { status: 401 });
  }

  let payload: LemonSqueezyWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook JSON payload' }, { status: 400 });
  }
  const eventName = getString(payload.meta?.event_name) || request.headers.get('x-event-name');

  if (!eventName || !handledEvents.has(eventName)) {
    return NextResponse.json({ ok: true, ignored: eventName ?? 'unknown' });
  }

  const customData = payload.meta?.custom_data ?? {};
  const userId = getString(customData.user_id);
  const plan = customData.plan;
  const dataId = getString(payload.data?.id);
  const attributes = payload.data?.attributes ?? {};

  if (!userId || !isLicensePlan(plan) || !dataId) {
    return NextResponse.json(
      { error: 'Webhook is missing user_id, plan, or data id custom data' },
      { status: 400 },
    );
  }

  if (eventName.startsWith('order_') && plan.startsWith('gemini_tts_')) {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const licenseId = getLicenseId(eventName, dataId, attributes, plan);
  const now = new Date();
  const receivedLicenseKey = getReceivedLicenseKey(attributes);
  const orderId =
    getString(attributes.order_id) || (eventName.startsWith('order_') ? dataId : undefined);
  const subscriptionId =
    getString(attributes.subscription_id) ||
    (eventName.startsWith('subscription_') ? dataId : undefined);

  if (plan.startsWith('gemini_tts_') && (orderId || subscriptionId)) {
    const duplicateExternalIdCondition =
      orderId && subscriptionId
        ? or(
            eq(licenses.lemonSqueezyOrderId, orderId),
            eq(licenses.lemonSqueezySubscriptionId, subscriptionId),
          )
        : orderId
          ? eq(licenses.lemonSqueezyOrderId, orderId)
          : eq(licenses.lemonSqueezySubscriptionId, subscriptionId!);

    await db
      .delete(licenses)
      .where(
        and(
          eq(licenses.userId, userId),
          eq(licenses.plan, plan),
          ne(licenses.id, licenseId),
          duplicateExternalIdCondition,
        ),
      );
  }

  await db
    .insert(licenses)
    .values({
      id: licenseId,
      key: receivedLicenseKey || getLicenseKey(attributes),
      userId,
      plan,
      status: getLicenseStatus(eventName, attributes),
      lemonSqueezyCustomerId: getString(attributes.customer_id),
      lemonSqueezyOrderId: orderId,
      lemonSqueezySubscriptionId: subscriptionId,
      lemonSqueezyVariantId: getVariantId(attributes),
      customerEmail: getString(attributes.user_email) || getString(attributes.customer_email),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: licenses.id,
      set: {
        ...(receivedLicenseKey ? { key: receivedLicenseKey } : {}),
        userId,
        plan,
        status: getLicenseStatus(eventName, attributes),
        lemonSqueezyCustomerId: getString(attributes.customer_id),
        lemonSqueezyOrderId: orderId,
        lemonSqueezySubscriptionId: subscriptionId,
        lemonSqueezyVariantId: getVariantId(attributes),
        customerEmail: getString(attributes.user_email) || getString(attributes.customer_email),
        updatedAt: now,
      },
    });

  return NextResponse.json({ ok: true });
}
