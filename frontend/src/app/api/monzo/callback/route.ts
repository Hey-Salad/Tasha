// app/api/monzo/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      console.error('Monzo OAuth error:', error, errorDescription);
      
      // Redirect to auth page with error
      return NextResponse.redirect(
        new URL(`/auth/monzo?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/monzo?error=missing_code', request.url)
      );
    }

    // Redirect to the auth page with the code for processing
    console.log('Monzo OAuth callback received, redirecting to auth page...');
    return NextResponse.redirect(
      new URL(`/auth/monzo?code=${code}&state=${state || ''}`, request.url)
    );
    
  } catch (error) {
    console.error('Monzo callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/monzo?error=callback_failed', request.url)
    );
  }
}