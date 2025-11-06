import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

interface MonzoTransaction {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  merchant?: {
    id: string;
    name: string;
    category: string;
    emoji: string;
  };
  category: string;
}

const FOOD_CATEGORIES = ['eating_out', 'groceries', 'general'];
const FOOD_KEYWORDS = [
  'tesco',
  'sainsbury',
  'asda',
  'morrison',
  'waitrose',
  'marks & spencer',
  'mcdonalds',
  'kfc',
  'subway',
  'pizza',
  'restaurant',
  'cafe',
  'bistro',
  'deliveroo',
  'uber eats',
  'just eat',
  'foodpanda',
  'grocery',
  'supermarket',
  'food',
  'meal',
  'lunch',
  'dinner',
  'breakfast'
];

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

const getMonzoConfig = () => {
  const cfg = functions.config();
  const clientId = cfg.monzo?.client_id ?? process.env.MONZO_CLIENT_ID;
  const clientSecret = cfg.monzo?.client_secret ?? process.env.MONZO_CLIENT_SECRET;
  const redirectUri =
    cfg.monzo?.redirect_uri ?? process.env.MONZO_REDIRECT_URI ?? 'https://tasha.heysalad.app/api/monzo/callback';
  return { clientId, clientSecret, redirectUri };
};

const getGeminiConfig = () => {
  const cfg = functions.config();
  const apiKey = cfg.gemini?.api_key ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  return { apiKey };
};

const getElevenLabsConfig = () => {
  const cfg = functions.config();
  const apiKey = cfg.elevenlabs?.api_key ?? process.env.ELEVENLABS_API_KEY;
  const agentId = cfg.elevenlabs?.agent_id ?? process.env.ELEVENLABS_AGENT_ID;
  const defaultVoiceId =
    cfg.elevenlabs?.voice_id ?? process.env.ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB';

  if (!apiKey || !agentId) {
    throw new Error('11Labs API key or agent ID not configured');
  }

  return { apiKey, agentId, defaultVoiceId };
};

const isFoodRelated = (transaction: MonzoTransaction): boolean => {
  if (FOOD_CATEGORIES.includes(transaction.category)) {
    return true;
  }

  if (transaction.merchant?.category && FOOD_CATEGORIES.includes(transaction.merchant.category)) {
    return true;
  }

  const description = transaction.description.toLowerCase();
  const merchantName = transaction.merchant?.name?.toLowerCase() ?? '';
  return FOOD_KEYWORDS.some((keyword) => description.includes(keyword) || merchantName.includes(keyword));
};

const analyzeFoodSpending = (transactions: MonzoTransaction[]) => {
  const foodTransactions = transactions.filter(isFoodRelated);
  const totalSpent = foodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100;
  const transactionCount = foodTransactions.length;
  const averagePerTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  const merchantSpending: Record<string, { amount: number; count: number }> = {};
  foodTransactions.forEach((t) => {
    const merchantName = t.merchant?.name || 'Unknown Merchant';
    if (!merchantSpending[merchantName]) {
      merchantSpending[merchantName] = { amount: 0, count: 0 };
    }
    merchantSpending[merchantName].amount += Math.abs(t.amount) / 100;
    merchantSpending[merchantName].count += 1;
  });

  const topMerchants = Object.entries(merchantSpending)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const spendingByCategory: Record<string, number> = {};
  foodTransactions.forEach((t) => {
    const category = t.category || 'other';
    spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(t.amount) / 100;
  });

  return {
    totalSpent,
    transactionCount,
    averagePerTransaction,
    topMerchants,
    spendingByCategory,
    transactions: foodTransactions
  };
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/analysis/food', async (req, res) => {
  try {
    const { mediaBase64, mediaType } = req.body ?? {};
    if (!mediaBase64 || !mediaType) {
      return res.status(400).json({ success: false, error: 'mediaBase64 and mediaType are required' });
    }

    const { apiKey } = getGeminiConfig();
    const mimeType = mediaType === 'video' ? 'video/webm' : 'image/jpeg';
    const prompt = `Please analyze this food image/video and return ONLY a JSON response in exactly this format:
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

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: mediaBase64
              }
            },
            {
              text: prompt
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      return res.status(response.status).json({
        success: false,
        error: errorData.error?.message ?? 'Gemini analysis failed'
      });
    }

    const data = (await response.json()) as any;
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return res.status(500).json({ success: false, error: 'Invalid response format from Gemini' });
    }

    try {
      const cleanJsonStr = responseText
        .replace(/```json\s*|\s*```/g, '')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/'/g, '"')
        .trim();
      const parsed = JSON.parse(cleanJsonStr);
      return res.json({ success: true, analysis: parsed });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return res
        .status(500)
        .json({ success: false, error: 'Failed to parse analysis results from AI response' });
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return res.status(500).json({ success: false, error: 'Gemini analysis failed' });
  }
});

app.post('/voice/session', async (req, res) => {
  try {
    const { apiKey, agentId } = getElevenLabsConfig();
    const { voice_id, language, response_format } = req.body ?? {};

    const response = await fetch('https://api.elevenlabs.io/v1/conversational-ai/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        agent_id: agentId,
        voice_id,
        language,
        response_format
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to start 11Labs session:', errorData);
      return res.status(response.status).json({ success: false, error: 'Failed to start voice session' });
    }

    const data = (await response.json()) as any;
    return res.json({ success: true, conversationId: data.conversation_id, raw: data });
  } catch (error) {
    console.error('11Labs session error:', error);
    return res.status(500).json({ success: false, error: 'Failed to start voice session' });
  }
});

app.post('/voice/audio', async (req, res) => {
  try {
    const { apiKey } = getElevenLabsConfig();
    const { conversationId, audioBase64, mimeType, userMessage } = req.body ?? {};

    if (!conversationId || !audioBase64) {
      return res
        .status(400)
        .json({ success: false, error: 'conversationId and audioBase64 are required' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType ?? 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-input.webm');
    if (userMessage) {
      formData.append('text', userMessage);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/conversational-ai/conversations/${conversationId}/audio`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11Labs audio processing failed:', errorData);
      return res.status(response.status).json({ success: false, error: 'Failed to process voice input' });
    }

    const data = (await response.json()) as any;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('11Labs audio error:', error);
    return res.status(500).json({ success: false, error: 'Voice processing failed' });
  }
});

