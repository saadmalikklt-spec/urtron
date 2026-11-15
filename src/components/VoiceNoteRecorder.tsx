import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, Send, Radio } from 'lucide-react';
import { speechService } from '../services/speech';

interface VoiceNoteRecorderProps {
  onSendVoiceNote: (audioBlobUrl: string, durationSeconds: number, transcript: string) => void;
  onCancel: () => void;
  language: string;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSendVoiceNote,
  onCancel,
  language,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([4, 8, 14, 20, 10, 6, 12, 18, 8, 5]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Start timer
    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
      // Randomize wave bars for live recording visualizer
      setWaveAmplitudes(Array.from({ length: 14 }, () => Math.floor(Math.random() * 24) + 4));
    }, 1000);

    // Start speech recognition in background to transcribe user voice note
    const recognitionLang =
      language === 'ur'
        ? 'ur-PK'
        : language === 'hi'
        ? 'hi-IN'
        : language === 'ar'
        ? 'ar-SA'
        : language === 'es'
        ? 'es-ES'
        : 'en-US';

    speechService.startListening(
      recognitionLang,
      (text) => {
        setTranscript(text);
      },
      (err) => console.warn('Voice note recognition error:', err)
    );

    // Access audio stream
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
      })
      .catch((err) => {
        console.warn('Microphone stream error for voice note:', err);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechService.stopListening();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [language]);

  const handleFinish = () => {
    speechService.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        onSendVoiceNote(audioUrl, Math.max(1, seconds), transcript || 'Voice Note Recorded');
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback
      onSendVoiceNote('', Math.max(1, seconds), transcript || 'Voice Note Recorded');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-slate-900/95 border border-rose-500/50 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(225,29,72,0.25)] animate-in slide-in-from-bottom-2">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={() => {
          speechService.stopListening();
          onCancel();
        }}
        className="p-2 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-800 transition-colors"
        title="Discard voice note"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Recording Indicator & Timer */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        <span className="text-xs font-mono font-bold text-white tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      {/* Dynamic Sound Waveform Bars */}
      <div className="flex-1 flex items-center justify-center gap-1 h-7 px-2">
        {waveAmplitudes.map((amp, idx) => (
          <div
            key={idx}
            className="w-1 bg-gradient-to-t from-rose-600 via-blue-500 to-yellow-400 rounded-full transition-all duration-150"
            style={{ height: `${amp}px` }}
          />
        ))}
      </div>

      {/* Transcript Peek if any */}
      {transcript && (
        <span className="hidden sm:inline-block max-w-[160px] truncate text-[11px] text-yellow-300 font-mono">
          "{transcript}"
        </span>
      )}

      {/* Send Voice Note Button */}
      <button
        type="button"
        onClick={handleFinish}
        className="p-2.5 bg-gradient-to-r from-rose-600 to-blue-600 hover:opacity-90 text-white rounded-full shadow-lg transition-transform active:scale-95"
        title="Send Voice Note"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};
