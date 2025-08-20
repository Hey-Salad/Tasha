// hooks/usePolkadotWallet.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Dynamic imports for browser-only code
let web3Accounts: any;
let web3Enable: any; 
let web3FromAddress: any;

// Only import in browser environment
if (typeof window !== 'undefined') {
  import('@polkadot/extension-dapp').then((module) => {
    web3Accounts = module.web3Accounts;
    web3Enable = module.web3Enable;
    web3FromAddress = module.web3FromAddress;
  });
}

interface PolkadotWalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // API and accounts
  api: ApiPromise | null;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  
  // Balance and network
  balance: string;
  network: string;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (account: InjectedAccountWithMeta) => void;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signAndSendTransaction: (extrinsic: any) => Promise<string>;
  
  // Persistence
  restoreConnection: () => Promise<void>;
}

const NETWORKS = {
  westend: {
    name: 'Westend Testnet',
    endpoint: 'wss://westend-rpc.polkadot.io',
    symbol: 'WND',
    decimals: 12
  },
  polkadot: {
    name: 'Polkadot Mainnet',
    endpoint: 'wss://rpc.polkadot.io', 
    symbol: 'DOT',
    decimals: 10
  }
};

const STORAGE_KEYS = {
  WALLET_CONNECTED: 'heysalad_wallet_connected',
  SELECTED_ACCOUNT: 'heysalad_selected_account',
  LAST_CONNECTION: 'heysalad_last_connection'
};

