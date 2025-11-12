import { NextResponse } from 'next/server';
import { getElevenLabsConfig } from '@/lib/server/env';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { apiKey, defaultVoiceId } = getElevenLabsConfig();
    const body = await request.json().catch(() => ({}));
    const { text, voiceId, config } = body ?? {};

    if (!text) {
      return NextResponse.json({ success: false, error: 'text is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || defaultVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: config?.stability ?? 0.75,
            similarity_boost: config?.similarity_boost ?? 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11Labs TTS failed:', errorData);
      return NextResponse.json({ success: false, error: 'Failed to generate speech' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    return NextResponse.json({ success: true, audioBase64 });
  } catch (error) {
    console.error('11Labs TTS error:', error);
    return NextResponse.json({ success: false, error: 'Text-to-speech failed' }, { status: 500 });
  }
}
