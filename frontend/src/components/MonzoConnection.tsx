// components/MonzoConnection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface MonzoTokens {
  access_token: string;
  user_id: string;
  expires_in: number;
}

interface MonzoAnalysis {
  totalSpent: number;
  transactionCount: number;
  averagePerTransaction: number;
  topMerchants: Array<{ name: string; amount: number; count: number }>;
  spendingByCategory: Record<string, number>;
}

interface MonzoConnectionProps {
  onConnectionStatusChange?: (connected: boolean, tokens?: MonzoTokens) => void;
}

export default function MonzoConnection({ onConnectionStatusChange }: MonzoConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokens, setTokens] = useState<MonzoTokens | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MonzoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Check for OAuth callback parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('monzo_success');
    const accessToken = urlParams.get('access_token');
    const userId = urlParams.get('user_id');
    const accountIdParam = urlParams.get('account_id');
    const monzoError = urlParams.get('monzo_error');

    if (success === 'true' && accessToken && userId) {
      const tokenData: MonzoTokens = {
        access_token: accessToken,
        user_id: userId,
        expires_in: 3600 // Default 1 hour
      };
      
      setTokens(tokenData);
      setAccountId(accountIdParam);
      setIsConnected(true);
      setError(null);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Notify parent component
      onConnectionStatusChange?.(true, tokenData);
      
      // Load analysis
      if (accountIdParam) {
        loadSpendingAnalysis(accessToken, accountIdParam);
      }
    } else if (monzoError) {
      setError(`Connection failed: ${monzoError}`);
      setIsConnecting(false);
    }

    // Check if we already have stored tokens
    const storedTokens = localStorage.getItem('monzo_tokens');
    const storedAccountId = localStorage.getItem('monzo_account_id');
    
    if (storedTokens && storedAccountId && !isConnected) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        setAccountId(storedAccountId);
        setIsConnected(true);
        onConnectionStatusChange?.(true, parsedTokens);
        loadSpendingAnalysis(parsedTokens.access_token, storedAccountId);
      } catch (e) {
        console.error('Error parsing stored tokens:', e);
        localStorage.removeItem('monzo_tokens');
        localStorage.removeItem('monzo_account_id');
      }
    }
  }, [onConnectionStatusChange, isConnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const response = await fetch('/api/monzo/auth');
      const data = await response.json();

      if (data.success) {
        // Redirect to Monzo OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to generate auth URL');
      }
    } catch (err) {
      console.error('Error connecting to Monzo:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setTokens(null);
    setAccountId(null);
    setAnalysis(null);
    setError(null);
    
    // Clear stored data
    localStorage.removeItem('monzo_tokens');
    localStorage.removeItem('monzo_account_id');
    
    onConnectionStatusChange?.(false);
  };

  const loadSpendingAnalysis = async (accessToken: string, accountId: string) => {
    try {
      setIsLoadingAnalysis(true);
      
      const response = await fetch(`/api/monzo/transactions?access_token=${accessToken}&account_id=${accountId}&type=analysis&days=30`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        
        // Store tokens for future use
        if (tokens) {
          localStorage.setItem('monzo_tokens', JSON.stringify(tokens));
          localStorage.setItem('monzo_account_id', accountId);
        }
      } else {
        console.error('Failed to load analysis:', data.error);
      }
    } catch (err) {
      console.error('Error loading spending analysis:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const refreshAnalysis = () => {
    if (tokens && accountId) {
      loadSpendingAnalysis(tokens.access_token, accountId);
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Monzo Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => setError(null)} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Connect Your Monzo Account
          </CardTitle>
          <CardDescription>
            Link your Monzo account to verify food purchases and enhance waste reduction tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Benefits of connecting Monzo:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Automatic verification of food purchases</li>
                <li>Enhanced credibility for waste reduction claims</li>
                <li>Insights into your food spending patterns</li>
                <li>Bonus tokens for verified purchase-to-waste-reduction chains</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Connect Monzo Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Monzo Connected
            </div>
            <Badge variant="secondary">Connected</Badge>
          </CardTitle>
          <CardDescription>
            Your Monzo account is successfully connected and ready for transaction verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-sm text-green-600">
              User ID: {tokens?.user_id.substring(0, 20)}...
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Food Spending Analysis (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Insights into your food spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading analysis...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      £{analysis.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.transactionCount}
                    </div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      £{analysis.averagePerTransaction.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </div>

                {analysis.topMerchants.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Top Food Merchants</h4>
                    <div className="space-y-2">
                      {analysis.topMerchants.map((merchant, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{merchant.name}</span>
                          <div className="text-right">
                            <div className="font-semibold">£{merchant.amount.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{merchant.count} transactions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" size="sm" onClick={refreshAnalysis}>
                    Refresh Analysis
                  </Button>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}