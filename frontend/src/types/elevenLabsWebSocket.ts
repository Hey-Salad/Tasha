'use client';

type BaseEvent = {
  type: string;
};

export type UserTranscriptEvent = BaseEvent & {
  type: 'user_transcript';
  user_transcription_event: {
    user_transcript: string;
  };
};

export type AgentResponseEvent = BaseEvent & {
  type: 'agent_response';
  agent_response_event: {
    agent_response: string;
  };
};

export type AgentResponseCorrectionEvent = BaseEvent & {
  type: 'agent_response_correction';
  agent_response_correction_event: {
    original_agent_response: string;
    corrected_agent_response: string;
  };
};

export type AudioResponseEvent = BaseEvent & {
  type: 'audio';
  audio_event: {
    audio_base_64: string;
    event_id: number;
  };
};

export type InterruptionEvent = BaseEvent & {
  type: 'interruption';
  interruption_event: {
    reason: string;
  };
};

export type PingEvent = BaseEvent & {
  type: 'ping';
  ping_event: {
    event_id: number;
    ping_ms?: number;
  };
};

export type ElevenLabsWebSocketEvent =
  | UserTranscriptEvent
  | AgentResponseEvent
  | AgentResponseCorrectionEvent
  | AudioResponseEvent
  | InterruptionEvent
  | PingEvent;
