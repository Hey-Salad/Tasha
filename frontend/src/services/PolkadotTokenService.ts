// services/PolkadotTokenService.ts
// Asset-Hub integration for Food Waste Token (FWT) minting

import { ApiPromise } from '@polkadot/api';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Asset-Hub configuration
const ASSET_HUB_CONFIG = {
  // Food Waste Token Asset ID (you'll need to create this)
  ASSET_ID: 2024,
  
  // Token decimals
  DECIMALS: 12,
  
  // Emission rates for different waste types (tokens per 100g)
  EMISSION_RATES: {
    'donation': 0.15,
    'efficient-delivery': 0.10,
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
  amount: number; // in grams
  type: WasteType;
  description: string;
  timestamp: string;
  confidence?: number;
}

class PolkadotTokenService {
  private api: ApiPromise | null = null;

  constructor(api: ApiPromise | null = null) {
    this.api = api;
  }

  /**
   * Calculate token reward based on waste amount and type
   */
  calculateTokenReward(wasteAmount: number, wasteType: WasteType): number {
    const emissionRate = ASSET_HUB_CONFIG.EMISSION_RATES[wasteType];
    const tokensPerGram = emissionRate / 100; // Convert per 100g to per gram
    return Math.floor(wasteAmount * tokensPerGram * Math.pow(10, ASSET_HUB_CONFIG.DECIMALS));
  }

  /**
   * Create Asset-Hub asset for Food Waste Tokens (one-time setup)
   */
  async createFWTAsset(
    account: InjectedAccountWithMeta,
    signAndSend: (extrinsic: any) => Promise<string>
  ): Promise<TokenMintResult> {
    if (!this.api) {
      return { success: false, error: 'API not connected' };
    }

    try {
      // Create asset with specific ID
      const createAssetTx = this.api.tx.assets.create(
        ASSET_HUB_CONFIG.ASSET_ID,
        account.address, // Admin
        1 // Min balance (1 unit)
      );

      // Set metadata for the asset
      const setMetadataTx = this.api.tx.assets.setMetadata(
        ASSET_HUB_CONFIG.ASSET_ID,
        'Food Waste Token',
        'FWT',
        ASSET_HUB_CONFIG.DECIMALS
      );

      // Batch the transactions
      const batchTx = this.api.tx.utility.batchAll([createAssetTx, setMetadataTx]);

      const txHash = await signAndSend(batchTx);

      return {
        success: true,
        txHash,
        tokensAmount: 0
      };
    } catch (error) {
      console.error('Error creating FWT asset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create asset'
      };
    }
  }

  /**
   * Mint FWT tokens for verified waste reduction
   */
  async mintTokens(
    claim: WasteReductionClaim,
    account: InjectedAccountWithMeta,
    signAndSend: (extrinsic: any) => Promise<string>
  ): Promise<TokenMintResult> {
    if (!this.api) {
      return { success: false, error: 'API not connected' };
    }

    try {
      // Calculate token amount
      const tokenAmount = this.calculateTokenReward(claim.amount, claim.type);

      if (tokenAmount <= 0) {
        return { success: false, error: 'Invalid token amount calculated' };
      }

      // Create mint transaction
      const mintTx = this.api.tx.assets.mint(
        ASSET_HUB_CONFIG.ASSET_ID,
        account.address,
        tokenAmount
      );

      // Add metadata about the waste reduction claim
      const metadata = JSON.stringify({
        wasteType: claim.type,
        wasteAmount: claim.amount,
        description: claim.description.substring(0, 100), // Limit description length
        timestamp: claim.timestamp,
        confidence: claim.confidence || 1.0
      });

      // Create remark with metadata (optional but useful for tracking)
      const remarkTx = this.api.tx.system.remark(`FWT_MINT:${metadata}`);

      // Batch mint and remark
      const batchTx = this.api.tx.utility.batchAll([mintTx, remarkTx]);

      const txHash = await signAndSend(batchTx);

      return {
        success: true,
        txHash,
        tokensAmount: tokenAmount / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS) // Convert back to human readable
      };
    } catch (error) {
      console.error('Error minting tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint tokens'
      };
    }
  }

  /**
   * Get FWT token balance for an account
   */
  async getTokenBalance(accountAddress: string): Promise<number> {
    if (!this.api) {
      return 0;
    }

    try {
      const balance = await this.api.query.assets.account(
        ASSET_HUB_CONFIG.ASSET_ID,
        accountAddress
      );

      if (balance.isNone) {
        return 0;
      }

      const balanceData = balance.unwrap();
      const balanceAmount = balanceData.balance.toBn();
      
      // Convert from smallest unit to human readable
      return balanceAmount.toNumber() / Math.pow(10, ASSET_HUB_CONFIG.DECIMALS);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  /**
   * Get asset metadata
   */
  async getAssetMetadata(): Promise<any> {
    if (!this.api) {
      return null;
    }

    try {
      const metadata = await this.api.query.assets.metadata(ASSET_HUB_CONFIG.ASSET_ID);
      return metadata.toJSON();
    } catch (error) {
      console.error('Error getting asset metadata:', error);
      return null;
    }
  }

  /**
   * Check if FWT asset exists
   */
  async assetExists(): Promise<boolean> {
    if (!this.api) {
      return false;
    }

    try {
      const asset = await this.api.query.assets.asset(ASSET_HUB_CONFIG.ASSET_ID);
      return asset.isSome;
    } catch (error) {
      console.error('Error checking asset existence:', error);
      return false;
    }
  }

  /**
   * Transfer FWT tokens between accounts
   */
  async transferTokens(
    recipient: string,
    amount: number,
    account: InjectedAccountWithMeta,
    signAndSend: (extrinsic: any) => Promise<string>
  ): Promise<TokenMintResult> {
    if (!this.api) {
      return { success: false, error: 'API not connected' };
    }

    try {
      // Convert to smallest unit
      const transferAmount = Math.floor(amount * Math.pow(10, ASSET_HUB_CONFIG.DECIMALS));

      const transferTx = this.api.tx.assets.transfer(
        ASSET_HUB_CONFIG.ASSET_ID,
        recipient,
        transferAmount
      );

      const txHash = await signAndSend(transferTx);

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