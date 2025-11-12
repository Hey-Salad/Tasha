// types/foodAnalysis.ts

export type MediaType = 'image' | 'video';

export interface FoodAnalysis {
  food_type: string;
  analysis_results: {
    freshness_level: string;
    nutritional_category: string;
    estimated_quantity: string;
    waste_potential: string;
    ripeness_state?: string;
    storage_recommendation?: string;
    expiry_estimation?: string;
  };
  sustainability_analysis: string;
  action_recommendations: {
    journal: string[];
    recipe_suggestions: string[];
    waste_reduction_tips: string[];
  };
  confidence_score: number;
  environmental_impact: {
    potential_co2_saved: string;
    water_footprint: string;
    waste_prevention_value: string;
  };
}

export interface MintingOptions {
  journal_entry: boolean;
  recipe_data: boolean;
  waste_reduction_data: boolean;
  environmental_impact: boolean;
}

export interface VoiceSessionConfig {
  voice_id?: string;
  language?: string;
  response_format?: 'mp3' | 'wav';
  stability?: number;
  similarity_boost?: number;
}

export interface FoodVoiceAnalysis {
  food_items: string[];
  waste_reduction_actions: string[];
  sustainability_insights: string[];
  recipe_suggestions: string[];
  confidence_score: number;
  conversation_summary: string;
}

export interface VoiceToolCall {
  id: string;
  name: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
}

export interface VoiceConversation {
  id: string;
  transcript: string;
  analysis: FoodVoiceAnalysis;
  audioUrl?: string;
  timestamp: string;
  agentResponse?: string;
  toolCalls?: VoiceToolCall[];
}
