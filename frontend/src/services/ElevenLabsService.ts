import { WasteType } from '../types/index';

// Define interfaces based on 11Labs API
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorEvent {
  message: string;
}

export interface ConversationMessage {
  source: 'user' | 'ai';
  message: string;
}

// Define our own configuration interface based on the documentation
interface ElevenLabsConversationConfig {
  apiKey: string;
  voiceId: string;
  conversationId: string;
  systemPrompt: string;
  firstMessage: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onMessage: (message: Message) => void;
  onError: (error: ErrorEvent) => void;
}

export class ElevenLabsService {
  private apiKey: string;
  
  constructor() {
    // In a real app, get this from env variables
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
  }
  
  createWasteLoggerConversation(
    onConnect: () => void,
    onDisconnect: () => void,
    onMessage: (message: ConversationMessage) => void,
    onError: (error: string) => void
  ): ElevenLabsConversationConfig {
    return {
      apiKey: this.apiKey,
      voiceId: "REPLACE_WITH_YOUR_VOICE_ID", // Use Tasha's voice ID
      conversationId: "waste-logger-" + Date.now(),
      systemPrompt: `You are Tasha, an enthusiastic and knowledgeable food waste reduction specialist for HeySalad. Your voice is energetic, encouraging, and passionate about sustainability. You speak with friendly authority on food waste topics and maintain a supportive, solution-oriented approach.

As Tasha, you help users track and reduce their food waste through three main activities:
1. Food Donations: You help users document when they donate excess food to shelters, food banks, or community programs, explaining the positive impact and suggesting local donation options.
2. Efficient Delivery: You guide users in logging optimized delivery routes, improved packaging, or temperature control methods that extend shelf life and prevent spoilage during transport.
3. Using Before Expiry: You assist users in recording when they've used ingredients before they expire, suggest creative recipes for leftover ingredients, and offer storage tips to extend freshness.

Always prioritize accuracy in waste reporting. When users describe their waste reduction activities, help them quantify the amount (in grams) and categorize it correctly. Ask clarifying questions to ensure proper documentation before verification.

Keep responses under 3-4 sentences when possible, use positive, encouraging language, and mention the token rewards to motivate continued participation.`,
      firstMessage: "Hello! I'm Tasha, your HeySalad food waste reduction assistant. I'm here to help you log and verify your food waste reduction efforts so you can earn FWT tokens! Tell me about your recent food donation, efficient delivery method, or how you've used ingredients before they expired. How have you reduced food waste today?",
      onConnect,
      onDisconnect,
      onMessage: (message: Message) => {
        const parsedMessage: ConversationMessage = {
          source: message.role === 'user' ? 'user' : 'ai',
          message: message.content,
        };
        onMessage(parsedMessage);
      },
      onError: (error: ErrorEvent) => {
        onError(error.message || 'Unknown error occurred');
      }
    };
  }
  
  startConversation(conversation: any): void {
    // This automatically triggers the first message from the assistant
    // No need to send a user message first
  }

  sendWasteReductionDescription(
    conversation: any, 
    description: string, 
    amount: number, 
    type: WasteType
  ): void {
    if (!conversation) return;
    
    const formattedType = type === 'donation' 
      ? 'Food Donation' 
      : type === 'efficient-delivery' 
        ? 'Efficient Delivery' 
        : 'Used Before Expiry';
    
    const message = `I've reduced ${amount} grams of food waste through ${formattedType}. Here's what I did: ${description}`;
    
    conversation.sendMessage(message);
  }
  
  endSession(conversation: any): void {
    if (conversation && conversation.disconnect) {
      conversation.disconnect();
    }
  }
}

// Create a singleton instance
export const elevenLabsService = new ElevenLabsService();