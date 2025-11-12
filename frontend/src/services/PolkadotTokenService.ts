// services/PolkadotTokenService.ts
// Asset-Hub integration for Food Waste Token (FWT) minting using PAPI

import { Binary, type Transaction, type TypedApi } from 'polkadot-api';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { assetHubWestend, MultiAddress } from '@polkadot-api/descriptors';

type AssetHubApi = TypedApi<typeof assetHubWestend>;
type GenericTransaction = Transaction<any, string, string, unknown>;
type TxBuilder = (api: AssetHubApi) => GenericTransaction;
type SignAndSendTransaction = (builder: TxBuilder) => Promise<string>;

// Asset-Hub configuration
const ASSET_HUB_CONFIG = {
  ASSET_ID: 2024,
  DECIMALS: 12,
  EMISSION_RATES: {
    donation: 0.15,
    'efficient-delivery': 0.1,
    'used-before-expiry': 0.12
  }
};

export type WasteType = 'donation' | 'efficient-delivery' | 'used-before-expiry';

export interface TokenMintResult {
  success: boolean;
  txHash?: string;
  tokensAmount?: number;
  error?: string;
}

export interface WasteReductionClaim {
  amount: number;
  type: WasteType;
  description: string;
  timestamp: string;
  confidence?: number;
}

class PolkadotTokenService {
  private api: AssetHubApi | null = null;

  constructor(api: AssetHubApi | null = null) {
    this.api = api;
  }

  private ensureApi(): AssetHubApi {
    if (!this.api) {
      throw new Error('API not connected');
    }
    return this.api;
  }

  calculateTokenReward(wasteAmount: number, wasteType: WasteType): number {
    const emissionRate = ASSET_HUB_CONFIG.EMISSION_RATES[wasteType];
    const tokensPerGram = emissionRate / 100;
    return Math.floor(wasteAmount * tokensPerGram * Math.pow(10, ASSET_HUB_CONFIG.DECIMALS));
  }

  async createFWTAsset(
    account: InjectedAccountWithMeta,
    signAndSend: SignAndSendTransaction
  ): Promise<TokenMintResult> {
    try {
      this.ensureApi();

      // Create asset
      const createTxHash = await signAndSend((api) =>
        api.tx.Assets.create({
          id: ASSET_HUB_CONFIG.ASSET_ID,
          admin: MultiAddress.Id(account.address),
          min_balance: 1n
        })
      );

      console.log('Asset created:', createTxHash);

      // Wait a bit for transaction to be included
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Set metadata in separate transaction
      const metadataTxHash = await signAndSend((api) =>
        api.tx.Assets.set_metadata({
          id: ASSET_HUB_CONFIG.ASSET_ID,
          name: Binary.fromText('Food Waste Token'),
          symbol: Binary.fromText('FWT'),
          decimals: ASSET_HUB_CONFIG.DECIMALS
        })
      );

      console.log('Metadata set:', metadataTxHash);

      return { success: true, txHash: metadataTxHash, tokensAmount: 0 };
    } catch (error) {
      console.error('Error creating FWT asset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create asset'
      };
    }
  }

  async mintTokens(
    claim: WasteReductionClaim,
    account: InjectedAccountWithMeta,
    signAndSend: SignAndSendTransaction
  ): Promise<TokenMintResult> {
    try {
      const api = this.ensureApi();
      const tokenAmount = this.calculateTokenReward(claim.amount, claim.type);

      if (tokenAmount <= 0) {
        return { success: false, error: 'Invalid token amount calculated' };
      }

      const mintTxHash = await signAndSend((apiInstance) =>
        apiInstance.tx.Assets.mint({
          id: ASSET_HUB_CONFIG.ASSET_ID,
          beneficiary: MultiAddress.Id(account.address),
          amount: BigInt(tokenAmount)
        })
      );

      return {
        success: true,
        txHash: mintTxHash,
        tokensAmount: tokenAmount / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint tokens'
      };
    }
  }

  async getTokenBalance(accountAddress: string): Promise<number> {
    try {
      const api = this.ensureApi();
      // Assets.Account.getValue expects two separate arguments, not an object
      const balance = await api.query.Assets.Account.getValue(
        ASSET_HUB_CONFIG.ASSET_ID,
        accountAddress
      );

      if (!balance) {
        console.log('No balance found for asset', ASSET_HUB_CONFIG.ASSET_ID, 'and account', accountAddress);
        return 0;
      }

      const rawBalance = typeof balance.balance === 'bigint' ? balance.balance : BigInt(balance.balance ?? 0);
      const humanReadable = Number(rawBalance) / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS);
      console.log('📊 FWT Balance:', humanReadable, 'FWT');
      return humanReadable;
    } catch (error) {
      console.error('❌ Error getting token balance:', error);
      // If the error is because the account doesn't have this asset yet, return 0
      if (error instanceof Error && error.message.includes('Invalid Arguments')) {
        console.log('Account does not hold this asset yet');
        return 0;
      }
      return 0;
    }
  }

  async getAssetMetadata(): Promise<any> {
    try {
      const api = this.ensureApi();
      const metadata = await api.query.Assets.Metadata.getValue(ASSET_HUB_CONFIG.ASSET_ID);
      return metadata ?? null;
    } catch (error) {
      console.error('Error getting asset metadata:', error);
      return null;
    }
  }

  async assetExists(): Promise<boolean> {
    try {
      const api = this.ensureApi();
      const asset = await api.query.Assets.Asset.getValue(ASSET_HUB_CONFIG.ASSET_ID);
      return asset !== null;
    } catch (error) {
      console.error('Error checking asset existence:', error);
      return false;
    }
  }

  async transferTokens(
    recipient: string,
    amount: number,
    account: InjectedAccountWithMeta,
    signAndSend: SignAndSendTransaction
  ): Promise<TokenMintResult> {
    try {
      this.ensureApi();
      const transferAmount = Math.floor(amount * Math.pow(10, ASSET_HUB_CONFIG.DECIMALS));

      const txHash = await signAndSend((apiInstance) =>
        apiInstance.tx.Assets.transfer({
          id: ASSET_HUB_CONFIG.ASSET_ID,
          target: MultiAddress.Id(recipient),
          amount: BigInt(transferAmount)
        })
      );

      return {
        success: true,
        txHash,
        tokensAmount: amount
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer tokens'
      };
    }
  }
}

export { PolkadotTokenService, ASSET_HUB_CONFIG };
export default PolkadotTokenService;
