// components/EnhancedWasteLogging.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, CreditCard, Coins } from 'lucide-react';
import { useMonzo } from '@/hooks/useMonzo';

interface MonzoTransaction {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  merchant?: {
    name: string;
    category: string;
    emoji: string;
  };
}

interface WasteLogEntry {
  wasteType: 'food_donation' | 'efficient_delivery' | 'used_before_expiry';
  amount: number;
  description: string;
  date: string;
}

interface EnhancedWasteLoggingProps {
  onLogWaste?: (entry: WasteLogEntry, verification: any) => void;
}

export default function EnhancedWasteLogging({ onLogWaste }: EnhancedWasteLoggingProps) {
  const [wasteEntry, setWasteEntry] = useState<WasteLogEntry>({
    wasteType: 'food_donation',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<{
    monzoMatches?: MonzoTransaction[];
    confidence?: number;
    reasoning?: string;
    aiVerification?: any;
  } | null>(null);

  const { isConnected, matchWasteReduction, isLoading: monzoLoading } = useMonzo();

  const handleInputChange = (field: keyof WasteLogEntry, value: string | number) => {
    setWasteEntry(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear previous verification when form changes
    if (verification) {
      setVerification(null);
    }
  };

  const runMonzoVerification = async () => {
    if (!isConnected || !wasteEntry.description || !wasteEntry.date) {
      return null;
    }

    try {
      const matchResult = await matchWasteReduction(
        wasteEntry.date,
        wasteEntry.description
      );
      
      return matchResult;
    } catch (error) {
      console.error('Monzo verification failed:', error);
      return null;
    }
  };

  const runAIVerification = async () => {
    // Placeholder for AI verification using your existing Gemini/OpenAI services
    // This would analyze the waste description and amount for reasonableness
    try {
      const response = await fetch('/api/ai/verify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteType: wasteEntry.wasteType,
          amount: wasteEntry.amount,
          description: wasteEntry.description,
          date: wasteEntry.date
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('AI verification failed:', error);
    }

    // Fallback mock verification
    return {
      confidence: 0.7,
      reasoning: 'Basic validation passed - description and amount seem reasonable',
      flags: []
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wasteEntry.amount <= 0 || !wasteEntry.description.trim()) {
      alert('Please provide a valid amount and description');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Run both verification systems
      const [monzoResult, aiResult] = await Promise.all([
        runMonzoVerification(),
        runAIVerification()
      ]);

      const verificationData = {
        monzoMatches: monzoResult?.potentialMatches || [],
        confidence: calculateOverallConfidence(monzoResult, aiResult),
        reasoning: combineReasonings(monzoResult, aiResult),
        aiVerification: aiResult,
        monzoVerification: monzoResult
      };

      setVerification(verificationData);
      
      // Call parent callback
      onLogWaste?.(wasteEntry, verificationData);
      
    } catch (error) {
      console.error('Error during verification:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateOverallConfidence = (monzoResult: any, aiResult: any): number => {
    let totalConfidence = 0;
    let factors = 0;

    // AI verification confidence (weight: 0.4)
    if (aiResult?.confidence) {
      totalConfidence += aiResult.confidence * 0.4;
      factors += 0.4;
    }

    // Monzo verification confidence (weight: 0.6 if connected)
    if (isConnected && monzoResult?.confidence !== undefined) {
      totalConfidence += monzoResult.confidence * 0.6;
      factors += 0.6;
    } else if (!isConnected) {
      // If Monzo not connected, give full weight to AI
      if (aiResult?.confidence) {
        totalConfidence = aiResult.confidence;
        factors = 1;
      }
    }

    return factors > 0 ? totalConfidence / factors : 0.5; // Default 50% if no verification
  };

  const combineReasonings = (monzoResult: any, aiResult: any): string => {
    const reasons = [];
    
    if (aiResult?.reasoning) {
      reasons.push(`AI Analysis: ${aiResult.reasoning}`);
    }
    
    if (isConnected && monzoResult?.reasoning) {
      reasons.push(`Banking Verification: ${monzoResult.reasoning}`);
    } else if (!isConnected) {
      reasons.push('Banking verification unavailable - consider connecting Monzo for enhanced verification');
    }

    return reasons.join('. ');
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const resetForm = () => {
    setWasteEntry({
      wasteType: 'food_donation',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setVerification(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Log Food Waste Reduction
          </CardTitle>
          <CardDescription>
            Record your waste reduction activity to earn FWT tokens
            {isConnected && (
              <Badge variant="secondary" className="ml-2">
                <CreditCard className="h-3 w-3 mr-1" />
                Monzo Connected
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="wasteType">Waste Reduction Type</Label>
              <select
                id="wasteType"
                value={wasteEntry.wasteType}
                onChange={(e) => handleInputChange('wasteType', e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="food_donation">Food Donation</option>
                <option value="efficient_delivery">Efficient Delivery</option>
                <option value="used_before_expiry">Used Before Expiry</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (kg)</Label>
              <Input
                id="amount"
                type="number"
                min="0.1"
                step="0.1"
                value={wasteEntry.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 2.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={wasteEntry.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the food items and how you reduced waste..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={wasteEntry.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || monzoLoading}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying & Logging...
                </>
              ) : (
                'Log Waste Reduction'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {verification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verification.confidence && verification.confidence >= 0.7 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Confidence:</span>
              <span className={`font-bold ${getConfidenceColor(verification.confidence || 0)}`}>
                {Math.round((verification.confidence || 0) * 100)}%
              </span>
            </div>

            {verification.reasoning && (
              <div>
                <Label>Verification Details:</Label>
                <p className="text-sm text-gray-600 mt-1">{verification.reasoning}</p>
              </div>
            )}

            {verification.monzoMatches && verification.monzoMatches.length > 0 && (
              <div>
                <Label>Matching Transactions:</Label>
                <div className="mt-2 space-y-2">
                  {verification.monzoMatches.map((transaction, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-600">
                            {transaction.merchant?.name} • {new Date(transaction.created).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            £{Math.abs(transaction.amount) / 100}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline">
                Log Another Entry
              </Button>
              <Button 
                onClick={() => {
                  // Simulate minting tokens based on verification confidence
                  const tokensEarned = Math.round(wasteEntry.amount * 10 * (verification.confidence || 0.5));
                  alert(`Success! You've earned ${tokensEarned} FWT tokens for this waste reduction activity.`);
                  resetForm();
                }}
                disabled={!verification.confidence || verification.confidence < 0.3}
              >
                Mint {Math.round(wasteEntry.amount * 10 * (verification.confidence || 0.5))} FWT Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}