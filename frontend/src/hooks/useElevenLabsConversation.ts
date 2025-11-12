'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildFunctionsUrl, parseJsonResponse } from '../utils/functionsClient';
import type { ElevenLabsWebSocketEvent } from '../types/elevenLabsWebSocket';

export type ConversationMessage = {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: number;
};

export type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface StartOptions {
  agentId?: string;
  metadata?: Record<string, unknown>;
}

const base64FromArrayBuffer = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const useElevenLabsConversation = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAudioRef = useRef(false);

  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const appendMessage = useCallback((role: ConversationMessage['role'], text: string) => {
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        text,
        timestamp: Date.now()
      }
    ]);
  }, []);

  const updateLastAgentMessage = useCallback((text: string) => {
    setMessages((prev) => {
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        if (prev[i].role === 'agent') {
          const clone = [...prev];
          clone[i] = { ...clone[i], text };
          return clone;
        }
      }
      return prev;
    });
  }, []);

  const playNextAudio = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingAudioRef.current = false;
      setIsAgentSpeaking(false);
      console.log('[ElevenLabs] Audio queue empty');
      return;
    }

    const next = audioQueueRef.current.shift();
    if (!next) {
      isPlayingAudioRef.current = false;
      setIsAgentSpeaking(false);
      return;
    }

    isPlayingAudioRef.current = true;
    setIsAgentSpeaking(true);

    console.log('[ElevenLabs] Playing audio chunk from queue');
    const audio = new Audio(`data:audio/mpeg;base64,${next}`);
    audioElementRef.current = audio;
    audio.volume = 1.0; // Ensure volume is at max

    const finalize = () => {
      console.log('[ElevenLabs] Audio chunk finished');
      audioElementRef.current = null;
      playNextAudio();
    };

    audio.onended = finalize;
    audio.onerror = (e) => {
      console.error('[ElevenLabs] Audio playback error:', e);
      finalize();
    };

    audio.play()
      .then(() => console.log('[ElevenLabs] Audio playing'))
      .catch(err => {
        console.error('[ElevenLabs] Audio play failed:', err);
        finalize();
      });
  }, []);

  const enqueueAudio = useCallback(
    (base64: string) => {
      console.log('[ElevenLabs] Enqueuing audio chunk, queue size:', audioQueueRef.current.length + 1);
      audioQueueRef.current.push(base64);
      if (!isPlayingAudioRef.current) {
        console.log('[ElevenLabs] Starting playback from queue');
        playNextAudio();
      }
    },
    [playNextAudio]
  );

  const stopStreamingAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const sendWsMessage = useCallback((payload: object) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(JSON.stringify(payload));
  }, []);

  const handlePing = useCallback(
    (event: ElevenLabsWebSocketEvent) => {
      if (event.type !== 'ping') return;
      const delay = event.ping_event.ping_ms || 0;
      if (delay > 0) {
        setTimeout(() => {
          sendWsMessage({
            type: 'pong',
            event_id: event.ping_event.event_id
          });
        }, delay);
      } else {
        sendWsMessage({
          type: 'pong',
          event_id: event.ping_event.event_id
        });
      }
    },
    [sendWsMessage]
  );

  const requestSignedUrl = useCallback(async (agentId?: string) => {
    const response = await fetch(buildFunctionsUrl('/voice/socket-url'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId })
    });

    const data = await parseJsonResponse<{ success: boolean; signedUrl: string; error?: string }>(response);
    if (!data.success || !data.signedUrl) {
      throw new Error(data.error || 'Unable to obtain ElevenLabs signed URL');
    }
    return data.signedUrl;
  }, []);

  const startStreamingAudio = useCallback(() => {
    if (!wsRef.current) {
      throw new Error('WebSocket is not ready');
    }

    const enableMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      let audioChunkCount = 0;
      recorder.ondataavailable = async (event) => {
        if (!wsRef.current) {
          return;
        }
        if (wsRef.current.readyState !== WebSocket.OPEN) {
          console.warn('[ElevenLabs] WebSocket not ready for audio, state:', wsRef.current.readyState);
          return;
        }
        if (event.data.size === 0) return;
        const buffer = await event.data.arrayBuffer();
        const base64 = base64FromArrayBuffer(buffer);
        audioChunkCount++;
        if (audioChunkCount === 1 || audioChunkCount % 10 === 0) {
          console.log(`[ElevenLabs] Sent ${audioChunkCount} audio chunks (${buffer.byteLength} bytes each)`);
        }
        sendWsMessage({
          user_audio_chunk: base64
        });
      };

      recorder.start(100);
    };

    return enableMedia();
  }, [sendWsMessage]);

  const startConversation = useCallback(
    async (options?: StartOptions) => {
      if (status === 'connecting' || status === 'connected') {
        return;
      }
      setStatus('connecting');
      setLastError(null);
      setMessages([]);

      try {
        console.log('[ElevenLabs] Requesting signed URL...');
        const signedUrl = await requestSignedUrl(options?.agentId);
        console.log('[ElevenLabs] Got signed URL, connecting WebSocket...');
        const websocket = new WebSocket(signedUrl);

        websocket.onopen = async () => {
          console.log('[ElevenLabs] WebSocket connected!');
          wsRef.current = websocket;

          console.log('[ElevenLabs] Sending conversation initiation...');
          sendWsMessage({
            type: 'conversation_initiation_client_data'
          });

          // Wait a moment for WebSocket to be fully ready
          await new Promise(resolve => setTimeout(resolve, 100));

          try {
            console.log('[ElevenLabs] Starting audio streaming...');
            await startStreamingAudio();
            console.log('[ElevenLabs] Audio streaming started successfully');
            setStatus('connected');
          } catch (error) {
            console.error('[ElevenLabs] Microphone error:', error);
            setLastError(
              error instanceof Error ? error.message : 'Microphone access denied. Please allow microphone access.'
            );
            setStatus('error');
          }
        };

        websocket.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data) as ElevenLabsWebSocketEvent;
            console.log('[ElevenLabs] Received event:', data.type);
            handlePing(data);

            switch (data.type) {
              case 'user_transcript':
                console.log('[ElevenLabs] User said:', data.user_transcription_event.user_transcript);
                appendMessage('user', data.user_transcription_event.user_transcript);
                break;
              case 'agent_response':
                console.log('[ElevenLabs] Agent response:', data.agent_response_event.agent_response);
                appendMessage('agent', data.agent_response_event.agent_response);
                break;
              case 'agent_response_correction':
                console.log('[ElevenLabs] Response corrected');
                updateLastAgentMessage(data.agent_response_correction_event.corrected_agent_response);
                break;
              case 'audio': {
                const audioBase64 =
                  data.audio_event.audio_base_64 ||
                  (data as any).audio_event?.audio_base64 ||
                  (data as any).audio_event?.audioChunk;
                if (audioBase64) {
                  console.log('[ElevenLabs] Received audio chunk, size:', audioBase64.length);
                  enqueueAudio(audioBase64);
                } else {
                  console.warn('[ElevenLabs] Received audio event without base64 payload:', data);
                }
                break;
              }
              case 'interruption':
                console.log('[ElevenLabs] Interrupted:', data.interruption_event.reason);
                appendMessage('system', `Conversation interrupted: ${data.interruption_event.reason}`);
                break;
              default:
                console.log('[ElevenLabs] Unhandled event type:', data.type);
                break;
            }
          } catch (error) {
            console.error('[ElevenLabs] Failed to parse event:', error, messageEvent.data);
          }
        };

        websocket.onerror = (event) => {
          console.error('[ElevenLabs] WebSocket error:', event);
          setLastError('Lost connection to ElevenLabs agent.');
          setStatus('error');
        };

        websocket.onclose = (event) => {
          console.log('[ElevenLabs] WebSocket closed:', event.code, event.reason);
          wsRef.current = null;
          stopStreamingAudio();
          isPlayingAudioRef.current = false;
          setIsAgentSpeaking(false);
          setStatus('idle');
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start ElevenLabs conversation.';
        setLastError(message);
        setStatus('error');
      }
    },
    [appendMessage, enqueueAudio, handlePing, requestSignedUrl, startStreamingAudio, status, stopStreamingAudio, updateLastAgentMessage, sendWsMessage]
  );

  const stopConversation = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopStreamingAudio();
    isPlayingAudioRef.current = false;
    setIsAgentSpeaking(false);
    setStatus('idle');
  }, [stopStreamingAudio]);

  useEffect(() => {
    return () => {
      stopConversation();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, [stopConversation]);

  return {
    status,
    messages,
    lastError,
    isAgentSpeaking,
    startConversation,
    stopConversation
  };
};
