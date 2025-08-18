import React from 'react';
import { Account } from '../types/index';

type WalletConnectionProps = {
  isConnected: boolean;
  isConnecting: boolean;
  selectedAccount: Account | null | undefined;
  tokenBalance: string;
  connectWallet: () => Promise<void>;
};

const WalletConnectionButton: React.FC<WalletConnectionProps> = ({
  isConnected,
  isConnecting,
  selectedAccount,
  tokenBalance,
  connectWallet
}) => {
  if (isConnected && selectedAccount) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '8px 16px',
        backgroundColor: 'rgba(237,76,76,0.1)',
        borderRadius: '30px',
        border: '1px solid #ed4c4c'
      }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#ed4c4c', 
          borderRadius: '50%',
          marginRight: '8px'
        }}></div>
        <span style={{ marginRight: '10px', fontSize: '0.9rem', color: '#ffffff' }}>
          {selectedAccount.meta.name || `${selectedAccount.address.slice(0, 8)}...`}
        </span>
        <span style={{ 
          backgroundColor: '#ed4c4c', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {tokenBalance} FWT
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      style={{
        backgroundColor: '#ed4c4c',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        border: 'none',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold'
      }}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};

export default WalletConnectionButton;