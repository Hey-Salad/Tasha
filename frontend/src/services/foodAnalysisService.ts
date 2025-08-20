// services/foodAnalysisService.ts
import type { FoodAnalysis, MediaType } from '../types/foodAnalysis';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function analyzeFoodMedia(file: File, type: MediaType): Promise<FoodAnalysis> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
  }

  try {
    const base64Data = await fileToBase64(file);
    const mediaData = base64Data.split(',')[1];

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: type === 'video' ? 'video/webm' : 'image/jpeg',
                data: mediaData
              }
            },
            {
              text: `Please analyze this food image/video and return ONLY a JSON response in exactly this format:
{
  "food_type": "string - what type of food this is",
  "analysis_results": {
    "freshness_level": "string - fresh/moderate/poor condition",
    "nutritional_category": "string - fruits/vegetables/grains/protein/dairy/etc",
    "estimated_quantity": "string - approximate amount/serving size",
    "waste_potential": "string - high/medium/low risk of waste",
    "ripeness_state": "string - underripe/perfect/overripe (if applicable)",
    "storage_recommendation": "string - best storage method",
    "expiry_estimation": "string - estimated time until spoilage"
  },
  "sustainability_analysis": "string - environmental impact analysis",
  "action_recommendations": {
    "journal": ["tip1", "tip2", "tip3"],
    "recipe_suggestions": ["recipe1", "recipe2", "recipe3"],
    "waste_reduction_tips": ["tip1", "tip2", "tip3"]
  },
  "confidence_score": number,
  "environmental_impact": {
    "potential_co2_saved": "string - CO2 impact if waste prevented",
    "water_footprint": "string - water usage for this food",
    "waste_prevention_value": "string - economic value if waste prevented"
  }
}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze food media');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean and parse the JSON response
    try {
      const cleanJsonStr = responseText
        .replace(/```json\s*|\s*```/g, '')  // Remove markdown code blocks
        .replace(/[\u201C\u201D]/g, '"')    // Replace smart quotes
        .replace(/'/g, '"')                  // Replace single quotes
        .trim();
      
      return JSON.parse(cleanJsonStr) as FoodAnalysis;
    } catch (parseError) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Failed to parse analysis results. The AI response may be malformed.');
    }
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