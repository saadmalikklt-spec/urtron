import { ChatMessage, EngineType, EmpathyTone, VoiceProfileId, SourceLink } from '../types';

interface SendChatParams {
  prompt: string;
  conversationHistory: ChatMessage[];
  engine: EngineType;
  openaiApiKey?: string;
  voiceProfile: VoiceProfileId;
  language: string;
  empathyTone: EmpathyTone;
}

interface ChatResponse {
  text: string;
  engineUsed: string;
  engineFallback?: boolean;
  executionTimeMs: number;
  detectedMood?: string;
  sources?: SourceLink[];
}

export async function sendChatMessage(params: SendChatParams): Promise<ChatResponse> {
  const historyForApi = params.conversationHistory.slice(-8).map((m) => ({
    role: m.role,
    text: m.text,
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (params.openaiApiKey) {
    headers['x-openai-key'] = params.openaiApiKey;
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: params.prompt,
      conversationHistory: historyForApi,
      engine: params.engine,
      openaiApiKey: params.openaiApiKey,
      voiceProfile: params.voiceProfile,
      language: params.language,
      empathyTone: params.empathyTone,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export async function verifyOpenAiKey(apiKey: string): Promise<{ valid: boolean; maskedKey: string; message: string }> {
  const res = await fetch('/api/verify-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });

  return res.json();
}

export async function executeWebResearch(query: string): Promise<{ summary: string; sources: SourceLink[]; executionTimeMs: number }> {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to conduct web research.');
  }

  return res.json();
}
