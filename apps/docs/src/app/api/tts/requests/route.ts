import { put } from '@vercel/blob';
import { and, eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { licenses, ttsCache, ttsRequests } from '@/lib/db/schema';
import { generateGeminiTTS } from '@/lib/gemini';

interface UpdateRequestsBody {
  action?: unknown;
  ids?: unknown;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string')
  );
}

function canManageVoices(plans: string[]): boolean {
  const hasProSolo = plans.includes('pro_solo');
  const hasProTeam = plans.includes('pro_team');
  const hasGeminiSolo = plans.includes('gemini_tts_solo');
  const hasGeminiTeam = plans.includes('gemini_tts_team');

  return (hasGeminiTeam && hasProTeam) || (hasGeminiSolo && (hasProSolo || hasProTeam));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function getGenerationErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (
    message.includes('Lightning dunning decision is deny') ||
    message.includes('PERMISSION_DENIED')
  ) {
    return 'Gemini TTS generation was denied by Google for the configured project. Check billing, API access, and the GEMINI_API_KEY project settings.';
  }

  return `Gemini TTS generation failed: ${message}`;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const body = (await req.json()) as UpdateRequestsBody;

  if ((body.action !== 'approve' && body.action !== 'delete') || !isStringArray(body.ids)) {
    return NextResponse.json({ error: 'action and ids are required' }, { status: 400 });
  }

  const activeLicenses = await db
    .select({ plan: licenses.plan })
    .from(licenses)
    .where(and(eq(licenses.userId, session.user.id), eq(licenses.status, 'active')));

  const isInternalDemoOwner =
    session.user.id === process.env.CURSORJS_INTERNAL_DEMO_USER_ID?.trim();

  if (!isInternalDemoOwner && !canManageVoices(activeLicenses.map((license) => license.plan))) {
    return NextResponse.json(
      { error: 'An active Cursor.js Pro and Gemini TTS subscription are required' },
      { status: 403 },
    );
  }

  const requests = await db
    .select()
    .from(ttsRequests)
    .where(
      and(
        eq(ttsRequests.userId, session.user.id),
        eq(ttsRequests.status, 'pending'),
        inArray(ttsRequests.id, body.ids),
      ),
    );

  if (body.action === 'delete') {
    if (requests.length > 0) {
      await db
        .update(ttsRequests)
        .set({ status: 'deleted', updatedAt: new Date() })
        .where(
          inArray(
            ttsRequests.id,
            requests.map((request) => request.id),
          ),
        );
    }

    return NextResponse.json({ updated: requests.length });
  }

  for (const request of requests) {
    try {
      const audioPath = `tts/${request.id}.wav`;
      const audioUrl = `https://cdn.cursorjs.com/voices/${request.id}.wav`;
      const audioBuffer = await generateGeminiTTS(
        request.text,
        request.speaker,
        request.prompt,
        request.model,
      );

      await put(audioPath, audioBuffer, {
        access: 'public',
        contentType: 'audio/wav',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      await db
        .insert(ttsCache)
        .values({
          hash: request.id,
          prompt: request.prompt,
          text: request.text,
          speaker: request.speaker,
          style: request.style,
          model: request.model,
          language: request.language,
          audioUrl,
          userId: request.userId,
          licenseId: request.licenseId,
        })
        .onConflictDoUpdate({
          target: ttsCache.hash,
          set: {
            audioUrl,
            userId: request.userId,
            licenseId: request.licenseId,
          },
        });

      await db
        .update(ttsRequests)
        .set({ status: 'generated', updatedAt: new Date() })
        .where(eq(ttsRequests.id, request.id));
    } catch (error) {
      const message = getGenerationErrorMessage(error);
      console.error('[Gemini TTS] Approval generation failed:', error);

      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ updated: requests.length });
}
