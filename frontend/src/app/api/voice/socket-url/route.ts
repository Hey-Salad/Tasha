import { NextResponse } from 'next/server';
import { getElevenLabsConfig } from '@/lib/server/env';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { apiKey, agentId: defaultAgentId } = getElevenLabsConfig();
    const body = await request.json().catch(() => ({}));
    const requestedAgentId = body?.agentId || defaultAgentId;

    if (!requestedAgentId) {
      return NextResponse.json({ success: false, error: 'agentId is required' }, { status: 400 });
    }

    const signedUrlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(requestedAgentId)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey
        }
      }
    );

    if (!signedUrlResponse.ok) {
      const errorText = await signedUrlResponse.text();
      return NextResponse.json(
        { success: false, error: errorText || 'Failed to obtain ElevenLabs signed URL' },
        { status: signedUrlResponse.status }
      );
    }

    const payload = (await signedUrlResponse.json()) as { signed_url?: string };
    if (!payload?.signed_url) {
      return NextResponse.json(
        { success: false, error: 'Signed URL not returned by ElevenLabs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, signedUrl: payload.signed_url });
  } catch (error) {
    console.error('ElevenLabs signed URL error:', error);
    return NextResponse.json({ success: false, error: 'Unable to generate ElevenLabs signed URL' }, { status: 500 });
  }
}
