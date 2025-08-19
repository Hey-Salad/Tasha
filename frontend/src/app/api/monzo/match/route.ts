// app/api/monzo/match/route.ts
import { NextRequest, NextResponse } from 'next/server';
import MonzoService from '@/services/MonzoService';

const monzoService = new MonzoService();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, accountId, wasteReductionDate, wasteDescription } = await request.json();

    if (!accessToken || !accountId || !wasteReductionDate || !wasteDescription) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access token, account ID, waste reduction date, and description are required' 
        },
        { status: 400 }
      );
    }

    const matchResult = await monzoService.matchTransactionsWithWasteReduction(
      accessToken,
      accountId,
      wasteReductionDate,
      wasteDescription
    );

    return NextResponse.json({
      success: true,
      ...matchResult,
      message: `Transaction matching completed with ${Math.round(matchResult.confidence * 100)}% confidence`
    });
  } catch (error) {
    console.error('Error matching transactions with waste reduction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to match transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}