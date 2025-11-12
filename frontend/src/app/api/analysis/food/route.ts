import { NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/server/aiImageAnalysis';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaBase64, mediaType } = body ?? {};

    if (!mediaBase64 || !mediaType) {
      return NextResponse.json(
        { success: false, error: 'mediaBase64 and mediaType are required' },
        { status: 400 }
      );
    }

    // Use the fallback chain: Claude → OpenAI → Gemini
    const result = await analyzeFoodImage(mediaBase64, mediaType);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'AI analysis failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      provider: result.provider // Let frontend know which provider was used
    });
  } catch (error: any) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
