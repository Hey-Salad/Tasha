// hooks/useMonzo.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { buildFunctionsUrl, parseJsonResponse } from '../utils/functionsClient';

interface MonzoTokens {
  access_token: string;
  user_id: string;
  expires_in: number;
}

interface MonzoTransaction {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  merchant?: {
    id: string;
    name: string;
    category: string;
    emoji: string;
  };
  category: string;
}

interface WasteReductionMatch {
  potentialMatches: MonzoTransaction[];
  confidence: number;
  reasoning: string;
}

export function useMonzo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStoredTokens = useCallback((): { tokens: MonzoTokens | null; accountId: string | null } => {
    // Only access localStorage on client side
    if (!isClient || typeof window === 'undefined') {
      return { tokens: null, accountId: null };
    }

    try {
      const storedTokens = localStorage.getItem('monzo_tokens');
      const storedAccountId = localStorage.getItem('monzo_account_id');
      
      if (storedTokens && storedAccountId) {
        return {
          tokens: JSON.parse(storedTokens),
          accountId: storedAccountId
        };
      }
    } catch (e) {
      console.error('Error getting stored Monzo tokens:', e);
    }
    
    return { tokens: null, accountId: null };
  }, [isClient]);

  const getFoodTransactions = useCallback(async (days: number = 7): Promise<MonzoTransaction[]> => {
    const { tokens, accountId } = getStoredTokens();
    
    if (!tokens || !accountId) {
      throw new Error('Monzo account not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        access_token: tokens.access_token,
        account_id: accountId,
        type: 'food',
        days: String(days)
      });

      const response = await fetch(`${buildFunctionsUrl('/monzo/transactions')}?${params.toString()}`);
      const data = await parseJsonResponse<{
        success: boolean;
        transactions: MonzoTransaction[];
        error?: string;
      }>(response);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      return data.transactions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredTokens]);

  const getSpendingAnalysis = useCallback(async (days: number = 30) => {
    const { tokens, accountId } = getStoredTokens();
    
    if (!tokens || !accountId) {
      throw new Error('Monzo account not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        access_token: tokens.access_token,
        account_id: accountId,
        type: 'analysis',
        days: String(days)
      });

      const response = await fetch(`${buildFunctionsUrl('/monzo/transactions')}?${params.toString()}`);
      const data = await parseJsonResponse<{ success: boolean; analysis: any; error?: string }>(response);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analysis');
      }

      return data.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredTokens]);

  const matchWasteReduction = useCallback(async (
    wasteReductionDate: string,
    wasteDescription: string
  ): Promise<WasteReductionMatch> => {
    const { tokens, accountId } = getStoredTokens();
    
    if (!tokens || !accountId) {
      throw new Error('Monzo account not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildFunctionsUrl('/monzo/match'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokens.access_token,
          accountId,
          wasteReductionDate,
          wasteDescription,
        }),
      });
      
      const data = await parseJsonResponse<{
        success: boolean;
        potentialMatches: MonzoTransaction[];
        confidence: number;
        reasoning: string;
        error?: string;
      }>(response);

      if (!data.success) {
        throw new Error(data.error || 'Failed to match transactions');
      }

      return {
        potentialMatches: data.potentialMatches,
        confidence: data.confidence,
        reasoning: data.reasoning
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to match transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredTokens]);

  const isConnected = useCallback((): boolean => {
    const { tokens, accountId } = getStoredTokens();
    return !!(tokens && accountId);
  }, [getStoredTokens]);

  const disconnect = useCallback(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.removeItem('monzo_tokens');
      localStorage.removeItem('monzo_account_id');
    }
  }, [isClient]);

  return {
    isLoading,
    error,
    isConnected: isConnected(),
    getFoodTransactions,
    getSpendingAnalysis,
    matchWasteReduction,
    disconnect,
    getStoredTokens,
  };
}
