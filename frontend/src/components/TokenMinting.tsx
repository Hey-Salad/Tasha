// components/TokenMinting.tsx
'use client';

import React, { useState } from 'react';
import { Coins, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';

interface TokenMintingProps {
  wasteAmount: number; // in grams
  wasteType: 'donation' | 'efficient-delivery' | 'used-before-expiry';
  onMintComplete?: (tokenAmount: number, txHash: string) => void;
  className?: string;
}

const WASTE_TYPE_MULTIPLIERS = {
  'donation': 0.15, // 15 tokens per 100g
  'efficient-delivery': 0.10, // 10 tokens per 100g  
  'used-before-expiry': 0.12 // 12 tokens per 100g
};

export default function TokenMinting({ 
  wasteAmount, 
  wasteType, 
  onMintComplete,
  className = '' 
}: TokenMintingProps) {
  const { isConnected, selectedAccount, api, signAndSendTransaction } = usePolkadotWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Calculate tokens to mint based on waste amount and type
  const calculateTokens = () => {
    const multiplier = WASTE_TYPE_MULTIPLIERS[wasteType];
    return Math.floor((wasteAmount / 100) * multiplier * 100) / 100; // Round to 2 decimal places
  };

  const tokenAmount = calculateTokens();

  const handleMintTokens = async () => {
    if (!isConnected || !selectedAccount || !api) {
      setError('Wallet not connected');
      return;
    }

    if (tokenAmount <= 0) {
      setError('Invalid token amount');
      return;
    }

    setIsMinting(true);
    setMintStatus('minting');
    setError(null);
    setTxHash(null);

    try {
      // For demo purposes, we'll create a simple balance transfer
      // In production, this would be a call to your custom pallet for minting FWT tokens
      
      // Mock transaction - replace with actual token minting logic
      const mockMintExtrinsic = api.tx.system.remark(`MINT_FWT:${tokenAmount}:${wasteType}:${wasteAmount}`);
      
      // Sign and send transaction
      const blockHash = await signAndSendTransaction(mockMintExtrinsic);
      
      setTxHash(blockHash);
      setMintStatus('success');
      
      // Call completion callback
      if (onMintComplete) {
        onMintComplete(tokenAmount, blockHash);
      }

    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint tokens');
      setMintStatus('error');
    } finally {
      setIsMinting(false);
    }
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
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#666666',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  const infoBoxStyle: React.CSSProperties = {
    background: 'rgba(237, 76, 76, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(237, 76, 76, 0.3)'
  };

  const successBoxStyle: React.CSSProperties = {
    background: 'rgba(40, 167, 69, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(40, 167, 69, 0.3)'
  };

  const errorBoxStyle: React.CSSProperties = {
    background: 'rgba(220, 53, 69, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(220, 53, 69, 0.3)'
  };

  if (!isConnected) {
    return (
      <div className={className} style={containerStyle}>
        <div style={headerStyle}>
          <Coins size={20} style={{ color: '#666666' }} />
          <h3 style={{ ...titleStyle, color: '#666666' }}>Token Minting</h3>
        </div>
        <p style={{ color: '#666666', textAlign: 'center', margin: 0 }}>
          Connect your wallet to mint tokens
        </p>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <Coins size={20} style={{ color: '#ed4c4c' }} />
        <h3 style={titleStyle}>Mint FWT Tokens</h3>
      </div>

      {/* Token Calculation Info */}
      <div style={infoBoxStyle}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#ed4c4c', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            Waste Reduction Details
          </div>
          <div style={{ color: '#ffffff', fontSize: '16px', marginBottom: '4px' }}>
            {wasteAmount}g of {wasteType.replace('-', ' ')}
          </div>
          <div style={{ color: '#faa09a', fontSize: '12px' }}>
            Multiplier: {WASTE_TYPE_MULTIPLIERS[wasteType]}x
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(237, 76, 76, 0.3)', paddingTop: '12px' }}>
          <div style={{ color: '#ed4c4c', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            Tokens to Mint
          </div>
          <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>
            {tokenAmount} FWT
          </div>
        </div>
      </div>

      {/* Success Message */}
      {mintStatus === 'success' && (
        <div style={successBoxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={16} style={{ color: '#28a745' }} />
            <span style={{ color: '#28a745', fontWeight: '600' }}>Tokens Minted Successfully!</span>
          </div>
          <div style={{ color: '#28a745', fontSize: '14px', marginBottom: '8px' }}>
            {tokenAmount} FWT tokens have been minted to your account.
          </div>
          {txHash && (
            <div style={{ color: '#28a745', fontSize: '12px', fontFamily: 'monospace' }}>
              Transaction: {txHash.slice(0, 10)}...{txHash.slice(-10)}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {mintStatus === 'error' && error && (
        <div style={errorBoxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={16} style={{ color: '#dc3545' }} />
            <span style={{ color: '#dc3545', fontWeight: '600' }}>Minting Failed</span>
          </div>
          <div style={{ color: '#dc3545', fontSize: '14px' }}>
            {error}
          </div>
        </div>
      )}

      {/* Mint Button */}
      <button
        style={isMinting || mintStatus === 'success' ? disabledButtonStyle : buttonStyle}
        onClick={handleMintTokens}
        disabled={isMinting || mintStatus === 'success'}
        onMouseEnter={(e) => {
          if (!isMinting && mintStatus !== 'success') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMinting && mintStatus !== 'success') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
          }
        }}
      >
        {isMinting ? (
          <>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Minting Tokens...
          </>
        ) : mintStatus === 'success' ? (
          <>
            <CheckCircle size={16} />
            Tokens Minted
          </>
        ) : (
          <>
            <Coins size={16} />
            Mint {tokenAmount} FWT Tokens
          </>
        )}
      </button>

      {/* Additional Info */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ color: '#666666', fontSize: '12px', margin: 0 }}>
          Tokens will be added to your wallet balance after confirmation
        </p>
      </div>
    </div>
  );
}