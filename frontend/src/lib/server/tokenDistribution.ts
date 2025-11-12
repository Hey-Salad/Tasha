// lib/server/tokenDistribution.ts
// Server-side token distribution using admin account
// SERVER-ONLY MODULE - Do not import in client code

import 'server-only';
import { createClient, type PolkadotSigner } from 'polkadot-api';
import { getWsProvider } from '@polkadot-api/ws-provider/node';
import { assetHubPolkadot, assetHubWestend } from '@polkadot-api/descriptors';
import { MultiAddress } from '@polkadot-api/descriptors';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { DEV_PHRASE, entropyToMiniSecret, mnemonicToEntropy } from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { createSignerFromKeyfile } from './accountImport';

const ASSET_HUB_CONFIG = {
  ASSET_ID: 2024,
  DECIMALS: 12,
  EMISSION_RATES: {
    donation: 0.15,
    'efficient-delivery': 0.1,
    'used-before-expiry': 0.12
  }
};

type WasteType = 'donation' | 'efficient-delivery' | 'used-before-expiry';

interface DistributeTokensParams {
  recipientAddress: string;
  wasteAmount: number;
  wasteType: WasteType;
  description: string;
}

interface DistributeResult {
  success: boolean;
  txHash?: string;
  tokensAmount?: number;
  error?: string;
}

function calculateTokenReward(wasteAmount: number, wasteType: WasteType): bigint {
  const emissionRate = ASSET_HUB_CONFIG.EMISSION_RATES[wasteType];
  const tokensPerGram = emissionRate / 100;
  return BigInt(Math.floor(wasteAmount * tokensPerGram * Math.pow(10, ASSET_HUB_CONFIG.DECIMALS)));
}

let apiClient: any = null;

async function getApiClient() {
  if (apiClient) return apiClient;

  // Use RPC endpoint from environment variable, or default to Polkadot Asset Hub
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'wss://polkadot-asset-hub-rpc.polkadot.io';
  console.log(`🔗 Connecting to: ${rpcEndpoint}`);

  const provider = getWsProvider(rpcEndpoint);
  apiClient = createClient(provider);
  return apiClient;
}

// Get the appropriate descriptor based on RPC endpoint
function getAssetHubDescriptor() {
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'wss://polkadot-asset-hub-rpc.polkadot.io';

  // Check if using Westend or Polkadot
  if (rpcEndpoint.includes('westend')) {
    console.log('📦 Using Westend Asset Hub descriptor');
    return assetHubWestend;
  } else {
    console.log('📦 Using Polkadot Asset Hub descriptor (MAINNET)');
    return assetHubPolkadot;
  }
}

// Create signer from seed phrase using official PAPI helper
function createSignerFromSeed(seedPhrase: string): PolkadotSigner {
  // Convert mnemonic to entropy
  const entropy = mnemonicToEntropy(seedPhrase);

  // Convert to mini secret
  const miniSecret = entropyToMiniSecret(entropy);

  // Create derivation function
  const derive = sr25519CreateDerive(miniSecret);

  // Derive keypair (using empty path for main account)
  const keypair = derive('');

  // Use official PAPI getPolkadotSigner helper
  // This handles all the signing logic correctly including signTx, signBytes, etc.
  const polkadotSigner = getPolkadotSigner(
    keypair.publicKey,
    'Sr25519',
    keypair.sign
  );

  console.log('✅ Polkadot signer created from seed');
  console.log('📝 Public key:', Buffer.from(keypair.publicKey).toString('hex'));

  return polkadotSigner;
}

// Create signer from either keyfile (preferred) or seed phrase (fallback)
async function createAdminSigner(): Promise<PolkadotSigner> {
  // Try keyfile first (preferred method)
  const keyfileJson = process.env.POLKADOT_ADMIN_KEYFILE;
  const password = process.env.POLKADOT_ADMIN_PASSWORD;

  if (keyfileJson && password) {
    console.log('🔐 Using encrypted keyfile for admin account');
    return await createSignerFromKeyfile(keyfileJson, password);
  }

  // Fallback to seed phrase
  const adminSeed = process.env.POLKADOT_ADMIN_SEED;
  if (adminSeed) {
    console.log('🌱 Using seed phrase for admin account');
    return createSignerFromSeed(adminSeed);
  }

  throw new Error('No admin account configured. Please set either POLKADOT_ADMIN_KEYFILE + POLKADOT_ADMIN_PASSWORD or POLKADOT_ADMIN_SEED');
}

