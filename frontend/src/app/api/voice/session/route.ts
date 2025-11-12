import { NextResponse } from 'next/server';
import { getElevenLabsConfig } from '@/lib/server/env';
import { AGENT_TOOL_DEFINITIONS } from '@/lib/server/elevenLabs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { apiKey, agentId } = getElevenLabsConfig();
    const body = await request.json().catch(() => ({}));
    const { voice_id, language, response_format } = body ?? {};

    const response = await fetch('https://api.elevenlabs.io/v1/conversational-ai/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        agent_id: agentId,
        voice_id,
        language,
        response_format,
        tools: AGENT_TOOL_DEFINITIONS
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to start 11Labs session:', errorData);
      return NextResponse.json({ success: false, error: 'Failed to start voice session' }, { status: response.status });
    }

    const data = (await response.json()) as any;
    return NextResponse.json({ success: true, conversationId: data.conversation_id, raw: data });
  } catch (error) {
    console.error('11Labs session error:', error);
    return NextResponse.json({ success: false, error: 'Failed to start voice session' }, { status: 500 });
  }
}
