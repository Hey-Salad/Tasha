import { NextResponse } from 'next/server';
import { MonzoTransaction, scoreWasteMatches, isFoodRelated } from '@/lib/server/monzo';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, accountId, wasteReductionDate, wasteDescription } = body ?? {};

    if (!accessToken || !accountId || !wasteReductionDate || !wasteDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access token, account ID, waste reduction date, and description required'
        },
        { status: 400 }
      );
    }

    const since = new Date(wasteReductionDate);
    since.setDate(since.getDate() - 7);

    const params = new URLSearchParams({
      account_id: accountId,
      expand: 'merchant',
      limit: '50',
      since: since.toISOString(),
      before: new Date(wasteReductionDate).toISOString()
    });

    const response = await fetch(`https://api.monzo.com/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Monzo API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const foodTransactions: MonzoTransaction[] = (data.transactions || []).filter(isFoodRelated);
    const { potentialMatches, confidence, reasoning } = scoreWasteMatches(
      foodTransactions,
      wasteDescription,
      wasteReductionDate
    );

    return NextResponse.json({ success: true, potentialMatches, confidence, reasoning });
  } catch (error) {
    console.error('Error matching waste reduction with transactions:', error);
    return NextResponse.json({ success: false, error: 'Failed to match transactions' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('test') === 'true') {
    return NextResponse.json({
      success: true,
      potentialMatches: [
        {
          id: 'tx_test_001',
          created: new Date().toISOString(),
          description: 'Test Food Purchase',
          amount: -850,
          currency: 'GBP',
          category: 'eating_out',
          merchant: {
            id: 'merch_test_001',
            name: 'Test Restaurant',
            category: 'eating_out',
            emoji: '🍕'
          }
        }
      ],
      confidence: 0.85,
      reasoning: 'Test mode - mock transaction match'
    });
  }

  return NextResponse.json({ success: false, error: 'Use POST method for transaction matching' }, { status: 405 });
}
