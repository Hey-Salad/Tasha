// app/auth/monzo/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type AuthStage = 'processing' | 'waiting_mobile' | 'exchanging' | 'success' | 'error';

export default function MonzoAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<AuthStage>('processing');
  const [countdown, setCountdown] = useState(90); // Increased to 90 seconds
  const [error, setError] = useState<string | null>(null);

  const authCode = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!authCode) {
      setError('Missing authorization code');
      setStage('error');
      return;
    }

    // Initial processing delay to ensure email flow is complete
    setTimeout(() => {
      setStage('waiting_mobile');
    }, 2000); // 2 second delay before starting mobile wait
    
    // Extended countdown timer for mobile app approval
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Additional delay before token exchange to ensure mobile approval
          setTimeout(() => {
            handleTokenExchange();
          }, 3000); // 3 second delay after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authCode]);

  const handleTokenExchange = async () => {
    setStage('exchanging');
    
    try {
      const response = await fetch('/api/monzo/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode,
          state: state
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStage('success');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/?tab=monzo&connected=true');
        }, 3000);
      } else {
        throw new Error('Failed to exchange token');
      }
    } catch (err) {
      console.error('Token exchange error:', err);
      setError('Failed to complete authorization');
      setStage('error');
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffd0cd 0%, #faa09a 50%, #ed4c4c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Figtree, sans-serif'
  };

  const containerStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '25px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '2px solid #333333'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '12px'
  };

  const renderStageContent = () => {
    switch (stage) {
      case 'processing':
        return <ProcessingStage />;
      case 'waiting_mobile':
        return <WaitingMobileStage countdown={countdown} onSkip={handleTokenExchange} />;
      case 'exchanging':
        return <ExchangingStage />;
      case 'success':
        return <SuccessStage />;
      case 'error':
        return <ErrorStage error={error} onRetry={handleTokenExchange} />;
      default:
        return <ProcessingStage />;
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <div style={{ 
            position: 'relative', 
            height: '48px', 
            width: '160px'
          }}>
            <Image 
              src="/HeySalad Logo White.png" 
              alt="HeySalad Logo" 
              fill
              style={{ 
                objectFit: 'contain'
              }} 
            />
          </div>
        </div>
        
        {renderStageContent()}
      </div>
    </div>
  );
}

// Stage Components
function ProcessingStage() {
  return (
    <div>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <h2 style={{ 
        fontSize: '20px', 
        color: '#ffffff', 
        marginBottom: '8px',
        fontFamily: 'Grandstander, cursive'
      }}>
        Processing Authorization...
      </h2>
      <p style={{ color: '#faa09a', fontSize: '14px' }}>
        Setting up your Monzo connection
      </p>
    </div>
  );
}

function WaitingMobileStage({ countdown, onSkip }: { countdown: number; onSkip: () => void }) {
  const phoneStyle: React.CSSProperties = {
    width: '120px',
    height: '240px',
    background: 'linear-gradient(145deg, #333, #555)',
    borderRadius: '25px',
    margin: '0 auto 24px',
    position: 'relative',
    padding: '20px 10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  };

  const screenStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(145deg, #00D4AA, #FF6B35)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white',
    animation: 'pulse 2s infinite'
  };

  return (
    <div>
      <div style={phoneStyle}>
        <div style={screenStyle}>
          📱
        </div>
      </div>
      
      <h2 style={{ 
        fontSize: '20px', 
        color: '#ed4c4c', 
        marginBottom: '12px',
        fontFamily: 'Grandstander, cursive'
      }}>
        Check Your Monzo App
      </h2>
      
      <p style={{ 
        color: '#faa09a', 
        fontSize: '14px', 
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        Open the Monzo app on your phone and approve the connection request to complete the authorization.
      </p>

      <div style={{
        background: 'rgba(237, 76, 76, 0.1)',
        border: '1px solid rgba(237, 76, 76, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#ed4c4c',
          fontFamily: 'Grandstander, cursive'
        }}>
          {countdown}s
        </div>
        <div style={{ fontSize: '12px', color: '#faa09a' }}>
          {countdown > 60 ? 'Waiting for mobile approval...' : 'Auto-continuing soon...'}
        </div>
      </div>

      <button
        onClick={onSkip}
        style={{
          background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'Figtree, sans-serif',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
        }}
      >
        Continue Anyway
      </button>
    </div>
  );
}

function ExchangingStage() {
  return (
    <div>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
      <h2 style={{ 
        fontSize: '20px', 
        color: '#ed4c4c', 
        marginBottom: '8px',
        fontFamily: 'Grandstander, cursive'
      }}>
        Finalizing Connection
      </h2>
      <p style={{ color: '#faa09a', fontSize: '14px' }}>
        Exchanging authorization code for access token...
      </p>
    </div>
  );
}

function SuccessStage() {
  return (
    <div>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ 
        fontSize: '20px', 
        color: '#28a745', 
        marginBottom: '8px',
        fontFamily: 'Grandstander, cursive'
      }}>
        Connected Successfully!
      </h2>
      <p style={{ color: '#faa09a', fontSize: '14px', marginBottom: '16px' }}>
        Your Monzo account is now connected to HeySalad!
      </p>
      <div style={{
        background: 'rgba(40, 167, 69, 0.1)',
        border: '1px solid rgba(40, 167, 69, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', color: '#28a745', fontWeight: '600' }}>
          ✅ Banking verification enabled
        </div>
        <div style={{ fontSize: '14px', color: '#faa09a', marginTop: '4px' }}>
          Earn 1.5x tokens for verified transactions
        </div>
      </div>
      <p style={{ color: '#faa09a', fontSize: '12px' }}>
        Redirecting to dashboard in 3 seconds...
      </p>
    </div>
  );
}

function ErrorStage({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
      <h2 style={{ 
        fontSize: '20px', 
        color: '#dc3545', 
        marginBottom: '8px',
        fontFamily: 'Grandstander, cursive'
      }}>
        Connection Failed
      </h2>
      <p style={{ color: '#faa09a', fontSize: '14px', marginBottom: '24px' }}>
        {error || 'Something went wrong during the authorization process.'}
      </p>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onRetry}
          style={{
            background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Figtree, sans-serif',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)'
          }}
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'transparent',
            color: '#ed4c4c',
            border: '2px solid #ed4c4c',
            borderRadius: '50px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Figtree, sans-serif',
            transition: 'all 0.3s ease'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}