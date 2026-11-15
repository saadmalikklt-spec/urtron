import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Cpu,
  Zap,
  Lock,
  Heart,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ApiSettings, EngineType, EmpathyTone } from '../types';
import { verifyOpenAiKey } from '../services/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showPlainKey, setShowPlainKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const [selectedEngine, setSelectedEngine] = useState<EngineType>(settings.preferredEngine);
  const [selectedTone, setSelectedTone] = useState<EmpathyTone>(settings.empathyTone);

  if (!isOpen) return null;

  const handleVerifyKey = async () => {
    const keyToTest = apiKeyInput.trim() || settings.openaiApiKey;
    if (!keyToTest) {
      setVerificationResult({
        valid: false,
        message: 'Please paste your OpenAI API key beginning with "sk-".',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyOpenAiKey(keyToTest);
      setVerificationResult({
        valid: res.valid,
        message: res.message,
      });

      if (res.valid) {
        onSaveSettings({
          ...settings,
          openaiApiKey: keyToTest,
          isKeyVerified: true,
          maskedKey: res.maskedKey,
          preferredEngine: selectedEngine,
          empathyTone: selectedTone,
        });
        setApiKeyInput('');
      }
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        message: err.message || 'Key verification failed.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveOnly = () => {
    let keyToSave = settings.openaiApiKey;
    let masked = settings.maskedKey;
    let isVerified = settings.isKeyVerified;

    if (apiKeyInput.trim()) {
      keyToSave = apiKeyInput.trim();
      const prefix = keyToSave.slice(0, 7);
      const suffix = keyToSave.slice(-4);
      masked = `${prefix}...${suffix}`;
      isVerified = true;
    }

    onSaveSettings({
      openaiApiKey: keyToSave,
      isKeyVerified: isVerified,
      maskedKey: masked,
      preferredEngine: selectedEngine,
      empathyTone: selectedTone,
    });
    setApiKeyInput('');
    onClose();
  };

  const handleRemoveKey = () => {
    onSaveSettings({
      ...settings,
      openaiApiKey: '',
      isKeyVerified: false,
      maskedKey: '',
      preferredEngine: 'ultra',
    });
    setSelectedEngine('ultra');
    setApiKeyInput('');
    setVerificationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-blue-500/40 bg-[#090d18] shadow-[0_0_50px_rgba(37,99,235,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Dual-Engine AI Core & API Settings
              </h3>
              <p className="text-xs text-slate-400">
                Encrypted OpenAI ChatGPT integration with ULTRA Core
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Intelligence Engine Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Cognitive Engine Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setSelectedEngine('auto')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEngine === 'auto'
                    ? 'bg-gradient-to-br from-rose-950/50 to-blue-950/50 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Auto Dual-Core
                  </span>
                  {selectedEngine === 'auto' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Combines native ULTRA + ChatGPT with automatic fallback.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('ultra')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEngine === 'ultra'
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> ULTRA Core
                  </span>
                  {selectedEngine === 'ultra' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Native hyper-speed engine powered by Gemini 4 Hydrogen.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEngine('chatgpt')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEngine === 'chatgpt'
                    ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> OpenAI GPT-4o
                  </span>
                  {selectedEngine === 'chatgpt' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Routes queries to your personal OpenAI key.
                </p>
              </button>
            </div>
          </div>

          {/* OpenAI API Key Manager */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                Personal OpenAI API Key (`sk-...`)
              </span>
              {settings.isKeyVerified && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Key Verified & Active
                </span>
              )}
            </div>

            {/* If key already saved: show masked version */}
            {settings.openaiApiKey && !apiKeyInput ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-xs text-slate-300 tracking-wider">
                    {settings.maskedKey || 'sk-proj...••••••••ab12'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 p-1"
                  title="Remove saved key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type={showPlainKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your personal OpenAI API Key (sk-...)"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPlainKey(!showPlainKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  title={showPlainKey ? 'Hide key' : 'Show key'}
                >
                  {showPlainKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Verification result feedback */}
            {verificationResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  verificationResult.valid
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}
              >
                {verificationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{verificationResult.message}</span>
              </div>
            )}

            {/* Test & Verify Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Keys are masked and never logged in plain text.
              </span>
              <button
                type="button"
                onClick={handleVerifyKey}
                disabled={isVerifying || (!apiKeyInput && !settings.openaiApiKey)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isVerifying ? 'Verifying...' : 'Test & Verify Key'}</span>
              </button>
            </div>
          </div>

          {/* Empathy & Emotional Intelligence Tone Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Emotional Intelligence Tuning
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTone('high_empathy')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTone === 'high_empathy'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold flex items-center gap-1.5 mb-0.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Deep Empathy</span>
                </div>
                <p className="text-[10px] text-slate-400">Warm, validating & comforting</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('tactical')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTone === 'tactical'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold flex items-center gap-1.5 mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tactical & Direct</span>
                </div>
                <p className="text-[10px] text-slate-400">Crisp, fast & ultra-precise</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTone('intellectual')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTone === 'intellectual'
                    ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Philosophical</span>
                </div>
                <p className="text-[10px] text-slate-400">Profound logic & cosmic wisdom</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Dual-Core Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 via-blue-600 to-yellow-500 rounded-lg shadow-lg hover:opacity-95 transition-opacity"
            >
              Apply Configurations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
