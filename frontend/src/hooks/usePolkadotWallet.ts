// hooks/usePolkadotWallet.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { createClient, type Transaction, type TypedApi, type PolkadotClient } from 'polkadot-api';
import { getWsProvider } from '@polkadot-api/ws-provider/web';
import { assetHubWestend, getMetadata } from '@polkadot-api/descriptors';
import { getPolkadotSignerFromPjs } from '@polkadot-api/pjs-signer';

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

type AssetHubApi = TypedApi<typeof assetHubWestend>;
type GenericTransaction = Transaction<any, string, string, unknown>;
type TxBuilder = (api: AssetHubApi) => GenericTransaction;
type TxProgressCallback = (stage: string) => void;

interface PolkadotWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  assetHubApi: AssetHubApi | null;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  balance: string;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (account: InjectedAccountWithMeta) => void;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signAndSendTransaction: (buildTx: TxBuilder, onProgress?: TxProgressCallback) => Promise<string>;
  restoreConnection: () => Promise<void>;
}

const NETWORKS = {
  westend: {
    name: 'Westend Asset Hub',
    endpoint: 'wss://westend-asset-hub-rpc.polkadot.io',
    symbol: 'WND',
    decimals: 12
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
  const [papiClient, setPapiClient] = useState<PolkadotClient | null>(null);
  const [assetHubApi, setAssetHubApi] = useState<AssetHubApi | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState('0');
  const [network] = useState<keyof typeof NETWORKS>('westend');

  const formatBalance = useCallback(
    (value: bigint | number) => {
      const normalized = typeof value === 'bigint' ? Number(value) : value;
      const formatted = normalized / Math.pow(10, NETWORKS[network].decimals);
      return formatted.toFixed(4);
    },
    [network]
  );

  const initializeApi = useCallback(async (): Promise<AssetHubApi | null> => {
    if (assetHubApi) {
      return assetHubApi;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const provider = getWsProvider(NETWORKS[network].endpoint);
      const clientInstance = createClient(provider, { getMetadata });
      const typedApi = clientInstance.getTypedApi(assetHubWestend);
      setPapiClient(clientInstance);
      setAssetHubApi(typedApi);
      return typedApi;
    } catch (err) {
      console.error('Failed to initialize PAPI client:', err);
      setError('Failed to connect to Polkadot network');
      return null;
    }
  }, [assetHubApi, network]);

  const saveConnectionState = useCallback((account: InjectedAccountWithMeta) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_ACCOUNT,
        JSON.stringify({
          address: account.address,
          name: account.meta.name
        })
      );
      localStorage.setItem(STORAGE_KEYS.LAST_CONNECTION, Date.now().toString());
    }
  }, []);

  const clearConnectionState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT);
      localStorage.removeItem(STORAGE_KEYS.LAST_CONNECTION);
    }
  }, []);

  const getPolkadotSigner = useCallback(async (address: string) => {
    console.log('🔵 Getting signer for address:', address);

    if (!web3FromAddress) {
      const module = await import('@polkadot/extension-dapp');
      web3FromAddress = module.web3FromAddress;
    }

    console.log('🔵 Fetching injector...');
    const injector = await web3FromAddress(address);
    console.log('🔵 Injector obtained:', !!injector);

    if (!injector.signer) {
      throw new Error('No signer available in wallet');
    }

    console.log('🔵 Creating PolkadotSigner from PJS...');
    const { getPolkadotSignerFromPjs } = await import('@polkadot-api/pjs-signer');

    if (!injector.signer.signPayload) {
      throw new Error('Wallet does not support signPayload');
    }

    if (!injector.signer.signRaw) {
      throw new Error('Wallet does not support signRaw');
    }

    const signer = getPolkadotSignerFromPjs(address, injector.signer.signPayload, injector.signer.signRaw);
    console.log('🔵 Signer created successfully');

    return signer;
  }, []);

  const refreshBalanceForAccount = useCallback(
    async (account: InjectedAccountWithMeta, apiInstance: AssetHubApi) => {
      try {
        const accountInfo = await apiInstance.query.System.Account.getValue(account.address);
        const freeBalance = accountInfo?.data?.free ?? 0n;
        setBalance(formatBalance(freeBalance));
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance('0');
      }
    },
    [formatBalance]
  );

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection requires browser environment');
      }

      if (!web3Enable || !web3Accounts || !web3FromAddress) {
        const module = await import('@polkadot/extension-dapp');
        web3Enable = module.web3Enable;
        web3Accounts = module.web3Accounts;
        web3FromAddress = module.web3FromAddress;
      }

      const extensions = await web3Enable('HeySalad Tasha');

      if (extensions.length === 0) {
        throw new Error('No Polkadot wallet extensions found. Please install Polkadot{.js}, Talisman, or SubWallet.');
      }

      const allAccounts = await web3Accounts();

      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet extension.');
      }

      const apiInstance = assetHubApi ?? (await initializeApi());
      if (!apiInstance) {
        throw new Error('Failed to connect to Polkadot network');
      }

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

      setAccounts(allAccounts);
      setSelectedAccount(accountToSelect);
      setIsConnected(true);
      saveConnectionState(accountToSelect);
      await refreshBalanceForAccount(accountToSelect, apiInstance);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [assetHubApi, initializeApi, refreshBalanceForAccount, saveConnectionState]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    setSelectedAccount(null);
    setBalance('0');
    setError(null);
    clearConnectionState();
  }, [clearConnectionState]);

  const selectAccount = useCallback(
    (account: InjectedAccountWithMeta) => {
      setSelectedAccount(account);
      saveConnectionState(account);
      if (assetHubApi) {
        refreshBalanceForAccount(account, assetHubApi);
      }
    },
    [assetHubApi, refreshBalanceForAccount, saveConnectionState]
  );

  const refreshBalance = useCallback(async () => {
    if (selectedAccount) {
      const apiInstance = assetHubApi ?? (await initializeApi());
      if (apiInstance) {
        await refreshBalanceForAccount(selectedAccount, apiInstance);
      }
    }
  }, [assetHubApi, initializeApi, refreshBalanceForAccount, selectedAccount]);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!selectedAccount) {
        throw new Error('No account selected');
      }

      try {
        if (!web3FromAddress) {
          const module = await import('@polkadot/extension-dapp');
          web3FromAddress = module.web3FromAddress;
        }

        const injector = await web3FromAddress(selectedAccount.address);

        if (!injector.signer?.signRaw) {
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
    },
    [selectedAccount]
  );

  const signAndSendTransaction = useCallback(
    async (buildTx: TxBuilder, onProgress?: TxProgressCallback): Promise<string> => {
      if (!selectedAccount) {
        throw new Error('No account selected');
      }

      const apiInstance = assetHubApi ?? (await initializeApi());
      if (!apiInstance) {
        throw new Error('Polkadot API not available');
      }

      console.log('🟢 Step 1: Getting signer...');
      onProgress?.('Opening wallet...');

      const signer = await getPolkadotSigner(selectedAccount.address);
      console.log('🟢 Step 2: Building transaction...');

      const transaction = buildTx(apiInstance);
      console.log('🟢 Step 3: Starting signSubmitAndWatch...');

      let txHash: string = '';

      await new Promise<void>((resolve, reject) => {
        console.log('🟢 Step 4: Creating subscription...');
        const unsubscribe = transaction.signSubmitAndWatch(signer, {
          next: (event) => {
            if (event.type === 'broadcasted') {
              onProgress?.('Transaction broadcasting...');
              console.log('✅ Transaction broadcasted');
            } else if (event.type === 'txBestBlocksState') {
              if (event.found && event.ok) {
                txHash = event.txHash;
                onProgress?.('Transaction confirmed!');
                console.log('✅ Transaction in block:', txHash);
                unsubscribe();
                resolve();
              } else if (event.found && !event.ok) {
                unsubscribe();
                reject(new Error('Transaction failed'));
              }
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });

      if (!txHash) {
        throw new Error('No transaction hash received');
      }

      return txHash;
    },
    [assetHubApi, getPolkadotSigner, initializeApi, selectedAccount]
  );

  const restoreConnection = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED);
    const lastConnection = localStorage.getItem(STORAGE_KEYS.LAST_CONNECTION);
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (wasConnected === 'true' && lastConnection) {
      const timeDiff = Date.now() - parseInt(lastConnection, 10);

      if (timeDiff < oneDayMs) {
        try {
          await connectWallet();
        } catch (err) {
          console.log('Auto-reconnect failed:', err);
          clearConnectionState();
        }
      }
    }
  }, [clearConnectionState, connectWallet]);

  useEffect(() => {
    initializeApi();
  }, [initializeApi]);

  useEffect(
    () => () => {
      papiClient?.destroy();
    },
    [papiClient]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      restoreConnection();
    }, 100);

    return () => clearTimeout(timer);
  }, [restoreConnection]);

  useEffect(() => {
    if (isConnected && selectedAccount) {
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, refreshBalance, selectedAccount]);

  return {
    isConnected,
    isConnecting,
    error,
    assetHubApi,
    accounts,
    selectedAccount,
    balance,
    network: NETWORKS[network].name,
    connectWallet,
    disconnectWallet,
    selectAccount,
    refreshBalance,
    signMessage,
    signAndSendTransaction,
    restoreConnection
  };
};
