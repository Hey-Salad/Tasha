// services/foodAnalysisService.ts
import type { FoodAnalysis, MediaType } from '../types/foodAnalysis';

export async function analyzeFoodMedia(file: File, type: MediaType): Promise<FoodAnalysis> {
  try {
    const base64Data = await fileToBase64(file);
    const mediaBase64 = base64Data.split(',')[1];

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to analyze food media');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze food media');
    }

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
    reader.onerror = error => reject(error);
  });
}
