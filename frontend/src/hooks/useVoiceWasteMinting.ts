import { useState, useEffect, useCallback, useMemo } from 'react';
import { PolkadotTokenService, type WasteReductionClaim } from '../services/PolkadotTokenService';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { TypedApi, Transaction } from 'polkadot-api';
import { assetHubWestend } from '@polkadot-api/descriptors';

type AssetHubApi = TypedApi<typeof assetHubWestend>;
type GenericTransaction = Transaction<any, string, string, unknown>;
type TxBuilder = (api: AssetHubApi) => GenericTransaction;

interface WasteItem {
  itemName: string;
  category: 'expired' | 'spoiled' | 'leftover' | 'preparation' | 'surplus';
  weightGrams: number;
  confidence: number;
}

interface MintingStatus {
  isMinting: boolean;
  wasteItem: WasteItem | null;
  tokensMinted: number;
  transactionHash: string;
  error: string | null;
}

// Common food items and their typical weights
const FOOD_WEIGHT_ESTIMATES: Record<string, number> = {
  'bread': 300,
  'lettuce': 200,
  'tomato': 150,
  'tomatoes': 150,
  'banana': 150,
  'bananas': 150,
  'apple': 200,
  'apples': 200,
  'strawberries': 250,
  'chicken': 400,
  'milk': 1000,
  'cheese': 200,
  'yogurt': 150,
  'spinach': 200,
  'carrots': 150,
  'potatoes': 200,
  'pasta': 250,
  'rice': 250,
  'beef': 400,
  'fish': 300,
  'eggs': 200,
  'orange': 180,
  'oranges': 180,
  'grapes': 200,
  'cucumber': 150,
  'bell pepper': 150,
  'onion': 150,
  'garlic': 50,
};

export function useVoiceWasteMinting(
  assetHubApi: AssetHubApi | null,
  selectedAccount: InjectedAccountWithMeta | null,
  signAndSendTransaction: (builder: TxBuilder) => Promise<string>
) {
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>({
    isMinting: false,
    wasteItem: null,
    tokensMinted: 0,
    transactionHash: '',
    error: null,
  });

  const tokenService = useMemo(() => new PolkadotTokenService(assetHubApi), [assetHubApi]);

  const parseWasteFromMessage = useCallback((message: string): WasteItem | null => {
    const lowerMessage = message.toLowerCase();

    // Keywords that indicate waste logging
    const wasteKeywords = [
      'threw away', 'throw away', 'tossed', 'wasted', 'discarded',
      'spoiled', 'moldy', 'expired', 'rotten', 'bad', 'gone off'
    ];

    const hasWasteKeyword = wasteKeywords.some(keyword => lowerMessage.includes(keyword));
    if (!hasWasteKeyword) {
      return null;
    }

    // Find food item
    let itemName = '';
    let weightGrams = 200; // default

    for (const [food, weight] of Object.entries(FOOD_WEIGHT_ESTIMATES)) {
      if (lowerMessage.includes(food)) {
        itemName = food;
        weightGrams = weight;
        break;
      }
    }

    if (!itemName) {
      return null;
    }

    // Detect category
    let category: WasteItem['category'] = 'spoiled';
    if (lowerMessage.includes('expired') || lowerMessage.includes('past date')) {
      category = 'expired';
    } else if (lowerMessage.includes('leftover') || lowerMessage.includes('didn\'t eat')) {
      category = 'leftover';
    } else if (lowerMessage.includes('moldy') || lowerMessage.includes('rotten')) {
      category = 'spoiled';
    }

    // Adjust weight based on quantity mentions
    if (lowerMessage.includes('half')) {
      weightGrams = Math.floor(weightGrams * 0.5);
    } else if (lowerMessage.includes('bunch') || lowerMessage.includes('bag')) {
      weightGrams = Math.floor(weightGrams * 1.5);
    } else if (lowerMessage.includes('couple') || lowerMessage.includes('two') || lowerMessage.includes('2')) {
      weightGrams = Math.floor(weightGrams * 2);
    } else if (lowerMessage.includes('few') || lowerMessage.includes('several')) {
      weightGrams = Math.floor(weightGrams * 3);
    }

    return {
      itemName,
      category,
      weightGrams,
      confidence: 0.8, // Could be improved with ML
    };
  }, []);

  const mintTokensForWaste = useCallback(async (wasteItem: WasteItem) => {
    if (!selectedAccount || !assetHubApi) {
      setMintingStatus(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }));
      return;
    }

    setMintingStatus({
      isMinting: true,
      wasteItem,
      tokensMinted: 0,
      transactionHash: '',
      error: null,
    });

    try {
      console.log('🪙 Minting tokens for waste item:', {
        item: wasteItem.itemName,
        weight: wasteItem.weightGrams,
        category: wasteItem.category,
      });

      // Create waste reduction claim
      // Map waste item to claim format - using 'donation' type for all voice-logged waste
      const claim: WasteReductionClaim = {
        amount: wasteItem.weightGrams,
        type: 'donation', // Using donation type for voice-logged waste tracking
        description: `Voice logged: ${wasteItem.itemName} (${wasteItem.category})`,
        timestamp: new Date().toISOString(),
        confidence: wasteItem.confidence,
      };

      // Mint tokens using PAPI
      const result = await tokenService.mintTokens(
        claim,
        selectedAccount,
        signAndSendTransaction
      );

      if (result.success) {
        setMintingStatus({
          isMinting: false,
          wasteItem,
          tokensMinted: result.tokensAmount || 0,
          transactionHash: result.txHash || '',
          error: null,
        });

        // Log to backend (optional)
        await logWasteToBackend({
          ...wasteItem,
          userAddress: selectedAccount.address,
          tokensMinted: result.tokensAmount || 0,
          transactionHash: result.txHash || '',
          timestamp: Date.now(),
        });
      } else {
        setMintingStatus({
          isMinting: false,
          wasteItem,
          tokensMinted: 0,
          transactionHash: '',
          error: result.error || 'Minting failed',
        });
      }
    } catch (error) {
      console.error('Minting error:', error);
      setMintingStatus({
        isMinting: false,
        wasteItem,
        tokensMinted: 0,
        transactionHash: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [selectedAccount, assetHubApi, tokenService, signAndSendTransaction]);

  const logWasteToBackend = async (data: any) => {
    try {
      // TODO: Add your backend API call here
      console.log('📊 Logged to backend:', data);
      // await fetch('/api/waste-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
    } catch (error) {
      console.error('Failed to log to backend:', error);
    }
  };

  const processMessage = useCallback((message: string, source: 'user' | 'agent') => {
    // Only process user messages for waste detection
    if (source === 'user') {
      const wasteItem = parseWasteFromMessage(message);
      if (wasteItem) {
        console.log('🗑️ Detected waste item:', wasteItem);
        // Auto-mint after detection
        mintTokensForWaste(wasteItem);
      }
    }
  }, [parseWasteFromMessage, mintTokensForWaste]);

  const clearMintingStatus = useCallback(() => {
    setMintingStatus({
      isMinting: false,
      wasteItem: null,
      tokensMinted: 0,
      transactionHash: '',
      error: null,
    });
  }, []);

  return {
    mintingStatus,
    processMessage,
    clearMintingStatus,
  };
}
