import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { ttsCache, licenses } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateGeminiTTS } from '@/lib/gemini';

function generateHash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

export async function POST(req: Request) {
  try {
    // 1. İstek gövdesinden (body) bilgileri al
    const body = await req.json();
    const { text, speaker, style, language, model, licenseKey } = body;

    if (!text || !speaker || !style || !language || !model) {
      return NextResponse.json(
        { error: 'text, speaker, style, language and model are required properties' },
        { status: 400 },
      );
    }

    // 2. Lisans Kontrolü (1. Yöntem: Lisans Anahtarı Modeli)
    let isAuthorized = false;

    // Geliştirme ortamı veya kendi sitenizden (ör: cursor.js dokümantasyon sayfası) gelen istekler serbest olabilir.
    // Şimdilik sadece dışarıdan gelen lisans testlerini yönetiyoruz.
    if (licenseKey) {
      const [license] = await db
        .select()
        .from(licenses)
        .where(eq(licenses.key, licenseKey))
        .limit(1);

      if (!license) {
        return NextResponse.json({ error: 'Geçersiz lisans anahtarı' }, { status: 401 });
      }

      if (license.status !== 'active') {
        return NextResponse.json({ error: 'Lisansınız aktif değil' }, { status: 403 });
      }

      if (license.credits <= 0) {
        return NextResponse.json({ error: 'TTS kredi limitiniz doldu' }, { status: 402 });
      }

      isAuthorized = true;
    }
    // Eğer bir master key'iniz varsa veya host origin'den istek geliyorsa izin verebilirsiniz
    // else if (req.headers.get('origin') === 'https://siteniz.com') { isAuthorized = true; }
    else {
      // Şimdilik test amaçlı lisanssız kısıtlamayalım ancak prod öncesi isAuthorized = false yapmalısınız.
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Lisans Anahtarı Gerekli' }, { status: 401 });
    }

    // 3. Ön Bellek (Cache) Kontrolü
    const prompt = style || `Lütfen aşağıdaki metni seslendir:\n${text}`;
    const hashData = `${text}-${speaker}-${language}-${style}-${model}`;
    const hash = generateHash(hashData);

    const [cachedEntry] = await db.select().from(ttsCache).where(eq(ttsCache.hash, hash)).limit(1);

    if (cachedEntry) {
      // Sesi bulduk! Maliyet 0, hız maksimum.
      return NextResponse.json({
        url: cachedEntry.audioUrl,
        cached: true,
      });
    }

    // 4. Cache'de yoksa Gemini TTS ile üret
    console.log(`[TTS] Üretiliyor: ${text.substring(0, 30)}... (Model: ${model}, Style: ${style})`);
    const audioBuffer = await generateGeminiTTS(text, speaker, style, model);

    // 5. Üretilen sesi Vercel Storage (Blob) üzerine yükle
    const blob = await put(`tts/${hash}.wav`, audioBuffer, {
      access: 'public',
      contentType: 'audio/mpeg',
    });

    // 6. SQL Veritabanına kaydet
    await db.insert(ttsCache).values({
      hash,
      prompt,
      text,
      speaker,
      style,
      model,
      language,
      audioUrl: blob.url,
    });

    // 7. Eğer müşteri istek atmışsa Bakiyeden (Credit) düş
    if (licenseKey) {
      await db
        .update(licenses)
        .set({ credits: sql`${licenses.credits} - 1` })
        .where(eq(licenses.key, licenseKey));
    }

    return NextResponse.json({
      url: blob.url,
      cached: false,
    });
  } catch (error: any) {
    console.error('API /tts error full:', JSON.stringify(error, null, 2));
    console.error('API /tts error message:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