export async function distributeTokens(params: DistributeTokensParams): Promise<DistributeResult> {
  try {
    const { recipientAddress, wasteAmount, wasteType, description } = params;

    // Calculate reward
    const tokenAmount = calculateTokenReward(wasteAmount, wasteType);

    if (tokenAmount <= 0n) {
      return { success: false, error: 'Invalid token amount calculated' };
    }

    // Connect to Asset Hub
    const client = await getApiClient();
    const descriptor = getAssetHubDescriptor();
    const api = client.getTypedApi(descriptor);

    // Create admin signer (automatically tries keyfile first, then seed phrase)
    const signer = await createAdminSigner();

    console.log('🏦 Distributing tokens from admin account');
    console.log('📤 To recipient:', recipientAddress);
    console.log('💎 Amount:', Number(tokenAmount) / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS), 'FWT');

    // Check admin account balance first
    let hasBalance = false;
    try {
      // Convert public key bytes to SS58 address format for querying
      const { encodeAddress } = await import('@polkadot/util-crypto');
      const adminAddress = encodeAddress(signer.publicKey, 42); // 42 is Westend prefix

      console.log('🔑 Admin address:', adminAddress);

      const accountInfo = await api.query.System.Account.getValue(adminAddress);
      console.log('💰 Admin account info:', accountInfo);
      if (accountInfo) {
        const balance = accountInfo.data?.free || 0n;
        const wndBalance = Number(balance) / 1e12;
        console.log('💰 Admin WND balance:', wndBalance, 'WND');

        // Check if balance is sufficient (need at least 0.01 WND for fees)
        if (wndBalance < 0.01) {
          return {
            success: false,
            error: `Insufficient WND balance for transaction fees. Admin account has ${wndBalance.toFixed(4)} WND but needs at least 0.01 WND. Please fund the account at https://faucet.polkadot.io/westend?address=${adminAddress}`
          };
        }
        hasBalance = true;
      } else {
        return {
          success: false,
          error: 'Admin account not found on chain. Please fund it first at https://faucet.polkadot.io/westend'
        };
      }
    } catch (e: any) {
      console.log('⚠️ Could not fetch account balance:', e.message);
      // Continue anyway, the transaction will fail if there's no balance
    }

    // Build transfer transaction
    const transferTx = api.tx.Assets.transfer({
      id: ASSET_HUB_CONFIG.ASSET_ID,
      target: MultiAddress.Id(recipientAddress),
      amount: tokenAmount
    });

    console.log('📝 Transaction built, signing and submitting...');

    // Sign and submit
    const result = await transferTx.signAndSubmit(signer);

    if (!result.ok) {
      throw new Error('Transaction failed on-chain');
    }

    console.log('✅ Tokens distributed successfully!');
    console.log('📝 Transaction hash:', result.txHash);

    return {
      success: true,
      txHash: result.txHash,
      tokensAmount: Number(tokenAmount) / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS)
    };

  } catch (error: any) {
    console.error('❌ Token distribution error:', error);

    // Handle specific error types
    let errorMessage = 'Failed to distribute tokens';

    if (error?.error?.type === 'Invalid' && error?.error?.value?.type === 'Payment') {
      errorMessage = 'Insufficient WND balance for transaction fees. Please fund your admin account at https://faucet.polkadot.io/westend';
    } else if (error?.message?.includes('Payment')) {
      errorMessage = 'Transaction fee payment failed. Please ensure admin account has sufficient WND tokens.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function getAdminBalance(): Promise<number> {
  try {
    const client = await getApiClient();
    const descriptor = getAssetHubDescriptor();
    const api = client.getTypedApi(descriptor);

    // Create admin signer (automatically tries keyfile first, then seed phrase)
    const signer = await createAdminSigner();

    const balance = await api.query.Assets.Account.getValue(
      ASSET_HUB_CONFIG.ASSET_ID,
      signer.publicKey
    );

    if (!balance) return 0;

    const rawBalance = typeof balance.balance === 'bigint'
      ? balance.balance
      : BigInt(balance.balance ?? 0);

    return Number(rawBalance) / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS);
  } catch (error) {
    console.error('Error getting admin balance:', error);
    return 0;
  }
}
