import { VoiceProfileId } from '../types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isSpeaking = false;
  private onLipSyncUpdateCallback: ((level: number) => void) | null = null;
  private lipSyncInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // Set callback to receive real-time mouth opening level (0.0 to 1.0)
  public setLipSyncCallback(callback: ((level: number) => void) | null) {
    this.onLipSyncUpdateCallback = callback;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Get available voices
  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  // Speak text with specified profile
  public speak(
    text: string,
    profile: VoiceProfileId,
    lang = 'en-US',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    // Clean markdown and formatting from text for natural speech
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .slice(0, 800); // Speak first natural portion

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = this.synth.getVoices();

    // Select suitable voice
    if (profile === 'female') {
      const femaleVoice = voices.find(
        (v) =>
          (v.lang.startsWith(lang.split('-')[0]) || v.lang.startsWith('en')) &&
          (v.name.includes('Female') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('Victoria') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Karen'))
      ) || voices[0];

      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.15;
      utterance.rate = 1.02;
    } else if (profile === 'male') {
      const maleVoice = voices.find(
        (v) =>
          (v.lang.startsWith(lang.split('-')[0]) || v.lang.startsWith('en')) &&
          (v.name.includes('Male') ||
            v.name.includes('Daniel') ||
            v.name.includes('David') ||
            v.name.includes('Alex') ||
            v.name.includes('Google UK English Male'))
      ) || voices[1] || voices[0];

      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.92;
      utterance.rate = 1.05;
    } else if (profile === 'ultron') {
      // Ultron Robotic Profile: Deep, controlled, mechanical resonance
      const roboticVoice = voices.find(
        (v) =>
          v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Daniel') ||
          v.name.includes('Male')
      ) || voices[0];

      if (roboticVoice) utterance.voice = roboticVoice;
      utterance.pitch = 0.65; // Deep robotic pitch
      utterance.rate = 0.95;  // Deliberate robotic pacing
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
      this.startLipSyncSimulation();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopLipSyncSimulation();
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.stopLipSyncSimulation();
      onEnd?.();
    };

    // Boundary events for phonetic timing if available
    utterance.onboundary = () => {
      if (this.onLipSyncUpdateCallback) {
        const peak = 0.4 + Math.random() * 0.6;
        this.onLipSyncUpdateCallback(peak);
      }
    };

    this.synth.speak(utterance);
  }

  // Dynamic simulation of speech phoneme modulation for 60fps lip-sync
  private startLipSyncSimulation() {
    this.stopLipSyncSimulation();
    let tick = 0;
    this.lipSyncInterval = window.setInterval(() => {
      if (!this.isSpeaking) {
        this.stopLipSyncSimulation();
        return;
      }
      tick++;
      // Natural speech rhythm oscillation
      const baseWave = (Math.sin(tick * 0.6) + 1) / 2;
      const noise = Math.random() * 0.4;
      const mouthLevel = Math.min(1, Math.max(0, baseWave * 0.7 + noise * 0.3));
      this.onLipSyncUpdateCallback?.(mouthLevel);
    }, 60);
  }

  private stopLipSyncSimulation() {
    if (this.lipSyncInterval !== null) {
      clearInterval(this.lipSyncInterval);
      this.lipSyncInterval = null;
    }
    this.onLipSyncUpdateCallback?.(0);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.stopLipSyncSimulation();
  }

  // Web Speech Recognition for voice input
  public startListening(
    lang = 'en-US',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ) {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError(new Error('Speech recognition is not supported in this browser.'));
      return null;
    }

    try {
      this.stopListening();
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text, !!finalTranscript);
        }
      };

      this.recognition.onerror = (e: any) => {
        // Ignore normal aborts
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          onError(e);
        }
      };

      this.recognition.start();
      return this.recognition;
    } catch (err) {
      onError(err);
      return null;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }
}

export const speechService = new SpeechService();
