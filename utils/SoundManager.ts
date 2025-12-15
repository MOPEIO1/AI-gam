
// A procedural sound synthesizer using Web Audio API
// This avoids the need for external MP3 assets and allows dynamic pitch shifting

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicNodes: AudioNode[] = [];
  private isMusicPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private noteScheduler: number | null = null;
  private currentGenre: 'ethereal' | 'breezy' | 'dreamy' = 'ethereal';

  constructor() {
    // Lazy init on interaction
  }

  async init() {
    if (!this.ctx) {
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.12; // Lower background level for chill vibe
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.4;
            this.sfxGain.connect(this.masterGain);
        } catch (e) {
            console.error("Web Audio API not supported");
        }
    }

    // CRITICAL FIX: Always try to resume if suspended (Browser Autoplay Policy)
    if (this.ctx && this.ctx.state === 'suspended') {
        try {
            await this.ctx.resume();
        } catch (e) {
            console.warn("Could not resume audio context:", e);
        }
    }
  }

  // Helper to ensure context is running before playing any sound
  private async ensureContext() {
    await this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
    }
  }

  // --- BGM ENGINE ---

  setGenreByDate() {
    const day = new Date().getDate();
    // Rotate genres based on day modulo - ALL CHILL NOW
    if (day % 3 === 0) this.currentGenre = 'ethereal'; // Pentatonic Major (Zen)
    else if (day % 3 === 1) this.currentGenre = 'breezy'; // Lydian (Uplifting but soft)
    else this.currentGenre = 'dreamy'; // Mixolydian (Contemplative)
  }

  async startBGM() {
    await this.ensureContext();
    if (this.isMusicPlaying || !this.ctx) return;
    
    this.isMusicPlaying = true;
    this.setGenreByDate();
    this.nextNoteTime = this.ctx.currentTime + 0.5;
    this.scheduleMusic();
  }

  stopBGM() {
    this.isMusicPlaying = false;
    if (this.noteScheduler) {
      window.clearTimeout(this.noteScheduler);
      this.noteScheduler = null;
    }
    this.musicNodes.forEach(node => {
      try { (node as any).stop(); } catch(e){}
      node.disconnect();
    });
    this.musicNodes = [];
  }

  private getScale() {
    // Frequencies - Chill Scales Only
    switch (this.currentGenre) {
      case 'breezy': // Lydian (Major with #4) - Bright but airy
        return [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25]; 
      case 'dreamy': // Mixolydian (Major with b7) - Mellow
        return [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00];
      case 'ethereal': // Major Pentatonic - Pure Zen
      default:
        return [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C
    }
  }

  private scheduleMusic() {
    if (!this.isMusicPlaying || !this.ctx) return;

    // Schedule ahead
    while (this.nextNoteTime < this.ctx.currentTime + 1.0) {
      this.playGenNote(this.nextNoteTime);
      
      // Slower, more ambient rhythm
      let rhythm = Math.random() * 3 + 2; // Very spaced out notes
      
      if (this.currentGenre === 'breezy') {
        rhythm = Math.random() * 2 + 1; // Slightly faster but still calm
      }
      
      this.nextNoteTime += rhythm;
    }

    this.noteScheduler = window.setTimeout(() => this.scheduleMusic(), 1000);
  }

  private playGenNote(time: number) {
    if (!this.ctx || !this.musicGain) return;

    const scale = this.getScale();
    const note = scale[Math.floor(Math.random() * scale.length)];
    
    // Lower octaves for chill vibe
    const octave = Math.random() > 0.7 ? 1 : 0.5;
    const freq = note * octave;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Soft Timbres only
    osc.type = Math.random() > 0.6 ? 'triangle' : 'sine'; // No saw/square (too harsh)

    osc.frequency.value = freq;

    // Long, soft envelope (Pad-like)
    const attack = 0.5 + Math.random();
    const sustain = 2.0 + Math.random() * 2;
    const release = 2.0;
    
    osc.connect(gain);
    gain.connect(this.musicGain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + attack); // Slow fade in
    gain.gain.exponentialRampToValueAtTime(0.001, time + attack + sustain + release); // Long fade out

    osc.start(time);
    osc.stop(time + attack + sustain + release);

    this.musicNodes.push(osc);
    if (this.musicNodes.length > 20) this.musicNodes.shift();
  }

  // --- LABOR SOUNDS (Softer) ---

  async playChop(pitchVar: number = 1) {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(80 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    // Softer wood sound
    gain.gain.setValueAtTime(0.6, t); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  async playMine(pitchVar: number = 1) {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle'; // Less harsh than square
    osc.frequency.setValueAtTime(400 * pitchVar, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  async playGather(pitchVar: number = 1) {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Rustling sound
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800 * pitchVar; // Lower filter for softer rustle

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  // --- UI SOUNDS ---

  async playClick() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, t); // Quieter clicks
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  async playWheelTick() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Very short, high pitched tick (plastic stopper click)
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.02); // Faster decay

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  async playJackpot() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Happy Major Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, t + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.4);
        
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.5);
    });
  }

  async playFusionCharge() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Rising energy sound
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + 2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 2);
  }

  async playFusionSuccess() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Boom
    const boom = this.ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(150, t);
    boom.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    
    const boomGain = this.ctx.createGain();
    boomGain.gain.setValueAtTime(0.5, t);
    boomGain.gain.exponentialRampToValueAtTime(0.01, t + 1);

    boom.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boom.start(t);
    boom.stop(t + 1);

    // Chime
    const chime = this.ctx.createOscillator();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, t); // A5
    
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0, t);
    chimeGain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, t + 2);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(t);
    chime.stop(t + 2);
  }

  async playSuccess() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Major chord arpeggio, soft sine
    [440, 554, 659].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 1.5);
        
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 1.5);
    });
  }

  // --- BREAKTHROUGH ATMOSPHERE ---
  
  async startBreakthroughDrone() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    this.stopDrone(); 

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle'; // Softer drone
    osc.frequency.value = 110; // A2

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);

    (this.musicNodes as any).drone = { osc, gain };
  }

  stopDrone() {
    if ((this.musicNodes as any).drone) {
        const d = (this.musicNodes as any).drone;
        try {
            d.osc.stop();
        } catch(e) {}
        delete (this.musicNodes as any).drone;
    }
  }

  async playBreakthroughBoom() {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Deep gentle boom
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.5);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 2);
  }

  // --- VOICE DECODING ---
  
  async playVoiceData(base64: string, playbackRate: number = 1.0): Promise<number> {
    await this.ensureContext();
    if (!this.ctx || !this.sfxGain) return 0;

    try {
      // Decode Base64 string to raw binary string
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Gemini TTS returns raw PCM 16-bit, 24kHz, Mono (usually)
      const int16Data = new Int16Array(bytes.buffer);
      const sampleRate = 24000;
      const channels = 1;
      const frameCount = int16Data.length;

      const audioBuffer = this.ctx.createBuffer(channels, frameCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        channelData[i] = int16Data[i] / 32768.0;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate; // Apply Speed Adjustment
      source.connect(this.sfxGain);
      source.start(0);

      // Adjust duration based on speed
      return audioBuffer.duration / playbackRate;
    } catch (e) {
      console.error("Error decoding voice data:", e);
      return 0;
    }
  }
}

export const SoundManager = new SoundManagerClass();
