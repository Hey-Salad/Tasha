import { NextResponse } from 'next/server';
import { getMonzoConfig } from '@/lib/server/env';
import { MonzoTransaction, analyzeFoodSpending, isFoodRelated } from '@/lib/server/monzo';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const accountId = searchParams.get('account_id');
    const type = searchParams.get('type') ?? 'transactions';
    const days = parseInt(searchParams.get('days') ?? '7', 10);

    if (!accessToken || !accountId) {
      return NextResponse.json({ success: false, error: 'Access token and account ID required' }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const params = new URLSearchParams({
      account_id: accountId,
      expand: 'merchant',
      limit: '100',
      since: since.toISOString()
    });

    const response = await fetch(`https://api.monzo.com/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ success: false, error: 'Access token expired or invalid' }, { status: 401 });
      }
      if (response.status === 403) {
        return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
      }
      throw new Error(`Monzo API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const transactions: MonzoTransaction[] = data.transactions || [];

    if (type === 'food') {
      const foodTransactions = transactions.filter(isFoodRelated);
      return NextResponse.json({ success: true, transactions: foodTransactions, count: foodTransactions.length });
    }

    if (type === 'analysis') {
      const analysis = analyzeFoodSpending(transactions);
      return NextResponse.json({ success: true, analysis });
    }

    return NextResponse.json({ success: true, transactions, count: transactions.length });
  } catch (error) {
    console.error('Error fetching Monzo transactions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, accountId, transactionIds } = body ?? {};

    if (!accessToken || !accountId) {
      return NextResponse.json({ success: false, error: 'Access token and account ID required' }, { status: 400 });
    }

    const transactions: MonzoTransaction[] = [];
    if (Array.isArray(transactionIds)) {
      for (const txId of transactionIds.slice(0, 10)) {
        try {
          const response = await fetch(`https://api.monzo.com/transactions/${txId}?expand=merchant`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.ok) {
            const data = (await response.json()) as any;
            transactions.push(data.transaction);
          }
        } catch (error) {
          console.error(`Error fetching transaction ${txId}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, transactions, count: transactions.length });
  } catch (error) {
    console.error('Error in POST transactions endpoint:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
