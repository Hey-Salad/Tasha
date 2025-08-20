import React, { useState, useEffect } from 'react';
import { BarChart3, Camera, Mic, CreditCard } from 'lucide-react';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarStyle: React.CSSProperties = {
    width: isMobile ? '280px' : '320px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #000000 0%, #111111 50%, #000000 100%)',
    padding: '32px 24px',
    borderRight: '3px solid #333333',
    boxShadow: '4px 0 20px rgba(237, 76, 76, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    fontFamily: 'Figtree, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '24px',
    borderBottom: '2px solid #333333',
    marginBottom: '8px'
  };

  const logoStyle: React.CSSProperties = {
    width: '160px',
    height: '50px',
    objectFit: 'contain'
  };

  const menuItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isActive 
      ? 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)' 
      : 'transparent',
    border: isActive 
      ? '2px solid #ed4c4c' 
      : '2px solid transparent',
    boxShadow: isActive 
      ? '0 8px 24px rgba(237, 76, 76, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
    color: isActive ? '#ffffff' : '#faa09a'
  });

  const menuIconStyle = (isActive: boolean): React.CSSProperties => ({
    minWidth: '24px',
    height: '24px',
    color: isActive ? '#ffffff' : '#ed4c4c'
  });

  const menuTextStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: '16px',
    fontWeight: isActive ? '700' : '600',
    color: isActive ? '#ffffff' : '#ffffff',
    fontFamily: 'Figtree, sans-serif'
  });

  const menuDescStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#faa09a',
    marginTop: '2px',
    lineHeight: '1.3'
  };

  const contractSectionStyle: React.CSSProperties = {
    marginTop: 'auto',
    padding: '20px',
    background: 'rgba(237, 76, 76, 0.1)',
    borderRadius: '20px',
    border: '2px solid #333333'
  };

  const contractTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ed4c4c',
    marginBottom: '12px',
    fontFamily: 'Grandstander, cursive'
  };

  const contractAddressStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#faa09a',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    lineHeight: '1.4',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #333333'
  };

  const networkBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    background: '#28a74522',
    color: '#28a745',
    fontSize: '10px',
    fontWeight: '600',
    borderRadius: '12px',
    marginTop: '8px',
    border: '1px solid #28a74533'
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'Overview & wallet'
    },
    {
      id: 'image-analysis',
      icon: Camera,
      label: 'Image Analysis',
      description: 'AI food analysis'
    },
    {
      id: 'voice-assistant',
      icon: Mic,
      label: 'Voice Assistant',
      description: 'Voice food logging'
    },
    {
      id: 'banking',
      icon: CreditCard,
      label: 'Banking',
      description: 'Future integration'
    }
  ];

  return (
    <nav style={sidebarStyle}>
      {/* Logo Section */}
      <div style={logoContainerStyle}>
        <img 
          src="/HeySalad Logo White.png" 
          alt="HeySalad Logo" 
          style={logoStyle}
        />
      </div>

      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          
          return (
            <div
              key={item.id}
              style={menuItemStyle(isActive)}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(237, 76, 76, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(237, 76, 76, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <IconComponent style={menuIconStyle(isActive)} />
              <div style={{ flex: 1 }}>
                <div style={menuTextStyle(isActive)}>{item.label}</div>
                <div style={menuDescStyle}>{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contract Address Section */}
      <div style={contractSectionStyle}>
        <div style={contractTitleStyle}>
          Smart Contract
        </div>
        <div style={contractAddressStyle}>
          5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw
        </div>
        <div style={networkBadgeStyle}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            background: '#28a745', 
            borderRadius: '50%' 
          }} />
          Polkadot Network
        </div>
      </div>
    </nav>
  );
}