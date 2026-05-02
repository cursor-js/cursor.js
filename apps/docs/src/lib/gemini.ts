import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function pcmToWav(
  pcmData: Buffer,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number,
): Buffer {
  const wavHeader = Buffer.alloc(44);
  const chunkSize = pcmData.length;
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + chunkSize, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  wavHeader.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(chunkSize, 40);
  return Buffer.concat([wavHeader, pcmData]);
}

export async function generateGeminiTTS(
  text: string,
  speaker: string,
  style: string,
  model: string,
): Promise<Buffer> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  // Handle default string mapping from plugin or other fallbacks
  let voiceName = speaker;
  if (!voiceName || voiceName === 'gemini-flash') {
    voiceName = 'Aoede';
  }

  // Set up generate content request
  const requestPayload: any = {
    model: model,
    contents: text,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  };

  if (style) {
    requestPayload.systemInstruction = style;
  }

  try {
    const response = await ai.models.generateContent(requestPayload);

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (response.candidates?.[0]?.finishReason === 'OTHER' || !part?.inlineData) {
      throw new Error(`Gemini rejected the text. finishReason OTHER`);
    }

    const mimeType = part.inlineData.mimeType || ''; // audio/L16;codec=pcm;rate=24000
    const audioData = part.inlineData.data;
    if (!audioData) {
      throw new Error('Failed to extract audio data from Gemini response');
    }

    const pcmBuffer = Buffer.from(audioData, 'base64');

    // Parse sample rate if possible, default to 24000
    let sampleRate = 24000;
    if (mimeType.includes('rate=')) {
      sampleRate = parseInt(mimeType.split('rate=')[1], 10) || 24000;
    }

    // Convert raw L16 PCM to standard WAV format
    return pcmToWav(pcmBuffer, sampleRate, 1, 16);
  } catch (error) {
    console.error('Error generating TTS with Gemini:', error);
    throw error;
  }
}
