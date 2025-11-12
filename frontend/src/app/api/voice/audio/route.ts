import { NextResponse } from 'next/server';
import { getElevenLabsConfig } from '@/lib/server/env';
import { buildVoiceAnalysis, executeRequiredTools } from '@/lib/server/elevenLabs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { apiKey } = getElevenLabsConfig();
    const body = await request.json().catch(() => ({}));
    const { conversationId, audioBase64, mimeType, userMessage } = body ?? {};

    if (!conversationId || !audioBase64) {
      return NextResponse.json(
        { success: false, error: 'conversationId and audioBase64 are required' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType ?? 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-input.webm');
    if (userMessage) {
      formData.append('text', userMessage);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/conversational-ai/conversations/${conversationId}/audio`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11Labs audio processing failed:', errorData);
      return NextResponse.json({ success: false, error: 'Failed to process voice input' }, { status: response.status });
    }

    const data = (await response.json()) as any;
    const { toolOutputs, conversationState } = await executeRequiredTools(data, conversationId, apiKey);

    const transcript = data.data?.transcript || userMessage || '';
    const agentResponse =
      data.data?.agent_response || data.data?.response || conversationState?.last_response || '';
    const audioUrl = data.data?.audio_url || data.data?.audioUrl;
    const analysis = buildVoiceAnalysis(`${transcript} ${agentResponse}`.trim());

    return NextResponse.json({
      success: true,
      data: {
        transcript,
        agentResponse,
        audioUrl,
        analysis,
        toolCalls: toolOutputs,
        raw: data
      }
    });
  } catch (error) {
    console.error('11Labs audio error:', error);
    return NextResponse.json({ success: false, error: 'Voice processing failed' }, { status: 500 });
  }
}
