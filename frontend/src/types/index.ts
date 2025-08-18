export type WasteType = 'donation' | 'efficient-delivery' | 'used-before-expiry';

export interface Account {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

export interface Transaction {
  date: string;
  type: WasteType;
  amount: number;
  tokens: number;
  status: string;
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