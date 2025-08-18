"use client"

import React, { useState, useEffect } from 'react';

// Import Components
import Sidebar from '../components/Sidebar';
import WalletConnectionButton from '../components/WalletConnectionButton';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import WasteForm from '../components/LogWaste/WasteForm';
import TransactionHistory from '../components/TransactionHistory';

// Import Types
import { 
  Account, 
  Transaction, 
  WasteType 
} from '../types/index';

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

export default function Page() {
  // State variables for wallet/blockchain
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenService, setTokenService] = useState<MockTokenService | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // State variables for AI functionality
  const [aiService, setAiService] = useState<MockAIService | null>(null);
  
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
  
  // Initialize services
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokenService(new MockTokenService());
      setAiService(new MockAIService());
    }
  }, []);
  
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

  // Function to log waste reduction and earn tokens
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
      // First verify with AI
      const verification = await aiService.verifyFoodWasteReduction(
        description, 
        amount
      );
      
      if (!verification.isVerified) {
        alert('AI Verification Failed: ' + verification.feedback);
        return;
      }
      
      const success = await tokenService.logWasteReduction(amount, type);
      
      if (success) {
        alert(`Successfully logged ${amount}g of food waste reduction!`);
        
        // Add to transaction history
        const newTransaction: Transaction = {
          date: new Date().toISOString().split('T')[0],
          type: type,
          amount: amount,
          tokens: amount / 100,
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

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#000000'
    }}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px 30px', overflow: 'auto', color: '#ffffff' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 0 20px 0',
          borderBottom: '1px solid #333333',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'log-waste' && 'Log Waste Reduction'}
            {activeTab === 'history' && 'Transaction History'}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <WalletConnectionButton 
              isConnected={isConnected}
              isConnecting={isConnecting}
              selectedAccount={selectedAccount}
              tokenBalance={tokenBalance}
              connectWallet={connectWallet}
            />
          </div>
        </header>
        
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
          </div>
        )}
        
        {/* Log Waste Tab */}
        {activeTab === 'log-waste' && (
          <WasteForm 
            isConnected={isConnected}
            logWasteReduction={logWasteReduction}
          />
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <TransactionHistory 
            transactions={transactions} 
          />
        )}
      </div>
    </div>
  );
}