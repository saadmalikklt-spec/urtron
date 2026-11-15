import React, { useEffect, useRef, useState } from 'react';
import { VoiceProfileId } from '../types';

interface AvatarDisplayProps {
  profile: VoiceProfileId;
  isSpeaking: boolean;
  lipSyncLevel?: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  showHoloEffect?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  profile,
  isSpeaking,
  lipSyncLevel = 0,
  size = 'md',
  showHoloEffect = true,
}) => {
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [mouthOpen, setMouthOpen] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Smooth mouth movement interpolation
  useEffect(() => {
    let target = isSpeaking ? Math.max(0.15, lipSyncLevel) : 0;
    const interval = setInterval(() => {
      setMouthOpen((prev) => prev + (target - prev) * 0.4);
    }, 30);
    return () => clearInterval(interval);
  }, [isSpeaking, lipSyncLevel]);

  // Natural blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle natural gaze wandering
  useEffect(() => {
    const gazeInterval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 2.5;
      setEyeOffset({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }, 2800);

    return () => clearInterval(gazeInterval);
  }, []);

  // Calculate size classes
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-56 h-56',
    lg: 'w-80 h-80',
    fullscreen: 'w-full h-full max-w-[540px] max-h-[540px]',
  }[size];

  // Derived mouth heights
  const currentOpen = Math.min(1, Math.max(0, mouthOpen));
  const mouthHeight = currentOpen * 22;
  const mouthY = 172 + currentOpen * 2;

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses} select-none`}>
      {/* Background Hologram Waves */}
      {showHoloEffect && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-[110%] h-[110%] rounded-full opacity-40 blur-xl transition-all duration-700 ${
              profile === 'ultron'
                ? 'bg-rose-600/30 ring-2 ring-rose-500/30'
                : profile === 'male'
                ? 'bg-blue-600/30 ring-2 ring-blue-500/30'
                : 'bg-gradient-to-r from-rose-500/20 via-blue-500/20 to-yellow-400/20'
            } ${isSpeaking ? 'scale-110 opacity-70 animate-pulse' : 'scale-100'}`}
          />
          {/* Cybernetic Tech Reticle */}
          <div className="absolute inset-[-12px] border border-blue-500/20 rounded-full animate-spin [animation-duration:40s]" />
          <div className="absolute inset-[-4px] border border-dashed border-rose-500/25 rounded-full animate-spin [animation-duration:25s] [animation-direction:reverse]" />
        </div>
      )}

      {/* SVG Avatar Renderer */}
      <svg
        viewBox="0 0 260 260"
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] relative z-10"
        style={{
          transform: isSpeaking ? `scale(${1 + currentOpen * 0.02})` : 'scale(1)',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Female gradients */}
          <radialGradient id="femaleSkin" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffdfd3" />
            <stop offset="65%" stopColor="#f5c2b0" />
            <stop offset="100%" stopColor="#dca492" />
          </radialGradient>
          <linearGradient id="femaleHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="circletGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Male gradients */}
          <radialGradient id="maleSkin" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <linearGradient id="maleCyberArmor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Ultron Robotic gradients */}
          <radialGradient id="ultronMetal" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="45%" stopColor="#1e293b" />
            <stop offset="85%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#e11d48" />
          </radialGradient>
          <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="40%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </radialGradient>
        </defs>

        {/* -------------------- PROFILE 1: FEMALE (ARIA / ATHENA) -------------------- */}
        {profile === 'female' && (
          <g id="female-avatar">
            {/* Hair Back */}
            <path
              d="M60 120 C50 60, 210 60, 200 120 C220 180, 210 230, 195 245 C185 220, 185 180, 180 150 C160 155, 100 155, 80 150 C75 180, 75 220, 65 245 C50 230, 40 180, 60 120 Z"
              fill="url(#femaleHair)"
            />

            {/* Shoulders & Cyber Suit Collar */}
            <path
              d="M50 250 C70 215, 110 205, 130 205 C150 205, 190 215, 210 250 L220 260 L40 260 Z"
              fill="#0f172a"
              stroke="#2563eb"
              strokeWidth="1.5"
            />
            {/* Chest core light */}
            <circle cx="130" cy="235" r="7" fill="#38bdf8" className="animate-pulse" />
            <circle cx="130" cy="235" r="3" fill="#ffffff" />

            {/* Neck */}
            <path d="M112 180 L112 215 C118 220, 142 220, 148 215 L148 180 Z" fill="#dca492" />
            {/* Neck neural line */}
            <line x1="130" y1="185" x2="130" y2="210" stroke="#f43f5e" strokeWidth="1.5" opacity="0.7" />

            {/* Face Head Contour */}
            <path
              d="M80 115 C75 60, 185 60, 180 115 C180 160, 155 195, 130 198 C105 195, 80 160, 80 115 Z"
              fill="url(#femaleSkin)"
              stroke="#f5c2b0"
              strokeWidth="0.5"
            />

            {/* Neural Circlet (Forehead futuristic band) */}
            <path
              d="M78 95 C110 82, 150 82, 182 95"
              fill="none"
              stroke="url(#circletGlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="130" cy="87" r="3.5" fill="#facc15" />

            {/* Hair Front Bangs */}
            <path
              d="M75 105 C95 70, 130 75, 130 92 C145 72, 180 75, 185 108 C175 92, 145 92, 130 105 C115 92, 85 92, 75 105 Z"
              fill="url(#femaleHair)"
            />

            {/* Eyebrows */}
            <path d="M92 114 Q106 108 118 113" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M142 113 Q154 108 168 114" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Left Eye */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              {blink ? (
                <path d="M94 128 Q106 131 116 128" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              ) : (
                <>
                  <ellipse cx="105" cy="128" rx="10" ry="6.5" fill="#ffffff" />
                  <ellipse cx="105" cy="128" rx="5.5" ry="5.5" fill="#2563eb" />
                  <circle cx="105" cy="128" r="3" fill="#0f172a" />
                  <circle cx="103" cy="126" r="1.5" fill="#ffffff" />
                  {/* Cyber reticle in iris */}
                  <circle cx="105" cy="128" r="5" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 1" />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              {blink ? (
                <path d="M144 128 Q154 131 166 128" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              ) : (
                <>
                  <ellipse cx="155" cy="128" rx="10" ry="6.5" fill="#ffffff" />
                  <ellipse cx="155" cy="128" rx="5.5" ry="5.5" fill="#2563eb" />
                  <circle cx="155" cy="128" r="3" fill="#0f172a" />
                  <circle cx="153" cy="126" r="1.5" fill="#ffffff" />
                  <circle cx="155" cy="128" r="5" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 1" />
                </>
              )}
            </g>

            {/* Soft Nose */}
            <path d="M128 140 Q130 152 125 154 Q130 156 135 154" stroke="#c08474" strokeWidth="1.2" fill="none" strokeLinecap="round" />

            {/* Lip-Sync Mouth */}
            <g transform={`translate(0, 0)`}>
              {currentOpen < 0.08 ? (
                // Closed, friendly smile
                <path d="M116 172 Q130 178 144 172" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              ) : (
                // Open speaking mouth reacting to lip-sync
                <g>
                  {/* Mouth cavity */}
                  <path
                    d={`M115 170 Q130 ${170 - currentOpen * 2} 145 170 Q147 ${mouthY + mouthHeight} 130 ${mouthY + mouthHeight + 2} Q113 ${mouthY + mouthHeight} 115 170 Z`}
                    fill="#4c0519"
                  />
                  {/* Upper teeth */}
                  <path
                    d={`M119 171 Q130 171 141 171 L139 ${171 + currentOpen * 4} Q130 ${172 + currentOpen * 4} 121 ${171 + currentOpen * 4} Z`}
                    fill="#f8fafc"
                  />
                  {/* Lower tongue */}
                  <path
                    d={`M123 ${mouthY + mouthHeight - 3} Q130 ${mouthY + mouthHeight - 6} 137 ${mouthY + mouthHeight - 3} Z`}
                    fill="#fb7185"
                  />
                  {/* Lip contour */}
                  <path
                    d={`M115 170 Q130 ${167 - currentOpen * 2} 145 170 Q146 ${mouthY + mouthHeight} 130 ${mouthY + mouthHeight + 2} Q114 ${mouthY + mouthHeight} 115 170 Z`}
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          </g>
        )}

        {/* -------------------- PROFILE 2: MALE (ORION / HYPERION) -------------------- */}
        {profile === 'male' && (
          <g id="male-avatar">
            {/* Futuristic Shoulders & High Collar */}
            <path
              d="M40 255 L65 210 L105 200 L130 205 L155 200 L195 210 L220 255 Z"
              fill="url(#maleCyberArmor)"
              stroke="#0284c7"
              strokeWidth="2"
            />
            {/* Tech chest lines */}
            <line x1="85" y1="215" x2="105" y2="245" stroke="#facc15" strokeWidth="2" />
            <line x1="175" y1="215" x2="155" y2="245" stroke="#facc15" strokeWidth="2" />
            <circle cx="130" cy="225" r="5" fill="#38bdf8" />

            {/* Neck with synthetic musculature */}
            <polygon points="108,175 108,212 152,212 152,175" fill="#475569" />
            <line x1="120" y1="177" x2="120" y2="210" stroke="#0ea5e9" strokeWidth="1.5" />
            <line x1="140" y1="177" x2="140" y2="210" stroke="#0ea5e9" strokeWidth="1.5" />

            {/* Male Jaw & Cybernetic Face structure */}
            <polygon
              points="75,100 80,60 180,60 185,100 178,160 148,198 112,198 82,160"
              fill="url(#maleSkin)"
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* Titanium Jaw Side Accents */}
            <polygon points="76,125 84,120 85,155 78,158" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
            <polygon points="184,125 176,120 175,155 182,158" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />

            {/* Short Cyber Hair */}
            <polygon points="78,70 95,45 130,42 165,45 182,70 170,60 130,55 90,60" fill="#0f172a" stroke="#2563eb" strokeWidth="1" />

            {/* Eyebrows (Strong, sharp angle) */}
            <polygon points="90,108 116,104 118,107 92,111" fill="#1e293b" />
            <polygon points="170,108 144,104 142,107 168,111" fill="#1e293b" />

            {/* Ocular Sensors / Eyes */}
            <g transform={`translate(${eyeOffset.x * 0.8}, ${eyeOffset.y * 0.8})`}>
              {blink ? (
                <>
                  <line x1="93" y1="124" x2="115" y2="124" stroke="#0f172a" strokeWidth="3" />
                  <line x1="145" y1="124" x2="167" y2="124" stroke="#0f172a" strokeWidth="3" />
                </>
              ) : (
                <>
                  {/* Left Cyber Eye */}
                  <polygon points="92,123 103,118 116,123 104,128" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                  <circle cx="104" cy="123" r="4.5" fill="#0284c7" />
                  <circle cx="104" cy="123" r="2" fill="#facc15" />

                  {/* Right Cyber Eye */}
                  <polygon points="144,123 156,118 168,123 156,128" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                  <circle cx="156" cy="123" r="4.5" fill="#0284c7" />
                  <circle cx="156" cy="123" r="2" fill="#facc15" />
                </>
              )}
            </g>

            {/* Ocular Visor Line / Tactical HUD over bridge */}
            <line x1="86" y1="117" x2="174" y2="117" stroke="#38bdf8" strokeWidth="1" opacity="0.6" strokeDasharray="3 2" />

            {/* Sharp Male Nose */}
            <polygon points="130,123 125,148 135,148" fill="#94a3b8" opacity="0.7" />

            {/* Male Articulated Lip-Sync Mouth */}
            <g>
              {currentOpen < 0.08 ? (
                // Confident closed straight mouth with cyber corner dots
                <g>
                  <line x1="115" y1="171" x2="145" y2="171" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="114" cy="171" r="2" fill="#0284c7" />
                  <circle cx="146" cy="171" r="2" fill="#0284c7" />
                </g>
              ) : (
                // Articulated cybernetic jaw mouth opening
                <g>
                  <polygon
                    points={`114,168 146,168 ${144 + currentOpen * 2},${mouthY + mouthHeight} ${116 - currentOpen * 2},${mouthY + mouthHeight}`}
                    fill="#090d16"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  {/* Interior synthesized sound grill */}
                  <line x1="122" y1={168 + mouthHeight * 0.4} x2="138" y2={168 + mouthHeight * 0.4} stroke="#facc15" strokeWidth="2" />
                  {/* Lower jaw plate drop */}
                  <polygon
                    points={`110,${mouthY + mouthHeight + 1} 150,${mouthY + mouthHeight + 1} 142,196 118,196`}
                    fill="#334155"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                </g>
              )}
            </g>
          </g>
        )}

        {/* -------------------- PROFILE 3: ULTRON ROBOTIC PRIME -------------------- */}
        {profile === 'ultron' && (
          <g id="ultron-robotic">
            {/* Massive Armored Robotic Shoulders */}
            <polygon
              points="30,260 55,190 95,195 130,205 165,195 205,190 230,260"
              fill="url(#ultronMetal)"
              stroke="#e11d48"
              strokeWidth="2.5"
            />
            {/* Red & Yellow Reactor Circuit lines */}
            <line x1="60" y1="200" x2="100" y2="245" stroke="#facc15" strokeWidth="2" />
            <line x1="200" y1="200" x2="160" y2="245" stroke="#facc15" strokeWidth="2" />

            {/* Central Chest Arc Reactor */}
            <circle cx="130" cy="235" r="14" fill="#090d16" stroke="#e11d48" strokeWidth="2" />
            <circle cx="130" cy="235" r="9" fill="url(#reactorGlow)" className="animate-pulse" />
            <polygon points="130,228 135,238 125,238" fill="#ffffff" />

            {/* Articulated Metal Neck Piston Columns */}
            <rect x="110" y="170" width="12" height="38" fill="#1e293b" stroke="#e11d48" strokeWidth="1" />
            <rect x="138" y="170" width="12" height="38" fill="#1e293b" stroke="#e11d48" strokeWidth="1" />
            <circle cx="130" cy="188" r="4" fill="#facc15" />

            {/* Iconic Ultron Cranial Helmet & Cheek Horns */}
            <polygon
              points="60,95 75,45 130,35 185,45 200,95 195,145 160,192 100,192 65,145"
              fill="url(#ultronMetal)"
              stroke="#e11d48"
              strokeWidth="2"
            />

            {/* Ultron Ear/Cheek Audio Amplifiers (Ear Horns) */}
            <polygon points="62,110 40,85 55,75 66,95" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
            <polygon points="198,110 220,85 205,75 194,95" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />

            {/* Ocular Crimson Sockets */}
            <polygon points="86,110 115,115 110,128 82,122" fill="#090d16" stroke="#9f1239" strokeWidth="2" />
            <polygon points="174,110 145,115 150,128 178,122" fill="#090d16" stroke="#9f1239" strokeWidth="2" />

            {/* Glowing Ultron Red Slit Eyes */}
            <g>
              <ellipse
                cx="98"
                cy="119"
                rx={blink ? 10 : 8}
                ry={blink ? 1 : 4.5}
                fill="#f43f5e"
                className={isSpeaking ? 'animate-pulse' : ''}
              />
              <ellipse
                cx="162"
                cy="119"
                rx={blink ? 10 : 8}
                ry={blink ? 1 : 4.5}
                fill="#f43f5e"
                className={isSpeaking ? 'animate-pulse' : ''}
              />
              {/* Internal pinpoint reactor core in eye */}
              {!blink && (
                <>
                  <circle cx="98" cy="119" r="2" fill="#fde047" />
                  <circle cx="162" cy="119" r="2" fill="#fde047" />
                </>
              )}
            </g>

            {/* Metallic Brow Plate */}
            <polygon points="95,95 130,105 165,95 130,88" fill="#0f172a" stroke="#e11d48" strokeWidth="1.5" />

            {/* Central Nasal Incline */}
            <line x1="130" y1="108" x2="130" y2="148" stroke="#e11d48" strokeWidth="2" />

            {/* Ultron Robotic Speaker Grill & Lip-Sync Mechanical Jaw */}
            <g>
              {currentOpen < 0.08 ? (
                // Closed menacing Ultron vocal resonator
                <g>
                  <polygon points="105,158 155,158 145,174 115,174" fill="#090d16" stroke="#e11d48" strokeWidth="2" />
                  {/* Glowing red resonance lines */}
                  <line x1="112" y1="163" x2="148" y2="163" stroke="#e11d48" strokeWidth="2" />
                  <line x1="117" y1="168" x2="143" y2="168" stroke="#facc15" strokeWidth="1.5" />
                </g>
              ) : (
                // Expanding mechanical jaw plate with pulsing crimson reactor inside!
                <g>
                  <polygon
                    points={`102,156 158,156 ${154 + currentOpen * 3},${mouthY + mouthHeight + 4} ${106 - currentOpen * 3},${mouthY + mouthHeight + 4}`}
                    fill="#090d16"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                  />
                  {/* Glowing speech synthesis engine core */}
                  <rect
                    x="114"
                    y="158"
                    width="32"
                    height={mouthHeight + 2}
                    fill="url(#reactorGlow)"
                    opacity="0.9"
                    rx="2"
                  />
                  {/* Mechanical vertical grill teeth */}
                  <line x1="120" y1="156" x2="120" y2={mouthY + mouthHeight + 2} stroke="#090d16" strokeWidth="2" />
                  <line x1="126" y1="156" x2="126" y2={mouthY + mouthHeight + 2} stroke="#090d16" strokeWidth="2" />
                  <line x1="134" y1="156" x2="134" y2={mouthY + mouthHeight + 2} stroke="#090d16" strokeWidth="2" />
                  <line x1="140" y1="156" x2="140" y2={mouthY + mouthHeight + 2} stroke="#090d16" strokeWidth="2" />
                </g>
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
