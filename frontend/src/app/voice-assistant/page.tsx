'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader, 
  Sparkles, 
  RotateCcw, 
  Lock, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Send,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { usePolkadotWallet } from '../../hooks/usePolkadotWallet';
import { elevenLabsService, type VoiceConversation } from '../../services/ElevenLabsService';

interface VoiceSession {
  id: string;
  conversations: VoiceConversation[];
  startTime: string;
  isActive: boolean;
}

export default function VoiceAssistantPage() {
  const { isConnected, signMessage } = usePolkadotWallet();
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Conversation state
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio elements and media recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (isConnected) {
      // For demo purposes, auto-authenticate when wallet is connected
      // In production, you might want to require explicit authentication
      setIsAuthenticated(true);
    }
  }, [isConnected]);

  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsPaused(false);
    setRecordingTime(0);
    setError(null);
    setCurrentSession(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleAuthenticate = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      const message = `Authenticate Voice Assistant Access\nTimestamp: ${Date.now()}`;
      
      await signMessage(message);
      setIsAuthenticated(true);
      setError(null);
      
      // Start a new voice session
      const sessionId = await elevenLabsService.startVoiceSession({
        voice_id: 'pNInz6obpgDQGcFmaJgB', // Tasha voice
        language: 'en'
      });
      
      const newSession: VoiceSession = {
        id: sessionId,
        conversations: [],
        startTime: new Date().toISOString(),
        isActive: true
      };
      
      setCurrentSession(newSession);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      alert('Authentication failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', error);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Play recorded audio
  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  // Pause audio playback
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  // Clear current recording
  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsPaused(false);
    setRecordingTime(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Send audio to voice assistant
  const sendAudioToAssistant = async () => {
    if (!audioBlob || !currentSession) return;

    try {
      setIsProcessing(true);
      setError(null);

      const conversation = await elevenLabsService.sendVoiceInput(
        currentSession.id,
        audioBlob
      );

      // Update session with new conversation
      setCurrentSession(prev => prev ? {
        ...prev,
        conversations: [...prev.conversations, conversation]
      } : null);

      // Clear the current recording
      clearRecording();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    fontFamily: 'Grandstander, cursive'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#faa09a',
    margin: 0
  };

  const mainContentStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '25px',
    background: '#111111',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15)',
    overflow: 'hidden',
    border: '2px solid #333333'
  };

  const authSectionStyle: React.CSSProperties = {
    padding: '40px 24px',
    textAlign: 'center',
    background: '#111111'
  };

  const authButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 auto',
    fontFamily: 'Grandstander, cursive'
  };

  // Authentication required screen
  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <Link href="/" style={backButtonStyle}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={titleStyle}>Voice Assistant</h1>
            <p style={subtitleStyle}>AI-powered voice analysis</p>
          </div>
        </header>

        <div style={{ padding: '24px' }}>
          <div style={mainContentStyle}>
            <div style={cardStyle}>
              <div style={authSectionStyle}>
                <Lock size={48} style={{ color: '#ed4c4c', marginBottom: '24px' }} />
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px',
                  fontFamily: 'Grandstander, cursive'
                }}>
                  Authentication Required
                </h2>
                <p style={{
                  color: '#faa09a',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Sign a message with your wallet to authenticate and access voice assistant features.
                </p>
                
                {!isConnected ? (
                  <p style={{
                    color: '#dc3545',
                    marginBottom: '24px',
                    fontSize: '14px'
                  }}>
                    Please connect your wallet first from the dashboard.
                  </p>
                ) : (
                  <button
                    style={authButtonStyle}
                    onClick={handleAuthenticate}
                    disabled={isProcessing}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Sign to Authenticate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      <header style={headerStyle}>
        <Link href="/" style={backButtonStyle}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={titleStyle}>Voice Assistant</h1>
          <p style={subtitleStyle}>AI-powered voice analysis</p>
        </div>
        {currentSession && (
          <button
            style={{
              ...backButtonStyle,
              marginLeft: 'auto'
            }}
            onClick={handleReset}
            title="Reset Session"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </header>

      <div style={{ padding: '24px' }}>
        <div style={mainContentStyle}>
          {/* HeySalad Logo in Center */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <img 
              src="/HeySalad Logo White.png" 
              alt="HeySalad Logo" 
              style={{
                width: '120px',
                height: '38px',
                objectFit: 'contain',
                opacity: 0.3
              }}
            />
          </div>
          <div style={cardStyle}>
            {/* Voice Interface */}
            <div style={{ 
              width: '100%', 
              aspectRatio: '4/5', 
              background: '#000000', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}>
              {/* Recording Button */}
              <div style={{ 
                position: 'relative',
                marginBottom: '32px'
              }}>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isRecording 
                      ? 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)' 
                      : 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isRecording 
                      ? '0 8px 24px rgba(220, 53, 69, 0.4)' 
                      : '0 8px 24px rgba(237, 76, 76, 0.3)',
                    transform: isRecording ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {isRecording ? <Square size={40} /> : <Mic size={40} />}
                </button>
                
                {isRecording && (
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    border: '3px solid #dc3545',
                    animation: 'pulse 2s infinite'
                  }}></div>
                )}
              </div>

              {/* Recording Status */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {isRecording ? (
                  <div>
                    <p style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#dc3545', 
                      margin: '0 0 8px 0' 
                    }}>
                      Recording...
                    </p>
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#faa09a', 
                      margin: 0 
                    }}>
                      {formatTime(recordingTime)}
                    </p>
                  </div>
                ) : audioBlob ? (
                  <div>
                    <p style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#28a745', 
                      margin: '0 0 8px 0' 
                    }}>
                      Recording Ready
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#faa09a', 
                      margin: 0 
                    }}>
                      Tap play to review or send to analyze
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#ffffff', 
                      margin: '0 0 8px 0' 
                    }}>
                      Ready to Record
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#faa09a', 
                      margin: 0 
                    }}>
                      Tap microphone to start voice recording
                    </p>
                  </div>
                )}
              </div>

              {/* Audio Controls */}
              {audioBlob && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#333333',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <button
                    onClick={clearRecording}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#666666',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}

              {/* Send Button */}
              {audioBlob && (
                <button
                  onClick={sendAudioToAssistant}
                  disabled={isProcessing}
                  style={{
                    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send to Tasha
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '20px',
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                margin: '16px',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#dc3545', 
                  marginBottom: '8px', 
                  fontWeight: '600' 
                }}>
                  <AlertCircle size={16} />
                  Processing Error
                </div>
                <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '12px' }}>
                  {error}
                </div>
                <button 
                  style={{
                    background: 'transparent',
                    border: '1px solid #dc3545',
                    color: '#dc3545',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Conversation History */}
            {currentSession && currentSession.conversations.length > 0 && (
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  Conversation History
                </h3>
                
                {currentSession.conversations.map((conversation, index) => (
                  <div key={index} style={{
                    background: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #333333'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#faa09a'
                      }}>
                        {new Date(conversation.timestamp).toLocaleTimeString()}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        background: '#333333',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        color: '#faa09a'
                      }}>
                        {(conversation.analysis.confidence_score * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    
                    {conversation.transcript && (
                      <p style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        "{conversation.transcript}"
                      </p>
                    )}
                    
                    {conversation.analysis.food_items.length > 0 && (
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#faa09a' }}>Foods: </span>
                        <span style={{ fontSize: '13px', color: '#ffffff' }}>
                          {conversation.analysis.food_items.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {conversation.analysis.waste_reduction_actions.length > 0 && (
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#28a745' }}>Actions: </span>
                        <span style={{ fontSize: '13px', color: '#ffffff' }}>
                          {conversation.analysis.waste_reduction_actions.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}

                    {conversation.audioUrl && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '8px'
                      }}>
                        <Volume2 size={14} style={{ color: '#faa09a' }} />
                        <span style={{ fontSize: '11px', color: '#faa09a' }}>
                          Response available
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tips Section */}
            <div style={{
              margin: '16px',
              background: 'rgba(237, 76, 76, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(237, 76, 76, 0.1)'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#faa09a',
                marginBottom: '8px'
              }}>
                💡 Voice Assistant Tips
              </h4>
              <ul style={{
                fontSize: '12px',
                color: '#cccccc',
                margin: 0,
                paddingLeft: '16px',
                lineHeight: '1.4'
              }}>
                <li>Describe your food waste reduction activities</li>
                <li>Ask for recipe suggestions from leftovers</li>
                <li>Share your sustainability goals</li>
                <li>Request cooking tips to prevent waste</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}