export const usePolkadotWallet = (): PolkadotWalletState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  
  const [balance, setBalance] = useState('0');
  const [network] = useState('westend'); // Using Westend testnet for development

  // Initialize API connection
  const initializeApi = useCallback(async () => {
    try {
      const provider = new WsProvider(NETWORKS[network as keyof typeof NETWORKS].endpoint);
      const apiInstance = await ApiPromise.create({ provider });
      setApi(apiInstance);
      return apiInstance;
    } catch (err) {
      console.error('Failed to initialize Polkadot API:', err);
      setError('Failed to connect to Polkadot network');
      return null;
    }
  }, [network]);

  // Save connection state to localStorage
  const saveConnectionState = useCallback((account: InjectedAccountWithMeta) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, JSON.stringify({
        address: account.address,
        name: account.meta.name
      }));
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECTION, Date.now().toString());
    }
  }, []);

  // Clear connection state from localStorage
  const clearConnectionState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT);
      localStorage.removeItem(STORAGE_KEYS.LAST_CONNECTION);
    }
  }, []);

  // Restore connection from localStorage
  const restoreConnection = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED);
    const lastConnection = localStorage.getItem(STORAGE_KEYS.LAST_CONNECTION);
    
    // Auto-reconnect if connected within last 24 hours
    if (wasConnected === 'true' && lastConnection) {
      const timeDiff = Date.now() - parseInt(lastConnection);
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDayMs) {
        try {
          await connectWallet();
        } catch (err) {
          console.log('Auto-reconnect failed:', err);
          clearConnectionState();
        }
      }
    }
  }, []);

  // Connect to wallet extensions
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection requires browser environment');
      }

      // Ensure polkadot extension functions are loaded
      if (!web3Enable || !web3Accounts || !web3FromAddress) {
        const module = await import('@polkadot/extension-dapp');
        web3Enable = module.web3Enable;
        web3Accounts = module.web3Accounts;
        web3FromAddress = module.web3FromAddress;
      }

      // Enable web3 extensions
      const extensions = await web3Enable('HeySalad Tasha');
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot wallet extensions found. Please install Polkadot{.js}, Talisman, or SubWallet.');
      }

      console.log('Found wallet extensions:', extensions.map((ext: any) => ext.name));

      // Get all accounts from all extensions
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet extension.');
      }

      console.log('Found accounts:', allAccounts.length);

      // Initialize API if not already done
      let apiInstance = api;
      if (!apiInstance) {
        apiInstance = await initializeApi();
        if (!apiInstance) {
          throw new Error('Failed to connect to Polkadot network');
        }
      }

      // Check for previously selected account
      const savedAccount = localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT);
      let accountToSelect = allAccounts[0];
      
      if (savedAccount) {
        try {
          const parsed = JSON.parse(savedAccount);
          const found = allAccounts.find((acc: any) => acc.address === parsed.address);
          if (found) accountToSelect = found;
        } catch (err) {
          console.log('Could not restore previous account selection');
        }
      }

      // Set accounts and select account
      setAccounts(allAccounts);
      setSelectedAccount(accountToSelect);
      setIsConnected(true);

      // Save connection state
      saveConnectionState(accountToSelect);

      // Get balance for selected account
      await refreshBalanceForAccount(accountToSelect, apiInstance);

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [api, initializeApi, saveConnectionState]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    setSelectedAccount(null);
    setBalance('0');
    setError(null);
    clearConnectionState();
  }, [clearConnectionState]);

  // Select specific account
  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    saveConnectionState(account);
    if (api) {
      refreshBalanceForAccount(account, api);
    }
  }, [api, saveConnectionState]);

  // Refresh balance for specific account
  const refreshBalanceForAccount = async (account: InjectedAccountWithMeta, apiInstance: ApiPromise) => {
    try {
      const accountInfo = await apiInstance.query.system.account(account.address);
      
      // Handle the account info properly - it's a codec that needs to be converted
      const accountData = accountInfo.toJSON() as any;
      const balance = accountData.data?.free || accountData.free || '0';
      
      // Convert from planck to human readable
      const decimals = NETWORKS[network as keyof typeof NETWORKS].decimals;
      const balanceNumber = typeof balance === 'string' ? parseInt(balance) : balance;
      const balanceInTokens = (balanceNumber / Math.pow(10, decimals)).toFixed(4);
      
      setBalance(balanceInTokens);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance('0');
    }
  };

  // Refresh balance for selected account
  const refreshBalance = useCallback(async () => {
    if (selectedAccount && api) {
      await refreshBalanceForAccount(selectedAccount, api);
    }
  }, [selectedAccount, api, network]);

  // Sign a message (for authentication/verification)
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!selectedAccount) {
      throw new Error('No account selected');
    }

    try {
      // Ensure web3FromAddress is loaded
      if (!web3FromAddress) {
        const module = await import('@polkadot/extension-dapp');
        web3FromAddress = module.web3FromAddress;
      }

      const injector = await web3FromAddress(selectedAccount.address);
      
      if (!injector.signer.signRaw) {
        throw new Error('Wallet does not support message signing');
      }

      const { signature } = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: message,
        type: 'bytes'
      });

      return signature;
    } catch (err: any) {
      throw new Error(`Message signing failed: ${err.message}`);
    }
  }, [selectedAccount]);

  // Sign and send transaction
  const signAndSendTransaction = useCallback(async (extrinsic: any): Promise<string> => {
    if (!selectedAccount || !api) {
      throw new Error('No account selected or API not connected');
    }

    try {
      // Ensure web3FromAddress is loaded
      if (!web3FromAddress) {
        const module = await import('@polkadot/extension-dapp');
        web3FromAddress = module.web3FromAddress;
      }

      const injector = await web3FromAddress(selectedAccount.address);
      
      return new Promise((resolve, reject) => {
        extrinsic
          .signAndSend(selectedAccount.address, { signer: injector.signer }, (result: any) => {
            if (result.status.isInBlock) {
              console.log('Transaction included in block:', result.status.asInBlock.toString());
              resolve(result.status.asInBlock.toString());
            } else if (result.status.isFinalized) {
              console.log('Transaction finalized:', result.status.asFinalized.toString());
            } else if (result.isError) {
              reject(new Error('Transaction failed'));
            }
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    } catch (err: any) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  }, [selectedAccount, api]);

  // Initialize API on mount
  useEffect(() => {
    initializeApi();
  }, [initializeApi]);

  // Auto-restore connection on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      restoreConnection();
    }, 100); // Small delay to ensure page is ready

    return () => clearTimeout(timer);
  }, [restoreConnection]);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (isConnected && selectedAccount) {
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, selectedAccount, refreshBalance]);

  return {
    isConnected,
    isConnecting,
    error,
    api,
    accounts,
    selectedAccount,
    balance,
    network: NETWORKS[network as keyof typeof NETWORKS].name,
    connectWallet,
    disconnectWallet,
    selectAccount,
    refreshBalance,
    signMessage,
    signAndSendTransaction,
    restoreConnection
  };
};