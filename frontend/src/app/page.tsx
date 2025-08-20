"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Import Components
import Sidebar from '../components/Sidebar';
import WalletConnection from '../components/WalletConnection';

// Import Icons
import { 
  Camera, 
  Mic,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function HeySaladDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWalletMinimized, setIsWalletMinimized] = useState(false);

  // Check for mobile and handle URL params
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function for greeting
  function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // Main layout styles
  const mainLayoutStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    background: '#000000',
    fontFamily: 'Figtree, sans-serif',
    maxWidth: '100vw',
    overflowX: 'hidden'
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: isMobile ? '16px' : '32px',
    paddingLeft: isMobile ? '16px' : '40px',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: '#000000',
    minWidth: 0
  };

  const mobileHeaderStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px 0',
    borderBottom: '2px solid #333333'
  };

  const hamburgerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)'
  };

  const logoMobileStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const overlayStyle: React.CSSProperties = {
    display: isMobile && isSidebarOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998
  };

  const sidebarContainerStyle: React.CSSProperties = {
    transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: isMobile ? 'fixed' : 'relative',
    zIndex: 999,
    height: isMobile ? '100vh' : 'auto'
  };

  const greetingStyle: React.CSSProperties = {
    marginBottom: '32px',
    textAlign: 'center',
    padding: '32px 24px',
    background: 'linear-gradient(135deg, rgba(237, 76, 76, 0.1) 0%, rgba(250, 160, 154, 0.05) 100%)',
    borderRadius: '25px',
    border: '2px solid rgba(237, 76, 76, 0.2)',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)'
  };

  const greetingTitleStyle: React.CSSProperties = {
    fontSize: isMobile ? '28px' : '36px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 12px 0',
    fontFamily: 'Grandstander, cursive'
  };

  const greetingSubtitleStyle: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    color: '#faa09a',
    margin: '0',
    fontFamily: 'Figtree, sans-serif'
  };

  const walletSectionStyle: React.CSSProperties = {
    marginBottom: '32px',
    transition: 'all 0.3s ease'
  };

  const walletHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    cursor: 'pointer',
    padding: '12px 16px',
    background: 'rgba(237, 76, 76, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(237, 76, 76, 0.3)'
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const actionButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '32px 24px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    fontFamily: 'Grandstander, cursive',
    textDecoration: 'none',
    minHeight: '180px',
    justifyContent: 'center'
  };

  return (
    <div style={mainLayoutStyle}>
      {/* Mobile overlay */}
      <div 
        style={overlayStyle}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div style={sidebarContainerStyle}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab: string) => {
            setActiveTab(tab);
            if (isMobile) setIsSidebarOpen(false);
          }} 
        />
      </div>

      {/* Main Content */}
      <main style={contentAreaStyle}>
        {/* Mobile Header */}
        <header style={mobileHeaderStyle}>
          <button 
            style={hamburgerStyle}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          
          <div style={logoMobileStyle}>
            <img 
              src="/HeySalad Logo White.png" 
              alt="HeySalad Logo" 
              style={{
                width: '120px',
                height: '38px',
                objectFit: 'contain'
              }}
            />
          </div>
        </header>

        {/* Greeting Section */}
        <div style={greetingStyle}>
          <h1 style={greetingTitleStyle}>
            Good {getTimeOfDay()}! ✨
          </h1>
          <p style={greetingSubtitleStyle}>
            Ready to analyze food with AI and earn tokens?
          </p>
        </div>

        {/* Wallet Connection Section */}
        <div style={walletSectionStyle}>
          <div 
            style={walletHeaderStyle}
            onClick={() => setIsWalletMinimized(!isWalletMinimized)}
          >
            <span style={{ color: '#ffffff', fontWeight: '600', fontFamily: 'Grandstander, cursive' }}>
              Wallet Connection
            </span>
            {isWalletMinimized ? (
              <ChevronDown size={20} style={{ color: '#ed4c4c' }} />
            ) : (
              <ChevronUp size={20} style={{ color: '#ed4c4c' }} />
            )}
          </div>
          
          {!isWalletMinimized && (
            <WalletConnection />
          )}
        </div>

        {/* Main Action Buttons */}
        <div style={actionButtonsStyle}>
          {/* Image Analysis Button */}
          <Link 
            href="/image-analysis" 
            style={actionButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(237, 76, 76, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(237, 76, 76, 0.3)';
            }}
          >
            <Camera size={48} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>Image Analysis</div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontFamily: 'Figtree, sans-serif', fontWeight: '400' }}>
                Analyze food with AI camera
              </div>
            </div>
          </Link>

          {/* Voice Assistant Button */}
          <Link 
            href="/voice-assistant" 
            style={actionButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(237, 76, 76, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(237, 76, 76, 0.3)';
            }}
          >
            <Mic size={48} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>Voice Assistant</div>
              <div style={{ fontSize: '14px', opacity: 0.9, fontFamily: 'Figtree, sans-serif', fontWeight: '400' }}>
                Voice-powered food logging
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Preview */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '24px',
          background: 'rgba(237, 76, 76, 0.05)',
          borderRadius: '20px',
          border: '1px solid rgba(237, 76, 76, 0.1)'
        }}>
          <Sparkles size={32} style={{ color: '#ed4c4c', marginBottom: '16px' }} />
          <h3 style={{ 
            color: '#ffffff', 
            fontFamily: 'Grandstander, cursive', 
            marginBottom: '8px',
            fontSize: '18px' 
          }}>
            Coming Soon: Email Rewards
          </h3>
          <p style={{ 
            color: '#faa09a', 
            fontSize: '14px', 
            margin: 0 
          }}>
            Add your email and earn bonus tokens for joining our community!
          </p>
        </div>
      </main>
    </div>
  );
}