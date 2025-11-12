// components/TokenMinting.tsx
// Updated to use Polkadot Asset-Hub instead of Ethereum

'use client';

import React, { useState } from 'react';
import { Coins, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';
import { PolkadotTokenService, type WasteReductionClaim, type WasteType } from '../services/PolkadotTokenService';

interface TokenMintingProps {
  wasteAmount: number; // in grams
  wasteType: WasteType;
  wasteDescription?: string;
  onMintComplete?: (tokenAmount: number, txHash: string) => void;
  className?: string;
}

export default function TokenMinting({ 
  wasteAmount, 
  wasteType, 
  wasteDescription = '',
  onMintComplete,
  className = '' 
}: TokenMintingProps) {
  const { isConnected, selectedAccount, assetHubApi, signAndSendTransaction, refreshBalance } = usePolkadotWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokensEarned, setTokensEarned] = useState<number>(0);
  const [mintingStage, setMintingStage] = useState<string>('');
  const [fwtBalance, setFwtBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Initialize token service
  const tokenService = new PolkadotTokenService(assetHubApi);

  // Calculate tokens to mint based on waste amount and type
  const calculateTokens = () => {
    return tokenService.calculateTokenReward(wasteAmount, wasteType) / Math.pow(10, 12); // Convert to human readable
  };

  const tokenAmount = calculateTokens();

  // Fetch FWT balance when component mounts or account changes
  React.useEffect(() => {
    const fetchBalance = async () => {
      if (selectedAccount && assetHubApi) {
        setIsLoadingBalance(true);
        try {
          const balance = await tokenService.getTokenBalance(selectedAccount.address);
          setFwtBalance(balance);
        } catch (error) {
          console.error('Failed to fetch FWT balance:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [selectedAccount, assetHubApi]);

  // Update balance after successful minting
  const updateBalance = async () => {
    if (selectedAccount && assetHubApi) {
      try {
        const balance = await tokenService.getTokenBalance(selectedAccount.address);
        setFwtBalance(balance);
      } catch (error) {
        console.error('Failed to update FWT balance:', error);
      }
    }
  };

  const handleMintTokens = async () => {
    console.log('🚀🚀🚀 MINT BUTTON CLICKED 🚀🚀🚀');
    console.log('Connected:', isConnected);
    console.log('Account:', selectedAccount?.address);
    console.log('API:', !!assetHubApi);

    if (!isConnected || !selectedAccount || !assetHubApi) {
      console.log('❌ Wallet not connected - stopping');
      setError('Wallet not connected');
      return;
    }

    if (tokenAmount <= 0) {
      console.log('❌ Invalid token amount - stopping');
      setError('Invalid token amount');
      return;
    }

    console.log('✅ Validation passed, starting mint...');
    setIsMinting(true);
    setMintStatus('minting');
    setError(null);
    setTxHash(null);
    setMintingStage('Checking asset...');

    try {
      console.log('🔍 Checking if asset exists...');
      const assetExists = await tokenService.assetExists();
      console.log('Asset exists:', assetExists);
      
      if (!assetExists) {
        setMintingStage('Creating FWT asset...');

        const createResult = await tokenService.createFWTAsset(
          selectedAccount,
          signAndSendTransaction
        );

        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create FWT asset');
        }

        // Wait a bit for asset creation to be processed
        setMintingStage('Waiting for asset creation...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      setMintingStage('Processing reward...');

      // Call backend API to distribute tokens (no wallet popup needed!)
      const response = await fetch('/api/token/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: selectedAccount.address,
          wasteAmount,
          wasteType,
          description: wasteDescription
        })
      });

      const result = await response.json();

      if (result.success) {
        setMintingStage('Transaction finalized!');
        setTxHash(result.txHash || '');
        setTokensEarned(result.tokensAmount || 0);
        setMintStatus('success');

        // Refresh wallet balance to show updated FWT tokens
        setTimeout(() => {
          refreshBalance();
          updateBalance();
        }, 2000);

        // Call completion callback
        if (onMintComplete && result.txHash) {
          onMintComplete(result.tokensAmount || 0, result.txHash);
        }
      } else {
        throw new Error(result.error || 'Failed to mint tokens');
      }

    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint tokens');
      setMintStatus('error');
      setMintingStage('');
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
          Connect your wallet to mint FWT tokens
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

      {/* Current FWT Balance */}
      <div style={{
        background: 'rgba(237, 76, 76, 0.05)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid rgba(237, 76, 76, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#faa09a', fontSize: '13px', fontWeight: '500' }}>Your FWT Balance:</span>
          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {isLoadingBalance ? (
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            ) : (
              `${fwtBalance.toFixed(6)} FWT`
            )}
          </span>
        </div>
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
          {wasteDescription && (
            <div style={{ color: '#faa09a', fontSize: '12px', marginTop: '8px' }}>
              "{wasteDescription.substring(0, 100)}{wasteDescription.length > 100 ? '...' : ''}"
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(237, 76, 76, 0.3)', paddingTop: '12px' }}>
          <div style={{ color: '#ed4c4c', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
            FWT Tokens to Mint
          </div>
          <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>
            {tokenAmount.toFixed(6)} FWT
          </div>
          <div style={{ color: '#faa09a', fontSize: '12px', marginTop: '4px' }}>
            On Polkadot Asset-Hub (Asset ID: 2024)
          </div>
        </div>
      </div>

      {/* Success Message */}
      {mintStatus === 'success' && txHash && (
        <div style={successBoxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={20} style={{ color: '#28a745' }} />
            <span style={{ color: '#28a745', fontWeight: '700', fontSize: '16px' }}>Tokens Minted Successfully!</span>
          </div>

          <div style={{
            background: 'rgba(40, 167, 69, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ color: '#28a745', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
              You earned:
            </div>
            <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>
              {tokensEarned.toFixed(6)} FWT
            </div>
          </div>

          <div style={{
            background: '#0a0a0a',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            border: '1px solid rgba(40, 167, 69, 0.3)'
          }}>
            <div style={{ color: '#28a745', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
              Transaction Hash:
            </div>
            <div style={{
              color: '#ffffff',
              fontSize: '11px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {txHash}
            </div>
          </div>

          <a
            href={`https://assethub-westend.subscan.io/extrinsic/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
            }}
          >
            🔍 View Transaction on Subscan →
          </a>
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
            {mintingStage || 'Minting Tokens...'}
          </>
        ) : mintStatus === 'success' ? (
          <>
            <CheckCircle size={16} />
            Tokens Minted
          </>
        ) : (
          <>
            <Coins size={16} />
            Mint {tokenAmount.toFixed(6)} FWT
          </>
        )}
      </button>

      {/* Additional Info */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ color: '#666666', fontSize: '12px', margin: 0, marginBottom: '8px' }}>
          Tokens will be added to your wallet balance after block confirmation (~6 seconds)
        </p>
        <p style={{ color: '#faa09a', fontSize: '11px', margin: 0 }}>
          ⚠️ Ensure you have WND testnet tokens for gas fees
        </p>
        <a
          href="https://faucet.polkadot.io/westend"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#ed4c4c',
            fontSize: '11px',
            textDecoration: 'underline',
            cursor: 'pointer',
            display: 'inline-block',
            marginTop: '4px'
          }}
        >
          Get WND from faucet →
        </a>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
