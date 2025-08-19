"use client"

import React, { useState, useEffect } from 'react';

// Import Components
import Sidebar from '../components/Sidebar';
import WalletConnectionButton from '../components/WalletConnectionButton';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import WasteForm from '../components/LogWaste/WasteForm';
import TransactionHistory from '../components/TransactionHistory';
import MonzoConnection from '../components/MonzoConnection';

// Import Types
import { 
  Account, 
  Transaction, 
  WasteType 
} from '../types/index';

// Import Monzo Hook
import { useMonzo } from '../hooks/useMonzo';

// Mock services (to be replaced with actual implementations)
class MockTokenService {
  async connect() {
    return "0xb190...38c5";
  }
  
  async getTokenBalance() {
    return "1000000";
  }
  
  async logWasteReduction(amount: number, type: WasteType) {
    return true;
  }
}

class MockAIService {
  async verifyFoodWasteReduction(description: string, amount: number) {
    return {
      isVerified: true,
      feedback: "Verification successful"
    };
  }
}

interface MonzoTokens {
  access_token: string;
  user_id: string;
  expires_in: number;
}

export default function Page() {
  // State variables for wallet/blockchain
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenService, setTokenService] = useState<MockTokenService | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Mobile UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // State variables for AI functionality
  const [aiService, setAiService] = useState<MockAIService | null>(null);
  
  // Monzo integration state
  const [monzoConnected, setMonzoConnected] = useState(false);
  const [monzoTokens, setMonzoTokens] = useState<MonzoTokens | null>(null);
  
  // Monzo hook
  const { 
    isConnected: monzoIsConnected, 
    matchWasteReduction, 
    getFoodTransactions 
  } = useMonzo();
  
  // Mock transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      date: '2025-04-15', 
      type: 'donation', 
      amount: 2500, 
      tokens: 25, 
      status: 'confirmed' 
    },
    { 
      date: '2025-04-12', 
      type: 'used-before-expiry', 
      amount: 750, 
      tokens: 7.5, 
      status: 'confirmed' 
    },
    { 
      date: '2025-04-08', 
      type: 'efficient-delivery', 
      amount: 1800, 
      tokens: 18, 
      status: 'confirmed' 
    }
  ]);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize services
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokenService(new MockTokenService());
      setAiService(new MockAIService());
    }
  }, []);
  
  // Handle Monzo connection status change
  const handleMonzoConnectionChange = (connected: boolean, tokens?: MonzoTokens) => {
    setMonzoConnected(connected);
    setMonzoTokens(tokens || null);
    
    if (connected) {
      console.log('Monzo connected successfully!');
    } else {
      console.log('Monzo disconnected');
    }
  };
  
  // Connect to wallet
  const connectWallet = async () => {
    if (!tokenService) return;
    
    setIsConnecting(true);
    
    try {
      const address = await tokenService.connect();
      
      if (address) {
        const connectedAccount: Account = {
          address: address,
          meta: {
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            source: 'wallet'
          }
        };
        
        setSelectedAccount(connectedAccount);
        setIsConnected(true);
        
        // Fetch token balance
        refreshBalance();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Please make sure you have MetaMask installed and connected to Asset-Hub Westend Testnet");
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Refresh token balance
  const refreshBalance = async () => {
    if (!tokenService) return;
    
    try {
      const balance = await tokenService.getTokenBalance();
      setTokenBalance(balance);
    } catch (error) {
      console.error("Error refreshing balance:", error);
    }
  };

  // Enhanced function to log waste reduction with Monzo verification
  const logWasteReduction = async (
    amount: number, 
    type: WasteType, 
    description: string
  ): Promise<void> => {
    if (!selectedAccount || !tokenService || !aiService) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      let verificationDetails = {
        aiVerified: false,
        monzoMatched: false,
        confidence: 0.5,
        monzoTransactions: [] as any[]
      };

      // AI Verification
      const aiVerification = await aiService.verifyFoodWasteReduction(
        description, 
        amount
      );
      
      if (!aiVerification.isVerified) {
        alert('AI Verification Failed: ' + aiVerification.feedback);
        return;
      }
      
      verificationDetails.aiVerified = true;
      verificationDetails.confidence = 0.7; // Base confidence for AI verification

      // Monzo Verification (if connected)
      if (monzoConnected && monzoTokens) {
        try {
          const matchResult = await matchWasteReduction(
            new Date().toISOString().split('T')[0],
            description
          );
          
          if (matchResult.potentialMatches.length > 0) {
            verificationDetails.monzoMatched = true;
            verificationDetails.monzoTransactions = matchResult.potentialMatches;
            verificationDetails.confidence = Math.max(verificationDetails.confidence, matchResult.confidence);
            
            console.log('Monzo verification found matching transactions:', matchResult);
          }
        } catch (monzoError) {
          console.error('Monzo verification failed:', monzoError);
          // Continue without Monzo verification
        }
      }
      
      const success = await tokenService.logWasteReduction(amount, type);
      
      if (success) {
        // Calculate bonus tokens based on verification confidence
        const baseTokens = amount / 100;
        const bonusMultiplier = verificationDetails.monzoMatched ? 1.5 : 1.0;
        const finalTokens = baseTokens * bonusMultiplier;
        
        let alertMessage = `Successfully logged ${amount}g of food waste reduction!\n`;
        alertMessage += `Earned ${finalTokens.toFixed(1)} FWT tokens`;
        
        if (verificationDetails.monzoMatched) {
          alertMessage += `\n🎉 Bonus! Monzo verification found ${verificationDetails.monzoTransactions.length} matching transaction(s)`;
        }
        
        if (verificationDetails.confidence > 0.8) {
          alertMessage += `\n✅ High confidence verification (${Math.round(verificationDetails.confidence * 100)}%)`;
        }
        
        alert(alertMessage);
        
        // Add to transaction history
        const newTransaction: Transaction = {
          date: new Date().toISOString().split('T')[0],
          type: type,
          amount: amount,
          tokens: finalTokens,
          status: 'confirmed'
        };
        setTransactions([newTransaction, ...transactions]);
        
        refreshBalance();
      }
    } catch (error) {
      console.error("Error logging waste reduction:", error);
      alert("Transaction failed. Please check your wallet has sufficient WND for gas.");
    }
  };

  // Get the total waste reduction
  const getTotalWasteReduction = () => {
    return transactions.reduce((total, tx) => total + tx.amount, 0);
  };

  // Mobile menu toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when tab changes on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Get page title
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'log-waste': return 'Log Waste Reduction';
      case 'history': return 'Transaction History';
      case 'monzo': return 'Banking Integration';
      default: return 'Dashboard';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#000000',
      position: 'relative'
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? '0' : '-220px') : '0',
        top: 0,
        height: '100vh',
        transition: 'left 0.3s ease',
        zIndex: 999
      }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
        />
      </div>
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        padding: isMobile ? '10px 15px' : '20px 30px', 
        overflow: 'auto', 
        color: '#ffffff',
        marginLeft: isMobile ? '0' : '0'
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '10px 0'
          }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              ☰
            </button>
            <h1 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: 0,
              textAlign: 'center',
              flex: 1
            }}>
              HeySalad 🥗
            </h1>
            <div style={{ width: '34px' }} /> {/* Spacer for centering */}
          </div>
        )}

        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '15px' : '0',
          padding: '10px 0 20px 0',
          borderBottom: '1px solid #333333',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.25rem' : '1.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: 0
          }}>
            {getPageTitle()}
          </h2>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto'
          }}>
            {/* Monzo Connection Status */}
            {monzoConnected && (
              <div style={{ 
                padding: '5px 10px', 
                backgroundColor: '#28a745', 
                borderRadius: '4px', 
                fontSize: isMobile ? '11px' : '12px',
                color: 'white',
                whiteSpace: 'nowrap'
              }}>
                💳 Monzo Connected
              </div>
            )}
            
            <div style={{ 
              width: isMobile ? '100%' : 'auto'
            }}>
              <WalletConnectionButton 
                isConnected={isConnected}
                isConnecting={isConnecting}
                selectedAccount={selectedAccount}
                tokenBalance={tokenBalance}
                connectWallet={connectWallet}
              />
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div style={{
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <StatsCards 
                tokenBalance={tokenBalance} 
                getTotalWasteReduction={getTotalWasteReduction} 
              />
              
              <RecentTransactions 
                transactions={transactions}
                setActiveTab={setActiveTab}
              />
              
              {/* Quick Monzo Stats */}
              {monzoConnected && (
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: isMobile ? '15px' : '20px',
                  marginTop: '20px'
                }}>
                  <h3 style={{ 
                    marginBottom: '10px',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    🏦 Banking Integration Status
                  </h3>
                  <p style={{ 
                    color: '#28a745', 
                    margin: 0,
                    fontSize: isMobile ? '14px' : '16px'
                  }}>
                    ✅ Monzo account connected - Enhanced verification enabled
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Log Waste Tab */}
          {activeTab === 'log-waste' && (
            <div>
              <WasteForm 
                isConnected={isConnected}
                logWasteReduction={logWasteReduction}
              />
              
              {/* Monzo Integration Notice */}
              {!monzoConnected && (
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: isMobile ? '15px' : '20px',
                  marginTop: '20px',
                  color: '#ffc107'
                }}>
                  <h4 style={{ 
                    margin: '0 0 10px 0',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    💡 Tip: Connect your Monzo account for enhanced verification
                  </h4>
                  <p style={{ 
                    margin: '10px 0', 
                    fontSize: isMobile ? '13px' : '14px',
                    lineHeight: '1.4'
                  }}>
                    Linking your Monzo account allows us to verify your food purchases and provide bonus tokens for verified waste reduction activities.
                  </p>
                  <button 
                    onClick={() => handleTabChange('monzo')}
                    style={{
                      padding: isMobile ? '8px 12px' : '8px 16px',
                      backgroundColor: '#ffc107',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: isMobile ? '13px' : '14px',
                      marginTop: '5px'
                    }}
                  >
                    Connect Monzo
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <TransactionHistory 
              transactions={transactions} 
            />
          )}
          
          {/* Monzo Tab */}
          {activeTab === 'monzo' && (
            <div>
              <div style={{ 
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  marginBottom: '10px',
                  fontSize: isMobile ? '18px' : '20px'
                }}>
                  🏦 Banking Integration
                </h3>
                <p style={{ 
                  color: '#888',
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: '1.5'
                }}>
                  Connect your Monzo account to enable automatic verification of food purchases 
                  and earn bonus tokens for verified waste reduction activities.
                </p>
              </div>
              
              <MonzoConnection 
                onConnectionStatusChange={handleMonzoConnectionChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}