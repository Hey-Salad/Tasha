import React, { useState } from 'react';
import { WasteType } from '../../types/index';

type SimpleWasteFormProps = {
  isConnected: boolean;
  logWasteReduction: (amount: number, type: WasteType, description: string) => Promise<void>;
};

export default function SimpleWasteForm({
  isConnected,
  logWasteReduction
}: SimpleWasteFormProps) {
  const [wasteAmount, setWasteAmount] = useState<number>(1000);
  const [wasteType, setWasteType] = useState<WasteType>('donation');
  const [wasteDescription, setWasteDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [aiMessage, setAiMessage] = useState<string>('');
  const [userQuery, setUserQuery] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (wasteDescription.length < 10) {
      setError('Please provide a description of at least 10 characters');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await logWasteReduction(wasteAmount, wasteType, wasteDescription);
      
      // Reset form after successful submission
      setWasteDescription('');
      setAiMessage('Successfully logged waste reduction! You\'re helping reduce food waste.');
    } catch (error) {
      setError('Failed to log waste reduction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiQuery = () => {
    if (!userQuery.trim()) {
      return;
    }
    
    // Simulate AI response
    setIsSubmitting(true);
    
    setTimeout(() => {
      setAiMessage(
        `Based on your query "${userQuery}", I recommend logging food waste as "${wasteType}". 
        Food waste reduction is important because approximately 1.3 billion tonnes of food is wasted globally each year.
        Thank you for helping reduce food waste!`
      );
      setIsSubmitting(false);
    }, 1000);
    
    setUserQuery('');
  };

  return (
    <div style={{ 
      backgroundColor: '#111111', 
      borderRadius: '8px', 
      padding: '25px', 
      boxShadow: '0 2px 10px rgba(237,76,76,0.2)',
      border: '1px solid #333333',
      color: '#ffffff'
    }}>
      <h2 style={{ color: '#ed4c4c', marginBottom: '20px' }}>Log Your Food Waste Reduction</h2>
      
      {error && (
        <div style={{
          backgroundColor: 'rgba(255,0,0,0.1)',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Waste Amount (grams):
          </label>
          <input 
            type="number" 
            value={wasteAmount} 
            onChange={(e) => setWasteAmount(Number(e.target.value))}
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '10px',
              borderRadius: '4px',
              color: '#ffffff',
              width: '100%'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Waste Type:
          </label>
          <select 
            value={wasteType} 
            onChange={(e) => setWasteType(e.target.value as WasteType)}
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '10px',
              borderRadius: '4px',
              color: '#ffffff',
              width: '100%'
            }}
          >
            <option value="donation">Food Donation</option>
            <option value="efficient-delivery">Efficient Delivery</option>
            <option value="used-before-expiry">Used Before Expiry</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Description:
          </label>
          <textarea 
            value={wasteDescription} 
            onChange={(e) => setWasteDescription(e.target.value)}
            rows={4}
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '10px',
              borderRadius: '4px',
              color: '#ffffff',
              width: '100%',
              resize: 'vertical'
            }}
            placeholder="Describe how you reduced food waste..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || !isConnected}
          style={{
            backgroundColor: '#ed4c4c',
            color: '#ffffff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            cursor: isSubmitting || !isConnected ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !isConnected ? 0.7 : 1,
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {isSubmitting ? 'Logging...' : 'Log Waste Reduction'}
        </button>
      </form>
      
      <div style={{ marginTop: '30px', borderTop: '1px solid #333333', paddingTop: '20px' }}>
        <h3 style={{ color: '#ed4c4c', marginBottom: '15px' }}>AI Assistant</h3>
        
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          <input 
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask about food waste..."
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '10px',
              borderRadius: '4px 0 0 4px',
              color: '#ffffff',
              flexGrow: 1
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAiQuery();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAiQuery}
            style={{
              backgroundColor: '#ed4c4c',
              color: '#ffffff',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer'
            }}
          >
            Ask
          </button>
        </div>
        
        {aiMessage && (
          <div style={{
            backgroundColor: 'rgba(237,76,76,0.1)',
            padding: '15px',
            borderRadius: '4px',
            color: '#ffffff',
            marginTop: '10px'
          }}>
            <p>{aiMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}