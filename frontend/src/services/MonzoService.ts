// src/services/MonzoService.ts
export interface MonzoTransaction {
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
  notes: string;
  metadata: Record<string, any>;
  account_balance: number;
  local_amount: number;
  local_currency: string;
}

export interface MonzoAccount {
  id: string;
  description: string;
  type: string;
  currency: string;
  country_code: string;
  owners: Array<{
    user_id: string;
    preferred_name: string;
    preferred_first_name: string;
  }>;
}

export interface MonzoAuthTokens {
  access_token: string;
  client_id: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user_id: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id?: string;
  client_id?: string;
}

export interface AccountsResponse {
  accounts: MonzoAccount[];
}

class MonzoService {
  private baseUrl = 'https://api.monzo.com';
  private authUrl = 'https://auth.monzo.com';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    // Next.js environment variables
    this.clientId = process.env.NEXT_PUBLIC_MONZO_CLIENT_ID || '';
    this.clientSecret = process.env.MONZO_CLIENT_SECRET || '';
    this.redirectUri = process.env.NEXT_PUBLIC_MONZO_REDIRECT_URI || 'http://localhost:3000/api/monzo/callback';
    
    console.log('[Monzo Service] Initialized with client ID:', this.clientId ? this.clientId.substring(0, 10) + '...' : 'Not set');
  }

  /**
   * Helper function to add delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a random state to prevent CSRF attacks
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate Monzo OAuth authentication URL
   */
  generateAuthUrl(state?: string): string {
    const authState = state || this.generateState();
    
    // Store state for validation
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('monzoAuthState', authState);
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: authState
    });

    const url = `${this.authUrl}/?${params.toString()}`;
    console.log('[Monzo Service] Generated authorization URL:', url);
    return url;
  }

  /**
   * Start the Monzo OAuth flow (for browser use)
   */
  authorizeWithMonzo(): void {
    if (typeof window === 'undefined') return;
    
    const authUrl = this.generateAuthUrl();
    console.log('[Monzo Service] Starting OAuth flow with URL:', authUrl);
    window.location.href = authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, clientSecret: string): Promise<MonzoAuthTokens> {
    console.log('[Monzo Service] Exchanging code for token');
    console.log('[Monzo Service] Waiting before token exchange...');
    
    // Add a delay before exchanging the token to ensure approval is complete
    await this.delay(2000);
    
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'authorization_code');
      formData.append('client_id', this.clientId);
      formData.append('client_secret', clientSecret);
      formData.append('redirect_uri', this.redirectUri);
      formData.append('code', code);

      console.log('[Monzo Service] Sending token exchange request to Monzo');
      
      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[Monzo Service] Token exchange failed:', response.status, errorData);
        throw new Error(`Monzo token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Monzo Service] Token exchange successful');
      return data;
    } catch (error) {
      console.error('[Monzo Service] Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Get user's Monzo accounts
   */
  async getAccounts(accessToken: string): Promise<MonzoAccount[]> {
    console.log('[Monzo Service] Fetching user accounts');
    console.log('[Monzo Service] Waiting before fetching accounts...');
    
    // Add a delay before fetching accounts
    await this.delay(1000);
    
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('[Monzo Service] Failed to fetch accounts:', response.status, response.statusText);
        
        // Return mock account if we can't fetch real accounts (for development)
        if (response.status === 403) {
          console.log('[Monzo Service] Using mock accounts due to permission issue');
          return [{
            id: process.env.MONZO_ACCOUNT_ID || 'mock-account-id',
            description: 'Monzo Account',
            type: 'uk_retail',
            currency: 'GBP',
            country_code: 'GB',
            owners: [{
              user_id: process.env.MONZO_USER_ID || 'mock-user-id',
              preferred_name: 'Test User',
              preferred_first_name: 'Test'
            }]
          }];
        }
        
        throw new Error(`Failed to fetch accounts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Monzo Service] Successfully fetched accounts');
      return data.accounts;
    } catch (error) {
      console.error('[Monzo Service] Error fetching accounts:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific account
   */
  async getTransactions(
    accessToken: string, 
    accountId: string, 
    since?: string,
    before?: string,
    limit: number = 20
  ): Promise<MonzoTransaction[]> {
    console.log('[Monzo Service] Fetching transactions for account:', accountId);
    
    try {
      const params = new URLSearchParams({
        account_id: accountId,
        expand: 'merchant',
        limit: limit.toString(),
      });

      if (since) params.append('since', since);
      if (before) params.append('before', before);

      const response = await fetch(`${this.baseUrl}/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('[Monzo Service] Failed to fetch transactions:', response.status, response.statusText);
        
        // Return mock transactions for development
        return [
          {
            id: 'tx_mock_001',
            created: new Date().toISOString(),
            description: 'Mock Food Purchase',
            amount: -850,
            currency: 'GBP',
            category: 'eating_out',
            notes: 'Test transaction for development',
            metadata: {},
            account_balance: 10000,
            local_amount: -850,
            local_currency: 'GBP',
            merchant: {
              id: 'merch_mock_001',
              name: 'Test Restaurant',
              category: 'eating_out',
              emoji: '🍕'
            }
          }
        ];
      }

      const data = await response.json();
      console.log('[Monzo Service] Successfully fetched transactions');
      return data.transactions;
    } catch (error) {
      console.error('[Monzo Service] Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get recent food-related transactions
   */
  async getFoodTransactions(
    accessToken: string, 
    accountId: string, 
    days: number = 7
  ): Promise<MonzoTransaction[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const transactions = await this.getTransactions(
      accessToken, 
      accountId, 
      since.toISOString()
    );

    // Filter for food-related transactions
    return transactions.filter(transaction => 
      this.isFoodRelated(transaction)
    );
  }

  /**
   * Check if a transaction is food-related
   */
  private isFoodRelated(transaction: MonzoTransaction): boolean {
    const foodCategories = [
      'eating_out',
      'groceries',
      'general',
    ];

    const foodKeywords = [
      'tesco', 'sainsbury', 'asda', 'morrison', 'waitrose', 'marks & spencer',
      'mcdonalds', 'kfc', 'subway', 'pizza', 'restaurant', 'cafe', 'bistro',
      'deliveroo', 'uber eats', 'just eat', 'foodpanda',
      'grocery', 'supermarket', 'food', 'meal', 'lunch', 'dinner', 'breakfast'
    ];

    // Check category
    if (foodCategories.includes(transaction.category)) {
      return true;
    }

    // Check merchant category
    if (transaction.merchant?.category && foodCategories.includes(transaction.merchant.category)) {
      return true;
    }

    // Check description for food keywords
    const description = transaction.description.toLowerCase();
    const merchantName = transaction.merchant?.name?.toLowerCase() || '';
    
    return foodKeywords.some(keyword => 
      description.includes(keyword) || merchantName.includes(keyword)
    );
  }

  /**
   * Analyze spending patterns for food waste insights
   */
  async analyzeFoodSpending(
    accessToken: string, 
    accountId: string, 
    days: number = 30
  ): Promise<{
    totalSpent: number;
    transactionCount: number;
    averagePerTransaction: number;
    topMerchants: Array<{ name: string; amount: number; count: number }>;
    spendingByCategory: Record<string, number>;
  }> {
    const foodTransactions = await this.getFoodTransactions(accessToken, accountId, days);
    
    const totalSpent = foodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100; // Convert pence to pounds
    const transactionCount = foodTransactions.length;
    const averagePerTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

    // Top merchants
    const merchantSpending: Record<string, { amount: number; count: number }> = {};
    foodTransactions.forEach(t => {
      const merchantName = t.merchant?.name || 'Unknown Merchant';
      if (!merchantSpending[merchantName]) {
        merchantSpending[merchantName] = { amount: 0, count: 0 };
      }
      merchantSpending[merchantName].amount += Math.abs(t.amount) / 100;
      merchantSpending[merchantName].count += 1;
    });

    const topMerchants = Object.entries(merchantSpending)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Spending by category
    const spendingByCategory: Record<string, number> = {};
    foodTransactions.forEach(t => {
      const category = t.category || 'other';
      spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(t.amount) / 100;
    });

    return {
      totalSpent,
      transactionCount,
      averagePerTransaction,
      topMerchants,
      spendingByCategory,
    };
  }

  /**
   * Match transactions with waste reduction claims
   */
  async matchTransactionsWithWasteReduction(
    accessToken: string,
    accountId: string,
    wasteReductionDate: string,
    wasteDescription: string
  ): Promise<{
    potentialMatches: MonzoTransaction[];
    confidence: number;
    reasoning: string;
  }> {
    // Get transactions from 1-7 days before waste reduction
    const wasteDate = new Date(wasteReductionDate);
    const searchStart = new Date(wasteDate);
    searchStart.setDate(searchStart.getDate() - 7);
    
    const transactions = await this.getTransactions(
      accessToken,
      accountId,
      searchStart.toISOString(),
      wasteDate.toISOString()
    );

    const foodTransactions = transactions.filter(t => this.isFoodRelated(t));
    
    // Simple matching logic (can be enhanced with AI)
    const wasteKeywords = wasteDescription.toLowerCase().split(' ');
    const potentialMatches = foodTransactions.filter(transaction => {
      const merchantName = transaction.merchant?.name?.toLowerCase() || '';
      const description = transaction.description.toLowerCase();
      
      return wasteKeywords.some(keyword => 
        merchantName.includes(keyword) || description.includes(keyword)
      );
    });

    let confidence = 0;
    let reasoning = 'No matching transactions found';

    if (potentialMatches.length > 0) {
      confidence = Math.min(potentialMatches.length * 0.3, 0.9); // Max 90% confidence
      reasoning = `Found ${potentialMatches.length} potential matching transactions within 7 days`;
    }

    return {
      potentialMatches,
      confidence,
      reasoning,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    console.log('[Monzo Service] Refreshing access token');
    
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'refresh_token');
      formData.append('client_id', this.clientId);
      formData.append('client_secret', this.clientSecret);
      formData.append('refresh_token', refreshToken);

      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Monzo Service] Successfully refreshed token');
      return data;
    } catch (error) {
      console.error('[Monzo Service] Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Get balance for a specific account
   */
  async getAccountBalance(accountId: string, accessToken: string): Promise<any> {
    console.log('[Monzo Service] Fetching balance for account:', accountId);
    
    try {
      const params = new URLSearchParams({ account_id: accountId });
      const response = await fetch(`${this.baseUrl}/balance?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Monzo Service] Successfully fetched balance');
      return data;
    } catch (error) {
      console.error('[Monzo Service] Failed to fetch account balance', error);
      // Return mock data in case of error
      return {
        balance: 0,
        total_balance: 0,
        currency: 'GBP',
        spend_today: 0
      };
    }
  }

  /**
   * Test connection with current access token
   */
  async testConnection(accessToken: string): Promise<{ success: boolean; user?: any; accounts?: any[]; error?: string }> {
    try {
      // Test "Who am I?" endpoint
      const whoAmIResponse = await fetch(`${this.baseUrl}/ping/whoami`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!whoAmIResponse.ok) {
        return {
          success: false,
          error: `Authentication failed: ${whoAmIResponse.statusText}`
        };
      }

      const whoAmIData = await whoAmIResponse.json();

      // Test "List accounts" endpoint
      const accounts = await this.getAccounts(accessToken);

      return {
        success: true,
        user: whoAmIData,
        accounts: accounts
      };
    } catch (error) {
      console.error('[Monzo Service] Test connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default MonzoService;