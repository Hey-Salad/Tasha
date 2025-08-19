"use client";
import React, { useState, useEffect } from 'react';

// Import Components
import Sidebar from '../components/Sidebar';
import WalletConnectionButton from '../components/WalletConnectionButton';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import TransactionHistory from '../components/TransactionHistory';
import WasteForm from '../components/LogWaste/WasteForm';
import MonzoConnection from '../components/MonzoConnection';

// Import Icons
import { 
  Trash2, 
  CreditCard, 
  History,
  Zap,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';

// Import Hooks and Services
import { useMonzo } from '../hooks/useMonzo';

export default function HeySaladDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Monzo integration
  const { 
    isConnected: isMonzoConnected,
    error: monzoError
  } = useMonzo();

  // Check for mobile and handle URL params
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check URL params for tab switching
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock data - replace with real data fetching
  const getTotalWasteReduction = () => {
    return transactions.reduce((total, transaction) => {
      return total + (transaction.wasteAmount || 0);
    }, 0);
  };

  // Mock functions for components
  const handleLogWasteReduction = async (amount: number, type: any, description: string): Promise<void> => {
    // Implementation for logging waste reduction
    console.log('Logging waste reduction:', { amount, type, description });
  };

  const handleConnectWallet = async (): Promise<void> => {
    // Implementation for connecting wallet
    console.log('Connecting wallet...');
  };

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
    borderBottom: '2px solid #ffd0cd'
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashboardHeader 
              walletAddress={walletAddress}
              isMonzoConnected={isMonzoConnected}
              tokenBalance={tokenBalance}
              onConnectWallet={handleConnectWallet}
            />
            
            <StatsCards
              tokenBalance={tokenBalance}
              getTotalWasteReduction={getTotalWasteReduction}
            />
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              <RecentTransactions
                transactions={transactions}
                setActiveTab={setActiveTab}
              />
              
              <QuickActions setActiveTab={setActiveTab} />
            </div>
          </>
        );
        
      case 'log-waste':
        return (
          <TabContainer title="Log Waste Reduction" icon={<Trash2 size={28} />}>
            <WasteForm 
              isConnected={!!walletAddress}
              logWasteReduction={handleLogWasteReduction}
            />
          </TabContainer>
        );
        
      case 'history':
        return (
          <TabContainer title="Transaction History" icon={<History size={28} />}>
            <TransactionHistory transactions={transactions} />
          </TabContainer>
        );
        
      case 'monzo':
        return (
          <TabContainer title="Banking Integration" icon={<CreditCard size={28} />}>
            <MonzoConnection />
          </TabContainer>
        );
        
      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: '#ed4c4c', fontFamily: 'Grandstander, cursive' }}>
              Tab not found
            </h2>
          </div>
        );
    }
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
            <div style={{
              width: '32px',
              height: '32px',
              background: '#ed4c4c',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🥗
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ed4c4c',
              fontFamily: 'Grandstander, cursive'
            }}>
              HeySalad
            </span>
          </div>
        </header>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({ 
  walletAddress, 
  isMonzoConnected,
  tokenBalance,
  onConnectWallet
}: { 
  walletAddress: string | null; 
  isMonzoConnected: boolean;
  tokenBalance: string;
  onConnectWallet: () => Promise<void>;
}) {
  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    background: '#000000',
    padding: '24px',
    borderRadius: '25px',
    border: '2px solid #333333',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.15)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    fontFamily: 'Grandstander, cursive'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#faa09a',
    margin: '0 0 16px 0',
    fontFamily: 'Figtree, sans-serif'
  };

  const statusBarStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center'
  };

  return (
    <div style={headerStyle}>
      <h1 style={titleStyle}>
        Good {getTimeOfDay()}! 👋
      </h1>
      <p style={subtitleStyle}>
        Ready to make a positive impact on food waste?
      </p>
      
      <div style={statusBarStyle}>
        <WalletConnectionButton 
          isConnected={!!walletAddress}
          isConnecting={false}
          selectedAccount={null}
          tokenBalance={tokenBalance}
          connectWallet={onConnectWallet}
        />
        
        <StatusBadge
          icon={<CreditCard size={14} />}
          label="Monzo"
          status={isMonzoConnected ? 'connected' : 'disconnected'}
        />
        
        <StatusBadge
          icon={<Globe size={14} />}
          label="Polkadot"
          status={walletAddress ? 'connected' : 'disconnected'}
        />
      </div>
    </div>
  );
}

// Tab Container Component
function TabContainer({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  const containerStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '25px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15), 0 4px 8px rgba(237, 76, 76, 0.1)',
    border: '2px solid #333333'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #333333'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    fontFamily: 'Grandstander, cursive'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ color: '#ed4c4c' }}>{icon}</div>
        <h2 style={titleStyle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Quick Actions Component
function QuickActions({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const containerStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '25px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15), 0 4px 8px rgba(237, 76, 76, 0.1)',
    border: '2px solid #333333'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 16px 0',
    fontFamily: 'Grandstander, cursive',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const actions = [
    {
      icon: <Trash2 size={24} />,
      title: 'Log Waste Reduction',
      description: 'Record your food waste prevention',
      action: () => setActiveTab('log-waste'),
      color: '#28a745'
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Connect Banking',
      description: 'Link Monzo for transaction verification',
      action: () => setActiveTab('monzo'),
      color: '#ed4c4c'
    },
    {
      icon: <History size={24} />,
      title: 'View History',
      description: 'See all your transactions',
      action: () => setActiveTab('history'),
      color: '#17a2b8'
    }
  ];

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>
        <Zap size={20} style={{ color: '#ed4c4c' }} />
        Quick Actions
      </h3>
      
      <div style={actionsStyle}>
        {actions.map((action, index) => (
          <QuickActionButton
            key={index}
            icon={action.icon}
            title={action.title}
            description={action.description}
            onClick={action.action}
            color={action.color}
          />
        ))}
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ 
  icon, 
  title, 
  description, 
  onClick, 
  color 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: isHovered ? `${color}22` : '#111111',
    border: `2px solid ${isHovered ? color : '#333333'}`,
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  };

  const iconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `${color}22`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    flexShrink: 0
  };

  const textStyle: React.CSSProperties = {
    flex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: isHovered ? color : '#ffffff',
    margin: '0 0 4px 0',
    fontFamily: 'Figtree, sans-serif'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#faa09a',
    margin: 0,
    fontFamily: 'Figtree, sans-serif'
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={iconStyle}>{icon}</div>
      <div style={textStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>
    </button>
  );
}

// Status Badge Component
function StatusBadge({ 
  icon, 
  label, 
  status 
}: { 
  icon: React.ReactNode; 
  label: string; 
  status: 'connected' | 'disconnected';
}) {
  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'Figtree, sans-serif',
    background: status === 'connected' ? '#28a74522' : '#dc354522',
    color: status === 'connected' ? '#28a745' : '#dc3545',
    border: `1px solid ${status === 'connected' ? '#28a745' : '#dc3545'}33`
  };

  const StatusIcon = status === 'connected' ? CheckCircle : XCircle;

  return (
    <div style={badgeStyle}>
      {icon}
      <span>{label}</span>
      <StatusIcon size={12} />
    </div>
  );
}

// Helper Functions
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}