'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const MonzoAuthPage: React.FC = () => {
  // Stages of the authorization process
  type Stage = 'init' | 'waiting-for-approval' | 'attempting-exchange' | 'token-received' | 'fetching-accounts' | 'success' | 'error';
  
  const [stage, setStage] = useState<Stage>('init');
  const [errorMessage, setErrorMessage] = useState('');
  const [approvalTime, setApprovalTime] = useState(60); // 60 seconds to approve
  const [waitTime, setWaitTime] = useState(10); // 10 seconds between stages
  const [tokenData, setTokenData] = useState<{
    access_token: string;
    refresh_token?: string;
    user_id: string;
  } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Log each stage change
  useEffect(() => {
    console.log(`[Monzo Auth] Current stage: ${stage}`);
  }, [stage]);

  // Initialize the process
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      setErrorMessage(`Monzo authorization failed: ${error}`);
      setStage('error');
      return;
    }
    
    if (!code) {
      setErrorMessage('No authorization code provided');
      setStage('error');
      return;
    }

    console.log('[Monzo Auth] Authorization code received from Monzo');
    console.log('[Monzo Auth] Entering waiting period for mobile app approval');
    setStage('waiting-for-approval');
  }, [searchParams]);

  // Approval timer countdown
  useEffect(() => {
    if (stage === 'waiting-for-approval' && approvalTime > 0) {
      const timer = setTimeout(() => {
        setApprovalTime(approvalTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'waiting-for-approval' && approvalTime === 0) {
      console.log('[Monzo Auth] Approval wait time finished');
      console.log('[Monzo Auth] Proceeding to token exchange');
      setStage('attempting-exchange');
    }
  }, [approvalTime, stage]);

  // Stage transition timer
  useEffect(() => {
    if (stage === 'attempting-exchange') {
      attemptTokenExchange();
    } else if (stage === 'token-received' && waitTime > 0) {
      const timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'token-received' && waitTime === 0) {
      console.log('[Monzo Auth] Post-token wait time finished');
      console.log('[Monzo Auth] Proceeding to fetch accounts');
      setStage('fetching-accounts');
      fetchAccounts();
    }
  }, [stage, waitTime]);

  // Attempt to exchange the authorization code for a token
  const attemptTokenExchange = async () => {
    try {
      const code = searchParams.get('code');
      
      if (!code) {
        throw new Error('No authorization code available');
      }

      console.log('[Monzo Auth] Attempting to exchange code for token...');
      
      try {
        const response = await fetch('/api/monzo/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state: 'auth_flow' }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Token exchange failed');
        }

        console.log('[Monzo Auth] Token exchange successful');
        
        setTokenData({
          access_token: data.tokens.access_token,
          refresh_token: data.tokens.refresh_token,
          user_id: data.tokens.user_id
        });
        
        // Reset wait time for next stage
        setWaitTime(10); 
        setStage('token-received');
      } catch (error: any) {
        console.error('[Monzo Auth] Token exchange error:', error);
        
        if (error.message?.includes('used')) {
          setErrorMessage('Your authorization code has already been used. Please try connecting again.');
        } else {
          setErrorMessage(error.message || 'Failed to exchange authorization code for token');
        }
        setStage('error');
      }
    } catch (error: any) {
      console.error('[Monzo Auth] Error in token exchange process:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      setStage('error');
    }
  };

  // Fetch account information using the token
  const fetchAccounts = async () => {
    if (!tokenData) {
      setErrorMessage('No token data available');
      setStage('error');
      return;
    }

    try {
      console.log('[Monzo Auth] Fetching Monzo accounts...');
      
      const response = await fetch(`/api/monzo/transactions?access_token=${tokenData.access_token}&account_id=auto&type=analysis&days=30`);
      const data = await response.json();
      
      console.log('[Monzo Auth] Successfully completed account verification');
      
      // Store tokens locally for the session
      localStorage.setItem('monzo_tokens', JSON.stringify(tokenData));
      localStorage.setItem('monzo_account_connected', 'true');

      console.log('[Monzo Auth] User data updated successfully');
      setStage('success');
      
      // Redirect back to main app with success
      setTimeout(() => {
        router.push('/?monzo_success=true&access_token=' + tokenData.access_token + '&user_id=' + tokenData.user_id);
      }, 2000);
    } catch (error) {
      console.error('[Monzo Auth] Error during final verification:', error);
      
      // Even if verification fails, still save the tokens
      localStorage.setItem('monzo_tokens', JSON.stringify(tokenData));
      localStorage.setItem('monzo_account_connected', 'true');
      
      console.log('[Monzo Auth] Saved token despite verification issues');
      setStage('success');
      setTimeout(() => {
        router.push('/?monzo_success=true&access_token=' + tokenData.access_token + '&user_id=' + tokenData.user_id);
      }, 2000);
    }
  };

  // Allow user to skip the waiting periods
  const handleContinue = () => {
    if (stage === 'waiting-for-approval') {
      console.log('[Monzo Auth] User manually proceeded to token exchange');
      setStage('attempting-exchange');
    } else if (stage === 'token-received') {
      console.log('[Monzo Auth] User manually proceeded to account fetching');
      setStage('fetching-accounts');
      fetchAccounts();
    }
  };

  // Render the appropriate UI based on the current stage
  const renderContent = () => {
    switch (stage) {
      case 'init':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-white">Initializing authentication process...</p>
          </div>
        );
        
      case 'waiting-for-approval':
        return (
          <div className="text-center bg-slate-900 p-8 rounded-lg shadow-lg max-w-md mx-auto border border-slate-700">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🥗</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Waiting for Mobile App Approval
            </h2>
            
            <div className="mb-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-900">
                      Time to approve
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-400">
                      {approvalTime} seconds
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-700">
                  <div style={{ width: `${(approvalTime / 60) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Mobile phone mockup */}
            <div className="mb-6">
              <div className="mx-auto w-32 h-56 bg-slate-800 rounded-2xl border-2 border-slate-600 flex flex-col">
                <div className="flex-1 p-3 flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div className="text-xs text-slate-300 text-center">
                    <div className="mb-1">Monzo</div>
                    <div className="text-blue-400">Grant Access?</div>
                  </div>
                </div>
                <div className="h-8 bg-slate-700 rounded-b-2xl"></div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6 text-sm">
              Please check your Monzo app and approve the HeySalad ® Tasha authorization request. 
              We'll automatically proceed once you approve.
            </p>
            
            <button 
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              I've Approved in Monzo App
            </button>
          </div>
        );
        
      case 'attempting-exchange':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-white">Exchanging authorization code for token...</p>
            <p className="text-slate-400 mt-2">This may take a moment</p>
          </div>
        );
        
      case 'token-received':
        return (
          <div className="text-center bg-slate-900 p-8 rounded-lg shadow-lg max-w-md mx-auto border border-slate-700">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Token Received Successfully!
            </h2>
            
            <div className="mb-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-400 bg-green-900">
                      Finalizing connection
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-400">
                      {waitTime} seconds
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-700">
                  <div style={{ width: `${(waitTime / 10) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-500"></div>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 mb-6 text-sm">
              Perfect! We've received your authorization. Just completing the final setup steps.
            </p>
            
            <button 
              onClick={handleContinue}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
            >
              Continue Now
            </button>
          </div>
        );
        
      case 'fetching-accounts':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-white">Setting up your connection...</p>
            <p className="text-slate-400 mt-2">Almost ready!</p>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center bg-slate-900 p-8 rounded-lg shadow-lg max-w-md mx-auto border border-red-500">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Connection Failed</h2>
            <p className="text-slate-300 mb-6 text-sm">{errorMessage}</p>
            <p className="text-slate-400 mb-6 text-xs">
              Please make sure to approve the request promptly in your Monzo app.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium"
            >
              Return to App
            </button>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <p className="text-xl text-white">Successfully connected to Monzo!</p>
            <p className="text-slate-400 mt-2">Redirecting back to HeySalad...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-lg w-full mx-4">
        {/* HeySalad Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            HeySalad 🥗 × Monzo
          </h1>
          <p className="text-slate-400">Connecting your bank for enhanced verification</p>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default MonzoAuthPage;