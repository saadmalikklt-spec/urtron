import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Sparkles,
  SwitchCamera,
  Bot,
  User,
  MessageSquare,
  Send,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { CallMode, VoiceProfileId, EmpathyTone, EngineType } from '../types';
import { speechService } from '../services/speech';
import { sendChatMessage } from '../services/api';

interface CallModalProps {
  isOpen: boolean;
  initialMode: CallMode;
  currentVoiceProfile: VoiceProfileId;
  onVoiceProfileChange: (profile: VoiceProfileId) => void;
  onClose: () => void;
  selectedLanguage: string;
  openaiApiKey?: string;
  preferredEngine: EngineType;
  empathyTone: EmpathyTone;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  initialMode,
  currentVoiceProfile,
  onVoiceProfileChange,
  onClose,
  selectedLanguage,
  openaiApiKey,
  preferredEngine,
  empathyTone,
}) => {
  const [callMode, setCallMode] = useState<CallMode>(initialMode);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lipSyncLevel, setLipSyncLevel] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [ultronResponse, setUltronResponse] = useState('ULTRON neural link established. I am listening.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInCallChat, setShowInCallChat] = useState(false);
  const [inCallText, setInCallText] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasWaveRef = useRef<HTMLCanvasElement | null>(null);

  // Sync mode
  useEffect(() => {
    setCallMode(initialMode);
  }, [initialMode]);

  // Hook up lip sync callback
  useEffect(() => {
    speechService.setLipSyncCallback((level) => {
      setLipSyncLevel(level);
    });
    return () => {
      speechService.setLipSyncCallback(null);
    };
  }, []);

  // Call duration counter
  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle webcam video stream
  useEffect(() => {
    if (!isOpen) return;

    if (callMode === 'video' && isCameraOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Webcam access failed or denied:', err);
          setCameraError('Webcam preview unavailable. Using cyber-visual filter.');
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, callMode, isCameraOn]);

  // Start continuous speech recognition for call
  useEffect(() => {
    if (!isOpen || isMuted) {
      speechService.stopListening();
      return;
    }

    const recognitionLang =
      selectedLanguage === 'ur'
        ? 'ur-PK'
        : selectedLanguage === 'hi'
        ? 'hi-IN'
        : selectedLanguage === 'ar'
        ? 'ar-SA'
        : selectedLanguage === 'es'
        ? 'es-ES'
        : selectedLanguage === 'fr'
        ? 'fr-FR'
        : selectedLanguage === 'zh'
        ? 'zh-CN'
        : 'en-US';

    speechService.startListening(
      recognitionLang,
      (text, isFinal) => {
        setUserTranscript(text);
        if (isFinal && text.trim().length > 2 && !isProcessing) {
          handleUserVoiceUtterance(text);
        }
      },
      (err) => {
        console.warn('Speech recognition warning:', err);
      }
    );

    return () => {
      speechService.stopListening();
    };
  }, [isOpen, isMuted, selectedLanguage, isProcessing, currentVoiceProfile]);

  // Initial greeting when call connects
  useEffect(() => {
    if (isOpen) {
      const greeting =
        currentVoiceProfile === 'ultron'
          ? 'ULTRON protocol online. Cognitive systems running at 100% efficiency. State your query.'
          : currentVoiceProfile === 'female'
          ? 'Hello! Aria is here with you. How are you feeling today?'
          : 'Orion active. Tactical and analytical subroutines ready. How can I assist you?';

      setUltronResponse(greeting);
      if (!isSpeakerMuted) {
        speakResponse(greeting, currentVoiceProfile);
      }
    } else {
      speechService.stop();
    }
  }, [isOpen]);

  // Audio Waveform animation on canvas in Voice Call mode
  useEffect(() => {
    if (callMode !== 'voice' || !isOpen) return;

    const canvas = canvasWaveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const isTalking = isSpeaking || isProcessing;
      const waveAmplitude = isTalking ? (isSpeaking ? 30 + lipSyncLevel * 25 : 15) : 6;

      // Draw futuristic wave 1 (Red/Pink)
      ctx.beginPath();
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2.5;
      for (let x = 0; x < width; x += 3) {
        const y =
          height / 2 +
          Math.sin(x * 0.02 + phase) * waveAmplitude * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw futuristic wave 2 (Blue)
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 3) {
        const y =
          height / 2 +
          Math.cos(x * 0.025 - phase * 1.2) * (waveAmplitude * 0.8) * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw futuristic wave 3 (Yellow)
      ctx.beginPath();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 3) {
        const y =
          height / 2 +
          Math.sin(x * 0.03 + phase * 0.8) * (waveAmplitude * 0.6) * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [callMode, isOpen, isSpeaking, isProcessing, lipSyncLevel]);

  const speakResponse = (text: string, profile: VoiceProfileId) => {
    if (isSpeakerMuted) return;
    setIsSpeaking(true);
    speechService.speak(
      text,
      profile,
      selectedLanguage === 'ur'
        ? 'ur-PK'
        : selectedLanguage === 'hi'
        ? 'hi-IN'
        : selectedLanguage === 'ar'
        ? 'ar-SA'
        : 'en-US',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleUserVoiceUtterance = async (promptText: string) => {
    if (!promptText.trim() || isProcessing) return;
    setIsProcessing(true);
    speechService.stop();

    try {
      const response = await sendChatMessage({
        prompt: promptText,
        conversationHistory: [],
        engine: preferredEngine,
        openaiApiKey,
        voiceProfile: currentVoiceProfile,
        language: selectedLanguage,
        empathyTone,
      });

      setUltronResponse(response.text);
      setUserTranscript('');
      speakResponse(response.text, currentVoiceProfile);
    } catch (err: any) {
      const errorMsg = 'I encountered a brief signal interference. Please repeat.';
      setUltronResponse(errorMsg);
      speakResponse(errorMsg, currentVoiceProfile);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInCallText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallText.trim() || isProcessing) return;
    const text = inCallText;
    setInCallText('');
    setUserTranscript(text);
    handleUserVoiceUtterance(text);
  };

  // Instant Voice Profile Switcher: transforms audio & morphs avatar on the fly!
  const switchVoiceProfileOnTheFly = (newProfile: VoiceProfileId) => {
    onVoiceProfileChange(newProfile);
    speechService.stop();
    const switchNotice =
      newProfile === 'female'
        ? 'Switched to Aria female voice profile. I am listening warmly.'
        : newProfile === 'male'
        ? 'Switched to Orion tactical male profile. Ready.'
        : 'ULTRON core voice matrix initialized.';
    setUltronResponse(switchNotice);
    speakResponse(switchNotice, newProfile);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl transition-all duration-300">
      {/* Container with Red-Blue-Yellow Elite accents */}
      <div className="relative w-full h-full max-w-6xl max-h-[92vh] mx-auto flex flex-col rounded-2xl border border-rose-500/40 bg-[#070a13] shadow-[0_0_50px_rgba(225,29,72,0.25)] overflow-hidden">
        
        {/* Top Calling Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {/* Glowing Nexus Indicator */}
            <div className="w-8 h-8 rounded-full border border-rose-500 bg-rose-950/50 flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.6)]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-wide text-white">
                  ULTRON NEURAL CALL
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-950/60 border border-blue-500/40 text-blue-400">
                  {callMode === 'video' ? 'HD VIDEO' : 'SECURE AUDIO'}
                </span>
              </div>
              <p className="text-xs text-yellow-400/80 font-mono">
                {formatDuration(callDuration)} · Ultra-Encrypted
              </p>
            </div>
          </div>

          {/* Instant Voice Changer Tabs in Header */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <button
              onClick={() => switchVoiceProfileOnTheFly('female')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentVoiceProfile === 'female'
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-rose-300" />
              <span>Female (Aria)</span>
            </button>

            <button
              onClick={() => switchVoiceProfileOnTheFly('male')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentVoiceProfile === 'male'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-300" />
              <span>Male (Orion)</span>
            </button>

            <button
              onClick={() => switchVoiceProfileOnTheFly('ultron')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentVoiceProfile === 'ultron'
                  ? 'bg-yellow-500 text-slate-950 font-semibold shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ultron Core</span>
            </button>
          </div>

          {/* Mode Switcher Voice / Video */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCallMode(callMode === 'video' ? 'voice' : 'video')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/60 rounded-lg transition-colors"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-yellow-400" />
              <span>Switch to {callMode === 'video' ? 'Voice' : 'Video'}</span>
            </button>
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="relative flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-6 overflow-hidden">
          
          {/* Left / Center: Dynamic Lip-Syncing AI Avatar */}
          <div className="relative flex-1 flex flex-col items-center justify-center w-full h-full">
            <div className="relative flex items-center justify-center max-w-md max-h-[380px] w-full h-full">
              <AvatarDisplay
                profile={currentVoiceProfile}
                isSpeaking={isSpeaking}
                lipSyncLevel={lipSyncLevel}
                size="fullscreen"
                showHoloEffect={true}
              />
            </div>

            {/* Audio Waveform Canvas in Voice Call */}
            {callMode === 'voice' && (
              <div className="w-full max-w-md h-16 mt-2 flex items-center justify-center">
                <canvas
                  ref={canvasWaveRef}
                  width={420}
                  height={60}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Live Subtitles / Neural HUD Readout */}
            <div className="w-full max-w-xl mt-4 px-5 py-3 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 mb-1">
                {isProcessing ? (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Zap className="w-3.5 h-3.5 animate-bounce" />
                    ULTRON Synthesizing Response...
                  </span>
                ) : isSpeaking ? (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Speaking via Neural Synthesizer
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    Listening for voice input...
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-medium text-slate-200 line-clamp-3">
                "{ultronResponse}"
              </p>
              {userTranscript && (
                <p className="text-xs text-yellow-400/90 font-mono mt-1 line-clamp-1">
                  You: "{userTranscript}"
                </p>
              )}
            </div>
          </div>

          {/* Right: Video Stream (In Video Call Mode) or Live Text Drawer */}
          {callMode === 'video' && (
            <div className="relative w-full md:w-80 h-64 md:h-[380px] rounded-2xl border border-blue-500/40 bg-slate-950/90 overflow-hidden flex flex-col shadow-[0_0_25px_rgba(37,99,235,0.2)]">
              {isCameraOn ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror transform -scale-x-100"
                  />
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 text-center text-xs text-slate-300">
                      <ShieldAlert className="w-8 h-8 text-yellow-400 mb-2" />
                      {cameraError}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/60">
                  <VideoOff className="w-10 h-10 mb-2 text-slate-600" />
                  <span className="text-xs">Camera is Off</span>
                </div>
              )}

              {/* HUD Target Overlay on User Camera */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-blue-500/30 text-blue-300">
                USER VIDEO STREAM
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className="p-1.5 rounded-md bg-black/60 text-slate-300 hover:text-white border border-slate-700"
                  title="Toggle Camera"
                >
                  {isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              </div>
            </div>
          )}

          {/* In-Call Text Drawer (Toggleable) */}
          {showInCallChat && (
            <div className="absolute right-6 bottom-24 w-80 h-72 rounded-xl border border-slate-700 bg-slate-950/95 backdrop-blur-xl flex flex-col shadow-2xl z-30">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>In-Call Neural Chat</span>
                <button
                  onClick={() => setShowInCallChat(false)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto text-xs text-slate-300 space-y-2">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-[10px] text-rose-400 font-mono block">ULTRON</span>
                  {ultronResponse}
                </div>
                {userTranscript && (
                  <div className="p-2 rounded bg-blue-950/40 border border-blue-900/50 text-blue-200">
                    <span className="text-[10px] text-blue-400 font-mono block">YOU</span>
                    {userTranscript}
                  </div>
                )}
              </div>
              <form onSubmit={handleSendInCallText} className="p-2 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inCallText}
                  onChange={(e) => setInCallText(e.target.value)}
                  placeholder="Type message while on call..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!inCallText.trim() || isProcessing}
                  className="p-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Control Dock (Elite Red/Blue/Yellow Action Controls) */}
        <div className="px-6 py-5 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-lg flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Speaker Mute Button */}
            <button
              onClick={() => {
                if (!isSpeakerMuted) speechService.stop();
                setIsSpeakerMuted(!isSpeakerMuted);
              }}
              className={`p-3 rounded-full border transition-all ${
                isSpeakerMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* In-call Chat Button */}
            <button
              onClick={() => setShowInCallChat(!showInCallChat)}
              className={`p-3 rounded-full border transition-all ${
                showInCallChat
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Open Chat Drawer"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Action: Microphone & End Call */}
          <div className="flex items-center gap-4">
            {/* Microphone Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full border transition-all ${
                isMuted
                  ? 'bg-rose-950 border-rose-600 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                  : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.6)]'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={() => {
                speechService.stop();
                speechService.stopListening();
                onClose();
              }}
              className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 border border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.7)] transition-transform active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="text-sm">End Call</span>
            </button>
          </div>

          {/* Camera toggle on right */}
          <div className="flex items-center gap-3">
            {callMode === 'video' && (
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`p-3 rounded-full border transition-all ${
                  !isCameraOn
                    ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Toggle Camera"
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
