import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mic, Type, Check } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { WasteType } from '../../types/index';
import { ConversationMessage } from '../../services/ElevenLabsService';

// Fallback icons in case Lucide is not available
const FallbackIcons = {
  Mic: () => <span>🎤</span>,
  Type: () => <span>✏️</span>,
  Check: () => <span>✓</span>
};

type WasteFormProps = {
  isConnected: boolean;
  logWasteReduction: (amount: number, type: WasteType, description: string) => Promise<void>;
};

type Role = 'user' | 'ai';

// Define interfaces that match your implementation
interface MessageFromAI {
  message: string;
  source: Role;
}

// Simple version that will work with 11Labs
function WasteForm({ 
  isConnected, 
  logWasteReduction 
}: WasteFormProps) {
  const [wasteAmount, setWasteAmount] = useState<number>(1000);
  const [wasteType, setWasteType] = useState<WasteType>('donation');
  const [wasteDescription, setWasteDescription] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [aiAssistance, setAiAssistance] = useState<string>('');
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);

  // Use the hook at the component level - keep it simple
  const { status, startSession, endSession, isSpeaking } = useConversation({
    onConnect: () => console.log('Connected to 11Labs'),
    onMessage: (message: MessageFromAI) => {
      console.log('Message received:', message);
      
      // Only update if it's an AI message
      if (message.source === 'ai') {
        setAiAssistance(message.message);
      }
    },
    onError: (errorMessage: string) => {
      console.error('11Labs error:', errorMessage);
      setError('AI assistant error: ' + errorMessage);
    }
  });

  const [conversationId, setConversationId] = useState<string | null>(null);

  // Initialize 11Labs conversation on component mount
  useEffect(() => {
    console.log('WasteForm component mounted');
    
    const initializeAssistant = async () => {
      try {
        // Get the API key from environment variables
        const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
        
        if (!agentId) {
          console.warn('No agent ID found, using test mode');
          setAiAssistance("Hello! I'm Tasha, your HeySalad food waste reduction assistant. I'm here to help you log and verify your food waste reduction efforts so you can earn FWT tokens!");
          return;
        }
        
        // Start the conversation session
        const id = await startSession({
          agentId: agentId
        });
        
        setConversationId(id);
        console.log('Started conversation with ID:', id);
      } catch (err) {
        console.error('Failed to start AI assistant:', err);
        setError('Could not connect to AI assistant');
        
        // Fallback to static message
        setAiAssistance("Hello! I'm Tasha, your HeySalad food waste reduction assistant. I'm here to help you log and verify your food waste reduction efforts so you can earn FWT tokens!");
      }
    };
    
    initializeAssistant();
    
    // Clean up on component unmount
    return () => {
      if (conversationId) {
        endSession();
        console.log('Ended conversation session');
      }
    };
  }, [startSession, endSession]);

  // Speech-to-text functionality
  const handleSpeechToText = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      // Check for browser support
      if (!('webkitSpeechRecognition' in window)) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setWasteDescription(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setError('Error accessing microphone');
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (wasteDescription.length < 10) {
      setError('Please provide a description of at least 10 characters');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      // Log waste reduction
      await logWasteReduction(wasteAmount, wasteType, wasteDescription);
      
      // Reset form after successful submission
      setWasteDescription('');
      setWasteAmount(1000);
      
      // Update AI message with success feedback
      setAiAssistance(`Great job reducing ${wasteAmount} grams of food waste through ${wasteType}! Your contribution has been logged and tokens awarded. Thank you for helping reduce food waste!`);
    } catch (error) {
      setError('Failed to log waste reduction');
    } finally {
      setIsVerifying(false);
    }
  };

  // Replace Lucide icons with fallback icons if needed
  const MicIcon = Mic || FallbackIcons.Mic;
  const TypeIcon = Type || FallbackIcons.Type;
  const CheckIcon = Check || FallbackIcons.Check;

  return (
    <div style={{ 
      backgroundColor: '#111111', 
      borderRadius: '8px', 
      padding: '25px', 
      boxShadow: '0 2px 10px rgba(237,76,76,0.2)',
      border: '1px solid #333333',
      color: '#ffffff',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ color: '#ed4c4c', marginBottom: '20px', fontSize: '1.5rem' }}>Log Your Food Waste Reduction</h2>
      
      {/* AI Assistant Message */}
      <div style={{
        backgroundColor: 'rgba(237,76,76,0.1)',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          borderRadius: '50%',
          backgroundColor: '#ed4c4c',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '20px' }}>🥗</span>
        </div>
        <div>
          <h3 style={{ 
            margin: '0 0 5px 0', 
            color: '#ed4c4c',
            fontSize: '1.1rem'
          }}>
            Tasha - Your Food Waste Reduction Assistant
            {isSpeaking && <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: '#faa09a' }}>(Speaking...)</span>}
          </h3>
          <p style={{ margin: 0, lineHeight: '1.5' }}>
            {aiAssistance || "Loading assistant..."}
          </p>
        </div>
      </div>
      
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
      
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Waste Amount Input */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaaaaa' }}>
            Waste Amount (grams):
          </label>
          <input 
            type="number" 
            value={wasteAmount} 
            onChange={(e) => setWasteAmount(Number(e.target.value))}
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '12px',
              borderRadius: '4px',
              color: '#ffffff',
              width: '100%',
              fontSize: '1rem'
            }}
            min="1"
          />
        </div>
        
        {/* Waste Type Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaaaaa' }}>
            Waste Type:
          </label>
          <select 
            value={wasteType} 
            onChange={(e) => setWasteType(e.target.value as WasteType)}
            style={{
              backgroundColor: '#222222',
              border: '1px solid #333333',
              padding: '12px',
              borderRadius: '4px',
              color: '#ffffff',
              width: '100%',
              fontSize: '1rem'
            }}
          >
            <option value="donation">Food Donation</option>
            <option value="efficient-delivery">Efficient Delivery</option>
            <option value="used-before-expiry">Used Before Expiry</option>
          </select>
        </div>
        
        {/* Input Mode Toggle */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaaaaa' }}>
            Input Mode:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              style={{
                backgroundColor: inputMode === 'text' ? '#ed4c4c' : '#333333',
                color: '#ffffff',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <TypeIcon size={18} />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('audio')}
              style={{
                backgroundColor: inputMode === 'audio' ? '#ed4c4c' : '#333333',
                color: '#ffffff',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <MicIcon size={18} />
              <span>Voice</span>
            </button>
          </div>
        </div>
        
        {/* Description Input */}
        {inputMode === 'text' ? (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaaaaa' }}>
              Description:
            </label>
            <textarea 
              value={wasteDescription} 
              onChange={(e) => setWasteDescription(e.target.value)}
              rows={4}
              style={{
                backgroundColor: '#222222',
                border: '1px solid #333333',
                padding: '12px',
                borderRadius: '4px',
                color: '#ffffff',
                width: '100%',
                resize: 'vertical',
                fontSize: '1rem'
              }}
              placeholder="Describe how you reduced food waste..."
            />
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaaaaa' }}>
              Voice Description:
            </label>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={handleSpeechToText}
                disabled={isListening}
                style={{
                  backgroundColor: isListening ? '#555555' : '#ed4c4c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '4px',
                  cursor: isListening ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <MicIcon size={24} />
                <span>{isListening ? 'Listening...' : 'Start Speaking'}</span>
              </button>
              
              {wasteDescription && (
                <div style={{ 
                  backgroundColor: '#222222',
                  border: '1px solid #333333',
                  padding: '12px',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <p style={{ margin: 0, color: '#ffffff' }}>{wasteDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button 
        type="button" 
        onClick={handleSubmit}
        disabled={isVerifying || wasteDescription.length < 10 || !isConnected}
        style={{
          backgroundColor: '#ed4c4c',
          color: '#ffffff',
          border: 'none',
          padding: '15px',
          borderRadius: '4px',
          cursor: isVerifying || wasteDescription.length < 10 || !isConnected ? 'not-allowed' : 'pointer',
          opacity: isVerifying || wasteDescription.length < 10 || !isConnected ? 0.7 : 1,
          fontWeight: 'bold',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '1rem'
        }}
      >
        {isVerifying ? (
          <>
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <CheckIcon size={20} />
            <span>Log Waste Reduction</span>
          </>
        )}
      </button>
      
      {/* Connection Status (for debugging) */}
      <div style={{ 
        fontSize: '0.7rem', 
        marginTop: '10px', 
        textAlign: 'right',
        color: status === 'connected' ? '#4caf50' : '#aaaaaa'
      }}>
        11Labs: {status}
      </div>
    </div>
  );
}

// Dynamically import the component to ensure client-side rendering
export default dynamic(() => Promise.resolve(WasteForm), { ssr: false });