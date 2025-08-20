// services/elevenLabsService.ts
// 11Labs Voice Assistant Integration for HeySalad Tasha

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export interface VoiceConversation {
  id: string;
  transcript: string;
  analysis: FoodVoiceAnalysis;
  audioUrl?: string;
  timestamp: string;
}

export interface FoodVoiceAnalysis {
  food_items: string[];
  waste_reduction_actions: string[];
  sustainability_insights: string[];
  recipe_suggestions: string[];
  confidence_score: number;
  conversation_summary: string;
}

export interface VoiceSessionConfig {
  voice_id?: string;
  language?: string;
  response_format?: 'mp3' | 'wav';
  stability?: number;
  similarity_boost?: number;
}

class ElevenLabsVoiceService {
  private apiKey: string;
  private agentId: string;
  private baseURL = 'https://api.elevenlabs.io/v1';
  
  constructor() {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('11Labs API key not configured. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to your environment.');
    }
    
    if (!ELEVENLABS_AGENT_ID) {
      throw new Error('11Labs Agent ID not configured. Please add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your environment.');
    }
    
    this.apiKey = ELEVENLABS_API_KEY;
    this.agentId = ELEVENLABS_AGENT_ID;
  }

  /**
   * Start a voice conversation session with HeySalad Tasha
   */
  async startVoiceSession(config: VoiceSessionConfig = {}): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/conversational-ai/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          ...config
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start voice session: ${response.statusText}`);
      }

      const data = await response.json();
      return data.conversation_id;
    } catch (error) {
      console.error('Error starting voice session:', error);
      throw error;
    }
  }

  /**
   * Send audio input to the voice assistant
   */
  async sendVoiceInput(
    conversationId: string, 
    audioBlob: Blob,
    userMessage?: string
  ): Promise<VoiceConversation> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-input.wav');
      
      if (userMessage) {
        formData.append('text', userMessage);
      }

      const response = await fetch(
        `${this.baseURL}/conversational-ai/conversations/${conversationId}/audio`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to process voice input: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process the response to extract food-related information
      const analysis = await this.analyzeFoodConversation(data.transcript || userMessage || '');
      
      return {
        id: conversationId,
        transcript: data.transcript || userMessage || '',
        analysis,
        audioUrl: data.audio_url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw error;
    }
  }

  /**
   * Analyze conversation transcript for food-related content
   */
  private async analyzeFoodConversation(transcript: string): Promise<FoodVoiceAnalysis> {
    try {
      // Use AI to analyze the conversation for food-related content
      const analysisPrompt = `
        Analyze this food-related conversation and extract structured information:
        "${transcript}"
        
        Return ONLY a JSON response with this structure:
        {
          "food_items": ["list of mentioned foods"],
          "waste_reduction_actions": ["actions taken to reduce waste"],
          "sustainability_insights": ["environmental insights mentioned"],
          "recipe_suggestions": ["any recipe ideas discussed"],
          "confidence_score": 0.95,
          "conversation_summary": "brief summary of the conversation"
        }
      `;

      // This would integrate with your existing AI service (Gemini)
      // For now, we'll create a mock analysis
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
      
      // Return basic analysis if AI processing fails
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

  /**
   * Text-to-speech: Convert text response to audio
   */
  async textToSpeech(
    text: string, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB', // Default Tasha voice
    config: VoiceSessionConfig = {}
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: config.stability || 0.75,
            similarity_boost: config.similarity_boost || 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  /**
   * End a voice conversation session
   */
  async endVoiceSession(conversationId: string): Promise<void> {
    try {
      await fetch(`${this.baseURL}/conversational-ai/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey
        }
      });
    } catch (error) {
      console.error('Error ending voice session:', error);
      // Don't throw here as this is cleanup
    }
  }

  // Helper methods for extracting information from transcript
  private extractFoodItems(transcript: string): string[] {
    const foodKeywords = [
      'apple', 'banana', 'bread', 'milk', 'cheese', 'chicken', 'beef', 'fish',
      'vegetables', 'fruits', 'pasta', 'rice', 'salad', 'soup', 'sandwich'
    ];
    
    const words = transcript.toLowerCase().split(/\s+/);
    return foodKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
  }

  private extractWasteActions(transcript: string): string[] {
    const wasteKeywords = [
      'composted', 'donated', 'saved', 'preserved', 'froze', 'stored',
      'used leftovers', 'meal planned', 'reduced waste'
    ];
    
    const actions: string[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    wasteKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        actions.push(keyword);
      }
    });
    
    return actions;
  }

  private extractSustainabilityInsights(transcript: string): string[] {
    const sustainabilityKeywords = [
      'carbon footprint', 'environmental impact', 'sustainable', 'eco-friendly',
      'reduce emissions', 'save water', 'local produce', 'organic'
    ];
    
    const insights: string[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    sustainabilityKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        insights.push(`Mentioned ${keyword}`);
      }
    });
    
    return insights;
  }

  private extractRecipeSuggestions(transcript: string): string[] {
    const recipeKeywords = [
      'recipe', 'cook', 'prepare', 'make', 'ingredients',
      'stir fry', 'salad', 'soup', 'smoothie', 'bake'
    ];
    
    const suggestions: string[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    recipeKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        suggestions.push(`Recipe idea: ${keyword}`);
      }
    });
    
    return suggestions;
  }

  /**
   * Get available voices for the assistant
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  /**
   * Check service health and configuration
   */
  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (response.ok) {
        return {
          status: 'healthy',
          message: '11Labs service is operational'
        };
      } else {
        return {
          status: 'error',
          message: `API returned ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export a singleton instance
export const elevenLabsService = new ElevenLabsVoiceService();

// Export types and service
export default elevenLabsService;