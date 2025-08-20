// components/FoodAnalysisResults.tsx
'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  ChefHat, 
  Recycle, 
  Leaf, 
  Coins,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import type { FoodAnalysis, MintingOptions } from '../types/foodAnalysis';
import { usePolkadotWallet } from '../hooks/usePolkadotWallet';

interface FoodAnalysisResultsProps {
  analysis: FoodAnalysis;
  onMintSelected: (options: MintingOptions) => void;
}

export const FoodAnalysisResults = ({ analysis, onMintSelected }: FoodAnalysisResultsProps) => {
  const { isConnected, signMessage } = usePolkadotWallet();
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<MintingOptions>({
    journal_entry: false,
    recipe_data: false,
    waste_reduction_data: false,
    environmental_impact: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleOption = (option: keyof MintingOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleMintSelected = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const selectedCount = Object.values(selectedOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      alert('Please select at least one item to mint');
      return;
    }

    setIsProcessing(true);
    try {
      const message = `Minting food analysis data: ${new Date().toISOString()}`;
      await signMessage(message);
      onMintSelected(selectedOptions);
    } catch (error) {
      console.error('Error during minting:', error);
      alert('Failed to process minting request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Define cards data
  const cards = [
    {
      id: 'overview',
      title: 'Analysis Overview',
      icon: <Sparkles size={20} />,
      content: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '800', 
              color: '#ffffff', 
              margin: 0,
              fontFamily: 'Grandstander, cursive'
            }}>
              {analysis.food_type}
            </h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: analysis.confidence_score >= 0.8 ? '#28a74522' : 
                          analysis.confidence_score >= 0.6 ? '#ffc10722' : '#dc354522',
              color: analysis.confidence_score >= 0.8 ? '#28a745' : 
                     analysis.confidence_score >= 0.6 ? '#ffc107' : '#dc3545',
              border: `1px solid ${analysis.confidence_score >= 0.8 ? '#28a745' : 
                                  analysis.confidence_score >= 0.6 ? '#ffc107' : '#dc3545'}33`
            }}>
              <Sparkles size={12} />
              {Math.round(analysis.confidence_score * 100)}%
            </div>
          </div>
          
          <p style={{ color: '#faa09a', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {analysis.sustainability_analysis}
          </p>
        </div>
      )
    },
    {
      id: 'analysis',
      title: 'Analysis Results',
      icon: <Leaf size={20} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {Object.entries(analysis.analysis_results).map(([key, value]) => (
            <div key={key} style={{
              padding: '12px',
              background: '#222222',
              borderRadius: '8px',
              border: '1px solid #333333'
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#ed4c4c', 
                fontWeight: '600', 
                marginBottom: '4px',
                textTransform: 'capitalize'
              }}>
                {key.replace(/_/g, ' ')}
              </div>
              <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'environmental',
      title: 'Environmental Impact',
      icon: <Globe size={20} />,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {Object.entries(analysis.environmental_impact).map(([key, value]) => (
            <div key={key} style={{
              padding: '16px',
              background: 'rgba(40, 167, 69, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(40, 167, 69, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#28a745', 
                fontWeight: '600', 
                marginBottom: '8px',
                textTransform: 'capitalize'
              }}>
                {key.replace(/_/g, ' ')}
              </div>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'recommendations',
      title: 'Action Recommendations',
      icon: <ChefHat size={20} />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(analysis.action_recommendations).map(([category, recommendations]) => (
            <div key={category} style={{
              padding: '16px',
              background: '#222222',
              borderRadius: '12px',
              border: '1px solid #333333'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                color: '#ed4c4c',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {category === 'journal' && <BookOpen size={16} />}
                {category === 'recipe_suggestions' && <ChefHat size={16} />}
                {category === 'waste_reduction_tips' && <Recycle size={16} />}
                {category.replace(/_/g, ' ').toUpperCase()}
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} style={{
                    fontSize: '12px',
                    color: '#faa09a',
                    paddingLeft: '16px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '0',
                      color: '#ed4c4c'
                    }}>•</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'minting',
      title: 'Mint as Tokens',
      icon: <Coins size={20} />,
      content: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            {[
              { key: 'journal_entry', title: 'Journal Entry Data', desc: 'Personal journal NFT' },
              { key: 'recipe_data', title: 'Recipe Suggestions', desc: 'AI recipe recommendations' },
              { key: 'waste_reduction_data', title: 'Waste Reduction Tips', desc: 'Sustainability insights' },
              { key: 'environmental_impact', title: 'Environmental Data', desc: 'CO2 and sustainability metrics' }
            ].map((option) => (
              <div 
                key={option.key}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${selectedOptions[option.key as keyof MintingOptions] ? '#ed4c4c' : '#333333'}`,
                  background: selectedOptions[option.key as keyof MintingOptions] ? 'rgba(237, 76, 76, 0.1)' : '#111111',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '8px'
                }}
                onClick={() => handleToggleOption(option.key as keyof MintingOptions)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedOptions[option.key as keyof MintingOptions] ? (
                    <CheckCircle size={16} style={{ color: '#28a745' }} />
                  ) : (
                    <XCircle size={16} style={{ color: '#666666' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px', marginBottom: '2px' }}>
                      {option.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#faa09a' }}>
                      {option.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center',
              fontFamily: 'Grandstander, cursive',
              opacity: (isProcessing || !isConnected || Object.values(selectedOptions).every(v => !v)) ? 0.5 : 1
            }}
            onClick={handleMintSelected}
            disabled={isProcessing || !isConnected || Object.values(selectedOptions).every(v => !v)}
          >
            {isProcessing ? (
              <>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Processing...
              </>
            ) : !isConnected ? (
              <>
                <XCircle size={14} />
                Connect Wallet
              </>
            ) : Object.values(selectedOptions).every(v => !v) ? (
              <>
                <XCircle size={14} />
                Select Items
              </>
            ) : (
              <>
                <Coins size={14} />
                Mint ({Object.values(selectedOptions).filter(Boolean).length})
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const containerStyle: React.CSSProperties = {
    background: '#000000',
    color: '#ffffff',
    padding: '20px',
    borderRadius: '0 0 25px 25px',
    fontFamily: 'Figtree, sans-serif',
    position: 'relative'
  };

  const cardContainerStyle: React.CSSProperties = {
    position: 'relative',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '16px',
    background: '#111111',
    border: '2px solid #333333'
  };

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    transform: `translateX(0%)`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#ed4c4c',
    fontFamily: 'Grandstander, cursive'
  };

  const navigationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    padding: '0 8px'
  };

  const navButtonStyle: React.CSSProperties = {
    background: 'rgba(237, 76, 76, 0.2)',
    border: '1px solid #ed4c4c',
    color: '#ed4c4c',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const indicatorContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };

  const indicatorStyle = (active: boolean): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: active ? '#ed4c4c' : '#333333',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  });

  return (
    <div style={containerStyle}>
      <div style={cardContainerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            {cards[currentCard].icon}
            {cards[currentCard].title}
          </div>
          
          <div style={{ flex: 1, overflow: 'auto' }}>
            {cards[currentCard].content}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={navigationStyle}>
        <button
          style={navButtonStyle}
          onClick={prevCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ed4c4c';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(237, 76, 76, 0.2)';
            e.currentTarget.style.color = '#ed4c4c';
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={indicatorContainerStyle}>
          {cards.map((_, index) => (
            <div
              key={index}
              style={indicatorStyle(index === currentCard)}
              onClick={() => setCurrentCard(index)}
            />
          ))}
        </div>

        <button
          style={navButtonStyle}
          onClick={nextCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ed4c4c';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(237, 76, 76, 0.2)';
            e.currentTarget.style.color = '#ed4c4c';
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};