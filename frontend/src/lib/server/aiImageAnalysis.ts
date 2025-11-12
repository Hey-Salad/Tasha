// lib/server/aiImageAnalysis.ts
// Multi-provider AI image analysis with automatic fallback
// Priority: Claude (Anthropic) → OpenAI → Google Gemini

import 'server-only';

export interface AIAnalysisResult {
  success: boolean;
  analysis?: any;
  error?: string;
  provider?: string;
}

const ANALYSIS_PROMPT = `Please analyze this food image/video and return ONLY a JSON response in exactly this format:
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
}`;

/**
 * Analyze food image using Claude (Anthropic) API
 */
async function analyzeWithClaude(mediaBase64: string, mimeType: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log('⏭️  Claude API key not configured, skipping...');
    return { success: false, error: 'API key not configured' };
  }

  try {
    console.log('🤖 Trying Claude (Anthropic)...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: mediaBase64
                }
              },
              {
                type: 'text',
                text: ANALYSIS_PROMPT
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text;

    if (!responseText) {
      throw new Error('Invalid response format');
    }

    const cleanJsonStr = responseText
      .replace(/```json\s*|\s*```/gi, '')
      .replace(/[\u201C\u201D]/g, '"')
      .trim();

    const analysis = JSON.parse(cleanJsonStr);
    console.log('✅ Claude analysis successful!');

    return {
      success: true,
      analysis,
      provider: 'claude'
    };
  } catch (error: any) {
    console.log(`❌ Claude failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze food image using DeepSeek API (OpenAI-compatible)
 */
async function analyzeWithDeepSeek(mediaBase64: string, mimeType: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log('⏭️  DeepSeek API key not configured, skipping...');
    return { success: false, error: 'API key not configured' };
  }

  try {
    console.log('🤖 Trying DeepSeek...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${mediaBase64}`
                }
              },
              {
                type: 'text',
                text: ANALYSIS_PROMPT
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('Invalid response format');
    }

    const cleanJsonStr = responseText
      .replace(/```json\s*|\s*```/gi, '')
      .replace(/[\u201C\u201D]/g, '"')
      .trim();

    const analysis = JSON.parse(cleanJsonStr);
    console.log('✅ DeepSeek analysis successful!');

    return {
      success: true,
      analysis,
      provider: 'deepseek'
    };
  } catch (error: any) {
    console.log(`❌ DeepSeek failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze food image using OpenAI API
 */
async function analyzeWithOpenAI(mediaBase64: string, mimeType: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('⏭️  OpenAI API key not configured, skipping...');
    return { success: false, error: 'API key not configured' };
  }

  try {
    console.log('🤖 Trying OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${mediaBase64}`
                }
              },
              {
                type: 'text',
                text: ANALYSIS_PROMPT
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('Invalid response format');
    }

    const cleanJsonStr = responseText
      .replace(/```json\s*|\s*```/gi, '')
      .replace(/[\u201C\u201D]/g, '"')
      .trim();

    const analysis = JSON.parse(cleanJsonStr);
    console.log('✅ OpenAI analysis successful!');

    return {
      success: true,
      analysis,
      provider: 'openai'
    };
  } catch (error: any) {
    console.log(`❌ OpenAI failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze food image using Google Gemini API
 */
async function analyzeWithGemini(mediaBase64: string, mimeType: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('⏭️  Gemini API key not configured, skipping...');
    return { success: false, error: 'API key not configured' };
  }

  try {
    console.log('🤖 Trying Google Gemini...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: mediaBase64
                  }
                },
                { text: ANALYSIS_PROMPT }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Invalid response format');
    }

    const cleanJsonStr = responseText
      .replace(/```json\s*|\s*```/gi, '')
      .replace(/[\u201C\u201D]/g, '"')
      .trim();

    const analysis = JSON.parse(cleanJsonStr);
    console.log('✅ Gemini analysis successful!');

    return {
      success: true,
      analysis,
      provider: 'gemini'
    };
  } catch (error: any) {
    console.log(`❌ Gemini failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze food image with automatic fallback chain
 * Tries: OpenAI → Claude → DeepSeek → Gemini
 */
export async function analyzeFoodImage(
  mediaBase64: string,
  mediaType: 'image' | 'video'
): Promise<AIAnalysisResult> {
  const mimeType = mediaType === 'video' ? 'video/webm' : 'image/jpeg';

  console.log('🔄 Starting AI image analysis with fallback chain...');
  console.log(`📸 Media type: ${mediaType}, MIME: ${mimeType}`);

  // Try OpenAI first (reliable, working)
  const openaiResult = await analyzeWithOpenAI(mediaBase64, mimeType);
  if (openaiResult.success) {
    return openaiResult;
  }

  // Try Claude second (best quality, if available)
  const claudeResult = await analyzeWithClaude(mediaBase64, mimeType);
  if (claudeResult.success) {
    return claudeResult;
  }

  // Try DeepSeek third (fast & cheap)
  const deepseekResult = await analyzeWithDeepSeek(mediaBase64, mimeType);
  if (deepseekResult.success) {
    return deepseekResult;
  }

  // Try Gemini as final fallback
  const geminiResult = await analyzeWithGemini(mediaBase64, mimeType);
  if (geminiResult.success) {
    return geminiResult;
  }

  // All providers failed
  console.error('💥 All AI providers failed!');
  return {
    success: false,
    error: 'All AI providers failed. Please try again later.'
  };
}
