import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      width: '220px',
      backgroundColor: '#000000',
      color: 'white',
      padding: '20px 0',
      boxShadow: '0 0 10px rgba(237,76,76,0.3)',
      borderRight: '1px solid #333333',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo Section */}
      <div style={{ 
        padding: '0 20px 20px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          position: 'relative', 
          height: '40px', 
          width: '120px', 
          marginBottom: '10px' 
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
          fontSize: isMobile ? '0.8rem' : '0.9rem', 
          color: '#faa09a', 
          textAlign: 'center',
          margin: 0
        }}>
          Food Waste Reduction
        </p>
      </div>
      
      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <SidebarButton 
              icon="📊"
              label="Dashboard"
              isActive={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              isMobile={isMobile}
            />
          </li>
          <li>
            <SidebarButton 
              icon="📝"
              label="Log Waste"
              isActive={activeTab === 'log-waste'}
              onClick={() => setActiveTab('log-waste')}
              isMobile={isMobile}
            />
          </li>
          <li>
            <SidebarButton 
              icon="📜"
              label="History"
              isActive={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              isMobile={isMobile}
            />
          </li>
          <li>
            <SidebarButton 
              icon="🏦"
              label="Banking"
              isActive={activeTab === 'monzo'}
              onClick={() => setActiveTab('monzo')}
              isMobile={isMobile}
            />
          </li>
        </ul>
      </nav>
      
      {/* Footer */}
      <div style={{ 
        padding: isMobile ? '15px' : '20px', 
        marginTop: 'auto'
      }}>
        <div style={{ 
          marginBottom: '10px', 
          fontSize: isMobile ? '0.8rem' : '0.9rem', 
          color: '#faa09a' 
        }}>
          Contract Address:
        </div>
        <div style={{ 
          fontSize: isMobile ? '0.7rem' : '0.8rem', 
          wordBreak: 'break-all', 
          color: '#ffd0cd',
          lineHeight: '1.3'
        }}>
          0x34F4EB3...647F1B0c
        </div>
        <a 
          href="https://blockscout-asset-hub.parity-chains-scw.parity.io/token/0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '10px',
            color: '#ed4c4c',
            textDecoration: 'none',
            fontSize: isMobile ? '0.7rem' : '0.8rem'
          }}
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
}

// Sidebar Button Sub-Component
type SidebarButtonProps = {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
};

function SidebarButton({ icon, label, isActive, onClick, isMobile = false }: SidebarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: isMobile ? '10px 15px' : '12px 20px',
        backgroundColor: isActive 
          ? 'rgba(237,76,76,0.1)' 
          : isHovered 
            ? 'rgba(255,255,255,0.05)' 
            : 'transparent',
        border: 'none',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
        textAlign: 'left',
        cursor: 'pointer',
        borderLeft: isActive ? '4px solid #ed4c4c' : '4px solid transparent',
        fontSize: isMobile ? '0.85rem' : '0.9rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
    >
      <span style={{ 
        marginRight: isMobile ? '8px' : '10px',
        fontSize: isMobile ? '0.9rem' : '1rem'
      }}>
        {icon}
      </span> 
      {label}
    </button>
  );
}