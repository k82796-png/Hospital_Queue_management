// Web Audio API chime and voice announcement utility

class AudioService {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play pleasant hospital ding-dong notification chime
  public playHospitalChime() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // First chime tone (E5 ~ 659 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Second chime tone (C5 ~ 523 Hz) after 0.25s
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.25);
      gain2.gain.setValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.1);
    } catch {
      // Audio error suppressed safely
    }
  }

  // Speak voice announcement
  public announceToken(tokenId: string, roomNumber?: string, doctorName?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.playHospitalChime();

    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
        // Format token characters with spaces e.g. "G M 1 2 7" for clarity
        const formattedToken = tokenId.split('').join(' ');
        let speechText = `Token ${formattedToken}.`;
        if (roomNumber) {
          speechText += ` Please proceed to Room ${roomNumber}.`;
        }
        if (doctorName) {
          speechText += ` Doctor ${doctorName}.`;
        }

        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.85; // Slightly slower, clear for elderly
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech error suppressed safely
      }
    }, 400);
  }
}

export const audioService = new AudioService();
