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

const VOICE_WASTE_ACTIONS = ['donated', 'shared', 'stored', 'cooked', 'composted', 'froze'];

type ToolCall = { id: string; name: string; arguments: any };
type ToolOutput = { tool_call_id: string; output: string };

const AGENT_TOOL_DEFINITIONS = [
  {
    name: 'log_waste_event',
    description: 'Record a food-waste reduction moment and estimate FWT rewards.',
    input_schema: {
      type: 'object',
      properties: {
        food_item: { type: 'string', description: 'Item mentioned by the user' },
        action: {
          type: 'string',
          description: 'What happened to the food',
          enum: VOICE_WASTE_ACTIONS
        },
        quantity_grams: {
          type: 'number',
          description: 'Approximate grams saved or repurposed'
        },
        confidence: {
          type: 'number',
          description: 'Model confidence between 0 and 1'
        }
      },
      required: ['food_item', 'action']
    }
  },
  {
    name: 'fetch_wallet_summary',
    description: 'Share the latest wallet state so the agent can coach minting steps.',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'suggest_follow_up',
    description: 'Offer actionable follow-ups such as taking a photo, matching Monzo data, or minting tokens.',
    input_schema: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'User goal or blocker' }
      }
    }
  }
];

const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  log_waste_event: async (args) => {
    const quantity = Number(args?.quantity_grams ?? 0);
    const estimatedTokens = quantity > 0 ? Number((quantity * 0.12).toFixed(2)) : 0.5;
    return {
      confirmation: `Logged ${quantity || 'a few'}g of ${args?.food_item || 'food'} via ${args?.action || 'a sustainable action'}.`,
      tokenEstimate: estimatedTokens,
      recommendedNextStep: 'Capture a quick photo or connect Monzo to verify the claim.'
    };
  },
  fetch_wallet_summary: async () => ({
    connected: false,
    note: 'Wallet integration lives on the main dashboard. Re-open HeySalad Tasha in the browser with your wallet extension to mint tokens.',
    tip: 'You can still continue the conversation and queue minting instructions for later.'
  }),
  suggest_follow_up: async (args) => ({
    prompts: [
      'Would you like me to remind you to photograph this meal for AI verification?',
      'Want help matching this to a Monzo purchase once you connect banking?',
      args?.goal
        ? `Based on your goal (${args.goal}), consider scheduling a token minting session after dinner.`
        : 'Let me know if you want to mint tokens from this action right after we finish chatting.'
    ].filter(Boolean)
  })
};

const handleToolCall = async (toolCall: ToolCall): Promise<ToolOutput> => {
  const handler = TOOL_HANDLERS[toolCall.name];
  if (!handler) {
    return {
      tool_call_id: toolCall.id,
      output: JSON.stringify({ error: `Unhandled tool: ${toolCall.name}` })
    };
  }

  const parsedArgs =
    typeof toolCall.arguments === 'string' ? JSON.parse(toolCall.arguments) : toolCall.arguments ?? {};
  const result = await handler(parsedArgs);
  return {
    tool_call_id: toolCall.id,
    output: JSON.stringify(result)
  };
};

const completeToolCalls = async (conversationId: string, outputs: ToolOutput[], apiKey: string) => {
  await fetch(
    `https://api.elevenlabs.io/v1/conversational-ai/conversations/${conversationId}/tool-output`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({ tool_outputs: outputs })
    }
  );
};

const fetchConversationState = async (conversationId: string, apiKey: string) => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/conversational-ai/conversations/${conversationId}`,
    {
      headers: { 'xi-api-key': apiKey }
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as any;
};

export const executeRequiredTools = async (
  data: any,
  conversationId: string,
  apiKey: string
): Promise<{ toolOutputs: ToolOutput[]; conversationState: any }> => {
  let toolOutputs: ToolOutput[] = [];
  let conversationState = data.conversation;

  if (Array.isArray(data.required_action?.tool_calls) && data.required_action.tool_calls.length > 0) {
    toolOutputs = await Promise.all(
      (data.required_action.tool_calls as ToolCall[]).map((toolCall) => handleToolCall(toolCall))
    );
    await completeToolCalls(conversationId, toolOutputs, apiKey);
    conversationState = await fetchConversationState(conversationId, apiKey);
  }

  return { toolOutputs, conversationState };
};

export const buildVoiceAnalysis = (transcript: string) => {
  const text = transcript.toLowerCase();
  const foods = FOOD_KEYWORDS.filter((keyword) => text.includes(keyword)).slice(0, 4);
  const actions = VOICE_WASTE_ACTIONS.filter((action) => text.includes(action)).slice(0, 3);

  return {
    food_items: foods.length ? foods : ['assorted food'],
    waste_reduction_actions: actions,
    sustainability_insights: actions.length
      ? ['Voice log mentions a clear waste-prevention action.']
      : ['Encourage the user to describe how they saved the food.'],
    recipe_suggestions: foods.length
      ? [`Turn ${foods[0]} into a leftover-friendly meal.`]
      : ['Ask the assistant for a quick recipe next time.'],
    confidence_score: Math.min(0.5 + actions.length * 0.15, 0.95),
    conversation_summary: transcript.substring(0, 180)
  };
};

export { AGENT_TOOL_DEFINITIONS };
