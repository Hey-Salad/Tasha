'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Waves, AlertCircle, Square, Coins, CheckCircle } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import { useVoiceWasteMinting } from '../../hooks/useVoiceWasteMinting';

type ConversationMessage = {
  message: string;
  source: string;
};

type TranscriptMessage = {
  text: string;
  source: 'user' | 'agent';
  timestamp: number;
};

export default function VoiceAssistantPage() {
  const { assetHubApi, selectedAccount, signAndSendTransaction } = usePolkadotWallet();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  const { mintingStatus, processMessage, clearMintingStatus } = useVoiceWasteMinting(
    assetHubApi,
    selectedAccount,
    signAndSendTransaction
  );

  const debugLog = (type: string, message: unknown): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}]`, message);
  };

  const speakText = async (text: string) => {
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voiceId: 'pNInz6obpgDQGcFmaJgB'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      debugLog('Agent', 'Connected and listening');
      setIsListening(true);
      setError("");
    },
    onDisconnect: () => {
      debugLog('Agent', 'Disconnected');
      setIsListening(false);
    },
    onMessage: (message: ConversationMessage) => {
      debugLog('Message', {
        content: message.message,
        source: message.source
      });

      const newMessage: TranscriptMessage = {
        text: message.message,
        source: message.source === 'user' ? 'user' : 'agent',
        timestamp: Date.now()
      };

      setTranscript(prev => [...prev, newMessage]);

      // Process message for waste detection and minting
      processMessage(message.message, newMessage.source);

      // Speak agent messages
      if (message.source === 'agent' || message.source === 'ai') {
        speakText(message.message);
      }
    },
    onError: (error: Error) => {
      debugLog('Error', error);
      setIsListening(false);
      setError("Sorry, I encountered an error. Please try again.");
    }
  });

  // Add welcome message on mount (client-side only to avoid hydration issues)
  useEffect(() => {
    setTranscript([{
      text: "Hey! I'm Tasha, your food waste reduction assistant. Tell me about any food you've thrown away, or ask me for tips on keeping food fresh!",
      source: 'agent',
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    const conversationContainer = document.querySelector('.conversation-container');
    if (conversationContainer) {
      conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
  }, [transcript]);

  const handleMicClick = async (): Promise<void> => {
    debugLog('Action', isListening ? 'Stopping conversation' : 'Starting conversation');

    try {
      if (isListening) {
        await conversation.endSession();
      } else {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: 'Nnwf6EF9RgYOj6c1a9VU'
        });
      }
    } catch (err) {
      debugLog('Error', err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#000000',
    fontFamily: 'Figtree, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    borderBottom: '2px solid #333333'
  };

  const backButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '25px',
    background: '#111111',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)',
    border: '2px solid #333333',
    padding: '24px'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <Link href="/" style={backButtonStyle}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#ffffff',
            margin: 0,
            fontFamily: 'Grandstander, cursive'
          }}>
            Voice Assistant - Tasha
          </h1>
          <p style={{ fontSize: '14px', color: '#faa09a', margin: 0 }}>
            Real-time conversational AI for food waste tracking
          </p>
        </div>
      </header>

      <div style={mainContentStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Control Panel */}
          <div style={cardStyle}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                Voice Control
              </h2>
              <button
                onClick={handleMicClick}
                style={{
                  padding: '16px',
                  borderRadius: '50%',
                  background: isListening
                    ? 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)'
                    : '#222222',
                  border: isListening ? 'none' : '2px solid #444444',
                  cursor: 'pointer',
                  boxShadow: isListening ? '0 4px 16px rgba(237, 76, 76, 0.5)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isListening ? (
                  <Square size={28} color="#ffffff" />
                ) : (
                  <Mic size={28} color="#666666" />
                )}
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isListening ? '#28a745' : '#666666',
                boxShadow: isListening ? '0 0 12px rgba(40, 167, 69, 0.6)' : 'none',
                margin: '0 auto 16px',
                animation: isListening ? 'pulse 2s infinite' : 'none'
              }} />
              <p style={{ color: '#cccccc', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                {isListening ? 'LISTENING' : 'READY'}
              </p>
              <p style={{ color: '#888888', fontSize: '14px', lineHeight: 1.6 }}>
                {isListening
                  ? "I'm listening... Speak naturally about your food items!"
                  : "Click the microphone button to start talking to Tasha"}
              </p>
            </div>

            {error && (
              <div style={{
                padding: '16px',
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                borderRadius: '12px',
                color: '#dc3545',
                marginTop: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  fontWeight: 600
                }}>
                  <AlertCircle size={16} />
                  Error
                </div>
                <p style={{ fontSize: '13px', margin: 0 }}>{error}</p>
              </div>
            )}
          </div>

          {/* Transcript Panel */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Waves size={20} style={{ color: '#faa09a' }} />
              Live Transcript
            </h2>
            <div
              className="conversation-container"
              style={{
                maxHeight: '500px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingRight: '8px'
              }}
            >
              {transcript.map((message, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: message.source === 'user' ? 'flex-end' : 'flex-start',
                    background: message.source === 'user'
                      ? 'linear-gradient(135deg, rgba(237, 76, 76, 0.15) 0%, rgba(250, 160, 154, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: message.source === 'user'
                      ? '1px solid rgba(237, 76, 76, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    maxWidth: '80%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: message.source === 'user' ? '#faa09a' : '#888888',
                      fontWeight: 600
                    }}>
                      {message.source === 'user' ? 'You' : 'Tasha'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#555555' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div style={{ ...cardStyle, background: '#0b0b0b' }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            💡 Tips for Best Results
          </h3>
          <ul style={{
            color: '#cccccc',
            fontSize: '14px',
            margin: 0,
            paddingLeft: '20px',
            lineHeight: 1.8
          }}>
            <li>Speak clearly and naturally about your food items</li>
            <li>Mention quantities, expiry dates, and item conditions</li>
            <li>Ask for recipe ideas or sustainability tips</li>
            <li>Keep your microphone unmuted while the assistant is listening</li>
          </ul>
        </div>
      </div>

      {/* Minting Status */}
      {mintingStatus.isMinting && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(237, 76, 76, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            animation: 'spin 1s linear infinite'
          }}>
            <Coins size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              Minting Tokens...
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {mintingStatus.wasteItem?.itemName} ({mintingStatus.wasteItem?.weightGrams}g)
            </div>
          </div>
        </div>
      )}

      {/* Minting Success */}
      {!mintingStatus.isMinting && mintingStatus.tokensMinted > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #28a745 0%, #34d058 100%)',
          color: 'white',
          padding: '20px 28px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(40, 167, 69, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          cursor: 'pointer'
        }}
        onClick={clearMintingStatus}
        >
          <CheckCircle size={32} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>
              +{mintingStatus.tokensMinted} Tokens Minted!
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              {mintingStatus.wasteItem?.itemName} logged successfully
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              Click to dismiss
            </div>
          </div>
        </div>
      )}

      {/* Minting Error */}
      {mintingStatus.error && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#dc3545',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(220, 53, 69, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          cursor: 'pointer'
        }}
        onClick={clearMintingStatus}
        >
          <AlertCircle size={24} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              Minting Failed
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {mintingStatus.error}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .conversation-container::-webkit-scrollbar {
          width: 6px;
        }

        .conversation-container::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }

        .conversation-container::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 3px;
        }

        .conversation-container::-webkit-scrollbar-thumb:hover {
          background: #444444;
        }
      `}</style>
    </div>
  );
}
