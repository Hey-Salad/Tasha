'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Mic, ChevronDown, ChevronUp, Wallet, Copy, Menu, X } from 'lucide-react';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ManualTokenMinting from '../components/ManualTokenMinting';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { 
    isConnected, 
    isConnecting, 
    accounts, 
    selectedAccount, 
    balance, 
    connectWallet, 
    selectAccount, 
    disconnectWallet 
  } = usePolkadotWallet();
  
  const [isWalletCollapsed, setIsWalletCollapsed] = useState(true); // Start collapsed on mobile
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse wallet on mobile for better space usage
      if (mobile) {
        setIsWalletCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning!');
    } else if (hour < 18) {
      setGreeting('Good afternoon!');
    } else {
      setGreeting('Good evening!');
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#000000',
    fontFamily: 'Figtree, sans-serif',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row'
  };

  const mobileHeaderStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#000000',
    borderBottom: '1px solid #333333',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  const hamburgerButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const mobileLogoStyle: React.CSSProperties = {
    height: '32px',
    objectFit: 'contain'
  };

  const sidebarOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 200,
    display: isMobile && isMobileMenuOpen ? 'block' : 'none'
  };

  const mobileSidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: isMobileMenuOpen ? 0 : '-100%',
    width: '280px',
    height: '100vh',
    zIndex: 300,
    transition: 'left 0.3s ease',
    background: '#000000',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5)'
  };

  const desktopSidebarStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'block',
    width: '320px',
    flexShrink: 0
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    padding: isMobile ? '16px' : '24px',
    maxWidth: '100%',
    overflow: 'hidden'
  };

  const dashboardContentStyle: React.CSSProperties = {
    maxWidth: isMobile ? '100%' : '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '16px' : '24px'
  };

  const greetingCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    borderRadius: isMobile ? '16px' : '20px',
    padding: isMobile ? '20px' : '24px',
    border: '1px solid #333333',
    textAlign: 'center'
  };

  const greetingStyle: React.CSSProperties = {
    fontSize: isMobile ? '24px' : '28px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    fontFamily: 'Grandstander, cursive'
  };

  const greetingSubStyle: React.CSSProperties = {
    fontSize: isMobile ? '14px' : '16px',
    color: '#faa09a',
    margin: 0,
    lineHeight: '1.4'
  };

  const walletSectionStyle: React.CSSProperties = {
    background: '#111111',
    borderRadius: '12px',
    border: '1px solid #333333',
    overflow: 'hidden'
  };

  const walletHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 16px' : '16px 20px',
    cursor: 'pointer',
    transition: 'background 0.3s ease'
  };

  const walletTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '600',
    color: '#ffffff'
  };

  const walletStatusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const statusDotStyle = (connected: boolean): React.CSSProperties => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: connected ? '#28a745' : '#dc3545'
  });

  const walletContentStyle: React.CSSProperties = {
    padding: isWalletCollapsed ? '0' : isMobile ? '0 16px 16px 16px' : '0 20px 20px 20px',
    maxHeight: isWalletCollapsed ? '0' : '300px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  const connectButtonStyle: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: isMobile ? '10px 14px' : '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const connectedInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const balanceStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '8px 12px' : '12px 16px',
    background: '#1a1a1a',
    borderRadius: '6px',
    border: '1px solid #333333'
  };

  const addressStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '6px 8px' : '8px 12px',
    background: '#0a0a0a',
    borderRadius: '4px',
    border: '1px solid #333333',
    fontSize: '10px',
    fontFamily: 'monospace'
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: isMobile ? '12px' : '16px'
  };

  const actionButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: isMobile ? '16px 12px' : '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.2)',
    minHeight: isMobile ? '100px' : '120px'
  };

  const actionIconStyle: React.CSSProperties = {
    width: isMobile ? '20px' : '24px',
    height: isMobile ? '20px' : '24px'
  };

  const actionTitleStyle: React.CSSProperties = {
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '700',
    fontFamily: 'Grandstander, cursive',
    margin: 0,
    textAlign: 'center'
  };

  const actionDescStyle: React.CSSProperties = {
    fontSize: isMobile ? '10px' : '12px',
    opacity: 0.9,
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.2'
  };

  return (
    <div style={containerStyle}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          <button
            style={hamburgerButtonStyle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <img 
            src="/HeySalad Logo White.png" 
            alt="HeySalad Logo" 
            style={mobileLogoStyle}
          />
          
          <div style={{ width: '36px' }} /> {/* Spacer for centering */}
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <div 
        style={sidebarOverlayStyle}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Desktop Sidebar */}
      <div style={desktopSidebarStyle}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <div style={mobileSidebarStyle}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={dashboardContentStyle}>
          {/* Greeting Card */}
          <div style={greetingCardStyle}>
            <h1 style={greetingStyle}>{greeting} ✨</h1>
            <p style={greetingSubStyle}>Ready to analyze food with AI and earn tokens?</p>
          </div>

          {/* Compact Wallet Section */}
          <div style={walletSectionStyle}>
            <div 
              style={walletHeaderStyle}
              onClick={() => setIsWalletCollapsed(!isWalletCollapsed)}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = '#1a1a1a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={walletTitleStyle}>
                <Wallet size={isMobile ? 16 : 18} />
                Wallet Connection
              </div>
              <div style={walletStatusStyle}>
                <div style={statusDotStyle(isConnected)} />
                <span style={{ 
                  fontSize: isMobile ? '10px' : '12px', 
                  color: isConnected ? '#28a745' : '#dc3545',
                  fontWeight: '500'
                }}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {isWalletCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </div>
            </div>

            <div style={walletContentStyle}>
              {!isConnected ? (
                <button
                  style={connectButtonStyle}
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid #ffffff30',
                        borderTop: '2px solid #ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet size={14} />
                      Connect Wallet
                    </>
                  )}
                </button>
              ) : (
                <div style={connectedInfoStyle}>
                  <div style={balanceStyle}>
                    <div>
                      <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#faa09a', marginBottom: '2px' }}>
                        Balance
                      </div>
                      <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#ffffff' }}>
                        {balance ? `${balance} WND` : '0.0000 WND'}
                      </div>
                    </div>
                    <div style={{ fontSize: '8px', color: '#666666' }}>
                      Westend Testnet
                    </div>
                  </div>

                  {selectedAccount && (
                    <div style={addressStyle}>
                      <div>
                        <div style={{ color: '#faa09a', marginBottom: '2px', fontSize: isMobile ? '9px' : '10px' }}>
                          Account: {selectedAccount.meta.name || 'HeySalad_Dev'}
                        </div>
                        <div style={{ color: '#ffffff', fontSize: isMobile ? '9px' : '10px' }}>
                          {formatAddress(selectedAccount.address)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => copyToClipboard(selectedAccount.address)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666666',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        >
                          <Copy size={10} />
                        </button>
                        <button
                          onClick={disconnectWallet}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            padding: '2px',
                            fontSize: '8px'
                          }}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={actionButtonsStyle}>
            <button
              style={actionButtonStyle}
              onClick={() => router.push('/image-analysis')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(237, 76, 76, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.2)';
                }
              }}
            >
              <Camera style={actionIconStyle} />
              <h3 style={actionTitleStyle}>Image Analysis</h3>
              <p style={actionDescStyle}>Analyze food with AI camera</p>
            </button>

            <button
              style={actionButtonStyle}
              onClick={() => router.push('/voice-assistant')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(237, 76, 76, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.2)';
                }
              }}
            >
              <Mic style={actionIconStyle} />
              <h3 style={actionTitleStyle}>Voice Assistant</h3>
              <p style={actionDescStyle}>Voice-powered food logging</p>
            </button>
          </div>

          <div style={{ marginTop: isMobile ? '8px' : '12px' }}>
            <ManualTokenMinting />
          </div>

          {/* Simple Grant Text */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '12px' : '16px',
            fontSize: isMobile ? '10px' : '12px',
            color: '#666666',
            borderTop: '1px solid #333333',
            marginTop: isMobile ? '12px' : '16px'
          }}>
            🎉 Proudly funded by the Polkadot Fast Grant Program
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
