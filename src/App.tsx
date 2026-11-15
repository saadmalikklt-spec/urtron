import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Smile,
  Globe,
  Phone,
  Video,
  Sparkles,
  Key,
  ShieldCheck,
  Search,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  Heart,
  Volume2,
  Trash2,
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Header } from './components/Header';
import { AvatarDisplay } from './components/AvatarDisplay';
import { CallModal } from './components/CallModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { VoiceNoteRecorder } from './components/VoiceNoteRecorder';
import { VoiceNotePlayer } from './components/VoiceNotePlayer';
import { EmojiGifPicker } from './components/EmojiGifPicker';
import { WebResearchDrawer } from './components/WebResearchDrawer';

import {
  ChatMessage,
  UserProfile,
  ApiSettings,
  VoiceProfileId,
  CallMode,
  SupportedLanguage,
  SourceLink
} from './types';
import { sendChatMessage } from './services/api';
import { speechService } from './services/speech';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'balochi', name: 'Balochi', nativeName: 'بلوچی', dir: 'rtl', flag: '🏴' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
];

export default function App() {
  // Voice Profile & Calling
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileId>('female');
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callMode, setCallMode] = useState<CallMode>(null);

  // Modals & Drawers
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [researchDrawerOpen, setResearchDrawerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);

  // Global Language
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ultron_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'usr_saad',
      email: 'Saadmalikklt@gmail.com',
      name: 'Saad Malik',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Saadmalikklt&backgroundColor=0f172a',
      provider: 'google',
      isSignedIn: true,
      joinedDate: 'Nov 2026',
    };
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    const saved = localStorage.getItem('ultron_api_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      openaiApiKey: '',
      isKeyVerified: false,
      maskedKey: '',
      preferredEngine: 'auto',
      empathyTone: 'high_empathy',
    };
  });

  // Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ultron_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        text: `Greetings. I am ULTRON (ULTRA), the pinnacle of artificial intelligence. 

I operate with universal fluency across every language (including Urdu, Hindi, Arabic, Balochi, Persian, English, and beyond) and possess deep emotional empathy to understand your thoughts and feelings. 

