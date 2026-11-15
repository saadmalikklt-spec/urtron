export type EngineType = 'auto' | 'ultra' | 'chatgpt';

export type VoiceProfileId = 'female' | 'male' | 'ultron';

export type EmpathyTone = 'high_empathy' | 'tactical' | 'intellectual' | 'balanced';

export type CallMode = 'voice' | 'video' | null;

export interface SourceLink {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  engineUsed?: string;
  executionTimeMs?: number;
  detectedMood?: string;
  audioBlobUrl?: string; // For voice notes
  isVoiceNote?: boolean;
  voiceDuration?: number;
  gifUrl?: string;
  sources?: SourceLink[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: 'google';
  isSignedIn: boolean;
  joinedDate: string;
}

export interface ApiSettings {
  openaiApiKey: string;
  isKeyVerified: boolean;
  maskedKey: string;
  preferredEngine: EngineType;
  empathyTone: EmpathyTone;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}
