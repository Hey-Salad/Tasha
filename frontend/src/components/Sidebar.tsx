// components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  BarChart3, 
  Trash2, 
  History, 
  CreditCard,
  ExternalLink
} from 'lucide-react';

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
    width: '260px',
    backgroundColor: '#000000',
    color: 'white',
    padding: '24px 0',
    boxShadow: '0 0 15px rgba(237,76,76,0.4)',
    borderRight: '2px solid #333333',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  const logoSectionStyle: React.CSSProperties = {
    padding: '0 24px 24px 24px',
    borderBottom: '2px solid rgba(255,255,255,0.1)',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Overview & Stats'
    },
    { 
      id: 'log-waste', 
      label: 'Log Waste', 
      icon: Trash2,
      description: 'Record Reductions'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: History,
      description: 'Past Transactions'
    },
    { 
      id: 'monzo', 
      label: 'Banking', 
      icon: CreditCard,
      description: 'Monzo Integration'
    }
  ];

  return (
    <div style={sidebarStyle}>
      {/* Logo Section */}
      <div style={logoSectionStyle}>
        <div style={{ 
          position: 'relative', 
          height: '45px', 
          width: '140px', 
          marginBottom: '12px' 
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
        <p style={{ 
          fontSize: isMobile ? '12px' : '13px', 
          color: '#faa09a', 
          textAlign: 'center',
          margin: 0,
          fontWeight: '500',
          fontFamily: 'Figtree, sans-serif'
        }}>
          Food Waste Reduction Platform
        </p>
      </div>
      
      {/* Navigation Menu */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <SidebarButton 
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                isMobile={isMobile}
              />
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div style={{ 
        padding: isMobile ? '16px' : '24px', 
        marginTop: 'auto'
      }}>
        {/* Network Status */}
        <div style={{
          background: 'rgba(237, 76, 76, 0.1)',
          border: '1px solid rgba(237, 76, 76, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#28a745',
              borderRadius: '50%'
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'Figtree, sans-serif'
            }}>
              Asset-Hub Westend
            </span>
          </div>
          
          <div style={{ 
            fontSize: isMobile ? '10px' : '11px', 
            color: '#faa09a',
            fontFamily: 'Figtree, sans-serif'
          }}>
            Contract Address:
          </div>
          <div style={{ 
            fontSize: isMobile ? '9px' : '10px', 
            wordBreak: 'break-all', 
            color: '#ffd0cd',
            lineHeight: '1.4',
            fontFamily: 'monospace',
            marginBottom: '8px'
          }}>
            0x34F4EB3...647F1B0c
          </div>
          
          <a 
            href="https://blockscout-asset-hub.parity-chains-scw.parity.io/token/0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ed4c4c',
              textDecoration: 'none',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '500',
              fontFamily: 'Figtree, sans-serif',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#faa09a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ed4c4c';
            }}
          >
            View on Explorer
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Powered by */}
        <div style={{ 
          textAlign: 'center',
          fontSize: '11px', 
          color: '#666666',
          fontFamily: 'Figtree, sans-serif'
        }}>
          Powered by Polkadot 🔗
        </div>
      </div>
    </div>
  );
}

// Enhanced Sidebar Button Component
type SidebarButtonProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
};

function SidebarButton({ 
  icon: Icon, 
  label, 
  description, 
  isActive, 
  onClick, 
  isMobile = false 
}: SidebarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: isMobile ? '12px 16px' : '16px 24px',
    margin: '2px 0',
    backgroundColor: isActive 
      ? 'rgba(237,76,76,0.15)' 
      : isHovered 
        ? 'rgba(255,255,255,0.08)' 
        : 'transparent',
    border: 'none',
    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.8)',
    textAlign: 'left',
    cursor: 'pointer',
    borderLeft: isActive ? '4px solid #ed4c4c' : '4px solid transparent',
    borderRadius: '0 12px 12px 0',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: isActive ? '600' : '500',
    fontFamily: 'Figtree, sans-serif',
    transition: 'all 0.3s ease',
    outline: 'none',
    position: 'relative'
  };

  const iconStyle: React.CSSProperties = {
    marginRight: isMobile ? '12px' : '16px',
    flexShrink: 0,
    opacity: isActive ? 1 : 0.7,
    transition: 'opacity 0.3s ease'
  };

  const textSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.9)',
    fontFamily: 'Figtree, sans-serif'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '11px',
    color: isActive ? '#ffd0cd' : 'rgba(255,255,255,0.5)',
    fontFamily: 'Figtree, sans-serif',
    fontWeight: '400'
  };

  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={buttonStyle}
    >
      <div style={iconStyle}>
        <Icon size={isMobile ? 18 : 20} />
      </div>
      
      <div style={textSectionStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div style={{
          position: 'absolute',
          right: '12px',
          width: '6px',
          height: '6px',
          backgroundColor: '#ed4c4c',
          borderRadius: '50%'
        }} />
      )}
    </button>
  );
}