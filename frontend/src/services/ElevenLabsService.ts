// services/ElevenLabsService.ts
// 11Labs Voice Assistant Integration proxied through Firebase Functions

import type { FoodVoiceAnalysis, VoiceConversation, VoiceSessionConfig } from '../types/foodAnalysis';

class ElevenLabsVoiceService {
  private apiBase = '/api/voice';

  async startVoiceSession(config: VoiceSessionConfig = {}): Promise<string> {
    const response = await fetch(`${this.apiBase}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to start voice session');
    }

    return data.conversationId as string;
  }

  async sendVoiceInput(conversationId: string, audioBlob: Blob, userMessage?: string): Promise<VoiceConversation> {
    const audioBase64 = await this.blobToBase64(audioBlob);
    const response = await fetch(`${this.apiBase}/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId,
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
        userMessage
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to process voice input');
    }

    const transcript = data.data?.transcript || userMessage || '';
    const analysis = await this.analyzeFoodConversation(transcript);

    return {
      id: conversationId,
      transcript,
      analysis,
      audioUrl: data.data?.audio_url,
      timestamp: new Date().toISOString()
    };
  }

  async textToSpeech(text: string, voiceId?: string, config: VoiceSessionConfig = {}): Promise<Blob> {
    const response = await fetch(`${this.apiBase}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, voiceId, config })
    });

    const data = await response.json();
    if (!response.ok || !data.success || !data.audioBase64) {
      throw new Error(data.error || 'Failed to generate speech');
    }

    const byteCharacters = atob(data.audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/mpeg' });
  }

  async endVoiceSession(_conversationId: string): Promise<void> {
    // Cleanup handled server-side. Method kept for compatibility.
    return Promise.resolve();
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string)?.split(',')[1];
        if (!base64) {
          reject(new Error('Unable to encode audio blob'));
        } else {
          resolve(base64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async analyzeFoodConversation(transcript: string): Promise<FoodVoiceAnalysis> {
    try {
      return {
        food_items: this.extractFoodItems(transcript),
        waste_reduction_actions: this.extractWasteActions(transcript),
        sustainability_insights: this.extractSustainabilityInsights(transcript),
        recipe_suggestions: this.extractRecipeSuggestions(transcript),
        confidence_score: 0.85,
        conversation_summary: `Discussed food and sustainability topics: ${transcript.substring(0, 100)}...`
      };
    } catch (error) {
      console.error('Error analyzing food conversation:', error);
      return {
        food_items: [],
        waste_reduction_actions: [],
        sustainability_insights: [],
        recipe_suggestions: [],
        confidence_score: 0.5,
        conversation_summary: transcript.substring(0, 100) + '...'
      };
    }
  }

  private extractFoodItems(transcript: string): string[] {
    const foodKeywords = [
      'apple',
      'banana',
      'bread',
      'milk',
      'cheese',
      'chicken',
      'beef',
      'fish',
      'vegetables',
      'fruits',
      'pasta',
      'rice',
      'salad',
      'soup',
      'sandwich'
    ];
    const words = transcript.toLowerCase().split(/\s+/);
    return foodKeywords.filter((keyword) => words.some((word) => word.includes(keyword)));
  }

  private extractWasteActions(transcript: string): string[] {
    const actions = ['donated', 'composted', 'stored', 'shared', 'reused', 'froze'];
    return actions.filter((action) => transcript.toLowerCase().includes(action));
  }

  private extractSustainabilityInsights(transcript: string): string[] {
    const insights = ['carbon', 'footprint', 'waste', 'sustainability', 'environment'];
    return insights.filter((insight) => transcript.toLowerCase().includes(insight));
  }

  private extractRecipeSuggestions(transcript: string): string[] {
    const suggestions = ['soup', 'salad', 'stew', 'stir fry', 'smoothie'];
    return suggestions.filter((suggestion) => transcript.toLowerCase().includes(suggestion));
  }
}

export const elevenLabsService = new ElevenLabsVoiceService();
export type { VoiceSessionConfig, VoiceConversation, FoodVoiceAnalysis };
export default elevenLabsService;
