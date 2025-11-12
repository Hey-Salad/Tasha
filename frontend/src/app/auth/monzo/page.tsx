'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildFunctionsUrl, parseJsonResponse } from '@/utils/functionsClient';

export default function MonzoAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [message, setMessage] = useState('Completing Monzo connection...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      setStatus('error');
      setMessage('Missing authorization code in callback.');
      const timeout = setTimeout(() => router.replace('/banking?monzo_error=missing_code'), 2500);
      return () => clearTimeout(timeout);
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch(buildFunctionsUrl('/monzo/auth'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, state })
        });

        const data = await parseJsonResponse<{ success: boolean; tokens: any; accounts?: any[]; error?: string }>(
          response
        );
        if (!data.success) {
          throw new Error(data.error || 'Token exchange failed');
        }

        const tokens = data.tokens;
        const accountId = (data.accounts?.[0]?.id as string | undefined) ?? null;
        localStorage.setItem('monzo_tokens', JSON.stringify(tokens));
        if (accountId) {
          localStorage.setItem('monzo_account_id', accountId);
        }

        router.replace('/banking?monzo_success=true');
      } catch (error) {
        console.error('Monzo callback error:', error);
        setStatus('error');
        setMessage('Unable to complete Monzo sign-in.');
        setTimeout(() => router.replace('/banking?monzo_error=callback_failed'), 2500);
      }
    };

    exchangeCode();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff',
        fontFamily: 'Figtree, sans-serif'
      }}
    >
      <div
        style={{
          background: '#111111',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #333333',
          textAlign: 'center',
          width: '320px'
        }}
      >
        <p style={{ marginBottom: '12px', color: '#faa09a', fontFamily: 'Grandstander, cursive' }}>HeySalad Monzo</p>
        <p style={{ margin: 0, color: status === 'error' ? '#dc3545' : '#ffffff' }}>{message}</p>
      </div>
    </div>
  );
}
