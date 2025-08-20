'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Lock, 
  CreditCard, 
  Check, 
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  Loader
} from 'lucide-react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';

export default function BankingPage() {
  const { isConnected, signMessage } = usePolkadotWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectedToMonzo, setIsConnectedToMonzo] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (isConnected) {
      setIsAuthenticated(true);
    }
  }, [isConnected]);

  const handleAuthenticate = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      const message = `Authenticate for banking features: ${new Date().toISOString()}`;
      await signMessage(message);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMonzoConnect = () => {
    // Mock Monzo OAuth flow
    setIsProcessing(true);
    
    // Simulate OAuth redirect
    setTimeout(() => {
      setIsConnectedToMonzo(true);
      setIsProcessing(false);
      alert('Successfully connected to Monzo! This is a demo connection.');
    }, 2000);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#000000',
    fontFamily: 'Figtree, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderBottom: '2px solid #333333'
  };

  const backButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    fontFamily: 'Grandstander, cursive'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#faa09a',
    margin: 0
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '25px',
    background: '#111111',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)',
    overflow: 'hidden',
    border: '2px solid #333333',
    marginBottom: '24px'
  };

  const authSectionStyle: React.CSSProperties = {
    padding: '40px 24px',
    textAlign: 'center',
    background: '#111111'
  };

  const authButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 auto',
    fontFamily: 'Grandstander, cursive'
  };

  // Authentication required screen
  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backButtonStyle}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={titleStyle}>Banking</h1>
            <p style={subtitleStyle}>Connect your bank account</p>
          </div>
        </header>

        <div style={{ padding: '24px' }}>
          <div style={mainContentStyle}>
            <div style={cardStyle}>
              <div style={authSectionStyle}>
                <Lock size={48} style={{ color: '#ed4c4c', marginBottom: '24px' }} />
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px',
                  fontFamily: 'Grandstander, cursive'
                }}>
                  Authentication Required
                </h2>
                <p style={{
                  color: '#faa09a',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Sign a message with your wallet to authenticate and access banking features.
                </p>
                
                {!isConnected ? (
                  <p style={{
                    color: '#dc3545',
                    marginBottom: '24px',
                    fontSize: '14px'
                  }}>
                    Please connect your wallet first from the dashboard.
                  </p>
                ) : (
                  <button
                    style={authButtonStyle}
                    onClick={handleAuthenticate}
                    disabled={isProcessing}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Sign to Authenticate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link href="/" style={backButtonStyle}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={titleStyle}>Banking</h1>
          <p style={subtitleStyle}>Connect your bank account</p>
        </div>
      </header>

      <div style={{ padding: '24px' }}>
        <div style={mainContentStyle}>
          {/* HeySalad Logo in Center */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <img 
              src="/HeySalad Logo White.png" 
              alt="HeySalad Logo" 
              style={{
                width: '120px',
                height: '38px',
                objectFit: 'contain',
                opacity: 0.3
              }}
            />
          </div>

          {/* Monzo Connection Card */}
          <div style={cardStyle}>
            <div style={{ padding: '32px 24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#ff5733',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <span style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    M
                  </span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0,
                    fontFamily: 'Grandstander, cursive'
                  }}>
                    Monzo
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#faa09a',
                    margin: 0
                  }}>
                    Smart Banking Integration
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              {isConnectedToMonzo ? (
                <div style={{
                  background: 'rgba(40, 167, 69, 0.1)',
                  border: '1px solid rgba(40, 167, 69, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <Check size={16} style={{ color: '#28a745' }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#28a745'
                    }}>
                      Connected to Monzo
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#28a745',
                    margin: 0,
                    opacity: 0.8
                  }}>
                    Your bank account is securely linked and ready for food waste tracking.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <AlertCircle size={16} style={{ color: '#ffc107' }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffc107'
                    }}>
                      Not Connected
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#ffc107',
                    margin: 0,
                    opacity: 0.8
                  }}>
                    Connect your Monzo account to track food spending and waste reduction savings.
                  </p>
                </div>
              )}

              {/* Features */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  What you'll get:
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: TrendingUp, text: 'Track food spending patterns' },
                    { icon: Zap, text: 'Real-time waste reduction insights' },
                    { icon: Shield, text: 'Bank-grade security & encryption' }
                  ].map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <feature.icon size={16} style={{ color: '#ed4c4c' }} />
                      <span style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        lineHeight: '1.4'
                      }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connect Button */}
              {!isConnectedToMonzo && (
                <button
                  style={{
                    width: '100%',
                    background: '#ff5733',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(255, 87, 51, 0.3)',
                    fontFamily: 'Grandstander, cursive'
                  }}
                  onClick={handleMonzoConnect}
                  disabled={isProcessing}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 87, 51, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 87, 51, 0.3)';
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Connect with Monzo
                      <ExternalLink size={14} />
                    </>
                  )}
                </button>
              )}

              {/* Disconnect Button */}
              {isConnectedToMonzo && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#dc3545',
                      border: '2px solid #dc3545',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setIsConnectedToMonzo(false)}
                  >
                    Disconnect
                  </button>
                  <button
                    style={{
                      flex: 2,
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View Insights
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{
            background: 'rgba(237, 76, 76, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(237, 76, 76, 0.1)'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#faa09a',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Shield size={14} />
              Privacy & Security
            </h4>
            <p style={{
              fontSize: '12px',
              color: '#cccccc',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Your banking data is encrypted and processed securely. HeySalad only accesses transaction categories to identify food spending, not specific transaction details.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}