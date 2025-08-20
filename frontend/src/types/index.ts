// src/types/index.ts
export type WasteType = 'donation' | 'efficient-delivery' | 'used-before-expiry';

export interface Account {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

// Updated Transaction interface to fix TypeScript errors
export interface Transaction {
  id?: string; // Added optional id
  date: string;
  timestamp?: string | number; // Added optional timestamp
  type: WasteType;
  amount: number;
  tokens: number;
  status: string;
  description?: string; // Added optional description
  wasteAmount?: number; // Added optional wasteAmount
}

export interface AIVerification {
  isVerified: boolean;
  feedback: string;
  confidence: number;  // Added the confidence property
}

// Define props for components
export interface StatsCardsProps {
  tokenBalance: string;
  getTotalWasteReduction: () => number;
}

export interface WalletConnectionProps {
  isConnected: boolean;
  isConnecting?: boolean;
  selectedAccount: Account | null;
  tokenBalance: string;
  connectWallet: () => Promise<void>;
}

// Additional interfaces for Monzo integration
export interface MonzoTransaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  created: string;
  merchant?: {
    name: string;
    category: string;
  };
}

export interface MonzoTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface WasteReductionEntry {
  id: string;
  amount: number;
  type: WasteType;
  description: string;
  timestamp: string;
  verified: boolean;
  tokens_earned: number;
}