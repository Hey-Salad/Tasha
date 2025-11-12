import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { wasteType, amount, description, date } = body ?? {};

    if (!wasteType || typeof amount !== 'number' || !description || !date) {
      return NextResponse.json({ success: false, error: 'Missing waste log fields' }, { status: 400 });
    }

    const normalizedAmount = Math.max(0, Math.min(amount, 1000));
    const baseConfidence = 0.5 + Math.min(normalizedAmount / 1000, 0.4);
    const reasoning = `Description mentions ${description.split(' ').slice(0, 5).join(' ')}... Logged ${amount} units on ${date}.`;

    return NextResponse.json({
      success: true,
      confidence: Number(baseConfidence.toFixed(2)),
      reasoning,
      flags: []
    });
  } catch (error) {
    console.error('AI waste verification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify waste entry' }, { status: 500 });
  }
}
