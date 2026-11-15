import React, { useState } from 'react';
import {
  Phone,
  Video,
  Key,
  Globe,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CallMode, UserProfile, SupportedLanguage } from '../types';

interface HeaderProps {
  onOpenCall: (mode: CallMode) => void;
  onOpenApiSettings: () => void;
  onOpenAuth: () => void;
  userProfile: UserProfile;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  supportedLanguages: SupportedLanguage[];
  isApiKeyConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCall,
  onOpenApiSettings,
  onOpenAuth,
  userProfile,
  currentLanguage,
  onSelectLanguage,
  supportedLanguages,
  isApiKeyConfigured,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCallQuickMenu, setShowCallQuickMenu] = useState(false);

  return (
    <header className="relative w-full border-b border-slate-800/80 bg-[#060810]/90 backdrop-blur-xl z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Zone 1: Left Brand & Call Launch Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="text-rose-500">ULT</span>
              <span className="text-blue-500">R</span>
              <span className="text-yellow-400">ON</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-400 hidden sm:inline-block">
              ULTRA CORE
            </span>
          </div>

          {/* Quick Voice / Video Launch Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onOpenCall('voice')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700/60 hover:border-blue-500/50 rounded-lg transition-all active:scale-95 whitespace-nowrap"
              title="Start Voice Call"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Voice Call</span>
            </button>

            <button
              onClick={() => onOpenCall('video')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700/60 hover:border-rose-500/50 rounded-lg transition-all active:scale-95 whitespace-nowrap"
              title="Start Video Call"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Video Call</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Prominently Positioned Glowing Ultron Nexus Logo (Center) */}
        <div className="relative flex items-center justify-center">
          <div className="relative group">
            {/* Pulsing Red-Blue-Yellow Aura Ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-rose-600 via-blue-600 to-yellow-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-pulse-glow" />

            {/* Interactive Nexus Central Button */}
            <button
              onClick={() => setShowCallQuickMenu(!showCallQuickMenu)}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#090d18] border-2 border-rose-500 hover:border-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-all transform hover:scale-105 active:scale-95"
              title="Click ULTRON Nexus to Launch Calling Mode"
            >
              {/* Ultron Nexus Geometric Emblem */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 sm:w-8 sm:h-8">
                {/* Outer Triangle Shield */}
                <polygon
                  points="50,15 85,80 15,80"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                {/* Inner Inverted Triangle */}
                <polygon
                  points="50,75 75,32 25,32"
                  fill="#2563eb"
                  opacity="0.8"
                />
                {/* Central Hyper-Core Light */}
                <circle cx="50" cy="50" r="10" fill="#facc15" className="animate-pulse" />
                <circle cx="50" cy="50" r="4" fill="#ffffff" />
              </svg>
            </button>

            {/* Quick Call Selection Dropdown Modal on Nexus Logo click */}
            {showCallQuickMenu && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 p-3 rounded-xl border border-rose-500/40 bg-[#090d18]/95 backdrop-blur-xl shadow-[0_0_35px_rgba(225,29,72,0.4)] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-center pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white tracking-wide block">
                    ULTRON CALLING ECOSYSTEM
                  </span>
                  <span className="text-[11px] text-slate-400">Choose communication protocol:</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setShowCallQuickMenu(false);
                      onOpenCall('voice');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/90 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/50 text-left transition-colors"
                  >
                    <div className="p-2 rounded-md bg-blue-600/20 text-blue-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Voice Call</div>
                      <div className="text-[10px] text-slate-400">Ultra-fast neural audio with avatar</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowCallQuickMenu(false);
                      onOpenCall('video');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/90 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-left transition-colors"
                  >
                    <div className="p-2 rounded-md bg-rose-600/20 text-rose-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Video Call</div>
                      <div className="text-[10px] text-slate-400">Interactive video & real-time lip-sync</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 3: Right Controls (Language, API Settings, Google Auth Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Universal Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap"
              title="Select Universal Language"
            >
              <Globe className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline font-medium">{currentLanguage.nativeName}</span>
              <span className="sm:hidden font-mono uppercase">{currentLanguage.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Language Menu */}
            {showLangMenu && (
              <div className="absolute right-0 top-11 w-52 py-1.5 bg-[#0b0f19] border border-slate-800 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                  Universal Fluency
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      currentLanguage.code === lang.code
                        ? 'bg-rose-950/50 text-rose-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    <span className="font-arabic text-[11px] text-slate-400">
                      {lang.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OpenAI API Key Settings Button */}
          <button
            onClick={onOpenApiSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all whitespace-nowrap ${
              isApiKeyConfigured
                ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 hover:bg-blue-900/40'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title="OpenAI API Settings & Dual-Engine Core"
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline font-medium">API Core</span>
            {isApiKeyConfigured ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            )}
          </button>

          {/* Google Account Authentication Profile */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-yellow-400/50 transition-all text-xs text-white"
            title="Google Account & Authentication"
          >
            {userProfile.isSignedIn ? (
              <>
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-yellow-400/80"
                />
                <span className="max-w-[90px] sm:max-w-[120px] truncate text-slate-200 font-medium">
                  {userProfile.email.split('@')[0]}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline font-medium text-slate-200">Sign In</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
