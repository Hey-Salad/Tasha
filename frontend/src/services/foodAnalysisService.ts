// services/foodAnalysisService.ts
// Updated to use server-side API with multi-provider fallback
// This ensures: Claude → OpenAI → Gemini fallback chain

import type { FoodAnalysis, MediaType } from '../types/foodAnalysis';

/**
 * Analyze food media using the multi-provider API
 * Automatically falls back: Claude → OpenAI → Gemini
 */
export async function analyzeFoodMedia(file: File, type: MediaType): Promise<FoodAnalysis> {
  try {
    console.log('🔄 Starting food analysis with multi-provider fallback...');

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    const mediaBase64 = base64Data.split(',')[1];

    // Call server-side API route which handles the fallback chain
    const response = await fetch('/api/analysis/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mediaBase64,
        mediaType: type
      })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to analyze food media';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error ?? errorMessage;
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success || !data.analysis) {
      throw new Error(data.error || 'Invalid response from analysis API');
    }

    // Log which provider was used
    console.log(`✅ Analysis complete using: ${data.provider || 'unknown'}`);

    return data.analysis as FoodAnalysis;
  } catch (error) {
    console.error(`Error in ${type} food analysis:`, error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