app.post('/voice/tts', async (req, res) => {
  try {
    const { apiKey, defaultVoiceId } = getElevenLabsConfig();
    const { text, voiceId, config } = req.body ?? {};

    if (!text) {
      return res.status(400).json({ success: false, error: 'text is required' });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || defaultVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: config?.stability ?? 0.75,
            similarity_boost: config?.similarity_boost ?? 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('11Labs TTS failed:', errorData);
      return res.status(response.status).json({ success: false, error: 'Failed to generate speech' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    return res.json({ success: true, audioBase64 });
  } catch (error) {
    console.error('11Labs TTS error:', error);
    return res.status(500).json({ success: false, error: 'Text-to-speech failed' });
  }
});

app.get('/monzo/auth', async (_req, res) => {
  try {
    const { clientId, redirectUri } = getMonzoConfig();
    if (!clientId) {
      return res.status(500).json({ success: false, error: 'Monzo client ID not configured' });
    }

    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const authUrl = new URL('https://auth.monzo.com/');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);

    return res.json({ success: true, authUrl: authUrl.toString(), state });
  } catch (error) {
    console.error('Error generating Monzo auth URL:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate auth URL' });
  }
});

app.post('/monzo/auth', async (req, res) => {
  try {
    const { code } = req.body ?? {};
    const { clientId, clientSecret, redirectUri } = getMonzoConfig();

    if (!code) {
      return res.status(400).json({ success: false, error: 'Authorization code required' });
    }

    if (!clientId || !clientSecret) {
      return res.status(500).json({ success: false, error: 'Monzo credentials not configured' });
    }

    const tokenResponse = await fetch('https://api.monzo.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Monzo token exchange failed:', errorText);
      return res.status(400).json({ success: false, error: 'Token exchange failed' });
    }

    const tokens = (await tokenResponse.json()) as any;
    const accountsResponse = await fetch('https://api.monzo.com/accounts', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    let accounts: any[] = [];
    if (accountsResponse.ok) {
      const accountsData = (await accountsResponse.json()) as any;
      accounts = accountsData.accounts || [];
    }

    return res.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        user_id: tokens.user_id
      },
      accounts
    });
  } catch (error) {
    console.error('Error in Monzo token exchange:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

app.get('/monzo/transactions', async (req, res) => {
  try {
    const accessToken = typeof req.query.access_token === 'string' ? req.query.access_token : undefined;
    const accountId = typeof req.query.account_id === 'string' ? req.query.account_id : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : 'transactions';
    const days = parseInt((req.query.days as string) || '7', 10);

    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: 'Access token and account ID required' });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const params = new URLSearchParams({
      account_id: accountId,
      expand: 'merchant',
      limit: '100',
      since: since.toISOString()
    });

    const response = await fetch(`https://api.monzo.com/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ success: false, error: 'Access token expired or invalid' });
      }
      if (response.status === 403) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }
      throw new Error(`Monzo API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const transactions: MonzoTransaction[] = data.transactions || [];

    if (type === 'food') {
      const foodTransactions = transactions.filter(isFoodRelated);
      return res.json({ success: true, transactions: foodTransactions, count: foodTransactions.length });
    }

    if (type === 'analysis') {
      const analysis = analyzeFoodSpending(transactions);
      return res.json({ success: true, analysis });
    }

    return res.json({ success: true, transactions, count: transactions.length });
  } catch (error) {
    console.error('Error fetching Monzo transactions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

app.post('/monzo/transactions', async (req, res) => {
  try {
    const { accessToken, accountId, transactionIds } = req.body ?? {};
    if (!accessToken || !accountId) {
      return res.status(400).json({ success: false, error: 'Access token and account ID required' });
    }

    const transactions: MonzoTransaction[] = [];
    if (Array.isArray(transactionIds)) {
      for (const txId of transactionIds.slice(0, 10)) {
        try {
          const response = await fetch(`https://api.monzo.com/transactions/${txId}?expand=merchant`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.ok) {
            const data = (await response.json()) as any;
            transactions.push(data.transaction);
          }
        } catch (error) {
          console.error(`Error fetching transaction ${txId}:`, error);
        }
      }
    }

    return res.json({ success: true, transactions, count: transactions.length });
  } catch (error) {
    console.error('Error in POST transactions endpoint:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

app.post('/monzo/match', async (req, res) => {
  try {
    const { accessToken, accountId, wasteReductionDate, wasteDescription } = req.body ?? {};
    if (!accessToken || !accountId || !wasteReductionDate || !wasteDescription) {
      return res.status(400).json({
        success: false,
        error: 'Access token, account ID, waste reduction date, and description required'
      });
    }

    const since = new Date(wasteReductionDate);
    since.setDate(since.getDate() - 7);

    const params = new URLSearchParams({
      account_id: accountId,
      expand: 'merchant',
      limit: '50',
      since: since.toISOString(),
      before: new Date(wasteReductionDate).toISOString()
    });

    const response = await fetch(`https://api.monzo.com/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`Monzo API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const foodTransactions: MonzoTransaction[] = (data.transactions || []).filter(isFoodRelated);

    const extractKeywords = (text: string): string[] => {
      const commonWords = [
        'the',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
        'a',
        'an',
        'this',
        'that',
        'is',
        'was',
        'are',
        'were'
      ];
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !commonWords.includes(word))
        .slice(0, 10);
    };

    const calculateMatchScore = (transaction: MonzoTransaction): number => {
      let score = 0;
      const wasteKeywords = extractKeywords(wasteDescription);
      const merchantName = transaction.merchant?.name?.toLowerCase() || '';
      const description = transaction.description.toLowerCase();
      const matchingKeywords = wasteKeywords.filter(
        (keyword) => merchantName.includes(keyword) || description.includes(keyword)
      );
      score += Math.min(matchingKeywords.length * 10, 50);

      const claimDate = new Date(wasteReductionDate);
      const transactionDate = new Date(transaction.created);
      const daysDiff = Math.abs((claimDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) score += 30;
      else if (daysDiff <= 3) score += 20;
      else if (daysDiff <= 7) score += 10;

      if (FOOD_CATEGORIES.includes(transaction.category)) {
        score += 20;
      }

      if (transaction.merchant) {
        const merchantCategory = transaction.merchant.category?.toLowerCase() || '';
        if (merchantCategory.includes('food') || merchantCategory.includes('restaurant') || merchantCategory.includes('grocery')) {
          score += 20;
        }
      }

      return Math.min(score, 100);
    };

    const scoredTransactions = foodTransactions.map((transaction) => ({
      transaction,
      score: calculateMatchScore(transaction)
    }));

    const potentialMatches = scoredTransactions
      .filter((item) => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.transaction);

    let confidence = 0;
    let reasoning = 'No matching transactions found';

    if (potentialMatches.length > 0) {
      const topScore = scoredTransactions[0]?.score || 0;
      confidence = Math.min(topScore / 100, 0.95);
      reasoning =
        potentialMatches.length === 1
          ? `Found 1 potential matching transaction with ${Math.round(confidence * 100)}% confidence`
          : `Found ${potentialMatches.length} potential matching transactions. Top match has ${Math.round(confidence * 100)}% confidence`;
      const topMatch = potentialMatches[0];
      if (topMatch.merchant?.name) {
        reasoning += `. Best match: ${topMatch.merchant.name}`;
      }
    }

    return res.json({ success: true, potentialMatches, confidence, reasoning });
  } catch (error) {
    console.error('Error matching waste reduction with transactions:', error);
    return res.status(500).json({ success: false, error: 'Failed to match transactions' });
  }
});

app.get('/monzo/match', (req, res) => {
  if (req.query.test === 'true') {
    return res.json({
      success: true,
      potentialMatches: [
        {
          id: 'tx_test_001',
          created: new Date().toISOString(),
          description: 'Test Food Purchase',
          amount: -850,
          currency: 'GBP',
          category: 'eating_out',
          merchant: {
            id: 'merch_test_001',
            name: 'Test Restaurant',
            category: 'eating_out',
            emoji: '🍕'
          }
        }
      ],
      confidence: 0.85,
      reasoning: 'Test mode - mock transaction match'
    });
  }

  return res.status(405).json({ success: false, error: 'Use POST method for transaction matching' });
});

export const api = functions.https.onRequest(app);
