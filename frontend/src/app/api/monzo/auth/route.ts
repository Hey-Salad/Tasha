import { NextResponse } from 'next/server';
import { getMonzoConfig } from '@/lib/server/env';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { clientId, redirectUri } = getMonzoConfig();
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const authUrl = new URL('https://auth.monzo.com/');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    return NextResponse.json({ success: true, authUrl: authUrl.toString(), state });
  } catch (error) {
    console.error('Error generating Monzo auth URL:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate auth URL' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code } = body ?? {};
    const { clientId, clientSecret, redirectUri } = getMonzoConfig();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Authorization code required' }, { status: 400 });
    }

    const tokenResponse = await fetch('https://api.monzo.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Monzo token exchange failed:', errorText);
      return NextResponse.json({ success: false, error: 'Token exchange failed' }, { status: 400 });
    }

    const tokens = (await tokenResponse.json()) as any;
    const accountsResponse = await fetch('https://api.monzo.com/accounts', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    let accounts: any[] = [];
    if (accountsResponse.ok) {
      const accountsData = (await accountsResponse.json()) as any;
      accounts = accountsData.accounts || [];
    }

    return NextResponse.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        user_id: tokens.user_id
      },
      accounts
    });
  } catch (error) {
    console.error('Error in Monzo token exchange:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
