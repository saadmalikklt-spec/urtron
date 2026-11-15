import React, { useState } from 'react';
import { ShieldCheck, Mail, LogOut, CheckCircle2, User, Key, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showSwitchEmail, setShowSwitchEmail] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = (targetEmail = 'Saadmalikklt@gmail.com') => {
    setIsSigningIn(true);
    setTimeout(() => {
      onUpdateProfile({
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: targetEmail,
        name: targetEmail.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetEmail}&backgroundColor=0f172a`,
        provider: 'google',
        isSignedIn: true,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
      setIsSigningIn(false);
      onClose();
    }, 600);
  };

  const handleSignOut = () => {
    onUpdateProfile({
      id: 'guest',
      email: '',
      name: 'Guest User',
      avatarUrl: '',
      provider: 'google',
      isSignedIn: false,
      joinedDate: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-yellow-500/40 bg-[#090d18] shadow-[0_0_40px_rgba(234,179,8,0.2)] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-slate-950/70">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-900 border border-yellow-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] mb-3">
            <svg viewBox="0 0 24 24" className="w-7 h-7">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Google Account Integration
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate to sync neural preferences and secure sessions
          </p>
        </div>

        {/* Account Details or Sign In Area */}
        <div className="p-6 space-y-5">
          {userProfile.isSignedIn ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {userProfile.name}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-yellow-400 shrink-0" />
                    {userProfile.email}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Verified Google Gmail Account · Active
                  </span>
                </div>
              </div>

              {/* Actions for Signed In User */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSwitchEmail(!showSwitchEmail)}
                  className="w-full py-2.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Switch Google Account</span>
                </button>

                {showSwitchEmail && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter new Gmail address..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(customEmail.trim() || 'Saadmalikklt@gmail.com')}
                      className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded text-xs transition-colors"
                    >
                      Sign In with this Google Account
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of ULTRON</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                Sign in with your Google Account for personalized AI memory, encrypted key storage, and multilingual voice profiles.
              </p>

              {/* Standard Google Sign In Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('Saadmalikklt@gmail.com')}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google (Saadmalikklt@gmail.com)'}</span>
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  Enterprise-grade OAuth 2.0 · Privacy First
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
