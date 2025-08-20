// components/WalletConnection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, RefreshCw, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface WalletConnectionProps {
  className?: string;
}

export default function WalletConnection({ className = '' }: WalletConnectionProps) {
  const [isClient, setIsClient] = useState(false);
  
  const {
    isConnected,
    isConnecting,
    error,
    accounts,
    selectedAccount,
    balance,
    network,
    connectWallet,
    disconnectWallet,
    selectAccount,
    refreshBalance
  } = usePolkadotWallet();

  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className={className} style={{
        background: '#000000',
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid #333333',
        boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)',
        fontFamily: 'Figtree, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <div style={{ color: '#faa09a', textAlign: 'center' }}>
          Loading wallet interface...
        </div>
      </div>
    );
  }

  const handleCopyAddress = async () => {
    if (selectedAccount) {
      try {
        await navigator.clipboard.writeText(selectedAccount.address);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const containerStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '20px',
    padding: '24px',
    border: '2px solid #333333',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)',
    fontFamily: 'Figtree, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Grandstander, cursive'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const disconnectButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
    border: '2px solid #dc3545'
  };

  const accountSelectorStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '16px'
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#111111',
    border: '2px solid #333333',
    borderRadius: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    marginTop: '4px'
  };

  const accountItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #333333',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const balanceContainerStyle: React.CSSProperties = {
    background: 'rgba(237, 76, 76, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  };

  const errorStyle: React.CSSProperties = {
    background: 'rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #dc3545'
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className={className} style={containerStyle}>
        <div style={headerStyle}>
          <Wallet size={20} style={{ color: '#ed4c4c' }} />
          <h3 style={titleStyle}>Connect Polkadot Wallet</h3>
        </div>

        {error && (
          <div style={errorStyle}>
            <strong>Connection Error:</strong> {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#faa09a', fontSize: '14px', margin: '0 0 12px 0' }}>
            Connect your Polkadot wallet to start earning tokens for food waste reduction.
          </p>
          <p style={{ color: '#666666', fontSize: '12px', margin: 0 }}>
            Supported: Polkadot{'{.js}'}, Talisman, SubWallet
          </p>
        </div>

        <button
          style={buttonStyle}
          onClick={connectWallet}
          disabled={isConnecting}
          onMouseEnter={(e) => {
            if (!isConnecting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnecting) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
            }
          }}
        >
          {isConnecting ? (
            <>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={16} />
              Connect Wallet
            </>
          )}
        </button>
      </div>
    );
  }

  // Connected state
  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <CheckCircle size={20} style={{ color: '#28a745' }} />
        <h3 style={titleStyle}>Wallet Connected</h3>
      </div>

      {/* Account Selector */}
      {accounts.length > 1 && (
        <div style={accountSelectorStyle}>
          <label style={{ color: '#faa09a', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Select Account:
          </label>
          <button
            style={{
              ...buttonStyle,
              background: '#333333',
              color: '#ffffff',
              width: '100%',
              justifyContent: 'space-between'
            }}
            onClick={() => setShowAccountSelector(!showAccountSelector)}
          >
            <span>{selectedAccount?.meta.name || 'Unknown Account'}</span>
            <ChevronDown size={16} />
          </button>

          {showAccountSelector && (
            <div style={dropdownStyle}>
              {accounts.map((account, index) => (
                <div
                  key={account.address}
                  style={accountItemStyle}
                  onClick={() => {
                    selectAccount(account);
                    setShowAccountSelector(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(237, 76, 76, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
                    {account.meta.name || `Account ${index + 1}`}
                  </div>
                  <div style={{ color: '#666666', fontSize: '12px', fontFamily: 'monospace' }}>
                    {formatAddress(account.address)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Balance Display */}
      <div style={balanceContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: '#ed4c4c', fontSize: '14px', fontWeight: '600' }}>
            Balance
          </span>
          <button
            onClick={refreshBalance}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ed4c4c',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {balance} WND
        </div>
        <div style={{ color: '#faa09a', fontSize: '12px' }}>
          {network}
        </div>
      </div>

      {/* Account Info */}
      {selectedAccount && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: '#faa09a', fontSize: '12px' }}>Account:</span>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
              {selectedAccount.meta.name || 'Unknown'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{ 
                color: '#666666', 
                fontSize: '12px', 
                fontFamily: 'monospace',
                background: '#222222',
                padding: '4px 8px',
                borderRadius: '6px',
                flex: 1
              }}
            >
              {formatAddress(selectedAccount.address)}
            </span>
            <button
              onClick={handleCopyAddress}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedAddress ? '#28a745' : '#ed4c4c',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Copy address"
            >
              {copiedAddress ? <CheckCircle size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Disconnect Button */}
      <button
        style={disconnectButtonStyle}
        onClick={disconnectWallet}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <XCircle size={16} />
        Disconnect Wallet
      </button>
    </div>
  );
}