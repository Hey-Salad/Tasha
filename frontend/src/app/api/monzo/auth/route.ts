// app/api/monzo/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import MonzoService from '@/services/MonzoService';

const monzoService = new MonzoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || 'random_state_token';
    
    const authUrl = monzoService.generateAuthUrl(state);
    
    return NextResponse.json({ 
      success: true, 
      authUrl,
      message: 'Monzo authentication URL generated successfully' 
    });
  } catch (error) {
    console.error('Error generating Monzo auth URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate authentication URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const clientSecret = process.env.MONZO_CLIENT_SECRET;
    if (!clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Monzo client secret not configured' },
        { status: 500 }
      );
    }

    const tokens = await monzoService.exchangeCodeForToken(code, clientSecret);
    
    // In a real app, you'd want to securely store these tokens
    // For now, we'll return them to be stored in the client
    return NextResponse.json({
      success: true,
      tokens,
      message: 'Successfully authenticated with Monzo'
    });
  } catch (error) {
    console.error('Error exchanging Monzo auth code:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to exchange authorization code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}