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