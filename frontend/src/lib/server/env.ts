const required = (value: string | undefined, label: string, fallback?: string): string => {
  const resolved = value ?? fallback;
  if (!resolved || resolved.trim().length === 0) {
    throw new Error(`${label} is not configured`);
  }
  return resolved;
};

const preferServer = (serverVar: string | undefined, publicVar?: string) => {
  if (serverVar && serverVar.trim().length > 0) {
    return serverVar;
  }
  if (publicVar && publicVar.trim().length > 0) {
    console.warn(`[env] Falling back to public env for ${publicVar}`);
    return publicVar;
  }
  return undefined;
};

export const getGeminiConfig = () => ({
  apiKey: required(process.env.GEMINI_API_KEY, 'GEMINI_API_KEY', process.env.NEXT_PUBLIC_GEMINI_API_KEY)
});

export const getElevenLabsConfig = () => ({
  apiKey: required(
    preferServer(process.env.ELEVENLABS_API_KEY, process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY),
    'ELEVENLABS_API_KEY'
  ),
  agentId: required(
    preferServer(process.env.ELEVENLABS_AGENT_ID, process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID),
    'ELEVENLABS_AGENT_ID'
  ),
  defaultVoiceId:
    process.env.ELEVENLABS_VOICE_ID ??
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ??
    'pNInz6obpgDQGcFmaJgB'
});

export const getMonzoConfig = () => ({
  clientId: required(
    preferServer(process.env.MONZO_CLIENT_ID, process.env.NEXT_PUBLIC_MONZO_CLIENT_ID),
    'MONZO_CLIENT_ID'
  ),
  clientSecret: required(process.env.MONZO_CLIENT_SECRET, 'MONZO_CLIENT_SECRET'),
  redirectUri: process.env.MONZO_REDIRECT_URI ?? process.env.NEXT_PUBLIC_MONZO_REDIRECT_URI ?? 'https://tasha.heysalad.app/auth/monzo'
});
