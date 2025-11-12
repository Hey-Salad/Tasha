// app/api/token/distribute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { distributeTokens } from '@/lib/server/tokenDistribution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { recipientAddress, wasteAmount, wasteType, description } = body;

    // Validate inputs
    if (!recipientAddress || !wasteAmount || !wasteType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate Polkadot address format (basic check)
    if (!recipientAddress.match(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Polkadot address' },
        { status: 400 }
      );
    }

    // Validate waste type
    const validWasteTypes = ['donation', 'efficient-delivery', 'used-before-expiry'];
    if (!validWasteTypes.includes(wasteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid waste type' },
        { status: 400 }
      );
    }

    // Distribute tokens
    const result = await distributeTokens({
      recipientAddress,
      wasteAmount: Number(wasteAmount),
      wasteType,
      description: description || ''
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
