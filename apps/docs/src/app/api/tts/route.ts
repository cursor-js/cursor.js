import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { ttsCache, ttsRequests, licenses } from '@/lib/db/schema';
import { and, eq, inArray, lt } from 'drizzle-orm';

interface TTSRequestBody {
  prompt?: unknown;
  text?: unknown;
  speaker?: unknown;
  style?: unknown;
  language?: unknown;
  model?: unknown;
  licenseKey?: unknown;
}

interface TTSHashPayload {
  prompt: string;
  text: string;
  speaker: string;
  language: string;
  style: string;
  model: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const PENDING_REQUEST_TTL_DAYS = 7;

function generateHash(payload: TTSHashPayload): string {
  return crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function getRequiredBasePlans(plan: string): string[] | null {
  if (plan === 'gemini_tts_team') {
    return ['pro_team'];
  }

  if (plan === 'gemini_tts_solo') {
    return ['pro_solo', 'pro_team'];
  }

  return null;
}

function withCors(response: NextResponse): NextResponse {
  for (const [header, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  try {
    const stalePendingCutoff = new Date(
      Date.now() - PENDING_REQUEST_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await db
      .update(ttsRequests)
      .set({ status: 'deleted', updatedAt: new Date() })
      .where(and(eq(ttsRequests.status, 'pending'), lt(ttsRequests.requestedAt, stalePendingCutoff)));

    const body = (await req.json()) as TTSRequestBody;
    const { text, speaker, style, language, model, licenseKey } = body;

    if (
      !isNonEmptyString(text) ||
      !isNonEmptyString(speaker) ||
      !isNonEmptyString(style) ||
      !isNonEmptyString(language) ||
      !isNonEmptyString(model)
    ) {
      return withCors(
        NextResponse.json(
          { error: 'text, speaker, style, language and model are required properties' },
          { status: 400 },
        ),
      );
    }

    const licenseKeyValue = isNonEmptyString(licenseKey) ? licenseKey : undefined;

    if (!licenseKeyValue) {
      return withCors(NextResponse.json({ error: 'License key is required' }, { status: 401 }));
    }

    const internalDemoLicenseKey =
      process.env.NEXT_PUBLIC_CURSORJS_INTERNAL_DEMO_LICENSE_KEY?.trim();
    const internalDemoUserId = process.env.CURSORJS_INTERNAL_DEMO_USER_ID?.trim();
    const isInternalDemoRequest =
      Boolean(internalDemoLicenseKey) &&
      Boolean(internalDemoUserId) &&
      licenseKeyValue === internalDemoLicenseKey;
    let requestUserId = internalDemoUserId;
    let requestLicenseId = 'internal-demo';

    if (!isInternalDemoRequest) {
      const [license] = await db
        .select()
        .from(licenses)
        .where(eq(licenses.key, licenseKeyValue))
        .limit(1);

      if (!license) {
        return withCors(NextResponse.json({ error: 'Invalid license key' }, { status: 401 }));
      }

      if (license.status !== 'active') {
        return withCors(
          NextResponse.json({ error: 'Your license is not active' }, { status: 403 }),
        );
      }

      const requiredBasePlans = getRequiredBasePlans(license.plan);

      if (!requiredBasePlans) {
        return withCors(
          NextResponse.json({ error: 'A Gemini TTS add-on license is required' }, { status: 403 }),
        );
      }

      if (!license.userId) {
        return withCors(
          NextResponse.json(
            { error: 'This Gemini TTS license is not assigned to a user' },
            { status: 403 },
          ),
        );
      }

      const [baseLicense] = await db
        .select({ id: licenses.id })
        .from(licenses)
        .where(
          and(
            eq(licenses.userId, license.userId),
            eq(licenses.status, 'active'),
            inArray(licenses.plan, requiredBasePlans),
          ),
        )
        .limit(1);

      if (!baseLicense) {
        return withCors(
          NextResponse.json(
            { error: 'Gemini TTS requires an active Cursor.js Pro license' },
            { status: 403 },
          ),
        );
      }

      requestUserId = license.userId;
      requestLicenseId = license.id;
    }

    if (!requestUserId) {
      return withCors(
        NextResponse.json({ error: 'Internal demo owner is not configured' }, { status: 500 }),
      );
    }

    const prompt = isNonEmptyString(body.prompt) ? body.prompt : style;
    const hashPayload: TTSHashPayload = {
      prompt,
      text,
      speaker,
      language,
      style,
      model,
    };
    const hash = generateHash(hashPayload);

    const [cachedEntry] = await db.select().from(ttsCache).where(eq(ttsCache.hash, hash)).limit(1);

    if (cachedEntry) {
      return withCors(
        NextResponse.json({
          url: cachedEntry.audioUrl,
          hash,
          cached: true,
        }),
      );
    }

    const requestValues = {
      id: hash,
      prompt,
      text,
      speaker,
      style,
      model,
      language,
      userId: requestUserId,
      licenseId: requestLicenseId,
      status: 'pending',
      requestedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(ttsRequests).values(requestValues).onConflictDoUpdate({
      target: ttsRequests.id,
      set: requestValues,
    });

    return withCors(NextResponse.json({ hash, status: 'pending' }, { status: 202 }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API /tts error:', error);
    return withCors(
      NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 }),
    );
  }
}