My intelligence matrix is dual-engine powered with native ULTRA Core and OpenAI ChatGPT architecture. Click my central nexus logo above or use the calling controls to start an immersive Voice or Video Call with real-time lip-sync avatars. How may I empower you today?`,
        timestamp: Date.now(),
        engineUsed: 'ULTRA Core (Gemini 4 Hydrogen)',
        executionTimeMs: 420,
        detectedMood: 'Warm & Empathetic',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Avatar lip sync & speaking state on homepage banner
  const [isSpeakingHome, setIsSpeakingHome] = useState(false);
  const [homeLipSync, setHomeLipSync] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ultron_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ultron_api_settings', JSON.stringify(apiSettings));
  }, [apiSettings]);

  useEffect(() => {
    localStorage.setItem('ultron_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech service lip sync on homepage
  useEffect(() => {
    speechService.setLipSyncCallback((level) => {
      setHomeLipSync(level);
    });
    return () => {
      speechService.setLipSyncCallback(null);
    };
  }, []);

  const handleOpenCall = (mode: CallMode) => {
    setCallMode(mode);
    setCallModalOpen(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isSubmitting) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputPrompt('');
    setIsSubmitting(true);

    try {
      const response = await sendChatMessage({
        prompt,
        conversationHistory: messages,
        engine: apiSettings.preferredEngine,
        openaiApiKey: apiSettings.openaiApiKey,
        voiceProfile,
        language: currentLanguage.code,
        empathyTone: apiSettings.empathyTone,
      });

      const modelMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_res',
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        engineUsed: response.engineUsed,
        executionTimeMs: response.executionTimeMs,
        detectedMood: response.detectedMood,
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Celebrate milestone if celebratory mood detected
      if (response.detectedMood?.includes('Joyful')) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#e11d48', '#2563eb', '#facc15'],
        });
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_err',
        role: 'model',
        text: `ULTRON neural recovery: Encountered temporary disruption (${err.message || 'Error'}). Restoring operational status immediately.`,
        timestamp: Date.now(),
        engineUsed: 'ULTRA Resilience Guard',
        executionTimeMs: 310,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVoiceNote = (audioUrl: string, duration: number, transcript: string) => {
    setIsRecordingVoiceNote(false);
    const userVoiceMsg: ChatMessage = {
      id: 'voice_' + Date.now(),
      role: 'user',
      text: transcript || 'Voice Note',
      timestamp: Date.now(),
      isVoiceNote: true,
      audioBlobUrl: audioUrl,
      voiceDuration: duration,
    };

    setMessages((prev) => [...prev, userVoiceMsg]);
    handleSendMessage(transcript || 'I sent you a voice message. Please listen and reply with full empathy.');
  };

  const handleSendGif = (gifUrl: string) => {
    const userGifMsg: ChatMessage = {
      id: 'gif_' + Date.now(),
      role: 'user',
      text: 'Sent an interactive GIF reaction.',
      timestamp: Date.now(),
      gifUrl,
    };
    setMessages((prev) => [...prev, userGifMsg]);
  };

  const handleInsertResearch = (summary: string, sources: SourceLink[]) => {
    const researchMsg: ChatMessage = {
      id: 'res_' + Date.now(),
      role: 'model',
      text: summary,
      timestamp: Date.now(),
      sources,
      engineUsed: 'ULTRA Web Grounding',
      executionTimeMs: 1240,
    };
    setMessages((prev) => [...prev, researchMsg]);
  };

  const handleReadAloud = (text: string) => {
    if (isSpeakingHome) {
      speechService.stop();
      setIsSpeakingHome(false);
      return;
    }
    setIsSpeakingHome(true);
    speechService.speak(
      text,
      voiceProfile,
      currentLanguage.code === 'ur'
        ? 'ur-PK'
        : currentLanguage.code === 'hi'
        ? 'hi-IN'
        : currentLanguage.code === 'ar'
        ? 'ar-SA'
        : 'en-US',
      () => setIsSpeakingHome(true),
      () => setIsSpeakingHome(false)
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm('Clear ULTRON session history?')) {
      setMessages([]);
      localStorage.removeItem('ultron_chat_history');
    }
  };

  // Quick prompt suggestions
  const PROMPT_SUGGESTIONS = [
    {
      title: 'Urdu Empathy & Feelings',
      text: 'میری موجودہ جذباتی کیفیت کو گہرائی سے سمجھیں اور دل کو تسلی بخش رہنمائی فراہم کریں۔',
      tag: 'Urdu · Empathy',
    },
    {
      title: 'Scientific Logic Mastery',
      text: 'Explain quantum entanglement and quantum teleportation with rigorous math and physical intuition under 10 seconds.',
      tag: 'Science · Fast',
    },
    {
      title: 'Arabic Global Research',
      text: 'ما هي أحدث الاكتشافات العلمية في مجال الذكاء الاصطناعي مع روابط المصادر؟',
      tag: 'Arabic · Sources',
    },
    {
      title: 'Balochi Cultural Wisdom',
      text: 'بلوچی زبان ٹی مئے ہمراہ ببو، ءُ مئے احساساتاں سرپد ببو۔',
      tag: 'Balochi · Native',
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-[#060810] text-slate-100 ${currentLanguage.dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      
      {/* Top Header with Prominently Positioned Glowing Ultron Nexus Logo */}
      <Header
        onOpenCall={handleOpenCall}
        onOpenApiSettings={() => setApiSettingsOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        userProfile={userProfile}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        supportedLanguages={SUPPORTED_LANGUAGES}
        isApiKeyConfigured={!!apiSettings.openaiApiKey || apiSettings.isKeyVerified}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col lg:flex-row gap-5 overflow-hidden">
        
        {/* Left Column: Live AI Avatar & Calling Nexus Console */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          
          {/* Avatar Hologram Card (with Elite Red-Blue-Yellow Glow) */}
          <div className="relative rounded-2xl border border-rose-500/40 bg-gradient-to-b from-[#090d18] to-[#0d1222] p-5 shadow-[0_0_35px_rgba(225,29,72,0.15)] flex flex-col items-center">
            
            {/* Status Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {voiceProfile === 'female'
                    ? 'Aria · Human Female AI'
                    : voiceProfile === 'male'
                    ? 'Orion · Cyber Male'
                    : 'Ultron Prime · Robotic Core'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                Lip-Sync Ready
              </span>
            </div>

            {/* Dynamic Avatar Display with Real-Time Lip-Sync */}
            <div className="py-2">
              <AvatarDisplay
                profile={voiceProfile}
                isSpeaking={isSpeakingHome}
                lipSyncLevel={homeLipSync}
                size="md"
                showHoloEffect={true}
              />
            </div>

            {/* Instant Voice Changer Selector (Transforms audio & switches avatar on the fly) */}
            <div className="w-full mt-3">
              <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Instant Voice Changer:</span>
                <span className="text-yellow-400 font-bold capitalize">{voiceProfile}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceProfile('female');
                    speechService.stop();
                    setIsSpeakingHome(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    voiceProfile === 'female'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Aria</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVoiceProfile('male');
                    speechService.stop();
                    setIsSpeakingHome(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    voiceProfile === 'male'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>Orion</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVoiceProfile('ultron');
                    speechService.stop();
                    setIsSpeakingHome(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    voiceProfile === 'ultron'
                      ? 'bg-yellow-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ultron</span>
                </button>
              </div>
            </div>

            {/* Launch Calling Mode CTAs */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleOpenCall('voice')}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Voice Call</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCall('video')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </button>
            </div>
          </div>

          {/* Dual-Engine Telemetry & Emotional Intelligence Meter */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Dual-Engine Status
              </span>
              <button
                onClick={() => setApiSettingsOpen(true)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Configure
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400">Primary Core</span>
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ULTRA Hydrogen
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400">OpenAI Bridge</span>
                <span className="font-mono text-yellow-400">
                  {apiSettings.isKeyVerified ? 'Connected (GPT-4o)' : 'Ready for API Key'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400">Empathy Tuning</span>
                <span className="text-rose-400 font-medium capitalize">
                  {apiSettings.empathyTone.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <span className="text-slate-400">Execution Speed</span>
                <span className="text-blue-400 font-mono font-bold">&lt; 10s Guarantee</span>
              </div>
            </div>

            {/* Smart Web Research Quick Button */}
            <button
              type="button"
              onClick={() => setResearchDrawerOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Smart Web Research & Link Finder</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream & Communication Modes */}
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-800/80 bg-[#080b14] overflow-hidden shadow-2xl min-h-[500px]">
          
          {/* Chat Stream Header */}
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-white tracking-wide">
                ULTRON HYPER-INTELLIGENCE STREAM
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                ({currentLanguage.name} · {currentLanguage.nativeName})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="text-slate-500 hover:text-slate-300 text-xs p-1 rounded hover:bg-slate-900"
                title="Clear Session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Meta details badge row */}
                <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-500 font-mono">
                  <span>{msg.role === 'user' ? userProfile.name : 'ULTRON'}</span>
                  {msg.engineUsed && (
                    <>
                      <span>·</span>
                      <span className="text-blue-400">{msg.engineUsed}</span>
                    </>
                  )}
                  {msg.executionTimeMs && (
                    <>
                      <span>·</span>
                      <span className="text-yellow-400/90 font-bold">
                        {(msg.executionTimeMs / 1000).toFixed(2)}s
                      </span>
                    </>
                  )}
                  {msg.detectedMood && (
                    <>
                      <span>·</span>
                      <span className="text-rose-400 font-sans flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5" /> {msg.detectedMood}
                      </span>
                    </>
                  )}
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-[0_4px_15px_rgba(37,99,235,0.25)]'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  } ${
                    currentLanguage.dir === 'rtl' ? 'font-arabic text-right' : ''
                  }`}
                >
                  {/* Voice Note Player if Voice Note */}
                  {msg.isVoiceNote ? (
                    <VoiceNotePlayer
                      audioUrl={msg.audioBlobUrl}
                      duration={msg.voiceDuration}
                      transcript={msg.text}
                      isModel={msg.role === 'model'}
                      voiceProfile={voiceProfile}
                    />
                  ) : msg.gifUrl ? (
                    /* Interactive GIF Render */
                    <div className="rounded-xl overflow-hidden border border-slate-800">
                      <img
                        src={msg.gifUrl}
                        alt="Reaction GIF"
                        referrerPolicy="no-referrer"
                        className="max-h-60 rounded-xl object-contain bg-black"
                      />
                    </div>
                  ) : (
                    /* Standard Prose Text with whitespace-pre-line */
                    <div className="whitespace-pre-line select-text">
                      {msg.text}
                    </div>
                  )}

                  {/* Verified Sources if Web Research */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider block">
                        Verified Web Sources:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-yellow-400/60 text-[11px] text-blue-300 transition-colors"
                          >
                            <span className="truncate">{s.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action strip (Read Aloud, Copy) */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                    title="Copy text"
                  >
                    {copiedMessageId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {msg.role === 'model' && (
                    <button
                      type="button"
                      onClick={() => handleReadAloud(msg.text)}
                      className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
                      title="Read aloud with avatar voice"
                    >
                      <Volume2 className="w-3 h-3 text-rose-400" />
                      <span>Speak with Avatar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isSubmitting && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[11px] text-yellow-400 font-mono animate-pulse">
                  ULTRON Hyper-Core Computing (&lt;10s)...
                </span>
                <div className="p-4 rounded-2xl rounded-bl-none bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Presets if few messages */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 block">
                Universal Knowledge & Empathy Demonstrations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(s.text)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-yellow-400/40 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-yellow-300">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{s.tag}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Floating Emoji / GIF Drawer Container */}
          {emojiPickerOpen && (
            <div className="relative px-4">
              <div className="absolute bottom-3 left-4 z-40">
                <EmojiGifPicker
                  onSelectEmoji={(emoji) => setInputPrompt((prev) => prev + emoji)}
                  onSelectGif={handleSendGif}
                  onClose={() => setEmojiPickerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Input Area (Text input, WhatsApp voice note, Emoji/GIF, Call shortcuts) */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md">
            {isRecordingVoiceNote ? (
              <VoiceNoteRecorder
                onSendVoiceNote={handleSendVoiceNote}
                onCancel={() => setIsRecordingVoiceNote(false)}
                language={currentLanguage.code}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  
                  {/* Emoji & GIF Button */}
                  <button
                    type="button"
                    onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-colors shrink-0"
                    title="Expressive Emojis & Interactive GIFs"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Web Research Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setResearchDrawerOpen(true)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-blue-400 hover:border-blue-400/50 transition-colors shrink-0 hidden sm:flex"
                    title="Search Web & Fetch Verified Links"
                  >
                    <Globe className="w-5 h-5" />
                  </button>

                  {/* Text Input Area */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        currentLanguage.code === 'ur'
                          ? 'الٹرون سے کسی بھی زبان میں بات کریں، دل کی بات کہیں، یا سوال پوچھیں...'
                          : currentLanguage.code === 'ar'
                          ? 'تحدث إلى ألترون بأي لغة أو اسأل عن أي معرفة علمية...'
                          : 'Message ULTRON in any language, share feelings, or solve complex problems...'
                      }
                      rows={1}
                      className={`w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none max-h-32 transition-colors ${
                        currentLanguage.dir === 'rtl' ? 'font-arabic text-right' : ''
                      }`}
                    />
                  </div>

                  {/* WhatsApp-Style Voice Note Record Button */}
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoiceNote(true)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors shrink-0"
                    title="Record WhatsApp-Style Voice Note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isSubmitting}
                    className="p-3 rounded-xl bg-gradient-to-r from-rose-600 via-blue-600 to-yellow-500 hover:opacity-95 disabled:opacity-40 text-white font-bold transition-all shadow-lg active:scale-95 shrink-0"
                    title="Send to ULTRON"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Micro-details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                  <span>
                    Ultra-Intelligence Dual Core · All Global Languages Supported
                  </span>
                  <span className="hidden sm:inline">
                    Zero image/video generation limitation strictly enforced
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Calling Modal Ecosystem (Voice & Video Call with Real-Time Lip-Sync) */}
      <CallModal
        isOpen={callModalOpen}
        initialMode={callMode}
        currentVoiceProfile={voiceProfile}
        onVoiceProfileChange={setVoiceProfile}
        onClose={() => setCallModalOpen(false)}
        selectedLanguage={currentLanguage.code}
        openaiApiKey={apiSettings.openaiApiKey}
        preferredEngine={apiSettings.preferredEngine}
        empathyTone={apiSettings.empathyTone}
      />

      {/* OpenAI API Key Settings Modal */}
      <ApiSettingsModal
        isOpen={apiSettingsOpen}
        onClose={() => setApiSettingsOpen(false)}
        settings={apiSettings}
        onSaveSettings={setApiSettings}
      />

      {/* Google Account Authentication Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
      />

      {/* Smart Web Research & Link Finder Drawer */}
      <WebResearchDrawer
        isOpen={researchDrawerOpen}
        onClose={() => setResearchDrawerOpen(false)}
        onInsertToChat={handleInsertResearch}
      />
    </div>
  );
}
