import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';
import { speechService } from '../services/speech';
import { VoiceProfileId } from '../types';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  duration?: number;
  transcript?: string;
  isModel?: boolean;
  voiceProfile?: VoiceProfileId;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 5,
  transcript,
  isModel = false,
  voiceProfile = 'female',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Stop playback when unmounting
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      speechService.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      speechService.stop();
      setIsPlaying(false);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    } else {
      setIsPlaying(true);

      if (audioUrl) {
        // Play recorded webm audio
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setProgress(100);
          };
          audioRef.current.ontimeupdate = () => {
            if (audioRef.current) {
              const current = audioRef.current.currentTime;
              const total = audioRef.current.duration || duration;
              setProgress((current / total) * 100);
            }
          };
        }
        audioRef.current.play().catch(() => {
          // If browser blocks audio element play, fallback to speech synthesis
          playViaSpeechSynthesis();
        });
      } else {
        playViaSpeechSynthesis();
      }
    }
  };

  const playViaSpeechSynthesis = () => {
    if (!transcript) {
      setIsPlaying(false);
      return;
    }
    setProgress(0);
    const stepInterval = (duration * 1000) / 100;
    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressTimerRef.current!);
          return 100;
        }
        return prev + 2;
      });
    }, stepInterval);

    speechService.speak(
      transcript,
      voiceProfile,
      'en-US',
      () => setIsPlaying(true),
      () => {
        setIsPlaying(false);
        setProgress(100);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      }
    );
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Fixed visual wave bar heights
  const bars = [6, 12, 18, 14, 22, 28, 19, 12, 24, 16, 20, 26, 15, 10, 18, 22, 14, 8, 16, 24, 18, 12];

  return (
    <div
      className={`rounded-2xl p-3 max-w-sm w-full border ${
        isModel
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-blue-950/40 border-blue-500/40 text-blue-100'
      } shadow-md`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Circle Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-lg ${
            isModel
              ? 'bg-gradient-to-r from-rose-600 to-yellow-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice message'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Waveform Scrubber */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-end gap-0.5 h-7">
            {bars.map((height, i) => {
              const barProgress = (i / bars.length) * 100;
              const isPassed = progress >= barProgress;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-colors ${
                    isPassed
                      ? isModel
                        ? 'bg-yellow-400'
                        : 'bg-blue-400'
                      : isModel
                      ? 'bg-slate-700'
                      : 'bg-blue-900/60'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          {/* Time & Transcript Indicator */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Mic className="w-2.5 h-2.5 text-rose-400" />
              <span>Voice Note</span>
            </span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>

      {/* Transcript Peek */}
      {transcript && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300 italic line-clamp-2">
          "{transcript}"
        </div>
      )}
    </div>
  );
};
