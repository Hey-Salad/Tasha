'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader, Sparkles, RotateCcw, Lock } from 'lucide-react';
import { analyzeFoodMedia } from '../../services/foodAnalysisService';
import { MediaCapture } from '../../components/MediaCapture';
import { FoodAnalysisResults } from '../../components/FoodAnalysisResults';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import type { FoodAnalysis, MintingOptions } from '../../types/foodAnalysis';

export default function ImageAnalysisPage() {
  const { isConnected, signMessage } = usePolkadotWallet();
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (isConnected) {
      // For demo purposes, auto-authenticate when wallet is connected
      // In production, you might want to require explicit authentication
      setIsAuthenticated(true);
    }
  }, [isConnected]);

  const handleReset = () => {
    setMedia(null);
    setAnalysis(null);
    setError(null);
  };

  const handleMediaCaptured = (mediaUrl: string, type: 'image' | 'video') => {
    setMedia(mediaUrl);
    setMediaType(type);
    setAnalysis(null);
    setError(null);
  };

  const handleAuthenticate = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const message = `Authenticate for food analysis: ${new Date().toISOString()}`;
      await signMessage(message);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const handleAnalysis = async () => {
    if (!media || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(media);
      const blob = await response.blob();
      const file = new File([blob], `food-${mediaType}.${mediaType === 'video' ? 'webm' : 'jpg'}`, { 
        type: mediaType === 'video' ? 'video/webm' : 'image/jpeg'
      });
      
      const result = await analyzeFoodMedia(file, mediaType);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintSelected = async (options: MintingOptions) => {
    if (!analysis || !isConnected) return;

    try {
      // Here you would integrate with your token minting logic
      const selectedItems = Object.entries(options)
        .filter(([_, selected]) => selected)
        .map(([item, _]) => item);

      console.log('Minting selected items:', selectedItems);
      console.log('Analysis data:', analysis);

      // Mock minting success
      alert(`Successfully initiated minting for: ${selectedItems.join(', ')}`);
      
      // In production, you would:
      // 1. Create transaction for token minting
      // 2. Sign transaction with wallet
      // 3. Submit to blockchain
      // 4. Show transaction status

    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    }
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
    border: '2px solid #333333'
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
            <h1 style={titleStyle}>Image Analysis</h1>
            <p style={subtitleStyle}>AI-powered food analysis</p>
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
                  Sign a message with your wallet to authenticate and access AI food analysis features.
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
                    }}
                  >
                    <Lock size={16} />
                    Sign to Authenticate
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
          <h1 style={titleStyle}>Image Analysis</h1>
          <p style={subtitleStyle}>AI-powered food analysis</p>
        </div>
        {media && (
          <button
            style={{
              ...backButtonStyle,
              marginLeft: 'auto'
            }}
            onClick={handleReset}
            title="Reset Analysis"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </header>

      <div style={{ padding: '24px' }}>
        <div style={mainContentStyle}>
          {/* HeySalad Logo in Center */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
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

          <div style={cardStyle}>
            {/* Media Preview/Capture */}
            <div style={{ 
              width: '100%', 
              aspectRatio: '4/5', 
              background: '#000000', 
              position: 'relative' 
            }}>
              {media ? (
                <>
                  {mediaType === 'video' ? (
                    <video 
                      src={media} 
                      controls
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <img 
                      src={media} 
                      alt="Captured food" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  
                  {/* Action Buttons after capture */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '0 16px'
                  }}>
                    <button
                      style={{
                        background: '#666666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                      onClick={handleReset}
                    >
                      Retake
                    </button>
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={handleAnalysis}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Analyze Food
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <MediaCapture 
                  onMediaCaptured={handleMediaCaptured}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '20px',
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                margin: '16px',
                borderRadius: '12px'
              }}>
                <div style={{ color: '#dc3545', marginBottom: '8px', fontWeight: '600' }}>
                  Analysis Error
                </div>
                <div style={{ color: '#dc3545', fontSize: '14px' }}>
                  {error}
                </div>
                <button 
                  style={{
                    background: 'transparent',
                    border: '1px solid #dc3545',
                    color: '#dc3545',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                  onClick={handleReset}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <FoodAnalysisResults
                analysis={analysis}
                onMintSelected={handleMintSelected}
              />
            )}
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